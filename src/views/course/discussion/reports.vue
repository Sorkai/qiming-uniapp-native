<script setup lang="ts">
/**
 * 教师端 - 举报处理
 * 教师可以处理所授课程中被举报的内容
 */
import { ref, reactive, computed, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  Search,
  Refresh,
  Check,
  Delete,
  View,
  Warning
} from "@element-plus/icons-vue";
import {
  getReportList,
  handleReport,
  type ReportRecord,
  type ReportStatus,
  type ReportReason
} from "@/api/discussion-admin";

defineOptions({
  name: "TeacherReportManage"
});

// 状态
const loading = ref(false);
const reports = ref<ReportRecord[]>([]);
const detailDialogVisible = ref(false);
const handleDialogVisible = ref(false);
const currentReport = ref<ReportRecord | null>(null);

// 统计数据
const stats = ref({
  pending: 0,
  resolvedToday: 0,
  totalReports: 0
});

// 搜索表单
const searchForm = reactive({
  status: "pending" as ReportStatus | "",
  reason: "" as ReportReason | ""
});

// 处理表单
const handleForm = reactive({
  action: "dismiss" as "delete" | "dismiss" | "warn",
  note: "",
  punishUser: false,
  punishType: "warning" as "warning" | "restrict" | "ban"
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
  { label: "已处理", value: "resolved" },
  { label: "已忽略", value: "dismissed" }
];

// 举报原因选项
const reasonOptions = [
  { label: "垃圾广告", value: "spam" },
  { label: "不当内容", value: "inappropriate" },
  { label: "骚扰攻击", value: "harassment" },
  { label: "虚假信息", value: "misinformation" },
  { label: "侵权内容", value: "copyright" },
  { label: "其他", value: "other" }
];

// 处理方式选项
const actionOptions = [
  { label: "忽略举报（内容无问题）", value: "dismiss" },
  { label: "删除内容", value: "delete" },
  { label: "警告作者", value: "warn" }
];

// 处罚类型选项
const punishOptions = [
  { label: "警告", value: "warning" },
  { label: "限制发帖", value: "restrict" },
  { label: "禁言", value: "ban" }
];

// 状态标签样式
const statusTagType = computed(() => (status: ReportStatus) => {
  const map: Record<string, string> = {
    pending: "warning",
    resolved: "success",
    dismissed: "info"
  };
  return map[status] || "info";
});

const statusText = computed(() => (status: ReportStatus) => {
  const map: Record<string, string> = {
    pending: "待处理",
    resolved: "已处理",
    dismissed: "已忽略"
  };
  return map[status] || status;
});

// 举报原因文本
const reasonText = computed(() => (reason: ReportReason) => {
  const opt = reasonOptions.find(o => o.value === reason);
  return opt?.label || reason;
});

// 加载数据
const fetchData = async () => {
  loading.value = true;
  try {
    const params: any = {
      page: pagination.page,
      pageSize: pagination.pageSize
    };
    if (searchForm.status) params.status = searchForm.status;
    if (searchForm.reason) params.reason = searchForm.reason;

    const { data } = await getReportList(params);
    reports.value = data.list;
    pagination.total = data.pagination.total;
    stats.value = data.stats;
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
  searchForm.reason = "";
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
const viewDetail = (row: ReportRecord) => {
  currentReport.value = row;
  detailDialogVisible.value = true;
};

// 打开处理弹窗
const openHandleDialog = (row: ReportRecord) => {
  currentReport.value = row;
  handleForm.action = "dismiss";
  handleForm.note = "";
  handleForm.punishUser = false;
  handleForm.punishType = "warning";
  handleDialogVisible.value = true;
};

// 快速忽略
const quickDismiss = async (row: ReportRecord) => {
  try {
    await ElMessageBox.confirm("确定要忽略这条举报吗？", "提示", {
      type: "info"
    });
    await handleReport(row.id, { action: "dismiss", note: "内容无问题" });
    ElMessage.success("已忽略");
    fetchData();
  } catch (error: any) {
    if (error !== "cancel") {
      ElMessage.error("操作失败");
    }
  }
};

// 快速删除
const quickDelete = async (row: ReportRecord) => {
  try {
    await ElMessageBox.confirm(
      "确定要删除被举报的内容吗？此操作不可恢复！",
      "警告",
      { type: "warning" }
    );
    await handleReport(row.id, { action: "delete", note: "内容违规" });
    ElMessage.success("已删除");
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
    await handleReport(currentReport.value.id, {
      action: handleForm.action,
      note: handleForm.note,
      punishUser: handleForm.punishUser,
      punishType: handleForm.punishUser ? handleForm.punishType : undefined
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

onMounted(() => {
  fetchData();
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
        <el-form-item label="举报原因">
          <el-select
            v-model="searchForm.reason"
            placeholder="全部原因"
            clearable
            style="width: 140px"
          >
            <el-option
              v-for="opt in reasonOptions"
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
                {{ row.target?.content?.substring(0, 100) }}...
              </div>
              <div class="text-gray-400 text-xs mt-1">
                作者：{{ row.target?.author?.name }}
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="举报原因" width="120" align="center">
          <template #default="{ row }">
            <el-tag type="danger" size="small">
              {{ reasonText(row.reason) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="举报人" width="120">
          <template #default="{ row }">
            <div class="flex items-center gap-2">
              <el-avatar :size="24" :src="row.reporter?.avatar" />
              <span class="text-sm">{{ row.reporter?.name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="举报次数" width="90" align="center">
          <template #default="{ row }">
            <el-badge
              :value="row.reportCount"
              :type="row.reportCount >= 3 ? 'danger' : 'info'"
            />
          </template>
        </el-table-column>
        <el-table-column label="状态" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="statusTagType(row.status)" size="small">
              {{ statusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="举报时间" width="160" align="center">
          <template #default="{ row }">
            <span class="text-sm text-gray-500">
              {{ formatTime(row.createdAt) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="{ row }">
            <el-button
              link
              type="primary"
              :icon="View"
              @click="viewDetail(row)"
            >
              查看
            </el-button>
            <template v-if="row.status === 'pending'">
              <el-button
                link
                type="success"
                :icon="Check"
                @click="quickDismiss(row)"
              >
                忽略
              </el-button>
              <el-button
                link
                type="danger"
                :icon="Delete"
                @click="quickDelete(row)"
              >
                删除
              </el-button>
              <el-button link type="warning" @click="openHandleDialog(row)">
                处理
              </el-button>
            </template>
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
              {{ reasonText(currentReport.reason) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="举报人">
            {{ currentReport.reporter?.name }}
          </el-descriptions-item>
          <el-descriptions-item label="举报次数">
            <el-badge :value="currentReport.reportCount" type="danger" />
          </el-descriptions-item>
          <el-descriptions-item label="举报时间" :span="2">
            {{ formatTime(currentReport.createdAt) }}
          </el-descriptions-item>
          <el-descriptions-item label="举报说明" :span="2">
            {{ currentReport.description || "无" }}
          </el-descriptions-item>
        </el-descriptions>

        <el-divider>被举报内容</el-divider>

        <div class="reported-content p-4 bg-gray-50 rounded">
          <div class="flex items-center gap-2 mb-2">
            <el-avatar :size="32" :src="currentReport.target?.author?.avatar" />
            <span class="font-medium">{{
              currentReport.target?.author?.name
            }}</span>
          </div>
          <div class="content-text">
            {{ currentReport.target?.content }}
          </div>
        </div>

        <template v-if="currentReport.status !== 'pending'">
          <el-divider>处理结果</el-divider>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="处理状态">
              <el-tag :type="statusTagType(currentReport.status)" size="small">
                {{ statusText(currentReport.status) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="处理人">
              {{ currentReport.handledBy?.name || "-" }}
            </el-descriptions-item>
            <el-descriptions-item label="处理时间" :span="2">
              {{ formatTime(currentReport.handledAt || "") }}
            </el-descriptions-item>
            <el-descriptions-item label="处理备注" :span="2">
              {{ currentReport.handleNote || "无" }}
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
              忽略举报
            </el-button>
            <el-button
              type="danger"
              @click="
                quickDelete(currentReport!);
                detailDialogVisible = false;
              "
            >
              删除内容
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
        <el-form-item v-if="handleForm.action !== 'dismiss'" label="处罚用户">
          <el-switch v-model="handleForm.punishUser" />
        </el-form-item>
        <el-form-item v-if="handleForm.punishUser" label="处罚类型">
          <el-select v-model="handleForm.punishType" style="width: 200px">
            <el-option
              v-for="opt in punishOptions"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
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
    border-radius: 12px;
    box-shadow: 0 4px 12px 0 rgb(0 0 0 / 5%);
    transition: all 0.3s;

    html.dark & {
      box-shadow: 0 4px 12px 0 rgb(0 0 0 / 20%);
    }

    &:hover {
      box-shadow: 0 8px 24px 0 rgb(0 0 0 / 10%);

      html.dark & {
        box-shadow: 0 8px 24px 0 rgb(0 0 0 / 40%);
      }
    }
  }

  .stat-card {
    .stat-content {
      padding: 10px 0;
      text-align: center;

      .stat-number {
        font-size: 28px;
        font-weight: 600;
      }

      .stat-label {
        margin-top: 8px;
        font-size: 14px;
        color: #909399;
      }
    }
  }

  .search-form {
    :deep(.el-form-item) {
      margin-bottom: 0;
    }
  }

  .report-content {
    .content-text {
      color: #606266;
    }
  }

  .report-detail {
    .reported-content {
      .content-text {
        line-height: 1.8;
        color: #303133;
      }
    }
  }
}
</style>
