<script setup lang="ts">
/**
 * 教师端 - 举报处理
 *教师可以处理所授课程中被举报的内容
 */
import { ref, reactive, onMounted, onActivated, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  Search,
  Refresh,
  Check,
  Delete,
  Warning,
  MoreFilled
} from "@element-plus/icons-vue";
import {
  getReportList,
  handleReport,
  type ReportItem,
  type ReportStatus
} from "@/api/discussion-admin";
import InfoIcon from "@/assets/commentareasrelatedsvgs/information-circle-svgrepo-com.svg?component";

defineOptions({
  name: "TeacherReportManage"
});

// 类型定义
type TagType = "warning" | "success" | "info" | "primary" | "danger";

// 状态
const loading = ref(false);
const reports = ref<ReportItem[]>([]);
const detailDialogVisible = ref(false);
const handleDialogVisible = ref(false);
const currentReport = ref<ReportItem | null>(null);

// 统计数据
const stats = ref({
  pending: 0,
  resolvedToday: 0,
  totalReports: 0
});

// 搜索表单
const searchForm = reactive({
  status: "pending" as ReportStatus | ""
});

// 处理表单
const handleForm = reactive({
  action: "reject" as "accept" | "reject",
  note: ""
});

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
});

// 状态选项
const statusOptions = [
  { label: "待处理", value: "pending" },
  { label: "已报送", value: "accepted" },
  { label: "已驳回", value: "rejected" }
];

// 举报原因选项 (根据需要保留或调整，后端返回的是 string)
const getReasonText = (reason: string): string => {
  return reason || "未知原因";
};

// 处理方式选项
const actionOptions = [
  { label: "驳回举报（内容无问题）", value: "reject" },
  { label: "接受举报（内容受处理）", value: "accept" }
];

// 状态标签样式
const getStatusTagType = (status: ReportStatus): TagType => {
  const map: Record<string, TagType> = {
    pending: "warning",
    accepted: "success",
    rejected: "info"
  };
  return map[status] || "info";
};

const getStatusText = (status: ReportStatus): string => {
  const map: Record<string, string> = {
    pending: "待处理",
    accepted: "已接受",
    rejected: "已驳回"
  };
  return map[status] || status;
};

// 加载数据
const fetchData = async () => {
  loading.value = true;
  try {
    const params: any = {
      pageNum: pagination.page,
      pageSize: pagination.pageSize
    };
    if (searchForm.status) params.status = searchForm.status;

    const res = await getReportList(params);
    const responseData = (res as any).data || res;
    reports.value = responseData.list || [];
    pagination.total = responseData.total || 0;
    // stats 暂时从列表计算或固定
    stats.value = {
      pending: (responseData.list || []).filter((r: any) => r.status === "pending")
        .length,
      resolvedToday: 0,
      totalReports: responseData.total || 0
    };
  } catch (error) {
    console.error("加载举报列表失败", error);
  } finally {
    loading.value = false;
  }
};

// 搜索
const handleSearch = () => {
  pagination.page = 1;
  fetchData();
};

// 重置
const resetSearch = () => {
  searchForm.status = "pending";
  handleSearch();
};

// 分页变化
const handlePageChange = (page: number) => {
  pagination.page = page;
  fetchData();
};

const handleSizeChange = (size: number) => {
  pagination.pageSize = size;
  pagination.page = 1;
  fetchData();
};

// 查看详情
const viewDetail = (row: ReportItem) => {
  currentReport.value = row;
  detailDialogVisible.value = true;
};

// 打开处理弹窗
const openHandleDialog = (row: ReportItem) => {
  currentReport.value = row;
  handleForm.action = "reject";
  handleForm.note = "";
  handleDialogVisible.value = true;
};

// 快速驳回
const quickDismiss = async (row: ReportItem) => {
  try {
    await ElMessageBox.confirm("确定要驳回这条举报吗？", "提示", {
      type: "info",
      customClass: "custom-message-box",
      draggable: true
    });
    await handleReport(row.reportId, { action: "reject", note: "内容无问题" });

    ElMessage.success("已驳回");
    fetchData();
  } catch (error: any) {
    if (error !== "cancel") {
      ElMessage.error("操作失败");
    }
  }
};

// 快速接受
const quickDelete = async (row: ReportItem) => {
  try {
    await ElMessageBox.confirm("确定要接受这条举报吗？", "警告", {
      type: "warning",
      customClass: "custom-message-box",
      draggable: true
    });
    await handleReport(row.reportId, { action: "accept", note: "内容违规" });

    ElMessage.success("已接受");
    fetchData();
  } catch (error: any) {
    if (error !== "cancel") {
      ElMessage.error("操作失败");
    }
  }
};

