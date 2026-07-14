<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, ref, watch } from "vue";
import { ElMessage } from "element-plus";
import COS from "cos-js-sdk-v5";
import {
  Check,
  CircleCheck,
  Connection,
  DocumentAdd,
  Finished,
  Refresh,
  UploadFilled,
  WarningFilled
} from "@element-plus/icons-vue";
import {
  activateDemoResourceBinding,
  applyDemoResourceImport,
  completeDemoResourceImport,
  createDemoResourceBindingDraft,
  createDemoResourceImport,
  getDemoResourceParseAttempt,
  getDemoResourceUploadAccess,
  listDemoResourceDiffs,
  listDemoResourceParseAttempts,
  parseDemoResourceImport,
  previewDemoResourceBinding,
  publishDemoResourceRevisions,
  replaceDemoResourceAssignments,
  replaceDemoResourceBindingMappings,
  resolveDemoResourceDiffs,
  selectDemoResourceParseAttempt,
  withdrawDemoResourcePublications,
  type DemoResourceAppliedCatalogCourse,
  type DemoResourceApplyResult,
  type DemoResourceBindingDraft,
  type DemoResourceBindingPreview,
  type DemoResourceDiffItem,
  type DemoResourceDiffResolution,
  type DemoResourceImport,
  type DemoResourceParseAttempt,
  type DemoResourceParser,
  type DemoResourceUploadAccess
} from "@/api/demo-resource";

defineOptions({ name: "AiDemoResourceManager" });

type SystemCourse = {
  id: number;
  name: string;
};

const props = withDefaults(
  defineProps<{
    courseId?: number;
    canImport?: boolean;
    systemCourses?: SystemCourse[];
  }>(),
  { canImport: false, systemCourses: () => [] }
);

type BindingMapping = {
  source_node_id: string;
  target_type: "course" | "chapter" | "hour";
  target_id?: number;
  method: "auto" | "manual";
  status: "suggested" | "confirmed" | "rejected";
  score?: number;
};

const activePane = defineModel<"import" | "binding" | "publish">("activePane", {
  default: "import"
});
const selectedFile = ref<File | null>(null);
const importBusy = ref(false);
const importProgress = ref(0);
const importInfo = ref<DemoResourceImport | null>(null);
const parserType = ref<DemoResourceParser>("manifest_v1");
const parserConfig = ref("{}");
const parseAttempts = ref<DemoResourceParseAttempt[]>([]);
const currentAttempt = ref<DemoResourceParseAttempt | null>(null);
const pollingAttemptId = ref("");
const selectedAttemptId = ref("");
const parseReport = ref("");
const diffs = ref<DemoResourceDiffItem[]>([]);
const diffResolutions = reactive<Record<string, DemoResourceDiffResolution>>(
  {}
);
const diffBusy = ref(false);
const applyKey = ref("");
const appliedCatalogCourses = ref<DemoResourceAppliedCatalogCourse[]>([]);
const bindingTargetCourseIds = reactive<Record<string, number | undefined>>({});
const batchBindingOutcomes = ref<
  Array<{
    catalogCourse: DemoResourceAppliedCatalogCourse;
    courseId: number;
    courseName: string;
    draft?: DemoResourceBindingDraft;
    error?: string;
  }>
>([]);
const bindingBusy = ref(false);
const binding = ref<DemoResourceBindingDraft | null>(null);
const activeBindingCatalogCourseId = ref("");
const activeBindingCourseId = ref<number | undefined>();
const bindingPreview = ref<DemoResourceBindingPreview | null>(null);
const bindingActive = ref(false);
const mappingRows = ref<BindingMapping[]>([]);
const publicationBusy = ref(false);
const publicationIds = ref<string[]>([]);
const publicationKey = ref("");
const assignmentKey = ref("");
const withdrawalKey = ref("");
const notifiedAttemptFailures = new Set<string>();
let parsePollTimer: number | undefined;

const importForm = reactive({
  operation: "create" as "create" | "append" | "update",
  targetCatalogCourseId: ""
});
const bindingForm = reactive({
  mode: "auto" as "auto" | "blank"
});
const publicationForm = reactive({
  revisionId: "",
  variantCodes: "",
  audienceMode: "all_enrolled" as "selected" | "all_enrolled",
  comment: ""
});
const assignmentForm = reactive({
  resourceSetId: "",
  studentIds: "",
  variantCodes: "",
  assignmentVersion: 0
});
const withdrawalForm = reactive({ publicationIds: "" });

const systemCourses = computed(() =>
  (props.systemCourses || []).filter(
    course => Number.isFinite(Number(course.id)) && Number(course.id) > 0
  )
);
const activeBindingCourse = computed(() =>
  systemCourses.value.find(
    course => course.id === Number(activeBindingCourseId.value)
  )
);
const activeBindingCatalogCourse = computed(() =>
  appliedCatalogCourses.value.find(
    course => course.catalog_course_id === activeBindingCatalogCourseId.value
  )
);
const hasCourseContext = computed(
  () =>
    Number.isFinite(Number(activeBindingCourseId.value)) &&
    Number(activeBindingCourseId.value) > 0
);
const importId = computed(() => importInfo.value?.import_id || "");
const parseReadyImportStatuses = new Set([
  "uploaded",
  "parsed",
  "diff_ready",
  "failed"
]);
const canStartParse = computed(() =>
  Boolean(
    importId.value &&
      parseReadyImportStatuses.has(
        String(importInfo.value?.import_status || "").toLowerCase()
      ) &&
      !importBusy.value
  )
);
const selectedAttempt = computed(() =>
  parseAttempts.value.find(item => item.attempt_id === selectedAttemptId.value)
);
const hasPendingDiffs = computed(() =>
  diffs.value.some(item => item.resolution === "pending")
);
const unmappedCatalogCourses = computed(() =>
  appliedCatalogCourses.value.filter(
    course => !Number(bindingTargetCourseIds[course.catalog_course_id])
  )
);
const hasDuplicateBindingTargets = computed(() => {
  const targets = appliedCatalogCourses.value
    .map(course => Number(bindingTargetCourseIds[course.catalog_course_id]))
    .filter(courseId => courseId > 0);
  return new Set(targets).size !== targets.length;
});
const catalogCoursesAwaitingBinding = computed(() => {
  const completedCatalogCourseIds = new Set(
    batchBindingOutcomes.value
      .filter(outcome => outcome.draft)
      .map(outcome => outcome.catalogCourse.catalog_course_id)
  );
  return appliedCatalogCourses.value.filter(
    course => !completedCatalogCourseIds.has(course.catalog_course_id)
  );
});
const canCreateBatchBindings = computed(
  () =>
    Boolean(catalogCoursesAwaitingBinding.value.length) &&
    Boolean(systemCourses.value.length) &&
    !unmappedCatalogCourses.value.length &&
    !hasDuplicateBindingTargets.value &&
    !bindingBusy.value
);
const canActivateBinding = computed(() => {
  const preview = bindingPreview.value;
  return Boolean(
    binding.value &&
      preview &&
      !preview.catalog_changed &&
      !preview.curriculum_changed &&
      !preview.invalid_recipients &&
      !preview.unmapped_resources
  );
});

function payloadOf<T>(response: any): T {
  return (response?.data || response || {}) as T;
}

function actionKey(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function errorText(error: any, fallback: string) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.msg ||
    error?.message ||
    fallback
  );
}

function commaValues(value: string) {
  return value
    .split(/[，,\s]+/)
    .map(item => item.trim())
    .filter(Boolean);
}

function parseJson(value?: string) {
  if (!value) return "";
  try {
    return JSON.stringify(JSON.parse(value), null, 2);
  } catch {
    return value;
  }
}

const attemptStageLabels: Record<string, string> = {
  queued: "等待处理",
  downloading: "下载资源包",
  extracting: "解压资源包",
  parsing: "解析清单",
  materializing: "整理资源",
  persisting: "写入目录",
  completed: "解析完成",
  failed: "解析失败"
};

function attemptStageLabel(attempt?: DemoResourceParseAttempt | null) {
  if (!attempt) return "尚未开始";
  return attemptStageLabels[attempt.stage] || attempt.stage || "处理中";
}

function attemptIsTerminal(attempt?: DemoResourceParseAttempt | null) {
  if (!attempt) return false;
  if (typeof attempt.terminal === "boolean") return attempt.terminal;
  return ["succeeded", "failed", "cancelled"].includes(
    String(attempt.attempt_status || "").toLowerCase()
  );
}

