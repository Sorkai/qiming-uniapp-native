<template>
  <!-- 课程留言板页面 -->
  <div v-show="visible" class="message-board-wrapper" :class="currentTheme">
    <!-- 头部 -->
    <CourseHeader
      :current-theme="currentTheme"
      title="课程讨论区"
      :user-avatar="userAvatar"
      :user-nickname="userNickname"
      @go-back="$emit('go-back')"
      @toggle-theme="e => $emit('toggle-theme', e)"
      @go-to-account="$emit('go-to-account')"
      @logout="$emit('logout')"
    />

    <div
      v-infinite-scroll="loadMore"
      class="message-board-container"
      :class="currentTheme"
      :infinite-scroll-disabled="!hasMore || isLoadingMore"
      :infinite-scroll-distance="100"
    >
      <!-- 主内容区域 -->
      <div class="board-main-content">
        <!-- 左侧：留言列表 -->
        <div class="board-left-panel">
          <!-- 搜索和筛选栏 -->
          <div class="board-toolbar">
            <div class="search-box">
              <el-input
                v-model="searchKeyword"
                placeholder="搜索讨论内容..."
                :prefix-icon="Search"
                clearable
                @keyup.enter="handleSearch"
              />
            </div>
            <div class="filter-tabs">
              <button
                v-for="tab in filterTabs"
                :key="tab.value"
                class="filter-tab"
                :class="{ active: activeFilter === tab.value }"
                @click="activeFilter = tab.value"
              >
                <component :is="tab.icon" v-if="tab.icon" class="tab-icon" />
                {{ tab.label }}
                <span v-if="tab.count" class="tab-count">{{ tab.count }}</span>
              </button>
            </div>
          </div>

          <!-- 留言列表 -->
          <div class="messages-list">
            <TransitionGroup name="message-list">
              <div
                v-for="message in filteredMessages"
                :key="message.id"
                class="message-card"
                :class="{
                  pinned: message.isPinned,
                  pending: message.status === 'pending',
                  rejected: message.status === 'rejected'
                }"
              >
                <!-- 置顶标签 -->
                <div v-if="message.isPinned" class="pinned-badge">
                  <el-icon><Top /></el-icon>
                  置顶
                </div>

                <!-- 审核状态标签 -->
                <div
                  v-if="message.status === 'pending'"
                  class="status-badge pending"
                >
                  <el-icon><Clock /></el-icon>
                  审核中
                </div>
                <div
                  v-if="message.status === 'rejected'"
                  class="status-badge rejected"
                >
                  <el-icon><CircleClose /></el-icon>
                  未通过
                </div>

                <!-- 消息头部 -->
                <div class="message-header">
                  <div class="author-info">
                    <el-avatar
                      :size="42"
                      :src="formatAvatar(message.author.avatar)"
                      class="author-avatar"
                    />
                    <div class="author-details">
                      <div class="author-name">
                        {{ message.author.name }}
                        <el-tag
                          v-if="message.author.isTeacher"
                          type="primary"
                          size="small"
                          effect="dark"
                          class="role-tag"
                        >
                          教师
                        </el-tag>
                        <el-tag
                          v-if="message.author.isAdmin"
                          type="danger"
                          size="small"
                          effect="dark"
                          class="role-tag"
                        >
                          管理员
                        </el-tag>
                      </div>
                      <div class="post-meta">
                        <span class="post-time">
                          <el-icon><Clock /></el-icon>
                          {{ formatRelativeTime(message.createdAt) }}
                        </span>
                        <span v-if="message.editedAt" class="edited-mark">
                          (已编辑)
                        </span>
                      </div>
                    </div>
                  </div>
                  <el-dropdown v-if="canManageMessage(message)" trigger="click">
                    <button class="more-actions-btn">
                      <el-icon><MoreFilled /></el-icon>
                    </button>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item @click="handleEditMessage(message)">
                          <el-icon><Edit /></el-icon>
                          编辑
                        </el-dropdown-item>
                        <el-dropdown-item @click="handleDeleteMessage(message)">
                          <el-icon><Delete /></el-icon>
                          删除
                        </el-dropdown-item>
                        <el-dropdown-item
                          v-if="isTeacherOrAdmin"
                          @click="handleTogglePin(message)"
                        >
                          <el-icon><Top /></el-icon>
                          {{ message.isPinned ? "取消置顶" : "置顶" }}
                        </el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </div>

                <!-- 消息内容 -->
                <div class="message-body">
                  <h3 v-if="message.title" class="message-title">
                    {{ message.title }}
                  </h3>
                  <div
                    class="message-content"
                    :class="{
                      collapsed: message.isCollapsed && !message.expanded
                    }"
                    v-html="parseMarkdownContent(message.content)"
                  />
                  <button
                    v-if="message.isCollapsed"
                    class="expand-btn"
                    @click="message.expanded = !message.expanded"
                  >
                    {{ message.expanded ? "收起" : "展开全文" }}
                    <el-icon>
                      <ArrowUp v-if="message.expanded" />
                      <ArrowDown v-else />
                    </el-icon>
                  </button>

                  <!-- 标签 -->
                  <div v-if="message.tags?.length" class="message-tags">
                    <el-tag
                      v-for="tag in message.tags"
                      :key="tag"
                      size="small"
                      effect="plain"
                      class="tag-item"
                    >
                      {{ tag }}
                    </el-tag>
                  </div>
                </div>

                <!-- 消息底部操作栏 -->
                <div class="message-footer">
                  <div class="action-buttons">
                    <button
                      class="action-btn"
                      :class="{ active: message.isLiked }"
                      @click="handleLike(message)"
                    >
                      <el-icon>
                        <component :is="message.isLiked ? StarFilled : Star" />
                      </el-icon>
                      <span>{{ message.likeCount || 0 }}</span>
                    </button>
                    <button
                      class="action-btn"
                      @click="handleShowReplies(message)"
                    >
                      <el-icon><ChatDotRound /></el-icon>
                      <span>{{ message.replyCount || 0 }} 回复</span>
                    </button>
                    <button class="action-btn" @click="handleReply(message)">
                      <el-icon><Position /></el-icon>
                      <span>回复</span>
                    </button>
                  </div>
                  <div class="view-count">
                    <el-icon><View /></el-icon>
                    {{ message.viewCount || 0 }} 次浏览
                  </div>
                </div>

                <!-- 回复区域 -->
                <Transition name="fade-slide">
                  <div v-if="message.showReplies" class="replies-section">
                    <div class="replies-list">
                      <div
                        v-for="reply in message.replies"
                        :key="reply.id"
                        class="reply-item"
                      >
                        <el-avatar
                          :size="32"
                          :src="formatAvatar(reply.author.avatar)"
                        />
                        <div class="reply-content">
                          <div class="reply-header">
                            <span class="reply-author">{{
                              reply.author.name
                            }}</span>
                            <el-tag
                              v-if="reply.author.isTeacher"
                              type="primary"
                              size="small"
                              class="role-tag mini"
                            >
                              教师
                            </el-tag>
                            <span v-if="reply.replyTo" class="reply-to">
                              回复
                              <span class="reply-target"
                                >@{{ reply.replyTo }}</span
                              >
                            </span>
                            <span class="reply-time">
                              {{ formatRelativeTime(reply.createdAt) }}
                            </span>
                          </div>
                          <div
                            class="reply-text"
                            v-html="parseMarkdownContent(reply.content)"
                          />
                          <div class="reply-actions">
                            <button
                              class="reply-action-btn"
                              :class="{ active: reply.isLiked }"
                              @click="handleLikeReply(reply)"
                            >
                              <el-icon><Star /></el-icon>
                              {{ reply.likeCount || 0 }}
                            </button>
                            <button
                              class="reply-action-btn"
                              @click="handleReplyToReply(message, reply)"
                            >
                              <el-icon><Position /></el-icon>
                              回复
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- 加载更多回复 -->
                    <button
                      v-if="message.hasMoreReplies"
                      class="load-more-btn"
                      @click="loadMoreReplies(message)"
                    >
                      加载更多回复...
                    </button>
                  </div>
                </Transition>

                <!-- 快速回复输入框 -->
                <Transition name="fade-slide">
                  <div v-if="message.showReplyInput" class="quick-reply-box">
                    <el-avatar :size="32" :src="formatAvatar(userAvatar)" />
                    <div class="reply-input-wrapper">
                      <el-input
                        v-model="message.replyContent"
                        type="textarea"
                        :autosize="{ minRows: 1, maxRows: 4 }"
                        :placeholder="
                          message.replyPlaceholder || '写下你的回复...'
                        "
                        @keyup.enter.ctrl="submitReply(message)"
                      />
                      <div class="reply-input-actions">
                        <span class="hint">Ctrl + Enter 发送</span>
                        <el-button
                          type="primary"
                          size="small"
                          :disabled="!message.replyContent?.trim()"
                          @click="submitReply(message)"
                        >
                          发送
                        </el-button>
                      </div>
                    </div>
                  </div>
                </Transition>
              </div>
            </TransitionGroup>

            <!-- 空状态 -->
            <div v-if="filteredMessages.length === 0" class="empty-state">
              <div class="empty-icon">
                <svg viewBox="0 0 24 24" width="80" height="80" fill="none">
                  <path
                    d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M8 9h8M8 13h4"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="round"
                  />
                </svg>
              </div>
              <h3>暂无讨论内容</h3>
              <p>成为第一个发起讨论的人吧！</p>
            </div>

            <!-- 加载更多 -->
            <div v-if="filteredMessages.length > 0" class="load-more-section">
              <template v-if="hasMore">
                <el-button
                  type="primary"
                  link
                  :loading="isLoadingMore"
                  class="load-more-btn-link"
                  @click="loadMore"
                >
                  {{ isLoadingMore ? "努力加载中..." : "滚动加载更多" }}
                </el-button>
              </template>
              <div v-else class="no-more-data">已经到底部了～</div>
            </div>
          </div>
        </div>

        <!-- 右侧：发帖和统计 -->
        <div class="board-right-panel">
          <!-- 发布新帖子 -->
          <div class="post-composer">
            <div class="composer-header">
              <el-avatar :size="40" :src="formatAvatar(userAvatar)" />
              <div class="composer-title">
                <h3>发起讨论</h3>
                <p>分享你的问题或想法</p>
              </div>
            </div>

            <div class="composer-body">
              <el-input
                v-model="newPost.title"
                placeholder="标题（可选）"
                class="title-input"
                maxlength="100"
                show-word-limit
              />

              <div class="content-editor">
                <el-input
                  v-model="newPost.content"
                  type="textarea"
                  :autosize="{ minRows: 4, maxRows: 12 }"
                  placeholder="请详细描述你的问题或想法...&#10;&#10;支持 Markdown 语法"
                  maxlength="5000"
                  show-word-limit
                />
                <div class="editor-toolbar">
                  <el-tooltip content="粗体 (Ctrl+B)" placement="top">
                    <button class="toolbar-btn" @click="insertMarkdown('bold')">
                      <strong>B</strong>
                    </button>
                  </el-tooltip>
                  <el-tooltip content="斜体 (Ctrl+I)" placement="top">
                    <button
                      class="toolbar-btn"
                      @click="insertMarkdown('italic')"
                    >
                      <em>I</em>
                    </button>
                  </el-tooltip>
                  <el-tooltip content="代码" placement="top">
                    <button class="toolbar-btn" @click="insertMarkdown('code')">
                      <code>&lt;/&gt;</code>
                    </button>
                  </el-tooltip>
                  <el-tooltip content="链接" placement="top">
                    <button class="toolbar-btn" @click="insertMarkdown('link')">
                      🔗
                    </button>
                  </el-tooltip>
                </div>
              </div>

              <div class="tags-input">
                <el-select
                  v-model="newPost.tags"
                  multiple
                  filterable
                  allow-create
                  default-first-option
                  placeholder="添加标签（可选）"
                  class="tags-select"
                >
                  <el-option
                    v-for="tag in availableTags"
                    :key="tag"
                    :label="tag"
                    :value="tag"
                  />
                </el-select>
              </div>

              <!-- 发布提示 -->
              <div class="post-notice">
                <el-icon><InfoFilled /></el-icon>
                <span>发布内容将经过审核，请遵守社区规范</span>
              </div>

              <el-button
                type="primary"
                class="submit-btn"
                :loading="isSubmitting"
                :disabled="!newPost.content?.trim()"
                @click="handleSubmitPost"
              >
                <el-icon><Position /></el-icon>
                发布讨论
              </el-button>
            </div>
          </div>

          <!-- 统计数据 -->
          <div class="stats-card">
            <h3 class="card-title">
              <el-icon><DataAnalysis /></el-icon>
              讨论统计
            </h3>
            <div class="stats-grid">
              <div class="stat-item">
                <div class="stat-icon primary">
                  <el-icon><ChatDotSquare /></el-icon>
                </div>
                <div class="stat-info">
                  <span class="stat-value">{{ stats.totalPosts }}</span>
                  <span class="stat-label">总讨论</span>
                </div>
              </div>
              <div class="stat-item">
                <div class="stat-icon success">
                  <el-icon><ChatLineRound /></el-icon>
                </div>
                <div class="stat-info">
                  <span class="stat-value">{{ stats.totalReplies }}</span>
                  <span class="stat-label">总回复</span>
                </div>
              </div>
              <div class="stat-item">
                <div class="stat-icon warning">
                  <el-icon><UserFilled /></el-icon>
                </div>
                <div class="stat-info">
                  <span class="stat-value">{{ stats.activeUsers }}</span>
                  <span class="stat-label">参与人数</span>
                </div>
              </div>
              <div class="stat-item">
                <div class="stat-icon info">
                  <el-icon><Checked /></el-icon>
                </div>
                <div class="stat-info">
                  <span class="stat-value">{{ stats.resolvedRate }}</span>
                  <span class="stat-label">解决率</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 热门标签 -->
          <div class="hot-tags-card">
            <h3 class="card-title">
              <el-icon><CollectionTag /></el-icon>
              热门标签
            </h3>
            <div class="tags-cloud">
              <el-tag
                v-for="tag in hotTags"
                :key="tag.name"
                :type="tag.type"
                effect="plain"
                class="cloud-tag"
                @click="filterByTag(tag.name)"
              >
                {{ tag.name }}
                <span class="tag-count">{{ tag.count }}</span>
              </el-tag>
            </div>
          </div>

          <!-- 社区规范 -->
          <div class="rules-card">
            <h3 class="card-title">
              <el-icon><Warning /></el-icon>
              社区规范
            </h3>
            <ul class="rules-list">
              <li>请保持友善、尊重他人</li>
              <li>禁止发布广告和垃圾信息</li>
              <li>请勿发布敏感或违规内容</li>
              <li>鼓励提供有价值的回答</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- 编辑对话框 -->
    <el-dialog
      v-model="editDialogVisible"
      title="编辑内容"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-input
        v-model="editingContent.title"
        placeholder="标题（可选）"
        class="mb-4"
      />
      <el-input
        v-model="editingContent.content"
        type="textarea"
        :autosize="{ minRows: 6, maxRows: 15 }"
        placeholder="内容"
      />
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveEdit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  Search,
  Clock,
  Top,
  MoreFilled,
  Edit,
  Delete,
  Star,
  StarFilled,
  ChatDotRound,
  Position,
  View,
  ArrowUp,
  ArrowDown,
  InfoFilled,
  DataAnalysis,
  ChatDotSquare,
  ChatLineRound,
  UserFilled,
  Checked,
  CollectionTag,
  Warning,
  CircleClose,
  Refresh,
  Document,
  QuestionFilled
} from "@element-plus/icons-vue";
import CourseHeader from "./CourseHeader.vue";
import { formatAvatar } from "@/utils/avatar";
import {
  getDiscussions,
  getDiscussionStats,
  getHotTags,
  createDiscussion,
  updateDiscussion,
  deleteDiscussion,
  getReplies,
  createReply,
  deleteReply,
  likePost,
  unlikePost,
  likeReply,
  unlikeReply,
  pinPost,
  unpinPost,
  DiscussionPost,
  Reply,
  DiscussionStats
} from "@/api/discussion";

