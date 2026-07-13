<script setup lang="ts">
import {
  computed,
  defineComponent,
  h,
  nextTick,
  onUnmounted,
  ref,
  watch
} from "vue";
import { useRoute, useRouter } from "vue-router";
import MarkdownIt from "markdown-it";
import { ElMessage } from "element-plus";
import {
  ArrowLeft,
  ArrowRight,
  CircleCheck,
  Close,
  Connection,
  ChatDotRound,
  Document,
  DocumentAdd,
  FolderOpened,
  Headset,
  Link,
  Loading,
  MagicStick,
  Picture,
  Promotion,
  Refresh,
  Search,
  VideoPlay,
  WarningFilled
} from "@element-plus/icons-vue";
import {
  getFrontendCourseList,
  getCourseDetail,
  type CourseDetailResult,
  type CourseListResult
} from "@/api/frontend/course";
import {
  assistantApiErrorMessage,
  createAssistantConversation,
  getAssistantConversationMessages,
  getAssistantConversationsByCourse,
  getAssistantResource,
  listAssistantResources,
  reportAssistantResourceUsage,
  streamAssistantChat,
  uploadAssistantDocumentAttachment,
  type AssistantChatStreamEvent,
  type AssistantConversationMessageItem,
  type AssistantResourceSummary
} from "@/api/frontend/assistant";

defineOptions({ name: "StudentResourceWorkbench" });

const props = withDefaults(
  defineProps<{
    courseId?: number;
    embedded?: boolean;
    fixedViewport?: boolean;
  }>(),
  { embedded: false, fixedViewport: false }
);

type ResourceSource = "assistant" | "demo_import";
type PreviewKind =
  | "html"
  | "markdown"
  | "mindmap"
  | "json"
  | "video"
  | "audio"
  | "image"
  | "pdf"
  | "file";

type StudentResource = {
  resourceKey: string;
  source: ResourceSource;
  title: string;
  resourceType: string;
  fileUrl?: string;
  chapterId?: number;
  chapterName?: string;
  duration?: number;
  completed?: boolean;
  resourceId?: string;
  previewUrl?: string;
  downloadUrl?: string;
  contentFormat?: string;
  contentBody?: string;
  summary?: string;
  recommendation?: string;
  status?: string;
  storageStatus?: string;
  storageError?: string;
  reviewStatus?: string;
  versionNo?: number;
  safetyStatus?: string;
  safetySummary?: string;
  htmlAnimationStatus?: string;
  htmlAnimationMessage?: string;
  htmlAnimationError?: string;
  updatedAt?: string;
  qualityScore?: number;
  sourceKind?: string;
  variantCode?: string;
  variantLabel?: string;
  scopeLevel?: string;
  resourceSetId?: string;
  revisionId?: string;
  previewPdfUrl?: string | null;
};

type TutorMessage = {
  id: string;
  role: "student" | "assistant";
  content: string;
  streaming?: boolean;
  error?: boolean;
};

type TutorQuote = {
  id: string;
  text: string;
};

type MindMapNode = {
  id: string;
  title: string;
  children: MindMapNode[];
};

const route = useRoute();
const router = useRouter();

const markdownRenderer = new MarkdownIt({
  html: false,
  linkify: true,
  breaks: true,
  typographer: true
});
const defaultLinkOpenRenderer =
  markdownRenderer.renderer.rules.link_open ||
  ((tokens, index, options, _env, self) =>
    self.renderToken(tokens, index, options));
markdownRenderer.renderer.rules.link_open = (
  tokens,
  index,
  options,
  env,
  self
) => {
  const token = tokens[index];
  const href = token.attrGet("href") || "";
  if (/^https?:\/\//i.test(href)) {
    token.attrSet("target", "_blank");
    token.attrSet("rel", "noopener noreferrer");
  }
  return defaultLinkOpenRenderer(tokens, index, options, env, self);
};

const MindMapNodeView = defineComponent({
  name: "MindMapNodeView",
  props: {
    node: {
      type: Object as () => MindMapNode,
      required: true
    }
  },
  setup(props) {
    return () =>
      h("li", { class: "mind-map__branch" }, [
        h("span", { class: "mind-map__node" }, props.node.title),
        props.node.children.length
          ? h(
              "ul",
              { class: "mind-map__children" },
              props.node.children.map(child =>
                h(MindMapNodeView, { key: child.id, node: child })
              )
            )
          : null
      ]);
  }
});

const acceptedDocumentTypes: Record<string, string> = {
  pdf: "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  txt: "text/plain"
};

const courseLoading = ref(false);
const resourceLoading = ref(false);
const courseError = ref("");
const resourceError = ref("");
const courseOptions = ref<CourseListResult["list"]>([]);
const selectedCourseId = ref<number | undefined>(
  Number(props.courseId) || undefined
);
const courseDetail = ref<CourseDetailResult | null>(null);
const assistantResources = ref<AssistantResourceSummary[]>([]);
const demoResources = ref<AssistantResourceSummary[]>([]);
const resourceSearch = ref("");
const activeResourceKey = ref("");

const previewLoading = ref(false);
const previewError = ref("");
const resourceDetailLoading = ref(false);
const markdownHtml = ref("");
const mindMap = ref<MindMapNode | null>(null);
const mindMapImageUrl = ref("");
const jsonPreview = ref("");

const tutorQuestion = ref("");
const tutorQuotes = ref<TutorQuote[]>([]);
const tutorMessages = ref<TutorMessage[]>([]);
const markdownPreviewRef = ref<HTMLElement | null>(null);
const tutorQuestionInput = ref<{ focus: () => void } | null>(null);
const quoteAction = ref<{
  text: string;
  left: number;
  top: number;
} | null>(null);
const tutorConversationId = ref("");
const tutorHistoryLoading = ref(false);
const tutorStreaming = ref(false);
const tutorAttachment = ref<File | null>(null);
const tutorFileInput = ref<HTMLInputElement | null>(null);
const uploadedResourceAttachments = new Map<string, string>();
let cancelTutorStream: (() => void) | undefined;
let tutorSessionVersion = 0;
let resourceRequestVersion = 0;
let previewRequestVersion = 0;
let resourceDetailRequestVersion = 0;

const tutorConversationStoragePrefix = "student-resource-tutor-conversation";

const routeCourseId = computed(() => {
  const value = route.query.courseId || route.query.course_id;
  const normalized = Array.isArray(value) ? value[0] : value;
  const courseId = Number(normalized);
  return Number.isFinite(courseId) && courseId > 0 ? courseId : undefined;
});

const courseResources = computed<StudentResource[]>(() => {
  const allResources = [
    ...assistantResources.value.map(resource => ({
      resource,
      source: "assistant" as const
    })),
    ...demoResources.value.map(resource => ({
      resource,
      source: "demo_import" as const
    }))
  ];
  return allResources.map(({ resource, source }) => ({
    resourceKey: `${source}:${resource.resource_id}`,
    source,
    title: resource.title || "个性化学习资源",
    resourceType: resource.resource_type || "",
    fileUrl:
      resource.preview_pdf_url ||
      resource.preview_url ||
      resource.download_url ||
      undefined,
    resourceId: resource.resource_id,
    previewUrl: resource.preview_url,
    downloadUrl: resource.download_url,
    contentFormat: resource.content_format,
    contentBody: resource.content_body,
    summary: resource.summary || resource.description,
    recommendation: resource.recommendation,
    status: resource.status,
    storageStatus: resource.storage_status,
    storageError: resource.storage_error,
    reviewStatus: resource.review_status,
    versionNo: resource.version_no,
    safetyStatus: resource.safety_status,
    safetySummary: resource.safety_summary,
    htmlAnimationStatus: resource.html_animation_status,
    htmlAnimationMessage: resource.html_animation_message,
    htmlAnimationError: resource.html_animation_error,
    updatedAt: resource.updated_at,
    qualityScore: resource.quality_score,
    sourceKind: resource.source_kind,
    variantCode: resource.variant_code,
    variantLabel: resource.variant_label,
    scopeLevel: resource.scope_level,
    resourceSetId: resource.resource_set_id,
    revisionId: resource.revision_id,
    previewPdfUrl: resource.preview_pdf_url
  }));
});

const activeResource = computed(() =>
  courseResources.value.find(
    item => item.resourceKey === activeResourceKey.value
  )
);

const visibleResources = computed(() => {
  const keyword = resourceSearch.value.trim().toLowerCase();
  return [...courseResources.value]
    .filter(resource => {
      if (!keyword) return true;
      return [
        resource.title,
        resource.chapterName,
        resourceTypeLabel(resource),
        resourceSourceLabel(resource),
        resource.summary,
        resource.recommendation
      ]
        .filter(Boolean)
        .some(value => String(value).toLowerCase().includes(keyword));
    })
    .sort((left, right) =>
      String(right.updatedAt || "").localeCompare(String(left.updatedAt || ""))
    );
});

const activePreviewKind = computed<PreviewKind>(() =>
  getPreviewKind(activeResource.value)
);
const activePreviewLabel = computed(() =>
  previewKindLabel(activePreviewKind.value)
);
const activeResourceIsUploaded = computed(() =>
  activeResource.value
    ? uploadedResourceAttachments.has(activeResource.value.resourceKey)
    : false
);
const tutorAttachmentName = computed(() => tutorAttachment.value?.name || "");
const selectedCourseName = computed(
  () =>
    courseDetail.value?.courseName ||
    courseOptions.value.find(
      course => course.courseId === selectedCourseId.value
    )?.courseName ||
    "当前课程"
);

function normalizeResourceType(resource?: StudentResource) {
  return `${resource?.resourceType || ""} ${resource?.title || ""} ${
    resource?.fileUrl || ""
  }`
    .toLowerCase()
    .trim();
}

function getFileExtension(resource?: StudentResource) {
  const source = `${resource?.fileUrl || resource?.title || ""}`.split("?")[0];
  return (source.split(".").pop() || "").toLowerCase();
}

