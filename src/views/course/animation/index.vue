<template>
  <div
    :class="[
      'ai-animation-container m-3 flex gap-3 font-sans',
      isMobile ? 'is-mobile-layout' : 'h-[calc(100vh-140px)] overflow-hidden'
    ]"
  >
    <!-- 左侧课程选择 -->
    <div
      class="sidebar-card w-80 bg-[var(--el-bg-color-overlay)] rounded-2xl shadow-sm border border-[var(--el-border-color-light)] flex flex-col shrink-0 overflow-hidden transition-all duration-300 hover:shadow-lg"
    >
      <div
        class="header-section p-6 border-b border-[var(--el-border-color-light)] bg-[var(--el-fill-color-light)]/30"
      >
        <h3 class="font-bold flex items-center text-xl !mb-0">
          <div
            class="icon-box w-12 h-12 bg-gradient-to-br from-[var(--el-color-primary)] to-[var(--el-color-primary-dark-2)] rounded-xl mr-3 shadow-lg flex items-center justify-center transition-transform duration-300"
          >
            <img
              :src="htmlIconSvg"
              class="w-7 h-7 brightness-0 invert"
              alt="智能动画中心"
            />
          </div>
          智能动画中心
        </h3>
        <p
          class="header-subtitle text-sm text-[var(--el-text-color-placeholder)] ml-[60px]"
        >
          AI 辅助生成教学动画与演示
        </p>
      </div>

      <div class="p-6 space-y-6 flex-1 overflow-auto custom-scrollbar">
        <div class="space-y-3">
          <label
            class="text-base font-semibold text-[var(--el-text-color-secondary)] flex items-center"
          >
            <el-icon class="mr-2 text-[var(--el-color-primary)]"
              ><Reading
            /></el-icon>
            目标课程
          </label>
          <el-select
            v-model="selectedCourseId"
            filterable
            remote
            clearable
            placeholder="搜索或选择课程..."
            :remote-method="searchCourses"
            :loading="courseLoading"
            class="w-full !rounded-xl"
            size="large"
            @change="handleCourseChange"
          >
            <el-option
              v-for="c in courseOptions"
              :key="c.courseId"
              :label="c.title"
              :value="c.courseId"
            />
          </el-select>
        </div>

        <div class="space-y-3">
          <label
            class="text-base font-semibold text-[var(--el-text-color-secondary)] flex items-center"
          >
            <el-icon class="mr-2 text-[var(--el-color-primary)]"
              ><Management
            /></el-icon>
            对应章节
          </label>
          <el-select
            v-model="selectedChapterId"
            :disabled="!selectedCourseId"
            placeholder="请选择课程内的章节..."
            clearable
            filterable
            class="w-full !rounded-xl"
            size="large"
            @change="handleChapterChange"
          >
            <el-option
              v-for="ch in chapterOptions"
              :key="ch.chapterId"
              :label="ch.name"
              :value="ch.chapterId"
            />
          </el-select>
        </div>

        <!-- 任务统计看板 -->
        <div class="mt-8">
          <div class="flex items-center justify-between mb-4">
            <span
              class="text-base font-semibold text-[var(--el-text-color-primary)]"
              >任务看板</span
            >
            <el-icon
              class="text-[var(--el-text-color-placeholder)] transition-transform duration-300 hover:rotate-180 cursor-pointer"
              ><DataAnalysis
            /></el-icon>
          </div>
          <div class="grid grid-cols-3 gap-3">
            <div
              class="stat-card bg-[var(--el-color-primary-light-9)] rounded-2xl p-4 text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-md cursor-default"
            >
              <div
                class="text-2xl font-black text-[var(--el-color-success)] leading-none mb-2"
              >
                {{ stats.completed }}
              </div>
              <div
                class="text-xs font-medium text-[var(--el-text-color-secondary)] tracking-wider"
              >
                已完成
              </div>
            </div>
            <div
              class="stat-card bg-[var(--el-color-primary-light-9)] rounded-2xl p-4 text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-md cursor-default"
            >
              <div
                class="text-2xl font-black text-[var(--el-color-warning)] leading-none mb-2"
              >
                {{ stats.processing }}
              </div>
              <div
                class="text-xs font-medium text-[var(--el-text-color-secondary)] tracking-wider"
              >
                处理中
              </div>
            </div>
            <div
              class="stat-card bg-[var(--el-color-primary-light-9)] rounded-2xl p-4 text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-md cursor-default"
            >
              <div
                class="text-2xl font-black text-[var(--el-color-danger)] leading-none mb-2"
              >
                {{ stats.failed }}
              </div>
              <div
                class="text-xs font-medium text-[var(--el-text-color-secondary)] tracking-wider"
              >
                失败
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧内容区域 -->
    <div class="flex-1 flex flex-col min-w-0">
      <!-- 合并后的内容卡片 -->
      <div
        class="flex-1 bg-[var(--el-bg-color-overlay)] rounded-2xl shadow-sm border border-[var(--el-border-color-light)] overflow-hidden flex flex-col"
      >
        <!-- 顶部操作栏（内嵌在卡片顶部） -->
        <div
          :class="[
            'content-toolbar px-6 py-4 border-b border-[var(--el-border-color-lighter)] bg-[var(--el-fill-color-light)]/30 flex-shrink-0',
            isCompactLayout
              ? 'content-toolbar--compact'
              : 'flex justify-between items-center'
          ]"
        >
          <div class="toolbar-status flex items-center space-x-4">
            <div
              v-if="displayVersionResolved"
              class="flex items-center gap-3 px-4 py-2 bg-[var(--el-color-success-light-9)] rounded-xl"
            >
              <div
                class="w-2 h-2 bg-[var(--el-color-success)] rounded-full animate-pulse"
              />
              <span class="text-sm text-[var(--el-color-success)] font-bold"
                >Active v{{ displayVersionResolved }}</span
              >
            </div>
            <div
              v-if="polling"
              class="flex items-center text-[var(--el-color-primary)] text-sm font-semibold px-4 py-2 bg-[var(--el-color-primary-light-9)] rounded-xl"
            >
              <el-icon class="mr-2 animate-spin"><Loading /></el-icon>
              监听中...
            </div>
          </div>

          <div
            :class="[
              'toolbar-actions flex gap-2',
              { 'toolbar-actions--compact': isCompactLayout }
            ]"
          >
            <el-button
              :disabled="!selectedChapterId"
              class="!rounded-xl !h-10 !px-4"
              :icon="Refresh"
              @click="refreshList"
            >
              刷新
            </el-button>
            <el-button
              :loading="syncLoading"
              class="!rounded-xl !h-10 !px-4"
              :icon="Upload"
              @click="onForceSync"
            >
              同步
            </el-button>
            <el-button
              type="primary"
              :disabled="!canGenerate"
              :loading="generateLoading"
              class="!rounded-xl !h-10 !px-6 !font-bold shadow-md"
              @click="onGenerate"
            >
              AI 生成
            </el-button>
          </div>
        </div>

        <!-- 内容体 -->
        <div class="flex-1 p-6 overflow-hidden flex flex-col">
          <div
            v-if="!selectedChapterId"
            class="flex-1 flex flex-col items-center justify-center relative"
          >
            <!-- 装饰性背景光斑 -->
            <div
              class="absolute top-[15%] left-[20%] w-28 h-28 bg-blue-200/30 dark:bg-blue-800/20 rounded-full filter blur-2xl pointer-events-none"
            />
            <div
              class="absolute bottom-[20%] right-[15%] w-36 h-36 bg-amber-200/30 dark:bg-amber-800/20 rounded-full filter blur-2xl pointer-events-none"
            />
            <div class="text-center relative z-10">
              <div class="lottie-glass mx-auto mb-8">
                <lottie-animation
                  :animation-data="CinemaAnim"
                  :width="200"
                  :height="200"
                />
              </div>
              <h3
                class="text-2xl font-black text-[var(--el-text-color-primary)] mb-3"
              >
                选择课程与章节
              </h3>
              <p
                class="text-base text-[var(--el-text-color-secondary)] max-w-sm mx-auto leading-relaxed mb-8"
              >
                从左侧选择目标课程和章节，即可查看和管理 AI 动画生成任务
              </p>
            </div>
          </div>
          <div v-else class="flex-1 flex flex-col overflow-hidden">
            <div
              :class="[
                'filter-toolbar mb-5 pb-5 border-b border-[var(--el-border-color-lighter)]',
                isCompactLayout
                  ? 'filter-toolbar--compact'
                  : 'flex justify-between items-center'
              ]"
            >
              <el-radio-group
                v-model="statusFilter"
                size="large"
                :class="[
                  'animation-filter-group',
                  { 'animation-filter-group--compact': isCompactLayout }
                ]"
                @change="applyFilter"
              >
                <el-radio-button value="all">
                  <span class="flex items-center gap-2 text-sm px-1">
                    全部
                  </span>
                </el-radio-button>
                <el-radio-button value="completed">
                  <span class="flex items-center gap-2 text-sm px-1">
                    成功
                  </span>
                </el-radio-button>
                <el-radio-button value="processing">
                  <span class="flex items-center gap-2 text-sm px-1">
                    进行中
                  </span>
                </el-radio-button>
                <el-radio-button value="failed">
                  <span class="flex items-center gap-2 text-sm px-1">
                    失败
                  </span>
                </el-radio-button>
              </el-radio-group>
              <el-input
                v-model="keyword"
                placeholder="搜索文件名..."
                clearable
                size="large"
                :class="[
                  '!rounded-xl filter-keyword',
                  isMobile || isCompactLayout ? '!w-full' : '!w-80'
                ]"
                @input="applyFilter"
              >
                <template #prefix
                  ><el-icon class="text-[var(--el-text-color-placeholder)]"
                    ><Search /></el-icon
                ></template>
              </el-input>
            </div>

            <div class="flex-1 overflow-auto custom-scrollbar">
              <div v-if="isMobile" class="mobile-animation-list">
                <div
                  v-for="row in filteredTasks"
                  :key="row.taskId"
                  class="mobile-animation-card"
                >
                  <div class="mobile-animation-card__header">
                    <div class="mobile-animation-version">
                      <el-icon
                        v-if="isDisplayVersion(row)"
                        class="text-[var(--el-color-success)] mr-1.5"
                      >
                        <StarFilled />
                      </el-icon>
                      <el-tag
                        v-if="row.status === 'completed'"
                        type="success"
                        effect="plain"
                      >
                        v{{ row.version }}
                      </el-tag>
                      <span
                        v-else
                        class="text-[var(--el-text-color-placeholder)]"
                      >
                        --
                      </span>
                    </div>

                    <div
                      class="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-bold"
                      :class="{
                        'bg-[var(--el-color-success-light-9)] text-[var(--el-color-success)]':
                          row.status === 'completed',
                        'bg-[var(--el-color-warning-light-9)] text-[var(--el-color-warning)]':
                          row.status === 'processing',
                        'bg-[var(--el-color-danger-light-9)] text-[var(--el-color-danger)]':
                          row.status === 'failed',
                        'bg-[var(--el-fill-color-light)] text-[var(--el-text-color-secondary)]':
                          !['completed', 'processing', 'failed'].includes(
                            row.status
                          )
                      }"
                    >
                      {{
                        row.status === "completed"
                          ? "完成"
                          : row.status === "processing"
                            ? "处理中"
                            : row.status === "failed"
                              ? "失败"
                              : row.status
                      }}
                    </div>
                  </div>

                  <div class="mobile-animation-card__body">
                    <div class="mobile-animation-field">
                      <span class="label">File</span>
                      <span>{{ row.fileName || "-" }}</span>
                    </div>
                    <div class="mobile-animation-grid">
                      <div class="mobile-animation-field">
                        <span class="label">Size</span>
                        <span>{{ formatSize(row.fileSize) }}</span>
                      </div>
                      <div class="mobile-animation-field">
                        <span class="label">Created</span>
                        <span>{{ row.createdAt }}</span>
                      </div>
                    </div>
                  </div>

                  <div class="mobile-animation-card__actions">
                    <el-button
                      type="primary"
                      plain
                      class="mobile-animation-action-btn"
                      :disabled="row.status !== 'completed'"
                      @click="openPreview(row)"
                    >
                      预览
                    </el-button>
                    <el-button
                      type="success"
                      plain
                      class="mobile-animation-action-btn"
                      :disabled="
                        row.status !== 'completed' || isDisplayVersion(row)
                      "
                      @click="setDisplay(row)"
                    >
                      展示
                    </el-button>
                    <el-button
                      type="info"
                      plain
                      class="mobile-animation-action-btn"
                      :disabled="row.status !== 'completed'"
                      @click="copyUrl(row)"
                    >
                      URL
                    </el-button>
                  </div>
                </div>

                <el-empty v-if="!listLoading && filteredTasks.length === 0" />
              </div>

              <el-table
                v-else
                v-loading="listLoading"
                :data="filteredTasks"
                class="animation-table"
                :row-class-name="rowClassName"
                header-cell-class-name="!bg-[var(--el-fill-color-light)] !text-[var(--el-text-color-primary)] !font-bold !text-base !py-4"
              >
                <el-table-column
                  prop="version"
                  label="版本"
                  width="120"
                  align="center"
                >
                  <template #default="{ row }">
                    <div class="flex items-center justify-center text-base">
                      <el-icon
                        v-if="isDisplayVersion(row)"
                        class="text-[var(--el-color-success)] mr-1.5"
                        ><StarFilled
                      /></el-icon>
                      <el-tag
                        v-if="row.status === 'completed'"
                        type="success"
                        size="large"
                        effect="plain"
                        class="!bg-[var(--el-color-success-light-9)] !font-bold !rounded-lg !text-base"
                        >v{{ row.version }}</el-tag
                      >
                      <span
                        v-else
                        class="text-[var(--el-text-color-placeholder)]"
                        >--</span
                      >
                    </div>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="status"
                  label="状态"
                  width="140"
                  align="center"
                >
                  <template #default="{ row }">
                    <div
                      class="inline-flex items-center px-4 py-2 rounded-lg text-base font-bold"
                      :class="{
                        'bg-[var(--el-color-success-light-9)] text-[var(--el-color-success)]':
                          row.status === 'completed',
                        'bg-[var(--el-color-warning-light-9)] text-[var(--el-color-warning)]':
                          row.status === 'processing',
                        'bg-[var(--el-color-danger-light-9)] text-[var(--el-color-danger)]':
                          row.status === 'failed',
                        'bg-[var(--el-fill-color-light)] text-[var(--el-text-color-secondary)]':
                          !['completed', 'processing', 'failed'].includes(
                            row.status
                          )
                      }"
                    >
                      <span
                        class="w-2 h-2 rounded-full mr-2"
                        :class="{
                          'bg-[var(--el-color-success)]':
                            row.status === 'completed',
                          'bg-[var(--el-color-warning)] animate-pulse':
                            row.status === 'processing',
                          'bg-[var(--el-color-danger)]':
                            row.status === 'failed',
                          'bg-[var(--el-text-color-placeholder)]': ![
                            'completed',
                            'processing',
                            'failed'
                          ].includes(row.status)
                        }"
                      />
                      {{
                        row.status === "completed"
                          ? "完成"
                          : row.status === "processing"
                            ? "处理中"
                            : row.status === "failed"
                              ? "失败"
                              : row.status
                      }}
                    </div>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="fileName"
                  label="文件名"
                  min-width="200"
                  show-overflow-tooltip
                >
                  <template #default="{ row }">
                    <span
                      class="text-[var(--el-text-color-primary)] font-medium text-base"
                      >{{ row.fileName }}</span
                    >
                  </template>
                </el-table-column>
                <el-table-column
                  prop="fileSize"
                  label="大小"
                  width="120"
                  align="center"
                >
                  <template #default="{ row }">
                    <span
                      class="text-[var(--el-text-color-secondary)] text-base font-mono"
                      >{{ formatSize(row.fileSize) }}</span
                    >
                  </template>
                </el-table-column>
                <el-table-column
                  prop="createdAt"
                  label="创建时间"
                  width="180"
                  align="center"
                >
                  <template #default="{ row }">
                    <span
                      class="text-[var(--el-text-color-secondary)] text-base"
                      >{{ row.createdAt }}</span
                    >
                  </template>
                </el-table-column>
                <el-table-column
                  label="操作"
                  width="320"
                  fixed="right"
                  align="center"
                >
                  <template #default="{ row }">
                    <div class="flex gap-2 justify-center">
                      <el-button
                        size="large"
                        type="primary"
                        plain
                        class="!rounded-lg !text-sm"
                        :disabled="row.status !== 'completed'"
                        @click="openPreview(row)"
                      >
                        <el-icon class="mr-1"><View /></el-icon>预览
                      </el-button>
                      <el-button
                        size="large"
                        type="success"
                        plain
                        class="!rounded-lg !text-sm"
                        :disabled="
                          row.status !== 'completed' || isDisplayVersion(row)
                        "
                        @click="setDisplay(row)"
                      >
                        <el-icon class="mr-1"><StarFilled /></el-icon>展示
                      </el-button>
                      <el-button
                        size="large"
                        type="info"
                        plain
                        class="!rounded-lg !text-sm"
                        :disabled="row.status !== 'completed'"
                        @click="copyUrl(row)"
                      >
                        <el-icon class="mr-1"><DocumentCopy /></el-icon>URL
                      </el-button>
                    </div>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 预览弹窗 -->
    <el-dialog
      v-model="previewVisible"
      title="动画渲染预览"
      :width="getDialogWidth('85%', '96%')"
      :fullscreen="isMobile"
      top="4vh"
      class="!rounded-2xl overflow-hidden shadow-2xl"
    >
      <div
        v-if="previewUrl"
        class="h-[75vh] bg-black rounded-xl overflow-hidden border border-[var(--el-border-color-light)]"
      >
        <iframe :src="previewUrl" frameborder="0" class="w-full h-full" />
      </div>
      <template #footer>
        <div class="flex justify-between items-center px-4 py-2">
          <span
            class="text-xs text-[var(--el-text-color-placeholder)] font-mono"
            >DEBUG MODE</span
          >
          <div class="space-x-4">
            <el-button
              :icon="FullScreen"
              class="!rounded-xl"
              @click="openInNewWindow"
              >全屏查看</el-button
            >
            <el-button
              type="primary"
              class="!rounded-xl px-8"
              @click="previewVisible = false"
              >完成</el-button
            >
          </div>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { usePageResponsive } from "@/utils/pageResponsive";
