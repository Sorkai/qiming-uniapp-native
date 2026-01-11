<template>
  <div class="teacher-plan-container h-[calc(100vh-140px)] m-3 flex gap-3 overflow-hidden">
    <!-- 左侧课程选择侧边栏 -->
    <div class="course-sidebar w-[320px] flex flex-col bg-[var(--el-bg-color-overlay)] rounded-xl shadow-sm border border-[var(--el-border-color-light)] overflow-hidden">
      <div class="pt-8 px-8 pb-4 border-b border-[var(--el-border-color-light)] bg-[var(--el-fill-color-light)]/50">
        <h3 class="text-xl font-bold text-[var(--el-text-color-primary)] flex items-center tracking-tight" style="margin-bottom: 20px;">
          <el-icon class="mr-2 text-[var(--el-color-primary)]"><Reading /></el-icon>
          教学中心
        </h3>
        <el-input
          v-model="courseSearchQuery"
          placeholder="搜索您管理的课程..."
          clearable
          @input="handleCourseSearch"
          class="!w-full custom-search"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>
      
      <div v-loading="courseLoading" class="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-1">
        <div 
          v-for="course in courseOptions" 
          :key="course.courseId"
          :class="['course-item', selectedCourseId === course.courseId ? 'active' : '']"
          @click="selectCourse(course)"
        >
          <el-image :src="course.thumbUrl" class="w-14 h-10 rounded-lg object-cover mr-3 bg-[var(--el-fill-color-light)] shadow-sm">
            <template #error><div class="flex items-center justify-center w-full h-full text-[10px] text-[var(--el-text-color-placeholder)]">封面</div></template>
          </el-image>
          <div class="flex-1 overflow-hidden">
            <div class="course-name truncate text-sm font-bold text-[var(--el-text-color-primary)]">{{ course.title }}</div>
            <div class="flex justify-between items-center mt-1">
              <span class="text-[10px] px-1.5 py-0.5 rounded-md" :class="course.isRequired === 1 ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-500'">
                {{ course.isRequired === 1 ? '必修' : '选修' }}
              </span>
              <span class="text-[10px] text-[var(--el-text-color-placeholder)]">{{ course.userName }}</span>
            </div>
          </div>
        </div>
        <el-empty v-if="courseOptions.length === 0" description="暂无课程" :image-size="60" />
      </div>
    </div>

    <!-- 右侧内容管理区 -->
    <div class="flex-1 bg-[var(--el-bg-color-overlay)] rounded-xl shadow-md border border-[var(--el-border-color-light)] flex flex-col overflow-hidden relative">
      <template v-if="selectedCourseId">
        <!-- 顶部信息栏 -->
        <div class="px-6 py-4 border-b border-[var(--el-border-color-lighter)] flex justify-between items-center bg-[var(--el-bg-color-overlay)] z-10">
          <div class="flex items-center gap-4">
            <div class="p-2 bg-[var(--el-color-primary-light-9)] rounded-lg text-[var(--el-color-primary)]">
              <el-icon class="text-xl"><Collection /></el-icon>
            </div>
            <div>
              <h2 class="text-lg font-bold text-[var(--el-text-color-primary)] leading-none mb-1.5">{{ currentCourse?.title }}</h2>
              <p class="text-[11px] text-[var(--el-text-color-secondary)]">授课教师: {{ currentCourse?.userName }} · 课程编号: {{ currentCourse?.courseId }}</p>
            </div>
          </div>
          <div class="flex items-center gap-4">
            <div class="hidden md:flex items-center space-x-2 text-[var(--el-color-success)] text-xs bg-[var(--el-color-success-light-9)] px-4 py-2 rounded-full font-medium">
              <div class="w-2 h-2 rounded-full bg-[var(--el-color-success)] animate-pulse"></div>
              <span>AI Engine Connected</span>
            </div>
          </div>
        </div>

        <!-- 标签页内容区 -->
        <div class="flex-1 overflow-hidden flex flex-col">
          <el-tabs v-model="activeTab" class="teacher-plan-tabs" tab-position="top">
            <el-tab-pane label="AI 智能生成工作台" name="generate" class="h-full">
              <plan-generator :course-id="selectedCourseId" @switch-tab="switchTab" />
            </el-tab-pane>
            <el-tab-pane label="已生成教案库" name="list" class="h-full">
              <plan-list :course-id="selectedCourseId" @switch-tab="switchTab" />
            </el-tab-pane>
          </el-tabs>
        </div>
      </template>

      <!-- 未选择状态 - 深度美化版 -->
      <div v-else class="flex-1 flex flex-col items-center justify-center relative bg-[var(--el-bg-color-overlay)] overflow-hidden">
        <!-- 装饰性背景层 - 仅保留顶部主色调光晕，移除底部干扰色 -->
        <div class="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-[var(--el-color-primary-light-8)] rounded-full blur-[120px] opacity-20 pointer-events-none"></div>

        <div class="max-w-2xl w-full px-12 text-center relative z-10">
          <!-- 动态 Lottie 动画 - 移除边框和多余背景 -->
          <div class="mb-14 flex justify-center">
            <div class="transform transition-transform hover:scale-105 duration-500">
              <lottie-animation 
                :animation-data="EducationAnim" 
                :width="260" 
                :height="260"
              />
            </div>
          </div>

          <h2 class="text-5xl font-black mb-8 tracking-tight">
            <span class="bg-clip-text text-transparent bg-gradient-to-r from-[var(--el-color-primary)] to-[#6366f1]">
              开启智能教案设计
            </span>
          </h2>
          
          <p class="text-xl text-[var(--el-text-color-secondary)] mb-20 max-w-xl mx-auto leading-[1.9] font-medium opacity-90">
            请从左侧教学中心选择一门目标课程。我们将协助您利用 AI 技术，快速生成高质量的标准教学大纲与教案文档。
          </p>

          <div class="grid grid-cols-2 gap-12 text-left px-4">
            <div class="group p-8 bg-[var(--el-bg-color)]/60 backdrop-blur-md rounded-[32px] border border-[var(--el-border-color-light)] shadow-sm hover:shadow-2xl hover:-translate-y-3 transition-all duration-500">
              <div class="w-14 h-14 bg-blue-50 dark:bg-blue-900/25 rounded-2xl flex items-center justify-center mb-6 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                <el-icon size="28"><Cpu /></el-icon>
              </div>
              <h4 class="text-lg font-bold text-[var(--el-text-color-primary)] mb-3">大模型深度解析</h4>
              <p class="text-sm text-[var(--el-text-color-secondary)] leading-loose opacity-80">
                基于最新 LLM 技术，自动识别知识重难点，精准匹配教学大纲与学习目标。
              </p>
            </div>

            <div class="group p-8 bg-[var(--el-bg-color)]/60 backdrop-blur-md rounded-[32px] border border-[var(--el-border-color-light)] shadow-sm hover:shadow-2xl hover:-translate-y-3 transition-all duration-500">
              <div class="w-14 h-14 bg-emerald-50 dark:bg-emerald-900/25 rounded-2xl flex items-center justify-center mb-6 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                <el-icon size="28"><Document /></el-icon>
              </div>
              <h4 class="text-lg font-bold text-[var(--el-text-color-primary)] mb-3">标准化文档输出</h4>
              <p class="text-sm text-[var(--el-text-color-secondary)] leading-loose opacity-80">
                一键导出 Markdown 或 PDF 文档，支持自定义模板，确保教学交付物的高标准。
              </p>
            </div>
          </div>

          <div class="mt-20 flex items-center justify-center space-x-3 text-[var(--el-text-color-placeholder)]">
            <el-icon class="animate-bounce"><Pointer /></el-icon>
            <span class="text-sm font-medium">请在左侧列表点击课程以开始</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { getCourseList } from "@/api/course";
