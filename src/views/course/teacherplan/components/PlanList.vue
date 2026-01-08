<template>
  <div class="list-container h-full flex flex-col" v-loading="loading">
    <!-- 顶部统计与工具栏 -->
    <div class="flex justify-between items-center mb-6 bg-[var(--el-fill-color-blank)] p-4 rounded-2xl border border-[var(--el-border-color-lighter)] shadow-sm">
      <div v-if="props.courseId" class="flex flex-col">
        <h3 class="text-lg font-bold text-[var(--el-text-color-primary)] flex items-center mb-0.5">
          <el-icon class="mr-2 text-[var(--el-color-primary)]"><Collection /></el-icon>
          已生成教案 ({{ total }})
        </h3>
        <p class="text-xs text-[var(--el-text-color-secondary)] opacity-80">当前显示所选课程关联的教案库</p>
      </div>
      <div v-else class="flex flex-col">
        <h3 class="text-lg font-bold text-[var(--el-text-color-primary)] flex items-center mb-0.5">
          <el-icon class="mr-2 text-[var(--el-color-primary)]"><Collection /></el-icon>
          全部教案库
        </h3>
        <p class="text-xs text-[var(--el-text-color-secondary)] opacity-80">查看并管理您的 AI 生成历史</p>
      </div>
      <div class="flex items-center gap-3">
        <el-button type="primary" :icon="Refresh" plain @click="fetchPlanList" class="!rounded-xl">
          刷新
        </el-button>
      </div>
    </div>

    <!-- 列表展示区 - 垂直铺满 -->
    <div class="flex-1 min-h-0 overflow-y-auto pr-1 custom-scrollbar">
      <div v-if="planList.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-6">
        <div
          v-for="item in planList"
          :key="item.teacherPlanId"
          class="group bg-[var(--el-bg-color-overlay)] border border-[var(--el-border-color-light)] rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:border-[var(--el-color-primary-light-5)] relative overflow-hidden flex flex-col h-full"
        >
          <el-icon class="absolute -right-6 -bottom-6 text-8xl text-[var(--el-fill-color-light)] group-hover:text-[var(--el-color-primary-light-9)] transition-colors pointer-events-none opacity-50">
            <Document />
          </el-icon>

          <div class="relative z-10 flex flex-col h-full">
            <div class="flex justify-between items-start mb-5">
              <span class="px-2.5 py-1 bg-[var(--el-fill-color-light)] text-[var(--el-text-color-secondary)] text-[10px] font-bold rounded-md uppercase tracking-wider border border-[var(--el-border-color-lighter)]">
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
                    <el-dropdown-item :icon="View" @click="checkProgress(item)">查看详情</el-dropdown-item>
                    <el-dropdown-item :icon="Download" @click="checkProgress(item)">下载文件</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>

            <h4 class="text-lg font-bold text-[var(--el-text-color-primary)] mb-3 line-clamp-1">
              {{ item.courseName }}
            </h4>
            <div class="space-y-2 mb-6">
              <p class="text-sm text-[var(--el-text-color-regular)] flex items-center">
                <el-icon class="mr-2 opacity-60"><Memo /></el-icon>
                {{ item.chapterName }}
              </p>
              <p class="text-[12px] text-[var(--el-text-color-placeholder)] flex items-center">
                <el-icon class="mr-2 opacity-60"><Calendar /></el-icon>
                2024-11-20 14:30
              </p>
            </div>

            <div class="mt-auto pt-5 border-t border-[var(--el-border-color-lighter)] flex justify-between items-center">
              <el-tag
                size="small"
                :type="item.status === 2 ? 'success' : 'warning'"
                effect="dark"
                class="!rounded-full !px-3 font-medium"
              >
                {{ item.status === 2 ? '生成完成' : '处理中' }}
              </el-tag>
              
              <el-button
                type="primary"
                size="small"
                class="!rounded-lg !px-4 hover:shadow-sm"
                @click="checkProgress(item)"
              >
                管理
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else class="py-20 flex flex-col items-center justify-center bg-[var(--el-bg-color-overlay)] border border-[var(--el-border-color-light)] rounded-3xl shadow-sm">
        <div class="w-32 h-32 bg-[var(--el-fill-color-light)] rounded-full flex items-center justify-center mb-6">
          <el-icon class="text-6xl text-[var(--el-text-color-placeholder)]"><Box /></el-icon>
        </div>
        <h3 class="text-xl font-bold text-[var(--el-text-color-primary)] mb-2">暂无教案内容</h3>
        <p class="text-[var(--el-text-color-secondary)] mb-8 max-w-xs text-center">
          {{ props.courseId ? '该课程下还没有生成的教案，请切换到“智能生成”选项卡。' : '您还没有生成过任何教案。' }}
        </p>
        <el-button type="primary" size="large" class="!rounded-xl px-10" @click="$emit('switch-tab', 'generate')">
          立即去生成
        </el-button>
      </div>
    </div>

    <!-- 分页 -->
    <div v-if="planList.length > 0" class="mt-8 flex justify-center">
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
      width="480px"
      center
      align-center
      class="rounded-dialog"
    >
      <div v-loading="progressLoading" class="min-h-[280px] flex flex-col">
        <div v-if="currentProgress">
          <div class="bg-[var(--el-fill-color-light)] rounded-2xl p-6 mb-8 border border-[var(--el-border-color-lighter)]">
            <div class="mb-4">
              <span class="text-[10px] text-[var(--el-text-color-placeholder)] uppercase font-bold tracking-widest block mb-1">所属课程</span>
              <div class="text-base font-bold text-[var(--el-text-color-primary)] flex items-center">
                <div class="w-1.5 h-4 bg-[var(--el-color-primary)] rounded-full mr-2"></div>
                {{ currentPlan?.courseName }}
              </div>
            </div>
            <div>
              <span class="text-[10px] text-[var(--el-text-color-placeholder)] uppercase font-bold tracking-widest block mb-1">对应章节</span>
              <div class="text-sm font-medium text-[var(--el-text-color-regular)] flex items-center">
                <div class="w-1.5 h-4 bg-[var(--el-color-warning)] rounded-full mr-2"></div>
                {{ currentPlan?.chapterName }}
              </div>
            </div>
          </div>

          <div v-if="currentProgress.progress === 2" class="text-center pb-4">
            <div class="w-16 h-16 bg-[var(--el-color-success-light-9)] text-[var(--el-color-success)] rounded-full flex items-center justify-center mx-auto mb-4">
              <el-icon class="text-3xl"><CircleCheckFilled /></el-icon>
            </div>
            <h4 class="text-lg font-bold mb-2">生成成功</h4>
            <div class="flex gap-4 mt-8">
              <el-button
                type="primary"
                size="large"
                class="flex-1 !rounded-xl !h-12 shadow-md"
                @click="downloadPlan(currentProgress.downloadUrl)"
              >
                <el-icon class="mr-2"><Download /></el-icon>
                下载教案
              </el-button>
              <el-button
                size="large"
                class="!rounded-xl !h-12 !px-6"
                @click="progressDialogVisible = false"
              >
                关闭
              </el-button>
            </div>
          </div>

          <div v-else class="text-center pb-4">
            <div class="w-16 h-16 bg-[var(--el-color-primary-light-9)] text-[var(--el-color-primary)] rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <el-icon class="text-3xl"><Cpu /></el-icon>
            </div>
            <h4 class="text-lg font-bold mb-2">AI 智能撰写中...</h4>
            <el-progress
              :percentage="75"
              :stroke-width="15"
              striped
              striped-flow
              class="mb-4 px-4 mt-8"
              :color="'var(--el-color-primary)'"
            />
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch } from "vue";
import { ElMessage } from "element-plus";
import { getTeacherPlanList, getTeacherPlanProgress } from "@/api/course";
import { Refresh, Collection, Document, Memo, View, CircleCheckFilled, Download, Cpu, MoreFilled, Box, Calendar } from "@element-plus/icons-vue";

const props = defineProps({
  courseId: {
    type: Number,
    default: null
  }
});

const emit = defineEmits(["switch-tab"]);

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
      planList.value = res.data.teacherPlanList || [];
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

watch(() => props.courseId, () => {
  currentPage.value = 1;
  fetchPlanList();
});

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
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

:deep(.custom-pagination) {
  .el-pagination__sizes {
    margin-right: 20px;
  }
  
  &.is-background .el-pager li:not(.is-disabled).is-active {
    background-color: var(--el-color-primary);
    border-radius: 8px;
    font-weight: bold;
  }
  
  &.is-background .el-pager li {
    border-radius: 8px;
    background-color: var(--el-bg-color-overlay);
    border: 1px solid var(--el-border-color-lighter);
  }
}

:deep(.rounded-dialog) {
  border-radius: 20px;
  overflow: hidden;
  
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
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  overflow: hidden;
}
</style>