import { getCourseList, getCourseHoursList } from "@/api/course";
import {
  generateHtmlAnimation,
  getHtmlAnimationList,
  setHtmlAnimationDisplay,
  forceSyncHtmlAnimation,
  getHtmlAnimationDisplay,
  normalizeHtmlAnimationTask,
  type HtmlAnimationTask
} from "@/api/htmlAnimation";
import {
  VideoPlay,
  Loading,
  Cpu,
  Refresh,
  Upload,
  Search,
  Document,
  Promotion,
  View,
  More,
  Download,
  Delete,
  Reading,
  Management,
  Calendar,
  DocumentCopy,
  FullScreen,
  StarFilled,
  Film,
  Setting,
  DataAnalysis
} from "@element-plus/icons-vue";
import htmlIconSvg from "@/assets/new-release/html-file-type-svgrepo-com.svg?url";
import LottieAnimation from "@/components/LottieAnimation.vue";
import CinemaAnim from "@/assets/Cinema news animation.json";

defineOptions({
  name: "CourseAnimation"
});

const { isMobile, getDialogWidth } = usePageResponsive();
const isCompactLayout = ref(false);

const selectedCourseId = ref<number | null>(null);
const selectedChapterId = ref<number | null>(null);
const courseOptions = ref<any[]>([]);
const chapterOptions = ref<any[]>([]);
const courseLoading = ref(false);
const listLoading = ref(false);
const generateLoading = ref(false);
const syncLoading = ref(false);
const polling = ref(false);
let pollTimer: any = null;

