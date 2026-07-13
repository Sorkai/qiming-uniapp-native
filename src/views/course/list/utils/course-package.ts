export interface CoursePackageResource {
  file: File;
  relativePath: string;
  title: string;
  extension: string;
}

export interface CoursePackageHour {
  id: string;
  name: string;
  video: CoursePackageResource;
}

export interface CoursePackageChapter {
  id: string;
  name: string;
  hours: CoursePackageHour[];
}

export interface ParsedCoursePackage {
  id: string;
  folderName: string;
  title: string;
  provider: string;
  shortDesc: string;
  chapters: CoursePackageChapter[];
  attachments: CoursePackageResource[];
  fileCount: number;
  totalBytes: number;
  skippedUnsupportedFileCount: number;
  warnings: string[];
  isValid: boolean;
}

export interface CoursePackageParseResult {
  courses: ParsedCoursePackage[];
  ignoredFileCount: number;
  skippedUnsupportedFileCount: number;
}

interface FileEntry {
  file: File;
  path: string;
  parts: string[];
}

const courseDirectoryLabel = "课程";
// Keep the import contract narrow: MP4 lectures and PDF courseware only.
const videoExtensions = new Set(["mp4"]);
const supportedAttachmentExtensions = new Set(["pdf"]);

export const isSupportedCourseAttachmentExtension = (extension: string) =>
  supportedAttachmentExtensions.has(extension.toLowerCase());

const getRelativePath = (file: File) =>
  (file as File & { webkitRelativePath?: string }).webkitRelativePath ||
  file.name;

const getExtension = (name: string) => {
  const match = /\.([^.]+)$/.exec(name);
  return match?.[1]?.toLowerCase() || "";
};

const stripExtension = (value: string) => value.replace(/\.[^.]+$/, "");

const stripPackagePrefix = (value: string) =>
  value
    .replace(/^\{\d+\}--\s*/, "")
    .replace(/^[\[(]?\d+(?:\.\d+)+[\])]?--\s*/, "")
    .trim();

const isCourseDirectory = (value?: string) =>
  stripPackagePrefix(value || "") === courseDirectoryLabel;

const createResource = (entry: FileEntry): CoursePackageResource => ({
  file: entry.file,
  relativePath: entry.path,
  title: stripPackagePrefix(stripExtension(entry.file.name)),
  extension: getExtension(entry.file.name)
});

const pathStartsWith = (path: string[], prefix: string[]) =>
  prefix.every((part, index) => path[index] === part);

const comparePackageNames = (left: string, right: string) => {
  const leftOrder = Number(
    /^\{(\d+)\}--/.exec(left)?.[1] || Number.MAX_SAFE_INTEGER
  );
  const rightOrder = Number(
    /^\{(\d+)\}--/.exec(right)?.[1] || Number.MAX_SAFE_INTEGER
  );

  if (leftOrder !== rightOrder) return leftOrder - rightOrder;
  return left.localeCompare(right, "zh-CN", { numeric: true });
};

const buildCourseIdentity = (folderName: string) => {
  const divider = folderName.lastIndexOf("_");
  const title = divider > 0 ? folderName.slice(0, divider) : folderName;
  const provider = divider > 0 ? folderName.slice(divider + 1) : "";
  return {
    title: title.trim() || folderName,
    provider: provider.trim()
  };
};

/**
 * Parse the directory layout exported by Chinese University MOOC. The selected
 * files are never read here; their File objects stay available for later upload.
 */