function formatBytes(value?: number) {
  const bytes = Number(value || 0);
  if (!bytes) return "0 B";
  const units = ["B", "KiB", "MiB", "GiB"];
  const index = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  );
  const scaled = bytes / 1024 ** index;
  return `${scaled >= 10 || index === 0 ? scaled.toFixed(0) : scaled.toFixed(1)} ${units[index]}`;
}

function resetBindingState() {
  binding.value = null;
  activeBindingCatalogCourseId.value = "";
  activeBindingCourseId.value = undefined;
  bindingPreview.value = null;
  bindingActive.value = false;
  mappingRows.value = [];
}

function normalizeCourseTitle(value: string) {
  return value
    .trim()
    .toLocaleLowerCase()
    .replace(/[\s\-—_()（）【】\[\]、,，.。:：]/g, "");
}

function suggestBindingTargets() {
  const availableCourseIds = new Set(
    systemCourses.value.map(course => course.id)
  );
  for (const key of Object.keys(bindingTargetCourseIds)) {
    if (!availableCourseIds.has(Number(bindingTargetCourseIds[key]))) {
      delete bindingTargetCourseIds[key];
    }
  }
  for (const catalogCourse of appliedCatalogCourses.value) {
    const key = catalogCourse.catalog_course_id;
    if (availableCourseIds.has(Number(bindingTargetCourseIds[key]))) continue;
    const normalizedTitle = normalizeCourseTitle(catalogCourse.title);
    const matchedCourse = systemCourses.value.find(
      course => normalizeCourseTitle(course.name) === normalizedTitle
    );
    if (matchedCourse) bindingTargetCourseIds[key] = matchedCourse.id;
  }
}

function resetBatchBindingState() {
  batchBindingOutcomes.value = [];
  for (const key of Object.keys(bindingTargetCourseIds)) {
    delete bindingTargetCourseIds[key];
  }
  resetBindingState();
}

function setActiveBindingDraft(
  catalogCourse: DemoResourceAppliedCatalogCourse,
  courseId: number,
  draft: DemoResourceBindingDraft
) {
  binding.value = draft;
  activeBindingCatalogCourseId.value = catalogCourse.catalog_course_id;
  activeBindingCourseId.value = courseId;
  bindingPreview.value = null;
  bindingActive.value = false;
  mappingRows.value = (draft.suggestions || []).map(item => ({
    source_node_id: item.source_node_id,
    target_type: item.target_type as BindingMapping["target_type"],
    target_id: item.target_id,
    method: "auto",
    status: "confirmed",
    score: item.score
  }));
  if (!mappingRows.value.length) addMapping();
}

function openBindingDraft(outcome: {
  catalogCourse: DemoResourceAppliedCatalogCourse;
  courseId: number;
  draft?: DemoResourceBindingDraft;
}) {
  if (!outcome.draft) return;
  setActiveBindingDraft(outcome.catalogCourse, outcome.courseId, outcome.draft);
}

function validateZip(file?: File | null) {
  if (!file) return "请选择 ZIP 包";
  if (!/\.zip$/i.test(file.name)) return "仅支持 ZIP 格式的教学资源包";
  if (file.size > 500 * 1024 * 1024) return "ZIP 文件不能超过 500 MiB";
  return "";
}

function handleFileChange(uploadFile: any) {
  const file = uploadFile?.raw as File | undefined;
  const message = validateZip(file);
  if (message) {
    selectedFile.value = null;
    ElMessage.warning(message);
    return;
  }
  selectedFile.value = file || null;
  importProgress.value = 0;
}

async function sha256(file: File) {
  if (!window.crypto?.subtle) {
    throw new Error(
      "当前浏览器不支持 SHA-256 校验，请使用最新版 Chrome 或 Edge"
    );
  }
  const digest = await window.crypto.subtle.digest(
    "SHA-256",
    await file.arrayBuffer()
  );
  return Array.from(new Uint8Array(digest), value =>
    value.toString(16).padStart(2, "0")
  ).join("");
}

function httpsUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url : null;
  } catch {
    return null;
  }
}

function validateUploadAccess(access: DemoResourceUploadAccess) {
  const uploadHost = httpsUrl(access.upload_host);
  const uploadUrl = httpsUrl(access.upload_url);
  if (
    !access.object_key ||
    !access.tmp_secret_id ||
    !access.tmp_secret_key ||
    !access.session_token ||
    !access.bucket ||
    !access.region ||
    !uploadHost ||
    !uploadUrl
  ) {
    throw new Error("服务端返回的对象存储上传凭证不完整");
  }
  return { uploadHost, uploadUrl };
}

function callCos<T>(cos: COS, method: string, params: Record<string, unknown>) {
  return new Promise<T>((resolve, reject) => {
    (cos as any)[method](params, (error: unknown, data: T) => {
      if (error) reject(error);
      else resolve(data);
    });
  });
}

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

async function uploadArchiveBySts(
  access: DemoResourceUploadAccess,
  file: File
) {
  const { uploadHost } = validateUploadAccess(access);
  const cos = new COS({
    SecretId: access.tmp_secret_id,
    SecretKey: access.tmp_secret_key,
    SecurityToken: access.session_token,
    Protocol: "https:",
    Domain: uploadHost.host
  });

  const reportProgress = (loaded: number) => {
    importProgress.value = Math.round(
      (Math.min(loaded, file.size) / Math.max(file.size, 1)) * 100
    );
  };
  const contentType = file.type || "application/zip";
  const multipartThreshold = 50 * 1024 * 1024;
  const multipartPartSize = 16 * 1024 * 1024;

  reportProgress(0);
  if (file.size <= multipartThreshold) {
    await callCos(cos, "putObject", {
      Bucket: access.bucket,
      Region: access.region,
      Key: access.object_key,
      Body: file,
      ContentType: contentType,
      onProgress: (progress: { loaded?: number }) =>
        reportProgress(progress.loaded || 0)
    });
    reportProgress(file.size);
    return;
  }

  // Avoid uploadFile here: it first lists bucket-level multipart uploads,
  // which may be denied even when object-scoped multipart writes are allowed.
  const initData: any = await callCos(cos, "multipartInit", {
    Bucket: access.bucket,
    Region: access.region,
    Key: access.object_key,
    ContentType: contentType
  });
  const uploadId = initData?.UploadId || initData?.uploadId;
  if (!uploadId) throw new Error("分片初始化失败：缺少 UploadId");

  const partCount = Math.ceil(file.size / multipartPartSize);
  const partProgress = new Map<number, number>();
  const uploadedParts: Array<{ PartNumber: number; ETag: string }> = [];
  const reportMultipartProgress = () => {
    reportProgress(
      Array.from(partProgress.values()).reduce(
        (total, loaded) => total + loaded,
        0
      )
    );
  };

  try {
    await runWithConcurrency(
      Array.from({ length: partCount }, (_, index) => index + 1),
      async partNumber => {
        const start = (partNumber - 1) * multipartPartSize;
        const chunk = file.slice(
          start,
          Math.min(start + multipartPartSize, file.size)
        );
        const partData: any = await callCos(cos, "multipartUpload", {
          Bucket: access.bucket,
          Region: access.region,
          Key: access.object_key,
          UploadId: uploadId,
          PartNumber: partNumber,
          Body: chunk,
          ContentLength: chunk.size,
          onProgress: (progress: { loaded?: number }) => {
            partProgress.set(
              partNumber,
              Math.min(progress.loaded || 0, chunk.size)
            );
            reportMultipartProgress();
          }
        });
        const etag = partData?.ETag || partData?.etag;
        if (!etag) {
          throw new Error(`分片上传失败：第 ${partNumber} 片缺少 ETag`);
        }
        partProgress.set(partNumber, chunk.size);
        reportMultipartProgress();
        uploadedParts.push({ PartNumber: partNumber, ETag: etag });
      },
      2
    );

    await callCos(cos, "multipartComplete", {
      Bucket: access.bucket,
      Region: access.region,
      Key: access.object_key,
      UploadId: uploadId,
      Parts: uploadedParts.sort(
        (left, right) => left.PartNumber - right.PartNumber
      )
    });
    reportProgress(file.size);
  } catch (error) {
    try {
      await callCos(cos, "multipartAbort", {
        Bucket: access.bucket,
        Region: access.region,
        Key: access.object_key,
        UploadId: uploadId
      });
    } catch {
      // Preserve the original upload error.
    }
    throw error;
  }
}