const tasks = ref<HtmlAnimationTask[]>([]);
const displayVersionRaw = ref("");
const displayVersionResolved = ref("");

const statusFilter = ref("all");
const keyword = ref("");

const previewVisible = ref(false);
const previewUrl = ref("");

const isTaskProcessing = (task: HtmlAnimationTask) =>
  ["pending", "submitted", "processing"].includes(task.status);
const isTaskCompleted = (task: HtmlAnimationTask) => task.status === "completed";
const isTaskFailed = (task: HtmlAnimationTask) => task.status === "failed";

const updateCompactLayout = () => {
  if (typeof window === "undefined") return;
  isCompactLayout.value = window.innerWidth <= 1120 && !isMobile.value;
};

// 统计
const stats = computed(() => {
  return {
    completed: tasks.value.filter(isTaskCompleted).length,
    processing: tasks.value.filter(isTaskProcessing).length,
    failed: tasks.value.filter(isTaskFailed).length
  };
});

const latestCompletedVersion = computed(() => {
  const versions = tasks.value
    .filter(isTaskCompleted)
    .map(t => t.version)
    .filter(v => v > 0);
  return versions.length ? Math.max(...versions) : null;
});

const latestSuccessTime = computed(() => {
  const completed = tasks.value.filter(t => isTaskCompleted(t) && t.completedAt);
  if (!completed.length) return "";
  // 最新完成时间
  return completed.sort((a, b) =>
    (b.completedAt || "").localeCompare(a.completedAt || "")
  )[0].completedAt;
});

