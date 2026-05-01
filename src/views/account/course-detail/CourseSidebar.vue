<template>
  <!-- 侧边栏菜单 -->
  <div
    id="layout-sidebar"
    class="layout-sidebar"
    :class="currentTheme"
  >
    <div ref="sidebarRef" class="layout-sidebar-scroll">
      <template
        v-for="(item, index) in sidebarMenuItems"
        :key="item.key || index"
      >
        <!-- 分割线 -->
        <div v-if="item.type === 'divider'" class="line" />
        <!-- 菜单项 -->
        <div
          v-else
          :ref="el => setItemRef(item.key, el as HTMLDivElement | null)"
          class="el-tooltip item"
          :class="{ active: activeMenu === item.key }"
          tabindex="0"
          :data-menu="item.key"
          @click="$emit('menu-click', item.key)"
        >
          <div class="hover-box" :class="{ active: activeMenu === item.key }">
            <component :is="item.icon" />
            <div class="side-name">{{ item.label }}</div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import CourseLearnIcon from "@/assets/course-icons/course-learn-new.svg?component";
import MasteryIcon from "@/assets/course-icons/mastery-new.svg?component";
import CourseQaIcon from "@/assets/table-bar/chat-bubble-dots-svgrepo-com.svg?component";
import HomeworkExamIcon from "@/assets/newicons/check-education-exam-svgrepo-com.svg?component";
import GradesIcon from "@/assets/course-icons/grades.svg?component";
import CourseMaterialsIcon from "@/assets/course-icons/course-materials-new.svg?component";
import HtmlAnimationIcon from "@/assets/newicons/3ds-blend-files-svgrepo-com.svg?component";

// Props
const props = defineProps<{
  currentTheme: string;
  activeMenu: string;
}>();

const MOBILE_BREAKPOINT = 767;
const sidebarRef = ref<HTMLElement | null>(null);
const itemRefs = new Map<string, HTMLElement>();

// Emits
defineEmits<{
  (e: "menu-click", menuName: string): void;
}>();

const isMobileViewport = () => window.innerWidth <= MOBILE_BREAKPOINT;

const setItemRef = (key: string, el: HTMLDivElement | null) => {
  if (!key) return;
  if (el) itemRefs.set(key, el);
  else itemRefs.delete(key);
};

const ensureActiveItemVisible = () => {
  if (!isMobileViewport()) return;

  const container = sidebarRef.value;
  const activeItem = itemRefs.get(props.activeMenu);
  if (!container || !activeItem) return;

  const containerRect = container.getBoundingClientRect();
  const activeRect = activeItem.getBoundingClientRect();
  const overflowLeft = activeRect.left < containerRect.left;
  const overflowRight = activeRect.right > containerRect.right;

  if (overflowLeft || overflowRight) {
    activeItem.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest"
    });
  }
};

const handleViewportResize = () => {
  nextTick(() => ensureActiveItemVisible());
};

// 侧边栏菜单配置
const sidebarMenuItems = [
  { key: "course-learn", label: "课程学习", icon: CourseLearnIcon },
  { key: "mastery", label: "知识点", icon: MasteryIcon },
  { type: "divider" },
  { key: "course-qa", label: "课程问答", icon: CourseQaIcon },
  { key: "homework-exam", label: "作业考试", icon: HomeworkExamIcon },
  { key: "course-materials", label: "课程资料", icon: CourseMaterialsIcon },
  { key: "html-animations", label: "HTML动画", icon: HtmlAnimationIcon },
  { key: "grades", label: "成绩", icon: GradesIcon }
];

watch(
  () => props.activeMenu,
  async () => {
    await nextTick();
    ensureActiveItemVisible();
  },
  { immediate: true }
);

onMounted(() => {
  window.addEventListener("resize", handleViewportResize, { passive: true });
  nextTick(() => ensureActiveItemVisible());
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", handleViewportResize);
});
</script>

<style scoped lang="scss">
@keyframes sidebar-glow-border {
  0% {
    background-position: 0% 0%;
  }

  100% {
    background-position: 200% 0%;
  }
}