async function uploadArchive(access: DemoResourceUploadAccess, file: File) {
  validateUploadAccess(access);
  await uploadArchiveBySts(access, file);
}

async function createAndUpload() {
  if (!props.canImport) {
    ElMessage.warning("仅管理员可以导入资源包");
    return;
  }
  const fileMessage = validateZip(selectedFile.value);
  if (fileMessage) {
    ElMessage.warning(fileMessage);
    return;
  }
  if (
    importForm.operation !== "create" &&
    !importForm.targetCatalogCourseId.trim()
  ) {
    ElMessage.warning("追加或更新时需要填写演示目录课程 ID");
    return;
  }

  importBusy.value = true;
  importProgress.value = 0;
  try {
    const createResult = await createDemoResourceImport({
      operation: importForm.operation,
      target_catalog_course_id:
        importForm.operation === "create"
          ? undefined
          : importForm.targetCatalogCourseId.trim()
    });
    const created = payloadOf<DemoResourceImport>(createResult);
    if (!created.import_id) throw new Error("创建导入批次后未返回 import_id");
    stopParsePolling();
    parseAttempts.value = [];
    currentAttempt.value = null;
    selectedAttemptId.value = "";
    parseReport.value = "";
    diffs.value = [];
    Object.keys(diffResolutions).forEach(key => delete diffResolutions[key]);
    appliedCatalogCourses.value = [];
    resetBatchBindingState();
    applyKey.value = `import-${created.import_id}-apply-v1`;
    importInfo.value = created;

    const accessResult = await getDemoResourceUploadAccess(created.import_id);
    const access = payloadOf<DemoResourceUploadAccess>(accessResult);
    await uploadArchive(access, selectedFile.value!);
    const archiveSha256 = await sha256(selectedFile.value!);
    const completeResult = await completeDemoResourceImport(created.import_id, {
      sha256: archiveSha256,
      size: selectedFile.value!.size
    });
    importInfo.value = {
      ...created,
      ...payloadOf<DemoResourceImport>(completeResult)
    };
    ElMessage.success("资源包已上传并完成校验");
  } catch (error: any) {
    importProgress.value = 0;
    ElMessage.error(errorText(error, "资源包上传失败"));
  } finally {
    importBusy.value = false;
  }
}

function stopParsePolling() {
  if (parsePollTimer) window.clearTimeout(parsePollTimer);
  parsePollTimer = undefined;
  pollingAttemptId.value = "";
}

function upsertParseAttempt(attempt: DemoResourceParseAttempt) {
  const index = parseAttempts.value.findIndex(
    item => item.attempt_id === attempt.attempt_id
  );
  if (index >= 0) parseAttempts.value.splice(index, 1, attempt);
  else parseAttempts.value.push(attempt);
  parseAttempts.value.sort(
    (left, right) => Number(left.attempt_no) - Number(right.attempt_no)
  );
}

function scheduleParsePolling(attemptId: string) {
  if (parsePollTimer) window.clearTimeout(parsePollTimer);
  if (!attemptId || !importId.value) return;
  pollingAttemptId.value = attemptId;
  parsePollTimer = window.setTimeout(() => {
    void pollParseAttempt(attemptId, true);
  }, 2500);
}

async function pollParseAttempt(attemptId: string, silent = false) {
  const targetImportId = importId.value;
  if (!targetImportId || !attemptId) return;
  try {
    const result = await getDemoResourceParseAttempt(targetImportId, attemptId);
    if (targetImportId !== importId.value) return;
    const attempt = payloadOf<{ item?: DemoResourceParseAttempt }>(result).item;
    if (!attempt?.attempt_id) throw new Error("解析任务响应缺少 attempt_id");
    currentAttempt.value = attempt;
    upsertParseAttempt(attempt);

    if (!attemptIsTerminal(attempt)) {
      scheduleParsePolling(attempt.attempt_id);
      return;
    }

    if (parsePollTimer) window.clearTimeout(parsePollTimer);
    parsePollTimer = undefined;
    if (pollingAttemptId.value === attempt.attempt_id) {
      pollingAttemptId.value = "";
    }
    if (
      attempt.attempt_status === "failed" &&
      !notifiedAttemptFailures.has(attempt.attempt_id)
    ) {
      notifiedAttemptFailures.add(attempt.attempt_id);
      ElMessage.error(attempt.error_message || "资源包解析失败");
    }
  } catch (error: any) {
    if (!silent) ElMessage.error(errorText(error, "解析状态加载失败"));
    if (targetImportId === importId.value) scheduleParsePolling(attemptId);
  }
}

async function loadParseAttempts(silent = false) {
  if (!importId.value) return;
  try {
    const result = await listDemoResourceParseAttempts(importId.value);
    const items =
      payloadOf<{ items?: DemoResourceParseAttempt[] }>(result).items || [];
    parseAttempts.value = items;
    const latestAttempt = [...items].sort(
      (left, right) => Number(right.attempt_no) - Number(left.attempt_no)
    )[0];
    currentAttempt.value = latestAttempt || null;
    const runningAttempt = [...items]
      .sort((left, right) => Number(right.attempt_no) - Number(left.attempt_no))
      .find(item => !attemptIsTerminal(item));
    if (runningAttempt) {
      void pollParseAttempt(runningAttempt.attempt_id, true);
    } else {
      stopParsePolling();
    }
  } catch (error: any) {
    if (!silent) ElMessage.error(errorText(error, "解析记录加载失败"));
  }
}

async function startParse() {
  if (!importId.value) {
    ElMessage.warning("请先完成资源包上传");
    return;
  }
  if (!canStartParse.value) {
    ElMessage.warning("请先完成资源包上传校验");
    return;
  }
  try {
    JSON.parse(parserConfig.value || "{}");
  } catch {
    ElMessage.warning("解析配置必须是合法 JSON");
    return;
  }
  importBusy.value = true;
  try {
    const result = await parseDemoResourceImport(importId.value, {
      parser_type: parserType.value,
      parser_config_json: parserConfig.value || "{}"
    });
    const payload = payloadOf<{ attempt_id?: string }>(result);
    const attemptId = payload.attempt_id || "";
    if (!attemptId) throw new Error("后端未返回解析任务 ID");
    selectedAttemptId.value = "";
    parseReport.value = "";
    diffs.value = [];
    Object.keys(diffResolutions).forEach(key => delete diffResolutions[key]);
    ElMessage.success("解析任务已提交");
    await pollParseAttempt(attemptId);
  } catch (error: any) {
    ElMessage.error(errorText(error, "资源包解析提交失败"));
  } finally {
    importBusy.value = false;
  }
}

async function selectAttempt(attempt: DemoResourceParseAttempt) {
  if (
    !importId.value ||
    !attemptIsTerminal(attempt) ||
    attempt.attempt_status !== "succeeded"
  )
    return;
  diffBusy.value = true;
  try {
    await selectDemoResourceParseAttempt(importId.value, attempt.attempt_id);
    selectedAttemptId.value = attempt.attempt_id;
    parseReport.value = parseJson(attempt.report_json);
    await loadDiffs();
    ElMessage.success("已选择解析结果");
  } catch (error: any) {
    ElMessage.error(errorText(error, "选择解析结果失败"));
  } finally {
    diffBusy.value = false;
  }
}

async function loadDiffs() {
  if (!importId.value) return;
  const result = await listDemoResourceDiffs(importId.value);
  diffs.value =
    payloadOf<{ items?: DemoResourceDiffItem[] }>(result).items || [];
  diffs.value.forEach(item => {
    if (
      item.resolution &&
      item.resolution !== "pending" &&
      ["replace_draft", "keep_existing", "create_new"].includes(item.resolution)
    ) {
      diffResolutions[item.diff_item_id] =
        item.resolution as DemoResourceDiffResolution;
    }
  });
}

