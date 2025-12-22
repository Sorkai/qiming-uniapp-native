<template>
  <!-- 侧边栏菜单 -->
  <div
    id="layout-sidebar"
    class="layout-sidebar"
    :class="currentTheme"
  >
    <template v-for="(item, index) in sidebarMenuItems" :key="item.key || index">
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
        <div
          class="hover-box"
          :class="{ active: activeMenu === item.key }"
        >
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
import CourseQaIcon from "@/assets/course-icons/course-qa-new.svg?component";
import HomeworkExamIcon from "@/assets/course-icons/homework-exam-new.svg?component";
import GradesIcon from "@/assets/course-icons/grades.svg?component";
import CourseMaterialsIcon from "@/assets/course-icons/course-materials-new.svg?component";

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
  { key: "html-animations", label: "HTML动画", icon: CourseMaterialsIcon },
  { key: "grades", label: "成绩", icon: GradesIcon }
];
</script>

<style scoped>
/* 侧边栏样式优化 - 独立显示，与左右保持距离 */
.layout-sidebar {
  width: 80px !important;
  min-width: 80px !important;
  left: 10px !important;
  top: 80px !important;
  height: auto !important;
  max-height: calc(100vh - 97px) !important;
  border-radius: 24px !important;
  background: rgba(255, 255, 255, 0.8) !important;
  backdrop-filter: blur(20px) saturate(180%) !important;
  box-shadow: 0 8px 32px -4px rgba(64, 158, 255, 0.2) !important;
  border: 1px solid rgba(64, 158, 255, 0.2) !important;
  z-index: 100 !important;
  position: fixed !important;
  overflow-y: auto !important;
  overflow-x: hidden !important;
  padding: 15px 0 !important;
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
}

.layout-sidebar::after {
  content: "" !important;
  position: absolute !important;
  inset: 0 !important;
  border-radius: 24px !important;
  padding: 1.5px !important;
  background: linear-gradient(90deg, #409eff, #604ffd, #409eff) !important;
  background-size: 200% 100% !important;
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0) !important;
  mask-composite: exclude !important;
  animation: sidebar-glow-border 3s linear infinite !important;
  pointer-events: none !important;
}

@keyframes sidebar-glow-border {
  0% { background-position: 0% 0%; }
  100% { background-position: 200% 0%; }
}

.layout-sidebar.light {
  background: #f5f7fa !important; /* 与页面背景完全统一，消除色差 */
}

.layout-sidebar.dark {
  background: #1a1a1a !important; /* 与深色模式背景完全统一 */
  box-shadow: 0 8px 32px -4px rgba(0, 0, 0, 0.4) !important;
  border: 1px solid rgba(255, 255, 255, 0.05) !important;
}

/* 侧边栏菜单项样式调整 */
.layout-sidebar .item {
  padding: 6px 10px !important;
  width: 100% !important;
  display: flex !important;
  justify-content: center !important;
  box-sizing: border-box !important;
}

.layout-sidebar .hover-box {
  width: 100% !important;
  padding: 12px 0 !important;
  border-radius: 16px !important;
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  justify-content: center !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  cursor: pointer;
  position: relative;
}

.layout-sidebar .item.active .hover-box,
.layout-sidebar .hover-box.active {
  background: #409eff !important;
  box-shadow: 0 6px 16px rgba(64, 158, 255, 0.3) !important;
}

.layout-sidebar .side-name {
  font-size: 11px !important;
  margin-top: 6px !important;
  color: #5a6b8a !important;
  white-space: nowrap;
  transition: transform 0.2s ease-in-out, color 0.3s !important;
  display: inline-block;
}

.dark .side-name {
  color: #a8b8e8 !important;
}

.layout-sidebar .hover-box:hover {
  background: rgba(207, 216, 240, 0.4) !important;
  transform: translateY(-2px) scale(1.1) !important;
}

.layout-sidebar .hover-box:hover .side-name {
  transform: scale(1.15) !important;
  color: #2d3a53 !important;
}

.dark .hover-box:hover .side-name {
  color: #ffffff !important;
}

.item.active .side-name,
.hover-box.active .side-name {
  color: #ffffff !important;
  font-weight: bold !important;
}

.item.active svg,
.hover-box.active svg {
  filter: brightness(0) invert(1) !important;
}

.dark .item.active .hover-box {
  background: #4a5a7a !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4) !important;
}

/* 侧边栏分割线样式 */
.layout-sidebar .line {
  width: calc(100% - 20px);
  height: 1px;
  margin: 8px 8px !important;
  background: linear-gradient(90deg, transparent, rgba(207, 216, 240, 0.5), transparent) !important;
}

.layout-sidebar .line:last-child {
  display: none !important;
}

.dark .line {
  background: linear-gradient(90deg, transparent, rgba(100, 100, 120, 0.4), transparent) !important;
}

/* 图标样式 */
.hover-box svg {
  width: 25px;
  height: 25px;
  color: #5a6b8a !important;
  transition: all 0.3s ease !important;
}

.hover-box svg :deep(path),
.hover-box svg :deep(circle),
.hover-box svg :deep(rect),
.hover-box svg :deep(ellipse),
.hover-box svg :deep(line),
.hover-box svg :deep(polyline),
.hover-box svg :deep(polygon) {
  fill: currentColor !important;
  stroke: currentColor !important;
}

.dark .hover-box svg {
  color: #4facfe !important; /* 深色模式使用亮蓝色，确保清晰可见 */
}

.layout-sidebar .hover-box:hover svg {
  color: #409eff !important;
}

.dark .layout-sidebar .hover-box:hover svg {
  color: #ffffff !important;
}

.item.active svg,
.hover-box.active svg {
  color: #ffffff !important;
  filter: none !important;
}
</style>