import PlanGenerator from "./components/PlanGenerator.vue";
import PlanList from "./components/PlanList.vue";
import LottieAnimation from "@/components/LottieAnimation.vue";
import EducationAnim from "@/animation/Education.json";
import { Search, Reading, Collection, Cpu, Document, MagicStick, Pointer } from "@element-plus/icons-vue";

defineOptions({
  name: "CourseTeacherPlan"
});

// 标签页控制
const activeTab = ref("generate");

// 课程选择相关
const selectedCourseId = ref(null);
const courseOptions = ref([]);
const courseLoading = ref(false);
const currentCourse = ref(null);
const courseSearchQuery = ref("");

// 搜索课程
const handleCourseSearch = async () => {
  courseLoading.value = true;
  try {
    const { data } = await getCourseList({
      pageNum: 1,
      pageSize: 50,
      courseName: courseSearchQuery.value
    });
    courseOptions.value = data.courseList;
  } catch (error) {
    console.error("搜索课程失败", error);
  } finally {
    courseLoading.value = false;
  }
};

const selectCourse = (course: any) => {
  selectedCourseId.value = course.courseId;
  currentCourse.value = course;
};

// 获取初始课程列表
const fetchInitialCourses = async () => {
  courseLoading.value = true;
  try {
    const { data } = await getCourseList({
      pageNum: 1,
      pageSize: 50
    });
    courseOptions.value = data.courseList;
  } catch (error) {
    console.error("获取课程列表失败", error);
    ElMessage.error("获取课程列表失败");
  } finally {
    courseLoading.value = false;
  }
};