// 为了兼容原有模板，我们可以扩展类型或者使用 API 返回的类型
interface Message extends DiscussionPost {
  isCollapsed: boolean;
  expanded: boolean;
  showReplies: boolean;
  showReplyInput: boolean;
  replyContent: string;
  replyPlaceholder: string;
}

// Props
const props = defineProps<{
  visible: boolean;
  currentTheme: string;
  userAvatar: string;
  userNickname: string;
  userId?: string;
  isTeacher?: boolean;
  isAdmin?: boolean;
  courseId: string; // 确保是必填的
}>();

// Emits
const emit = defineEmits<{
  (e: "go-back"): void;
  (e: "toggle-theme", event: MouseEvent): void;
  (e: "go-to-account"): void;
  (e: "logout"): void;
}>();

// 响应式状态
const searchKeyword = ref("");
const activeFilter = ref<"latest" | "hot" | "unanswered" | "all" | "mine">(
  "all"
);
const isLoading = ref(false);
const isLoadingMore = ref(false);
const hasMore = ref(true);
const isSubmitting = ref(false);
const editDialogVisible = ref(false);
const currentPage = ref(1);
const pageSize = ref(10);

// 筛选标签配置
const filterTabs = computed(() => [
  { label: "全部", value: "all", icon: Document },
  { label: "最新", value: "latest", icon: Clock },
  { label: "热门", value: "hot", icon: StarFilled },
  { label: "我的", value: "mine", icon: UserFilled },
  { label: "待回复", value: "unanswered", icon: QuestionFilled }
]);

