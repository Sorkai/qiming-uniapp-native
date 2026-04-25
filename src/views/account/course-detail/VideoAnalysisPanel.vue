<template>
  <div class="video-analysis-panel" :class="currentTheme">
    <!-- 加载状态 -->
    <div v-if="loading" class="panel-loading">
      <div class="loading-spinner" />
      <span>正在加载视频分析数据...</span>
    </div>

    <!-- 无任务状态 -->
    <div v-else-if="!taskData" class="panel-empty">
      <div class="empty-icon">
        <svg
          viewBox="0 0 24 24"
          width="48"
          height="48"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
        >
          <path
            d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
          />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      </div>
      <span>暂无视频分析数据</span>
    </div>

    <!-- 处理中状态 -->
    <div v-else-if="taskData.status !== 'completed'" class="panel-processing">
      <div class="processing-header">
        <div class="status-badge processing">
          <span class="status-dot" />
          {{ statusText }}
        </div>
        <span class="file-name">{{ taskData.fileName }}</span>
      </div>
      <div class="progress-bar">
        <div
          class="progress-fill"
          :style="{ width: `${taskData.progress ?? 0}%` }"
        />
      </div>
      <p class="processing-msg">{{ taskData.message || "正在分析中..." }}</p>
    </div>

    <!-- 分析结果展示 -->
    <div v-else class="panel-result">
      <!-- 结果信息头 -->
      <div class="result-header">
        <div class="result-meta">
          <span class="status-badge completed">
            <span class="status-dot" />
            分析完成
          </span>
          <span
            v-if="moduleData?.fileName"
            class="meta-item file-name-tag"
            :title="moduleData.fileName"
          >
            <svg
              viewBox="0 0 24 24"
              width="14"
              height="14"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
              />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            {{ moduleData.fileName }}
          </span>
        </div>
        <div class="result-times">
          <span v-if="moduleData?.createdAt" class="meta-item">
            <svg
              viewBox="0 0 24 24"
              width="13"
              height="13"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            创建: {{ formatDatetime(moduleData.createdAt) }}
          </span>
          <span v-if="moduleData?.completedAt" class="meta-item">
            <svg
              viewBox="0 0 24 24"
              width="13"
              height="13"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            完成: {{ formatDatetime(moduleData.completedAt) }}
          </span>
          <span v-if="moduleData?.schemaVersion" class="meta-item version-tag">
            v{{ moduleData.schemaVersion }}
          </span>
        </div>
      </div>

      <!-- 模块标签切换 -->
      <div class="module-tabs">
        <button
          v-for="tab in availableTabs"
          :key="tab.key"
          class="tab-btn"
          :class="{ active: activeTab === tab.key }"
          @click="activeTab = tab.key"
        >
          <component :is="tab.icon" />
          {{ tab.label }}
        </button>
      </div>

      <!-- 摘要 -->
      <div v-if="activeTab === 'summary'" class="module-content">
        <div class="summary-block">
          <div class="section-header">
            <span class="ai-badge">AI 生成</span>
          </div>
          <p class="summary-text">
            {{ moduleData?.summary?.text || "暂无摘要" }}
          </p>
        </div>
      </div>

      <!-- 章节速览 -->
      <div v-if="activeTab === 'chapters'" class="module-content">
        <div
          v-for="(ch, idx) in moduleData?.chapters || []"
          :key="idx"
          class="chapter-item"
          @click="$emit('seek-video', ch.startTime)"
        >
          <div class="chapter-time">
            <span class="time-badge">{{ formatTime(ch.startTime) }}</span>
            <span v-if="ch.endTime" class="time-range"
              >~ {{ formatTime(ch.endTime) }}</span
            >
          </div>
          <div class="chapter-info">
            <h4 class="chapter-title">{{ ch.title }}</h4>
            <p class="chapter-summary">{{ ch.summary }}</p>
            <span v-if="ch.endTime" class="chapter-duration"
              >时长 {{ formatDuration(ch.startTime, ch.endTime) }}</span
            >
          </div>
        </div>
        <div v-if="!moduleData?.chapters?.length" class="module-empty">
          暂无章节数据
        </div>
      </div>

      <!-- 问答回顾 -->
      <div v-if="activeTab === 'qa'" class="module-content">
        <div
          v-for="(qa, idx) in moduleData?.qaItems || []"
          :key="idx"
          class="qa-item"
        >
          <div class="qa-question">
            <span class="qa-icon q">Q</span>
            <span>{{ qa.question }}</span>
          </div>
          <div class="qa-answer">
            <span class="qa-icon a">A</span>
            <span>{{ qa.answer }}</span>
          </div>
        </div>
        <div v-if="!moduleData?.qaItems?.length" class="module-empty">
          暂无问答数据
        </div>
      </div>

      <!-- 转写文本 -->
      <div v-if="activeTab === 'transcription'" class="module-content">
        <div class="transcription-block">
          <p class="transcription-text">
            {{ moduleData?.transcription?.text || "暂无转写文本" }}
          </p>
        </div>
      </div>

      <!-- 要点提炼 -->
      <div v-if="activeTab === 'meeting'" class="module-content">
        <div
          v-if="moduleData?.meeting?.keywords?.length"
          class="meeting-section"
        >
          <h4 class="meeting-label">关键词</h4>
          <div class="keyword-tags">
            <span
              v-for="(kw, idx) in moduleData.meeting.keywords"
              :key="idx"
              class="keyword-tag"
            >
              {{ kw }}
            </span>
          </div>
        </div>
        <div
          v-if="moduleData?.meeting?.keyInformation?.length"
          class="meeting-section"
        >
          <h4 class="meeting-label">重点内容</h4>
          <ul class="key-info-list">
            <li
              v-for="(info, idx) in moduleData.meeting.keyInformation"
              :key="idx"
            >
              {{ info }}
            </li>
          </ul>
        </div>
        <div
          v-if="
            !moduleData?.meeting?.keywords?.length &&
            !moduleData?.meeting?.keyInformation?.length
          "
          class="module-empty"
        >
          暂无要点数据
        </div>
      </div>

      <!-- 思维导图 -->
      <div v-if="activeTab === 'mindmap'" class="module-content">
        <div
          v-if="mindmapNodes.length"
          class="mindmap-block"
        >
          <div class="mindmap-toolbar">
            <button class="mindmap-action" @click="resetMindmapLayout">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="1 4 1 10 7 10" />
                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
              </svg>
              重置布局
            </button>
          </div>
          <div
            ref="mindmapContainerRef"
            class="mindmap-canvas"
            @mousedown="onCanvasDragStart"
            @mousemove="onCanvasDragMove"
            @mouseup="onCanvasDragEnd"
            @mouseleave="onCanvasDragEnd"
            @wheel.prevent="onCanvasWheel"
          >
            <svg
              class="mindmap-svg"
              :style="{
                transform: `translate(${canvasPan.x}px, ${canvasPan.y}px) scale(${canvasScale})`
              }"
            >
              <!-- 连线 -->
              <line
                v-for="(edge, idx) in mindmapEdges"
                :key="'e' + idx"
                :x1="edge.x1"
                :y1="edge.y1"
                :x2="edge.x2"
                :y2="edge.y2"
                class="mindmap-edge"
                :class="'edge-depth-' + edge.depth"
              />
              <!-- 节点 -->
              <g
                v-for="node in mindmapNodes"
                :key="node.id"
                :transform="`translate(${node.x}, ${node.y})`"
                class="mindmap-node"
                :class="[
                  'node-depth-' + node.depth,
                  { 'node-dragging': draggingNodeId === node.id }
                ]"
                @mousedown.stop="onNodeDragStart($event, node)"
              >
                <circle
                  :r="node.depth === 0 ? 42 : node.depth === 1 ? 34 : 26"
                  class="node-circle"
                />
                <text
                  dy="0.35em"
                  text-anchor="middle"
                  class="node-label"
                >
                  <template v-if="node.label.length <= 5">
                    {{ node.label }}
                  </template>
                  <template v-else>
                    <tspan
                      v-for="(line, li) in wrapText(node.label, node.depth === 0 ? 4 : node.depth === 1 ? 3 : 3)"
                      :key="li"
                      x="0"
                      :dy="li === 0 ? `${-(wrapText(node.label, node.depth === 0 ? 4 : node.depth === 1 ? 3 : 3).length - 1) * 0.6}em` : '1.2em'"
                    >{{ line }}</tspan>
                  </template>
                </text>
              </g>
            </svg>
          </div>
        </div>
        <div v-else class="module-empty">暂无思维导图</div>
      </div>

      <!-- PPT 抽取 -->
      <div v-if="activeTab === 'ppt'" class="module-content">
        <div
          v-for="(page, idx) in moduleData?.pptPages || []"
          :key="idx"
          class="ppt-item"
          @click="$emit('seek-video', page.startTime)"
        >
          <div class="ppt-thumb">
            <img :src="page.imageUrl" :alt="`第${page.pageIndex}页`" />
          </div>
          <div class="ppt-info">
            <span class="ppt-page">第 {{ page.pageIndex }} 页</span>
            <span class="ppt-time">
              {{ formatTime(page.startTime) }}
              <template v-if="page.endTime">
                ~ {{ formatTime(page.endTime) }}</template
              >
            </span>
            <p class="ppt-summary">{{ page.summary }}</p>
          </div>
        </div>
        <div v-if="!moduleData?.pptPages?.length" class="module-empty">
          暂无 PPT 数据
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed, h, nextTick } from "vue";
import {
  getVideoAnalyzeTask,
  getVideoAnalyzeModules,
  getVideoAnalyzeResult,
  type VideoAnalyzeTask,
  type VideoAnalyzeModuleResult
} from "@/api/frontend/videoAnalysis";