const canGenerate = computed(
  () =>
    !!selectedCourseId.value &&
    !!selectedChapterId.value &&
    !tasks.value.some(isTaskProcessing)
);

const filteredTasks = computed(() => {
  let arr = tasks.value.slice().sort((a, b) => b.version - a.version);
  if (statusFilter.value !== "all")
    arr = arr.filter(t =>
      statusFilter.value === "processing"
        ? isTaskProcessing(t)
        : t.status === statusFilter.value
    );
  if (keyword.value)
    arr = arr.filter(t =>
      t.fileName?.toLowerCase().includes(keyword.value.toLowerCase())
    );
  return arr;
});

function applyFilter() {
  /* computed 已处理，此函数占位供事件触发刷新 */
}

function getRequestErrorMessage(error: any, fallback: string) {
  const status = error?.response?.status;
  const reqUrl = error?.config?.url;
  if (status === 404) {
    return reqUrl
      ? `接口不存在(404): ${reqUrl}，请确认当前环境已部署HTML动画接口`
      : "接口不存在(404)，请确认当前环境已部署HTML动画接口";
  }
  return (
    error?.response?.data?.msg ||
    error?.response?.data?.message ||
    error?.message ||
    fallback
  );
}

async function searchCourses(query: string) {
  courseLoading.value = true;
  try {
    const { data } = await getCourseList({
      pageNum: 1,
      pageSize: 20,
      courseName: query || undefined
    });
    courseOptions.value = data.courseList || [];
  } catch (e) {
    ElMessage.error("课程搜索失败");
  } finally {
    courseLoading.value = false;
  }
}