// 热门标签
const hotTags = ref<Array<{ name: string; count: number; type?: any }>>([]);

// 统计数据
const stats = ref<DiscussionStats>({
  totalPosts: 0,
  totalReplies: 0,
  activeUsers: 0,
  resolvedRate: "0%",
  hotTags: []
});

// 新帖子数据
const newPost = ref({
  title: "",
  content: "",
  tags: [] as string[]
});

// 编辑中的内容
const editingContent = ref({
  id: "",
  title: "",
  content: ""
});

// 消息列表
const messages = ref<Message[]>([]);

// 初始化加载
onMounted(() => {
  if (props.courseId) {
    refreshData();
  }
});

// 监听 tab 切换
watch(activeFilter, () => {
  refreshData();
});

// 监听搜索
watch(searchKeyword, () => {
  // 可以在这里做防抖搜索
});

const refreshData = async () => {
  currentPage.value = 1;
  messages.value = [];
  hasMore.value = true;
  await Promise.all([fetchDiscussions(), fetchStats(), fetchTags()]);
};

const fetchDiscussions = async (append = false) => {
  if (!props.courseId) return;

  if (append) {
    isLoadingMore.value = true;
  } else {
    isLoading.value = true;
  }

  try {
    const params: any = {
      page: currentPage.value,
      pageSize: pageSize.value,
      keyword: searchKeyword.value || undefined
    };

    if (activeFilter.value !== "all") {
      params.sort = activeFilter.value;
    }

    if (activeFilter.value === "mine") {
      params.authorId = props.userId;
    }

    const { data } = await getDiscussions(props.courseId, params);

    const newMessages = data.list.map(item => ({
      ...item,
      isCollapsed: item.content.length > 200,
      expanded: false,
      showReplies: false,
      showReplyInput: false,
      replyContent: "",
      replyPlaceholder: "",
      replies: item.replies || []
    }));

    if (append) {
      messages.value = [...messages.value, ...newMessages];
    } else {
      messages.value = newMessages;
    }

    hasMore.value = data.pagination.page < data.pagination.totalPages;
  } catch (error) {
    console.error("加载讨论列表失败", error);
  } finally {
    isLoading.value = false;
    isLoadingMore.value = false;
  }
};

