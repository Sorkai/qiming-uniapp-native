<template>
  <div class="ai-sidebar italic-safe">
    <div class="ai-sidebar__head">
      <div class="ai-sidebar__title-wrap">
        <p class="ai-sidebar__eyebrow">Learning history</p>
        <h2 class="ai-sidebar__title">课程与历史</h2>
      </div>
      <span class="ai-sidebar__summary">{{ conversations.length }} 条</span>
    </div>

    <div class="ai-sidebar__scroll custom-scrollbar">
      <div v-show="activeRail === 'chat'">
        <section v-for="course in courses" :key="course" class="ai-course-group">
          <div
            class="ai-course-header"
            role="button"
            tabindex="0"
            @click="toggleCourse(course)"
            @keydown.enter.prevent="toggleCourse(course)"
            @keydown.space.prevent="toggleCourse(course)"
          >
            <span
              class="ai-course-chevron"
              :class="{ 'is-collapsed': collapsedCourses.includes(course) }"
            >
              <el-icon><ArrowDown /></el-icon>
            </span>
            <span class="ai-course-mark" aria-hidden="true">课</span>
            <span class="ai-course-name">{{ course }}</span>
            <span class="ai-course-count">
              {{ groupedConversations[course]?.length || 0 }}
            </span>
            <el-tooltip content="新建该课程的辅导会话" placement="right">
              <button
                type="button"
                class="ai-course-new-chat"
                aria-label="新建该课程的辅导会话"
                @click.stop="$emit('new-chat', { course })"
              >
                <el-icon><Plus /></el-icon>
              </button>
            </el-tooltip>
          </div>

          <el-collapse-transition>
            <div
              v-show="!collapsedCourses.includes(course)"
              class="ai-course-sessions"
            >
              <transition-group appear name="list" tag="div">
                <button
                  v-for="(conv, index) in groupedConversations[course] || []"
                  :key="conv.id"
                  type="button"
                  :style="{ transitionDelay: `${index * 42}ms` }"
                  class="ai-conversation-card"
                  @click="emit('select-chat', conv)"
                >
                  <span class="ai-conversation-title">{{ conv.title }}</span>
                  <span v-if="conv.time" class="ai-conversation-time">
                    {{ conv.time }}
                  </span>
                </button>
              </transition-group>
              <div
                v-if="!(groupedConversations[course] || []).length"
                class="ai-empty-conversation"
              >
                暂无历史会话
              </div>
            </div>
          </el-collapse-transition>
        </section>
      </div>

      <section class="ai-history-section">
        <div class="ai-section-label">
          <span class="ai-section-icon"><el-icon><Timer /></el-icon></span>
          <span>最近会话</span>
        </div>
        <div class="ai-history-list">
          <button
            v-for="conv in recentHistory"
            :key="'recent-' + conv.id"
            type="button"
            class="ai-history-card"
            @click="emit('select-chat', conv)"
          >
            <span class="ai-history-title">{{ conv.title }}</span>
            <span v-if="conv.course" class="ai-history-course">
              {{ conv.course }}
            </span>
          </button>
          <div v-if="!recentHistory.length" class="ai-empty-conversation">
            还没有最近会话
          </div>
        </div>
      </section>
    </div>

    <button type="button" class="ai-sidebar__setting-card">
      <img
        :src="avatarSrc"
        alt="user avatar"
        class="ai-sidebar__avatar"
        @error="handleAvatarError"
      />
      <span class="ai-sidebar__setting-text">
        <span class="ai-sidebar__setting-title">系统设置</span>
        <span class="ai-sidebar__setting-subtitle">当前版本</span>
      </span>
      <el-icon class="ai-sidebar__setting-arrow"><ArrowRight /></el-icon>
    </button>
  </div>
</template>

<script setup lang="ts">
import { Plus, ArrowRight, Timer, ArrowDown } from "@element-plus/icons-vue";
import { computed, onMounted, ref, watch } from "vue";
import DefaultAvatar from "@/assets/user.jpg";
import { getUserDetail } from "@/api/user";
import { useUserStoreHook } from "@/store/modules/user";
import { formatAvatar } from "@/utils/avatar";

const props = defineProps<{
  activeRail: string;
  conversations: any[];
  courses: string[];
}>();

