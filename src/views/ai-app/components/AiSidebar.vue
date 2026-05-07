<template>
  <div
    class="ai-sidebar h-full flex flex-col p-4 bg-gray-50/50 border-r border-gray-100 italic-safe"
  >
    <!-- Navigation: Simplified Icons -->
    <div class="space-y-1 mb-6">
      <div
        v-for="item in railItems"
        :key="item.key"
        :class="[
          'flex items-center justify-between px-3 py-3 rounded-xl cursor-pointer transition-all duration-300 group',
          activeRail === item.key
            ? 'bg-white shadow-sm text-primary transform scale-[1.02]'
            : 'text-gray-500 hover:bg-white/60 hover:text-gray-800 hover:translate-x-1'
        ]"
        @click="$emit('update:activeRail', item.key)"
      >
        <div class="flex items-center gap-3">
          <el-icon
            :size="18"
            class="transition-transform duration-300"
            :class="
              activeRail === item.key
                ? 'text-primary scale-110'
                : 'group-hover:text-primary group-hover:scale-110 group-hover:rotate-6'
            "
            ><component :is="item.icon"
          /></el-icon>
          <span class="text-sm font-medium transition-colors">{{
            item.label
          }}</span>
        </div>
        <!-- 侧边导航指示条(可选) -->
        <div
          v-if="activeRail === item.key"
          class="w-1 h-4 bg-primary rounded-full animate-fade-in-right"
        ></div>
      </div>
    </div>

    <!-- Sessions: Grouped by Course -->
    <div class="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-6">
      <!-- 1. 智能辅导 (按课程展开) -->
      <div v-show="activeRail === 'chat'">
        <div v-for="course in courses" :key="course" class="mb-4">
          <!-- 课程分类标题栏 + 新建按钮 -->
          <div
            class="text-[12px] font-bold text-gray-700 tracking-widest mb-2 px-3 flex items-center justify-between group/course cursor-pointer"
            @click="toggleCourse(course)"
          >
            <div class="flex items-center gap-2">
              <el-icon
                class="text-primary/70 transition-transform duration-300"
                :class="{ '-rotate-90': collapsedCourses.includes(course) }"
              >
                <ArrowDown />
              </el-icon>
              <el-icon class="text-primary/70"><Reading /></el-icon>
              <span class="truncate max-w-[120px]">{{ course }}</span>
            </div>
            <div class="flex items-center gap-1">
              <el-tooltip content="新建该课程的辅导会话" placement="right">
                <el-button
                  type="primary"
                  size="small"
                  plain
                  :icon="Plus"
                  @click.stop="$emit('new-chat', { course })"
                  class="!rounded-md opacity-0 group-hover/course:opacity-100 transition-all scale-75 hover:scale-90 hover:!shadow-[0_0_8px_rgba(94,127,248,0.4)]"
                />
              </el-tooltip>
            </div>
          </div>

          <el-collapse-transition>
            <div v-show="!collapsedCourses.includes(course)">
              <transition-group appear name="list" tag="div" class="space-y-1">
                <div
                  v-for="(conv, index) in groupedConversations[course] || []"
                  :key="conv.id"
                  :style="{ transitionDelay: `${index * 50}ms` }"
                  class="px-3 py-3 rounded-xl hover:bg-white cursor-pointer group transition-all duration-300 hover:shadow-sm hover:scale-[1.01] hover:border-gray-200 border border-transparent"
                >
                  <div
                    class="flex items-center justify-between gap-2 relative overflow-hidden"
                  >
                    <div
                      class="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    ></div>

                    <span
                      class="text-sm text-gray-600 truncate group-hover:text-primary group-hover:font-medium transition-all duration-300 relative z-10"
                    >
                      {{ conv.title }}
                    </span>
                  </div>
                </div>
              </transition-group>
            </div>
          </el-collapse-transition>
        </div>
      </div>

      <!-- 2. 最近聊天记录 (全局历史) -->
      <div class="mt-8">
        <div
          class="text-[12px] font-bold text-gray-400 tracking-widest mb-3 px-3 flex items-center gap-2"
        >
          <el-icon><Timer /></el-icon>
          <span>历史记录</span>
        </div>
        <div class="space-y-1">
          <div
            v-for="(conv, index) in recentHistory"
            :key="'recent-' + conv.id"
            class="px-3 py-2.5 rounded-xl hover:bg-white cursor-pointer group transition-all duration-300 border border-transparent hover:border-gray-100"
          >
            <div class="flex items-center justify-between gap-2">
              <span
                class="text-[13px] text-gray-500 truncate group-hover:text-gray-700"
              >
                {{ conv.title }}
              </span>
              <span
                v-if="conv.course"
                class="text-[10px] bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded italic"
              >
                {{ conv.course }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- User Profile Area -->
    <div
      class="mt-auto pt-4 border-t border-gray-100 flex items-center gap-3 relative overflow-hidden group cursor-pointer rounded-xl p-2 hover:bg-white hover:shadow-sm transition-all duration-300"
    >
      <!-- 渐变悬浮背景 -->
      <div
        class="absolute inset-0 bg-gradient-to-r from-white to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
      ></div>
      <el-avatar
        :size="32"
        src="https://avatars.githubusercontent.com/u/44761321?v=4"
        class="group-hover:scale-110 transition-transform duration-300 shadow-sm border border-white"
      />
      <div class="flex-1 min-w-0 relative z-10">
        <p
          class="text-xs font-bold text-gray-700 truncate group-hover:text-primary transition-colors"
        >
          系统设置
        </p>
        <p
          class="text-[10px] text-gray-400 truncate group-hover:text-gray-500 transition-colors"
        >
          当前版本
        </p>
      </div>
      <el-icon
        class="text-gray-300 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0 z-10"
        ><ArrowRight
      /></el-icon>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  Plus,
  ArrowRight,
  Reading,
  Timer,
  ArrowDown
} from "@element-plus/icons-vue";
import { computed, ref } from "vue";

const props = defineProps<{
  railItems: any[];
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

const recentHistory = computed(() => {
  return props.conversations.filter(c => !c.course).slice(0, 5);
});

const collapsedCourses = ref<string[]>([]);

const toggleCourse = (course: string) => {
  const index = collapsedCourses.value.indexOf(course);
  if (index > -1) {
    collapsedCourses.value.splice(index, 1);
  } else {
    collapsedCourses.value.push(course);
  }
};

defineEmits(["update:activeRail"]);
</script>

<style scoped>
.italic-safe {
  font-style: normal;
}

/* 列表进入过渡 */
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

/* 自定义淡入动画 */
@keyframes fadeInRight {
  from {
    opacity: 0;
    transform: translateX(-5px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
.animate-fade-in-right {
  animation: fadeInRight 0.3s ease-out forwards;
}

/* 滚动条美化 */
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: transparent;
  border-radius: 4px;
  transition: background 0.3s;
}
.custom-scrollbar:hover::-webkit-scrollbar-thumb {
  background: #cbd5e1;
}
</style>