async function preloadCourses() {
  await searchCourses("");
}

async function handleCourseChange() {
  selectedChapterId.value = null;
  chapterOptions.value = [];
  tasks.value = [];
  stopPolling();
  if (!selectedCourseId.value) return;
  // load chapters
  try {
    const { data } = await getCourseHoursList({
      courseId: selectedCourseId.value
    });
    chapterOptions.value = (data.courseChapters || []).map(ch => ({
      chapterId: ch.chapterId,
      name: ch.name
    }));
  } catch (e) {
    ElMessage.error("章节加载失败");
  }
}

function handleChapterChange() {
  tasks.value = [];
  stopPolling();
  if (selectedChapterId.value) refreshList();
}

async function refreshList() {
  if (!selectedCourseId.value || !selectedChapterId.value) return;
  listLoading.value = true;
  try {
    const { data } = await getHtmlAnimationList({
      courseId: selectedCourseId.value,
      chapterId: selectedChapterId.value
    });
    tasks.value = (data.tasks || []).map(normalizeHtmlAnimationTask);
    displayVersionRaw.value = data.displayVersionRaw;
    displayVersionResolved.value = data.displayVersionResolved;
    // 若存在 processing 且未轮询启动 -> 启动
    if (tasks.value.some(isTaskProcessing) && !polling.value) {
      startPolling();
    } else if (!tasks.value.some(isTaskProcessing)) {
      stopPolling();
    }
  } catch (e) {
    console.error("获取动画列表失败", e);
    ElMessage.error(getRequestErrorMessage(e, "动画列表获取失败"));
  } finally {
    listLoading.value = false;
  }
}

