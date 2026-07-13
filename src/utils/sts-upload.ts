import COS from "cos-js-sdk-v5";
import { completeStsUpload, initStsUpload } from "@/api/user";

export interface StsUploadedFile {
  fileId: number;
  url: string;
  objectKey?: string;
}

export interface StsUploadOptions {
  bizType?: string;
  courseId?: number;
  onProgress?: (loaded: number, total: number) => void;
}

const pickField = (obj: any, keys: string[]) => {
  if (!obj) return undefined;

  for (const key of keys) {
    if (obj[key] !== undefined && obj[key] !== null && obj[key] !== "") {
      return obj[key];
    }
  }

  return undefined;
};

const callCos = <T>(
  callback: (done: (error: unknown, data?: T) => void) => void
) =>
  new Promise<T>((resolve, reject) => {
    callback((error, data) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(data as T);
    });
  });

/**
 * Upload a file through the same STS protocol used by the course form.
 * The returned file id is the resource id required by the course APIs.
 */
export async function uploadFileWithSts(
  rawFile: File,
  options: StsUploadOptions = {}
): Promise<StsUploadedFile> {
  const initRes = await initStsUpload({
    biz_type: options.bizType || "resource_upload",
    file_name: rawFile.name,
    content_type: rawFile.type || "application/octet-stream",
    file_size: rawFile.size,
    ...(options.courseId ? { course_id: options.courseId } : {})
  });

  const initData: any = initRes?.data || {};
  const uploadToken = pickField(initData, ["upload_token", "uploadToken"]);
  const uploadUrl = pickField(initData, [
    "upload_url",
    "uploadUrl",
    "uploadURL"
  ]);
  const credentials =
    initData.credentials ||
    initData.credential ||
    initData.tmpCredentials ||
    {};
  const tmpSecretId = pickField(credentials, [
    "tmp_secret_id",
    "tmpSecretId",
    "TmpSecretId",
    "secretId",
    "SecretId"
  ]);
  const tmpSecretKey = pickField(credentials, [
    "tmp_secret_key",
    "tmpSecretKey",
    "TmpSecretKey",
    "secretKey",
    "SecretKey"
  ]);
  const securityToken = pickField(credentials, [
    "security_token",
    "securityToken",
    "SecurityToken",
    "session_token",
    "sessionToken",
    "SessionToken",
    "Token"
  ]);
  const bucket =
    pickField(credentials, ["bucket", "Bucket"]) ||
    pickField(initData, ["bucket", "Bucket"]);
  const region =
    pickField(credentials, ["region", "Region"]) ||
    pickField(initData, ["region", "Region"]);

  let uploadDomain: string | undefined;
  if (uploadUrl) {
    try {
      uploadDomain = new URL(uploadUrl).host;
    } catch {
      uploadDomain = undefined;
    }
  }

  let objectKey = pickField(initData, [
    "object_key",
    "objectKey",
    "key",
    "Key"
  ]);
  if (!objectKey && uploadUrl) {
    try {
      objectKey = new URL(uploadUrl).pathname.replace(/^\//, "");
    } catch {
      objectKey = undefined;
    }
  }

  const initSuccess = [0, 200].includes(Number(initRes?.code));
  if (
    !initSuccess ||
    !uploadToken ||
    !objectKey ||
    !tmpSecretId ||
    !tmpSecretKey ||
    !securityToken ||
    !bucket ||
    !region
  ) {
    throw new Error("STS 初始化返回信息不完整");
  }

  const cos = new COS({
    SecretId: tmpSecretId,
    SecretKey: tmpSecretKey,
    SecurityToken: securityToken,
    Protocol: "https:",
    Domain: uploadDomain
  });
  const reportProgress = (loaded: number) => {
    options.onProgress?.(Math.min(loaded, rawFile.size), rawFile.size);
  };

  reportProgress(0);

  const multipartThreshold = 50 * 1024 * 1024;
  if (rawFile.size > multipartThreshold) {
    const partSize = 5 * 1024 * 1024;
    const initMultipartData: any = await callCos(done =>
      cos.multipartInit(
        {
          Bucket: bucket,
          Region: region,
          Key: objectKey,
          ContentType: rawFile.type || "application/octet-stream"
        },
        done
      )
    );
    const uploadId = pickField(initMultipartData, ["UploadId", "uploadId"]);
    if (!uploadId) throw new Error("分片初始化失败：缺少 UploadId");

    const parts: Array<{ PartNumber: number; ETag: string }> = [];
    let uploadedBytes = 0;

    try {
      for (
        let partNumber = 1, start = 0;
        start < rawFile.size;
        partNumber += 1, start += partSize
      ) {
        const chunk = rawFile.slice(
          start,
          Math.min(start + partSize, rawFile.size)
        );
        const uploadPartData: any = await callCos(done =>
          cos.multipartUpload(
            {
              Bucket: bucket,
              Region: region,
              Key: objectKey,
              UploadId: uploadId,
              PartNumber: partNumber,
              Body: chunk,
              ContentLength: chunk.size,
              onProgress: progress => {
                reportProgress(uploadedBytes + (progress?.loaded || 0));
              }
            } as any,
            done
          )
        );
        const etag = pickField(uploadPartData, ["ETag", "etag"]);
        if (!etag) {
          throw new Error(`分片上传失败：缺少 ETag(part ${partNumber})`);
        }

        uploadedBytes += chunk.size;
        reportProgress(uploadedBytes);
        parts.push({ PartNumber: partNumber, ETag: etag });
      }

      await callCos(done =>
        cos.multipartComplete(
          {
            Bucket: bucket,
            Region: region,
            Key: objectKey,
            UploadId: uploadId,
            Parts: parts
          },
          done
        )
      );
    } catch (error) {
      try {
        await callCos(done =>
          cos.multipartAbort(
            {
              Bucket: bucket,
              Region: region,
              Key: objectKey,
              UploadId: uploadId
            },
            done
          )
        );
      } catch {
        // The original upload error is more useful to the caller.
      }
      throw error;
    }
  } else {
    await callCos(done =>
      cos.putObject(
        {
          Bucket: bucket,
          Region: region,
          Key: objectKey,
          Body: rawFile,
          ContentType: rawFile.type || "application/octet-stream",
          onProgress: progress => reportProgress(progress?.loaded || 0)
        } as any,
        done
      )
    );
  }

  reportProgress(rawFile.size);
  const completeRes = await completeStsUpload({ upload_token: uploadToken });
  const completeData: any = completeRes?.data || {};
  const rawFileId = pickField(completeData, ["fileId", "file_id"]);
  const url = pickField(completeData, ["url", "Url"]);
  const fileId = Number(rawFileId);

  if (
    ![0, 200].includes(Number(completeRes?.code)) ||
    !Number.isFinite(fileId) ||
    fileId <= 0 ||
    !url
  ) {
    throw new Error("STS 完成上传失败");
  }

  return {
    fileId,
    url,
    objectKey: completeData.objectKey || completeData.object_key || objectKey
  };
}
