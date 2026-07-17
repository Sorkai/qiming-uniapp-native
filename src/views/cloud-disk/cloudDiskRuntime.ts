export type CloudDiskFileKind =
  | "document"
  | "image"
  | "video"
  | "audio"
  | "archive"
  | "other";

export interface CloudDiskFile {
  id: number;
  name: string;
  extension: string;
  kind: CloudDiskFileKind;
  kindLabel: string;
  sizeBytes: number;
  sizeLabel: string;
  url: string;
}

export interface CloudDiskPage {
  total: number;
  files: CloudDiskFile[];
}

interface UnknownRecord {
  [key: string]: unknown;
}

const documentExtensions = new Set([
  "doc",
  "docx",
  "pdf",
  "ppt",
  "pptx",
  "txt",
  "xls",
  "xlsx"
]);
const imageExtensions = new Set(["bmp", "gif", "jpeg", "jpg", "png", "webp"]);
const videoExtensions = new Set(["avi", "m4v", "mkv", "mov", "mp4", "webm"]);
const audioExtensions = new Set(["aac", "flac", "m4a", "mp3", "ogg", "wav"]);
const archiveExtensions = new Set(["7z", "rar", "tar", "zip"]);

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const asString = (value: unknown) =>
  typeof value === "string" ? value.trim() : "";

const asNumber = (value: unknown) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

const readApiPayload = (response: unknown) => {
  if (!isRecord(response)) {
    throw new Error("文件服务返回了无法识别的数据");
  }

  const code = asNumber(response.code);
  if (code > 0 && code !== 200) {
    throw new Error(asString(response.msg) || "文件服务请求失败");
  }

  return isRecord(response.data) ? response.data : response;
};

export const formatCloudFileSize = (bytes: number) => {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";

  const units = ["B", "KB", "MB", "GB", "TB"];
  const unitIndex = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  );
  const value = bytes / 1024 ** unitIndex;
  const precision = value >= 100 || unitIndex === 0 ? 0 : value >= 10 ? 1 : 2;

  return `${value.toFixed(precision)} ${units[unitIndex]}`;
};

export const resolveCloudFileKind = (
  extension: string,
  resourceType = ""
): CloudDiskFileKind => {
  const normalizedExtension = extension.toLowerCase().replace(/^\./, "");
  const normalizedResourceType = resourceType.toLowerCase();

  if (
    normalizedResourceType.includes("image") ||
    imageExtensions.has(normalizedExtension)
  ) {
    return "image";
  }
  if (
    normalizedResourceType.includes("video") ||
    videoExtensions.has(normalizedExtension)
  ) {
    return "video";
  }
  if (
    normalizedResourceType.includes("audio") ||
    audioExtensions.has(normalizedExtension)
  ) {
    return "audio";
  }
  if (
    normalizedResourceType.includes("zip") ||
    normalizedResourceType.includes("rar") ||
    archiveExtensions.has(normalizedExtension)
  ) {
    return "archive";
  }
  if (
    normalizedResourceType.includes("pdf") ||
    normalizedResourceType.includes("word") ||
    normalizedResourceType.includes("ppt") ||
    normalizedResourceType.includes("excel") ||
    normalizedResourceType.includes("txt") ||
    documentExtensions.has(normalizedExtension)
  ) {
    return "document";
  }
  return "other";
};

const cloudFileKindLabels: Record<CloudDiskFileKind, string> = {
  document: "文档",
  image: "图片",
  video: "视频",
  audio: "音频",
  archive: "压缩包",
  other: "其他"
};

const buildFileName = (baseName: string, extension: string) => {
  const fallbackName = baseName || "未命名文件";
  if (!extension) return fallbackName;
  return fallbackName.toLowerCase().endsWith(`.${extension.toLowerCase()}`)
    ? fallbackName
    : `${fallbackName}.${extension}`;
};

export const normalizeCloudDiskPage = (response: unknown): CloudDiskPage => {
  const payload = readApiPayload(response);
  const rawFiles = Array.isArray(payload.fileList) ? payload.fileList : [];

  const files = rawFiles.flatMap(rawFile => {
    if (!isRecord(rawFile)) return [];

    const id = asNumber(rawFile.fileId);
    if (!Number.isInteger(id) || id <= 0) return [];

    const extension = asString(rawFile.extension).replace(/^\./, "");
    const kind = resolveCloudFileKind(
      extension,
      asString(rawFile.resourceType)
    );
    const sizeBytes = Math.max(0, asNumber(rawFile.size));

    return [
      {
        id,
        name: buildFileName(asString(rawFile.fileName), extension),
        extension,
        kind,
        kindLabel: cloudFileKindLabels[kind],
        sizeBytes,
        sizeLabel: formatCloudFileSize(sizeBytes),
        url: asString(rawFile.fileUrl)
      }
    ];
  });

  return {
    total: Math.max(0, asNumber(payload.total)),
    files
  };
};

export const normalizeCloudDiskUpload = (response: unknown) => {
  const payload = readApiPayload(response);
  const fileId = asNumber(payload.fileId);
  const url = asString(payload.url);

  if (!Number.isInteger(fileId) || fileId <= 0 || !url) {
    throw new Error("上传完成，但后端没有返回有效文件记录");
  }

  return { fileId, url };
};

const normalizeURLBase = (baseUrl: string) => {
  const parsedBase = new URL(baseUrl);
  if (!parsedBase.pathname.endsWith("/")) {
    parsedBase.pathname = `${parsedBase.pathname}/`;
  }
  parsedBase.search = "";
  parsedBase.hash = "";
  return parsedBase.toString();
};

export const resolveCloudDiskFileUrl = (
  rawUrl: string,
  baseUrl?: string
): string | null => {
  const value = rawUrl.trim();
  if (!value) return null;

  try {
    const parsed = baseUrl
      ? new URL(value, normalizeURLBase(baseUrl))
      : new URL(value);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return null;
    }
    return parsed.toString();
  } catch {
    return null;
  }
};

export const getCloudDiskErrorMessage = (error: unknown, fallback: string) => {
  if (isRecord(error)) {
    const response = isRecord(error.response) ? error.response : undefined;
    const responseData =
      response && isRecord(response.data) ? response.data : undefined;
    const apiMessage = responseData ? asString(responseData.msg) : "";
    if (apiMessage) return apiMessage;

    const message = asString(error.message);
    if (message && message !== "Network Error") return message;
  }

  return fallback;
};