function getUrlExtension(url?: string) {
  const source = String(url || "").split(/[?#]/)[0];
  return (source.split(".").pop() || "").toLowerCase();
}

function resourceUploadUrl(resource: StudentResource) {
  const candidates = [resource.downloadUrl, resource.fileUrl].filter(
    Boolean
  ) as string[];
  const supportedExtensions = new Set([
    ...Object.keys(acceptedDocumentTypes),
    "html",
    "htm",
    "md",
    "markdown",
    "json",
    "mmd"
  ]);
  const supported = candidates.find(url =>
    supportedExtensions.has(getUrlExtension(url))
  );
  if (supported) return supported;
  const format = String(resource.contentFormat || "").toLowerCase();
  return ["html", "markdown", "md", "text", "txt", "json", "mermaid"].includes(
    format
  )
    ? candidates[0] || ""
    : "";
}

function getPreviewKind(resource?: StudentResource): PreviewKind {
  const type = normalizeResourceType(resource);
  const extension = getFileExtension(resource);
  const format = String(resource?.contentFormat || "").toLowerCase();
  const isMindMap = /(mind[_\s-]*map|思维导图)/.test(type);
  if (isMindMap || format === "mermaid") return "mindmap";
  if (format === "json") return "json";
  if (format === "html") return "html";
  if (["markdown", "md", "text", "txt"].includes(format)) {
    return "markdown";
  }
  if (extension === "json") return isMindMap ? "mindmap" : "json";
  if (["html", "htm"].includes(extension) || /\bhtml\b/.test(type)) {
    return "html";
  }
  if (["md", "markdown", "txt"].includes(extension) || /markdown/.test(type)) {
    return "markdown";
  }
  if (/(video|mp4|mov|avi|mkv|webm)/.test(type)) return "video";
  if (/(audio|mp3|wav|aac|ogg)/.test(type)) return "audio";
  if (/(image|jpg|jpeg|png|webp|gif|svg)/.test(type)) return "image";
  if (/(pdf)/.test(type)) return "pdf";
  return "file";
}

function previewKindLabel(kind: PreviewKind) {
  const labels: Record<PreviewKind, string> = {
    html: "HTML 交互资料",
    markdown: "Markdown 讲义",
    mindmap: "思维导图",
    json: "JSON 结构化内容",
    video: "视频资料",
    audio: "音频资料",
    image: "图片资料",
    pdf: "PDF 文档",
    file: "课程文件"
  };
  return labels[kind];
}

function resourceTypeLabel(resource: StudentResource) {
  const labels: Record<string, string> = {
    explanation_doc: "讲解文档",
    mind_map: "思维导图",
    courseware_ppt: "课程课件",
    exercise_set: "练习题集",
    extended_reading: "拓展阅读",
    html_animation: "HTML 动画",
    coding_practice_case: "编程案例",
    video: "视频资源",
    animation: "互动动画",
    html: "HTML 资源",
    code: "代码资源",
    document: "学习文档"
  };
  return (
    labels[resource.resourceType] || previewKindLabel(getPreviewKind(resource))
  );
}

function resourceSourceLabel(resource: StudentResource) {
  return resource.source === "demo_import" ? "教师发布" : "个性化推荐";
}

function resourceIcon(resource: StudentResource) {
  const kind = getPreviewKind(resource);
  if (kind === "video") return VideoPlay;
  if (kind === "audio") return Headset;
  if (kind === "image") return Picture;
  if (kind === "mindmap") return Connection;
  if (kind === "html") return MagicStick;
  return Document;
}

function formatDuration(duration?: number) {
  const seconds = Number(duration || 0);
  if (!seconds) return "";
  if (seconds < 60) return `${seconds} 秒`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} 分钟`;
  return `${Math.floor(minutes / 60)} 小时 ${minutes % 60 ? `${minutes % 60} 分钟` : ""}`;
}

function resourceStatusLabel(status?: string) {
  const labels: Record<string, string> = {
    published: "已发布",
    approved: "已审核",
    ready: "可学习",
    completed: "已生成",
    completed_with_warnings: "可用",
    safe: "安全",
    degraded: "部分可用",
    processing: "生成中",
    pending: "等待处理",
    failed: "生成失败",
    blocked: "暂不可用",
    draft: "待发布",
    review_pending: "待审核",
    needs_teacher_review: "待教师审核"
  };
  return labels[String(status || "")] || "可学习";
}

function resourceStatusIcon(status?: string) {
  return resourceStatusIsWarning(status) ? WarningFilled : CircleCheck;
}

function resourceStatusIsWarning(status?: string) {
  return ["failed", "blocked", "degraded"].includes(String(status || ""));
}

function resourceTagType(status?: string) {
  const normalized = String(status || "").toLowerCase();
  if (["failed", "blocked"].includes(normalized)) return "danger";
  if (
    [
      "degraded",
      "processing",
      "pending",
      "review_pending",
      "needs_teacher_review"
    ].includes(normalized)
  ) {
    return "warning";
  }
  if (
    [
      "published",
      "approved",
      "ready",
      "completed",
      "completed_with_warnings",
      "safe"
    ].includes(normalized)
  ) {
    return "success";
  }
  return "info";
}

function resourceFormatLabel(resource: StudentResource) {
  const format = String(resource.contentFormat || "").toLowerCase();
  const labels: Record<string, string> = {
    html: "HTML",
    htm: "HTML",
    markdown: "Markdown",
    md: "Markdown",
    mermaid: "Mermaid",
    mind_map: "思维导图",
    json: "JSON",
    pdf: "PDF",
    video: "视频",
    audio: "音频",
    image: "图片"
  };
  return labels[format] || previewKindLabel(getPreviewKind(resource));
}

function resourceStateMessage(resource: StudentResource) {
  return (
    resource.htmlAnimationMessage ||
    resource.htmlAnimationError ||
    resource.storageError ||
    resource.safetySummary ||
    "资源存在处理中或降级状态"
  );
}

function formatQuality(score?: number) {
  if (score === undefined || score === null) return "";
  const normalized = score <= 1 ? score * 100 : score;
  return `${Math.round(normalized)}%`;
}

function renderMarkdown(content: string) {
  return markdownRenderer.render(content || "暂无可渲染内容。");
}

function mindMapTitle(value: unknown, fallback: string) {
  if (typeof value === "string" || typeof value === "number")
    return String(value);
  if (!value || typeof value !== "object") return fallback;
  const source = value as Record<string, unknown>;
  const candidate =
    source.title ??
    source.name ??
    source.text ??
    source.topic ??
    source.label ??
    source.content ??
    source.value;
  return typeof candidate === "string" || typeof candidate === "number"
    ? String(candidate)
    : fallback;
}

function mindMapChildren(value: unknown) {
  if (!value || typeof value !== "object") return [];
  const source = value as Record<string, unknown>;
  const children =
    source.children ?? source.nodes ?? source.items ?? source.branches ?? [];
  return Array.isArray(children) ? children : [];
}

function buildMindMapNode(
  value: unknown,
  fallback: string,
  path = "root"
): MindMapNode {
  return {
    id: path,
    title: mindMapTitle(value, fallback),
    children: mindMapChildren(value).map((child, index) =>
      buildMindMapNode(child, `主题 ${index + 1}`, `${path}-${index}`)
    )
  };
}

function normalizeMindMap(value: unknown): MindMapNode {
  if (Array.isArray(value)) {
    return buildMindMapNode({ title: "学习导图", children: value }, "学习导图");
  }
  const source = value as Record<string, unknown> | null;
  const root =
    source?.root ??
    source?.mindMap ??
    source?.mind_map ??
    source?.data ??
    source?.content ??
    source;
  return buildMindMapNode(root, "学习导图");
}

function stripCodeFence(content: string) {
  const trimmed = content.trim();
  const match = trimmed.match(
    /^```(?:json|mermaid|mindmap)?\s*([\s\S]*?)\s*```$/i
  );
  return match?.[1]?.trim() || trimmed;
}

function mermaidNodeTitle(line: string, fallback: string) {
  const cleaned = line.replace(/\s+%%.*$/, "").trim();
  const paired = cleaned.match(
    /^(?:[^\s()[\]{}]+\s*)?(?:\(\((.*?)\)\)|\[(.*?)\]|\{(.*?)\}|\((.*?)\))$/
  );
  const candidate = paired?.slice(1).find(Boolean) || cleaned;
  return String(candidate || fallback)
    .replace(/`/g, "")
    .trim();
}

function parseMermaidMindMap(content: string): MindMapNode {
  const lines = stripCodeFence(content)
    .split(/\r?\n/)
    .map(line => ({ raw: line, text: line.trim() }))
    .filter(item => item.text && !/^mindmap\s*$/i.test(item.text));
  const roots: MindMapNode[] = [];
  const stack: Array<{ indent: number; node: MindMapNode }> = [];

  lines.forEach((item, index) => {
    const indent = item.raw.match(/^\s*/)?.[0].replace(/\t/g, "  ").length || 0;
    const node: MindMapNode = {
      id: `mermaid-${index}`,
      title: mermaidNodeTitle(item.text, `主题 ${index + 1}`),
      children: []
    };
    while (stack.length && stack[stack.length - 1].indent >= indent) {
      stack.pop();
    }
    const parent = stack[stack.length - 1]?.node;
    if (parent) parent.children.push(node);
    else roots.push(node);
    stack.push({ indent, node });
  });

  if (roots.length === 1) return roots[0];
  return {
    id: "mermaid-root",
    title: "学习导图",
    children: roots
  };
}

