<script setup lang="ts">
/**
 * 管理员端 - 用户信誉管理
 * 管理用户的发言信誉分，可以查看、调整信誉分
 */
import { ref, reactive, computed, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Search, Refresh, Edit, View, Warning } from "@element-plus/icons-vue";
import {
  getUserReputationList,
  updateUserReputation,
  type UserReputation
} from "@/api/discussion-admin";

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
  status: "" as "" | "normal" | "restricted" | "banned",
  minScore: undefined as number | undefined,
  maxScore: undefined as number | undefined
});

// 调整表单
const adjustForm = reactive({
  scoreChange: 0,
  reason: "",
  action: "adjust" as "adjust" | "restrict" | "unrestrict" | "ban" | "unban"
});

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
});

// 状态选项
const statusOptions = [
  { label: "正常", value: "normal" },
  { label: "限制发帖", value: "restricted" },
  { label: "已禁言", value: "banned" }
];

// 调整操作选项
const actionOptions = [
  { label: "仅调整分数", value: "adjust" },
  { label: "限制发帖", value: "restrict" },
  { label: "解除限制", value: "unrestrict" },
  { label: "禁言", value: "ban" },
  { label: "解除禁言", value: "unban" }
];

// 信誉分颜色
const getScoreColor = computed(() => (score: number) => {
  if (score >= 80) return "#67c23a"; // 绿色
  if (score >= 60) return "#409eff"; // 蓝色
  if (score >= 40) return "#e6a23c"; // 橙色
  return "#f56c6c"; // 红色
});

// 状态标签样式
const getStatusType = (status: string) => {
  const map: Record<string, string> = {
    normal: "success",
    restricted: "warning",
    banned: "danger"
  };
  return map[status] || "info";
};

const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    normal: "正常",
    restricted: "限制发帖",
    banned: "已禁言"
  };
  return map[status] || status;
};

