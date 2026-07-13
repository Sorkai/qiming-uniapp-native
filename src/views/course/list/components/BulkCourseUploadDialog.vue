<template>
  <input
    ref="directoryInput"
    class="directory-input"
    type="file"
    webkitdirectory
    directory
    multiple
    @change="handleDirectorySelection"
  />

  <el-dialog
    v-model="dialogVisible"
    title="批量上传课程"
    width="min(1000px, calc(100vw - 32px))"
    :close-on-click-modal="!importRunning"
    :close-on-press-escape="!importRunning"
    :show-close="!importRunning"
  >
    <div class="bulk-course-import">
      <el-alert type="info" :closable="false" show-icon>
        <template #title>
          已读取课程目录，将按“课程 / 章节 / 小节 /
          视频与资料”自动创建课程结构。
        </template>
      </el-alert>

      <section class="import-settings" aria-label="导入设置">
        <div class="section-heading">
          <h3>统一设置</h3>
          <p>导入课程将使用以下分类、属性和结束时间。</p>
        </div>
        <el-form label-position="top" class="settings-form">
          <el-form-item label="课程分类" required>
            <el-select
              v-model="settings.categoryId"
              :loading="categoryLoading"
              placeholder="请选择课程分类"
              :disabled="importRunning"
              class="full-width"
            >
              <el-option
                v-for="category in categoryOptions"
                :key="category.categoryId"
                :label="category.name"
                :value="category.categoryId"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="课程属性">
            <el-radio-group
              v-model="settings.isRequired"
              :disabled="importRunning"
            >
              <el-radio :value="1">必修</el-radio>
              <el-radio :value="0">选修</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="结束时间" required>
            <el-date-picker
              v-model="settings.endingTime"
              type="datetime"
              value-format="YYYY-MM-DD HH:mm:ss"
              format="YYYY-MM-DD HH:mm"
              :clearable="false"
              :disabled="importRunning"
              class="full-width"
            />
          </el-form-item>
        </el-form>
      </section>

      <section v-if="courses.length" class="parsed-courses" aria-live="polite">
        <div class="parsed-courses__heading">
          <div>
            <h3>解析结果</h3>
            <p>
              共 {{ courses.length }} 门课程，{{ chapterCount }} 个章节，{{
                lessonCount
              }}
              个视频课时，{{ attachmentCount }} 份附件
              <span v-if="ignoredFileCount"
                >，已忽略 {{ ignoredFileCount }} 个系统文件</span
              >
            </p>
          </div>
          <div class="parsed-courses__actions">
            <el-button :disabled="importRunning" @click="openFolderPicker">
              重新选择
            </el-button>
            <el-button
              :icon="CircleCheck"
              :disabled="importRunning || !importableCourses.length"
              @click="validateAllCourses()"
            >
              校验结构
            </el-button>
          </div>
        </div>

        <el-progress
          v-if="importRunning || importFinished"
          :percentage="overallProgress"
          :status="
            importFailureCount > 0
              ? 'exception'
              : importFinished
                ? 'success'
                : undefined
          "
          :stroke-width="8"
          class="overall-progress"
        >
          <span>{{ progressLabel }}</span>
        </el-progress>

        <el-table
          :data="courses"
          max-height="360"
          :row-class-name="getRowClassName"
          class="course-preview-table"
        >
          <el-table-column label="课程名称" min-width="215">
            <template #default="{ row }">
              <el-input
                v-model="row.title"
                :disabled="importRunning"
                maxlength="80"
                show-word-limit
                @update:model-value="markCourseForValidation(row)"
              />
              <span v-if="row.provider" class="course-provider">{{
                row.provider
              }}</span>
            </template>
          </el-table-column>
          <el-table-column label="结构" width="142">
            <template #default="{ row }">
              <div class="structure-count">
                <span
                  ><el-icon><Collection /></el-icon
                  >{{ row.chapters.length }} 章节</span
                >
                <span
                  ><el-icon><VideoCamera /></el-icon
                  >{{ getLessonCount(row) }} 课时</span
                >
              </div>
            </template>
          </el-table-column>
          <el-table-column label="资源" width="130">
            <template #default="{ row }">
              <span class="resource-count">
                <el-icon><Document /></el-icon>
                {{ row.attachments.length }} 份资料
              </span>
              <span class="resource-size">{{
                formatBytes(row.totalBytes)
              }}</span>
            </template>
          </el-table-column>
          <el-table-column label="状态" min-width="210">
            <template #default="{ row }">
              <div
                v-if="
                  row.importStatus === 'ready' &&
                  row.validationStatus === 'invalid'
                "
                class="course-warning"
              >
                <el-tooltip
                  :content="row.validationErrors.join('；')"
                  placement="top"
                >
                  <el-icon><WarningFilled /></el-icon>
                </el-tooltip>
                <span>校验未通过</span>
              </div>
              <el-tag
                v-else-if="
                  row.importStatus === 'ready' &&
                  row.validationStatus === 'valid'
                "
                type="success"
                size="small"
              >
                已校验
              </el-tag>
              <div
                v-else-if="row.warnings.length && row.importStatus === 'ready'"
                class="course-warning"
              >
                <el-tooltip :content="row.warnings.join('；')" placement="top">
                  <el-icon><WarningFilled /></el-icon>
                </el-tooltip>
                <span>{{ row.isValid ? "待校验，含提示" : "无法导入" }}</span>
              </div>
              <el-progress
                v-else-if="row.importStatus === 'uploading'"
                :percentage="row.importProgress"
                :show-text="false"
                :stroke-width="6"
              />
              <el-tag
                v-else
                :type="getStatusType(row.importStatus)"
                size="small"
              >
                {{ getStatusText(row) }}
              </el-tag>
              <span v-if="row.importMessage" class="status-message">{{
                row.importMessage
              }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="88" fixed="right">
            <template #default="{ row }">
              <el-button
                link
                type="primary"
                :icon="EditPen"
                :disabled="importRunning"
                @click="openCourseEditor(row)"
              >
                校对
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </section>

      <el-empty
        v-else
        description="未识别到符合格式的课程目录"
        :image-size="110"
      />
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button :disabled="importRunning" @click="dialogVisible = false"
          >取消</el-button
        >
        <el-button
          type="primary"
          :icon="UploadFilled"
          :loading="importRunning"
          :disabled="!canImport"
          @click="startImport"
        >
          {{
            importRunning
              ? "正在上传"
              : `校验通过后上传 ${importableCourses.length} 门课程`
          }}
        </el-button>
      </div>
    </template>
  </el-dialog>

  <el-dialog
    v-model="editorVisible"
    title="校对课程结构"
    width="min(760px, calc(100vw - 32px))"
    append-to-body
    :close-on-click-modal="false"
  >
    <el-form v-if="editorDraft.courseId" label-position="top">
      <el-form-item label="课程名称" required>
        <el-input v-model="editorDraft.title" maxlength="80" show-word-limit />
      </el-form-item>
      <el-form-item label="课程简介" required>
        <el-input
          v-model="editorDraft.shortDesc"
          type="textarea"
          :rows="3"
          maxlength="240"
          show-word-limit
        />
      </el-form-item>
      <div class="course-structure-editor">
        <div class="section-heading">
          <div>
            <h3>章节与课时</h3>
            <p>可修改自动解析出的章节和课时名称，保存后需重新校验。</p>
          </div>
        </div>
        <div
          v-for="(chapter, chapterIndex) in editorDraft.chapters"
          :key="chapter.id"
          class="chapter-editor"
        >
          <el-form-item :label="`章节 ${chapterIndex + 1}`" required>
            <el-input v-model="chapter.name" maxlength="120" />
          </el-form-item>
          <div class="lesson-editor-list">
            <el-form-item
              v-for="(hour, hourIndex) in chapter.hours"
              :key="hour.id"
              :label="`课时 ${chapterIndex + 1}.${hourIndex + 1}`"
              required
            >
              <el-input v-model="hour.name" maxlength="160" />
            </el-form-item>
          </div>
        </div>
      </div>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="editorVisible = false">取消</el-button>
        <el-button type="primary" @click="saveCourseEditor"
          >保存并重新校验</el-button
        >
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import { ElMessage } from "element-plus";
import {
  CircleCheck,
  Collection,
  Document,
  EditPen,
  UploadFilled,
  VideoCamera,
  WarningFilled
} from "@element-plus/icons-vue";
import { createCourse } from "@/api/course";
import type { CourseCreateParams } from "@/api/course";
import { getCategoryList } from "@/api/category";
import { uploadFileWithSts } from "@/utils/sts-upload";
import {
  createCourseCover,
  getResourceType,
  getVideoDuration,
  parseCoursePackages
} from "../utils/course-package";
import type {
  CoursePackageResource,
  ParsedCoursePackage
} from "../utils/course-package";

type ImportStatus = "ready" | "uploading" | "success" | "failed";
type ValidationStatus = "pending" | "valid" | "invalid";

interface ImportableCourse extends ParsedCoursePackage {
  importStatus: ImportStatus;
  importProgress: number;
  importMessage: string;
  validationStatus: ValidationStatus;
  validationErrors: string[];
}

interface CourseEditorDraft {
  courseId: string;
  title: string;
  shortDesc: string;
  chapters: Array<{
    id: string;
    name: string;
    hours: Array<{ id: string; name: string }>;
  }>;
}

interface UploadAsset {
  id: string;
  file: File;
  kind: "cover" | "video" | "attachment";
  resource?: CoursePackageResource;
}

interface CourseImportJob {
  course: ImportableCourse;
  assets: UploadAsset[];
}

const emit = defineEmits<{
  completed: [result: { success: number; failed: number }];
}>();

const directoryInput = ref<HTMLInputElement>();
const dialogVisible = ref(false);
const importRunning = ref(false);
const importFinished = ref(false);
const ignoredFileCount = ref(0);
const courses = ref<ImportableCourse[]>([]);
const categoryLoading = ref(false);
const categoryOptions = ref<Array<{ categoryId: number; name: string }>>([]);
const uploadedBytes = ref(0);
const totalUploadBytes = ref(0);
const importFailureCount = ref(0);
const importSuccessCount = ref(0);
const editorVisible = ref(false);
const settings = reactive({
  categoryId: undefined as number | undefined,
  isRequired: 1,
  endingTime: getDefaultEndingTime()
});
const editorDraft = reactive<CourseEditorDraft>({
  courseId: "",
  title: "",
  shortDesc: "",
  chapters: []
});

const chapterCount = computed(() =>
  courses.value.reduce((total, course) => total + course.chapters.length, 0)
);
const lessonCount = computed(() =>
  courses.value.reduce((total, course) => total + getLessonCount(course), 0)
);
const attachmentCount = computed(() =>
  courses.value.reduce((total, course) => total + course.attachments.length, 0)
);
const importableCourses = computed(() =>
  courses.value.filter(course => course.isValid)
);
const canImport = computed(
  () =>
    !importRunning.value &&
    !importFinished.value &&
    Boolean(settings.categoryId) &&
    Boolean(settings.endingTime) &&
    importableCourses.value.length > 0 &&
    importableCourses.value.every(course => course.validationStatus === "valid")
);
const overallProgress = computed(() => {
  if (!totalUploadBytes.value) return importFinished.value ? 100 : 0;
  return Math.min(
    100,
    Math.round((uploadedBytes.value / totalUploadBytes.value) * 100)
  );
});
const progressLabel = computed(() => {
  if (importRunning.value) {
    return `已上传 ${formatBytes(uploadedBytes.value)} / ${formatBytes(totalUploadBytes.value)}`;
  }
  return `已完成 ${importSuccessCount.value} 门，失败 ${importFailureCount.value} 门`;
});

function getDefaultEndingTime() {
  const date = new Date();
  date.setFullYear(date.getFullYear() + 1);
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} 23:59:59`;
}

function formatBytes(bytes: number) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const index = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  );
  return `${(bytes / 1024 ** index).toFixed(index ? 1 : 0)} ${units[index]}`;
}

function getLessonCount(course: ParsedCoursePackage) {
  return course.chapters.reduce(
    (total, chapter) => total + chapter.hours.length,
    0
  );
}

function getStatusType(status: ImportStatus) {
  if (status === "success") return "success";
  if (status === "failed") return "danger";
  return "info";
}

function getStatusText(course: ImportableCourse) {
  if (course.importStatus === "success") return "已创建";
  if (course.importStatus === "failed") return "导入失败";
  return "待上传";
}

function getRowClassName({ row }: { row: ImportableCourse }) {
  if (!row.isValid || row.validationStatus === "invalid") {
    return "is-invalid";
  }
  return "";
}

async function loadCategories() {
  if (categoryOptions.value.length || categoryLoading.value) return;

  categoryLoading.value = true;
  try {
    const response = await getCategoryList({ pageNum: 1, pageSize: 100 });
    categoryOptions.value = response?.data?.categoryList || [];
    if (!categoryOptions.value.length) {
      ElMessage.warning("请先创建课程分类，再进行批量上传");
    }
  } catch (error) {
    console.error("获取课程分类失败:", error);
    ElMessage.error("获取课程分类失败");
  } finally {
    categoryLoading.value = false;
  }
}

function openFolderPicker() {
  if (importRunning.value) return;
  directoryInput.value?.click();
}

function handleDirectorySelection(event: Event) {
  const input = event.target as HTMLInputElement;
  const files = Array.from(input.files || []);
  input.value = "";
  if (!files.length) return;

  const result = parseCoursePackages(files);
  ignoredFileCount.value = result.ignoredFileCount;
  courses.value = result.courses.map(course => ({
    ...course,
    importStatus: "ready",
    importProgress: 0,
    importMessage: "",
    validationStatus: "pending",
    validationErrors: []
  }));
  importFinished.value = false;
  importFailureCount.value = 0;
  importSuccessCount.value = 0;
  uploadedBytes.value = 0;
  totalUploadBytes.value = 0;
  dialogVisible.value = true;
  void loadCategories();

  if (!courses.value.length) {
    ElMessage.warning("未找到包含课程目录的课程包");
  }
}

function markCourseForValidation(course: ImportableCourse) {
  if (course.importStatus !== "ready") return;
  course.validationStatus = "pending";
  course.validationErrors = [];
}

function validateCourse(course: ImportableCourse) {
  const errors: string[] = [];

  if (!course.title.trim()) errors.push("课程名称不能为空");
  if (!course.shortDesc.trim()) errors.push("课程简介不能为空");
  if (!course.isValid || !course.chapters.length) {
    errors.push("至少需要一个包含视频课时的章节");
  }

  course.chapters.forEach((chapter, chapterIndex) => {
    if (!chapter.name.trim()) {
      errors.push(`第 ${chapterIndex + 1} 个章节名称不能为空`);
    }
    if (!chapter.hours.length) {
      errors.push(`第 ${chapterIndex + 1} 个章节没有视频课时`);
    }
    chapter.hours.forEach((hour, hourIndex) => {
      if (!hour.name.trim()) {
        errors.push(
          `第 ${chapterIndex + 1}.${hourIndex + 1} 个课时名称不能为空`
        );
      }
    });
  });

  course.validationErrors = errors;
  course.validationStatus = errors.length ? "invalid" : "valid";
  return !errors.length;
}

function validateAllCourses(showSuccess = true) {
  const candidates = importableCourses.value;
  const invalidCourses = candidates.filter(course => !validateCourse(course));

  if (invalidCourses.length) {
    if (showSuccess) {
      ElMessage.error(`有 ${invalidCourses.length} 门课程未通过结构校验`);
    }
    return false;
  }

  if (showSuccess) {
    ElMessage.success(`已校验 ${candidates.length} 门课程，可开始上传`);
  }
  return candidates.length > 0;
}

function openCourseEditor(course: ImportableCourse) {
  Object.assign(editorDraft, {
    courseId: course.id,
    title: course.title,
    shortDesc: course.shortDesc,
    chapters: course.chapters.map(chapter => ({
      id: chapter.id,
      name: chapter.name,
      hours: chapter.hours.map(hour => ({ id: hour.id, name: hour.name }))
    }))
  });
  editorVisible.value = true;
}

function saveCourseEditor() {
  const course = courses.value.find(item => item.id === editorDraft.courseId);
  if (!course) return;

  course.title = editorDraft.title;
  course.shortDesc = editorDraft.shortDesc;
  course.chapters.forEach(chapter => {
    const draftChapter = editorDraft.chapters.find(
      item => item.id === chapter.id
    );
    if (!draftChapter) return;

    chapter.name = draftChapter.name;
    chapter.hours.forEach(hour => {
      const draftHour = draftChapter.hours.find(item => item.id === hour.id);
      if (draftHour) hour.name = draftHour.name;
    });
  });
  markCourseForValidation(course);
  editorVisible.value = false;
  validateCourse(course);
  if (course.validationStatus === "valid") {
    ElMessage.success("课程结构校验通过");
  } else {
    ElMessage.error("课程结构仍有待修正项");
  }
}

function getImportErrorMessage(error: unknown) {
  const response = (
    error as {
      response?: {
        status?: number;
        data?: { msg?: unknown; message?: unknown };
      };
    }
  )?.response;
  const serverMessage = response?.data?.msg || response?.data?.message;

  if (typeof serverMessage === "string" && serverMessage.trim()) {
    return serverMessage.trim();
  }
  if (response?.status) return `服务返回 ${response.status}`;
  if (error instanceof Error) return error.message;
  return "未知错误";
}

function getAssetLabel(asset: UploadAsset) {
  if (asset.kind === "cover") return "课程封面";
  if (asset.kind === "video") {
    return `课时视频“${asset.resource?.title || asset.file.name}”`;
  }
  return `附件“${asset.resource?.title || asset.file.name}”`;
}

async function buildImportJobs(): Promise<CourseImportJob[]> {
  return Promise.all(
    importableCourses.value.map(async course => {
      const cover = await createCourseCover(
        course.title.trim(),
        course.provider
      );
      const videoAssets: UploadAsset[] = course.chapters.flatMap(chapter =>
        chapter.hours.map(hour => ({
          id: `video:${hour.id}`,
          file: hour.video.file,
          kind: "video" as const,
          resource: hour.video
        }))
      );
      const attachmentAssets: UploadAsset[] = course.attachments.map(
        resource => ({
          id: `attachment:${resource.relativePath}`,
          file: resource.file,
          kind: "attachment" as const,
          resource
        })
      );

      return {
        course,
        assets: [
          { id: "cover", file: cover, kind: "cover" },
          ...videoAssets,
          ...attachmentAssets
        ]
      };
    })
  );
}

async function runWithConcurrency<T>(
  items: T[],
  worker: (item: T) => Promise<void>,
  limit = 3
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

async function uploadCourse(
  job: CourseImportJob,
  progressByAsset: Map<string, number>
) {
  const uploadedAssets = new Map<string, { fileId: number; url: string }>();
  const courseUploadedBytes = new Map<string, number>();
  const courseBytes = job.assets.reduce(
    (total, asset) => total + asset.file.size,
    0
  );
  const videoDurations = new Map<string, number>();

  for (const chapter of job.course.chapters) {
    for (const hour of chapter.hours) {
      videoDurations.set(hour.id, await getVideoDuration(hour.video.file));
    }
  }

  const uploadAsset = async (asset: UploadAsset) => {
    const assetProgressId = `${job.course.id}:${asset.id}`;
    try {
      const result = await uploadFileWithSts(asset.file, {
        onProgress: loaded => {
          const previous = progressByAsset.get(assetProgressId) || 0;
          const delta = Math.max(loaded - previous, 0);
          progressByAsset.set(assetProgressId, loaded);
          uploadedBytes.value += delta;

          const courseUploaded =
            (courseUploadedBytes.get(job.course.id) || 0) + delta;
          courseUploadedBytes.set(job.course.id, courseUploaded);
          job.course.importProgress = Math.min(
            99,
            Math.round((courseUploaded / courseBytes) * 100)
          );
        }
      });
      uploadedAssets.set(asset.id, result);
    } catch (error) {
      throw new Error(
        `${getAssetLabel(asset)}上传失败：${getImportErrorMessage(error)}`
      );
    }
  };

  const coverAsset = job.assets.find(asset => asset.kind === "cover");
  if (!coverAsset) throw new Error("未生成课程封面");

  // Upload the cover first. A rejected cover must not leave a large batch of orphaned resources.
  await uploadAsset(coverAsset);
  await runWithConcurrency(
    job.assets.filter(asset => asset.kind !== "cover"),
    uploadAsset
  );

  const cover = uploadedAssets.get("cover");
  if (!cover) throw new Error("课程封面上传失败");

  const chapterList = job.course.chapters.map(chapter => ({
    name: chapter.name,
    hourList: chapter.hours.map(hour => {
      const uploaded = uploadedAssets.get(`video:${hour.id}`);
      if (!uploaded) throw new Error(`课时资源上传失败：${hour.name}`);

      return {
        resourceId: uploaded.fileId,
        duration: videoDurations.get(hour.id) || 0,
        title: hour.name,
        rType: "video",
        fileUrl: uploaded.url
      };
    })
  }));
  const attrList = job.course.attachments.map(resource => {
    const uploaded = uploadedAssets.get(`attachment:${resource.relativePath}`);
    if (!uploaded) throw new Error(`附件上传失败：${resource.title}`);

    return {
      resourceId: uploaded.fileId,
      title: resource.title,
      rType: getResourceType(resource.extension),
      fileUrl: uploaded.url
    };
  });
  const payload: CourseCreateParams = {
    title: job.course.title.trim(),
    thumb_url: cover.url,
    shortDesc: job.course.shortDesc,
    isRequired: settings.isRequired,
    categoryIds: [Number(settings.categoryId)],
    isChapter: 1,
    endingTime: settings.endingTime,
    chapterList,
    attrList
  };
  let response;
  try {
    response = await createCourse(payload);
  } catch (error) {
    throw new Error(`创建课程失败：${getImportErrorMessage(error)}`);
  }

  if (![0, 200].includes(Number(response?.code))) {
    throw new Error(response?.msg || "课程创建失败");
  }
}

async function startImport() {
  if (!settings.categoryId) {
    ElMessage.warning("请选择课程分类");
    return;
  }
  if (!settings.endingTime) {
    ElMessage.warning("请选择课程结束时间");
    return;
  }
  if (!validateAllCourses(false)) {
    ElMessage.error("请先修正未通过校验的课程结构");
    return;
  }

  let jobs: CourseImportJob[];
  try {
    jobs = await buildImportJobs();
  } catch (error) {
    ElMessage.error(`生成课程封面失败：${getImportErrorMessage(error)}`);
    return;
  }
  if (!jobs.length) return;

  importRunning.value = true;
  importFinished.value = false;
  importSuccessCount.value = 0;
  importFailureCount.value = 0;
  uploadedBytes.value = 0;
  totalUploadBytes.value = jobs.reduce(
    (total, job) =>
      total + job.assets.reduce((sum, asset) => sum + asset.file.size, 0),
    0
  );
  const progressByAsset = new Map<string, number>();

  for (const job of jobs) {
    job.course.importStatus = "uploading";
    job.course.importProgress = 0;
    job.course.importMessage = "";

    try {
      await uploadCourse(job, progressByAsset);
      job.course.importStatus = "success";
      job.course.importProgress = 100;
      job.course.importMessage = "课程、章节与资源已创建";
      importSuccessCount.value += 1;
    } catch (error) {
      console.error(`批量导入课程失败：${job.course.title}`, error);
      job.course.importStatus = "failed";
      job.course.importMessage =
        error instanceof Error ? error.message : "上传失败";
      importFailureCount.value += 1;
    }
  }

  importRunning.value = false;
  importFinished.value = true;
  emit("completed", {
    success: importSuccessCount.value,
    failed: importFailureCount.value
  });
  if (importFailureCount.value) {
    ElMessage.warning(
      `批量上传完成：成功 ${importSuccessCount.value} 门，失败 ${importFailureCount.value} 门`
    );
  } else {
    ElMessage.success(`已成功上传 ${importSuccessCount.value} 门课程`);
  }
}

defineExpose({ openFolderPicker });
</script>

<style lang="scss" scoped>
.directory-input {
  display: none;
}

.bulk-course-import {
  display: grid;
  gap: 24px;
}

.import-settings {
  padding: 18px 20px 4px;
  background: var(--el-fill-color-light);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
}

.section-heading,
.parsed-courses__heading {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  justify-content: space-between;

  h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  p {
    margin: 6px 0 0;
    font-size: 13px;
    line-height: 1.55;
    color: var(--el-text-color-secondary);
  }
}

.settings-form {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0 16px;
  margin-top: 18px;
}

.full-width {
  width: 100%;
}

.parsed-courses {
  display: grid;
  gap: 14px;
}

.parsed-courses__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: flex-end;
}

.overall-progress {
  :deep(.el-progress__text) {
    min-width: 200px;
    font-size: 12px;
    text-align: right;
  }
}

.course-preview-table {
  :deep(.is-invalid) {
    --el-table-tr-bg-color: var(--el-color-danger-light-9);
  }
}

.course-provider,
.resource-size,
.status-message {
  display: block;
  margin-top: 5px;
  font-size: 12px;
  line-height: 1.4;
  color: var(--el-text-color-secondary);
}

.structure-count,
.resource-count,
.course-warning {
  display: grid;
  gap: 6px;
  font-size: 13px;
  color: var(--el-text-color-regular);

  span,
  & {
    align-items: center;
  }

  .el-icon {
    margin-right: 5px;
    color: var(--el-color-primary);
    vertical-align: -2px;
  }
}

.course-structure-editor {
  display: grid;
  gap: 16px;
  margin-top: 8px;
}

.chapter-editor {
  padding-top: 16px;
  border-top: 1px solid var(--el-border-color-lighter);
}

.lesson-editor-list {
  display: grid;
  gap: 2px;
  padding-left: 16px;
}

.course-warning {
  display: flex;
  color: var(--el-color-warning-dark-2);

  .el-icon {
    color: var(--el-color-warning);
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 720px) {
  .settings-form {
    grid-template-columns: 1fr;
  }

  .parsed-courses__heading {
    align-items: flex-end;
  }

  .parsed-courses__actions {
    justify-content: flex-start;
  }

  .lesson-editor-list {
    padding-left: 0;
  }

  .overall-progress {
    :deep(.el-progress__text) {
      min-width: 130px;
    }
  }
}
</style>
