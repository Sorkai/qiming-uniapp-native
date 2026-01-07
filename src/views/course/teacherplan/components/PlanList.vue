<template>
  <div class="list-container" v-loading="loading">
    <div class="flex justify-between items-center mb-6">
      <h3 class="text-lg font-bold text-gray-800 flex items-center">
        <el-icon class="mr-2 text-indigo-500"><Collection /></el-icon>
        已生成教案 ({{ total }})
      </h3>
      <el-button type="primary" link @click="fetchPlanList" :icon="Refresh">
        刷新
      </el-button>
    </div>

    <div v-if="planList.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="item in planList"
        :key="item.teacherPlanId"
        class="group bg-white border border-gray-100 rounded-xl p-5 transition-all hover:shadow-md hover:border-indigo-100 relative overflow-hidden"
      >
        <!-- 装饰背景图标 -->
        <el-icon class="absolute -right-4 -bottom-4 text-6xl text-gray-50 group-hover:text-indigo-50 transition-colors pointer-events-none">
          <Document />
        </el-icon>

        <div class="relative z-10">
          <div class="flex justify-between items-start mb-4">
            <el-tag size="small" effect="plain" class="!bg-indigo-50 !border-indigo-100 !text-indigo-600">
              #{{ item.teacherPlanId }}
            </el-tag>
            <el-tooltip content="查看详情/下载">
              <el-button
                circle
                :icon="View"
                size="small"
                class="!bg-transparent !border-transparent hover:!text-indigo-600"
                @click="checkProgress(item)"
              />
            </el-tooltip>
          </div>

          <h4 class="text-base font-bold text-gray-800 mb-2 truncate">
            {{ item.courseName }}
          </h4>
          <p class="text-sm text-gray-500 flex items-center mb-4">
            <el-icon class="mr-1"><Memo /></el-icon>
            {{ item.chapterName }}
          </p>

          <div class="pt-4 border-t border-gray-50 flex justify-between items-center">
            <span class="text-xs text-gray-400">生成日期: {{ new Date().toLocaleDateString() }}</span>
            <el-button
              type="primary"
              size="small"
              round
              class="!bg-indigo-50 !text-indigo-600 !border-none hover:!bg-indigo-600 hover:!text-white"
              @click="checkProgress(item)"
            >
              管理教案
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <el-empty
      v-else
      description="暂无生成的教案"
      :image-size="200"
    >
      <template #extra>
        <el-button type="primary" @click="$emit('switch-tab', 'generate')">去生成</el-button>
      </template>
    </el-empty>

    <!-- 分页 -->
    <div class="mt-8 flex justify-center">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[9, 18, 36]"
        layout="total, prev, pager, next"
        :total="total"
        background
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 进度查看对话框 -->
    <el-dialog
      v-model="progressDialogVisible"
      title="教案详情"
      width="450px"
      center
      class="custom-dialog"
    >
      <div v-loading="progressLoading" class="py-2">
        <div v-if="currentProgress">
          <div class="bg-gray-50 rounded-lg p-4 mb-6">
            <div class="flex items-center mb-3">
              <div class="w-2 h-8 bg-indigo-500 rounded-full mr-3" />
              <div>
                <div class="text-xs text-gray-400">所属课程</div>
                <div class="text-sm font-bold">{{ currentPlan?.courseName }}</div>
              </div>
            </div>
            <div class="flex items-center">
              <div class="w-2 h-8 bg-purple-500 rounded-full mr-3" />
              <div>
                <div class="text-xs text-gray-400">对应章节</div>
                <div class="text-sm font-bold">{{ currentPlan?.chapterName }}</div>
              </div>
            </div>
          </div>

          <!-- 已生成显示下载链接 -->
          <div v-if="currentProgress.progress === 2" class="text-center py-6">
            <div class="mb-6 flex justify-center">
              <div class="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center text-green-500">
                <el-icon class="text-4xl"><CircleCheckFilled /></el-icon>
              </div>
            </div>
            <h3 class="text-lg font-bold mb-2">教案已生成完成</h3>
            <p class="text-gray-500 text-sm mb-8 px-4">教案已经根据您的要求通过 AI 生成完毕，您可以点击下方按钮下载并在本地查看。</p>
            <el-button
              type="primary"
              size="large"
              class="w-full !rounded-xl"
              @click="downloadPlan(currentProgress.downloadUrl)"
            >
              <el-icon class="mr-2"><Download /></el-icon>
              立即下载 Markdown 教案
            </el-button>
          </div>

          <!-- 生成中显示进度条 -->
          <div v-else class="text-center py-6">
            <div class="mb-6 flex justify-center">
              <div class="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-500 animate-pulse">
                <el-icon class="text-4xl"><Cpu /></el-icon>
              </div>
            </div>
            <h3 class="text-lg font-bold mb-2">AI 正在努力撰写</h3>
            <p class="text-gray-500 text-sm mb-6">我们正在为您构建高质量的教案内容，请保持网络连接...</p>
            <el-progress
              :percentage="65"
              :stroke-width="12"
              class="mb-4"
              color="#6366f1"
            />
            <div class="text-xs text-gray-400">
              预计还需要 1-2 分钟完成...
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { getTeacherPlanList, getTeacherPlanProgress } from "@/api/course";
import { Refresh, Collection, Document, Memo, View, CircleCheckFilled, Download, Cpu } from "@element-plus/icons-vue";

// 定义事件
const emit = defineEmits(["switch-tab"]);

// 数据定义
const planList = ref([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(9); // 3x3 网格
const loading = ref(false);

// 进度对话框相关
const progressDialogVisible = ref(false);
const progressLoading = ref(false);
const currentPlan = ref(null);
const currentProgress = ref(null);
const currentProgress = ref(null);

// 获取教案列表
const fetchPlanList = async () => {
  loading.value = true;
  try {
    const res = await getTeacherPlanList({
      pageNum: currentPage.value,
      pageSize: pageSize.value
    });

    if (res && res.code === 200 && res.data) {
      planList.value = res.data.teacherPlanList || [];
      total.value = res.data.total || 0;
    } else {
      planList.value = [];
      total.value = 0;
      ElMessage.warning("获取教案列表失败");
    }
  } catch (error) {
    console.error("获取教案列表失败:", error);
    ElMessage.error("获取教案列表失败");
  } finally {
    loading.value = false;
  }
};

// 处理页面大小变化
const handleSizeChange = (val: number) => {
  pageSize.value = val;
  fetchPlanList();
};

// 处理页码变化
const handleCurrentChange = (val: number) => {
  currentPage.value = val;
  fetchPlanList();
};

// 查看教案生成进度
const checkProgress = async (plan) => {
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
      ElMessage.warning("获取教案生成进度失败");
    }
  } catch (error) {
    console.error("获取教案生成进度失败:", error);
    ElMessage.error("获取教案生成进度失败");
  } finally {
    progressLoading.value = false;
  }
};

// 下载教案
const downloadPlan = (url: string) => {
  if (!url) {
    ElMessage.warning("下载链接不存在");
    return;
  }
  
  window.open(url, "_blank");
};

// 组件挂载时获取数据
onMounted(() => {
  fetchPlanList();
});
</script>

<style lang="scss" scoped>
.list-container {
  padding: 20px 0;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.download-section {
  margin-top: 30px;
  text-align: center;
}

.progress-section {
  margin-top: 30px;

  .progress-text {
    margin-top: 10px;
    text-align: center;
    color: #666;
  }
}
</style> 