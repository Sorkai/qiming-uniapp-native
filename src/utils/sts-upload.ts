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
  multipartPartSize?: number;
  multipartConcurrency?: number;
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
  cos: COS,
  method: string,
  params: Record<string, unknown>
) =>
  new Promise<T>((resolve, reject) => {
    (cos as any)[method](params, (error: unknown, data: T) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(data);
    });
  });

async function runWithConcurrency<T>(
  items: T[],
  worker: (item: T) => Promise<void>,
  limit: number
) {
  let nextIndex = 0;
  const workers = Array.from(
    { length: Math.min(limit, items.length) },
    async () => {
      while (nextIndex < items.length) {
        const item = items[nextIndex];
        nextIndex += 1;
        await worker(item);
      }
    }
  );

  await Promise.all(workers);
}

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
  const multipartPartSize = options.multipartPartSize || 16 * 1024 * 1024;

  if (rawFile.size <= multipartThreshold) {
    await callCos(cos, "putObject", {
      Bucket: bucket,
      Region: region,
      Key: objectKey,
      Body: rawFile,
      ContentType: rawFile.type || "application/octet-stream",
      onProgress: (progress: { loaded?: number }) =>
        reportProgress(progress?.loaded || 0)
    });
  } else {
    const multipartInitData: any = await callCos(cos, "multipartInit", {
      Bucket: bucket,
      Region: region,
      Key: objectKey,
      ContentType: rawFile.type || "application/octet-stream"
    });
    const uploadId = pickField(multipartInitData, ["UploadId", "uploadId"]);
    if (!uploadId) {
      throw new Error("分片初始化失败：缺少 UploadId");
    }

    const partCount = Math.ceil(rawFile.size / multipartPartSize);
    const partProgress = new Map<number, number>();
    const uploadedParts: Array<{ PartNumber: number; ETag: string }> = [];
    const reportMultipartProgress = () => {
      const uploaded = Array.from(partProgress.values()).reduce(
        (total, value) => total + value,
        0
      );
      reportProgress(uploaded);
    };

    try {
      await runWithConcurrency(
        Array.from({ length: partCount }, (_, index) => index + 1),
        async partNumber => {
          const start = (partNumber - 1) * multipartPartSize;
          const chunk = rawFile.slice(
            start,
            Math.min(start + multipartPartSize, rawFile.size)
          );
          const uploadPartData: any = await callCos(cos, "multipartUpload", {
            Bucket: bucket,
            Region: region,
            Key: objectKey,
            UploadId: uploadId,
            PartNumber: partNumber,
            Body: chunk,
            ContentLength: chunk.size,
            onProgress: (progress: { loaded?: number }) => {
              partProgress.set(
                partNumber,
                Math.min(progress?.loaded || 0, chunk.size)
              );
              reportMultipartProgress();
            }
          });
          const etag = pickField(uploadPartData, ["ETag", "etag"]);
          if (!etag) {
            throw new Error(`分片上传失败：缺少 ETag（第 ${partNumber} 片）`);
          }

          partProgress.set(partNumber, chunk.size);
          reportMultipartProgress();
          uploadedParts.push({ PartNumber: partNumber, ETag: etag });
        },
        options.multipartConcurrency || 2
      );

      await callCos(cos, "multipartComplete", {
        Bucket: bucket,
        Region: region,
        Key: objectKey,
        UploadId: uploadId,
        Parts: uploadedParts.sort(
          (left, right) => left.PartNumber - right.PartNumber
        )
      });
    } catch (error) {
      try {
        await callCos(cos, "multipartAbort", {
          Bucket: bucket,
          Region: region,
          Key: objectKey,
          UploadId: uploadId
        });
      } catch {
        // The next STS upload receives a new object key, so a failed cleanup is non-blocking.
      }

      throw error;
    }
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