async function confirmDiffs() {
  if (!importId.value) return;
  const pending = diffs.value.filter(item => item.resolution === "pending");
  const unresolved = pending.filter(
    item => !diffResolutions[item.diff_item_id]
  );
  if (unresolved.length) {
    ElMessage.warning("请为所有待确认差异选择处理方式");
    return;
  }
  const items = pending.map(item => ({
    diff_item_id: item.diff_item_id,
    resolution: diffResolutions[item.diff_item_id]
  }));
  if (!items.length) {
    ElMessage.info("当前没有待确认差异");
    return;
  }
  diffBusy.value = true;
  try {
    await resolveDemoResourceDiffs(importId.value, { items });
    await loadDiffs();
    ElMessage.success("导入差异已确认");
  } catch (error: any) {
    ElMessage.error(errorText(error, "确认导入差异失败"));
  } finally {
    diffBusy.value = false;
  }
}

async function applyImport() {
  if (!importId.value) return;
  if (hasPendingDiffs.value) {
    ElMessage.warning("请先确认全部导入差异");
    return;
  }
  if (!applyKey.value) applyKey.value = `import-${importId.value}-apply-v1`;
  diffBusy.value = true;
  try {
    const result = await applyDemoResourceImport(importId.value, {
      idempotency_key: applyKey.value
    });
    const applied = payloadOf<DemoResourceApplyResult>(result);
    importInfo.value = {
      ...importInfo.value,
      import_status: "applied"
    } as DemoResourceImport;
    appliedCatalogCourses.value = applied.catalog_courses || [];
    resetBatchBindingState();
    suggestBindingTargets();
    if (!appliedCatalogCourses.value.length) {
      ElMessage.error("导入已应用，但服务端未返回演示目录课程列表");
      return;
    }
    activePane.value = "binding";
    ElMessage.success(
      `导入已应用，已返回 ${appliedCatalogCourses.value.length} 门目录课程`
    );
  } catch (error: any) {
    ElMessage.error(errorText(error, "应用导入失败"));
  } finally {
    diffBusy.value = false;
  }
}

function addMapping() {
  mappingRows.value.push({
    source_node_id: "",
    target_type: "hour",
    target_id: undefined,
    method: "manual",
    status: "confirmed",
    score: 1
  });
}

async function createBatchBindings() {
  if (!systemCourses.value.length) {
    ElMessage.warning("当前没有可绑定的平台课程");
    return;
  }
  if (unmappedCatalogCourses.value.length) {
    ElMessage.warning("请为每门目录课程选择一个平台课程");
    return;
  }
  if (hasDuplicateBindingTargets.value) {
    ElMessage.warning("同一平台课程不能重复绑定多门目录课程");
    return;
  }
  if (!catalogCoursesAwaitingBinding.value.length) {
    ElMessage.info("当前目录课程均已创建绑定草稿");
    return;
  }
  bindingBusy.value = true;
  try {
    const outcomes = await Promise.all(
      catalogCoursesAwaitingBinding.value.map(async catalogCourse => {
        const courseId = Number(
          bindingTargetCourseIds[catalogCourse.catalog_course_id]
        );
        const courseName =
          systemCourses.value.find(course => course.id === courseId)?.name ||
          `系统课程 ID ${courseId}`;
        try {
          const result = await createDemoResourceBindingDraft(courseId, {
            catalog_course_id: catalogCourse.catalog_course_id,
            mode: bindingForm.mode
          });
          const draft = payloadOf<DemoResourceBindingDraft>(result);
          if (!draft.binding_revision_id) {
            throw new Error("后端未返回绑定草稿 ID");
          }
          return { catalogCourse, courseId, courseName, draft };
        } catch (error: any) {
          return {
            catalogCourse,
            courseId,
            courseName,
            error: errorText(error, "创建绑定草稿失败")
          };
        }
      })
    );
    const outcomesByCatalogCourseId = new Map(
      batchBindingOutcomes.value.map(outcome => [
        outcome.catalogCourse.catalog_course_id,
        outcome
      ])
    );
    outcomes.forEach(outcome => {
      outcomesByCatalogCourseId.set(
        outcome.catalogCourse.catalog_course_id,
        outcome
      );
    });
    batchBindingOutcomes.value = appliedCatalogCourses.value.flatMap(course => {
      const outcome = outcomesByCatalogCourseId.get(course.catalog_course_id);
      return outcome ? [outcome] : [];
    });
    const succeeded = outcomes.filter(item => item.draft);
    const failed = outcomes.length - succeeded.length;
    if (succeeded[0]?.draft) {
      setActiveBindingDraft(
        succeeded[0].catalogCourse,
        succeeded[0].courseId,
        succeeded[0].draft
      );
    }
    if (failed) {
      ElMessage.warning(
        `已创建 ${succeeded.length} 个绑定草稿，${failed} 个失败`
      );
    } else {
      ElMessage.success(`已创建 ${succeeded.length} 个绑定草稿`);
    }
  } finally {
    bindingBusy.value = false;
  }
}

async function saveMappings() {
  if (!binding.value) return;
  const mappings = mappingRows.value.filter(
    item => item.source_node_id.trim() && Number(item.target_id) > 0
  );
  if (!mappings.length) {
    ElMessage.warning("请至少确认一条节点映射");
    return;
  }
  bindingBusy.value = true;
  try {
    await replaceDemoResourceBindingMappings(
      binding.value.binding_revision_id,
      {
        mappings: mappings.map(item => ({
          ...item,
          source_node_id: item.source_node_id.trim(),
          target_id: Number(item.target_id),
          score: Number(item.score || 0)
        }))
      }
    );
    ElMessage.success("节点映射已保存");
  } catch (error: any) {
    ElMessage.error(errorText(error, "保存节点映射失败"));
  } finally {
    bindingBusy.value = false;
  }
}

async function loadBindingPreview() {
  if (!binding.value) return;
  bindingBusy.value = true;
  try {
    const result = await previewDemoResourceBinding(
      binding.value.binding_revision_id
    );
    bindingPreview.value = payloadOf<DemoResourceBindingPreview>(result);
  } catch (error: any) {
    ElMessage.error(errorText(error, "绑定影响预览失败"));
  } finally {
    bindingBusy.value = false;
  }
}

async function activateBinding() {
  if (!binding.value || !canActivateBinding.value) {
    ElMessage.warning("请先处理预览中的未映射资源或课程变更");
    return;
  }
  bindingBusy.value = true;
  try {
    await activateDemoResourceBinding(binding.value.binding_revision_id, {
      expected_binding_version: Number(
        binding.value.binding_version || binding.value.revision_no || 1
      ),
      expected_catalog_hash: binding.value.catalog_hash || "",
      expected_curriculum_hash: binding.value.curriculum_hash || ""
    });
    bindingActive.value = true;
    activePane.value = "publish";
    ElMessage.success("课程绑定已生效");
  } catch (error: any) {
    ElMessage.error(errorText(error, "激活绑定失败，请刷新后重新预览"));
  } finally {
    bindingBusy.value = false;
  }
}

async function publishRevision() {
  if (!hasCourseContext.value) {
    ElMessage.warning("请先选择系统课程");
    return;
  }
  if (!bindingActive.value) {
    ElMessage.warning("请先完成课程绑定并激活");
    return;
  }
  const variants = commaValues(publicationForm.variantCodes);
  if (!publicationForm.revisionId.trim() || !variants.length) {
    ElMessage.warning("请填写资源修订 ID 和待发布版本");
    return;
  }
  if (!publicationKey.value) publicationKey.value = actionKey("publication");
  publicationBusy.value = true;
  try {
    const result = await publishDemoResourceRevisions(
      Number(activeBindingCourseId.value),
      {
        idempotency_key: publicationKey.value,
        items: [
          {
            revision_id: publicationForm.revisionId.trim(),
            variant_codes: variants,
            decision: "approved",
            comment: publicationForm.comment.trim(),
            audience_mode: publicationForm.audienceMode
          }
        ]
      }
    );
    const payload = payloadOf<{ publication_ids?: string[] }>(result);
    publicationIds.value = Array.from(
      new Set([...publicationIds.value, ...(payload.publication_ids || [])])
    );
    publicationKey.value = "";
    ElMessage.success("资源已审核并发布");
  } catch (error: any) {
    ElMessage.error(errorText(error, "审核发布失败"));
  } finally {
    publicationBusy.value = false;
  }
}

