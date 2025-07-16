<template>
  <div class="list-container" v-loading="loading">
    <div class="list-header">
      <h3>已生成教案列表</h3>
      <div>
        <el-button type="primary" @click="fetchPlanList">
          <el-icon><Refresh /></el-icon> 刷新列表
        </el-button>
      </div>
    </div>

    <el-table :data="planList" border stripe style="width: 100%">
      <el-table-column prop="teacherPlanId" label="ID" width="80" />
      <el-table-column prop="courseName" label="课程名称" min-width="150" />
      <el-table-column prop="chapterName" label="章节名称" min-width="150" />
      <el-table-column label="操作" width="150">
        <template #default="scope">
          <el-button
            type="primary"
            size="small"
            @click="checkProgress(scope.row)"
          >
            查看进度
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 进度查看对话框 -->
    <el-dialog v-model="progressDialogVisible" title="教案生成进度" width="500px">
      <div v-loading="progressLoading">
        <div v-if="currentProgress">
          <el-descriptions :column="1" border>
            <el-descriptions-item label="课程名称">
              {{ currentPlan?.courseName }}
            </el-descriptions-item>
            <el-descriptions-item label="章节名称">
              {{ currentPlan?.chapterName }}
            </el-descriptions-item>
            <el-descriptions-item label="生成状态">
              <el-tag :type="currentProgress.progress === 1 ? 'warning' : 'success'">
                {{ currentProgress.progress === 1 ? "生成中" : "已生成" }}
              </el-tag>
            </el-descriptions-item>
          </el-descriptions>

          <!-- 已生成显示下载链接 -->
          <div v-if="currentProgress.progress === 2" class="download-section">
            <el-button
              type="primary"
              size="large"
              @click="downloadPlan(currentProgress.downloadUrl)"
            >
              下载教案
            </el-button>
          </div>

          <!-- 生成中显示进度条 -->
          <div v-else class="progress-section">
            <el-progress :percentage="50" status="exception" />
            <div class="progress-text">
              教案正在生成中，请稍后再查看...
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
import { Refresh } from "@element-plus/icons-vue";

// 数据定义
const planList = ref([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(20);
const loading = ref(false);

// 进度对话框相关
const progressDialogVisible = ref(false);
const progressLoading = ref(false);
const currentPlan = ref(null);
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