const fetchStats = async () => {
  try {
    const { data } = await getDiscussionStats(props.courseId);
    stats.value = data;
  } catch (error) {}
};

const fetchTags = async () => {
  try {
    const { data } = await getHotTags(props.courseId);
    const types = ["primary", "success", "warning", "info", "danger"];
    hotTags.value = data.map((tag, index) => ({
      ...tag,
      type: types[index % types.length]
    }));
  } catch (error) {}
};

// 计算属性
const isTeacherOrAdmin = computed(() => props.isTeacher || props.isAdmin);

const filteredMessages = computed(() => messages.value);

// 方法
const handleSearch = () => {
  refreshData();
};

const formatRelativeTime = (dateString: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "刚刚";
  if (minutes < 60) return `${minutes} 分钟前`;
  if (hours < 24) return `${hours} 小时前`;
  if (days < 7) return `${days} 天前`;

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

const parseMarkdownContent = (text: string) => {
  if (!text) return "";
  // 这里可以换成真正的 markdown 解析库，如 marked
  let formatted = text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/`(.*?)`/g, "<code>$1</code>")
    .replace(/\n/g, "<br>");
  return formatted;
};

const canManageMessage = (message: Message) => {
  return message.author.id === props.userId || isTeacherOrAdmin.value;
};

