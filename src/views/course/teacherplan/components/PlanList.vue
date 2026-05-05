<template>
  <div
    v-loading="loading"
    :class="[
      'list-container h-full flex flex-col',
      { 'is-mobile-layout': isMobileLayout }
    ]"
  >
    <!-- 顶部统计与工具栏 -->
    <div
      class="plan-list-toolbar flex justify-between items-center mb-6 bg-[var(--el-fill-color-blank)] p-4 rounded-2xl border border-[var(--el-border-color-lighter)] shadow-sm"
    >
      <div v-if="props.courseId" class="plan-list-toolbar__copy flex flex-col">
        <h3
          class="text-lg font-bold text-[var(--el-text-color-primary)] flex items-center mb-0.5"
        >
          <el-icon class="mr-2 text-[var(--el-color-primary)]"
            ><Collection
          /></el-icon>
          已生成教案 ({{ total }})
        </h3>
        <p class="text-xs text-[var(--el-text-color-secondary)] opacity-80">
          当前显示所选课程关联的教案库
        </p>
      </div>
      <div v-else class="plan-list-toolbar__copy flex flex-col">
        <h3
          class="text-lg font-bold text-[var(--el-text-color-primary)] flex items-center mb-0.5"
        >
          <el-icon class="mr-2 text-[var(--el-color-primary)]"
            ><Collection
          /></el-icon>
          全部教案库
        </h3>
        <p class="text-xs text-[var(--el-text-color-secondary)] opacity-80">
          查看并管理您的 AI 生成历史
        </p>
      </div>
      <div class="plan-list-toolbar__actions flex items-center gap-3">
        <el-button
          type="primary"
          :icon="Refresh"
          plain
          class="!rounded-xl"
          @click="fetchPlanList"
        >
          刷新
        </el-button>
      </div>
    </div>

    <!-- 列表展示区 - 垂直铺满 -->
    <div class="flex-1 min-h-0 overflow-y-auto pr-1 custom-scrollbar">
      <div
        v-if="planList.length > 0"
        class="plan-card-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-6"
      >
        <div
          v-for="item in planList"
          :key="item.teacherPlanId"
          class="plan-card group bg-[var(--el-bg-color-overlay)] border border-[var(--el-border-color-light)] rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:border-[var(--el-color-primary-light-5)] relative overflow-hidden flex flex-col h-full"
        >
          <el-icon
            class="absolute -right-6 -bottom-6 text-8xl text-[var(--el-fill-color-light)] group-hover:text-[var(--el-color-primary-light-9)] transition-colors pointer-events-none opacity-50"
          >
            <Document />
          </el-icon>

          <div class="relative z-10 flex flex-col h-full">
            <div
              class="plan-card__header flex justify-between items-start mb-5"
            >
              <span
                class="px-2.5 py-1 bg-[var(--el-fill-color-light)] text-[var(--el-text-color-secondary)] text-[10px] font-bold rounded-md uppercase tracking-wider border border-[var(--el-border-color-lighter)]"
              >
                ID: {{ item.teacherPlanId }}
              </span>
              <el-dropdown trigger="click">
                <el-button
                  circle
                  size="small"
                  class="!bg-transparent !border-transparent hover:!bg-[var(--el-fill-color-light)]"
                >
                  <el-icon><MoreFilled /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item :icon="View" @click="checkProgress(item)"
                      >查看详情</el-dropdown-item
                    >
                    <el-dropdown-item
                      :icon="Download"
                      @click="checkProgress(item)"
                      >下载文件</el-dropdown-item
                    >
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>

            <h4
              class="text-lg font-bold text-[var(--el-text-color-primary)] mb-3 line-clamp-1"
            >
              {{ item.courseName }}
            </h4>
            <div class="space-y-2 mb-6">
              <p
                class="text-sm text-[var(--el-text-color-regular)] flex items-center"
              >
                <el-icon class="mr-2 opacity-60"><Memo /></el-icon>
                {{ item.chapterName }}
              </p>
              <p
                class="text-[12px] text-[var(--el-text-color-placeholder)] flex items-center"
              >
                <el-icon class="mr-2 opacity-60"><Calendar /></el-icon>
                2024-11-20 14:30
              </p>
            </div>

            <div
              class="plan-card__footer mt-auto pt-5 border-t border-[var(--el-border-color-lighter)] flex justify-between items-center"
            >
              <el-tag
                size="small"
                :type="
                  item.status === 2 || item.status === 1 || item.status === 100
                    ? 'success'
                    : 'warning'
                "
                effect="dark"
                class="plan-card__status !rounded-full !px-3 font-medium"
              >
                {{
                  item.status === 2 || item.status === 1 || item.status === 100
                    ? "生成完成"
                    : "处理中"
                }}
              </el-tag>

              <el-button
                type="primary"
                size="small"
                class="plan-card__action !rounded-lg !px-4 hover:shadow-sm"
                @click="checkProgress(item)"
              >
                管理
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div
        v-else
        class="py-20 flex flex-col items-center justify-center bg-[var(--el-bg-color-overlay)] border border-[var(--el-border-color-light)] rounded-3xl shadow-sm"
      >
        <div
          class="w-32 h-32 bg-[var(--el-fill-color-light)] rounded-full flex items-center justify-center mb-6"
        >
          <el-icon class="text-6xl text-[var(--el-text-color-placeholder)]"
            ><Box
          /></el-icon>
        </div>
        <h3 class="text-xl font-bold text-[var(--el-text-color-primary)] mb-2">
          暂无教案内容
        </h3>
        <p
          class="text-[var(--el-text-color-secondary)] mb-8 max-w-xs text-center"
        >
          {{
            props.courseId
              ? "该课程下还没有生成的教案，请切换到“智能生成”选项卡。"
              : "您还没有生成过任何教案。"
          }}
        </p>
        <el-button
          type="primary"
          size="large"
          class="!rounded-xl px-10"
          @click="$emit('switch-tab', 'generate')"
        >
          立即去生成
        </el-button>
      </div>
    </div>

    <!-- 分页 -->
    <div
      v-if="planList.length > 0"
      class="plan-list-pagination mt-8 flex justify-center"
    >
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[8, 12, 16, 24]"
        layout="total, prev, pager, next, sizes"
        :total="total"
        background
        class="custom-pagination"
        @current-change="handleCurrentChange"
        @size-change="handleSizeChange"
      />
    </div>

    <!-- 详情对话框 -->
    <el-dialog
      v-model="progressDialogVisible"
      title="教案处理状态"
      :width="isMobileLayout ? 'calc(100vw - 32px)' : '480px'"
      center
      align-center
      class="rounded-dialog plan-progress-dialog"
    >
      <div
        v-loading="progressLoading"
        class="plan-progress-content min-h-[280px] flex flex-col"
      >
        <div v-if="currentProgress">
          <div
            class="plan-progress-summary bg-[var(--el-fill-color-light)] rounded-2xl p-6 mb-8 border border-[var(--el-border-color-lighter)]"
          >
            <div class="mb-4">
              <span
                class="text-[10px] text-[var(--el-text-color-placeholder)] uppercase font-bold tracking-widest block mb-1"
                >所属课程</span
              >
              <div
                class="text-base font-bold text-[var(--el-text-color-primary)] flex items-center"
              >
                <div
                  class="w-1.5 h-4 bg-[var(--el-color-primary)] rounded-full mr-2"
                />
                {{ currentPlan?.courseName }}
              </div>
            </div>
            <div>
              <span
                class="text-[10px] text-[var(--el-text-color-placeholder)] uppercase font-bold tracking-widest block mb-1"
                >对应章节</span
              >
              <div
                class="text-sm font-medium text-[var(--el-text-color-regular)] flex items-center"
              >
                <div
                  class="w-1.5 h-4 bg-[var(--el-color-warning)] rounded-full mr-2"
                />
                {{ currentPlan?.chapterName }}
              </div>
            </div>
          </div>

          <div
            v-if="
              currentProgress.progress === 2 || currentProgress.progress === 100
            "
            class="plan-progress-state text-center pb-4"
          >
            <div
              class="plan-progress-icon w-16 h-16 bg-[var(--el-color-success-light-9)] text-[var(--el-color-success)] rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <el-icon class="text-3xl"><CircleCheckFilled /></el-icon>
            </div>
            <h4 class="plan-progress-title text-lg font-bold mb-2">生成成功</h4>
            <div class="plan-progress-actions flex gap-4 mt-8">
              <el-button
                type="primary"
                size="large"
                class="plan-progress-button flex-1 !rounded-xl !h-12 shadow-md"
                @click="downloadPlan(currentProgress.downloadUrl)"
              >
                <el-icon class="mr-2"><Download /></el-icon>
                下载教案
              </el-button>
              <el-button
                size="large"
                class="plan-progress-button !rounded-xl !h-12 !px-6"
                @click="progressDialogVisible = false"
              >
                关闭
              </el-button>
            </div>
          </div>

          <div v-else class="plan-progress-state text-center pb-4">
            <div
              class="plan-progress-icon w-16 h-16 bg-[var(--el-color-primary-light-9)] text-[var(--el-color-primary)] rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse"
            >
              <el-icon class="text-3xl"><Cpu /></el-icon>
            </div>
            <h4 class="plan-progress-title text-lg font-bold mb-2">
              AI 智能撰写中...
            </h4>
            <el-progress
              :percentage="75"
              :stroke-width="15"
              striped
              striped-flow
              class="plan-progress-bar mb-4 px-4 mt-8"
              :color="'var(--el-color-primary)'"
            />
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, onMounted, watch } from "vue";
import { ElMessage } from "element-plus";
import { getTeacherPlanList, getTeacherPlanProgress } from "@/api/course";
import { useAppStoreHook } from "@/store/modules/app";
import {
  Refresh,
  Collection,
  Document,
  Memo,
  View,
  CircleCheckFilled,
  Download,
  Cpu,
  MoreFilled,
  Box,
  Calendar
} from "@element-plus/icons-vue";