const props = defineProps<{
  courseId: number;
  chapterId: number;
  currentTheme: string;
  currentHourTitle?: string;
}>();

defineEmits(["seek-video"]);

const loading = ref(false);
const taskData = ref<VideoAnalyzeTask | null>(null);
const moduleData = ref<VideoAnalyzeModuleResult | null>(null);
const activeTab = ref("chapters");
const mindmapZoomed = ref(false);

// ---- 思维导图交互 ----
interface MindmapNodeData {
  id: string;
  label: string;
  children?: MindmapNodeData[];
}
interface MindmapNode {
  id: string;
  label: string;
  depth: number;
  x: number;
  y: number;
  parentId: string | null;
}
interface MindmapEdge {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  depth: number;
}

const mindmapContainerRef = ref<HTMLElement | null>(null);
const mindmapNodes = ref<MindmapNode[]>([]);
const draggingNodeId = ref<string | null>(null);
const dragOffset = reactive({ x: 0, y: 0 });
const canvasPan = reactive({ x: 0, y: 0 });
const canvasScale = ref(1);
const isPanningCanvas = ref(false);
const panStart = reactive({ x: 0, y: 0 });

const mindmapEdges = computed<MindmapEdge[]>(() => {
  const nodeMap = new Map(mindmapNodes.value.map(n => [n.id, n]));
  const edges: MindmapEdge[] = [];
  for (const node of mindmapNodes.value) {
    if (node.parentId) {
      const parent = nodeMap.get(node.parentId);
      if (parent) {
        edges.push({
          x1: parent.x,
          y1: parent.y,
          x2: node.x,
          y2: node.y,
          depth: node.depth
        });
      }
    }
  }
  return edges;
});