async function onGenerate() {
  if (!canGenerate.value) return;
  generateLoading.value = true;
  try {
    await generateHtmlAnimation({
      courseId: selectedCourseId.value!,
      chapterId: selectedChapterId.value!
    });
    ElMessage.success("生成任务已提交");
    await refreshList();
  } catch (e) {
    ElMessage.error("生成任务提交失败");
  } finally {
    generateLoading.value = false;
  }
}

function startPolling() {
  polling.value = true;
  clearInterval(pollTimer);
  pollTimer = setInterval(async () => {
    await refreshList();
  }, 5000);
}

function stopPolling() {
  polling.value = false;
  clearInterval(pollTimer);
  pollTimer = null;
}

async function setDisplayLatest() {
  if (!latestCompletedVersion.value) return;
  try {
    await setHtmlAnimationDisplay({
      courseId: selectedCourseId.value!,
      chapterId: selectedChapterId.value!,
      version: String(latestCompletedVersion.value)
    });
    ElMessage.success("展示版本已设置");
    await refreshList();
  } catch (e) {
    ElMessage.error("设置展示版本失败");
  }
}

async function setDisplay(row: HtmlAnimationTask) {
  if (!isTaskCompleted(row)) return;
  try {
    await setHtmlAnimationDisplay({
      courseId: selectedCourseId.value!,
      chapterId: selectedChapterId.value!,
      version: String(row.version)
    });
    ElMessage.success("展示版本已设置");
    await refreshList();
  } catch (e) {
    ElMessage.error("设置展示版本失败");
  }
}

async function onForceSync() {
  syncLoading.value = true;
  try {
    const { data } = await forceSyncHtmlAnimation();
    ElMessage.success(
      `同步完成: ${data.successChapters}/${data.totalChapters}`
    );
    await refreshList();
  } catch (e) {
    ElMessage.error("强制同步失败");
  } finally {
    syncLoading.value = false;
  }
}

function isDisplayVersion(row: HtmlAnimationTask) {
  if (!isTaskCompleted(row) || !row.version) return false;
  if (displayVersionRaw.value === "latest")
    return String(row.version) === displayVersionResolved.value;
  return String(row.version) === displayVersionRaw.value;
}

function openPreview(row: HtmlAnimationTask) {
  if (!isTaskCompleted(row)) return;
  previewUrl.value = buildFileUrl(row);
  previewVisible.value = true;
}

function buildFileUrl(row: HtmlAnimationTask) {
  // 优先使用后端直接返回的 fileUrl（完整URL）
  if ((row as any).fileUrl) return (row as any).fileUrl as string;
  if (row.fileName && row.fileName.startsWith("http")) return row.fileName;
  if (row.objectName && row.objectName.startsWith("http"))
    return row.objectName;
  return row.fileName || row.objectName || "";
}

function openInNewWindow() {
  if (previewUrl.value) window.open(previewUrl.value, "_blank");
}

async function copyUrl(row: HtmlAnimationTask) {
  const url = buildFileUrl(row);
  if (!url) {
    ElMessage.warning("无可复制URL");
    return;
  }
  try {
    await navigator.clipboard.writeText(url);
    ElMessage.success("已复制");
  } catch (e) {
    ElMessage.error("复制失败");
  }
}

function formatSize(size: number) {
  if (!size) return "-";
  const units = ["B", "KB", "MB", "GB"];
  let idx = 0;
  let val = size;
  while (val > 1024 && idx < units.length - 1) {
    val /= 1024;
    idx++;
  }
  return val.toFixed(idx === 0 ? 0 : 2) + units[idx];
}

function truncate(str: string, len: number) {
  if (!str) return "";
  return str.length > len ? str.slice(0, len) + "…" : str;
}

function rowClassName({ row }: { row: HtmlAnimationTask }) {
  if (isDisplayVersion(row)) return "row-display";
  if (isTaskFailed(row)) return "row-failed";
  return "";
}

onMounted(() => {
  updateCompactLayout();
  window.addEventListener("resize", updateCompactLayout);
  preloadCourses();
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", updateCompactLayout);
  stopPolling();
});
</script>

<style scoped lang="scss">
// 淡入动画
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.ai-animation-page {
  margin: 10px;
}

.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
}