const props = defineProps({
  courseId: {
    type: Number,
    default: null
  }
});

const emit = defineEmits(["switch-tab"]);
const appStore = useAppStoreHook();
const isMobileLayout = computed(() => appStore.getDevice === "mobile");

const planList = ref([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(12);
const loading = ref(false);

const progressDialogVisible = ref(false);
const progressLoading = ref(false);
const currentPlan = ref(null);
const currentProgress = ref(null);

const fetchPlanList = async () => {
  loading.value = true;
  try {
    const params: any = {
      pageNum: currentPage.value,
      pageSize: pageSize.value
    };
    if (props.courseId) {
      params.courseId = props.courseId;
    }

    const res = await getTeacherPlanList(params);

    if (res && res.code === 200 && res.data) {
      const originalList = res.data.teacherPlanList || [];
      // 并发请求每个教案的进度，因为列表接口没给状态
      const listWithStatus = await Promise.all(
        originalList.map(async item => {
          try {
            const progressRes = await getTeacherPlanProgress({
              teacherPlanId: item.teacherPlanId
            });
            return {
              ...item,
              status: progressRes?.data?.progress ?? 0 // 将进度的 1 或 2 赋值给 status
            };
          } catch (e) {
            return { ...item, status: 0 };
          }
        })
      );
      planList.value = listWithStatus;
      total.value = res.data.total || 0;
    } else {
      planList.value = [];
      total.value = 0;
    }
  } catch (error) {
    console.error("获取教案列表失败:", error);
    ElMessage.error("获取教案列表失败");
  } finally {
    loading.value = false;
  }
};

watch(
  () => props.courseId,
  () => {
    currentPage.value = 1;
    fetchPlanList();
  }
);

const handleSizeChange = (val: number) => {
  pageSize.value = val;
  fetchPlanList();
};

const handleCurrentChange = (val: number) => {
  currentPage.value = val;
  fetchPlanList();
};

const checkProgress = async (plan: any) => {
  currentPlan.value = plan;
  progressDialogVisible.value = true;
  progressLoading.value = true;

  try {
    const res = await getTeacherPlanProgress({
      teacherPlanId: plan.teacherPlanId
    });

    if (res && res.code === 200 && res.data) {
      currentProgress.value = res.data;
    } else {
      currentProgress.value = null;
      ElMessage.warning("获取生成进度失败");
    }
  } catch (error) {
    console.error("获取生成进度失败:", error);
    ElMessage.error("获取生成进度失败");
  } finally {
    progressLoading.value = false;
  }
};

const downloadPlan = (url: string) => {
  if (!url) {
    ElMessage.warning("下载链接不存在");
    return;
  }
  window.open(url, "_blank");
  ElMessage.success("开始下载 Markdown 教案");
};

onMounted(() => {
  fetchPlanList();
});
</script>

<style lang="scss" scoped>
.list-container {
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

:deep(.custom-pagination) {
  .el-pagination__sizes {
    margin-right: 20px;
  }

  &.is-background .el-pager li:not(.is-disabled).is-active {
    font-weight: bold;
    background-color: var(--el-color-primary);
    border-radius: 8px;
  }

  &.is-background .el-pager li {
    background-color: var(--el-bg-color-overlay);
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 8px;
  }
}

:deep(.rounded-dialog) {
  overflow: hidden;
  border-radius: 20px;
  align-self: center;

  .el-dialog__header {
    margin-right: 0;
  }
}

.custom-scrollbar {
  &::-webkit-scrollbar {
    width: 5px;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--el-border-color-lighter);
    border-radius: 10px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }
}

.line-clamp-1 {
  display: -webkit-box;
  overflow: hidden;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
}

.list-container.is-mobile-layout {
  padding-bottom: 4px;
}

.list-container.is-mobile-layout .plan-list-toolbar {
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 16px;
  padding: 16px;
  border-radius: 20px;
}

.list-container.is-mobile-layout .plan-list-toolbar__copy {
  width: 100%;
}

.list-container.is-mobile-layout .plan-list-toolbar__copy h3 {
  font-size: 16px;
  line-height: 1.4;
}

.list-container.is-mobile-layout .plan-list-toolbar__copy p {
  font-size: 12px;
  line-height: 1.6;
}

.list-container.is-mobile-layout .plan-list-toolbar__actions {
  width: 100%;
}

.list-container.is-mobile-layout .plan-list-toolbar__actions :deep(.el-button) {
  width: 100%;
  height: 40px;
  margin-left: 0;
}

.list-container.is-mobile-layout .plan-card-grid {
  gap: 12px;
  padding-bottom: 12px;
}

.list-container.is-mobile-layout .plan-card {
  padding: 16px;
  border-radius: 20px;
}

.list-container.is-mobile-layout .plan-card__header {
  margin-bottom: 14px;
}

.list-container.is-mobile-layout .plan-card h4 {
  margin-bottom: 10px;
  font-size: 16px;
  line-height: 1.45;
}

.list-container.is-mobile-layout .plan-card .space-y-2 {
  margin-bottom: 16px;
}

.list-container.is-mobile-layout .plan-card .space-y-2 p {
  align-items: flex-start;
  font-size: 13px;
  line-height: 1.6;
}

.list-container.is-mobile-layout .plan-card__footer {
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  padding-top: 12px;
}

.list-container.is-mobile-layout .plan-card__status {
  flex-shrink: 0;
  max-width: 100%;
}

.list-container.is-mobile-layout .plan-card__action {
  min-width: 88px;
  height: 32px;
  margin-left: auto;
  padding-inline: 14px !important;
}

.list-container.is-mobile-layout .plan-list-pagination {
  margin-top: 12px;
  padding-bottom: 4px;
}

.list-container.is-mobile-layout .plan-list-pagination :deep(.el-pagination) {
  justify-content: center;
  row-gap: 8px;
}

.list-container.is-mobile-layout
  .plan-list-pagination
  :deep(.el-pagination__sizes) {
  margin-right: 0;
}

.list-container.is-mobile-layout .plan-progress-summary {
  padding: 14px;
  margin-bottom: 16px;
  border-radius: 16px;
}

.list-container.is-mobile-layout .plan-progress-content {
  min-height: 180px;
}

.list-container.is-mobile-layout .plan-progress-icon {
  width: 56px;
  height: 56px;
  margin-bottom: 12px;
}

.list-container.is-mobile-layout .plan-progress-title {
  font-size: 16px;
  line-height: 1.4;
}

.list-container.is-mobile-layout .plan-progress-bar {
  margin-top: 18px;
  margin-bottom: 0;
  padding-inline: 0 !important;
}

.list-container.is-mobile-layout .plan-progress-state h4 {
  font-size: 16px;
}

.list-container.is-mobile-layout .plan-progress-actions {
  flex-direction: column;
  gap: 10px;
}

.list-container.is-mobile-layout .plan-progress-button {
  width: 100%;
  height: 44px !important;
  margin-left: 0 !important;
}

.list-container.is-mobile-layout :deep(.rounded-dialog) {
  width: calc(100vw - 32px);
  max-width: 420px;
  max-height: calc(100vh - 48px);
  margin: 0 auto;
  border-radius: 18px;
  align-self: center;
}

.list-container.is-mobile-layout :deep(.rounded-dialog .el-dialog__header) {
  padding: 18px 18px 10px;
}

.list-container.is-mobile-layout :deep(.rounded-dialog .el-dialog__body) {
  max-height: calc(100vh - 160px);
  padding: 12px 16px 18px;
  overflow-y: auto;
}

@media screen and (max-width: 768px) {
  .list-container {
    padding-bottom: 4px;
  }

  .plan-list-toolbar {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    margin-bottom: 16px;
    padding: 16px;
    border-radius: 20px;
  }

  .plan-list-toolbar__copy {
    width: 100%;
  }

  .plan-list-toolbar__copy h3 {
    font-size: 16px;
    line-height: 1.4;
  }

  .plan-list-toolbar__copy p {
    font-size: 12px;
    line-height: 1.6;
  }

  .plan-list-toolbar__actions {
    width: 100%;
  }

  .plan-list-toolbar__actions :deep(.el-button) {
    width: 100%;
    height: 40px;
    margin-left: 0;
  }

  .plan-card-grid {
    gap: 12px;
    padding-bottom: 12px;
  }

  .plan-card {
    padding: 16px;
    border-radius: 20px;
  }

  .plan-card__header {
    margin-bottom: 14px;
  }

  .plan-card h4 {
    margin-bottom: 10px;
    font-size: 16px;
    line-height: 1.45;
  }

  .plan-card .space-y-2 {
    margin-bottom: 16px;
  }

  .plan-card .space-y-2 p {
    align-items: flex-start;
    font-size: 13px;
    line-height: 1.6;
  }

  .plan-card__footer {
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    padding-top: 12px;
  }

  .plan-card__status {
    flex-shrink: 0;
    max-width: 100%;
  }

  .plan-card__action {
    min-width: 88px;
    height: 32px;
    margin-left: auto;
    padding-inline: 14px !important;
  }

  .plan-list-pagination {
    margin-top: 12px;
    padding-bottom: 4px;
  }

  .plan-list-pagination :deep(.el-pagination) {
    justify-content: center;
    row-gap: 8px;
  }

  .plan-list-pagination :deep(.el-pagination__sizes) {
    margin-right: 0;
  }

  .plan-progress-summary {
    padding: 14px;
    margin-bottom: 16px;
    border-radius: 16px;
  }

  .plan-progress-content {
    min-height: 180px;
  }

  .plan-progress-icon {
    width: 56px;
    height: 56px;
    margin-bottom: 12px;
  }

  .plan-progress-title {
    font-size: 16px;
    line-height: 1.4;
  }

  .plan-progress-bar {
    margin-top: 18px;
    margin-bottom: 0;
    padding-inline: 0 !important;
  }

  .plan-progress-state h4 {
    font-size: 16px;
  }

  .plan-progress-actions {
    flex-direction: column;
    gap: 10px;
  }

  .plan-progress-button {
    width: 100%;
    height: 44px !important;
    margin-left: 0 !important;
  }

  :deep(.rounded-dialog) {
    width: calc(100vw - 32px);
    max-width: 420px;
    max-height: calc(100vh - 48px);
    margin: 0 auto;
    border-radius: 18px;
    align-self: center;
  }

  :deep(.rounded-dialog .el-dialog__header) {
    padding: 18px 18px 10px;
  }

  :deep(.rounded-dialog .el-dialog__body) {
    max-height: calc(100vh - 160px);
    padding: 12px 16px 18px;
    overflow-y: auto;
  }
}
</style>
