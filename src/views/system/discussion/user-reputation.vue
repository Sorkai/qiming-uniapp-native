<script setup lang="ts">
/**
 * 管理员端 - 用户信誉管理
 * 管理用户的发言信誉分，可以查看、调整信誉分
 */
import { ref, reactive, computed, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Search, Refresh, Edit, Warning } from "@element-plus/icons-vue";
import {
  getUserReputationList,
  updateUserReputation,
  type UserReputation
} from "@/api/discussion-admin";
import InfoIcon from "@/assets/commentareasrelatedsvgs/information-circle-svgrepo-com.svg?component";

defineOptions({
  name: "UserReputationManage"
});

// 状态
const loading = ref(false);
const users = ref<UserReputation[]>([]);
const detailDialogVisible = ref(false);
const adjustDialogVisible = ref(false);
const currentUser = ref<UserReputation | null>(null);

// 搜索表单
const searchForm = reactive({
  keyword: "",
  level: "" as "" | "trusted" | "normal" | "restricted",
  sortBy: "score" as "score" | "postCount" | "replyCount" | "reportCount",
  sortOrder: "desc" as "asc" | "desc"
});

// 调整表单
const adjustForm = reactive({
  reputationScore: 0,
  reason: ""
});

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
});

// 状态统计
const stats = ref({
  trusted: 0,
  normal: 0,
  restricted: 0
});

// 等级选项
const levelOptions = [
  { label: "信誉良好", value: "trusted" },
  { label: "信誉普通", value: "normal" },
  { label: "信誉受限", value: "restricted" }
];

// 排序字段选项
const sortByOptions = [
  { label: "信誉分", value: "score" },
  { label: "发帖数", value: "postCount" },
  { label: "回复数", value: "replyCount" },
  { label: "被举报数", value: "reportCount" }
];

// 信誉分颜色
const getScoreColor = (score: number) => {
  if (score >= 80) return "#67c23a"; // 绿色
  if (score >= 60) return "#409eff"; // 蓝色
  if (score >= 40) return "#e6a23c"; // 橙色
  return "#f56c6c"; // 红色
};

// 等级标签样式
const getLevelType = (level: string) => {
  const map: Record<string, string> = {
    trusted: "success",
    normal: "primary",
    restricted: "warning"
  };
  return map[level] || "info";
};

const getLevelText = (level: string) => {
  const map: Record<string, string> = {
    trusted: "良好",
    normal: "普通",
    restricted: "受限"
  };
  return map[level] || level;
};

// 加载数据
const fetchData = async () => {
  loading.value = true;
  try {
    const params: any = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      sortBy: searchForm.sortBy,
      sortOrder: searchForm.sortOrder
    };
    if (searchForm.keyword) params.keyword = searchForm.keyword;
    if (searchForm.level) params.level = searchForm.level;

    const res: any = await getUserReputationList(params);
    const data = res.data;
    users.value = data.list || [];
    pagination.total = data.pagination?.total || 0;
    if (data.stats) {
      stats.value = data.stats;
    }
  } catch (error) {
    console.error("加载用户信誉列表失败", error);
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
  searchForm.keyword = "";
  searchForm.level = "";
  searchForm.sortBy = "score";
  searchForm.sortOrder = "desc";
  handleSearch();
};

// 分页
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
const viewDetail = (row: UserReputation) => {
  currentUser.value = row;
  detailDialogVisible.value = true;
};

// 打开调整弹窗
const openAdjustDialog = (row: UserReputation) => {
  currentUser.value = row;
  adjustForm.reputationScore = row.reputationScore;
  adjustForm.reason = "";
  adjustDialogVisible.value = true;
};