async function saveAssignments() {
  if (!hasCourseContext.value) return;
  const studentIds = commaValues(assignmentForm.studentIds)
    .map(value => Number(value))
    .filter(value => Number.isInteger(value) && value > 0);
  if (!assignmentForm.resourceSetId.trim() || !studentIds.length) {
    ElMessage.warning("请填写逻辑资源 ID 和学生 ID");
    return;
  }
  if (!assignmentKey.value) assignmentKey.value = actionKey("assignment");
  publicationBusy.value = true;
  try {
    const result = await replaceDemoResourceAssignments(
      Number(activeBindingCourseId.value),
      {
        idempotency_key: assignmentKey.value,
        expected_assignment_version: Number(
          assignmentForm.assignmentVersion || 0
        ),
        entries: [
          {
            resource_set_id: assignmentForm.resourceSetId.trim(),
            student_ids: studentIds,
            visible_variant_codes: commaValues(assignmentForm.variantCodes)
          }
        ]
      }
    );
    const payload = payloadOf<{ assignment_version?: number }>(result);
    if (payload.assignment_version !== undefined) {
      assignmentForm.assignmentVersion = payload.assignment_version;
    }
    assignmentKey.value = "";
    ElMessage.success("学生版本分配已保存");
  } catch (error: any) {
    ElMessage.error(errorText(error, "学生版本分配失败，请刷新分配版本后重试"));
  } finally {
    publicationBusy.value = false;
  }
}

async function withdrawPublications() {
  if (!hasCourseContext.value) return;
  const ids = commaValues(withdrawalForm.publicationIds);
  if (!ids.length) {
    ElMessage.warning("请输入要撤回的发布 ID");
    return;
  }
  if (!withdrawalKey.value) withdrawalKey.value = actionKey("withdrawal");
  publicationBusy.value = true;
  try {
    await withdrawDemoResourcePublications(
      Number(activeBindingCourseId.value),
      {
        idempotency_key: withdrawalKey.value,
        publication_ids: ids
      }
    );
    publicationIds.value = publicationIds.value.filter(id => !ids.includes(id));
    withdrawalForm.publicationIds = "";
    withdrawalKey.value = "";
    ElMessage.success("发布已撤回");
  } catch (error: any) {
    ElMessage.error(errorText(error, "撤回发布失败"));
  } finally {
    publicationBusy.value = false;
  }
}

watch(
  () => props.courseId,
  courseId => {
    if (binding.value) return;
    const normalizedCourseId = Number(courseId);
    activeBindingCourseId.value =
      Number.isFinite(normalizedCourseId) && normalizedCourseId > 0
        ? normalizedCourseId
        : undefined;
  },
  { immediate: true }
);

watch(systemCourses, suggestBindingTargets, { deep: true });

onBeforeUnmount(stopParsePolling);
</script>

