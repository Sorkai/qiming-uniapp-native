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
        <div v-if="moduleData?.mindMap?.url" class="mindmap-block">
          <div class="mindmap-toolbar">
            <button
              class="mindmap-action"
              @click="mindmapZoomed = !mindmapZoomed"
            >
              <svg
                viewBox="0 0 24 24"
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                <line v-if="!mindmapZoomed" x1="11" y1="8" x2="11" y2="14" />
                <line x1="8" y1="11" x2="14" y2="11" />
              </svg>
              {{ mindmapZoomed ? "缩小" : "放大" }}
            </button>
            <a
              class="mindmap-action"
              :href="moduleData.mindMap.url"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg
                viewBox="0 0 24 24"
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"
                />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
              新窗口打开
            </a>
          </div>
          <div class="mindmap-container" :class="{ zoomed: mindmapZoomed }">
            <img
              :src="moduleData.mindMap.url"
              alt="思维导图"
              class="mindmap-img"
            />
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
import { ref, watch, computed, h } from "vue";
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

const fetchAnalysis = async () => {
  if (!props.courseId || !props.chapterId) return;

  loading.value = true;
  taskData.value = null;
  moduleData.value = null;

  try {
    // 1. 获取任务
    const taskRes = await getVideoAnalyzeTask({
      courseId: props.courseId,
      chapterId: props.chapterId
    });

    if (!taskRes.data) {
      taskData.value = null;
      return;
    }

    // 如果传入了当前课时标题，且任务文件名不匹配，则视为无分析数据
    if (
      props.currentHourTitle &&
      taskRes.data.fileName &&
      taskRes.data.fileName !== props.currentHourTitle
    ) {
      taskData.value = null;
      return;
    }

    taskData.value = taskRes.data;

    // 2. 如果任务已完成，获取模块化结果
    if (taskRes.data.status === "completed" && taskRes.data.taskId) {
      const moduleRes = await getVideoAnalyzeModules({
        taskId: taskRes.data.taskId,
        modules: "summary,chapters,qa,transcription,meeting,mindmap,ppt"
      });
      if (moduleRes.data) {
        // 兼容后端直接返回 mindMapUrl 字符串而非 mindMap 对象的情况
        const raw = moduleRes.data as any;
        if (!moduleRes.data.mindMap?.url && raw.mindMapUrl) {
          moduleRes.data.mindMap = { url: raw.mindMapUrl };
        }
        moduleData.value = moduleRes.data;
      }

      // 如果模块化接口未返回思维导图，尝试从完整结果接口获取
      if (!moduleData.value?.mindMap?.url) {
        try {
          const fullRes = await getVideoAnalyzeResult({
            taskId: taskRes.data.taskId
          });
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
    taskData.value = null;
  } finally {
    loading.value = false;
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
    font-size: 14px;
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

  .mindmap-container {
    text-align: center;
    overflow: auto;
    max-height: 400px;
    border: 1px solid $gray-200;
    border-radius: $radius-md;
    background: $gray-50;
    transition: max-height 0.3s ease;

    &.zoomed {
      max-height: none;
    }

    .dark & {
      border-color: rgb(255 255 255 / 8%);
      background: rgb(255 255 255 / 3%);
    }
  }

  .mindmap-img {
    max-width: 100%;
    display: block;
    margin: 0 auto;
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