.layout-sidebar {
  position: fixed;
  top: 80px;
  left: 10px;
  z-index: 100;
  width: 80px;
  min-width: 80px;
  overflow: hidden;
  background: rgb(255 255 255 / 80%);
  border: 1px solid rgb(64 158 255 / 20%);
  border-radius: 24px;
  box-shadow: 0 8px 32px -4px rgb(64 158 255 / 20%);
  isolation: isolate;
  backdrop-filter: blur(20px) saturate(180%);

  &::after {
    position: absolute;
    inset: 0;
    z-index: 0;
    padding: 1.5px;
    pointer-events: none;
    content: "";
    background: linear-gradient(90deg, #97b4f7, #604ffd, #97b4f7);
    background-size: 200% 100%;
    border-radius: 24px;
    mask:
      linear-gradient(#fff 0 0) content-box,
      linear-gradient(#fff 0 0);
    mask-composite: exclude;
    animation: sidebar-glow-border 3s linear infinite;
  }

  &.light {
    background: #f5f7fa; /* 与页面背景完全统一，消除色差 */
  }

  &.dark {
    background: #1a1a1a; /* 与深色模式背景完全统一 */
    border: 1px solid rgb(255 255 255 / 5%);
    box-shadow: 0 8px 32px -4px rgb(0 0 0 / 40%);
  }
}

.layout-sidebar-scroll {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: auto;
  max-height: calc(100vh - 97px);
  padding: 15px 0;
  overflow: hidden auto;
  position: relative;
  z-index: 1;
  width: 100%;
}

.layout-sidebar.dark {
  .side-name {
    color: #a8b8e8;
  }

  .item.active .hover-box {
    background: #4a5a7a;
    box-shadow: 0 4px 12px rgb(0 0 0 / 40%);
  }

  .line {
    background: linear-gradient(
      90deg,
      transparent,
      rgb(79 172 254 / 40%),
      rgb(151 180 247 / 50%),
      rgb(79 172 254 / 40%),
      transparent
    );
  }

  .hover-box {
    svg {
      color: #4facfe; /* 深色模式使用亮蓝色，确保清晰可见 */
    }

    &:hover {
      .side-name {
        color: #fff;
      }

      svg {
        color: #fff;
      }
    }
  }
}

.item {
  position: relative;
  z-index: 1;
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  width: 100%;
  padding: 6px 10px;
  outline: none;

  &:focus,
  &:focus-visible {
    outline: none;
  }

  &.active {
    .hover-box {
      background: #97b4f7;
      box-shadow: 0 6px 16px rgb(64 158 255 / 30%);

      .side-name {
        font-weight: bold;
        color: #fff;
      }

      svg {
        color: #fff;
        filter: none;
      }
    }
  }
}

.hover-box {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 12px 0;
  overflow: hidden;
  cursor: pointer;
  border-radius: 16px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &.active {
    background: #97b4f7;
    box-shadow: 0 6px 16px rgb(64 158 255 / 30%);

    .side-name {
      font-weight: bold;
      color: #fff;
    }

    svg {
      color: #fff;
      filter: none;
    }
  }

  &:hover {
    background: rgb(207 216 240 / 40%);
    transform: translateY(-2px) scale(1.05);

    .side-name {
      color: #2d3a53;
    }

    svg {
      color: #97b4f7;
    }
  }

  svg {
    width: 25px;
    height: 25px;
    color: #5a6b8a;
    transition: all 0.3s ease;

    :deep(*) {
      fill: currentcolor;
      stroke: currentcolor;
    }
  }
}

.side-name {
  display: inline-block;
  max-width: 100%;
  margin-top: 4px;
  font-size: 12px;
  font-weight: 600;
  color: #5a6b8a;
  text-align: center;
  white-space: nowrap;
  transition:
    transform 0.2s ease-in-out,
    color 0.3s;
}

.line {
  width: calc(100% - 16px);
  height: 2px;
  margin: 10px 8px;
  background: linear-gradient(
    90deg,
    transparent,
    rgb(96 79 253 / 40%),
    rgb(151 180 247 / 60%),
    rgb(96 79 253 / 40%),
    transparent
  );
  border-radius: 1px;

  &:last-child {
    display: none;
  }
}

/* 侧边栏样式优化 - 独立显示，与左右保持距离 */

/* stylelint-disable-next-line order/order */
@media (width <= 767px) {
  .layout-sidebar {
    top: 88px;
    right: 12px;
    left: 12px;
    z-index: 120;
    width: auto;
    min-width: 0;
    max-height: none;
    border-radius: 22px;
    overflow: hidden;

    &::after {
      border-radius: 22px;
      opacity: 0.55;
      animation-duration: 5s;
    }
  }

  .layout-sidebar-scroll {
    display: flex;
    flex-direction: row;
    gap: 10px;
    align-items: center;
    width: 100%;
    max-height: none;
    padding: 10px;
    overflow: auto hidden;
    scroll-snap-type: x proximity;
    scroll-padding-inline: 10px;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;

    &::-webkit-scrollbar {
      display: none;
    }
  }

  .layout-sidebar {
    .item {
      flex: 0 0 auto;
      width: auto;
      padding: 0;
      scroll-snap-align: start;

      &::after {
        display: none !important;
      }
    }

    .hover-box {
      flex-direction: row;
      gap: 8px;
      align-items: center;
      justify-content: center;
      width: auto;
      min-width: max-content;
      min-height: 0;
      padding: 12px 18px;
      background: transparent;
      border-radius: 18px;
      box-shadow: none;

      &.active {
        background: #97b4f7;
        box-shadow: 0 6px 16px rgb(64 158 255 / 22%);

        .side-name {
          color: #fff;
        }

        svg {
          color: #fff;
        }
      }

      &:hover {
        transform: translateY(-1px);
      }

      svg {
        width: 20px;
        height: 20px;
      }
    }

    .side-name {
      margin-top: 0;
      font-size: 13px;
      line-height: 1.1;
      white-space: nowrap;
    }

    .line {
      display: none;
    }
  }
}

/* stylelint-disable-next-line order/order */
@media (width <= 479px) {
  .layout-sidebar {
    top: 86px;
    right: 10px;
    left: 10px;
  }

  .layout-sidebar-scroll {
    padding: 8px;
  }

  .layout-sidebar {
    .hover-box {
      padding: 11px 16px;
    }

    .side-name {
      font-size: 12px;
    }
  }
}
</style>