<template>
  <section class="demo-resource-manager" aria-label="演示教学资源管理">
    <header class="demo-resource-manager__header">
      <div>
        <h2>演示教学资源</h2>
        <p v-if="activePane === 'import'">导入范围：ZIP 内全部课程</p>
        <p v-else-if="activeBindingCourse">
          当前编辑：{{ activeBindingCourse.name }}
        </p>
        <p v-else>应用导入后可为每门目录课程配置对应的平台课程</p>
      </div>
      <el-button plain :icon="Refresh" @click="loadParseAttempts()">
        刷新状态
      </el-button>
    </header>

    <el-tabs v-model="activePane" class="demo-resource-manager__tabs">
      <el-tab-pane label="导入资源包" name="import">
        <div class="demo-resource-manager__pane">
          <el-alert
            v-if="!canImport"
            title="当前账号仅可绑定、审核和发布；资源包导入由管理员执行。"
            type="info"
            :closable="false"
            show-icon
          />

          <section class="workflow-section">
            <div class="workflow-section__header">
              <div>
                <h3>上传 ZIP</h3>
                <p>上传后自动校验 SHA-256，再提交解析。</p>
              </div>
              <el-tag effect="plain">{{
                importInfo?.import_status || "未创建"
              }}</el-tag>
            </div>
            <div class="upload-form">
              <el-radio-group
                v-model="importForm.operation"
                :disabled="!canImport || importBusy"
              >
                <el-radio-button value="create">新建目录</el-radio-button>
                <el-radio-button value="append">追加资源</el-radio-button>
                <el-radio-button value="update">更新资源</el-radio-button>
              </el-radio-group>
              <el-input
                v-if="importForm.operation !== 'create'"
                v-model="importForm.targetCatalogCourseId"
                placeholder="演示目录课程 ID，例如 DCC..."
                :disabled="!canImport || importBusy"
              />
              <el-upload
                class="demo-resource-manager__upload"
                action="#"
                accept=".zip,application/zip,application/x-zip-compressed"
                :auto-upload="false"
                :show-file-list="false"
                :disabled="!canImport || importBusy"
                :on-change="handleFileChange"
              >
                <el-button
                  :icon="DocumentAdd"
                  :disabled="!canImport || importBusy"
                >
                  {{ selectedFile ? selectedFile.name : "选择 ZIP 包" }}
                </el-button>
              </el-upload>
              <el-button
                type="primary"
                :icon="UploadFilled"
                :loading="importBusy"
                :disabled="!canImport || !selectedFile"
                @click="createAndUpload"
              >
                创建并上传
              </el-button>
            </div>
            <div class="upload-template-link">
              <el-link
                href="/demo-resources/aiedu-demo-resource-upload-kit-v1.zip"
                type="primary"
                :underline="false"
                download
                >下载资源包制作模板</el-link
              >
              <span>含清单示例、校验规则和可直接参考的示例压缩包。</span>
            </div>
            <el-progress
              v-if="importBusy || importProgress"
              class="upload-progress"
              :percentage="importProgress"
              :stroke-width="8"
              :show-text="true"
            />
            <div v-if="importInfo?.import_id" class="id-strip">
              <span>导入批次</span><code>{{ importInfo.import_id }}</code>
              <span>对象</span
              ><code>{{ importInfo.archive_object_key || "待上传" }}</code>
            </div>
          </section>

          <section
            class="workflow-section"
            :class="{ 'is-disabled': !canStartParse }"
          >
            <div class="workflow-section__header">
              <div>
                <h3>解析与确认</h3>
                <p>选择成功的解析结果后确认差异，才可以应用导入。</p>
              </div>
              <el-button
                plain
                :icon="Refresh"
                :disabled="!importId"
                @click="loadParseAttempts()"
                >刷新解析</el-button
              >
            </div>
            <div class="parse-controls">
              <el-select v-model="parserType" :disabled="!canStartParse">
                <el-option label="标准清单" value="manifest_v1" />
                <el-option label="目录模板" value="directory_template_v1" />
                <el-option label="手动映射" value="manual_mapping" />
                <el-option label="自动识别预览" value="auto_detect_preview" />
              </el-select>
              <el-input
                v-model="parserConfig"
                class="parse-controls__config"
                placeholder="解析配置 JSON"
                :disabled="!canStartParse"
              />
              <el-button
                type="primary"
                :loading="importBusy"
                :disabled="!canStartParse"
                @click="startParse"
                >开始解析</el-button
              >
            </div>
            <div
              v-if="currentAttempt && !attemptIsTerminal(currentAttempt)"
              class="attempt-live-status"
            >
              <div class="attempt-live-status__meta">
                <span>{{ attemptStageLabel(currentAttempt) }}</span>
                <span>
                  {{ currentAttempt.processed_files || 0 }} /
                  {{ currentAttempt.total_files || 0 }} 个文件 ·
                  {{ formatBytes(currentAttempt.processed_bytes) }} /
                  {{ formatBytes(currentAttempt.total_bytes) }}
                </span>
              </div>
              <el-progress
                :percentage="
                  Math.max(0, Math.min(100, currentAttempt.progress || 0))
                "
                :stroke-width="8"
              />
              <p v-if="currentAttempt.attempt_status === 'retrying'">
                服务端正在自动恢复，第 {{ currentAttempt.retry_count || 0 }} /
                {{ currentAttempt.max_attempts || 0 }} 次尝试
              </p>
            </div>
            <el-alert
              v-if="
                currentAttempt &&
                attemptIsTerminal(currentAttempt) &&
                currentAttempt.attempt_status === 'failed'
              "
              class="attempt-error"
              type="error"
              :closable="false"
              show-icon
              :title="currentAttempt.error_message || '资源包解析失败'"
              :description="currentAttempt.error_code || undefined"
            />
            <el-table
              :data="parseAttempts"
              size="small"
              empty-text="尚无解析记录"
            >
              <el-table-column prop="attempt_no" label="#" width="64" />
              <el-table-column
                prop="parser_type"
                label="解析器"
                min-width="132"
              />
              <el-table-column label="状态" width="118">
                <template #default="{ row }">
                  <el-tag
                    :type="
                      row.attempt_status === 'succeeded'
                        ? 'success'
                        : row.attempt_status === 'failed'
                          ? 'danger'
                          : 'warning'
                    "
                    effect="plain"
                  >
                    {{ row.attempt_status }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="进度" min-width="230">
                <template #default="{ row }">
                  <div class="attempt-table-progress">
                    <div>
                      <span>{{ attemptStageLabel(row) }}</span>
                      <span>{{ row.progress || 0 }}%</span>
                    </div>
                    <el-progress
                      :percentage="
                        Math.max(0, Math.min(100, row.progress || 0))
                      "
                      :show-text="false"
                      :stroke-width="6"
                    />
                    <small>
                      {{ row.processed_files || 0 }} /
                      {{ row.total_files || 0 }}
                      个文件
                      <template v-if="row.retry_count">
                        · 已重试 {{ row.retry_count }} 次
                      </template>
                    </small>
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="112" fixed="right">
                <template #default="{ row }">
                  <el-button
                    link
                    type="primary"
                    :disabled="
                      !attemptIsTerminal(row) ||
                      row.attempt_status !== 'succeeded'
                    "
                    @click="selectAttempt(row)"
                    >选择</el-button
                  >
                </template>
              </el-table-column>
            </el-table>

            <el-collapse
              v-if="selectedAttempt"
              class="parse-result"
              value="report"
            >
              <el-collapse-item title="解析报告" name="report">
                <pre>{{
                  parseReport ||
                  parseJson(selectedAttempt.report_json) ||
                  "暂无报告"
                }}</pre>
              </el-collapse-item>
            </el-collapse>
          </section>

          <section
            class="workflow-section"
            :class="{ 'is-disabled': !selectedAttemptId }"
          >
            <div class="workflow-section__header">
              <div>
                <h3>导入差异</h3>
                <p>待确认的更新必须先选择处理方式。</p>
              </div>
              <div class="workflow-section__actions">
                <el-button
                  :disabled="!diffs.length"
                  :loading="diffBusy"
                  @click="confirmDiffs"
                  >确认差异</el-button
                >
                <el-button
                  type="primary"
                  :icon="Finished"
                  :disabled="!diffs.length || hasPendingDiffs"
                  :loading="diffBusy"
                  @click="applyImport"
                  >应用导入</el-button
                >
              </div>
            </div>
            <el-table
              :data="diffs"
              size="small"
              empty-text="选择解析结果后显示差异"
            >
              <el-table-column prop="entity_kind" label="对象" width="110" />
              <el-table-column
                prop="external_key"
                label="资源键"
                min-width="180"
                show-overflow-tooltip
              />
              <el-table-column prop="action" label="变更" width="90" />
              <el-table-column
                prop="reason_code"
                label="原因"
                min-width="140"
                show-overflow-tooltip
              />
              <el-table-column label="处理方式" width="160">
                <template #default="{ row }">
                  <template v-if="row.resolution === 'pending'">
                    <el-select
                      v-model="diffResolutions[row.diff_item_id]"
                      size="small"
                      placeholder="请选择"
                    >
                      <el-option label="生成新草稿" value="replace_draft" />
                      <el-option label="保留现有资源" value="keep_existing" />
                      <el-option label="创建新资源" value="create_new" />
                    </el-select>
                  </template>
                  <span v-else>{{ row.resolution }}</span>
                </template>
              </el-table-column>
            </el-table>
          </section>
        </div>
      </el-tab-pane>

      <el-tab-pane label="绑定课程" name="binding">
        <div class="demo-resource-manager__pane">
          <section class="workflow-section">
            <div class="workflow-section__header">
              <div>
                <h3>创建绑定草稿</h3>
                <p>为每门目录课程选择对应的平台课程，然后批量创建绑定草稿。</p>
              </div>
              <el-tag v-if="bindingActive" type="success" effect="plain"
                ><el-icon><CircleCheck /></el-icon>已生效</el-tag
              >
            </div>
            <el-alert
              v-if="!appliedCatalogCourses.length"
              type="info"
              :closable="false"
              show-icon
              title="请先完成应用导入"
              description="Apply 成功后，服务端会在这里返回并列出资源包中的目录课程。"
            />
            <template v-else>
              <div class="catalog-course-summary">
                本次导入包含
                <strong>{{ appliedCatalogCourses.length }}</strong>
                门目录课程。系统会按课程标题预匹配，你可以逐行调整。
              </div>
              <el-alert
                v-if="!systemCourses.length"
                type="warning"
                :closable="false"
                show-icon
                title="未加载可绑定的平台课程"
                description="请刷新页面或确认当前账号有课程管理权限后再创建绑定草稿。"
              />
              <el-table
                :data="appliedCatalogCourses"
                row-key="catalog_course_id"
                size="small"
              >
                <el-table-column
                  prop="title"
                  label="目录课程"
                  min-width="180"
                />
                <el-table-column
                  prop="external_key"
                  label="资源包课程键"
                  min-width="220"
                  show-overflow-tooltip
                />
                <el-table-column label="绑定到平台课程" min-width="250">
                  <template #default="{ row }">
                    <el-select
                      v-model="bindingTargetCourseIds[row.catalog_course_id]"
                      filterable
                      clearable
                      placeholder="选择平台课程"
                      :disabled="
                        bindingBusy ||
                        Boolean(
                          batchBindingOutcomes.find(
                            item =>
                              item.catalogCourse.catalog_course_id ===
                                row.catalog_course_id && item.draft
                          )
                        )
                      "
                    >
                      <el-option
                        v-for="course in systemCourses"
                        :key="course.id"
                        :label="`${course.name}（ID ${course.id}）`"
                        :value="course.id"
                      />
                    </el-select>
                  </template>
                </el-table-column>
                <el-table-column label="草稿状态" width="150">
                  <template #default="{ row }">
                    <template
                      v-for="outcome in batchBindingOutcomes.filter(
                        item =>
                          item.catalogCourse.catalog_course_id ===
                          row.catalog_course_id
                      )"
                      :key="outcome.catalogCourse.catalog_course_id"
                    >
                      <el-tag v-if="outcome.draft" type="success" effect="plain"
                        >已创建</el-tag
                      >
                      <el-tooltip
                        v-else-if="outcome.error"
                        :content="outcome.error"
                      >
                        <el-tag type="danger" effect="plain">创建失败</el-tag>
                      </el-tooltip>
                    </template>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="100">
                  <template #default="{ row }">
                    <el-button
                      v-for="outcome in batchBindingOutcomes.filter(
                        item =>
                          item.catalogCourse.catalog_course_id ===
                            row.catalog_course_id && item.draft
                      )"
                      :key="outcome.catalogCourse.catalog_course_id"
                      link
                      type="primary"
                      @click="openBindingDraft(outcome)"
                      >编辑映射</el-button
                    >
                  </template>
                </el-table-column>
              </el-table>
              <div
                v-if="
                  unmappedCatalogCourses.length || hasDuplicateBindingTargets
                "
                class="binding-validation"
              >
                <span v-if="unmappedCatalogCourses.length">
                  还有
                  {{ unmappedCatalogCourses.length }} 门目录课程未匹配平台课程。
                </span>
                <span v-if="hasDuplicateBindingTargets">
                  同一平台课程不能重复绑定多门目录课程。
                </span>
              </div>
              <div class="binding-form">
                <el-select
                  v-model="bindingForm.mode"
                  :disabled="bindingBusy"
                  aria-label="映射生成方式"
                >
                  <el-option label="自动生成章、节建议" value="auto" />
                  <el-option label="创建空白映射" value="blank" />
                </el-select>
                <el-button
                  type="primary"
                  :loading="bindingBusy"
                  :disabled="!canCreateBatchBindings"
                  @click="createBatchBindings"
                  >{{
                    batchBindingOutcomes.length
                      ? "创建剩余绑定草稿"
                      : "批量创建绑定草稿"
                  }}</el-button
                >
              </div>
            </template>
            <div
              v-if="binding && activeBindingCourse"
              class="binding-target-strip"
            >
              <span>当前编辑</span>
              <strong>{{
                activeBindingCatalogCourse?.title || "目录课程"
              }}</strong>
              <el-icon><Connection /></el-icon>
              <strong
                >{{ activeBindingCourse.name }}（ID
                {{ activeBindingCourse.id }}）</strong
              >
            </div>
            <div v-if="binding" class="id-strip">
              <span>当前绑定草稿</span
              ><code>{{ binding.binding_revision_id }}</code>
              <span>绑定版本</span
              ><code>{{
                binding.binding_version || binding.revision_no || 1
              }}</code>
            </div>
          </section>

          <section
            class="workflow-section"
            :class="{ 'is-disabled': !binding }"
          >
            <div class="workflow-section__header">
              <div>
                <h3>节点映射</h3>
                <p>同一目录节点可以映射到多个课程章节或课时。</p>
              </div>
              <div class="workflow-section__actions">
                <el-button
                  :icon="DocumentAdd"
                  :disabled="!binding"
                  @click="addMapping"
                  >新增映射</el-button
                >
                <el-button
                  type="primary"
                  :loading="bindingBusy"
                  :disabled="!binding"
                  @click="saveMappings"
                  >保存映射</el-button
                >
              </div>
            </div>
            <el-table
              :data="mappingRows"
              size="small"
              empty-text="创建草稿后添加映射"
            >
              <el-table-column label="目录节点 ID" min-width="210">
                <template #default="{ row }"
                  ><el-input
                    v-model="row.source_node_id"
                    size="small"
                    placeholder="DSN..."
                /></template>
              </el-table-column>
              <el-table-column label="目标类型" width="126">
                <template #default="{ row }"
                  ><el-select v-model="row.target_type" size="small"
                    ><el-option label="课程" value="course" /><el-option
                      label="章节"
                      value="chapter" /><el-option
                      label="课时"
                      value="hour" /></el-select
                ></template>
              </el-table-column>
              <el-table-column label="目标 ID" width="132">
                <template #default="{ row }"
                  ><el-input-number
                    v-model="row.target_id"
                    size="small"
                    :min="1"
                    controls-position="right"
                /></template>
              </el-table-column>
              <el-table-column label="状态" width="112">
                <template #default="{ row }"
                  ><el-select v-model="row.status" size="small"
                    ><el-option label="确认" value="confirmed" /><el-option
                      label="建议"
                      value="suggested" /><el-option
                      label="拒绝"
                      value="rejected" /></el-select
                ></template>
              </el-table-column>
              <el-table-column label="操作" width="78">
                <template #default="{ $index }"
                  ><el-button
                    link
                    type="danger"
                    @click="mappingRows.splice($index, 1)"
                    >移除</el-button
                  ></template
                >
              </el-table-column>
            </el-table>
          </section>

          <section
            class="workflow-section"
            :class="{ 'is-disabled': !binding }"
          >
            <div class="workflow-section__header">
              <div>
                <h3>影响预览</h3>
                <p>预览通过后才会原子切换为生效绑定。</p>
              </div>
              <div class="workflow-section__actions">
                <el-button
                  :icon="Refresh"
                  :loading="bindingBusy"
                  :disabled="!binding"
                  @click="loadBindingPreview"
                  >预览影响</el-button
                >
                <el-button
                  type="primary"
                  :icon="Check"
                  :loading="bindingBusy"
                  :disabled="!canActivateBinding"
                  @click="activateBinding"
                  >激活绑定</el-button
                >
              </div>
            </div>
            <div v-if="bindingPreview" class="preview-metrics">
              <div>
                <span>新增可见</span
                ><strong>{{
                  bindingPreview.added_visible_resources || 0
                }}</strong>
              </div>
              <div>
                <span>移除可见</span
                ><strong>{{
                  bindingPreview.removed_visible_resources || 0
                }}</strong>
              </div>
              <div>
                <span>受影响学生</span
                ><strong>{{ bindingPreview.affected_students || 0 }}</strong>
              </div>
              <div :class="{ 'is-warning': bindingPreview.unmapped_resources }">
                <span>未映射资源</span
                ><strong>{{ bindingPreview.unmapped_resources || 0 }}</strong>
              </div>
              <div :class="{ 'is-warning': bindingPreview.invalid_recipients }">
                <span>无效学生</span
                ><strong>{{ bindingPreview.invalid_recipients || 0 }}</strong>
              </div>
              <div
                :class="{
                  'is-warning':
                    bindingPreview.catalog_changed ||
                    bindingPreview.curriculum_changed
                }"
              >
                <span>结构变更</span
                ><strong>{{
                  bindingPreview.catalog_changed ||
                  bindingPreview.curriculum_changed
                    ? "需刷新"
                    : "无"
                }}</strong>
              </div>
            </div>
            <div v-else class="quiet-state">
              <el-icon><Connection /></el-icon>保存映射后查看影响预览
            </div>
          </section>
        </div>
      </el-tab-pane>

      <el-tab-pane label="审核发布" name="publish">
        <div class="demo-resource-manager__pane">
          <section class="workflow-section">
            <div class="workflow-section__header">
              <div>
                <h3>审核并发布版本</h3>
                <p>发布前要求当前课程已有生效绑定。</p>
              </div>
            </div>
            <div class="publication-form">
              <el-input
                v-model="publicationForm.revisionId"
                placeholder="资源修订 ID，例如 DRR..."
              />
              <el-input
                v-model="publicationForm.variantCodes"
                placeholder="版本，例如 A,B,C"
              />
              <el-select v-model="publicationForm.audienceMode"
                ><el-option
                  label="全体已选课学生"
                  value="all_enrolled" /><el-option
                  label="指定学生"
                  value="selected"
              /></el-select>
              <el-input
                v-model="publicationForm.comment"
                placeholder="审核备注（可选）"
              />
              <el-button
                type="primary"
                :loading="publicationBusy"
                :disabled="!bindingActive"
                @click="publishRevision"
                >审核并发布</el-button
              >
            </div>
            <div v-if="publicationIds.length" class="publication-list">
              <span>本次会话发布：</span
              ><code v-for="id in publicationIds" :key="id">{{ id }}</code>
            </div>
          </section>

          <section class="workflow-section">
            <div class="workflow-section__header">
              <div>
                <h3>学生版本分配</h3>
                <p>空版本表示明确不给该学生分配该资源。</p>
              </div>
            </div>
            <div class="assignment-form">
              <el-input
                v-model="assignmentForm.resourceSetId"
                placeholder="逻辑资源 ID，例如 DRS..."
              />
              <el-input
                v-model="assignmentForm.studentIds"
                placeholder="学生 ID，多个用逗号分隔"
              />
              <el-input
                v-model="assignmentForm.variantCodes"
                placeholder="可见版本，例如 A 或 B,C；留空表示 0 个版本"
              />
              <el-input-number
                v-model="assignmentForm.assignmentVersion"
                :min="0"
                controls-position="right"
              />
              <el-button
                type="primary"
                :loading="publicationBusy"
                @click="saveAssignments"
                >保存分配</el-button
              >
            </div>
          </section>

          <section class="workflow-section workflow-section--compact">
            <div class="workflow-section__header">
              <div><h3>撤回发布</h3></div>
            </div>
            <div class="withdrawal-form">
              <el-input
                v-model="withdrawalForm.publicationIds"
                placeholder="发布 ID，多个用逗号分隔"
              />
              <el-button
                type="danger"
                plain
                :loading="publicationBusy"
                @click="withdrawPublications"
                >撤回</el-button
              >
            </div>
          </section>
        </div>
      </el-tab-pane>
    </el-tabs>
  </section>