.selectors {
  display: flex;
  align-items: center;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.display-info {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  margin-top: 6px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.display-info .divider {
  display: inline-block;
  width: 1px;
  height: 14px;
  background: var(--el-border-color);
}

.polling-indicator {
  color: var(--el-color-primary-light-3);
}

.empty-block {
  padding: 60px 0;
}

.filter-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 10px 0 14px;
}

.preview-wrapper {
  height: 70vh;
}

.preview-iframe {
  width: 100%;
  height: 100%;
  border: 1px solid var(--el-border-color-light);
  border-radius: var(--el-border-radius-base);
}

.error-text {
  color: var(--el-color-danger);
  cursor: help;
}

// 表格行样式
:deep(.animation-table .el-table__body tr.row-display > td) {
  background: var(--el-color-success-light-9) !important;
}

:deep(.animation-table .el-table__body tr.row-display:hover > td) {
  background: var(--el-color-success-light-8) !important;
}

:deep(.animation-table .el-table__body tr.row-failed > td) {
  background: var(--el-color-danger-light-9) !important;
}

:deep(.animation-table .el-table__body tr.row-failed:hover > td) {
  background: var(--el-color-danger-light-8) !important;
}

:deep(
  .animation-table
    .el-table__body
    tr:not(.row-display):not(.row-failed):hover
    > td
) {
  background: var(--el-fill-color-lighter) !important;
}

// 表格美化
.animation-table {
  :deep(.el-table__inner-wrapper) {
    overflow: hidden;
    border-radius: 12px;
  }

  :deep(.el-table__header-wrapper) {
    th {
      border-bottom: none !important;
    }
  }

  :deep(.el-table__body-wrapper) {
    tr {
      transition: all 0.2s ease;

      td {
        padding: 12px 0;
        border-bottom: 1px solid var(--el-border-color-lighter) !important;
      }

      &:last-child td {
        border-bottom: none !important;
      }
    }
  }
}

// 筛选按钮组美化
.animation-filter-group {
  :deep(.el-radio-button__inner) {
    padding: 6px 14px;
    margin-right: 6px;
    font-weight: 500;
    font-size: 13px;
    border: 1px solid var(--el-border-color-lighter) !important;
    border-radius: 20px !important;
    background: var(--el-bg-color) !important;
    color: var(--el-text-color-regular);
    transition: all 0.2s ease;

    &:hover {
      color: var(--el-color-primary);
      border-color: var(--el-color-primary-light-5) !important;
    }
  }

  :deep(.el-radio-button:first-child .el-radio-button__inner) {
    border-left: 1px solid var(--el-border-color-lighter) !important;
    border-radius: 20px !important;
  }

  :deep(.el-radio-button:last-child .el-radio-button__inner) {
    border-radius: 20px !important;
  }

  :deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
    color: #fff !important;
    background: var(--el-color-primary) !important;
    border-color: var(--el-color-primary) !important;
    box-shadow: 0 2px 8px rgba(var(--el-color-primary-rgb), 0.3) !important;
  }
}

.content-toolbar--compact,
.filter-toolbar--compact {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 14px;
}

.toolbar-actions--compact {
  width: 100%;
  justify-content: stretch;
}

.toolbar-actions--compact :deep(.el-button) {
  flex: 1;
  min-width: 0;
}

.animation-filter-group--compact {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px 12px;
  width: 100%;

  :deep(.el-radio-button) {
    width: 100%;
  }

  :deep(.el-radio-button__inner) {
    width: 100%;
    margin-right: 0;
    padding: 10px 14px;
    text-align: center;
  }
}

// 状态面板动效
// 状态面板动效
.status-panel {
  .status-item {
    &:hover {
      span:first-child {
        transform: scale(1.3);
      }

      span:last-child {
        transform: scale(1.1);
      }
    }
  }
}

// 表格行动效增强
.animation-table {
  :deep(.el-table__body-wrapper) {
    tr {
      transition: background-color 0.2s ease;

      &:hover {
        position: relative;
        z-index: 1;
      }
    }
  }

  :deep(.el-button) {
    transition: all 0.2s ease;

    &:hover:not(:disabled) {
      box-shadow: 0 4px 12px rgb(0 0 0 / 15%);
      transform: translateY(-2px);
    }

    &:active:not(:disabled) {
      transform: translateY(0);
    }
  }
}

// 侧边栏卡片动效
.sidebar-card {
  .header-section:hover .icon-box {
    transform: rotate(-5deg) scale(1.05);
  }

  // 标题与副标题间距
  .header-subtitle {
    margin-top: 8px !important;
  }
}

// 输入框聚焦动效
:deep(.el-select),
:deep(.el-input) {
  .el-input__wrapper {
    transition: all 0.25s ease;

    &:hover {
      box-shadow: 0 0 0 1px var(--el-color-primary-light-5) inset;
    }

    &.is-focus {
      box-shadow:
        0 0 0 1px var(--el-color-primary) inset,
        0 4px 12px var(--el-color-primary-light-8);
      transform: translateY(-1px);
    }
  }
}