// 切换标签页
const switchTab = (tabName: string) => {
  activeTab.value = tabName;
};

onMounted(() => {
  fetchInitialCourses();
});
</script>

<style lang="scss" scoped>
.course-item {
  display: flex;
  align-items: center;
  padding: 12px;
  margin-bottom: 8px;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid transparent;
  background-color: transparent;

  &:hover {
    background-color: var(--el-fill-color-light);
    transform: translateX(4px);
  }

  &.active {
    background-color: var(--el-color-primary-light-9);
    border-color: var(--el-color-primary-light-5);
    box-shadow: 0 4px 12px rgba(var(--el-color-primary-rgb), 0.1);
    
    .course-name {
      color: var(--el-color-primary);
    }

    .course-icon-box {
      background-color: var(--el-color-primary);
      color: white;
    }
  }
}

.custom-search :deep(.el-input__wrapper) {
  border-radius: 12px;
  padding: 4px 12px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
  background-color: var(--el-bg-color);
  
  &.is-focus {
    box-shadow: 0 0 0 1px var(--el-color-primary) inset, 0 4px 12px rgba(var(--el-color-primary-rgb), 0.1);
  }
}

.teacher-plan-tabs {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 0 24px;
  overflow: hidden;

  :deep(.el-tabs__header) {
    margin-bottom: 0;
    padding: 12px 0 0 0;
    flex-shrink: 0;
    order: -1 !important;
  }

  :deep(.el-tabs__item) {
    font-weight: 600;
    font-size: 14px;
    height: 44px;
    padding: 0 20px;
    transition: all 0.3s;
    
    &.is-active {
      color: var(--el-color-primary);
    }
  }

  :deep(.el-tabs__active-bar) {
    height: 3px;
    border-radius: 3px;
  }

  :deep(.el-tabs__nav-wrap::after) {
    height: 1px;
    background-color: var(--el-border-color-lighter);
  }

  :deep(.el-tabs__content) {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
    padding: 12px 0;
    overflow: hidden;
    order: 1 !important;
  }
  
  :deep(.el-tab-pane) {
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
}

.custom-scrollbar {
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: var(--el-border-color-lighter);
    border-radius: 10px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
}
</style>
 