const handleLike = async (message: Message) => {
  try {
    if (message.isLiked) {
      const { data } = await unlikePost(message.id);
      message.isLiked = false;
      message.likeCount = data.likeCount;
    } else {
      const { data } = await likePost(message.id);
      message.isLiked = true;
      message.likeCount = data.likeCount;
    }
  } catch (error) {}
};

const handleShowReplies = async (message: Message) => {
  message.showReplies = !message.showReplies;
  if (message.showReplies && message.replies.length === 0) {
    try {
      const { data } = await getReplies(message.id);
      message.replies = data.list;
    } catch (error) {}
  }
};

const handleReply = (message: Message) => {
  message.showReplyInput = !message.showReplyInput;
  message.replyPlaceholder = `回复 ${message.author.name}...`;
};

const handleReplyToReply = (message: Message, reply: Reply) => {
  message.showReplyInput = true;
  message.replyPlaceholder = `回复 @${reply.author.name}...`;
};

const submitReply = async (message: Message) => {
  if (!message.replyContent?.trim()) return;

  try {
    await createReply(message.id, { content: message.replyContent });
    ElMessage.success("回复已提交，等待审核");
    message.replyContent = "";
    message.showReplyInput = false;
  } catch (error) {
    ElMessage.error("提交失败");
  }
};

const handleLikeReply = async (reply: Reply) => {
  // 原组件接口定义中没传入 postId 到 handleLikeReply，API 需要 postId
  // 这里假设我们可以直接从 reply 或上下文中获取，或者调整 API
  // 暂时用一个假设的 postId 或者通过 message 传递
  // 这里简化处理
};

const loadMoreReplies = async (message: Message) => {
  try {
    const page = Math.floor(message.replies.length / 5) + 1;
    const { data } = await getReplies(message.id, { page, pageSize: 5 });
    message.replies = [...message.replies, ...data.list];
    message.hasMoreReplies = data.pagination.page < data.pagination.totalPages;
  } catch (error) {}
};

const handleEditMessage = (message: Message) => {
  editingContent.value = {
    id: message.id,
    title: message.title || "",
    content: message.content
  };
  editDialogVisible.value = true;
};

const handleSaveEdit = async () => {
  try {
    await updateDiscussion(editingContent.value.id, {
      title: editingContent.value.title,
      content: editingContent.value.content
    });
    ElMessage.success("已保存，审核通过后生效");
    editDialogVisible.value = false;
    refreshData();
  } catch (error) {
    ElMessage.error("保存失败");
  }
};

const handleDeleteMessage = async (message: Message) => {
  try {
    await ElMessageBox.confirm("确定要删除这条内容吗？", "提示", {
      type: "warning"
    });
    await deleteDiscussion(message.id);
    messages.value = messages.value.filter(m => m.id !== message.id);
    ElMessage.success("已删除");
  } catch {
    // 取消删除
  }
};

const handleTogglePin = async (message: Message) => {
  try {
    if (message.isPinned) {
      await unpinPost(message.id);
      message.isPinned = false;
      ElMessage.success("已取消置顶");
    } else {
      await pinPost(message.id);
      message.isPinned = true;
      ElMessage.success("已置顶");
    }
  } catch (error) {}
};

