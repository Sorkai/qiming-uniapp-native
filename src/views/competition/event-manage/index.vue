<template>
  <div class="main event-manage" :class="{ 'event-manage--mobile': isMobile }">
    <el-card class="box-card header-card">
      <div class="header-content">
        <div class="header-left">
          <h2>综合赛事管理</h2>
          <p>管理各类综合竞赛活动，包括编程竞赛、知识竞赛、作文比赛等</p>
        </div>
        <div class="header-stats">
          <div class="stat-item">
            <span class="stat-value">{{ stats.totalEvents }}</span>
            <span class="stat-label">赛事总数</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ stats.ongoingEvents }}</span>
            <span class="stat-label">进行中</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ stats.totalParticipants }}</span>
            <span class="stat-label">总参与人数</span>
          </div>
        </div>
      </div>
    </el-card>

    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>赛事列表</span>
          <el-button
            type="primary"
            :class="{ 'header-action-button': isMobile }"
            @click="handleOpenDialog()"
          >
            创建赛事
          </el-button>
        </div>
      </template>

      <el-form
        :inline="!isMobile"
        :model="searchForm"
        :label-position="isMobile ? 'top' : 'right'"
        class="search-form"
      >
        <el-form-item label="赛事名称">
          <el-input
            v-model="searchForm.title"
            placeholder="请输入赛事名称"
            clearable
            :style="{ width: isMobile ? '100%' : '220px' }"
          />
        </el-form-item>
        <el-form-item label="类型">
          <el-select
            v-model="searchForm.type"
            placeholder="请选择类型"
            clearable
            :style="{ width: isMobile ? '100%' : '160px' }"
          >
            <el-option label="编程竞赛" value="coding" />
            <el-option label="知识竞赛" value="quiz" />
            <el-option label="作文比赛" value="essay" />
            <el-option label="综合竞赛" value="comprehensive" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select
            v-model="searchForm.status"
            placeholder="请选择状态"
            clearable
            :style="{ width: isMobile ? '100%' : '160px' }"
          >
            <el-option label="即将开始" value="upcoming" />
            <el-option label="进行中" value="ongoing" />
            <el-option label="已结束" value="ended" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>

      <template v-if="isMobile">
        <div v-loading="loading" class="mobile-event-list">
          <div
            v-for="row in tableData"
            :key="row.eventId"
            class="mobile-event-card"
          >
            <div class="mobile-card-head">
              <div class="mobile-card-head-main">
                <span class="mobile-card-id">#{{ row.eventId }}</span>
                <div class="mobile-event-title">
                  <span class="event-icon">{{ getTypeIcon(row.type) }}</span>
                  <span>{{ row.title }}</span>
                </div>
              </div>
              <el-tag
                :type="getStatusTagType(row.status)"
                size="small"
                effect="light"
              >
                {{ getStatusLabel(row.status) }}
              </el-tag>
            </div>

            <div class="mobile-event-tags">
              <el-tag
                :type="getTypeTagType(row.type)"
                size="small"
                effect="light"
              >
                {{ getTypeLabel(row.type) }}
              </el-tag>
              <span class="mobile-participants"
                >参与 {{ row.participants }} 人</span
              >
            </div>

            <div class="mobile-event-meta">
              <span>开始：{{ row.startTime }}</span>
              <span>结束：{{ row.endTime }}</span>
            </div>

            <div class="mobile-card-actions">
              <el-button
                type="info"
                size="small"
                plain
                @click="viewParticipants(row)"
              >
                查看报名
              </el-button>
              <el-button
                type="primary"
                size="small"
                plain
                @click="viewRankings(row)"
              >
                排行榜
              </el-button>
              <el-button
                type="warning"
                size="small"
                plain
                @click="handleOpenDialog(row)"
              >
                编辑
              </el-button>
              <el-button
                type="danger"
                size="small"
                plain
                @click="handleDelete(row)"
              >
                删除
              </el-button>
            </div>
          </div>

          <el-empty
            v-if="!loading && tableData.length === 0"
            description="暂无赛事"
          />
        </div>
      </template>
      <div v-else class="table-shell">
        <el-table
          v-loading="loading"
          :data="tableData"
          stripe
          style="width: 100%"
        >
          <el-table-column
            prop="eventId"
            label="ID"
            align="center"
            width="80"
          />
          <el-table-column
            prop="title"
            label="赛事名称"
            align="left"
            min-width="200"
          >
            <template #default="{ row }">
              <div class="event-title-cell">
                <span class="event-icon">{{ getTypeIcon(row.type) }}</span>
                <span>{{ row.title }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="type" label="类型" align="center" width="120">
            <template #default="{ row }">
              <el-tag :type="getTypeTagType(row.type)">
                {{ getTypeLabel(row.type) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            prop="startTime"
            label="开始时间"
            align="center"
            width="160"
          />
          <el-table-column
            prop="endTime"
            label="结束时间"
            align="center"
            width="160"
          />
          <el-table-column
            prop="participants"
            label="参与人数"
            align="center"
            width="100"
          />
          <el-table-column
            prop="status"
            label="状态"
            align="center"
            width="100"
          >
            <template #default="{ row }">
              <el-tag :type="getStatusTagType(row.status)">
                {{ getStatusLabel(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" width="280">
            <template #default="{ row }">
              <el-button
                type="info"
                size="small"
                @click="viewParticipants(row)"
              >
                查看报名
              </el-button>
              <el-button type="primary" size="small" @click="viewRankings(row)">
                排行榜
              </el-button>
              <el-button
                type="warning"
                size="small"
                @click="handleOpenDialog(row)"
              >
                编辑
              </el-button>
              <el-button type="danger" size="small" @click="handleDelete(row)">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="queryParams.pageNum"
          v-model:page-size="queryParams.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :layout="paginationLayout"
          :size="isMobile ? 'small' : 'default'"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 赛事表单弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="formData.eventId ? '编辑赛事' : '创建赛事'"
      :width="getDialogWidth('650px', '96%')"
      :fullscreen="isMobile"
      destroy-on-close
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        :label-width="isMobile ? undefined : '100px'"
        :label-position="isMobile ? 'top' : 'right'"
      >
        <el-form-item label="赛事名称" prop="title">
          <el-input v-model="formData.title" placeholder="请输入赛事名称" />
        </el-form-item>
        <el-form-item label="赛事简介" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="3"
            placeholder="请输入赛事简介"
          />
        </el-form-item>
        <el-form-item label="赛事类型" prop="type">
          <el-select v-model="formData.type" placeholder="请选择类型">
            <el-option label="编程竞赛" value="coding" />
            <el-option label="知识竞赛" value="quiz" />
            <el-option label="作文比赛" value="essay" />
            <el-option label="综合竞赛" value="comprehensive" />
          </el-select>
        </el-form-item>
        <el-form-item label="开始时间" prop="startTime">
          <el-date-picker
            v-model="formData.startTime"
            type="datetime"
            placeholder="请选择开始时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            :style="{ width: isMobile ? '100%' : undefined }"
          />
        </el-form-item>
        <el-form-item label="结束时间" prop="endTime">
          <el-date-picker
            v-model="formData.endTime"
            type="datetime"
            placeholder="请选择结束时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            :style="{ width: isMobile ? '100%' : undefined }"
          />
        </el-form-item>
        <el-form-item label="题目数量" prop="questionCount">
          <el-input-number
            v-model="formData.questionCount"
            :min="1"
            :max="100"
          />
        </el-form-item>
        <el-form-item label="时间限制" prop="timeLimit">
          <el-input-number v-model="formData.timeLimit" :min="10" :max="300" />
          <span class="ml-2 text-gray-500">分钟</span>
        </el-form-item>
        <el-form-item label="满分" prop="totalScore">
          <el-input-number
            v-model="formData.totalScore"
            :min="10"
            :max="1000"
            :step="10"
          />
        </el-form-item>
        <el-form-item label="赛事状态" prop="status">
          <el-select v-model="formData.status" placeholder="请选择状态">
            <el-option label="即将开始" value="upcoming" />
            <el-option label="进行中" value="ongoing" />
            <el-option label="已结束" value="ended" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 报名列表弹窗 -->
    <el-dialog
      v-model="participantsDialogVisible"
      title="报名列表"
      :width="getDialogWidth('700px', '96%')"
      :fullscreen="isMobile"
    >
      <template v-if="isMobile">
        <div class="mobile-participant-list">
          <div
            v-for="(row, index) in participantsList"
            :key="`${row.username}-${index}`"
            class="mobile-participant-card"
          >
            <div class="mobile-card-head">
              <div class="mobile-card-head-main">
                <span class="mobile-card-id">#{{ index + 1 }}</span>
                <div class="participant-name">
                  {{ row.realName || row.username }}
                </div>
              </div>
              <el-tag
                :type="row.status === 'completed' ? 'success' : 'info'"
                size="small"
              >
                {{ row.status === "completed" ? "已完成" : "未参与" }}
              </el-tag>
            </div>
            <div class="mobile-event-meta">
              <span>用户名：{{ row.username }}</span>
              <span>班级：{{ row.className }}</span>
              <span>报名时间：{{ row.registerTime }}</span>
            </div>
          </div>

          <el-empty
            v-if="participantsList.length === 0"
            description="暂无报名信息"
          />
        </div>
      </template>
      <div v-else class="table-shell">
        <el-table :data="participantsList" stripe style="width: 100%">
          <el-table-column type="index" label="#" width="60" />
          <el-table-column prop="username" label="用户名" />
          <el-table-column prop="realName" label="姓名" />
          <el-table-column prop="className" label="班级" />
          <el-table-column prop="registerTime" label="报名时间" />
          <el-table-column prop="status" label="状态">
            <template #default="{ row }">
              <el-tag :type="row.status === 'completed' ? 'success' : 'info'">
                {{ row.status === "completed" ? "已完成" : "未参与" }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-dialog>

    <!-- 排行榜弹窗 -->
    <el-dialog
      v-model="rankingsDialogVisible"
      title="排行榜"
      :width="getDialogWidth('700px', '96%')"
      :fullscreen="isMobile"
    >
      <div class="rankings-list">
        <div
          v-for="(user, index) in rankingsList"
          :key="user.userId"
          class="ranking-item"
          :class="{ 'is-top3': index < 3 }"
        >
          <div class="rank">
            <span v-if="index < 3" class="rank-medal">{{
              ["🥇", "🥈", "🥉"][index]
            }}</span>
            <span v-else class="rank-number">{{ index + 1 }}</span>
          </div>
          <el-avatar :size="40" :src="formatAvatar(user.avatar)" />
          <div class="user-info">
            <span class="username">{{ user.username }}</span>
            <span class="class-name">{{ user.className }}</span>
          </div>
          <div class="score">{{ user.score }} 分</div>
          <div class="time">用时 {{ user.duration }}</div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from "vue";
import { formatAvatar } from "@/utils/avatar";
import { ElMessage, ElMessageBox, type FormInstance } from "element-plus";
import { usePageResponsive } from "@/utils/pageResponsive";
import {
  getEventList,
  upsertEvent,
  deleteEvent,
  getEventStats,
  getEventParticipants,
  getEventRankings
} from "@/api/competition";

defineOptions({
  name: "EventManage"
});

const { isMobile, paginationLayout, getDialogWidth } = usePageResponsive();

interface EventItem {
  eventId: number;
  title: string;
  description: string;
  type: "coding" | "quiz" | "essay" | "comprehensive";
  startTime: string;
  endTime: string;
  questionCount: number;
  timeLimit: number;
  totalScore: number;
  participants: number;
  status: "upcoming" | "ongoing" | "ended";
}

const loading = ref(false);
const tableData = ref<EventItem[]>([]);
const total = ref(0);

const stats = ref({
  totalEvents: 0,
  ongoingEvents: 0,
  totalParticipants: 0
});

const queryParams = reactive({
  pageNum: 1,
  pageSize: 20
});

const searchForm = reactive({
  title: "",
  type: "",
  status: ""
});

const handleSearch = () => {
  queryParams.pageNum = 1;
  loadTableData();
};

const resetSearch = () => {
  searchForm.title = "";
  searchForm.type = "";
  searchForm.status = "";
  queryParams.pageNum = 1;
  loadTableData();
};

const loadTableData = async () => {
  loading.value = true;
  try {
    const params = {
      ...queryParams,
      ...searchForm
    };
    const { data } = await getEventList(params);
    tableData.value = data.eventList;
    total.value = data.total;
  } catch (error) {
    console.error("获取赛事列表失败", error);
    ElMessage.error("获取赛事列表失败");
  } finally {
    loading.value = false;
  }
};

const loadStats = async () => {
  try {
    const { data } = await getEventStats();
    stats.value = data;
  } catch (error) {
    console.error("获取统计数据失败", error);
  }
};

const handleSizeChange = (val: number) => {
  queryParams.pageSize = val;
  loadTableData();
};

const handleCurrentChange = (val: number) => {
  queryParams.pageNum = val;
  loadTableData();
};

// 表单相关
const dialogVisible = ref(false);
const formRef = ref<FormInstance>();
const formData = reactive({
  eventId: 0,
  title: "",
  description: "",
  type: "",
  startTime: "",
  endTime: "",
  questionCount: 10,
  timeLimit: 60,
  totalScore: 100,
  status: "upcoming"
});

const formRules = {
  title: [{ required: true, message: "请输入赛事名称", trigger: "blur" }],
  description: [{ required: true, message: "请输入赛事简介", trigger: "blur" }],
  type: [{ required: true, message: "请选择赛事类型", trigger: "change" }],
  startTime: [{ required: true, message: "请选择开始时间", trigger: "change" }],
  endTime: [{ required: true, message: "请选择结束时间", trigger: "change" }],
  status: [{ required: true, message: "请选择状态", trigger: "change" }]
};

const handleOpenDialog = (row?: EventItem) => {
  dialogVisible.value = true;

  // 重置表单
  formData.eventId = 0;
  formData.title = "";
  formData.description = "";
  formData.type = "";
  formData.startTime = "";
  formData.endTime = "";
  formData.questionCount = 10;
  formData.timeLimit = 60;
  formData.totalScore = 100;
  formData.status = "upcoming";

  if (row) {
    Object.assign(formData, row);
  }
};

const handleSubmit = async () => {
  formRef.value?.validate(async valid => {
    if (!valid) return;

    try {
      await upsertEvent(formData);
      ElMessage.success(formData.eventId ? "编辑成功" : "新增成功");
      dialogVisible.value = false;
      loadTableData();
      loadStats();
    } catch (error) {
      console.error("保存赛事失败", error);
      ElMessage.error("保存失败，请重试");
    }
  });
};

const handleDelete = (row: EventItem) => {
  ElMessageBox.confirm(`确定要删除赛事 "${row.title}" 吗？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(async () => {
      try {
        await deleteEvent({ eventId: row.eventId });
        ElMessage.success("删除成功");
        loadTableData();
        loadStats();
      } catch (error) {
        console.error("删除赛事失败", error);
        ElMessage.error("删除失败，请重试");
      }
    })
    .catch(() => {});
};

// 报名列表
const participantsDialogVisible = ref(false);
const participantsList = ref<any[]>([]);

const viewParticipants = async (row: EventItem) => {
  try {
    const { data } = await getEventParticipants({ eventId: row.eventId });
    participantsList.value = data.list;
    participantsDialogVisible.value = true;
  } catch (error) {
    ElMessage.error("获取报名列表失败");
  }
};

// 排行榜
const rankingsDialogVisible = ref(false);
const rankingsList = ref<any[]>([]);

const viewRankings = async (row: EventItem) => {
  try {
    const { data } = await getEventRankings({ eventId: row.eventId });
    rankingsList.value = data.list;
    rankingsDialogVisible.value = true;
  } catch (error) {
    ElMessage.error("获取排行榜失败");
  }
};

// 工具函数
const getTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    coding: "编程竞赛",
    quiz: "知识竞赛",
    essay: "作文比赛",
    comprehensive: "综合竞赛"
  };
  return labels[type] || type;
};

const getTypeIcon = (type: string) => {
  const icons: Record<string, string> = {
    coding: "💻",
    quiz: "🥇",
    essay: "📄",
    comprehensive: "🏆"
  };
  return icons[type] || "🎯";
};

const getTypeTagType = (
  type: string
): "primary" | "success" | "warning" | "danger" => {
  const types: Record<string, "primary" | "success" | "warning" | "danger"> = {
    coding: "primary",
    quiz: "danger",
    essay: "warning",
    comprehensive: "success"
  };
  return types[type] || "primary";
};

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    upcoming: "即将开始",
    ongoing: "进行中",
    ended: "已结束"
  };
  return labels[status] || status;
};

const getStatusTagType = (status: string): "primary" | "success" | "info" => {
  const types: Record<string, "primary" | "success" | "info"> = {
    upcoming: "primary",
    ongoing: "success",
    ended: "info"
  };
  return types[status] || "info";
};

onMounted(() => {
  loadTableData();
  loadStats();
});
</script>

<style lang="scss" scoped>
.main {
  padding: 12px;
  color: var(--el-text-color-primary);

  .header-card {
    margin-bottom: 16px;
    overflow: hidden;
    background: linear-gradient(135deg, #6ee7b7 0%, #34d399 100%);
    border: none;
    border-radius: 16px;
    box-shadow: 0 4px 16px rgb(0 0 0 / 12%);

    .header-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 24px;
      padding: 8px 0;
    }

    .header-left {
      h2 {
        margin: 0 0 8px;
        font-size: 24px;
        font-weight: 600;
        color: #1f2937;
      }

      p {
        margin: 0;
        font-size: 14px;
        color: #374151;
      }
    }

    .header-stats {
      display: grid;
      grid-template-columns: repeat(3, minmax(90px, 1fr));
      gap: 16px;

      .stat-item {
        text-align: center;
        padding: 14px 12px;
        background: rgb(255 255 255 / 35%);
        border: 1px solid rgb(255 255 255 / 28%);
        border-radius: 14px;
        backdrop-filter: blur(10px);

        .stat-value {
          display: block;
          font-size: 28px;
          font-weight: 700;
          color: #1f2937;
        }

        .stat-label {
          display: block;
          margin-top: 4px;
          font-size: 12px;
          color: #4b5563;
        }
      }
    }
  }

  .box-card {
    margin-bottom: 16px;
    overflow: hidden;
    border: 1px solid var(--el-border-color-light);
    border-radius: 16px;
    box-shadow: 0 4px 16px rgb(0 0 0 / 12%);

    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }

    .search-form {
      margin-bottom: 16px;
    }
  }

  .table-shell {
    overflow-x: auto;

    :deep(.el-table) {
      min-width: 1120px;
    }
  }

  .event-title-cell {
    display: flex;
    gap: 8px;
    align-items: center;

    .event-icon {
      font-size: 20px;
    }
  }

  .pagination-container {
    display: flex;
    justify-content: flex-end;
    margin-top: 16px;
  }

  .mobile-event-list,
  .mobile-participant-list {
    display: grid;
    gap: 12px;
  }

  .mobile-event-card,
  .mobile-participant-card {
    padding: 16px;
    background: linear-gradient(180deg, #fff 0%, #f4fffb 100%);
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 18px;
    box-shadow: 0 10px 24px rgb(15 23 42 / 6%);
  }

  .mobile-card-head {
    display: flex;
    gap: 12px;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 12px;
  }

  .mobile-card-head-main {
    display: grid;
    gap: 6px;
    min-width: 0;
  }

  .mobile-card-id {
    font-size: 12px;
    font-weight: 700;
    color: #047857;
    letter-spacing: 0.08em;
  }

  .mobile-event-title,
  .participant-name {
    display: flex;
    gap: 8px;
    align-items: center;
    font-size: 16px;
    font-weight: 600;
    line-height: 1.5;
  }

  .mobile-event-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
    margin-bottom: 12px;
  }

  .mobile-participants {
    font-size: 13px;
    color: var(--el-text-color-regular);
  }

  .mobile-event-meta {
    display: grid;
    gap: 8px;
    margin-bottom: 12px;
    font-size: 13px;
    color: var(--el-text-color-regular);
  }

  .mobile-card-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    margin-top: 16px;
  }
}

.rankings-list {
  .ranking-item {
    display: flex;
    align-items: center;
    padding: 12px 16px;
    margin-bottom: 8px;
    background: var(--el-fill-color-light);
    border-radius: 12px;
    transition: all 0.3s ease;

    &:hover {
      background: var(--el-fill-color);
    }

    &.is-top3 {
      background: linear-gradient(
        135deg,
        rgb(251 191 36 / 10%) 0%,
        rgb(245 158 11 / 5%) 100%
      );
    }

    .rank {
      width: 40px;
      text-align: center;

      .rank-medal {
        font-size: 24px;
      }

      .rank-number {
        font-size: 16px;
        font-weight: 600;
        color: var(--el-text-color-secondary);
      }
    }

    .user-info {
      flex: 1;
      margin-left: 12px;

      .username {
        display: block;
        font-weight: 500;
        color: var(--el-text-color-primary);
      }

      .class-name {
        display: block;
        font-size: 12px;
        color: var(--el-text-color-secondary);
      }
    }

    .score {
      margin-right: 20px;
      font-size: 18px;
      font-weight: 700;
      color: var(--el-color-primary);
    }

    .time {
      font-size: 12px;
      color: var(--el-text-color-secondary);
    }
  }
}

.event-manage--mobile {
  padding: 8px;

  .header-card {
    .header-content {
      flex-direction: column;
      align-items: stretch;
      gap: 18px;
    }

    .header-left {
      h2 {
        font-size: 22px;
        line-height: 1.3;
      }

      p {
        line-height: 1.6;
      }
    }

    .header-stats {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 12px;

      .stat-item {
        text-align: left;
      }
    }
  }

  .box-card {
    .card-header {
      flex-direction: column;
      align-items: stretch;
    }

    .search-form {
      :deep(.el-form-item) {
        margin-right: 0;
        margin-bottom: 12px;
      }

      :deep(.el-form-item__content) {
        width: 100%;
      }
    }
  }

  .header-action-button {
    width: 100%;
  }

  .pagination-container {
    justify-content: center;

    :deep(.el-pagination) {
      flex-wrap: wrap;
      justify-content: center;
      row-gap: 8px;
    }
  }
}

.event-manage--mobile .rankings-list {
  .ranking-item {
    display: grid;
    grid-template-columns: auto auto 1fr;
    gap: 8px 12px;
    align-items: center;
    padding: 14px;

    .rank {
      width: auto;
    }

    .user-info {
      margin-left: 0;
    }

    .score {
      margin-right: 0;
      font-size: 16px;
      grid-column: 2 / 4;
    }

    .time {
      grid-column: 2 / 4;
    }
  }
}

:deep(.el-card__header) {
  border-radius: 16px 16px 0 0;
}

:deep(.el-card__body) {
  padding: 16px;
}

:deep(.el-table) {
  --el-table-header-padding: 8px 0;
  --el-table-cell-padding: 8px 0;

  overflow: hidden;
  border-radius: 12px;
}

:deep(.el-dialog) {
  border-radius: 16px;
}

:deep(.el-button) {
  border-radius: 8px;
}

:deep(.el-input__wrapper) {
  border-radius: 8px;
}

:deep(.header-card .el-card__body) {
  padding: 24px;
}
</style>