// 提交调整
const submitAdjust = async () => {
  if (!currentUser.value) return;

  if (!adjustForm.reason.trim()) {
    ElMessage.warning("请输入调整原因");
    return;
  }

  try {
    await updateUserReputation(currentUser.value.userId.toString(), {
      reputationScore: adjustForm.reputationScore,
      reason: adjustForm.reason
    });
    ElMessage.success("操作成功");
    adjustDialogVisible.value = false;
    fetchData();
  } catch (error) {
    ElMessage.error("操作失败");
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
  <div class="user-reputation-page p-4">
    <!-- 搜索栏 -->
    <el-card shadow="never" class="mb-4">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="搜索用户">
          <el-input
            v-model="searchForm.keyword"
            placeholder="搜索昵称"
            clearable
            style="width: 220px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="信誉等级">
          <el-select
            v-model="searchForm.level"
            placeholder="全部等级"
            clearable
            style="width: 140px"
          >
            <el-option
              v-for="opt in levelOptions"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="排序字段">
          <el-select
            v-model="searchForm.sortBy"
            placeholder="排序字段"
            style="width: 140px"
          >
            <el-option
              v-for="opt in sortByOptions"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="排序方向">
          <el-select v-model="searchForm.sortOrder" style="width: 120px">
            <el-option label="降序" value="desc" />
            <el-option label="升序" value="asc" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            :icon="Search"
            style="padding: 12px 24px; font-size: 15px"
            @click="handleSearch"
          >
            搜索
          </el-button>
          <el-button
            :icon="Refresh"
            style="padding: 12px 24px; font-size: 15px"
            @click="resetSearch"
          >
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 统计信息 -->
    <el-row :gutter="20" class="mb-4">
      <el-col :span="8">
        <el-card shadow="hover" class="status-card">
          <div class="flex items-center justify-between p-2">
            <div class="text-gray-500">良好用户</div>
            <div class="text-3xl font-bold text-success">
              {{ stats.trusted }}
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover" class="status-card">
          <div class="flex items-center justify-between p-2">
            <div class="text-gray-500">普通用户</div>
            <div class="text-3xl font-bold text-primary">
              {{ stats.normal }}
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover" class="status-card">
          <div class="flex items-center justify-between p-2">
            <div class="text-gray-500">受限用户</div>
            <div class="text-3xl font-bold text-warning">
              {{ stats.restricted }}
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 数据表格 -->
    <el-card shadow="never">
      <el-table
        v-loading="loading"
        :data="users"
        stripe
        class="reputation-table"
      >
        <el-table-column label="用户" min-width="220">
          <template #default="{ row }">
            <div class="flex items-center gap-4 h-[72px]">
              <el-avatar :size="60" :src="row.avatar" />
              <div>
                <div class="text-[18px] font-bold leading-tight">
                  {{ row.nickname }}
                </div>
                <div class="text-[14px] text-gray-400">
                  ID: {{ row.userId }}
                </div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="信誉分" width="130" align="center">
          <template #default="{ row }">
            <div class="flex justify-center items-center h-[72px]">
              <div
                class="relative flex items-center justify-center"
                style="width: 64px; height: 64px"
              >
                <el-progress
                  type="circle"
                  :percentage="row.reputationScore"
                  :width="64"
                  :stroke-width="6"
                  :show-text="false"
                  :color="getScoreColor(row.reputationScore)"
                />
                <span
                  class="absolute inset-0 flex items-center justify-center text-[20px] font-bold"
                  :style="{ color: getScoreColor(row.reputationScore) }"
                >
                  {{ row.reputationScore }}
                </span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="等级" width="130" align="center">
          <template #default="{ row }">
            <div class="flex justify-center items-center h-[72px]">
              <el-tag
                :type="getLevelType(row.level)"
                size="large"
                class="reputation-tag"
              >
                {{ getLevelText(row.level) }}
              </el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="发帖数" width="110" align="center">
          <template #default="{ row }">
            <div class="flex justify-center items-center h-[72px]">
              <span class="text-[18px] font-medium">{{ row.postCount }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="回复数" width="110" align="center">
          <template #default="{ row }">
            <div class="flex justify-center items-center h-[72px]">
              <span class="text-[18px] font-medium">{{ row.replyCount }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="被举报" width="120" align="center">
          <template #default="{ row }">
            <div class="flex justify-center items-center h-[72px]">
              <el-badge
                :value="row.reportedCount"
                :type="row.reportedCount > 0 ? 'warning' : 'info'"
                :max="999"
                class="large-badge"
              />
            </div>
          </template>
        </el-table-column>
        <el-table-column label="最后活跃" width="180" align="center">
          <template #default="{ row }">
            <div class="flex justify-center items-center h-[72px]">
              <span class="text-[16px] text-gray-500">
                {{ formatTime(row.lastActiveAt) }}
              </span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" align="center" fixed="right">
          <template #default="{ row }">
            <div class="flex justify-center items-center h-[72px] gap-4">
              <el-button
                link
                type="primary"
                :size="'default'"
                :icon="InfoIcon"
                class="text-[22px] !m-0"
                @click="viewDetail(row)"
              >
                详情
              </el-button>
              <el-button
                link
                type="primary"
                :size="'default'"
                :icon="Edit"
                class="text-[22px] !m-0"
                @click="openAdjustDialog(row)"
              >
                调整
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="flex justify-end mt-6">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[20, 50, 100]"
          layout="total, sizes, prev, pager, next"
          class="large-pagination"
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
        />
      </div>
    </el-card>

    <!-- 详情弹窗 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="用户信誉详情"
      width="600px"
      destroy-on-close
    >
      <div v-if="currentUser" class="user-detail">
        <!-- 基本信息 -->
        <div class="flex items-center gap-4 mb-6">
          <el-avatar :size="64" :src="currentUser.avatar" />
          <div>
            <div class="text-lg font-medium">{{ currentUser.nickname }}</div>
            <div class="text-sm text-gray-500">
              用户 ID: {{ currentUser.userId }}
            </div>
          </div>
          <div class="ml-auto text-center">
            <el-progress
              type="dashboard"
              :percentage="currentUser.reputationScore"
              :width="100"
              :color="getScoreColor(currentUser.reputationScore)"
            />
            <div class="text-sm text-gray-500 mt-1">信誉分</div>
          </div>
        </div>

        <!-- 统计数据 -->
        <el-row :gutter="16" class="mb-6">
          <el-col :span="8">
            <div class="stat-item">
              <div class="stat-value">{{ currentUser.postCount }}</div>
              <div class="stat-label">总发帖数</div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="stat-item">
              <div class="stat-value">{{ currentUser.replyCount }}</div>
              <div class="stat-label">总回复数</div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="stat-item">
              <div class="stat-value text-warning">
                {{ currentUser.reportedCount }}
              </div>
              <div class="stat-label">被举报次数</div>
            </div>
          </el-col>
        </el-row>

        <!-- 更多信息 -->
        <div class="bg-gray-50 p-4 rounded-lg">
          <div class="flex justify-between mb-2">
            <span class="text-gray-500">信誉等级</span>
            <el-tag :type="getLevelType(currentUser.level)" size="default">
              {{ getLevelText(currentUser.level) }}
            </el-tag>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-500">最后活跃</span>
            <span class="text-gray-700">{{
              formatTime(currentUser.lastActiveAt)
            }}</span>
          </div>
        </div>
      </div>

      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
        <el-button
          type="primary"
          @click="
            detailDialogVisible = false;
            openAdjustDialog(currentUser!);
          "
        >
          调整信誉
        </el-button>
      </template>
    </el-dialog>

    <!-- 调整弹窗 -->
    <el-dialog
      v-model="adjustDialogVisible"
      title="调整用户信誉"
      width="500px"
      destroy-on-close
    >
      <div v-if="currentUser" class="adjust-form">
        <div class="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded">
          <el-avatar :size="40" :src="currentUser.avatar" />
          <div>
            <div class="font-medium">{{ currentUser.nickname }}</div>
            <div class="text-sm text-gray-500">
              当前信誉分：{{ currentUser.reputationScore }}
            </div>
          </div>
        </div>

        <el-form :model="adjustForm" label-width="100px">
          <el-form-item label="信誉分" required>
            <el-input-number
              v-model="adjustForm.reputationScore"
              :min="0"
              :max="100"
              style="width: 200px"
            />
            <div class="mt-1 text-xs text-gray-400">设置范围：0 - 100</div>
          </el-form-item>
          <el-form-item label="原因" required>
            <el-input
              v-model="adjustForm.reason"
              type="textarea"
              :rows="3"
              placeholder="请输入调整原因"
            />
          </el-form-item>
        </el-form>
      </div>

      <template #footer>
        <el-button @click="adjustDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitAdjust">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.user-reputation-page {
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

  .reputation-table {
    :deep(.el-table__header-wrapper) {
      th {
        font-size: 16px;
        font-weight: bold;
        color: #333;
        background-color: #f8f9fb;
      }
    }

    :deep(.el-table__body-wrapper) {
      td {
        font-size: 16px;
        padding: 16px 0;
      }
    }
  }

  .reputation-tag {
    font-size: 15px;
    padding: 12px 16px;
    height: auto;
  }

  .large-badge {
    :deep(.el-badge__content) {
      font-size: 15px;
      height: 24px;
      line-height: 24px;
      padding: 0 10px;
      border-radius: 12px;
    }
  }

  .large-pagination {
    :deep(.btn-prev),
    :deep(.btn-next),
    :deep(.el-pager li),
    :deep(.el-pagination__total),
    :deep(.el-pagination__sizes .el-input__wrapper) {
      font-size: 15px;
      height: 36px;
      line-height: 36px;
      min-width: 36px;
    }

    :deep(.el-select__wrapper) {
      font-size: 15px;
      height: 36px;
    }
  }

  .search-form {
    :deep(.el-form-item) {
      margin-bottom: 0;

      .el-form-item__label {
        font-size: 16px;
      }

      .el-input__wrapper,
      .el-select__wrapper {
        font-size: 16px;
        height: 40px;
      }
    }
  }
}

.status-card {
  .text-gray-500 {
    font-size: 18px;
  }

  .text-2xl {
    font-size: 36px;
  }
}

.user-detail {
  .stat-item {
    padding: 16px;
    text-align: center;
    background: #f5f7fa;
    border-radius: 8px;

    .stat-value {
      font-size: 24px;
      font-weight: 600;
      color: #303133;
    }

    .stat-label {
      margin-top: 4px;
      font-size: 14px;
      color: #909399;
    }
  }
}
</style>