</template>

<style scoped>
.demo-resource-manager {
  --demo-border: var(--el-border-color, #dbe3ed);
  --demo-surface: var(--el-bg-color, #fff);
  --demo-card: #fbfcfe;
  --demo-card-border: #d8e1ec;
  --demo-muted: var(--el-text-color-secondary, #607087);
  --demo-ink: var(--el-text-color-primary, #1d2b3c);
  --demo-primary: var(--el-color-primary, #2466bc);
  --demo-inline-space: 28px;

  display: flex;
  width: 100%;
  min-height: 0;
  min-width: 0;
  max-width: 100%;
  height: 100%;
  flex-direction: column;
  overflow: hidden;
  color: var(--demo-ink);
  background: transparent;
  border: 1px solid var(--demo-border);
  border-radius: 12px;
  box-shadow: 0 10px 26px rgb(51 65 85 / 7%);
}

.demo-resource-manager__header,
.workflow-section__header,
.workflow-section__actions,
.upload-form,
.parse-controls,
.binding-form,
.publication-form,
.assignment-form,
.withdrawal-form,
.id-strip,
.publication-list,
.attempt-live-status__meta,
.binding-target-strip {
  display: flex;
  align-items: center;
}

.demo-resource-manager__header {
  flex: 0 0 auto;
  justify-content: space-between;
  gap: 16px;
  min-height: 70px;
  padding: 14px var(--demo-inline-space);
  background: rgb(255 255 255 / 78%);
  border-bottom: 1px solid var(--demo-border);
  backdrop-filter: blur(18px) saturate(120%);
  -webkit-backdrop-filter: blur(18px) saturate(120%);
}

.demo-resource-manager__header > div {
  min-width: 0;
}

.demo-resource-manager__header > .el-button {
  flex: 0 0 auto;
}

.demo-resource-manager__header h2,
.demo-resource-manager__header p,
.workflow-section h3,
.workflow-section p {
  margin: 0;
}

.demo-resource-manager__header h2 {
  font-size: 1.125rem;
  font-weight: 700;
}

.demo-resource-manager__header p,
.workflow-section__header p {
  margin-top: 4px;
  color: var(--demo-muted);
  font-size: 0.75rem;
  line-height: 1.45;
}

.demo-resource-manager__tabs {
  display: flex;
  width: 100%;
  min-height: 0;
  min-width: 0;
  max-width: 100%;
  flex: 1;
  flex-direction: column;
  padding: 0 var(--demo-inline-space);
}

.demo-resource-manager__tabs :deep(.el-tabs__header) {
  flex: 0 0 auto;
  margin: 0;
}

.demo-resource-manager__tabs :deep(.el-tabs__content),
.demo-resource-manager__tabs :deep(.el-tab-pane) {
  width: 100%;
  min-height: 0;
  min-width: 0;
  max-width: 100%;
  height: 100%;
  overflow: hidden;
}

.demo-resource-manager__pane {
  display: grid;
  width: 100%;
  gap: 14px;
  min-height: 0;
  min-width: 0;
  max-width: 100%;
  height: 100%;
  padding: 18px 0 28px;
  overflow-x: hidden;
  overflow-y: auto;
}

.workflow-section {
  width: 100%;
  min-width: 0;
  max-width: 100%;
  padding: 16px;
  background: var(--demo-card);
  border: 1px solid var(--demo-card-border);
  border-radius: 8px;
  box-shadow:
    0 7px 18px rgb(51 65 85 / 6%),
    inset 0 1px 0 rgb(255 255 255 / 90%);
}

.workflow-section.is-disabled {
  opacity: 0.62;
}

.workflow-section--compact {
  padding-block: 14px;
}

.workflow-section__header {
  min-width: 0;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 14px;
}

.workflow-section__header > div:first-child {
  min-width: 0;
  flex: 1 1 260px;
}

.workflow-section__header > :is(.el-button, .el-tag) {
  flex: 0 0 auto;
  max-width: 100%;
}

.workflow-section h3 {
  font-size: 0.9375rem;
  font-weight: 700;
}

.workflow-section__actions {
  min-width: 0;
  flex: 0 1 auto;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
}

.upload-form,
.parse-controls,
.binding-form,
.publication-form,
.assignment-form,
.withdrawal-form {
  width: 100%;
  min-width: 0;
  max-width: 100%;
  flex-wrap: wrap;
  gap: 10px;
}

.upload-form > :is(.el-input, .el-upload),
.publication-form > .el-input,
.assignment-form > .el-input,
.withdrawal-form > .el-input {
  flex: 1 1 220px;
  min-width: 0;
}

.parse-controls > .el-select {
  width: 150px;
}

.parse-controls__config {
  min-width: 0;
  flex: 1 1 260px;
}

.upload-progress {
  margin-top: 16px;
}

.upload-template-link {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 10px;
  align-items: center;
  margin-top: 11px;
  color: var(--demo-muted);
  font-size: 0.75rem;
}

.attempt-live-status {
  padding: 12px;
  margin-top: 12px;
  background: #f6f9fd;
  border: 1px solid #dce6f2;
  border-radius: 6px;
}

.attempt-live-status__meta {
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
  color: #40556e;
  font-size: 0.75rem;
}

.attempt-live-status__meta span:last-child {
  color: var(--demo-muted);
  text-align: right;
}

.attempt-live-status p {
  margin-top: 7px;
  color: #9a5b08;
  font-size: 0.75rem;
}

.attempt-error {
  margin-top: 12px;
}

.attempt-table-progress > div {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 5px;
  color: #40556e;
  font-size: 0.75rem;
}

.attempt-table-progress small {
  display: block;
  margin-top: 4px;
  color: var(--demo-muted);
  font-size: 0.6875rem;
}

.catalog-course-summary {
  margin-bottom: 10px;
  color: #40556e;
  font-size: 0.8125rem;
}

.catalog-course-summary strong {
  color: var(--demo-ink);
}

.binding-validation {
  display: flex;
  flex-wrap: wrap;
  gap: 5px 14px;
  margin-top: 10px;
  color: #9a5b08;
  font-size: 0.75rem;
}

.catalog-course-id {
  color: #254b78;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.75rem;
}

.demo-resource-manager
  :deep(.el-table__body tr.is-selected-catalog-course > td.el-table__cell) {
  background: #edf5ff;
}

.binding-target-strip {
  min-width: 0;
  flex-wrap: wrap;
  gap: 7px;
  padding: 9px 11px;
  margin-top: 12px;
  color: var(--demo-muted);
  font-size: 0.75rem;
  background: #f6f8fb;
  border: 1px solid var(--demo-border);
  border-radius: 6px;
}

.binding-target-strip strong {
  color: var(--demo-ink);
  font-weight: 600;
}

.binding-form {
  justify-content: flex-end;
  margin-top: 12px;
}

.binding-form > .el-select {
  width: 220px;
  max-width: 100%;
}

.demo-resource-manager :deep(.el-table) {
  width: 100% !important;
  min-width: 0;
  max-width: 100%;
}

.demo-resource-manager :deep(.el-table__inner-wrapper) {
  min-width: 0;
  max-width: 100%;
}

.id-strip,
.publication-list {
  flex-wrap: wrap;
  gap: 6px 9px;
  margin-top: 14px;
  color: var(--demo-muted);
  font-size: 0.75rem;
}

.id-strip code,
.publication-list code {
  max-width: 260px;
  overflow: hidden;
  color: #254b78;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.parse-result {
  margin-top: 12px;
}

.parse-result pre {
  max-height: 220px;
  padding: 10px;
  margin: 0;
  overflow: auto;
  color: #31445d;
  font-size: 0.75rem;
  line-height: 1.5;
  background: #f6f8fb;
  border: 1px solid var(--demo-border);
  border-radius: 6px;
}

.preview-metrics {
  display: grid;
  grid-template-columns: repeat(6, minmax(110px, 1fr));
  gap: 10px;
}

.preview-metrics > div {
  min-width: 0;
  padding: 10px;
  background: #f7f9fc;
  border: 1px solid #e4ebf3;
  border-radius: 6px;
}

.preview-metrics span,
.preview-metrics strong {
  display: block;
}

.preview-metrics span {
  color: var(--demo-muted);
  font-size: 0.6875rem;
}

.preview-metrics strong {
  margin-top: 5px;
  font-size: 1rem;
}

.preview-metrics .is-warning strong {
  color: #b45309;
}

.quiet-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 88px;
  gap: 8px;
  color: var(--demo-muted);
  font-size: 0.8125rem;
  background: #f8fafc;
  border: 1px dashed var(--demo-border);
  border-radius: 6px;
}

@media (max-width: 900px) {
  .demo-resource-manager__tabs {
    padding-inline: 16px;
  }

  .demo-resource-manager__header {
    padding-inline: 16px;
  }

  .workflow-section__header {
    align-items: flex-start;
    flex-direction: column;
  }

  .preview-metrics {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .attempt-live-status__meta {
    align-items: flex-start;
    flex-direction: column;
  }

  .attempt-live-status__meta span:last-child {
    text-align: left;
  }

  .binding-form {
    justify-content: flex-start;
  }
}
</style>