// 自定义滚动条
.custom-scrollbar {
  &::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--el-border-color);
    border-radius: 3px;
    transition: background 0.2s ease;

    &:hover {
      background: var(--el-border-color-darker);
    }
  }
}

.status-panel {
  animation: fadeInUp 0.4s ease-out;
}

// Lottie 毛玻璃光效容器
.lottie-glass {
  position: relative;
  width: 240px;
  height: 240px;
  border-radius: 2rem;
  background: rgb(255 255 255 / 45%);
  backdrop-filter: blur(20px) saturate(1.6);
  box-shadow:
    0 8px 32px rgba(var(--el-color-primary-rgb), 0.12),
    inset 0 0 0 1px rgb(255 255 255 / 40%);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;

  // 将 Lottie 动画色相旋转到平台主色蓝
  :deep(div) {
    filter: hue-rotate(160deg) saturate(0.85) brightness(0.88);
  }

  // 四角光效
  &::before {
    content: "";
    position: absolute;
    inset: -1px;
    border-radius: inherit;
    padding: 1.5px;
    background: linear-gradient(
      135deg,
      rgba(var(--el-color-primary-rgb), 0.5),
      transparent 40%,
      transparent 60%,
      rgba(var(--el-color-primary-rgb), 0.35)
    );
    mask:
      linear-gradient(#fff 0 0) content-box,
      linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none;
  }

  // 顶部高光
  &::after {
    content: "";
    position: absolute;
    top: -30%;
    left: 10%;
    width: 80%;
    height: 60%;
    background: radial-gradient(
      ellipse,
      rgb(255 255 255 / 30%) 0%,
      transparent 70%
    );
    border-radius: 50%;
    pointer-events: none;
  }

  &:hover {
    transform: scale(1.04);
    box-shadow:
      0 12px 40px rgba(var(--el-color-primary-rgb), 0.18),
      inset 0 0 0 1px rgb(255 255 255 / 50%);
  }

  html.dark & {
    background: rgb(30 30 40 / 50%);
    box-shadow:
      0 8px 32px rgba(var(--el-color-primary-rgb), 0.15),
      inset 0 0 0 1px rgb(255 255 255 / 8%);

    &::before {
      background: linear-gradient(
        135deg,
        rgba(var(--el-color-primary-rgb), 0.35),
        transparent 40%,
        transparent 60%,
        rgba(var(--el-color-primary-rgb), 0.25)
      );
    }

    &::after {
      background: radial-gradient(
        ellipse,
        rgb(255 255 255 / 8%) 0%,
        transparent 70%
      );
    }

    &:hover {
      box-shadow:
        0 12px 40px rgba(var(--el-color-primary-rgb), 0.22),
        inset 0 0 0 1px rgb(255 255 255 / 12%);
    }
  }
}

.mobile-animation-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.mobile-animation-card {
  padding: 16px;
  background: var(--el-fill-color-extra-light);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 16px;
}

.mobile-animation-card__header,
.mobile-animation-card__actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.mobile-animation-card__header {
  margin-bottom: 12px;
}

.mobile-animation-card__body {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.mobile-animation-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px 12px;
}

.mobile-animation-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
  word-break: break-word;
}

.mobile-animation-field .label {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.mobile-animation-card__actions {
  margin-top: 14px;
  justify-content: stretch;
  flex-wrap: nowrap;
  align-items: stretch;
}

.mobile-animation-action-btn {
  flex: 1;
  min-width: 0;
  height: 44px;
  margin: 0 !important;
  padding: 0 12px !important;
  font-size: 14px;
  font-weight: 600;
}

.mobile-animation-action-btn :deep(span) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  line-height: 1;
}

@media (width <= 768px) {
  .ai-animation-container.is-mobile-layout {
    height: auto;
    min-height: calc(100vh - 96px);
    margin: 8px;
    overflow: visible;
    flex-direction: column;
  }

  .ai-animation-container.is-mobile-layout .sidebar-card {
    width: 100%;
  }

  .ai-animation-container.is-mobile-layout .header-subtitle {
    margin-left: 0 !important;
  }

  .ai-animation-container.is-mobile-layout .content-toolbar,
  .ai-animation-container.is-mobile-layout .filter-toolbar {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .ai-animation-container.is-mobile-layout .toolbar-status,
  .ai-animation-container.is-mobile-layout .toolbar-actions {
    width: 100%;
    flex-wrap: wrap;
    gap: 10px;
  }

  .ai-animation-container.is-mobile-layout .toolbar-actions :deep(.el-button) {
    flex: 1 1 calc(50% - 8px);
    min-width: 0;
  }

  .ai-animation-container.is-mobile-layout .filter-keyword {
    width: 100% !important;
  }

  .ai-animation-container.is-mobile-layout .animation-filter-group {
    width: 100%;
    overflow-x: auto;
  }

  .mobile-animation-grid {
    grid-template-columns: 1fr;
  }

  .lottie-glass {
    width: 180px;
    height: 180px;
  }
}
</style>