const wrapText = (text: string, charsPerLine: number): string[] => {
  const lines: string[] = [];
  for (let i = 0; i < text.length; i += charsPerLine) {
    lines.push(text.slice(i, i + charsPerLine));
  }
  return lines;
};

const flattenTree = (
  tree: MindmapNodeData,
  depth: number,
  parentId: string | null,
  cx: number,
  cy: number,
  angleStart: number,
  angleEnd: number,
  result: MindmapNode[]
) => {
  result.push({ id: tree.id, label: tree.label, depth, x: cx, y: cy, parentId });
  const children = tree.children || [];
  if (!children.length) return;
  const radiusMap = [0, 180, 140, 110];
  const radius = radiusMap[Math.min(depth + 1, 3)];
  const spread = angleEnd - angleStart;
  children.forEach((child, i) => {
    const frac = children.length === 1 ? 0.5 : i / (children.length - 1);
    const angle = angleStart + spread * frac;
    const rad = (angle * Math.PI) / 180;
    const childX = cx + radius * Math.cos(rad);
    const childY = cy + radius * Math.sin(rad);
    const childSpread = spread / children.length;
    flattenTree(child, depth + 1, tree.id, childX, childY, angle - childSpread / 2, angle + childSpread / 2, result);
  });
};

const buildMindmapFromData = () => {
  const tree = moduleData.value?.mindMap?.tree as MindmapNodeData | undefined;
  if (!tree) {
    mindmapNodes.value = [];
    return;
  }
  const nodes: MindmapNode[] = [];
  flattenTree(tree, 0, null, 450, 300, 0, 360, nodes);
  mindmapNodes.value = nodes;
  canvasPan.x = 0;
  canvasPan.y = 0;
  canvasScale.value = 1;
};

const resetMindmapLayout = () => {
  buildMindmapFromData();
};

// Node drag
const onNodeDragStart = (e: MouseEvent, node: MindmapNode) => {
  draggingNodeId.value = node.id;
  const rect = mindmapContainerRef.value?.getBoundingClientRect();
  if (!rect) return;
  dragOffset.x = (e.clientX - rect.left - canvasPan.x) / canvasScale.value - node.x;
  dragOffset.y = (e.clientY - rect.top - canvasPan.y) / canvasScale.value - node.y;
  e.preventDefault();
};

// Canvas pan / node move
const onCanvasDragStart = (e: MouseEvent) => {
  if (draggingNodeId.value) return;
  isPanningCanvas.value = true;
  panStart.x = e.clientX - canvasPan.x;
  panStart.y = e.clientY - canvasPan.y;
};

const onCanvasDragMove = (e: MouseEvent) => {
  if (draggingNodeId.value) {
    const rect = mindmapContainerRef.value?.getBoundingClientRect();
    if (!rect) return;
    const node = mindmapNodes.value.find(n => n.id === draggingNodeId.value);
    if (node) {
      node.x = (e.clientX - rect.left - canvasPan.x) / canvasScale.value - dragOffset.x;
      node.y = (e.clientY - rect.top - canvasPan.y) / canvasScale.value - dragOffset.y;
    }
    return;
  }
  if (isPanningCanvas.value) {
    canvasPan.x = e.clientX - panStart.x;
    canvasPan.y = e.clientY - panStart.y;
  }
};

const onCanvasDragEnd = () => {
  draggingNodeId.value = null;
  isPanningCanvas.value = false;
};