// 加载数据
const fetchData = async () => {
  loading.value = true;
  try {
    const params: any = {
      page: pagination.page,
      pageSize: pagination.pageSize
    };
    if (searchForm.keyword) params.keyword = searchForm.keyword;
    if (searchForm.status) params.status = searchForm.status;
    if (searchForm.minScore !== undefined)
      params.minScore = searchForm.minScore;
    if (searchForm.maxScore !== undefined)
      params.maxScore = searchForm.maxScore;

    const { data } = await getUserReputationList(params);
    users.value = data.list;
    pagination.total = data.pagination.total;
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
  searchForm.status = "";
  searchForm.minScore = undefined;
  searchForm.maxScore = undefined;
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
  adjustForm.scoreChange = 0;
  adjustForm.reason = "";
  adjustForm.action = "adjust";
  adjustDialogVisible.value = true;
};

// 快速禁言
const quickBan = async (row: UserReputation) => {
  try {
    await ElMessageBox.prompt(
      "请输入禁言原因",
      `禁言用户「${row.user.name}」`,
      {
        confirmButtonText: "确认禁言",
        cancelButtonText: "取消",
        inputPlaceholder: "输入禁言原因",
        type: "warning"
      }
    ).then(async ({ value }) => {
      await updateUserReputation(row.userId, {
        action: "ban",
        reason: value || "违规操作"
      });
      ElMessage.success("禁言成功");
      fetchData();
    });
  } catch {
    // 用户取消
  }
};

// 解除禁言
const quickUnban = async (row: UserReputation) => {
  try {
    await ElMessageBox.confirm(
      `确定要解除用户「${row.user.name}」的禁言吗？`,
      "提示"
    );
    await updateUserReputation(row.userId, {
      action: "unban",
      reason: "解除禁言"
    });
    ElMessage.success("解除禁言成功");
    fetchData();
  } catch {
    // 用户取消
  }
};

// 提交调整
const submitAdjust = async () => {
  if (!currentUser.value) return;

  if (adjustForm.action === "adjust" && adjustForm.scoreChange === 0) {
    ElMessage.warning("请输入分数变化值");
    return;
  }
  if (!adjustForm.reason.trim()) {
    ElMessage.warning("请输入调整原因");
    return;
  }

  try {
    await updateUserReputation(currentUser.value.userId, {
      action: adjustForm.action,
      scoreChange:
        adjustForm.action === "adjust" ? adjustForm.scoreChange : undefined,
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
            placeholder="用户名/学号/手机号"
            clearable
            style="width: 180px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
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
        <el-form-item label="信誉分">
          <el-input-number
            v-model="searchForm.minScore"
            :min="0"
            :max="100"
            placeholder="最低"
            style="width: 100px"
            controls-position="right"
          />
          <span class="mx-2">-</span>
          <el-input-number
            v-model="searchForm.maxScore"
            :min="0"
            :max="100"
            placeholder="最高"
            style="width: 100px"
            controls-position="right"
          />
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
      <el-table v-loading="loading" :data="users" stripe>
        <el-table-column label="用户" min-width="200">
          <template #default="{ row }">
            <div class="flex items-center gap-3">
              <el-avatar :size="40" :src="row.user.avatar" />
              <div>
                <div class="font-medium">{{ row.user.name }}</div>
                <div class="text-xs text-gray-400">
                  {{ row.user.studentId }}
                </div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="信誉分" width="150" align="center">
          <template #default="{ row }">
            <div class="flex items-center justify-center gap-2">
              <el-progress
                type="circle"
                :percentage="row.score"
                :width="50"
                :color="getScoreColor(row.score)"
              />
            </div>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="110" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          label="发帖数"
          prop="postCount"
          width="90"
          align="center"
        />
        <el-table-column
          label="被赞数"
          prop="likeCount"
          width="90"
          align="center"
        />
        <el-table-column label="违规次数" width="100" align="center">
          <template #default="{ row }">
            <el-badge
              :value="row.violationCount"
              :type="row.violationCount > 0 ? 'danger' : 'info'"
            />
          </template>
        </el-table-column>
        <el-table-column label="被举报次数" width="110" align="center">
          <template #default="{ row }">
            <el-badge
              :value="row.reportedCount"
              :type="row.reportedCount > 0 ? 'warning' : 'info'"
            />
          </template>
        </el-table-column>
        <el-table-column label="最后活跃" width="140" align="center">
          <template #default="{ row }">
            <span class="text-sm text-gray-500">
              {{ formatTime(row.lastActiveAt) }}
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
              详情
            </el-button>
            <el-button
              link
              type="warning"
              :icon="Edit"
              @click="openAdjustDialog(row)"
            >
              调整
            </el-button>
            <template v-if="row.status === 'banned'">
              <el-button link type="success" @click="quickUnban(row)">
                解禁
              </el-button>
            </template>
            <template v-else>
              <el-button
                link
                type="danger"
                :icon="Warning"
                @click="quickBan(row)"
              >
                禁言
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
          :page-sizes="[20, 50, 100]"
          layout="total, sizes, prev, pager, next"
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
        />
      </div>
    </el-card>

    <!-- 详情弹窗 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="用户信誉详情"
      width="700px"
      destroy-on-close
    >
      <div v-if="currentUser" class="user-detail">
        <!-- 基本信息 -->
        <div class="flex items-center gap-4 mb-6">
          <el-avatar :size="64" :src="currentUser.user.avatar" />
          <div>
            <div class="text-lg font-medium">{{ currentUser.user.name }}</div>
            <div class="text-sm text-gray-500">
              {{ currentUser.user.studentId }}
            </div>
          </div>
          <div class="ml-auto text-center">
            <el-progress
              type="dashboard"
              :percentage="currentUser.score"
              :width="100"
              :color="getScoreColor(currentUser.score)"
            />
            <div class="text-sm text-gray-500 mt-1">信誉分</div>
          </div>
        </div>

        <!-- 统计数据 -->
        <el-row :gutter="16" class="mb-6">
          <el-col :span="6">
            <div class="stat-item">
              <div class="stat-value">{{ currentUser.postCount }}</div>
              <div class="stat-label">发帖数</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-item">
              <div class="stat-value">{{ currentUser.replyCount }}</div>
              <div class="stat-label">回复数</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-item">
              <div class="stat-value text-success">
                {{ currentUser.likeCount }}
              </div>
              <div class="stat-label">获赞数</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-item">
              <div class="stat-value text-danger">
                {{ currentUser.violationCount }}
              </div>
              <div class="stat-label">违规次数</div>
            </div>
          </el-col>
        </el-row>

        <!-- 信誉记录 -->
        <div class="reputation-history">
          <div class="text-base font-medium mb-3">信誉变更记录</div>
          <el-table :data="currentUser.history" max-height="300" size="small">
            <el-table-column label="时间" prop="createdAt" width="160">
              <template #default="{ row }">
                {{ formatTime(row.createdAt) }}
              </template>
            </el-table-column>
            <el-table-column label="变化" width="100" align="center">
              <template #default="{ row }">
                <span :class="row.change > 0 ? 'text-success' : 'text-danger'">
                  {{ row.change > 0 ? "+" : "" }}{{ row.change }}
                </span>
              </template>
            </el-table-column>
            <el-table-column label="原因" prop="reason" />
            <el-table-column label="操作人" prop="operator" width="100" />
          </el-table>
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
          <el-avatar :size="40" :src="currentUser.user.avatar" />
          <div>
            <div class="font-medium">{{ currentUser.user.name }}</div>
            <div class="text-sm text-gray-500">
              当前信誉分：{{ currentUser.score }}
            </div>
          </div>
        </div>

        <el-form :model="adjustForm" label-width="100px">
          <el-form-item label="操作类型" required>
            <el-radio-group v-model="adjustForm.action">
              <el-radio
                v-for="opt in actionOptions"
                :key="opt.value"
                :label="opt.value"
              >
                {{ opt.label }}
              </el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item
            v-if="adjustForm.action === 'adjust'"
            label="分数变化"
            required
          >
            <el-input-number
              v-model="adjustForm.scoreChange"
              :min="-100"
              :max="100"
              :step="5"
              style="width: 200px"
            />
            <span class="ml-2 text-sm text-gray-500">
              调整后：{{
                Math.max(
                  0,
                  Math.min(100, currentUser.score + adjustForm.scoreChange)
                )
              }}
            </span>
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
    border-radius: 12px;
    border: none;
    box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.05);
    transition: all 0.3s;

    html.dark & {
      box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.2);
    }

    &:hover {
      box-shadow: 0 8px 24px 0 rgba(0, 0, 0, 0.1);

      html.dark & {
        box-shadow: 0 8px 24px 0 rgba(0, 0, 0, 0.4);
      }
    }
  }

  .search-form {
    :deep(.el-form-item) {
      margin-bottom: 0;
    }
  }
}

.user-detail {
  .stat-item {
    text-align: center;
    padding: 16px;
    background: #f5f7fa;
    border-radius: 8px;

    .stat-value {
      font-size: 24px;
      font-weight: 600;
      color: #303133;
    }

    .stat-label {
      font-size: 14px;
      color: #909399;
      margin-top: 4px;
    }
  }
}
</style>
