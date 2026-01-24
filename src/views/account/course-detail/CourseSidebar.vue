<template>
  <!-- 侧边栏菜单 -->
  <div id="layout-sidebar" class="layout-sidebar" :class="currentTheme">
    <template
      v-for="(item, index) in sidebarMenuItems"
      :key="item.key || index"
    >
      <!-- 分割线 -->
      <div v-if="item.type === 'divider'" class="line" />
      <!-- 菜单项 -->
      <div
        v-else
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
</template>

<script setup lang="ts">
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

// Emits
defineEmits<{
  (e: "menu-click", menuName: string): void;
}>();

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
</script>

<style scoped lang="scss">
/* 侧边栏样式优化 - 独立显示，与左右保持距离 */
.layout-sidebar {
  width: 80px;
  min-width: 80px;
  left: 10px;
  top: 80px;
  height: auto;
  max-height: calc(100vh - 97px);
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px) saturate(180%);
  box-shadow: 0 8px 32px -4px rgba(64, 158, 255, 0.2);
  border: 1px solid rgba(64, 158, 255, 0.2);
  z-index: 100;
  position: fixed;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 15px 0;
  display: flex;
  flex-direction: column;
  align-items: center;

  &::after {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: 24px;
    padding: 1.5px;
    background: linear-gradient(90deg, #97b4f7, #604ffd, #97b4f7);
    background-size: 200% 100%;
    -webkit-mask:
      linear-gradient(#fff 0 0) content-box,
      linear-gradient(#fff 0 0);
    mask-composite: exclude;
    animation: sidebar-glow-border 3s linear infinite;
    pointer-events: none;
  }

  &.light {
    background: #f5f7fa; /* 与页面背景完全统一，消除色差 */
  }

  &.dark {
    background: #1a1a1a; /* 与深色模式背景完全统一 */
    box-shadow: 0 8px 32px -4px rgba(0, 0, 0, 0.4);
    border: 1px solid rgba(255, 255, 255, 0.05);

    .side-name {
      color: #a8b8e8;
    }

    .item.active .hover-box {
      background: #4a5a7a;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
    }

    .line {
      background: linear-gradient(
        90deg,
        transparent,
        rgba(100, 100, 120, 0.4),
        transparent
      );
    }

    .hover-box {
      svg {
        color: #4facfe; /* 深色模式使用亮蓝色，确保清晰可见 */
      }

      &:hover {
        .side-name {
          color: #ffffff;
        }

        svg {
          color: #ffffff;
        }
      }
    }
  }

  /* 侧边栏菜单项样式调整 */
  .item {
    padding: 6px 10px;
    width: 100%;
    display: flex;
    justify-content: center;
    box-sizing: border-box;

    &.active {
      .hover-box {
        background: #97b4f7;
        box-shadow: 0 6px 16px rgba(64, 158, 255, 0.3);

        .side-name {
          color: #ffffff;
          font-weight: bold;
        }

        svg {
          color: #ffffff;
          filter: none;
        }
      }
    }
  }

  .hover-box {
    width: 100%;
    padding: 12px 0;
    border-radius: 16px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    cursor: pointer;
    position: relative;
    overflow: hidden;

    &.active {
      background: #97b4f7;
      box-shadow: 0 6px 16px rgba(64, 158, 255, 0.3);

      .side-name {
        color: #ffffff;
        font-weight: bold;
      }

      svg {
        color: #ffffff;
        filter: none;
      }
    }

    &:hover {
      background: rgba(207, 216, 240, 0.4);
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
        fill: currentColor;
        stroke: currentColor;
      }
    }
  }

  .side-name {
    font-size: 12px;
    font-weight: 600;
    margin-top: 4px;
    color: #5a6b8a;
    white-space: nowrap;
    transition:
      transform 0.2s ease-in-out,
      color 0.3s;
    display: inline-block;
    max-width: 100%;
    text-align: center;
  }

  /* 侧边栏分割线样式 */
  .line {
    width: calc(100% - 20px);
    height: 1px;
    margin: 8px 8px;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(207, 216, 240, 0.5),
      transparent
    );

    &:last-child {
      display: none;
    }
  }
}

@keyframes sidebar-glow-border {
  0% {
    background-position: 0% 0%;
  }
  100% {
    background-position: 200% 0%;
  }
}
</style>