export function parseCoursePackages(
  selectedFiles: File[]
): CoursePackageParseResult {
  const ignoredFiles = selectedFiles.filter(file => {
    const path = getRelativePath(file);
    return /(^|\/)\._/.test(path) || /(^|\/)\.DS_Store$/.test(path);
  });
  const entries = selectedFiles
    .filter(file => !ignoredFiles.includes(file))
    .map(file => {
      const path = getRelativePath(file);
      return {
        file,
        path,
        parts: path.split("/").filter(Boolean)
      };
    })
    .filter(entry => entry.parts.length > 1);

  const roots = new Map<string, string[]>();
  for (const entry of entries) {
    const courseDirectoryIndex = entry.parts.findIndex(isCourseDirectory);
    if (courseDirectoryIndex < 1) continue;

    const rootParts = entry.parts.slice(0, courseDirectoryIndex);
    roots.set(rootParts.join("/"), rootParts);
  }

  const courses = Array.from(roots.entries())
    .map(([rootKey, rootParts]) => {
      const folderName = rootParts[rootParts.length - 1];
      const courseEntries = entries.filter(entry =>
        pathStartsWith(entry.parts, rootParts)
      );
      const courseDirectoryIndex = rootParts.length;
      const chapterEntries = new Map<string, FileEntry[]>();
      const primaryVideos = new Set<string>();

      for (const entry of courseEntries) {
        if (!isCourseDirectory(entry.parts[courseDirectoryIndex])) continue;
        const chapterName = entry.parts[courseDirectoryIndex + 1];
        const hourDirectory = entry.parts[courseDirectoryIndex + 2];
        const extension = getExtension(entry.file.name);

        if (!chapterName || !hourDirectory || !videoExtensions.has(extension)) {
          continue;
        }

        const chapterKey = `${chapterName}\u0000${hourDirectory}`;
        const videos = chapterEntries.get(chapterKey) || [];
        videos.push(entry);
        chapterEntries.set(chapterKey, videos);
        primaryVideos.add(entry.path);
      }

      const chapterMap = new Map<string, CoursePackageChapter>();
      for (const [chapterHourKey, videos] of chapterEntries) {
        const [chapterDirectory, hourDirectory] =
          chapterHourKey.split("\u0000");
        const chapter = chapterMap.get(chapterDirectory) || {
          id: `${rootKey}/${chapterDirectory}`,
          name: stripPackagePrefix(chapterDirectory),
          hours: []
        };

        for (const video of videos.sort((left, right) =>
          comparePackageNames(left.file.name, right.file.name)
        )) {
          chapter.hours.push({
            id: video.path,
            name:
              stripPackagePrefix(stripExtension(video.file.name)) ||
              stripPackagePrefix(hourDirectory),
            video: createResource(video)
          });
        }

        chapterMap.set(chapterDirectory, chapter);
      }

      const chapters = Array.from(chapterMap.entries())
        .sort(([left], [right]) => comparePackageNames(left, right))
        .map(([, chapter]) => ({
          ...chapter,
          hours: chapter.hours.sort((left, right) =>
            comparePackageNames(left.video.file.name, right.video.file.name)
          )
        }));
      const attachmentEntries = courseEntries.filter(
        entry => !primaryVideos.has(entry.path)
      );
      const skippedUnsupportedEntries = attachmentEntries.filter(
        entry =>
          !isSupportedCourseAttachmentExtension(getExtension(entry.file.name))
      );
      const uploadEntries = courseEntries.filter(
        entry =>
          primaryVideos.has(entry.path) ||
          isSupportedCourseAttachmentExtension(getExtension(entry.file.name))
      );
      const attachments = attachmentEntries
        .filter(entry =>
          isSupportedCourseAttachmentExtension(getExtension(entry.file.name))
        )
        .map(createResource)
        .sort((left, right) =>
          left.relativePath.localeCompare(right.relativePath, "zh-CN", {
            numeric: true
          })
        );
      const identity = buildCourseIdentity(folderName);
      const lessonCount = chapters.reduce(
        (total, chapter) => total + chapter.hours.length,
        0
      );
      const warnings: string[] = [];

      if (lessonCount === 0) {
        warnings.push("未在课程目录中找到可导入的视频课时");
      }
      if (attachments.length === 0) {
        warnings.push("未找到课件或字幕等附件资源");
      }
      if (skippedUnsupportedEntries.length) {
        const extensions = Array.from(
          new Set(
            skippedUnsupportedEntries.map(entry =>
              getExtension(entry.file.name)
            )
          )
        )
          .sort()
          .map(extension => `.${extension || "无扩展名"}`)
          .join("、");
        warnings.push(
          `已过滤 ${skippedUnsupportedEntries.length} 个非必要附件（${extensions}）`
        );
      }

      return {
        id: rootKey,
        folderName,
        title: identity.title,
        provider: identity.provider,
        shortDesc: identity.provider
          ? `${identity.provider}课程，根据本地课程包自动导入。`
          : "根据本地课程包自动导入。",
        chapters,
        attachments,
        fileCount: uploadEntries.length,
        totalBytes: uploadEntries.reduce(
          (total, entry) => total + entry.file.size,
          0
        ),
        skippedUnsupportedFileCount: skippedUnsupportedEntries.length,
        warnings,
        isValid: lessonCount > 0
      };
    })
    .sort((left, right) =>
      left.folderName.localeCompare(right.folderName, "zh-CN", {
        numeric: true
      })
    );

  return {
    courses,
    ignoredFileCount: ignoredFiles.length,
    skippedUnsupportedFileCount: courses.reduce(
      (total, course) => total + course.skippedUnsupportedFileCount,
      0
    )
  };
}