// 提交处理
const submitHandle = async () => {
  if (!currentReport.value) return;

  try {
    await handleReport(currentReport.value.reportId, {
      action: handleForm.action,
      note: handleForm.note
    });

    ElMessage.success("处理成功");
    handleDialogVisible.value = false;
    fetchData();
  } catch (error) {
    ElMessage.error("处理失败");
  }
};

// 格式化时间
const formatTime = (dateStr: string) => {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
};

// 数据是否已加载的标志
const dataLoaded = ref(false);

// 初始化加载数据
const initData = async () => {
  // 防止重复加载
  if (loading.value || dataLoaded.value) return;

  console.log("[reports.vue] initData 开始执行");
  await fetchData();
  dataLoaded.value = true;
  console.log("[reports.vue] initData 执行完成");
};

const route = useRoute();

// 监听路由名称变化，当路由名称存在时加载数据
// 根据 vue-pure-admin 的路由机制，route.name 存在表示动态路由已完全初始化
// 这是解决页面刷新时数据不加载的关键
watch(
  () => route.name,
  newName => {
    console.log("[reports.vue] 路由 name 变化:", newName);
    // 当路由名称存在时加载数据
    if (newName && !dataLoaded.value) {
      console.log("[reports.vue] 开始加载数据");
      initData();
    }
  },
  { immediate: true }
);

// 当组件从 keep-alive 缓存中被激活时重新加载数据
onActivated(() => {
  console.log("[reports.vue] onActivated 触发");
  dataLoaded.value = false; // 重置标志以允许重新加载
  initData();
});
</script>