const groupedConversations = computed(() => {
  const groups: Record<string, any[]> = {};
  props.courses.forEach(course => {
    groups[course] = props.conversations.filter(c => c.course === course);
  });
  return groups;
});

const recentHistory = computed(() => props.conversations.slice(0, 5));

const collapsedCourses = ref<string[]>([]);
const userStore = useUserStoreHook();
const avatarSrc = ref(formatAvatar(userStore.avatar));

watch(
  () => userStore.avatar,
  avatar => {
    avatarSrc.value = formatAvatar(avatar);
  },
  { immediate: true }
);

const handleAvatarError = () => {
  avatarSrc.value = DefaultAvatar;
};

const toggleCourse = (course: string) => {
  const index = collapsedCourses.value.indexOf(course);
  if (index > -1) collapsedCourses.value.splice(index, 1);
  else collapsedCourses.value.push(course);
};

onMounted(() => {
  getUserDetail()
    .then(res => {
      const userInfo = res?.data?.userInfo;
      if (!userInfo) return;

      if (userInfo.avatar !== undefined) {
        userStore.SET_AVATAR(userInfo.avatar || "");
      }
      if (userInfo.nickname) {
        userStore.SET_NICKNAME(userInfo.nickname);
      }
    })
    .catch(error => {
      console.error("[AiSidebar] 获取用户信息失败:", error);
    });
});

const emit = defineEmits(["update:activeRail", "new-chat", "select-chat"]);
</script>

<style scoped>
.italic-safe {
  font-style: normal;
}

.ai-sidebar {
  position: relative;
  display: flex;
  height: 100%;
  min-height: 0;
  flex-direction: column;
  padding: 16px;
  overflow: hidden;
  color: #1f2937;
  background:
    linear-gradient(180deg, rgb(255 255 255 / 92%), rgb(248 250 255 / 94%)),
    #f8fafc;
  border-right: 1px solid rgb(226 232 240 / 86%);
}

.ai-sidebar__head {
  display: flex;
  flex: 0 0 auto;
  gap: 12px;
  align-items: flex-start;
  justify-content: space-between;
  padding: 2px 2px 14px;
  border-bottom: 1px solid rgb(226 232 240 / 72%);
}