export const getResourceType = (extension: string) => {
  return extension === "pdf" ? "document" : "other";
};

export const getVideoDuration = (file: File) =>
  new Promise<number>(resolve => {
    const video = document.createElement("video");
    const objectUrl = URL.createObjectURL(file);
    const cleanup = (duration = 0) => {
      window.clearTimeout(timeout);
      URL.revokeObjectURL(objectUrl);
      video.removeAttribute("src");
      video.load();
      resolve(Number.isFinite(duration) ? Math.round(duration) : 0);
    };
    const timeout = window.setTimeout(() => cleanup(), 12_000);

    video.preload = "metadata";
    video.onloadedmetadata = () => cleanup(video.duration);
    video.onerror = () => cleanup();
    video.src = objectUrl;
  });

const drawCoverText = (
  context: CanvasRenderingContext2D,
  value: string,
  maxWidth: number
) => {
  if (context.measureText(value).width <= maxWidth) return value;

  let output = value;
  while (
    output.length > 1 &&
    context.measureText(`${output}…`).width > maxWidth
  ) {
    output = output.slice(0, -1);
  }
  return `${output}…`;
};

/**
 * The existing STS service consistently accepts standard raster covers. A PNG
 * prevents generated SVG files from being rejected before course upload starts.
 */
export const createCourseCover = (title: string, provider: string) =>
  new Promise<File>((resolve, reject) => {
    const canvas = document.createElement("canvas");
    canvas.width = 1280;
    canvas.height = 720;
    const context = canvas.getContext("2d");

    if (!context) {
      reject(new Error("无法生成课程封面"));
      return;
    }

    context.fillStyle = "#1f4e79";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "rgba(255, 255, 255, 0.1)";
    context.fillRect(72, 72, 1136, 576);
    context.strokeStyle = "rgba(255, 255, 255, 0.32)";
    context.lineWidth = 2;
    context.strokeRect(72, 72, 1136, 576);
    context.beginPath();
    context.moveTo(112, 532);
    context.lineTo(1168, 532);
    context.strokeStyle = "rgba(255, 255, 255, 0.28)";
    context.stroke();

    const fontFamily = "Arial, PingFang SC, Microsoft YaHei, sans-serif";
    context.fillStyle = "#d9ecff";
    context.font = `32px ${fontFamily}`;
    context.fillText("课程包导入", 112, 172);
    context.fillStyle = "#ffffff";
    context.font = `700 72px ${fontFamily}`;
    context.fillText(drawCoverText(context, title || "课程", 1020), 112, 330);
    context.fillStyle = "#d9ecff";
    context.font = `34px ${fontFamily}`;
    context.fillText(
      drawCoverText(context, provider || "本地课程包", 1020),
      112,
      414
    );
    context.fillStyle = "rgba(255, 255, 255, 0.74)";
    context.font = `26px ${fontFamily}`;
    context.fillText("由课程目录自动解析", 112, 588);

    canvas.toBlob(blob => {
      if (!blob) {
        reject(new Error("课程封面生成失败"));
        return;
      }

      const fileName = (title || "course")
        .replace(/[\\/:*?"<>|]/g, "_")
        .slice(0, 80);
      resolve(new File([blob], `${fileName}-cover.png`, { type: "image/png" }));
    }, "image/png");
  });
