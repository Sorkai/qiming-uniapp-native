<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import type { ChatSession } from "./types";
import { useAiChat } from "./hooks/useAiChat";

defineOptions({
  name: "AiHistoryDialog"
});

const props = defineProps<{
  visible: boolean;
}>();

const emit = defineEmits<{
  (e: "update:visible", value: boolean): void;
  (e: "load", session: ChatSession): void;
}>();

const { historyList, historyTotal, fetchHistory, removeHistory, loadSession } =
  useAiChat();

// 对话框可见性
const dialogVisible = computed({
  get: () => props.visible,
  set: val => emit("update:visible", val)
});

// 分页
const currentPage = ref(1);
const pageSize = ref(10);

// 加载中
const loading = ref(false);

// 加载历史记录
const loadHistory = async () => {
  loading.value = true;
  try {
    await fetchHistory(currentPage.value, pageSize.value);
  } finally {
    loading.value = false;
  }
};

// 分页变化
const handlePageChange = (page: number) => {
  currentPage.value = page;
  loadHistory();
};

// 加载会话
const handleLoadSession = (session: ChatSession) => {
  emit("load", session);
  dialogVisible.value = false;
};

// 删除会话
const handleDelete = async (session: ChatSession) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除会话"${session.title || "未命名会话"}"吗？`,
      "删除确认",
      {
        confirmButtonText: "删除",
        cancelButtonText: "取消",
        type: "warning"
      }
    );
    await removeHistory(session.sessionId);
  } catch {
    // 用户取消
  }
};

// 格式化时间
const formatTime = (timestamp: number) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  // 今天
  if (diff < 24 * 60 * 60 * 1000 && date.getDate() === now.getDate()) {
    return `今天 ${date.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}`;
  }

  // 昨天
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.getDate() === yesterday.getDate()) {
    return `昨天 ${date.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}`;
  }

  // 其他
  return date.toLocaleDateString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
};

// 对话框打开时加载数据
onMounted(() => {
  if (props.visible) {
    loadHistory();
  }
});

// 监听可见性变化
import { watch } from "vue";
watch(
  () => props.visible,
  val => {
    if (val) {
      loadHistory();
    }
  }
);
</script>

<template>
  <el-dialog
    v-model="dialogVisible"
    title="历史记录"
    width="600px"
    :close-on-click-modal="false"
    class="history-dialog"
    append-to-body
    destroy-on-close
  >
    <template #header>
      <div class="dialog-header">
        <svg class="history-icon" viewBox="0 0 24 24" fill="none">
          <path
            d="M13 3a9 9 0 0 0-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42A8.954 8.954 0 0 0 13 21a9 9 0 0 0 0-18zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"
            fill="currentColor"
          />
        </svg>
        <span class="title">历史记录</span>
      </div>
    </template>

    <div v-loading="loading" class="history-container">
      <div v-if="historyList.length === 0 && !loading" class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" class="empty-icon">
          <path
            d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"
            fill="currentColor"
          />
        </svg>
        <p>暂无历史记录</p>
      </div>

      <div v-else class="history-list">
        <div
          v-for="session in historyList"
          :key="session.sessionId"
          class="history-item"
          @click="handleLoadSession(session)"
        >
          <div class="item-content">
            <div class="item-header">
              <span class="item-title">{{
                session.title || "未命名会话"
              }}</span>
              <span class="item-time">{{ formatTime(session.updatedAt) }}</span>
            </div>
            <div class="item-preview">
              {{ session.messages[0]?.content?.slice(0, 50) || "无内容" }}...
            </div>
            <div class="item-meta">
              <span class="message-count"
                >{{ session.messages.length }} 条消息</span
              >
            </div>
          </div>
          <div class="item-actions">
            <el-button
              type="danger"
              text
              size="small"
              @click.stop="handleDelete(session)"
            >
              删除
            </el-button>
          </div>
        </div>
      </div>

      <!-- 分页 -->
      <div v-if="historyTotal > pageSize" class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="historyTotal"
          layout="prev, pager, next"
          @current-change="handlePageChange"
        />
      </div>
    </div>
  </el-dialog>
</template>

<style lang="scss" scoped>
.history-dialog {
  :deep(.el-dialog__header) {
    padding: 0;
    margin: 0;
  }

  :deep(.el-dialog__body) {
    padding: 0;
  }
}

.dialog-header {
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 16px 20px;
  color: #334155;
  background: linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%);

  html.dark & {
    color: #e2e8f0;
    background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  }

  .history-icon {
    width: 24px;
    height: 24px;
  }

  .title {
    font-size: 16px;
    font-weight: 600;
  }
}

.history-container {
  min-height: 300px;
  max-height: 500px;
  overflow-y: auto;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: var(--el-text-color-secondary);

  .empty-icon {
    width: 64px;
    height: 64px;
    margin-bottom: 16px;
    opacity: 0.5;
  }

  p {
    font-size: 14px;
  }
}

.history-list {
  padding: 8px;
}

.history-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  margin-bottom: 8px;
  cursor: pointer;
  background: var(--el-fill-color-lighter);
  border-radius: 12px;
  transition: all 0.2s ease;

  &:hover {
    background: var(--el-fill-color);
    transform: translateX(4px);
  }

  &:last-child {
    margin-bottom: 0;
  }
}

.item-content {
  flex: 1;
  min-width: 0;
}

.item-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.item-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.item-time {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.item-preview {
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 13px;
  color: var(--el-text-color-regular);
  white-space: nowrap;
}

.item-meta {
  .message-count {
    font-size: 12px;
    color: var(--el-text-color-placeholder);
  }
}

.item-actions {
  flex-shrink: 0;
  margin-left: 16px;
}

.pagination {
  display: flex;
  justify-content: center;
  padding: 16px;
  border-top: 1px solid var(--el-border-color-lighter);
}
</style>