function parseMermaidFlowchart(content: string) {
  const lines = stripCodeFence(content)
    .split(/\r?\n/)
    .map(line => line.replace(/\s+%%.*$/, "").trim())
    .filter(Boolean);
  const nodeMap = new Map<string, MindMapNode>();
  const edges: Array<[string, string]> = [];
  const ensureNode = (id: string, title = id) => {
    if (!nodeMap.has(id)) {
      nodeMap.set(id, { id, title, children: [] });
    } else if (title !== id) {
      nodeMap.get(id)!.title = title;
    }
  };

  lines.forEach(line => {
    if (/^(flowchart|graph)\b/i.test(line)) return;
    const declarations = line.matchAll(
      /([A-Za-z0-9_.:-]+)\s*(?:\[\s*["']?(.*?)["']?\s*\]|\(\(\s*(.*?)["']?\s*\)\)|\{\s*["']?(.*?)["']?\s*\})/g
    );
    for (const match of declarations) {
      ensureNode(
        match[1],
        String(match[2] || match[3] || match[4] || match[1]).trim()
      );
    }
    const edgeMatch = line.match(
      /^([A-Za-z0-9_.:-]+)\s*(?:-->|---|==>|-.+->)(?:\|[^|]*\|)?\s*([A-Za-z0-9_.:-]+)/
    );
    if (edgeMatch) {
      ensureNode(edgeMatch[1]);
      ensureNode(edgeMatch[2]);
      edges.push([edgeMatch[1], edgeMatch[2]]);
    }
  });

  if (!nodeMap.size || !edges.length) return null;
  const incoming = new Set(edges.map(([, target]) => target));
  edges.forEach(([source, target]) => {
    const parent = nodeMap.get(source);
    const child = nodeMap.get(target);
    if (
      parent &&
      child &&
      !parent.children.some(item => item.id === child.id)
    ) {
      parent.children.push(child);
    }
  });
  const root = [...nodeMap.values()].find(node => !incoming.has(node.id));
  return root || [...nodeMap.values()][0];
}

function normalizeTypedMindMap(value: unknown) {
  if (!value || typeof value !== "object") return null;
  const valueSource = value as Record<string, unknown>;
  const source =
    valueSource.schema_version || valueSource.nodes
      ? valueSource
      : valueSource.content && typeof valueSource.content === "object"
        ? (valueSource.content as Record<string, unknown>)
        : valueSource;
  const nodes = Array.isArray(source.nodes) ? source.nodes : [];
  const edges = Array.isArray(source.edges) ? source.edges : [];
  if (!nodes.length || !edges.length) return null;

  const nodeMap = new Map<string, unknown>();
  nodes.forEach(node => {
    if (!node || typeof node !== "object") return;
    const record = node as Record<string, unknown>;
    const id = record.node_id ?? record.id;
    if (id !== undefined && id !== null) nodeMap.set(String(id), node);
  });
  if (!nodeMap.size) return null;

  const childMap = new Map<string, string[]>();
  const incoming = new Set<string>();
  edges.forEach(edge => {
    if (!edge || typeof edge !== "object") return;
    const record = edge as Record<string, unknown>;
    const parent = String(record.source ?? "");
    const child = String(record.target ?? "");
    if (!nodeMap.has(parent) || !nodeMap.has(child)) return;
    const children = childMap.get(parent) || [];
    children.push(child);
    childMap.set(parent, children);
    incoming.add(child);
  });

  const rootId = String(
    source.root_id || [...nodeMap.keys()].find(id => !incoming.has(id)) || ""
  );
  if (!rootId || !nodeMap.has(rootId)) return null;
  const visiting = new Set<string>();
  const build = (id: string, path: string): MindMapNode => {
    if (visiting.has(id)) {
      return { id: path, title: "已展开节点", children: [] };
    }
    visiting.add(id);
    const record = nodeMap.get(id) as Record<string, unknown>;
    const node = {
      id: path,
      title: mindMapTitle(record, id),
      children: (childMap.get(id) || []).map((child, index) =>
        build(child, `${path}-${index}`)
      )
    };
    visiting.delete(id);
    return node;
  };
  return build(rootId, "graph-root");
}

function parseMindMapContent(content: string) {
  const normalized = stripCodeFence(content);
  if (/^mindmap\b/i.test(normalized)) return parseMermaidMindMap(normalized);
  if (/^(flowchart|graph)\b/i.test(normalized)) {
    return parseMermaidFlowchart(normalized) || parseMermaidMindMap(normalized);
  }
  try {
    const parsed = JSON.parse(normalized);
    return normalizeTypedMindMap(parsed) || normalizeMindMap(parsed);
  } catch {
    return parseMermaidMindMap(normalized);
  }
}

function formatJsonPreview(content: string) {
  const normalized = stripCodeFence(content);
  try {
    return JSON.stringify(JSON.parse(normalized), null, 2);
  } catch {
    return normalized;
  }
}

async function loadCourses() {
  courseLoading.value = true;
  courseError.value = "";
  try {
    const { data } = await getFrontendCourseList({ pageNum: 1, pageSize: 100 });
    courseOptions.value = data.list || [];
    const requestedCourse = Number(props.courseId) || routeCourseId.value;
    const selected =
      courseOptions.value.find(course => course.courseId === requestedCourse) ||
      courseOptions.value[0];
    selectedCourseId.value = requestedCourse || selected?.courseId;
  } catch (error) {
    if (!props.courseId)
      courseError.value = "课程列表暂时无法加载，请稍后重试。";
    console.error("[StudentResourceWorkbench] 课程列表加载失败:", error);
  } finally {
    courseLoading.value = false;
  }
}

async function loadCourseResources(courseId?: number) {
  const requestId = ++resourceRequestVersion;
  courseDetail.value = null;
  assistantResources.value = [];
  demoResources.value = [];
  resourceError.value = "";
  activeResourceKey.value = "";
  if (!courseId) return;

  resourceLoading.value = true;
  try {
    const [assistantResult, demoResult, courseResult] = await Promise.allSettled([
      listAssistantResources({
        course_id: courseId,
        source_kind: "generated",
        page: 1,
        page_size: 100
      }),
      listAssistantResources({
        course_id: courseId,
        source_kind: "demo_import",
        page: 1,
        page_size: 100
      }),
      getCourseDetail({ courseId })
    ]);
    if (requestId !== resourceRequestVersion) return;
    assistantResources.value =
      assistantResult.status === "fulfilled"
        ? assistantResult.value.data.list || []
        : [];
    demoResources.value =
      demoResult.status === "fulfilled" ? demoResult.value.data.list || [] : [];
    courseDetail.value =
      courseResult.status === "fulfilled" ? courseResult.value.data : null;
    if (
      assistantResult.status === "rejected" &&
      demoResult.status === "rejected"
    ) {
      throw assistantResult.reason;
    }
  } catch (error) {
    if (requestId !== resourceRequestVersion) return;
    resourceError.value = "本课程的资源暂时无法加载，请稍后重试。";
    console.error("[StudentResourceWorkbench] 课程资源加载失败:", error);
  } finally {
    if (requestId === resourceRequestVersion) resourceLoading.value = false;
  }
}

function selectResource(resource: StudentResource) {
  activeResourceKey.value = resource.resourceKey;
  void loadResourceDetail(resource);
  if (resource.resourceId) {
    void reportAssistantResourceUsage({
      resource_id: resource.resourceId,
      course_id: selectedCourseId.value,
      event_type: "open",
      metadata: { ui_entry: "student_multimodal_resources" }
    });
  }
}

async function loadResourceDetail(resource: StudentResource) {
  if (!resource.resourceId) return;
  const requestId = ++resourceDetailRequestVersion;
  resourceDetailLoading.value = true;
  try {
    const { data } = await getAssistantResource(resource.resourceId, {
      course_id: selectedCourseId.value
    });
    const detail = data.resource;
    if (!detail || requestId !== resourceDetailRequestVersion) return;
    const mergeDetail = (items: AssistantResourceSummary[]) =>
      items.map(item =>
        item.resource_id === resource.resourceId ? { ...item, ...detail } : item
      );
    if (resource.source === "demo_import") {
      demoResources.value = mergeDetail(demoResources.value);
    } else {
      assistantResources.value = mergeDetail(assistantResources.value);
    }
  } catch (error) {
    // 列表摘要已经足够展示卡片，详情接口失败时保留当前资源继续学习。
    console.warn("[StudentResourceWorkbench] 资源详情加载失败:", error);
  } finally {
    if (requestId === resourceDetailRequestVersion) {
      resourceDetailLoading.value = false;
    }
  }
}

function closeResourceDetail() {
  activeResourceKey.value = "";
}

function updateCourseRoute(courseId?: number) {
  router.replace({
    query: courseId
      ? { ...route.query, courseId: String(courseId) }
      : route.query
  });
}

function isTextPreview(kind: PreviewKind) {
  return kind === "markdown" || kind === "mindmap" || kind === "json";
}

async function loadPreview(resource?: StudentResource) {
  const requestId = ++previewRequestVersion;
  markdownHtml.value = "";
  mindMap.value = null;
  mindMapImageUrl.value = "";
  jsonPreview.value = "";
  previewError.value = "";
  if (!resource || !isTextPreview(getPreviewKind(resource))) {
    previewLoading.value = false;
    return;
  }

  previewLoading.value = true;
  try {
    let content = resource.contentBody || "";
    if (
      !content &&
      getPreviewKind(resource) === "mindmap" &&
      /\.(svg|png|jpe?g|webp|gif)(?:[?#]|$)/i.test(resource.fileUrl || "")
    ) {
      mindMapImageUrl.value = resource.fileUrl || "";
      return;
    }
    if (!content) {
      if (!resource.fileUrl) throw new Error("资源暂无预览地址");
      const response = await fetch(resource.fileUrl, { cache: "no-store" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      if (
        getPreviewKind(resource) === "mindmap" &&
        response.headers.get("content-type")?.startsWith("image/")
      ) {
        mindMapImageUrl.value = resource.fileUrl;
        return;
      }
      const contentLength = Number(response.headers.get("content-length") || 0);
      if (contentLength > 2 * 1024 * 1024) {
        throw new Error("资源体积超过内嵌预览上限");
      }
      content = await response.text();
    }
    if (requestId !== previewRequestVersion) return;
    if (content.length > 2 * 1024 * 1024) {
      throw new Error("资源体积超过内嵌预览上限");
    }
    if (getPreviewKind(resource) === "markdown") {
      markdownHtml.value = renderMarkdown(content);
    } else if (getPreviewKind(resource) === "mindmap") {
      mindMap.value = parseMindMapContent(content);
    } else {
      jsonPreview.value = formatJsonPreview(content);
    }
  } catch (error) {
    if (requestId !== previewRequestVersion) return;
    previewError.value = "暂时无法读取该文件内容，可在新窗口中打开查看。";
    console.error("[StudentResourceWorkbench] 资源内嵌预览失败:", error);
  } finally {
    if (requestId === previewRequestVersion) previewLoading.value = false;
  }
}

function openActiveResource() {
  if (!activeResource.value?.fileUrl) {
    ElMessage.warning("该资源暂未提供访问地址");
    return;
  }
  const opened = window.open(
    activeResource.value.fileUrl,
    "_blank",
    "noopener,noreferrer"
  );
  if (!opened) ElMessage.warning("浏览器阻止了新窗口，请允许后重试");
}

function getAttachmentExtension(file: File) {
  return (file.name.split(".").pop() || "").toLowerCase();
}

function validateTutorFile(file: File) {
  const extension = getAttachmentExtension(file);
  if (!acceptedDocumentTypes[extension]) {
    return "仅支持 PDF、DOCX、TXT 文件";
  }
  if (file.size > 20 * 1024 * 1024) return "文件不能超过 20MB";
  return "";
}

function handleTutorFileChange(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  const error = validateTutorFile(file);
  if (error) {
    ElMessage.warning(error);
  } else {
    tutorAttachment.value = file;
  }
  input.value = "";
}

function clearTutorAttachment() {
  tutorAttachment.value = null;
}

function hideQuoteAction() {
  quoteAction.value = null;
}

function captureTextSelection() {
  const root = markdownPreviewRef.value;
  const selection = window.getSelection();
  if (!root || !selection || selection.isCollapsed || !selection.rangeCount) {
    hideQuoteAction();
    return;
  }

  const range = selection.getRangeAt(0);
  const container = range.commonAncestorContainer;
  const element =
    container.nodeType === Node.ELEMENT_NODE
      ? (container as Element)
      : container.parentElement;
  if (!element || !root.contains(element)) {
    hideQuoteAction();
    return;
  }

  const text = selection.toString().replace(/\s+/g, " ").trim();
  if (text.length < 2) {
    hideQuoteAction();
    return;
  }

  const rootRect = root.getBoundingClientRect();
  const anchorRect = range.getClientRects()[0] || range.getBoundingClientRect();
  const maxLeft = Math.max(42, root.clientWidth - 42);
  const left = Math.max(
    42,
    Math.min(
      maxLeft,
      anchorRect.left - rootRect.left + root.scrollLeft + anchorRect.width / 2
    )
  );
  const top = Math.max(8, anchorRect.top - rootRect.top + root.scrollTop - 42);

  quoteAction.value = {
    text: text.slice(0, 600),
    left,
    top
  };
}

function applyQuoteToTutor() {
  const selectedText = quoteAction.value?.text;
  if (!selectedText) return;
  const normalizedQuote = selectedText.replace(/\s+/g, " ").trim();
  const quote =
    normalizedQuote.length > 500
      ? `${normalizedQuote.slice(0, 500)}...`
      : normalizedQuote;
  if (!quote) return;
  if (!tutorQuotes.value.some(item => item.text === quote)) {
    tutorQuotes.value.push({
      id: `quote-${Date.now()}-${tutorQuotes.value.length}`,
      text: quote
    });
  }
  hideQuoteAction();
  window.getSelection()?.removeAllRanges();
  void nextTick(() => tutorQuestionInput.value?.focus());
}

function removeTutorQuote(quoteId: string) {
  tutorQuotes.value = tutorQuotes.value.filter(item => item.id !== quoteId);
}

function tutorConversationStorageKey(courseId: number, resourceKey: string) {
  return `${tutorConversationStoragePrefix}:${courseId}:${encodeURIComponent(resourceKey)}`;
}

function readStoredTutorConversationId(courseId: number, resourceKey: string) {
  if (typeof window === "undefined") return "";
  try {
    return (
      window.localStorage.getItem(
        tutorConversationStorageKey(courseId, resourceKey)
      ) || ""
    );
  } catch {
    return "";
  }
}

function rememberTutorConversationId(
  courseId: number | undefined,
  resourceKey: string,
  conversationId: string
) {
  if (typeof window === "undefined" || !courseId || !conversationId) return;
  try {
    window.localStorage.setItem(
      tutorConversationStorageKey(courseId, resourceKey),
      conversationId
    );
  } catch {
    // localStorage 受限时仍依赖服务端会话列表恢复。
  }
}

function clearStoredTutorConversationId(courseId: number, resourceKey: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(
      tutorConversationStorageKey(courseId, resourceKey)
    );
  } catch {
    // 忽略浏览器存储权限错误。
  }
}

function tutorIntroMessage(resource: StudentResource): TutorMessage {
  return {
    id: `intro-${resource.resourceKey}`,
    role: "assistant",
    content: `我会围绕《${resource.title}》进行辅导。可以让我解释概念、梳理结构，或出几道练习题。`
  };
}

function isTutorConversationForResource(
  conversation: { metadata?: Record<string, any> },
  resource: StudentResource
) {
  const metadata = conversation.metadata || {};
  return (
    metadata.ui_entry === "student_multimodal_resources" &&
    (metadata.resource_key === resource.resourceKey ||
      (resource.resourceId &&
        String(metadata.resource_id) === String(resource.resourceId)))
  );
}

function mapTutorHistoryMessage(
  message: AssistantConversationMessageItem,
  index: number
): TutorMessage | null {
  const role = message.role.toLowerCase();
  if (role !== "user" && role !== "student" && role !== "assistant") {
    return null;
  }
  const content = message.content_text?.trim();
  if (!content) return null;
  return {
    id: message.message_id || `history-${index}`,
    role: role === "user" || role === "student" ? "student" : "assistant",
    content
  };
}

async function restoreTutorConversation(resource?: StudentResource) {
  const courseId = selectedCourseId.value;
  const sessionVersion = tutorSessionVersion;
  if (!resource || !courseId) return;

  tutorHistoryLoading.value = true;
  try {
    let conversationId = readStoredTutorConversationId(
      courseId,
      resource.resourceKey
    );
    let history:
      | Awaited<ReturnType<typeof getAssistantConversationMessages>>
      | undefined;

    if (conversationId) {
      try {
        history = await getAssistantConversationMessages(conversationId);
      } catch {
        clearStoredTutorConversationId(courseId, resource.resourceKey);
        conversationId = "";
      }
    }

    if (!conversationId) {
      const { data } = await getAssistantConversationsByCourse({
        course_id: courseId
      });
      const matchingConversation = (data.list || []).find(item =>
        isTutorConversationForResource(item, resource)
      );
      conversationId = matchingConversation?.conversation_id || "";
      if (conversationId) {
        history = await getAssistantConversationMessages(conversationId);
      }
    }

    if (
      !conversationId ||
      !isTutorSessionCurrent(sessionVersion, resource.resourceKey)
    ) {
      return;
    }

    tutorConversationId.value = conversationId;
    rememberTutorConversationId(courseId, resource.resourceKey, conversationId);
    const messages = (history?.data.list || [])
      .map(mapTutorHistoryMessage)
      .filter((message): message is TutorMessage => Boolean(message));
    if (messages.length) {
      tutorMessages.value = [tutorIntroMessage(resource), ...messages];
    }
  } catch (error) {
    // 历史读取失败不影响当前资料继续提问，首次发送时仍会创建/继续会话。
    console.warn("[StudentResourceWorkbench] 学习辅导历史恢复失败:", error);
  } finally {
    if (isTutorSessionCurrent(sessionVersion, resource.resourceKey)) {
      tutorHistoryLoading.value = false;
    }
  }
}

function buildTutorQuestion(question: string, quotes: TutorQuote[]) {
  if (!quotes.length) return question;
  const quoteContext = quotes
    .map((quote, index) => `> [引用 ${index + 1}] ${quote.text}`)
    .join("\n\n");
  return [question, `请结合当前资料解释以下引用内容：\n\n${quoteContext}`]
    .filter(Boolean)
    .join("\n\n");
}

function isTutorSessionCurrent(version: number, resourceKey: string) {
  return (
    version === tutorSessionVersion &&
    activeResource.value?.resourceKey === resourceKey
  );
}

async function ensureTutorConversation(version: number, resourceKey: string) {
  if (!isTutorSessionCurrent(version, resourceKey)) return "";
  if (tutorConversationId.value) return tutorConversationId.value;
  if (!selectedCourseId.value) throw new Error("请先选择课程");
  const resource = activeResource.value;
  const { data } = await createAssistantConversation({
    course_id: selectedCourseId.value,
    chapter_id: resource?.chapterId,
    title: `${selectedCourseName.value} · ${resource?.title || "学习资料"}`,
    metadata: {
      ui_entry: "student_multimodal_resources",
      resource_key: resource?.resourceKey || "",
      resource_title: resource?.title || "",
      resource_type: resource?.resourceType || "",
      resource_id: resource?.resourceId || ""
    }
  });
  if (!isTutorSessionCurrent(version, resourceKey)) return "";
  const conversationId =
    data.conversation?.conversation_id || data.conversation_id;
  if (!conversationId) throw new Error("后端未返回学习辅导会话");
  tutorConversationId.value = conversationId;
  rememberTutorConversationId(
    selectedCourseId.value,
    resourceKey,
    conversationId
  );
  return conversationId;
}

function currentResourceCanUpload(resource?: StudentResource) {
  if (!resource) return false;
  if (resource.contentBody) return true;
  return Boolean(resourceUploadUrl(resource));
}

async function uploadCurrentResourceIfPossible(
  conversationId: string,
  resource: StudentResource,
  version: number
) {
  if (!isTutorSessionCurrent(version, resource.resourceKey)) return "";
  if (!resource || !currentResourceCanUpload(resource)) return "";
  const existing = uploadedResourceAttachments.get(resource.resourceKey);
  if (existing) return existing;

  const safeTitle =
    resource.title.replace(/[\\/:*?"<>|]/g, "_").trim() || "学习资源";
  let file: File;
  if (resource.contentBody) {
    file = new File([resource.contentBody], `${safeTitle}.txt`, {
      type: "text/plain"
    });
  } else {
    const uploadUrl = resourceUploadUrl(resource);
    if (!uploadUrl) return "";
    const response = await fetch(uploadUrl, { cache: "no-store" });
    if (!response.ok) throw new Error("当前资料读取失败");
    const blob = await response.blob();
    const extension = getUrlExtension(uploadUrl);
    if (acceptedDocumentTypes[extension]) {
      const fileName = resource.title.toLowerCase().endsWith(`.${extension}`)
        ? resource.title
        : `${safeTitle}.${extension}`;
      file = new File([blob], fileName, {
        type: acceptedDocumentTypes[extension] || blob.type
      });
    } else {
      file = new File([await blob.text()], `${safeTitle}.txt`, {
        type: "text/plain"
      });
    }
  }
  if (file.size > 20 * 1024 * 1024) {
    throw new Error("当前资料超过 20MB，无法加入问答");
  }
  const uploaded = await uploadAssistantDocumentAttachment(file, {
    scene: "assistant",
    course_id: selectedCourseId.value,
    conversation_id: conversationId,
    content_type: file.type
  });
  if (!isTutorSessionCurrent(version, resource.resourceKey)) return "";
  uploadedResourceAttachments.set(resource.resourceKey, uploaded.attachment_id);
  return uploaded.attachment_id;
}

async function uploadManualTutorFile(
  conversationId: string,
  version: number,
  resourceKey: string
) {
  if (!isTutorSessionCurrent(version, resourceKey)) return "";
  const file = tutorAttachment.value;
  if (!file) return "";
  const error = validateTutorFile(file);
  if (error) throw new Error(error);
  const uploaded = await uploadAssistantDocumentAttachment(file, {
    scene: "assistant",
    course_id: selectedCourseId.value,
    conversation_id: conversationId,
    content_type:
      acceptedDocumentTypes[getAttachmentExtension(file)] || file.type
  });
  if (!isTutorSessionCurrent(version, resourceKey)) return "";
  tutorAttachment.value = null;
  return uploaded.attachment_id;
}

function latestTutorAssistantMessage() {
  return [...tutorMessages.value]
    .reverse()
    .find(message => message.role === "assistant");
}

function completeTutorMessage(event: AssistantChatStreamEvent) {
  const message = latestTutorAssistantMessage();
  if (!message) return;
  message.content =
    event.content_text || message.content || "学习助手已完成回复。";
  message.streaming = false;
  tutorStreaming.value = false;
  cancelTutorStream = undefined;
}

function failTutorMessage(message: string) {
  const target = latestTutorAssistantMessage();
  if (target) {
    target.content = target.content || message;
    target.streaming = false;
    target.error = true;
  }
  tutorStreaming.value = false;
  cancelTutorStream = undefined;
}

async function sendTutorQuestion(question = tutorQuestion.value) {
  const questionText = question.trim();
  const quotes = [...tutorQuotes.value];
  const text = buildTutorQuestion(questionText, quotes);
  const resource = activeResource.value;
  if (!text || tutorStreaming.value || tutorHistoryLoading.value || !resource)
    return;
  const sessionVersion = tutorSessionVersion;
  const resourceKey = resource.resourceKey;

  tutorQuestion.value = "";
  tutorQuotes.value = [];
  tutorMessages.value.push({
    id: `student-${Date.now()}`,
    role: "student",
    content: questionText || `请解释我引用的 ${quotes.length} 段资料内容。`
  });
  const assistantMessage: TutorMessage = {
    id: `assistant-${Date.now()}`,
    role: "assistant",
    content: "",
    streaming: true
  };
  tutorMessages.value.push(assistantMessage);
  tutorStreaming.value = true;

  try {
    const conversationId = await ensureTutorConversation(
      sessionVersion,
      resourceKey
    );
    if (
      !conversationId ||
      !isTutorSessionCurrent(sessionVersion, resourceKey)
    ) {
      return;
    }
    const attachmentIds = [
      await uploadCurrentResourceIfPossible(
        conversationId,
        resource,
        sessionVersion
      ),
      await uploadManualTutorFile(conversationId, sessionVersion, resourceKey)
    ].filter(Boolean);
    if (!isTutorSessionCurrent(sessionVersion, resourceKey)) return;

    cancelTutorStream = streamAssistantChat(
      {
        conversation_id: conversationId,
        course_id: selectedCourseId.value,
        chapter_id: resource.chapterId,
        mode: "student",
        message: text,
        attachment_ids: attachmentIds,
        preferred_explanation_mode:
          getPreviewKind(resource) === "mindmap" ? "visual" : undefined,
        metadata: {
          ui_entry: "student_multimodal_resources",
          current_resource_title: resource.title,
          current_resource_type: resource.resourceType || "",
          current_resource_key: resource.resourceKey,
          current_resource_id: resource.resourceId || ""
        }
      },
      event => {
        if (!isTutorSessionCurrent(sessionVersion, resourceKey)) return;
        if (event.conversation_id)
          tutorConversationId.value = event.conversation_id;
        if (event.conversation_id) {
          rememberTutorConversationId(
            selectedCourseId.value,
            resourceKey,
            event.conversation_id
          );
        }
        if (event.event === "assistant.delta") {
          assistantMessage.content += event.delta || "";
        } else if (event.event === "assistant.completed") {
          completeTutorMessage(event);
        } else if (event.event === "error") {
          failTutorMessage(
            event.error_message || "学习助手响应失败，请稍后重试。"
          );
        }
      }
    );
  } catch (error: any) {
    if (!isTutorSessionCurrent(sessionVersion, resourceKey)) return;
    failTutorMessage(
      assistantApiErrorMessage(
        error,
        error?.message || "当前资料暂时无法加入问答"
      )
    );
  }
}

function stopTutorStream() {
  if (!tutorStreaming.value) return;
  cancelTutorStream?.();
  const message = latestTutorAssistantMessage();
  if (message) {
    message.content = message.content || "已停止生成。";
    message.streaming = false;
  }
  tutorStreaming.value = false;
  cancelTutorStream = undefined;
}

function resetTutorForResource(resource?: StudentResource) {
  tutorSessionVersion += 1;
  stopTutorStream();
  tutorConversationId.value = "";
  tutorHistoryLoading.value = false;
  tutorQuestion.value = "";
  tutorQuotes.value = [];
  tutorAttachment.value = null;
  tutorMessages.value = resource ? [tutorIntroMessage(resource)] : [];
  if (resource) void restoreTutorConversation(resource);
}

watch(
  selectedCourseId,
  courseId => {
    updateCourseRoute(courseId);
    void loadCourseResources(courseId);
  },
  { immediate: true }
);

watch(
  () => props.courseId,
  courseId => {
    const normalized = Number(courseId);
    if (normalized > 0 && normalized !== selectedCourseId.value) {
      selectedCourseId.value = normalized;
    }
  },
  { immediate: true }
);

watch(
  activeResource,
  (resource, previousResource) => {
    void loadPreview(resource);
    if (resource?.resourceKey !== previousResource?.resourceKey) {
      resetTutorForResource(resource);
    }
  },
  { immediate: true }
);

watch(routeCourseId, courseId => {
  if (courseId && courseId !== selectedCourseId.value)
    selectedCourseId.value = courseId;
});

void loadCourses();

onUnmounted(() => {
  cancelTutorStream?.();
});
</script>

<template>
  <section
    class="student-resource-workbench"
    :class="{
      'is-embedded': props.embedded,
      'is-fixed-viewport': props.fixedViewport
    }"
    aria-label="个性化学习资源"
  >
    <header v-if="!props.embedded" class="resource-workbench__header">
      <div class="resource-workbench__heading">
        <span class="heading-mark" aria-hidden="true"
          ><el-icon><FolderOpened /></el-icon
        ></span>
        <div>
          <p>学生学习空间</p>
          <h1>个性化教学资源</h1>
        </div>
      </div>
      <div class="resource-workbench__course-select">
        <label for="student-resource-course">当前课程</label>
        <el-select
          id="student-resource-course"
          v-model="selectedCourseId"
          :loading="courseLoading"
          :disabled="courseLoading || !courseOptions.length"
          placeholder="请选择课程"
          aria-label="选择课程"
        >
          <el-option
            v-for="course in courseOptions"
            :key="course.courseId"
            :label="course.courseName"
            :value="course.courseId"
          />
        </el-select>
        <el-tooltip content="刷新课程资源" placement="bottom">
          <el-button
            circle
            :icon="Refresh"
            :loading="resourceLoading"
            aria-label="刷新课程资源"
            @click="loadCourseResources(selectedCourseId)"
          />
        </el-tooltip>
      </div>
    </header>

    <div v-if="courseError" class="workbench-feedback">
      <el-icon :size="28"><Document /></el-icon>
      <h2>课程加载失败</h2>
      <p>{{ courseError }}</p>
      <el-button type="primary" @click="loadCourses">重新加载</el-button>
    </div>

    <div
      v-else-if="courseLoading && !courseOptions.length"
      class="workbench-skeleton"
    >
      <el-skeleton animated>
        <template #template>
          <el-skeleton-item variant="rect" class="workbench-skeleton__rail" />
          <el-skeleton-item
            variant="rect"
            class="workbench-skeleton__preview"
          />
          <el-skeleton-item variant="rect" class="workbench-skeleton__tutor" />
        </template>
      </el-skeleton>
    </div>

    <div v-else-if="resourceError" class="workbench-feedback">
      <el-icon :size="28"><Document /></el-icon>
      <h2>资源加载失败</h2>
      <p>{{ resourceError }}</p>
      <el-button type="primary" @click="loadCourseResources(selectedCourseId)"
        >重新加载</el-button
      >
    </div>

    <div v-else-if="resourceLoading" class="workbench-skeleton">
      <el-skeleton animated>
        <template #template>
          <el-skeleton-item variant="rect" class="workbench-skeleton__rail" />
          <el-skeleton-item
            variant="rect"
            class="workbench-skeleton__preview"
          />
          <el-skeleton-item variant="rect" class="workbench-skeleton__tutor" />
        </template>
      </el-skeleton>
    </div>

    <div v-else-if="!courseResources.length" class="workbench-feedback">
      <el-icon :size="28"><FolderOpened /></el-icon>
      <h2>暂未发布学习资源</h2>
      <p>教师发布资料后，会按课程与学习进度出现在这里。</p>
    </div>

    <div v-else-if="!activeResource" class="resource-overview">
      <header class="resource-overview__header">
        <div class="resource-overview__summary">
          <strong>{{ visibleResources.length }}</strong>
          <span>项资源</span>
        </div>
      </header>
      <div class="resource-overview__toolbar">
        <el-input
          v-model="resourceSearch"
          :prefix-icon="Search"
          clearable
          placeholder="搜索资源标题、摘要或类型"
          aria-label="搜索教学资源"
        />
        <span>点击资源卡片进入在线预览与文件辅导</span>
      </div>
      <div v-if="!visibleResources.length" class="resource-overview__empty">
        <el-icon :size="28"><FolderOpened /></el-icon>
        <h3>暂未收到个性化教学资源</h3>
        <p>教师发布或学习助手生成资源后，会出现在这里。</p>
      </div>
      <div v-else class="resource-card-grid">
        <article
          v-for="resource in visibleResources"
          :key="resource.resourceKey"
          class="resource-card"
          tabindex="0"
          role="button"
          @click="selectResource(resource)"
          @keydown.enter.prevent="selectResource(resource)"
          @keydown.space.prevent="selectResource(resource)"
        >
          <div class="resource-card__topline">
            <el-tag
              class="resource-card__type-tag"
              size="small"
              effect="plain"
              :type="resourceTagType(resource.resourceType)"
            >
              <el-icon><component :is="resourceIcon(resource)" /></el-icon>
              {{ resourceTypeLabel(resource) }}
            </el-tag>
            <el-tag
              class="resource-card__status-tag"
              size="small"
              effect="plain"
              :type="resourceTagType(resource.status)"
            >
              <el-icon
                ><component :is="resourceStatusIcon(resource.status)"
              /></el-icon>
              {{ resourceStatusLabel(resource.status) }}
            </el-tag>
          </div>
          <h3 :title="resource.title">{{ resource.title }}</h3>
          <p>
            {{
              resource.summary ||
              resource.recommendation ||
              "围绕当前课程整理的学习内容。"
            }}
          </p>
          <div class="resource-card__metrics">
            <div>
              <span>质量</span>
              <strong>{{
                formatQuality(resource.qualityScore) || "暂无"
              }}</strong>
            </div>
            <div>
              <span>格式</span>
              <strong>{{ resourceFormatLabel(resource) }}</strong>
            </div>
          </div>
          <div class="resource-card__state">
            <div class="resource-card__state-tags">
              <el-tag
                v-if="resource.reviewStatus"
                size="small"
                effect="plain"
                :type="resourceTagType(resource.reviewStatus)"
              >
                审核 {{ resourceStatusLabel(resource.reviewStatus) }}
              </el-tag>
              <el-tag
                v-if="resource.safetyStatus"
                size="small"
                effect="plain"
                :type="resourceTagType(resource.safetyStatus)"
              >
                {{ resourceStatusLabel(resource.safetyStatus) }}
              </el-tag>
              <el-tag v-if="resource.versionNo" size="small" effect="plain">
                v{{ resource.versionNo }}
              </el-tag>
              <el-tag
                v-if="resource.variantLabel || resource.variantCode"
                size="small"
                type="primary"
                effect="plain"
              >
                {{ resource.variantLabel || `${resource.variantCode} 版` }}
              </el-tag>
            </div>
            <p
              v-if="
                (resource.htmlAnimationStatus &&
                  resource.htmlAnimationStatus !== 'ready') ||
                resource.storageStatus === 'processing' ||
                resource.storageStatus === 'failed' ||
                resource.storageStatus === 'degraded'
              "
              class="resource-card__state-alert"
              :title="resourceStateMessage(resource)"
            >
              {{ resourceStateMessage(resource) }}
            </p>
          </div>
          <div class="resource-card__footer">
            <span>{{
              resource.updatedAt || resourceSourceLabel(resource)
            }}</span>
            <span class="resource-card__detail-link">
              查看详情 <el-icon><ArrowRight /></el-icon>
            </span>
          </div>
        </article>
      </div>
    </div>

    <div v-else class="resource-workbench__body">
      <main class="resource-preview" aria-live="polite">
        <header class="resource-preview__header">
          <el-button
            class="resource-preview__back"
            text
            :icon="ArrowLeft"
            aria-label="返回资源列表"
            @click="closeResourceDetail"
          >
            资源列表
          </el-button>
          <div class="resource-preview__title">
            <span class="resource-preview__type" aria-hidden="true">
              <el-icon
                ><component :is="resourceIcon(activeResource!)"
              /></el-icon>
            </span>
            <div>
              <h2>{{ activeResource?.title }}</h2>
              <p>
                <span>{{ resourceSourceLabel(activeResource!) }}</span>
                <span>{{ activePreviewLabel }}</span>
                <span
                  v-if="activeResource?.variantLabel || activeResource?.variantCode"
                >
                  {{
                    activeResource?.variantLabel ||
                    `${activeResource?.variantCode} 版`
                  }}
                </span>
                <span v-if="activeResource?.chapterName">{{
                  activeResource.chapterName
                }}</span>
                <span v-if="activeResource?.duration">{{
                  formatDuration(activeResource.duration)
                }}</span>
              </p>
            </div>
          </div>
          <el-tooltip content="在新窗口中打开" placement="bottom">
            <el-button
              circle
              :icon="Link"
              aria-label="在新窗口中打开"
              @click="openActiveResource"
            />
          </el-tooltip>
        </header>

        <div
          class="resource-preview__canvas"
          :class="{ 'is-reading': activePreviewKind === 'markdown' }"
        >
          <div v-if="resourceDetailLoading" class="preview-detail-loading">
            <el-icon class="is-loading"><Loading /></el-icon>
            正在准备资源详情
          </div>
          <div
            v-if="
              !activeResource ||
              (!activeResource.fileUrl && !activeResource.contentBody)
            "
            class="preview-feedback"
          >
            <el-icon :size="30"><Document /></el-icon>
            <h3>该资源暂无可预览文件</h3>
            <p>资料发布后可在此直接学习和提问。</p>
          </div>

          <div
            v-else-if="activePreviewKind === 'html'"
            class="preview-frame-wrap"
          >
            <iframe
              :key="activeResource.resourceKey"
              :src="activeResource.fileUrl || undefined"
              :srcdoc="
                activeResource.fileUrl
                  ? undefined
                  : activeResource.contentBody || undefined
              "
              title="HTML 学习资料预览"
              class="preview-frame"
              sandbox="allow-downloads allow-forms allow-popups allow-scripts"
            />
          </div>

          <div
            v-else-if="activePreviewKind === 'markdown'"
            class="markdown-preview"
            ref="markdownPreviewRef"
            @mouseup="captureTextSelection"
            @keyup="captureTextSelection"
            @touchend="captureTextSelection"
            @scroll="hideQuoteAction"
          >
            <div
              v-if="quoteAction"
              class="quote-selection-action"
              :style="{
                left: `${quoteAction.left}px`,
                top: `${quoteAction.top}px`
              }"
            >
              <el-button
                type="primary"
                size="small"
                :icon="ChatDotRound"
                @mousedown.prevent
                @click="applyQuoteToTutor"
              >
                引用提问
              </el-button>
              <el-tooltip content="取消引用" placement="top">
                <button
                  type="button"
                  class="quote-selection-action__close"
                  aria-label="取消引用"
                  @mousedown.prevent
                  @click="hideQuoteAction"
                >
                  <el-icon><Close /></el-icon>
                </button>
              </el-tooltip>
            </div>
            <div v-if="previewLoading" class="preview-loading">
              <el-icon class="is-loading"><Loading /></el-icon> 正在渲染讲义
            </div>
            <div
              v-else-if="previewError"
              class="preview-feedback preview-feedback--compact"
            >
              <el-icon :size="26"><Document /></el-icon>
              <h3>讲义暂无法内嵌打开</h3>
              <p>{{ previewError }}</p>
              <el-button type="primary" size="small" @click="openActiveResource"
                >在新窗口中打开</el-button
              >
            </div>
            <article
              v-else
              class="markdown-preview__content"
              v-html="markdownHtml"
            />
          </div>

          <div
            v-else-if="activePreviewKind === 'mindmap'"
            class="mind-map-preview"
          >
            <div v-if="previewLoading" class="preview-loading">
              <el-icon class="is-loading"><Loading /></el-icon> 正在生成思维导图
            </div>
            <div
              v-else-if="previewError"
              class="preview-feedback preview-feedback--compact"
            >
              <el-icon :size="26"><Connection /></el-icon>
              <h3>导图暂无法内嵌打开</h3>
              <p>{{ previewError }}</p>
              <el-button type="primary" size="small" @click="openActiveResource"
                >在新窗口中打开</el-button
              >
            </div>
            <div
              v-else-if="mindMapImageUrl"
              class="mind-map-preview__image-stage"
            >
              <img :src="mindMapImageUrl" :alt="activeResource.title" />
            </div>
            <div v-else-if="mindMap" class="mind-map-preview__viewport">
              <p class="mind-map-preview__hint">
                从核心概念展开，点击右侧辅导可继续追问任一主题。
              </p>
              <ul class="mind-map">
                <MindMapNodeView :node="mindMap" />
              </ul>
            </div>
          </div>

          <div v-else-if="activePreviewKind === 'json'" class="json-preview">
            <div v-if="previewLoading" class="preview-loading">
              <el-icon class="is-loading"><Loading /></el-icon>
              正在读取 JSON 资源
            </div>
            <div
              v-else-if="previewError"
              class="preview-feedback preview-feedback--compact"
            >
              <el-icon :size="26"><Document /></el-icon>
              <h3>JSON 资源暂无法内嵌打开</h3>
              <p>{{ previewError }}</p>
              <el-button type="primary" size="small" @click="openActiveResource"
                >在新窗口中打开</el-button
              >
            </div>
            <pre v-else class="json-preview__content">{{ jsonPreview }}</pre>
          </div>

          <div v-else-if="activePreviewKind === 'video'" class="media-preview">
            <video :src="activeResource.fileUrl" controls preload="metadata" />
          </div>

          <div v-else-if="activePreviewKind === 'audio'" class="audio-preview">
            <span class="audio-preview__icon"
              ><el-icon><Headset /></el-icon
            ></span>
            <h3>{{ activeResource.title }}</h3>
            <audio :src="activeResource.fileUrl" controls preload="metadata" />
          </div>

          <div v-else-if="activePreviewKind === 'image'" class="image-preview">
            <img :src="activeResource.fileUrl" :alt="activeResource.title" />
          </div>

          <iframe
            v-else-if="activePreviewKind === 'pdf'"
            :key="activeResource.resourceKey"
            :src="activeResource.fileUrl"
            title="PDF 学习资料预览"
            class="preview-frame"
          />

          <div v-else class="preview-feedback">
            <el-icon :size="30"><Document /></el-icon>
            <h3>此文件暂不支持直接预览</h3>
            <p>可在新窗口中打开该资料，学习助手仍会结合当前课程为你答疑。</p>
            <el-button type="primary" @click="openActiveResource"
              >打开资料</el-button
            >
          </div>
        </div>
      </main>

      <aside class="resource-tutor" aria-label="当前资料辅导">
        <header class="resource-tutor__header">
          <span class="resource-tutor__icon" aria-hidden="true"
            ><el-icon><MagicStick /></el-icon
          ></span>
          <div>
            <h2>当前资料辅导</h2>
            <p>{{ activeResource?.title }}</p>
          </div>
        </header>
        <div class="resource-tutor__context">
          <span
            ><el-icon><Document /></el-icon>{{ activePreviewLabel }}</span
          >
          <span v-if="activeResourceIsUploaded" class="is-ready"
            ><el-icon><CircleCheck /></el-icon>已加入问答上下文</span
          >
          <span v-else-if="currentResourceCanUpload(activeResource)"
            ><el-icon><DocumentAdd /></el-icon>提问时自动解析当前文件</span
          >
          <span v-else
            ><el-icon><FolderOpened /></el-icon>结合当前课程资料回答</span
          >
        </div>

        <div class="resource-tutor__messages" aria-live="polite">
          <div
            v-for="message in tutorMessages"
            :key="message.id"
            class="tutor-message"
            :class="[
              `tutor-message--${message.role}`,
              { 'is-error': message.error }
            ]"
          >
            <span class="tutor-message__role">{{
              message.role === "student" ? "我" : "学习助手"
            }}</span>
            <div
              v-if="message.streaming && !message.content"
              class="tutor-message__thinking"
            >
              <el-icon class="is-loading"><Loading /></el-icon> 正在阅读资料
            </div>
            <div
              v-else
              class="tutor-message__content"
              v-html="renderMarkdown(message.content)"
            />
          </div>
        </div>

        <div class="resource-tutor__suggestions" aria-label="推荐提问">
          <button
            type="button"
            @click="sendTutorQuestion('请用自己的话概括这份资料的核心内容。')"
          >
            概括核心内容
          </button>
          <button
            type="button"
            @click="sendTutorQuestion('请帮我梳理这份资料的重点和易错点。')"
          >
            梳理重难点
          </button>
          <button
            type="button"
            @click="
              sendTutorQuestion('请基于这份资料出 3 道由浅入深的练习题。')
            "
          >
            生成练习题
          </button>
        </div>

        <div class="resource-tutor__composer">
          <input
            ref="tutorFileInput"
            type="file"
            accept=".pdf,.docx,.txt,application/pdf,text/plain,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            class="tutor-file-input"
            @change="handleTutorFileChange"
          />
          <div v-if="tutorAttachmentName" class="tutor-attachment">
            <span
              ><el-icon><Document /></el-icon>{{ tutorAttachmentName }}</span
            >
            <button
              type="button"
              aria-label="移除附加资料"
              @click="clearTutorAttachment"
            >
              ×
            </button>
          </div>
          <div
            v-if="tutorQuotes.length"
            class="resource-tutor__quotes"
            aria-label="已引用资料片段"
          >
            <div class="resource-tutor__quotes-heading">
              <el-icon><ChatDotRound /></el-icon>
              <span>已引用 {{ tutorQuotes.length }} 段资料</span>
            </div>
            <div class="resource-tutor__quote-list">
              <div
                v-for="(quote, index) in tutorQuotes"
                :key="quote.id"
                class="resource-tutor__quote"
              >
                <span class="resource-tutor__quote-index">{{ index + 1 }}</span>
                <span class="resource-tutor__quote-text">{{ quote.text }}</span>
                <button
                  type="button"
                  :aria-label="`移除引用 ${index + 1}`"
                  :disabled="tutorStreaming"
                  @click="removeTutorQuote(quote.id)"
                >
                  <el-icon><Close /></el-icon>
                </button>
              </div>
            </div>
          </div>
          <el-input
            ref="tutorQuestionInput"
            v-model="tutorQuestion"
            type="textarea"
            :rows="3"
            resize="none"
            placeholder="针对当前资料提问"
            aria-label="针对当前资料提问"
            :disabled="tutorStreaming || tutorHistoryLoading"
            @keydown.meta.enter.prevent="sendTutorQuestion()"
            @keydown.ctrl.enter.prevent="sendTutorQuestion()"
          />
          <div class="resource-tutor__actions">
            <el-tooltip content="补充 PDF、DOCX 或 TXT 资料" placement="top">
              <el-button
                circle
                :icon="DocumentAdd"
                aria-label="补充资料"
                :disabled="tutorStreaming"
                @click="tutorFileInput?.click()"
              />
            </el-tooltip>
            <el-button v-if="tutorStreaming" plain @click="stopTutorStream"
              >停止</el-button
            >
            <el-button
              v-else
              type="primary"
              :icon="Promotion"
              :disabled="!tutorQuestion.trim()"
              @click="sendTutorQuestion()"
            >
              发送
            </el-button>
          </div>
        </div>
      </aside>
    </div>
  </section>
</template>

<style scoped>
.student-resource-workbench {
  --resource-bg: #f3f6fa;
  --resource-surface: #fff;
  --resource-surface-muted: #f8fafc;
  --resource-border: #e0e7ef;
  --resource-text: #172033;
  --resource-muted: #596a80;
  --resource-subtle: #8190a4;
  --resource-primary: #245fbe;
  --resource-primary-soft: #edf4ff;
  --resource-success: #12755c;

  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 640px;
  color: var(--resource-text);
  background: var(--resource-bg);
}

.student-resource-workbench.is-embedded {
  min-height: 0;
}

.student-resource-workbench.is-fixed-viewport {
  min-height: 0;
}

.resource-workbench__header {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: space-between;
  min-height: 76px;
  padding: 14px 24px;
  background: var(--resource-surface);
  border-bottom: 1px solid var(--resource-border);
}

.resource-workbench__heading,
.resource-workbench__course-select,
.resource-preview__title,
.resource-tutor__header,
.resource-tutor__context,
.resource-tutor__actions,
.resource-rail__progress {
  display: flex;
  align-items: center;
}

.resource-workbench__heading {
  min-width: 0;
  gap: 11px;
}

.heading-mark,
.resource-preview__type,
.resource-tutor__icon,
.resource-rail__type {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  color: var(--resource-primary);
  background: var(--resource-primary-soft);
  border: 1px solid #dbe8f8;
  border-radius: 8px;
}

.heading-mark {
  width: 38px;
  height: 38px;
  font-size: 18px;
}

.resource-workbench__heading p,
.resource-workbench__heading h1,
.resource-preview__title h2,
.resource-preview__title p,
.resource-tutor__header h2,
.resource-tutor__header p,
.preview-feedback h3,
.preview-feedback p,
.audio-preview h3 {
  margin: 0;
}

.resource-workbench__heading p {
  color: var(--resource-muted);
  font-size: 0.6875rem;
  font-weight: 600;
  line-height: 1.2;
}

.resource-workbench__heading h1 {
  margin-top: 2px;
  font-size: 1.1875rem;
  font-weight: 720;
  line-height: 1.35;
}

.resource-workbench__course-select {
  flex: 0 0 auto;
  gap: 10px;
}

.resource-workbench__course-select label {
  color: var(--resource-subtle);
  font-size: 0.75rem;
  font-weight: 600;
}

.resource-workbench__course-select :deep(.el-select) {
  width: min(270px, 34vw);
}

.resource-overview {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  padding: 22px 28px 30px;
  overflow: auto;
  background: var(--resource-bg);
}

.resource-overview__header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  width: 100%;
}

.resource-overview__eyebrow {
  margin: 0 0 5px;
  color: var(--resource-primary);
  font-size: 0.75rem;
  font-weight: 700;
}

.resource-overview__header h2 {
  margin: 0;
  color: var(--resource-text);
  font-size: 1.3rem;
  font-weight: 720;
  line-height: 1.35;
}

.resource-overview__description {
  max-width: 62ch;
  margin: 6px 0 0;
  color: var(--resource-muted);
  font-size: 0.8125rem;
  line-height: 1.55;
}

.resource-overview__summary {
  display: flex;
  flex: 0 0 auto;
  align-items: baseline;
  gap: 5px;
  color: var(--resource-muted);
  font-size: 0.75rem;
}

.resource-overview__summary strong {
  color: var(--resource-primary);
  font-size: 1.5rem;
  font-weight: 750;
}

.resource-overview__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  width: 100%;
  margin: 20px 0 16px;
}

.resource-overview__toolbar :deep(.el-input) {
  width: min(340px, 100%);
}

.resource-overview__toolbar > span {
  color: var(--resource-subtle);
  font-size: 0.75rem;
}

.resource-card-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  width: 100%;
}

.resource-card {
  display: flex;
  min-width: 0;
  min-height: 236px;
  flex-direction: column;
  padding: 18px;
  cursor: pointer;
  background: var(--resource-surface);
  border: 1px solid var(--resource-border);
  border-radius: 10px;
  box-shadow: 0 6px 18px rgb(25 43 74 / 5%);
  transition:
    border-color 180ms ease-out,
    box-shadow 180ms ease-out,
    transform 180ms ease-out;
}

.resource-card:hover,
.resource-card:focus-visible {
  outline: none;
  border-color: #9dbce8;
  box-shadow: 0 10px 24px rgb(25 43 74 / 9%);
  transform: translateY(-2px);
}

.resource-card__topline,
.resource-card__footer {
  display: flex;
  align-items: center;
}

.resource-card__topline {
  justify-content: space-between;
  gap: 8px;
}

.resource-card__type-tag,
.resource-card__status-tag {
  display: inline-flex;
  align-items: center;
  max-width: 52%;
  gap: 5px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.resource-card__type-tag {
  min-width: 0;
}

.resource-card__status-tag {
  flex: 0 0 auto;
  margin-left: auto;
}

.resource-card h3 {
  display: -webkit-box;
  min-height: 2.7em;
  margin: 13px 0 8px;
  overflow: hidden;
  color: var(--resource-text);
  font-size: 1rem;
  font-weight: 700;
  line-height: 1.35;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.resource-card > p {
  display: -webkit-box;
  min-height: 3.2em;
  margin: 0;
  overflow: hidden;
  color: var(--resource-muted);
  font-size: 0.8125rem;
  line-height: 1.6;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.resource-card__metrics {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin-top: 14px;
}

.resource-card__metrics > div {
  min-width: 0;
  padding: 9px 11px;
  background: var(--resource-surface-muted);
  border-radius: 7px;
}

.resource-card__metrics span,
.resource-card__metrics strong {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.resource-card__metrics span {
  color: var(--resource-subtle);
  font-size: 0.6875rem;
}

.resource-card__metrics strong {
  margin-top: 3px;
  color: var(--resource-text);
  font-size: 0.8125rem;
  font-weight: 700;
}

.resource-card__state {
  display: grid;
  gap: 8px;
  margin-top: 12px;
}

.resource-card__state-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  min-height: 22px;
}

.resource-card__state-alert {
  display: -webkit-box;
  margin: 0;
  overflow: hidden;
  color: #a65038;
  font-size: 0.6875rem;
  line-height: 1.4;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
}

.resource-card__footer {
  justify-content: space-between;
  gap: 8px;
  min-height: 32px;
  padding-top: 12px;
  margin-top: auto;
  color: var(--resource-subtle);
  font-size: 0.6875rem;
  border-top: 1px solid var(--resource-border);
}

.resource-card__footer > span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.resource-card__detail-link {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  gap: 3px;
  color: var(--resource-primary);
  font-size: 0.75rem;
}

.resource-overview__empty {
  display: flex;
  flex: 1;
  min-height: 260px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: var(--resource-muted);
  text-align: center;
}

.resource-overview__empty h3,
.resource-overview__empty p {
  margin: 0;
}

.resource-overview__empty h3 {
  color: var(--resource-text);
  font-size: 0.9375rem;
}

.resource-overview__empty p {
  font-size: 0.8125rem;
}

.resource-workbench__body {
  display: grid;
  flex: 1;
  min-height: 0;
  grid-template-columns: minmax(0, 1fr) 360px;
  gap: 0;
  padding: 0;
  overflow: hidden;
  background: var(--resource-bg);
  border-radius: 0 0 14px 14px;
}

.resource-rail,
.resource-preview,
.resource-tutor {
  min-width: 0;
  min-height: 0;
  background: var(--resource-surface);
}

.resource-rail {
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--resource-border);
}

.resource-rail__course {
  padding: 18px 16px 14px;
  border-bottom: 1px solid var(--resource-border);
}

.resource-rail__course > p {
  margin: 0 0 12px;
  overflow: hidden;
  color: var(--resource-text);
  font-size: 0.875rem;
  font-weight: 700;
  line-height: 1.4;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.resource-rail__progress {
  justify-content: space-between;
  margin-bottom: 7px;
  color: var(--resource-muted);
  font-size: 0.75rem;
}

.resource-rail__progress strong {
  color: var(--resource-primary);
  font-weight: 700;
}

.resource-rail__search {
  margin: 12px 12px 8px;
  width: auto;
}

.resource-rail__list {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 3px;
  padding: 0 8px 14px;
  overflow: auto;
}

.resource-rail__item {
  display: flex;
  align-items: center;
  width: 100%;
  min-height: 62px;
  padding: 8px;
  gap: 9px;
  color: var(--resource-text);
  text-align: left;
  cursor: pointer;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 7px;
  transition:
    background-color 170ms ease-out,
    border-color 170ms ease-out;
}

.resource-rail__item:hover {
  background: var(--resource-surface-muted);
  border-color: #e5ebf2;
}

.resource-rail__item.is-active {
  background: var(--resource-primary-soft);
  border-color: #bdd4f7;
}

.resource-rail__type {
  width: 30px;
  height: 30px;
  border-radius: 7px;
  font-size: 15px;
}

.resource-rail__item-copy {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  gap: 3px;
}

.resource-rail__item-copy strong,
.resource-rail__item-copy small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.resource-rail__item-copy strong {
  font-size: 0.8125rem;
  font-weight: 650;
  line-height: 1.3;
}

.resource-rail__item-copy small {
  color: var(--resource-muted);
  font-size: 0.6875rem;
  line-height: 1.3;
}

.resource-rail__done {
  flex: 0 0 auto;
  color: var(--resource-success);
}

.resource-rail__empty {
  padding: 20px 8px;
  color: var(--resource-muted);
  font-size: 0.8125rem;
  text-align: center;
}

.resource-preview {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--resource-surface);
  border-right: 1px solid var(--resource-border);
  border-bottom-left-radius: 14px;
}

.resource-preview__header {
  display: grid;
  flex: 0 0 auto;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  column-gap: 16px;
  min-height: 76px;
  padding: 13px 24px;
  background: var(--resource-surface);
  border-bottom: 1px solid var(--resource-border);
}

.resource-preview__back {
  justify-self: start;
  margin-left: -15px;
  white-space: nowrap;
}

.resource-preview__title {
  flex: 1;
  min-width: 0;
  gap: 11px;
}

.resource-preview__type {
  width: 36px;
  height: 36px;
  font-size: 16px;
}

.resource-preview__title div {
  min-width: 0;
}

.resource-preview__title h2 {
  overflow: hidden;
  font-size: 1rem;
  font-weight: 720;
  line-height: 1.35;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.resource-preview__title p {
  display: flex;
  flex-wrap: wrap;
  margin-top: 4px;
  color: var(--resource-muted);
  font-size: 0.75rem;
  line-height: 1.4;
}

.resource-preview__title p span + span::before {
  display: inline-block;
  margin: 0 6px;
  color: #a3afbd;
  content: "·";
}

.resource-preview__canvas {
  position: relative;
  display: flex;
  flex: 1;
  min-height: 0;
  padding: 24px 28px 30px;
  overflow: hidden;
  background: var(--resource-bg);
}

.resource-preview__canvas.is-reading {
  align-items: flex-start;
  overflow: auto;
  overscroll-behavior: contain;
}

.preview-detail-loading {
  position: absolute;
  top: 28px;
  right: 28px;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 10px;
  color: var(--resource-primary);
  font-size: 0.75rem;
  background: rgb(255 255 255 / 92%);
  border: 1px solid var(--resource-border);
  border-radius: 6px;
  box-shadow: 0 5px 14px rgb(25 43 74 / 8%);
}

.preview-frame-wrap,
.preview-frame,
.markdown-preview,
.mind-map-preview,
.json-preview,
.media-preview,
.image-preview,
.audio-preview {
  width: 100%;
  height: 100%;
  min-height: 0;
}

.preview-frame-wrap,
.markdown-preview,
.mind-map-preview,
.json-preview,
.media-preview,
.image-preview,
.audio-preview {
  background: var(--resource-surface);
  border: 1px solid var(--resource-border);
  border-radius: 6px;
}

.preview-frame {
  display: block;
  border: 1px solid var(--resource-border);
  border-radius: 6px;
}

.preview-frame-wrap .preview-frame {
  height: 100%;
  border: 0;
  border-radius: 6px;
}

.markdown-preview,
.mind-map-preview,
.json-preview {
  overflow: auto;
}

.markdown-preview {
  position: relative;
  border: 0;
  border-radius: 2px;
}

.quote-selection-action {
  position: absolute;
  z-index: 3;
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 3px;
  pointer-events: auto;
  background: var(--resource-surface);
  border: 1px solid #cbdcf2;
  border-radius: 7px;
  box-shadow: 0 8px 18px rgb(33 61 104 / 14%);
  transform: translateX(-50%);
}

.quote-selection-action :deep(.el-button) {
  min-height: 28px;
  padding: 4px 9px;
  border-radius: 5px;
}

.quote-selection-action__close {
  display: inline-flex;
  width: 28px;
  height: 28px;
  align-items: center;
  justify-content: center;
  padding: 0;
  color: var(--resource-subtle);
  cursor: pointer;
  background: transparent;
  border: 0;
  border-radius: 5px;
}

.quote-selection-action__close:hover {
  color: var(--resource-text);
  background: var(--resource-primary-soft);
}

.resource-preview__canvas.is-reading .markdown-preview {
  flex: 0 0 auto;
  width: min(100%, 960px);
  height: auto;
  min-height: 0;
  margin: 0 auto 28px;
  background: var(--resource-surface);
  border: 0;
  border-radius: 6px;
  box-shadow: 0 8px 22px rgb(30 53 86 / 4%);
}

.json-preview__content {
  min-height: 100%;
  padding: 24px;
  margin: 0;
  overflow: auto;
  color: #dce9ff;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.8125rem;
  line-height: 1.65;
  white-space: pre-wrap;
  background: #1d2b42;
}

.markdown-preview__content {
  max-width: 72ch;
  padding: 46px clamp(30px, 5vw, 68px) 64px;
  margin: 0 auto;
  color: #2a3a50;
  font-size: 1rem;
  line-height: 1.72;
}

.resource-preview__canvas.is-reading .markdown-preview__content {
  max-width: none;
  min-height: 0;
}

.markdown-preview__content :deep(h1),
.markdown-preview__content :deep(h2),
.markdown-preview__content :deep(h3) {
  margin: 1.5em 0 0.58em;
  color: var(--resource-text);
  line-height: 1.26;
  text-wrap: balance;
}

.markdown-preview__content :deep(h1) {
  font-size: 1.75rem;
}
.markdown-preview__content :deep(h2) {
  font-size: 1.375rem;
}
.markdown-preview__content :deep(h3) {
  font-size: 1.0625rem;
}
.markdown-preview__content :deep(h1:first-child) {
  margin-top: 0;
}
.markdown-preview__content :deep(p),
.markdown-preview__content :deep(ul),
.markdown-preview__content :deep(ol) {
  margin: 0 0 1em;
}
.markdown-preview__content :deep(ul),
.markdown-preview__content :deep(ol) {
  padding-left: 1.5em;
}
.markdown-preview__content :deep(blockquote) {
  margin: 1.2em 0;
  padding: 0.35em 1em;
  color: #425877;
  background: #f5f8fc;
  border: 1px solid #dce6f1;
  border-radius: 4px;
}
.markdown-preview__content :deep(pre) {
  box-sizing: border-box;
  min-width: 100%;
  padding: 14px;
  overflow: auto;
  color: #dce9ff;
  background: #1d2b42;
  border-radius: 5px;
}
.markdown-preview__content :deep(code) {
  padding: 0.1em 0.28em;
  color: #0f4b8e;
  background: #eaf2ff;
  border-radius: 4px;
}
.markdown-preview__content :deep(pre code) {
  padding: 0;
  color: inherit;
  background: transparent;
}
.markdown-preview__content :deep(a) {
  color: #1559b7;
}

.mind-map-preview__viewport {
  min-width: max-content;
  min-height: 100%;
  padding: 34px 42px 42px;
}

.mind-map-preview__image-stage {
  display: flex;
  min-width: 100%;
  min-height: 100%;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.mind-map-preview__image-stage img {
  display: block;
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.mind-map-preview__hint {
  margin: 0 0 24px;
  color: var(--resource-muted);
  font-size: 0.8125rem;
}

.mind-map,
.mind-map__children {
  margin: 0;
  padding: 0;
  list-style: none;
}

.mind-map > :deep(.mind-map__branch) > :deep(.mind-map__node) {
  color: #fff;
  background: var(--resource-primary);
  border-color: var(--resource-primary);
}

.mind-map__branch {
  position: relative;
  padding: 10px 0 0 28px;
}

.mind-map__branch::before {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 9px;
  width: 1px;
  background: #c9d8eb;
  content: "";
}

.mind-map__branch::after {
  position: absolute;
  top: 28px;
  left: 9px;
  width: 19px;
  height: 1px;
  background: #c9d8eb;
  content: "";
}

.mind-map > .mind-map__branch {
  padding-left: 0;
}
.mind-map > .mind-map__branch::before,
.mind-map > .mind-map__branch::after {
  display: none;
}

.mind-map__node {
  display: inline-block;
  max-width: 36ch;
  padding: 8px 11px;
  color: #263a56;
  font-size: 0.875rem;
  font-weight: 650;
  line-height: 1.42;
  background: #f4f8fd;
  border: 1px solid #ccdced;
  border-radius: 6px;
}

.mind-map__children {
  margin-top: 2px;
}

.media-preview,
.image-preview,
.audio-preview,
.preview-feedback,
.preview-loading {
  display: flex;
  align-items: center;
  justify-content: center;
}

.media-preview {
  background: #152238;
}
.media-preview video {
  max-width: 100%;
  max-height: 100%;
}
.image-preview {
  padding: 18px;
  overflow: auto;
}
.image-preview img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.audio-preview,
.preview-feedback {
  flex-direction: column;
  gap: 9px;
  text-align: center;
}

.audio-preview {
  padding: 32px;
}
.audio-preview__icon {
  color: var(--resource-primary);
  font-size: 34px;
}
.audio-preview h3 {
  max-width: 38ch;
  font-size: 1rem;
}
.audio-preview audio {
  width: min(100%, 420px);
  margin-top: 8px;
}

.preview-feedback {
  width: 100%;
  min-height: 260px;
  padding: 32px;
  color: var(--resource-muted);
  background: var(--resource-surface);
  border: 1px dashed #cbd8e7;
  border-radius: 8px;
}

.preview-feedback--compact {
  min-height: 100%;
  border: 0;
}
.preview-feedback h3 {
  color: var(--resource-text);
  font-size: 0.9375rem;
}
.preview-feedback p {
  max-width: 36ch;
  font-size: 0.8125rem;
  line-height: 1.6;
}
.preview-loading {
  width: 100%;
  min-height: 100%;
  gap: 8px;
  color: var(--resource-muted);
  font-size: 0.875rem;
}

.resource-tutor {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-left: 1px solid var(--resource-border);
  border-bottom-right-radius: 14px;
}

.resource-tutor__header {
  min-height: 76px;
  padding: 14px;
  gap: 10px;
  background: #fbfcff;
  border-bottom: 1px solid var(--resource-border);
}

.resource-tutor__icon {
  width: 36px;
  height: 36px;
  font-size: 17px;
}

.resource-tutor__header div {
  min-width: 0;
}
.resource-tutor__header h2 {
  font-size: 1rem;
  font-weight: 720;
  line-height: 1.35;
}
.resource-tutor__header p {
  margin-top: 2px;
  overflow: hidden;
  color: var(--resource-muted);
  font-size: 0.75rem;
  line-height: 1.3;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.resource-tutor__context {
  flex-wrap: wrap;
  gap: 8px;
  padding: 10px 14px;
  color: #47617f;
  font-size: 0.6875rem;
  line-height: 1.3;
  background: #f5f8fc;
  border-bottom: 1px solid var(--resource-border);
}

.resource-tutor__context span {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.resource-tutor__context span + span {
  padding-left: 0;
  border-left: 0;
}
.resource-tutor__context .is-ready {
  color: var(--resource-success);
}

.resource-tutor__messages {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  gap: 14px;
  padding: 16px 14px;
  overflow: auto;
  overscroll-behavior: contain;
  background: var(--resource-surface-muted);
}

.tutor-message {
  display: flex;
  flex-direction: column;
  max-width: 92%;
  gap: 5px;
}
.tutor-message--student {
  align-self: flex-end;
}

.tutor-message--assistant:first-child {
  max-width: 100%;
}
.tutor-message__role {
  color: var(--resource-subtle);
  font-size: 0.6875rem;
  font-weight: 600;
}
.tutor-message--student .tutor-message__role {
  text-align: right;
}
.tutor-message__content,
.tutor-message__thinking {
  padding: 10px 11px;
  color: #293c58;
  font-size: 0.8125rem;
  line-height: 1.62;
  background: #fff;
  border: 1px solid #dbe4ef;
  border-radius: 6px;
}

.tutor-message--assistant:first-child .tutor-message__content {
  padding: 12px;
  color: #2b4667;
  background: #f8fbff;
  border-color: #d7e5f5;
}
.tutor-message--student .tutor-message__content {
  color: #17447f;
  background: #eaf2ff;
  border-color: #c9ddfa;
}
.tutor-message.is-error .tutor-message__content {
  color: #a33737;
  background: #fff7f6;
  border-color: #f3c9c5;
}
.tutor-message__thinking {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--resource-muted);
}
.tutor-message__content :deep(p) {
  margin: 0 0 0.7em;
}
.tutor-message__content :deep(p:last-child) {
  margin-bottom: 0;
}
.tutor-message__content :deep(ul),
.tutor-message__content :deep(ol) {
  padding-left: 1.25em;
  margin: 0.35em 0;
}
.tutor-message__content :deep(code) {
  padding: 1px 3px;
  color: #0f4b8e;
  background: #eaf2ff;
  border-radius: 3px;
}
.tutor-message__content :deep(pre) {
  overflow: auto;
  padding: 8px;
  color: #e4efff;
  background: #1d2b42;
  border-radius: 4px;
}

.resource-tutor__suggestions {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 6px;
  padding: 10px 12px;
  overflow: auto;
  background: var(--resource-surface);
  border-top: 1px solid var(--resource-border);
}

.resource-tutor__suggestions button {
  min-height: 30px;
  padding: 4px 6px;
  color: #35608d;
  font-size: 0.6875rem;
  line-height: 1.3;
  cursor: pointer;
  background: #f4f8fd;
  border: 1px solid #d6e2f0;
  border-radius: 4px;
  transition:
    background-color 160ms ease-out,
    border-color 160ms ease-out;
}
.resource-tutor__suggestions button:hover {
  background: #eaf2ff;
  border-color: #bdd4f7;
}

.resource-tutor__composer {
  padding: 12px;
  background: var(--resource-surface);
  border-top: 1px solid var(--resource-border);
}
.tutor-file-input {
  display: none;
}
.tutor-attachment {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  margin-bottom: 8px;
  padding: 6px 8px;
  color: #355573;
  font-size: 0.75rem;
  background: #f4f8fd;
  border: 1px solid #d6e2f0;
  border-radius: 5px;
}
.tutor-attachment span {
  display: inline-flex;
  min-width: 0;
  align-items: center;
  gap: 5px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.tutor-attachment button {
  width: 22px;
  height: 22px;
  color: #58708a;
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
  background: transparent;
  border: 0;
  border-radius: 4px;
}
.tutor-attachment button:hover {
  color: #983d3d;
  background: #ffe8e6;
}

.resource-tutor__quotes {
  padding: 8px;
  margin-bottom: 8px;
  background: #f5f8fc;
  border: 1px solid #d8e4f1;
  border-radius: 8px;
}

.resource-tutor__quotes-heading {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #3e6288;
  font-size: 0.6875rem;
  font-weight: 650;
  line-height: 1.4;
}

.resource-tutor__quote-list {
  display: flex;
  flex-direction: column;
  max-height: 112px;
  gap: 5px;
  margin-top: 6px;
  overflow: auto;
}

.resource-tutor__quote {
  display: flex;
  min-width: 0;
  align-items: flex-start;
  gap: 6px;
  padding: 6px;
  color: #486581;
  font-size: 0.75rem;
  line-height: 1.45;
  background: #fff;
  border: 1px solid #e1eaf3;
  border-radius: 6px;
}

.resource-tutor__quote-index {
  display: inline-flex;
  flex: 0 0 auto;
  width: 16px;
  height: 16px;
  align-items: center;
  justify-content: center;
  color: #245fbe;
  font-size: 0.625rem;
  font-weight: 700;
  line-height: 1;
  background: #edf4ff;
  border-radius: 50%;
}

.resource-tutor__quote-text {
  display: -webkit-box;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.resource-tutor__quote button {
  display: inline-flex;
  flex: 0 0 auto;
  width: 20px;
  height: 20px;
  align-items: center;
  justify-content: center;
  padding: 0;
  color: #69809b;
  cursor: pointer;
  background: transparent;
  border: 0;
  border-radius: 4px;
}

.resource-tutor__quote button:hover:not(:disabled) {
  color: #a33b3b;
  background: #ffe9e7;
}

.resource-tutor__quote button:focus-visible {
  outline: 2px solid #6b9ae8;
  outline-offset: 1px;
}

.resource-tutor__quote button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}
.resource-tutor__actions {
  justify-content: space-between;
  margin-top: 9px;
}

.resource-workbench__course-select :deep(.el-select__wrapper),
.resource-tutor__composer :deep(.el-textarea__inner) {
  box-shadow: 0 0 0 1px var(--resource-border) inset;
}

.resource-tutor__composer :deep(.el-textarea__inner) {
  min-height: 76px !important;
  padding: 10px 11px;
  line-height: 1.55;
}
.resource-tutor__actions :deep(.el-button + .el-button) {
  margin-left: 8px;
}

.workbench-feedback {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 9px;
  padding: 32px;
  color: var(--resource-muted);
  text-align: center;
}
.workbench-feedback h2 {
  margin: 0;
  color: var(--resource-text);
  font-size: 1rem;
}
.workbench-feedback p {
  max-width: 36ch;
  margin: 0;
  font-size: 0.875rem;
  line-height: 1.6;
}
.workbench-skeleton {
  display: grid;
  flex: 1;
  grid-template-columns: 268px minmax(0, 1fr) 380px;
  gap: 1px;
  padding: 1px;
  background: var(--resource-border);
}
.workbench-skeleton :deep(.el-skeleton) {
  display: contents;
}
.workbench-skeleton__rail,
.workbench-skeleton__preview,
.workbench-skeleton__tutor {
  display: block;
  width: 100%;
  height: 100%;
  background: var(--resource-surface);
  border-radius: 0;
}

:global(.dark) .student-resource-workbench {
  --resource-bg: #101827;
  --resource-surface: #172235;
  --resource-surface-muted: #121c2c;
  --resource-border: #2c3d55;
  --resource-text: #e5edf8;
  --resource-muted: #a9bad0;
  --resource-subtle: #8da2bd;
  --resource-primary: #8ab4f8;
  --resource-primary-soft: #1d385f;
  --resource-success: #5ac39e;
}
:global(.dark) .heading-mark,
:global(.dark) .resource-preview__type,
:global(.dark) .resource-tutor__icon,
:global(.dark) .resource-rail__type {
  border-color: #315d95;
}
:global(.dark) .resource-rail__item.is-active,
:global(.dark) .resource-tutor__context,
:global(.dark) .resource-tutor__suggestions button,
:global(.dark) .tutor-attachment {
  border-color: #31506f;
}
:global(.dark) .resource-card__state-alert {
  color: #f0a177;
}
:global(.dark) .resource-tutor__quotes {
  background: #18283d;
  border-color: #31506f;
}
:global(.dark) .resource-tutor__quotes-heading {
  color: #a8c9f3;
}
:global(.dark) .resource-tutor__quote {
  color: #c3d1e2;
  background: #172235;
  border-color: #314359;
}
:global(.dark) .resource-tutor__quote-index {
  color: #bcd8ff;
  background: #1d385f;
}
:global(.dark) .resource-tutor__quote button {
  color: #a5b8cf;
}
:global(.dark) .markdown-preview__content,
:global(.dark) .tutor-message__content {
  color: #cdd9e9;
  background: #172235;
  border-color: #314359;
}
:global(.dark) .markdown-preview__content :deep(blockquote),
:global(.dark) .mind-map__node {
  color: #c9d9ed;
  background: #1b2b42;
  border-color: #39516e;
}
:global(.dark) .mind-map > :deep(.mind-map__branch) > :deep(.mind-map__node) {
  color: #10233d;
  background: #8ab4f8;
  border-color: #8ab4f8;
}
:global(.dark) .tutor-message--student .tutor-message__content {
  color: #d5e7ff;
  background: #1c3a62;
  border-color: #366aa8;
}

:global(.dark) .quote-selection-action {
  border-color: #39516e;
  box-shadow: 0 8px 18px rgb(0 0 0 / 28%);
}

@media (max-width: 1180px) {
  .resource-card-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .resource-workbench__body {
    grid-template-columns: minmax(0, 1fr);
    overflow: auto;
  }
  .resource-preview {
    border-bottom-left-radius: 0;
  }
  .resource-tutor {
    grid-column: 1 / -1;
    min-height: 360px;
    border-top: 1px solid var(--resource-border);
    border-left: 0;
    border-bottom-left-radius: 14px;
  }
  .resource-tutor__messages {
    max-height: 340px;
  }
  .workbench-skeleton {
    grid-template-columns: minmax(0, 1fr);
  }
  .workbench-skeleton__tutor {
    grid-column: 1 / -1;
    min-height: 360px;
  }
}

@media (max-width: 820px) {
  .student-resource-workbench {
    height: auto;
    min-height: 100%;
  }
  .resource-workbench__header {
    flex-wrap: wrap;
    align-items: flex-start;
    gap: 12px;
    padding: 14px 16px;
  }
  .resource-workbench__course-select {
    width: 100%;
  }
  .resource-workbench__course-select :deep(.el-select) {
    flex: 1;
    width: auto;
  }
  .resource-workbench__body {
    display: flex;
    flex-direction: column;
    gap: 14px;
    padding: 14px;
    overflow: visible;
  }
  .resource-overview {
    padding: 18px 14px;
  }
  .resource-card-grid {
    grid-template-columns: 1fr;
  }
  .resource-overview__header {
    align-items: flex-start;
    flex-direction: column;
    gap: 8px;
  }
  .resource-overview__toolbar {
    align-items: flex-start;
    flex-direction: column;
    gap: 8px;
    margin-top: 18px;
  }
  .resource-overview__toolbar :deep(.el-input) {
    width: 100%;
  }
  .resource-rail {
    min-height: 214px;
    border-right: 0;
    border-bottom: 1px solid var(--resource-border);
  }
  .resource-rail__list {
    flex-direction: row;
    flex: initial;
    min-height: 92px;
    padding-bottom: 10px;
    overflow-x: auto;
  }
  .resource-rail__item {
    flex: 0 0 236px;
  }
  .resource-preview {
    min-height: 590px;
  }
  .resource-tutor {
    min-height: 420px;
  }
  .workbench-skeleton {
    display: block;
  }
  .workbench-skeleton__rail,
  .workbench-skeleton__preview,
  .workbench-skeleton__tutor {
    height: 180px;
    margin-bottom: 1px;
  }
}

@media (max-width: 560px) {
  .resource-workbench__heading h1 {
    font-size: 1rem;
  }
  .resource-workbench__course-select label {
    display: none;
  }
  .resource-preview__canvas {
    min-height: 430px;
    padding: 10px;
  }
  .resource-preview__header {
    padding: 10px 12px;
  }
  .resource-preview__back {
    margin-left: -8px;
  }
  .resource-preview__title h2 {
    max-width: 30ch;
  }
  .mind-map-preview__viewport {
    padding: 24px;
  }
  .mind-map__node {
    max-width: 24ch;
    font-size: 0.8125rem;
  }
  .markdown-preview__content {
    padding: 22px 18px;
    font-size: 0.9375rem;
  }
  .resource-tutor__messages {
    max-height: 390px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .resource-rail__item,
  .resource-tutor__suggestions button {
    transition: none;
  }
}

:global(.dark) .preview-detail-loading {
  color: #b9d0ff;
  background: rgb(18 27 42 / 94%);
  border-color: rgb(142 175 255 / 32%);
}
</style>