<template>
  <div class="report-manage p-4">
    <!-- 统计卡片 -->
    <el-row :gutter="16" class="mb-4">
      <el-col :xs="8" :sm="8" :md="8">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-number text-warning">{{ stats.pending }}</div>
            <div class="stat-label">待处理</div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="8" :sm="8" :md="8">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-number text-success">
              {{ stats.resolvedToday }}
            </div>
            <div class="stat-label">今日已处理</div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="8" :sm="8" :md="8">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-number text-info">{{ stats.totalReports }}</div>
            <div class="stat-label">累计举报</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 搜索栏 -->
    <el-card shadow="never" class="mb-4">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="状态">
          <el-select
            v-model="searchForm.status"
            placeholder="全部状态"
            clearable
            style="width: 120px"
          >
            <el-option
              v-for="opt in statusOptions"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">
            搜索
          </el-button>
          <el-button :icon="Refresh" @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 数据表格 -->
    <el-card shadow="never">
      <el-table v-loading="loading" :data="reports" stripe>
        <el-table-column label="被举报内容" min-width="300">
          <template #default="{ row }">
            <div class="report-content">
              <el-tag size="small" class="mb-1">
                {{ row.targetType === "post" ? "帖子" : "回复" }}
              </el-tag>
              <div class="content-text text-sm mt-1">
                {{ row.targetContent?.substring(0, 100) }}...
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="举报原因" width="120" align="center">
          <template #default="{ row }">
            <el-tag type="danger" size="small">
              {{ getReasonText(row.reason) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="举报人" width="120">
          <template #default="{ row }">
            <div class="flex items-center gap-2">
              <span class="text-sm">{{ row.reporterName }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="举报时间" width="160" align="center">
          <template #default="{ row }"
            ><span class="text-sm text-gray-500">
              {{ formatTime(row.createTime) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" align="center" fixed="right">
          <template #default="{ row }">
            <div class="action-btns">
              <el-tooltip content="查看详情" placement="top">
                <el-button
                  link
                  type="primary"
                  :icon="InfoIcon"
                  @click="viewDetail(row)"
                />
              </el-tooltip>
              <template v-if="row.status === 'pending'">
                <el-tooltip content="驳回举报" placement="top">
                  <el-button
                    link
                    type="success"
                    :icon="Check"
                    @click="quickDismiss(row)"
                  />
                </el-tooltip>
                <el-tooltip content="接受举报" placement="top">
                  <el-button
                    link
                    type="danger"
                    :icon="Delete"
                    @click="quickDelete(row)"
                  />
                </el-tooltip>
                <el-tooltip content="更多处理" placement="top">
                  <el-button
                    link
                    type="warning"
                    :icon="MoreFilled"
                    @click="openHandleDialog(row)"
                  />
                </el-tooltip>
              </template>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="flex justify-end mt-4">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
        />
      </div>
    </el-card>

    <!-- 详情弹窗 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="举报详情"
      width="600px"
      destroy-on-close
    >
      <div v-if="currentReport" class="report-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="举报类型">
            {{ currentReport.targetType === "post" ? "帖子" : "回复" }}
          </el-descriptions-item>
          <el-descriptions-item label="举报原因">
            <el-tag type="danger" size="small">
              {{ getReasonText(currentReport.reason) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="举报人">
            {{ currentReport.reporterName }}
          </el-descriptions-item>
          <el-descriptions-item label="举报时间" :span="2">
            {{ formatTime(currentReport.createTime) }}
          </el-descriptions-item>
          <el-descriptions-item label="举报说明" :span="2">
            {{ currentReport.description || "无" }}
          </el-descriptions-item>
        </el-descriptions>

        <el-divider>被举报内容</el-divider>

        <div class="reported-content p-4 bg-gray-50 rounded">
          <div class="content-text">
            {{ currentReport.targetContent }}
          </div>
        </div>

        <template v-if="currentReport.status !== 'pending'">
          <el-divider>处理结果</el-divider>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="处理状态">
              <el-tag
                :type="getStatusTagType(currentReport.status)"
                size="small"
              >
                {{ getStatusText(currentReport.status) }}
              </el-tag>
            </el-descriptions-item>
          </el-descriptions>
        </template>
      </div>

      <template #footer>
        <div class="flex justify-between">
          <div v-if="currentReport?.status === 'pending'">
            <el-button
              type="success"
              @click="
                quickDismiss(currentReport!);
                detailDialogVisible = false;
              "
            >
              驳回举报 </el-button
            ><el-button
              type="danger"
              @click="
                quickDelete(currentReport!);
                detailDialogVisible = false;
              "
            >
              接受举报
            </el-button>
          </div>
          <el-button @click="detailDialogVisible = false">关闭</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 处理弹窗 -->
    <el-dialog
      v-model="handleDialogVisible"
      title="处理举报"
      width="500px"
      destroy-on-close
    >
      <el-form :model="handleForm" label-width="100px">
        <el-form-item label="处理方式" required>
          <el-radio-group v-model="handleForm.action">
            <el-radio
              v-for="opt in actionOptions"
              :key="opt.value"
              :label="opt.value"
            >
              {{ opt.label }}
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="处理备注">
          <el-input
            v-model="handleForm.note"
            type="textarea"
            :rows="3"
            placeholder="请输入处理备注（选填）"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="handleDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitHandle">确认处理</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.report-manage {
  :deep(.el-card) {
    border: none;
    border-radius: 16px;
    box-shadow:
      0 4px 6px -1px rgb(0 0 0 / 0.1),
      0 2px 4px -2px rgb(0 0 0 / 0.1);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    overflow: hidden;

    html.dark & {
      background-color: #242424;
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.3);
    }

    &:hover {
      transform: translateY(-2px);
      box-shadow:
        0 10px 15px -3px rgb(0 0 0 / 0.1),
        0 4px 6px -4px rgb(0 0 0 / 0.1);

      html.dark & {
        box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.5);
      }
    }
  }

  .stat-card {
    .stat-content {
      padding: 12px 0;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;

      .stat-number {
        font-size: 32px;
        font-weight: 700;
        line-height: 1;
        margin-bottom: 8px;

        &.text-warning {
          color: #f59e0b;
        }
        &.text-success {
          color: #10b981;
        }
        &.text-info {
          color: #3b82f6;
        }
      }

      .stat-label {
        font-size: 14px;
        font-weight: 500;
        color: #64748b;

        html.dark & {
          color: #94a3b8;
        }
      }
    }
  }

  .search-form {
    padding: 4px 8px;
    :deep(.el-form-item) {
      margin-bottom: 0;
      margin-right: 24px;
    }

    :deep(.el-input__wrapper),
    :deep(.el-select__wrapper) {
      border-radius: 8px;
      box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
    }
  }

  .report-content {
    .report-main {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 6px;

      .post-title {
        font-size: 15px;
        font-weight: 600;
        color: #1e293b;

        html.dark & {
          color: #f1f5f9;
        }
      }
    }

    .report-meta {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 12px;
      color: #94a3b8;

      .meta-item {
        display: flex;
        align-items: center;
        gap: 4px;
      }
    }
  }

  .action-btns {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;

    .btn-icon-wrapper {
      padding: 8px;
      border-radius: 10px;
      transition: all 0.2s;
      cursor: pointer;
      color: #64748b;

      &:hover {
        background: rgba(0, 0, 0, 0.05);
        transform: scale(1.1);
      }

      &.handle:hover {
        color: #10b981;
        background: rgba(16, 185, 129, 0.1);
      }
      &.view:hover {
        color: #3b82f6;
        background: rgba(59, 130, 246, 0.1);
      }
    }
  }
}

/* 按钮点击波纹效果增强 */
.el-button {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 10px;

  &:not(.is-disabled):active {
    transform: scale(0.95);
  }
}
</style>