.ai-sidebar__eyebrow {
  margin: 0 0 3px;
  color: #94a3b8;
  font-size: 11px;
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.ai-sidebar__title {
  margin: 0;
  color: #172033;
  font-size: 18px;
  font-weight: 800;
  line-height: 1.2;
}

.ai-sidebar__summary {
  display: inline-flex;
  min-width: 44px;
  height: 26px;
  align-items: center;
  justify-content: center;
  padding: 0 10px;
  color: #4f46e5;
  font-size: 12px;
  font-weight: 800;
  white-space: nowrap;
  background: rgb(94 127 248 / 10%);
  border: 1px solid rgb(94 127 248 / 16%);
  border-radius: 999px;
}

.ai-sidebar__scroll {
  flex: 0 1 auto;
  min-height: 0;
  max-height: calc(100% - 96px);
  padding: 14px 1px 8px;
  overflow: hidden auto;
}

.ai-course-group {
  padding: 5px;
  margin-bottom: 12px;
  background: rgb(255 255 255 / 72%);
  border: 1px solid rgb(226 232 240 / 72%);
  border-radius: 16px;
}

.ai-course-header {
  display: flex;
  min-height: 42px;
  align-items: center;
  gap: 8px;
  padding: 7px 8px;
  cursor: pointer;
  border-radius: 13px;
  outline: none;
  transition:
    background 0.2s ease,
    transform 0.2s ease;
}

.ai-course-header:hover,
.ai-course-header:focus-visible {
  background: rgb(94 127 248 / 8%);
}

.ai-course-chevron {
  display: inline-flex;
  flex: 0 0 18px;
  align-items: center;
  justify-content: center;
  color: #7c8aa5;
  transition: transform 0.2s ease;
}

.ai-course-chevron.is-collapsed {
  transform: rotate(-90deg);
}

.ai-course-mark {
  display: inline-flex;
  flex: 0 0 26px;
  width: 26px;
  height: 26px;
  align-items: center;
  justify-content: center;
  color: #2563eb;
  font-size: 12px;
  font-weight: 800;
  background: linear-gradient(135deg, #e8f1ff, #eef2ff);
  border: 1px solid rgb(59 130 246 / 18%);
  border-radius: 9px;
}

.ai-course-name {
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
  color: #334155;
  font-size: 14px;
  font-weight: 750;
  line-height: 1.25;
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ai-course-count {
  display: inline-flex;
  flex: 0 0 auto;
  min-width: 24px;
  height: 22px;
  align-items: center;
  justify-content: center;
  padding: 0 7px;
  color: #64748b;
  font-size: 11px;
  font-weight: 800;
  background: rgb(241 245 249 / 90%);
  border-radius: 999px;
}

.ai-course-new-chat {
  display: inline-flex;
  flex: 0 0 28px;
  width: 28px;
  height: 28px;
  align-items: center;
  justify-content: center;
  padding: 0;
  color: #3b82f6;
  cursor: pointer;
  background: rgb(239 246 255 / 92%);
  border: 1px solid rgb(147 197 253 / 50%);
  border-radius: 10px;
  opacity: 0;
  transition:
    opacity 0.2s ease,
    transform 0.2s ease,
    background 0.2s ease;
}

.ai-course-header:hover .ai-course-new-chat,
.ai-course-new-chat:focus-visible {
  opacity: 1;
}

.ai-course-new-chat:active {
  transform: scale(0.94);
}

.ai-course-sessions {
  padding: 2px 6px 9px 40px;
}

.ai-course-sessions > div,
.ai-history-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ai-conversation-card,
.ai-history-card {
  display: flex;
  width: 100%;
  min-width: 0;
  align-items: center;
  gap: 8px;
  padding: 10px 11px;
  color: inherit;
  text-align: left;
  cursor: pointer;
  background: rgb(248 250 252 / 86%);
  border: 1px solid rgb(226 232 240 / 82%);
  border-radius: 13px;
  outline: none;
  transition:
    border-color 0.2s ease,
    background 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.ai-conversation-card:hover,
.ai-history-card:hover,
.ai-conversation-card:focus-visible,
.ai-history-card:focus-visible {
  background: #fff;
  border-color: rgb(94 127 248 / 26%);
  box-shadow: 0 10px 22px rgb(36 50 82 / 8%);
  transform: translateY(-1px);
}

.ai-conversation-title,
.ai-history-title {
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
  color: #475569;
  font-size: 14px;
  font-weight: 650;
  line-height: 1.3;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ai-conversation-time {
  flex: 0 0 auto;
  color: #94a3b8;
  font-size: 11px;
}

.ai-empty-conversation {
  padding: 9px 10px;
  color: #94a3b8;
  font-size: 12px;
  line-height: 1.35;
  text-align: center;
  background: rgb(248 250 252 / 72%);
  border: 1px dashed rgb(203 213 225 / 90%);
  border-radius: 12px;
}

.ai-history-section {
  padding-top: 6px;
}

.ai-section-label {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 0 4px 9px;
  color: #64748b;
  font-size: 13px;
  font-weight: 800;
}

.ai-section-icon {
  display: inline-flex;
  width: 24px;
  height: 24px;
  align-items: center;
  justify-content: center;
  color: #4f46e5;
  background: rgb(94 127 248 / 10%);
  border-radius: 9px;
}

.ai-history-course {
  flex: 0 0 auto;
  max-width: 76px;
  padding: 3px 7px;
  overflow: hidden;
  color: #64748b;
  font-size: 11px;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
  background: rgb(241 245 249 / 95%);
  border-radius: 999px;
}

.ai-sidebar__setting-card {
  display: flex;
  flex: 0 0 auto;
  width: 100%;
  align-items: center;
  gap: 10px;
  padding: 10px;
  margin-top: 8px;
  color: inherit;
  text-align: left;
  cursor: pointer;
  background: rgb(255 255 255 / 84%);
  border: 1px solid rgb(226 232 240 / 84%);
  border-radius: 16px;
  box-shadow: 0 12px 28px rgb(36 50 82 / 8%);
  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.ai-sidebar__setting-card:hover,
.ai-sidebar__setting-card:focus-visible {
  border-color: rgb(94 127 248 / 24%);
  box-shadow: 0 14px 30px rgb(36 50 82 / 12%);
  outline: none;
  transform: translateY(-1px);
}

.ai-sidebar__avatar {
  flex: 0 0 auto;
  width: 34px;
  height: 34px;
  object-fit: cover;
  background: #fff;
  border: 2px solid #fff;
  border-radius: 999px;
  box-shadow: 0 6px 14px rgb(15 23 42 / 12%);
}

.ai-sidebar__setting-text {
  display: flex;
  flex: 1 1 auto;
  min-width: 0;
  flex-direction: column;
}

.ai-sidebar__setting-title,
.ai-sidebar__setting-subtitle {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ai-sidebar__setting-title {
  color: #334155;
  font-size: 14px;
  font-weight: 800;
  line-height: 1.25;
}

.ai-sidebar__setting-subtitle {
  margin-top: 2px;
  color: #94a3b8;
  font-size: 12px;
  line-height: 1.2;
}

.ai-sidebar__setting-arrow {
  flex: 0 0 auto;
  color: #94a3b8;
}

.list-enter-active,
.list-leave-active {
  transition: all 0.32s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(-8px);
}

.custom-scrollbar::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: transparent;
}

.custom-scrollbar {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

:global(.ai-app-root.dark) .ai-sidebar {
  color: #e5eefc;
  background:
    linear-gradient(180deg, rgb(15 23 42 / 96%), rgb(10 16 29 / 98%)),
    #0f172a;
  border-right-color: rgb(148 163 184 / 16%);
}

:global(.ai-app-root.dark) .ai-sidebar__head {
  border-bottom-color: rgb(148 163 184 / 16%);
}

:global(.ai-app-root.dark) .ai-sidebar__title {
  color: #f8fafc;
}

:global(.ai-app-root.dark) .ai-course-group,
:global(.ai-app-root.dark) .ai-sidebar__setting-card {
  background: rgb(15 23 42 / 82%);
  border-color: rgb(148 163 184 / 16%);
}

:global(.ai-app-root.dark) .ai-course-header:hover,
:global(.ai-app-root.dark) .ai-course-header:focus-visible,
:global(.ai-app-root.dark) .ai-conversation-card:hover,
:global(.ai-app-root.dark) .ai-history-card:hover {
  background: rgb(30 41 59 / 88%);
}

:global(.ai-app-root.dark) .ai-course-name,
:global(.ai-app-root.dark) .ai-conversation-title,
:global(.ai-app-root.dark) .ai-history-title,
:global(.ai-app-root.dark) .ai-sidebar__setting-title {
  color: #dbeafe;
}

:global(.ai-app-root.dark) .ai-conversation-card,
:global(.ai-app-root.dark) .ai-history-card,
:global(.ai-app-root.dark) .ai-empty-conversation {
  background: rgb(2 6 23 / 36%);
  border-color: rgb(148 163 184 / 14%);
}

@media (hover: none) {
  .ai-course-new-chat {
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .ai-sidebar {
    padding: 14px;
    background:
      linear-gradient(180deg, rgb(255 255 255 / 96%), rgb(248 250 255 / 98%)),
      #fff;
    border-right: 0;
    border-radius: 22px;
  }

  .ai-sidebar__head {
    min-height: 42px;
    padding: 2px 42px 12px 2px;
  }

  .ai-sidebar__title {
    font-size: 19px;
  }

  .ai-sidebar__summary {
    height: 24px;
    padding: 0 8px;
    font-size: 11px;
  }

  .ai-sidebar__scroll {
    max-height: calc(100% - 92px);
    padding-top: 12px;
  }

  .ai-course-group {
    margin-bottom: 10px;
    background: rgb(255 255 255 / 90%);
    box-shadow: 0 10px 24px rgb(36 50 82 / 6%);
  }

  .ai-course-header {
    min-height: 46px;
    padding: 8px 9px;
  }

  .ai-course-sessions {
    padding: 2px 6px 10px;
  }

  .ai-conversation-card,
  .ai-history-card {
    padding: 10px 11px;
    background: rgb(248 250 252 / 95%);
  }

  .ai-sidebar__setting-card {
    padding: 10px;
    margin-top: 10px;
    border-radius: 17px;
  }
}
</style>