const onCanvasWheel = (e: WheelEvent) => {
  const delta = e.deltaY > 0 ? -0.08 : 0.08;
  canvasScale.value = Math.max(0.3, Math.min(2.5, canvasScale.value + delta));
};

const statusText = computed(() => {
  const s = taskData.value?.status;
  if (s === "processing") return "处理中";
  if (s === "pending") return "等待中";
  if (s === "failed") return "处理失败";
  return s || "未知";
});

// Tab 图标用 render function
const IconSummary = () =>
  h(
    "svg",
    {
      viewBox: "0 0 24 24",
      width: 16,
      height: 16,
      fill: "none",
      stroke: "currentColor",
      "stroke-width": 2
    },
    [
      h("path", {
        d: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
      }),
      h("polyline", { points: "14 2 14 8 20 8" })
    ]
  );

const IconChapters = () =>
  h(
    "svg",
    {
      viewBox: "0 0 24 24",
      width: 16,
      height: 16,
      fill: "none",
      stroke: "currentColor",
      "stroke-width": 2
    },
    [
      h("line", { x1: 8, y1: 6, x2: 21, y2: 6 }),
      h("line", { x1: 8, y1: 12, x2: 21, y2: 12 }),
      h("line", { x1: 8, y1: 18, x2: 21, y2: 18 }),
      h("line", { x1: 3, y1: 6, x2: 3.01, y2: 6 }),
      h("line", { x1: 3, y1: 12, x2: 3.01, y2: 12 }),
      h("line", { x1: 3, y1: 18, x2: 3.01, y2: 18 })
    ]
  );

const IconQa = () =>
  h(
    "svg",
    {
      viewBox: "0 0 24 24",
      width: 16,
      height: 16,
      fill: "none",
      stroke: "currentColor",
      "stroke-width": 2
    },
    [
      h("circle", { cx: 12, cy: 12, r: 10 }),
      h("path", { d: "M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" }),
      h("line", { x1: 12, y1: 17, x2: 12.01, y2: 17 })
    ]
  );

const IconTranscription = () =>
  h(
    "svg",
    {
      viewBox: "0 0 24 24",
      width: 16,
      height: 16,
      fill: "none",
      stroke: "currentColor",
      "stroke-width": 2
    },
    [
      h("path", { d: "M4 7V4h16v3" }),
      h("path", { d: "M9 20h6" }),
      h("path", { d: "M12 4v16" })
    ]
  );

const IconMeeting = () =>
  h(
    "svg",
    {
      viewBox: "0 0 24 24",
      width: 16,
      height: 16,
      fill: "none",
      stroke: "currentColor",
      "stroke-width": 2
    },
    [
      h("polygon", {
        points:
          "12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
      })
    ]
  );

const IconMindmap = () =>
  h(
    "svg",
    {
      viewBox: "0 0 24 24",
      width: 16,
      height: 16,
      fill: "none",
      stroke: "currentColor",
      "stroke-width": 2
    },
    [
      h("circle", { cx: 12, cy: 12, r: 3 }),
      h("path", { d: "M12 2v7" }),
      h("path", { d: "M12 15v7" }),
      h("path", { d: "M2 12h7" }),
      h("path", { d: "M15 12h7" })
    ]
  );

const IconPpt = () =>
  h(
    "svg",
    {
      viewBox: "0 0 24 24",
      width: 16,
      height: 16,
      fill: "none",
      stroke: "currentColor",
      "stroke-width": 2
    },
    [
      h("rect", { x: 2, y: 3, width: 20, height: 14, rx: 2, ry: 2 }),
      h("line", { x1: 8, y1: 21, x2: 16, y2: 21 }),
      h("line", { x1: 12, y1: 17, x2: 12, y2: 21 })
    ]
  );

const allTabs = [
  { key: "summary", label: "摘要", icon: IconSummary },
  { key: "chapters", label: "章节速览", icon: IconChapters },
  { key: "qa", label: "问答回顾", icon: IconQa },
  { key: "meeting", label: "要点提炼", icon: IconMeeting },
  { key: "transcription", label: "转写文本", icon: IconTranscription },
  { key: "mindmap", label: "思维导图", icon: IconMindmap },
  { key: "ppt", label: "PPT", icon: IconPpt }
];

const availableTabs = computed(() => {
  return allTabs;
});

const formatTime = (ms: number | undefined | null) => {
  if (ms == null) return "--:--";
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");
  return hours > 0 ? `${hours}:${mm}:${ss}` : `${mm}:${ss}`;
};