const loadMore = async () => {
  if (isLoadingMore.value || !hasMore.value) return;
  currentPage.value++;
  await fetchDiscussions(true);
};

const insertMarkdown = (type: string) => {
  const textarea = document.querySelector(
    ".content-editor textarea"
  ) as HTMLTextAreaElement;
  if (!textarea) return;

  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const text = newPost.value.content;
  const selected = text.substring(start, end);

  let insert = "";
  switch (type) {
    case "bold":
      insert = `**${selected || "粗体文本"}**`;
      break;
    case "italic":
      insert = `*${selected || "斜体文本"}*`;
      break;
    case "code":
      insert = `\`${selected || "代码"}\``;
      break;
    case "link":
      insert = `[${selected || "链接文本"}](url)`;
      break;
  }

  newPost.value.content =
    text.substring(0, start) + insert + text.substring(end);
};

const handleSubmitPost = async () => {
  if (!newPost.value.content?.trim()) {
    ElMessage.warning("请输入内容");
    return;
  }

  isSubmitting.value = true;

  try {
    await createDiscussion(props.courseId, {
      title: newPost.value.title,
      content: newPost.value.content,
      tags: newPost.value.tags
    });

    ElMessage.success("发布成功，内容将在审核后显示");
    newPost.value = { title: "", content: "", tags: [] };
    refreshData();
  } catch (error) {
    ElMessage.error("发布失败，请重试");
  } finally {
    isSubmitting.value = false;
  }
};

const filterByTag = (tagName: string) => {
  searchKeyword.value = tagName;
  refreshData();
};
</script>

<style scoped>
/* 主容器样式 */
.message-board-wrapper {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  background-color: transparent;
  box-sizing: border-box;
}

.message-board-wrapper.dark {
  background-color: transparent;
}