const formatDuration = (
  startMs: number | null | undefined,
  endMs: number | null | undefined
) => {
  if (startMs == null || endMs == null) return "";
  const diff = Math.max(0, endMs - startMs);
  const totalSec = Math.floor(diff / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return m > 0 ? `${m}分${s}秒` : `${s}秒`;
};

const formatDatetime = (dt: string | undefined | null) => {
  if (!dt) return "";
  try {
    const d = new Date(dt);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  } catch {
    return dt;
  }
};

const normalizeLessonText = (value: string) => {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/\.[a-z0-9]{2,6}$/i, "")
    .replace(/[\s_\-—–()（）\[\]【】《》:：'"`·]/g, "")
    .replace(/^第?\d+(\.\d+)?[章节课讲]?/, "");
};

const extractLessonIndex = (value: string): string | null => {
  const raw = String(value || "").toLowerCase();

  // 1.2 / 1-2 / 1_2
  const pair = raw.match(/(\d{1,2})\s*[._\-]\s*(\d{1,2})/);
  if (pair) return `${Number(pair[1])}.${Number(pair[2])}`;

  // 第1章第2节
  const zh = raw.match(/第\s*(\d{1,2})\s*章[^\d]{0,6}第\s*(\d{1,2})\s*[节课讲]/);
  if (zh) return `${Number(zh[1])}.${Number(zh[2])}`;

  return null;
};

const isLikelySameLesson = (fileName: string, hourTitle: string) => {
  const fileIndex = extractLessonIndex(fileName);
  const hourIndex = extractLessonIndex(hourTitle);

  // 如果两边都能提取出课时序号，则必须完全一致
  if (fileIndex && hourIndex) {
    return fileIndex === hourIndex;
  }

  const fileNorm = normalizeLessonText(fileName);
  const hourNorm = normalizeLessonText(hourTitle);
  if (!fileNorm || !hourNorm) return true;
  return fileNorm === hourNorm || fileNorm.includes(hourNorm) || hourNorm.includes(fileNorm);
};

const requestSeq = ref(0);

const isStaleRequest = (
  requestId: number,
  requestCourseId: number,
  requestChapterId: number
) => {
  return (
    requestId !== requestSeq.value ||
    requestCourseId !== props.courseId ||
    requestChapterId !== props.chapterId
  );
};

const fetchAnalysis = async () => {
  if (!props.courseId || !props.chapterId) return;

  const requestCourseId = props.courseId;
  const requestChapterId = props.chapterId;
  const requestId = ++requestSeq.value;

  loading.value = true;
  taskData.value = null;
  moduleData.value = null;

  try {
    // 1. 获取任务
    const taskRes = await getVideoAnalyzeTask({
      courseId: requestCourseId,
      chapterId: requestChapterId
    });

    if (isStaleRequest(requestId, requestCourseId, requestChapterId)) {
      return;
    }

    if (!taskRes.data) {
      taskData.value = null;
      return;
    }

    if (
      taskRes.data.courseId &&
      taskRes.data.chapterId &&
      (taskRes.data.courseId !== requestCourseId ||
        taskRes.data.chapterId !== requestChapterId)
    ) {
      console.warn("[VideoAnalysisPanel] task course/chapter mismatch", {
        requestCourseId,
        requestChapterId,
        taskCourseId: taskRes.data.courseId,
        taskChapterId: taskRes.data.chapterId,
        taskId: taskRes.data.taskId
      });
      return;
    }

    // 仅做宽松一致性校验，不再因文件名格式差异直接拦截展示
    if (
      props.currentHourTitle &&
      taskRes.data.fileName &&
      !isLikelySameLesson(taskRes.data.fileName, props.currentHourTitle)
    ) {
      console.warn("[VideoAnalysisPanel] fileName/title mismatch", {
        fileName: taskRes.data.fileName,
        currentHourTitle: props.currentHourTitle
      });
      taskData.value = null;
      moduleData.value = null;
      return;
    }

    taskData.value = taskRes.data;

    // 2. 如果任务已完成，获取模块化结果
    if (taskRes.data.status === "completed" && taskRes.data.taskId) {
      const moduleRes = await getVideoAnalyzeModules({
        taskId: taskRes.data.taskId,
        modules: "summary,chapters,qa,transcription,meeting,mindmap,ppt"
      });

      if (isStaleRequest(requestId, requestCourseId, requestChapterId)) {
        return;
      }

      if (moduleRes.data) {
        if (
          moduleRes.data.courseId &&
          moduleRes.data.chapterId &&
          (moduleRes.data.courseId !== requestCourseId ||
            moduleRes.data.chapterId !== requestChapterId)
        ) {
          console.warn("[VideoAnalysisPanel] modules course/chapter mismatch", {
            requestCourseId,
            requestChapterId,
            moduleCourseId: moduleRes.data.courseId,
            moduleChapterId: moduleRes.data.chapterId,
            taskId: taskRes.data.taskId
          });
          return;
        }

        // 兼容后端直接返回 mindMapUrl 字符串而非 mindMap 对象的情况
        const raw = moduleRes.data as any;
        if (!moduleRes.data.mindMap?.url && raw.mindMapUrl) {
          moduleRes.data.mindMap = { url: raw.mindMapUrl };
        }
        moduleData.value = moduleRes.data;
        nextTick(() => buildMindmapFromData());
      }

      // 如果模块化接口未返回思维导图，尝试从完整结果接口获取
      if (!moduleData.value?.mindMap?.url) {
        try {
          const fullRes = await getVideoAnalyzeResult({
            taskId: taskRes.data.taskId
          });

          if (isStaleRequest(requestId, requestCourseId, requestChapterId)) {
            return;
          }

          if (fullRes.data?.mindMapUrl) {
            if (!moduleData.value) {
              moduleData.value = {} as VideoAnalyzeModuleResult;
            }
            moduleData.value.mindMap = { url: fullRes.data.mindMapUrl };
          }
        } catch {
          // 忽略回退请求失败
        }
      }
    }
  } catch {
    if (!isStaleRequest(requestId, requestCourseId, requestChapterId)) {
      taskData.value = null;
    }
  } finally {
    if (!isStaleRequest(requestId, requestCourseId, requestChapterId)) {
      loading.value = false;
    }
  }
};

watch(
  () => [props.courseId, props.chapterId, props.currentHourTitle],
  () => {
    activeTab.value = "chapters";
    fetchAnalysis();
  },
  { immediate: true }
);
</script>

<style scoped lang="scss">
$primary: #6366f1;
$primary-light: #818cf8;
$accent: #f43f5e;
$success: #10b981;

$gray-50: #f8fafc;
$gray-100: #f1f5f9;
$gray-200: #e2e8f0;
$gray-300: #cbd5e1;
$gray-400: #94a3b8;
$gray-500: #64748b;
$gray-600: #475569;
$gray-700: #334155;
$gray-800: #1e293b;

$radius-md: 12px;
$radius-lg: 16px;

.video-analysis-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* 加载态 */
.panel-loading {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: $gray-400;
  font-size: 14px;

  .loading-spinner {
    width: 32px;
    height: 32px;
    border: 3px solid $gray-200;
    border-top-color: $primary;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  .dark & {
    color: $gray-500;
    .loading-spinner {
      border-color: rgb(255 255 255 / 10%);
      border-top-color: $primary-light;
    }
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 空态 */
.panel-empty {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: $gray-400;
  font-size: 14px;

  .empty-icon {
    opacity: 0.4;
  }

  .dark & {
    color: $gray-500;
  }
}

/* 处理中 */
.panel-processing {
  padding: 20px 0;

  .processing-header {
    display: flex;
    gap: 12px;
    align-items: center;
    margin-bottom: 16px;
  }

  .status-badge {
    &.processing {
      color: #d97706;
      background: rgb(245 158 11 / 10%);
    }

    .status-dot {
      animation: blink 1.4s ease-in-out infinite;
    }
  }

  .file-name {
    font-size: 13px;
    color: $gray-500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .progress-bar {
    height: 6px;
    background: $gray-100;
    border-radius: 3px;
    overflow: hidden;
    margin-bottom: 8px;

    .dark & {
      background: rgb(255 255 255 / 10%);
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, $primary, $primary-light);
      border-radius: 3px;
      transition: width 0.3s ease;
    }
  }

  .processing-msg {
    margin: 0;
    font-size: 13px;
    color: $gray-400;
  }
}

@keyframes blink {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.4;
  }
}

/* 结果信息头 */
.result-header {
  padding-bottom: 14px;
  margin-bottom: 4px;
  border-bottom: 1px solid rgb(0 0 0 / 5%);

  .dark & {
    border-bottom-color: rgb(255 255 255 / 5%);
  }
}

.result-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}

.result-times {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
}

.meta-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: $gray-400;

  svg {
    flex-shrink: 0;
  }

  .dark & {
    color: $gray-500;
  }
}

.file-name-tag {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: $gray-500;
  font-weight: 500;

  .dark & {
    color: $gray-400;
  }
}

.version-tag {
  padding: 1px 6px;
  font-size: 11px;
  font-family: monospace;
  color: $gray-400;
  background: rgb(0 0 0 / 4%);
  border-radius: 4px;

  .dark & {
    background: rgb(255 255 255 / 6%);
    color: $gray-500;
  }
}

.status-badge {
  display: flex;
  gap: 6px;
  align-items: center;
  padding: 4px 12px;
  font-size: 12px;
  font-weight: 600;
  border-radius: 20px;

  &.completed {
    color: $success;
    background: rgb(16 185 129 / 10%);
  }

  .status-dot {
    width: 6px;
    height: 6px;
    background: currentColor;
    border-radius: 50%;
  }
}

/* 模块标签 */
.module-tabs {
  display: flex;
  gap: 4px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgb(0 0 0 / 5%);
  overflow-x: auto;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }

  .dark & {
    border-bottom-color: rgb(255 255 255 / 5%);
  }

  .tab-btn {
    display: flex;
    gap: 6px;
    align-items: center;
    padding: 8px 14px;
    font-size: 13px;
    font-weight: 500;
    color: $gray-500;
    white-space: nowrap;
    cursor: pointer;
    background: none;
    border: 1px solid transparent;
    border-radius: 20px;
    transition: all 0.2s ease;

    &:hover {
      color: $primary;
      background: rgb(99 102 241 / 5%);
    }

    &.active {
      color: $primary;
      background: rgb(99 102 241 / 10%);
      border-color: rgb(99 102 241 / 20%);
      font-weight: 600;
    }

    .dark & {
      color: $gray-400;

      &:hover {
        color: $primary-light;
        background: rgb(99 102 241 / 10%);
      }

      &.active {
        color: $primary-light;
        background: rgb(99 102 241 / 15%);
        border-color: rgb(99 102 241 / 25%);
      }
    }
  }
}

/* 模块内容 */
.module-content {
  padding-top: 16px;
}

.module-empty {
  padding: 32px 0;
  text-align: center;
  color: $gray-400;
  font-size: 14px;

  .dark & {
    color: $gray-500;
  }
}

/* 摘要 */
.summary-block {
  .section-header {
    margin-bottom: 12px;
  }

  .ai-badge {
    padding: 4px 10px;
    font-size: 11px;
    font-weight: 600;
    color: $accent;
    background: rgb(244 63 94 / 10%);
    border-radius: 20px;
  }

  .summary-text {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    line-height: 1.8;
    color: $gray-600;
    white-space: pre-wrap;

    .dark & {
      color: $gray-300;
    }
  }
}

/* 章节速览 */
.chapter-item {
  display: flex;
  gap: 14px;
  padding: 14px 0;
  cursor: pointer;
  border-bottom: 1px solid rgb(0 0 0 / 5%);
  transition: background 0.15s;

  &:hover {
    background: rgb(99 102 241 / 3%);
  }

  &:last-child {
    border-bottom: none;
  }

  .dark & {
    border-bottom-color: rgb(255 255 255 / 5%);
  }

  .time-badge {
    display: inline-block;
    padding: 2px 8px;
    font-size: 12px;
    font-weight: 600;
    font-family: monospace;
    color: $primary;
    background: rgb(99 102 241 / 10%);
    border-radius: 6px;
    white-space: nowrap;
  }

  .chapter-title {
    margin: 0 0 4px;
    font-size: 14px;
    font-weight: 600;
    color: $gray-700;

    .dark & {
      color: $gray-200;
    }
  }

  .chapter-summary {
    margin: 0;
    font-size: 13px;
    line-height: 1.6;
    color: $gray-500;

    .dark & {
      color: $gray-400;
    }
  }

  .chapter-duration {
    display: inline-block;
    margin-top: 4px;
    font-size: 11px;
    color: $gray-400;
    background: rgb(0 0 0 / 3%);
    padding: 1px 8px;
    border-radius: 10px;

    .dark & {
      color: $gray-500;
      background: rgb(255 255 255 / 5%);
    }
  }

  .time-range {
    font-size: 11px;
    color: $gray-400;
    font-family: monospace;
    margin-left: 2px;

    .dark & {
      color: $gray-500;
    }
  }
}

/* 问答回顾 */
.qa-item {
  padding: 14px 0;
  border-bottom: 1px solid rgb(0 0 0 / 5%);

  &:last-child {
    border-bottom: none;
  }

  .dark & {
    border-bottom-color: rgb(255 255 255 / 5%);
  }
}

.qa-question,
.qa-answer {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  font-size: 14px;
  line-height: 1.6;
}

.qa-question {
  color: $gray-700;
  margin-bottom: 8px;

  .dark & {
    color: $gray-200;
  }
}

.qa-answer {
  color: $gray-500;

  .dark & {
    color: $gray-400;
  }
}

.qa-icon {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  font-size: 12px;
  font-weight: 700;
  color: #fff;
  border-radius: 50%;

  &.q {
    background: $primary;
  }

  &.a {
    background: $success;
  }
}

/* 转写文本 */
.transcription-text {
  margin: 0;
  font-size: 14px;
  line-height: 1.8;
  color: $gray-600;
  white-space: pre-wrap;

  .dark & {
    color: $gray-300;
  }
}

/* 要点提炼 */
.meeting-section {
  margin-bottom: 20px;

  &:last-child {
    margin-bottom: 0;
  }
}

.meeting-label {
  margin: 0 0 10px;
  font-size: 14px;
  font-weight: 600;
  color: $gray-700;

  .dark & {
    color: $gray-200;
  }
}

.keyword-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.keyword-tag {
  padding: 4px 12px;
  font-size: 13px;
  color: $primary;
  background: rgb(99 102 241 / 10%);
  border-radius: 14px;

  .dark & {
    color: $primary-light;
    background: rgb(99 102 241 / 15%);
  }
}

.key-info-list {
  margin: 0;
  padding-left: 20px;

  li {
    padding: 4px 0;
    font-size: 14px;
    line-height: 1.6;
    color: $gray-600;

    .dark & {
      color: $gray-300;
    }
  }
}

/* 思维导图 */
.mindmap-block {
  .mindmap-toolbar {
    display: flex;
    gap: 8px;
    margin-bottom: 12px;
  }

  .mindmap-action {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 6px 12px;
    font-size: 12px;
    color: $gray-500;
    background: $gray-50;
    border: 1px solid $gray-200;
    border-radius: 8px;
    cursor: pointer;
    text-decoration: none;
    transition: all 0.15s;

    &:hover {
      color: $primary;
      border-color: $primary;
      background: rgb(99 102 241 / 5%);
    }

    .dark & {
      color: $gray-400;
      background: rgb(255 255 255 / 5%);
      border-color: rgb(255 255 255 / 10%);

      &:hover {
        color: $primary-light;
        border-color: $primary-light;
      }
    }
  }

  .mindmap-canvas {
    position: relative;
    width: 100%;
    height: 520px;
    overflow: hidden;
    border: 1px solid $gray-200;
    border-radius: $radius-md;
    background: linear-gradient(135deg, #f0f4ff 0%, #faf5ff 50%, #fff1f2 100%);
    cursor: grab;
    user-select: none;

    &:active {
      cursor: grabbing;
    }

    .dark & {
      border-color: rgb(255 255 255 / 8%);
      background: linear-gradient(135deg, rgb(30 30 60 / 80%) 0%, rgb(40 20 60 / 60%) 100%);
    }
  }

  .mindmap-svg {
    width: 900px;
    height: 600px;
    transform-origin: 0 0;
  }

  .mindmap-edge {
    stroke: $gray-300;
    stroke-width: 2;
    stroke-linecap: round;
    transition: all 0.15s ease;

    &.edge-depth-1 {
      stroke: $primary;
      stroke-width: 2.5;
      opacity: 0.5;
    }
    &.edge-depth-2 {
      stroke: $primary-light;
      stroke-width: 2;
      opacity: 0.4;
    }
    &.edge-depth-3 {
      stroke: $gray-300;
      stroke-width: 1.5;
      opacity: 0.35;
    }

    .dark & {
      stroke: rgb(255 255 255 / 15%);
      &.edge-depth-1 { stroke: $primary-light; opacity: 0.4; }
      &.edge-depth-2 { stroke: rgb(167 139 250 / 40%); }
    }
  }

  .mindmap-node {
    cursor: grab;
    transition: transform 0.08s ease;

    &.node-dragging {
      cursor: grabbing;
      .node-circle { filter: drop-shadow(0 6px 20px rgb(99 102 241 / 40%)); }
    }

    &.node-depth-0 .node-circle {
      fill: $primary;
      stroke: #fff;
      stroke-width: 3;
      filter: drop-shadow(0 4px 12px rgb(99 102 241 / 35%));
    }
    &.node-depth-0 .node-label {
      fill: #fff;
      font-size: 13px;
      font-weight: 700;
    }

    &.node-depth-1 .node-circle {
      fill: #818cf8;
      stroke: #fff;
      stroke-width: 2;
      filter: drop-shadow(0 3px 8px rgb(129 140 248 / 30%));
    }
    &.node-depth-1 .node-label {
      fill: #fff;
      font-size: 11px;
      font-weight: 600;
    }

    &.node-depth-2 .node-circle {
      fill: #c4b5fd;
      stroke: #fff;
      stroke-width: 1.5;
      filter: drop-shadow(0 2px 6px rgb(196 181 253 / 35%));
    }
    &.node-depth-2 .node-label {
      fill: $gray-700;
      font-size: 10px;
      font-weight: 500;
    }

    &:hover .node-circle {
      filter: drop-shadow(0 4px 16px rgb(99 102 241 / 50%)) brightness(1.1);
    }

    .dark & {
      &.node-depth-0 .node-circle { stroke: rgb(255 255 255 / 20%); }
      &.node-depth-1 .node-circle { stroke: rgb(255 255 255 / 15%); }
      &.node-depth-2 .node-circle {
        fill: rgb(167 139 250 / 60%);
        stroke: rgb(255 255 255 / 10%);
      }
      &.node-depth-2 .node-label { fill: rgb(255 255 255 / 80%); }
    }
  }
}

/* PPT */
.ppt-item {
  display: flex;
  gap: 14px;
  padding: 12px 0;
  cursor: pointer;
  border-bottom: 1px solid rgb(0 0 0 / 5%);
  transition: background 0.15s;

  &:hover {
    background: rgb(99 102 241 / 3%);
  }

  &:last-child {
    border-bottom: none;
  }

  .dark & {
    border-bottom-color: rgb(255 255 255 / 5%);
  }

  .ppt-thumb {
    flex-shrink: 0;
    width: 100px;
    height: 60px;
    overflow: hidden;
    border-radius: 8px;
    background: $gray-100;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .dark & {
      background: rgb(255 255 255 / 5%);
    }
  }

  .ppt-info {
    flex: 1;
    min-width: 0;
  }

  .ppt-page {
    font-size: 13px;
    font-weight: 600;
    color: $gray-700;
    margin-right: 8px;

    .dark & {
      color: $gray-200;
    }
  }

  .ppt-time {
    font-size: 12px;
    font-family: monospace;
    color: $primary;
  }

  .ppt-summary {
    margin: 4px 0 0;
    font-size: 13px;
    line-height: 1.5;
    color: $gray-500;

    .dark & {
      color: $gray-400;
    }
  }
}
</style>