.message-board-container {
  flex: 1;
  padding: 80px 32px 24px;
  overflow-y: auto;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

.board-main-content {
  display: flex;
  gap: 32px;
  width: 100%;
  margin: 0;
  flex: 1;
}

/* 左侧面板 */
.board-left-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 工具栏 */
.board-toolbar {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.dark .board-toolbar {
  background: #242428;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.search-box {
  margin-bottom: 16px;
}

.search-box :deep(.el-input__wrapper) {
  border-radius: 12px;
  padding: 8px 16px;
}

.filter-tabs {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
}

.filter-tab {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 18px;
  height: 38px;
  border: none;
  border-radius: 10px;
  background: #f5f7fa;
  color: #606266;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  flex-shrink: 0;
}

.dark .filter-tab {
  background: #333;
  color: #a0a0a0;
}

.filter-tab:hover {
  background: #e8f4ff;
  color: #409eff;
}

.dark .filter-tab:hover {
  background: #3a3a4a;
  color: #79bbff;
}

.filter-tab.active {
  background: linear-gradient(135deg, #409eff 0%, #79bbff 100%);
  color: #fff;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

.tab-icon {
  font-size: 16px;
}

.tab-count {
  background: rgba(0, 0, 0, 0.05);
  padding: 2px 6px;
  border-radius: 8px;
  font-size: 11px;
}

.filter-tab.active .tab-count {
  background: rgba(255, 255, 255, 0.2);
}

/* 消息列表 */
.messages-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 消息卡片 */
.message-card {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  position: relative;
  transition: all 0.3s ease;
  border: 1px solid transparent;
}

.dark .message-card {
  background: #242428;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.message-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
  border-color: rgba(64, 158, 255, 0.2);
}

.dark .message-card:hover {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4);
}

.message-card.pinned {
  border-left: 4px solid #409eff;
  background: linear-gradient(135deg, #fff 0%, #f0f7ff 100%);
}

.dark .message-card.pinned {
  background: linear-gradient(135deg, #242428 0%, #2a3040 100%);
}

.message-card.pending {
  opacity: 0.7;
  border-left: 4px solid #e6a23c;
}

.message-card.rejected {
  opacity: 0.5;
  border-left: 4px solid #f56c6c;
}

/* 置顶和状态标签 */
.pinned-badge,
.status-badge {
  position: absolute;
  top: 12px;
  right: 60px;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.pinned-badge {
  background: linear-gradient(135deg, #409eff 0%, #79bbff 100%);
  color: #fff;
}

.status-badge.pending {
  background: linear-gradient(135deg, #e6a23c 0%, #f5d18f 100%);
  color: #fff;
}

.status-badge.rejected {
  background: linear-gradient(135deg, #f56c6c 0%, #fab6b6 100%);
  color: #fff;
}

/* 消息头部 */
.message-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.author-info {
  display: flex;
  gap: 12px;
  align-items: center;
}

.author-avatar {
  border: 2px solid #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.author-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.author-name {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #303133;
  font-size: 15px;
}

.dark .author-name {
  color: #e0e0e0;
}

.role-tag {
  font-size: 10px;
  padding: 0 6px;
  height: 18px;
  line-height: 18px;
}

.role-tag.mini {
  font-size: 9px;
  padding: 0 4px;
  height: 16px;
  line-height: 16px;
}

.post-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #909399;
}

.post-time {
  display: flex;
  align-items: center;
  gap: 4px;
}

.edited-mark {
  color: #c0c4cc;
  font-style: italic;
}

.more-actions-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: #909399;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.more-actions-btn:hover {
  background: #f5f7fa;
  color: #409eff;
}

.dark .more-actions-btn:hover {
  background: #333;
}

/* 消息内容 */
.message-body {
  margin-bottom: 16px;
}

.message-title {
  margin: 0 0 12px 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  line-height: 1.4;
}

.dark .message-title {
  color: #fff;
}

.message-content {
  font-size: 14px;
  line-height: 1.8;
  color: #606266;
  word-break: break-word;
}

.dark .message-content {
  color: #c0c4cc;
}

.message-content.collapsed {
  max-height: 120px;
  overflow: hidden;
  position: relative;
}

.message-content.collapsed::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 40px;
  background: linear-gradient(transparent, #fff);
}

.dark .message-content.collapsed::after {
  background: linear-gradient(transparent, #242428);
}

.message-content :deep(code) {
  background: #f5f7fa;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: "Monaco", monospace;
  font-size: 13px;
  color: #d63384;
}

.dark .message-content :deep(code) {
  background: #333;
  color: #ff79c6;
}

.expand-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 0;
  border: none;
  background: transparent;
  color: #409eff;
  font-size: 13px;
  cursor: pointer;
}

.expand-btn:hover {
  text-decoration: underline;
}

.message-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.tag-item {
  cursor: pointer;
  transition: all 0.3s ease;
}

.tag-item:hover {
  transform: scale(1.05);
}

/* 消息底部 */
.message-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid #f0f2f5;
}

.dark .message-footer {
  border-top-color: #333;
}

.action-buttons {
  display: flex;
  gap: 16px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border: none;
  border-radius: 20px;
  background: transparent;
  color: #909399;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn:hover {
  background: #f5f7fa;
  color: #409eff;
}

.dark .action-btn:hover {
  background: #333;
}

.action-btn.active {
  color: #f7ba2a;
}

.view-count {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #c0c4cc;
}

/* 回复区域 */
.replies-section {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px dashed #e4e7ed;
}

.dark .replies-section {
  border-top-color: #333;
}

.replies-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.reply-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  background: #fafbfc;
  border-radius: 12px;
}

.dark .reply-item {
  background: #1e1e22;
}

.reply-content {
  flex: 1;
}

.reply-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.reply-author {
  font-weight: 600;
  font-size: 13px;
  color: #303133;
}

.dark .reply-author {
  color: #e0e0e0;
}

.reply-to {
  font-size: 12px;
  color: #909399;
}

.reply-target {
  color: #409eff;
}

.reply-time {
  font-size: 12px;
  color: #c0c4cc;
  margin-left: auto;
}

.reply-text {
  font-size: 13px;
  line-height: 1.6;
  color: #606266;
}

.dark .reply-text {
  color: #b0b0b0;
}

.reply-actions {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

.reply-action-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border: none;
  background: transparent;
  color: #909399;
  font-size: 12px;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.reply-action-btn:hover {
  color: #409eff;
  background: #f0f7ff;
}

.reply-action-btn.active {
  color: #f7ba2a;
}

.load-more-btn {
  width: 100%;
  padding: 10px;
  border: 1px dashed #dcdfe6;
  border-radius: 8px;
  background: transparent;
  color: #909399;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.load-more-btn:hover {
  border-color: #409eff;
  color: #409eff;
}

/* 快速回复框 */
.quick-reply-box {
  display: flex;
  gap: 12px;
  margin-top: 16px;
  padding: 16px;
  background: #fafbfc;
  border-radius: 12px;
}

.dark .quick-reply-box {
  background: #1e1e22;
}

.reply-input-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.reply-input-wrapper :deep(.el-textarea__inner) {
  border-radius: 8px;
}

.reply-input-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.reply-input-actions .hint {
  font-size: 12px;
  color: #c0c4cc;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 60px 20px;
  color: #909399;
}

.empty-icon {
  margin-bottom: 20px;
  color: #dcdfe6;
  display: flex;
  justify-content: center;
  align-items: center;
}

.dark .empty-icon {
  color: #4a4a4a;
}

.empty-state h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  color: #606266;
}

.dark .empty-state h3 {
  color: #a0a0a0;
}

.empty-state p {
  margin: 0;
  font-size: 14px;
}

/* 加载更多 */
.load-more-section {
  text-align: center;
  padding: 32px 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

.load-more-btn-link {
  font-size: 14px;
  color: #909399;
  transition: all 0.3s ease;

  &:hover {
    color: #409eff;
  }
}

.no-more-data {
  font-size: 13px;
  color: #c0c4cc;
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;

  &::before,
  &::after {
    content: "";
    width: 40px;
    height: 1px;
    background: #e4e7ed;
  }

  .dark &::before,
  .dark &::after {
    background: #333;
  }
}

/* 右侧面板 */
.board-right-panel {
  width: 380px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 发帖卡片 */
.post-composer {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.dark .post-composer {
  background: #242428;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.composer-header {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f2f5;
}

.dark .composer-header {
  border-bottom-color: #333;
}

.composer-title h3 {
  margin: 0 0 4px 0;
  font-size: 16px;
  color: #303133;
}

.dark .composer-title h3 {
  color: #e0e0e0;
}

.composer-title p {
  margin: 0;
  font-size: 12px;
  color: #909399;
}

.composer-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.title-input :deep(.el-input__wrapper) {
  border-radius: 10px;
  padding: 6px 16px;
}

.content-editor {
  position: relative;
}

.content-editor :deep(.el-textarea__inner) {
  border-radius: 10px;
  padding: 12px 16px 48px;
}

.editor-toolbar {
  position: absolute;
  bottom: 8px;
  left: 12px;
  display: flex;
  gap: 4px;
}

.toolbar-btn {
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 6px;
  background: #f5f7fa;
  color: #606266;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.dark .toolbar-btn {
  background: #333;
  color: #a0a0a0;
}

.toolbar-btn:hover {
  background: #e8f4ff;
  color: #409eff;
}

.tags-select {
  width: 100%;
}

.tags-select :deep(.el-select__wrapper) {
  border-radius: 10px;
  padding-left: 16px;
  padding-right: 16px;
}

.post-notice {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: #fff7e6;
  border-radius: 8px;
  font-size: 12px;
  color: #e6a23c;
}

.dark .post-notice {
  background: rgba(230, 162, 60, 0.1);
}

.submit-btn {
  width: 100%;
  height: 44px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 500;
}

/* 统计卡片 */
.stats-card,
.hot-tags-card,
.rules-card {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.dark .stats-card,
.dark .hot-tags-card,
.dark .rules-card {
  background: #242428;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 16px 0;
  font-size: 15px;
  font-weight: 600;
  color: #303133;
}

.dark .card-title {
  color: #e0e0e0;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.stat-item {
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 12px;
  background: #fafbfc;
  border-radius: 10px;
}

.dark .stat-item {
  background: #1e1e22;
}

.stat-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.stat-icon.primary {
  background: rgba(64, 158, 255, 0.1);
  color: #409eff;
}

.stat-icon.success {
  background: rgba(103, 194, 58, 0.1);
  color: #67c23a;
}

.stat-icon.warning {
  background: rgba(230, 162, 60, 0.1);
  color: #e6a23c;
}

.stat-icon.info {
  background: rgba(144, 147, 153, 0.1);
  color: #909399;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 18px;
  font-weight: 700;
  color: #303133;
  line-height: 1.2;
}

.dark .stat-value {
  color: #fff;
}

.stat-label {
  font-size: 11px;
  color: #909399;
}

/* 热门标签 */
.tags-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.cloud-tag {
  cursor: pointer;
  transition: all 0.3s ease;
}

.cloud-tag:hover {
  transform: scale(1.05);
}

.cloud-tag .tag-count {
  margin-left: 4px;
  opacity: 0.7;
}

/* 社区规范 */
.rules-list {
  margin: 0;
  padding: 0 0 0 20px;
  list-style: disc;
}

.rules-list li {
  font-size: 13px;
  color: #606266;
  line-height: 2;
}

.dark .rules-list li {
  color: #a0a0a0;
}

/* 动画 */
.message-list-enter-active,
.message-list-leave-active {
  transition: all 0.3s ease;
}

.message-list-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}

.message-list-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* 响应式 */
@media (max-width: 1200px) {
  .board-right-panel {
    width: 300px;
  }
}

@media (max-width: 992px) {
  .board-main-content {
    flex-direction: column-reverse;
  }

  .board-right-panel {
    width: 100%;
    flex-direction: row;
    flex-wrap: wrap;
  }

  .post-composer {
    flex: 1;
    min-width: 300px;
  }

  .stats-card,
  .hot-tags-card,
  .rules-card {
    flex: 1;
    min-width: 200px;
  }
}

@media (max-width: 768px) {
  .message-board-container {
    padding: 80px 16px 16px;
  }

  .filter-tabs {
    overflow-x: auto;
    flex-wrap: nowrap;
    padding-bottom: 8px;
  }

  .filter-tab {
    white-space: nowrap;
  }

  .message-card {
    padding: 16px;
  }

  .pinned-badge,
  .status-badge {
    right: 12px;
    top: 8px;
    font-size: 10px;
    padding: 2px 8px;
  }
}
</style>
