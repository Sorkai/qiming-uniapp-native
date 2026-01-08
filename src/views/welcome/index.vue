<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import ReCol from "@/components/ReCol";
import LottieAnimation from "@/components/LottieAnimation.vue";
import { useDark } from "./utils";
import {
  TeacherStudentUsage,
  WeekUsage,
  CourseStatistics,
  EfficientIndex
} from "./components/charts";
import StatsOverview from "./components/StatsOverview.vue";
import { isAdmin } from "@/utils/auth";
import { useUserStoreHook } from "@/store/modules/user";

// 导入动画
import EducationAnimation from "@/animation/Education.json";
import OnlineLearningAnimation from "@/animation/Online Learning Platform.json";
import AITrainingAnimation from "@/animation/AI training.json";

defineOptions({
  name: "Welcome"
});

const router = useRouter();

const handleViewReport = () => {
  document.getElementById("efficient-index-report")?.scrollIntoView({ behavior: "smooth" });
};

const { isDark } = useDark();
const userStore = useUserStoreHook();
const nickname = ref(userStore.nickname || userStore.username);

// 随机选择一个动画
const selectedAnimation = ref(
  [EducationAnimation, OnlineLearningAnimation, AITrainingAnimation][
    Math.floor(Math.random() * 3)
  ]
);

// 获取当前时间段招呼语
const greeting = computed(() => {
  const hour = new Date().getHours();
  if (hour < 6) return "凌晨好";
  if (hour < 9) return "早上好";
  if (hour < 12) return "上午好";
  if (hour < 14) return "中午好";
  if (hour < 17) return "下午好";
  if (hour < 19) return "傍晚好";
  return "晚上好";
});

// 判断当前用户是否是管理员
const isAdminUser = ref(isAdmin());

// 打字机效果
const displayedText = ref("");
const isTyping = ref(true);

const startTypewriter = () => {
  const fullText = `${greeting.value}, ${nickname.value}!`;
  displayedText.value = "";
  isTyping.value = true;
  let i = 0;
  
  const timer = setInterval(() => {
    if (i < fullText.length) {
      displayedText.value += fullText.charAt(i);
      i++;
    } else {
      clearInterval(timer);
      isTyping.value = false;
    }
  }, 100);
};

// 监听问候语变化重新触发打字机
import { watchEffect } from "vue";
watchEffect(() => {
  if (greeting.value && nickname.value) {
    startTypewriter();
  }
});
</script>

<template>
  <div class="welcome-container p-4">
    <!-- Modern Welcome Header -->
    <div 
      class="welcome-header mb-6 px-6 py-5 rounded-[24px] relative overflow-hidden flex flex-col md:flex-row justify-between items-center text-white shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]"
    >
      <div class="z-10 text-center md:text-left group">
        <h1 class="text-4xl md:text-5xl font-extrabold mb-4 leading-tight transition-transform duration-300 group-hover:translate-x-2 min-h-[60px] flex items-center tracking-tight">
          {{ displayedText }}
          <span v-if="isTyping" class="cursor-blink ml-1">|</span>
          <span v-else class="wave ml-2">👋</span>
        </h1>
        <p class="text-xl md:text-2xl font-medium leading-relaxed text-blue-50 opacity-90 max-w-2xl transition-all duration-300 group-hover:opacity-100 mb-8">
          欢迎回到智慧教学平台。您的 AI 助手已经为您准备好了今天的课程方案和学生进度报告。
        </p>
        <div class="mt-8 flex flex-wrap gap-4 justify-center md:justify-start">
          <el-button 
            color="#ffffff" 
            style="color: #2563eb" 
            round 
            size="large"
            class="font-bold text-lg px-8 transition-all duration-300 hover:scale-105 shadow-md"
            @click="router.push('/course/teacherplan')"
          >
            <IconifyIconOnline icon="ep:plus" class="mr-1" /> 开始新教案
          </el-button>
          <el-button 
            color="#ffffff" 
            round 
            size="large"
            class="font-bold text-lg px-8 transition-all duration-300 hover:scale-105 shadow-md"
            style="color: #2563eb"
            @click="handleViewReport"
          >
            <IconifyIconOnline icon="ep:view" class="mr-1" /> 查看报告
          </el-button>
        </div>
      </div>
      
      <div class="hidden lg:block z-10 opacity-90 transition-all duration-300 hover:scale-110 hover:opacity-100 ml-auto flex items-center justify-end">
        <div class="header-illustration relative w-80 h-80 flex items-center justify-center">
          <!-- Lottie 动画 - 默认显示 -->
          <div class="opacity-90 transition-opacity duration-300">
            <div class="circle-decoration absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
            <div class="circle-decoration absolute -bottom-10 -left-10 w-32 h-32 bg-blue-400/20 rounded-full blur-xl"></div>
            <LottieAnimation 
              :animation-data="selectedAnimation"
              :width="400"
              :height="350"
              class="drop-shadow-2xl"
            />
          </div>
        </div>
      </div>
      
      <!-- Abstract BG patterns -->
      <div class="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-white/10 to-transparent skew-x-12 transform origin-top"></div>
    </div>

    <!-- Statistics Grid -->
    <StatsOverview class="mb-8" />

    <!-- 统计API图表部分 -->
    <el-row :gutter="24" justify="space-around">
      <!-- 只有管理员才能看到这两个图表 -->
      <template v-if="isAdminUser">
      <re-col
        v-motion
        class="mb-[24px]"
          :value="12"
          :md="12"
          :sm="24"
        :xs="24"
      >
        <el-card shadow="never" class="chart-card">
          <template #header>
            <div class="flex items-center justify-between">
              <span class="text-lg font-bold flex items-center">
                <span class="w-1 h-5 bg-blue-500 rounded-full mr-2"></span>
                最近7天平台活跃度
              </span>
              <el-tag size="small" effect="plain">实时更新</el-tag>
            </div>
          </template>
          <div class="h-[450px]">
            <TeacherStudentUsage />
          </div>
        </el-card>
      </re-col>

      <re-col
        v-motion
        class="mb-[24px]"
          :value="12"
          :md="12"
          :sm="24"
        :xs="24"
      >
          <el-card shadow="never" class="chart-card">
            <template #header>
              <div class="flex items-center justify-between">
                <span class="text-lg font-bold flex items-center">
                  <span class="w-1 h-5 bg-cyan-500 rounded-full mr-2"></span>
                  本周教学趋势分析
                </span>
              </div>
            </template>
            <div class="h-[450px]">
              <WeekUsage />
            </div>
          </el-card>
      </re-col>
      </template>
      
      <!-- 教学效率指数图表（所有用户可见） -->
      <re-col
        v-motion
        id="efficient-index-report"
        class="mb-[24px]"
        :value="24"
        :md="10"
        :sm="24"
        :xs="24"
      >
        <el-card shadow="never" class="chart-card h-full">
          <template #header>
            <div class="flex items-center justify-between">
              <span class="text-lg font-bold flex items-center">
                <span class="w-1 h-5 bg-amber-500 rounded-full mr-2"></span>
                效率评价指标
              </span>
            </div>
          </template>
          <div class="min-h-[600px]">
            <EfficientIndex />
          </div>
        </el-card>
      </re-col>

      <!-- 所有用户(包括教师)都可以看到课程统计 -->
      <re-col
        v-motion
        class="mb-[24px]"
        :value="24"
        :md="14"
        :sm="24"
        :xs="24"
      >
        <el-card shadow="never" class="chart-card h-full">
          <template #header>
            <div class="flex items-center justify-between">
              <span class="text-lg font-bold flex items-center">
                <span class="w-1 h-5 bg-emerald-500 rounded-full mr-2"></span>
                课程参与度深度分析
              </span>
            </div>
          </template>
          <div class="min-h-[600px]">
            <CourseStatistics />
          </div>
        </el-card>
      </re-col>
    </el-row>
  </div>
</template>

<style lang="scss" scoped>
.welcome-container {
  background: transparent;
  min-height: calc(100vh - 120px);
}

.welcome-header {
  background: linear-gradient(135deg, #2563eb 0%, #0d9488 100%);
  border-radius: 24px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    box-shadow: 0 20px 40px -10px rgba(37, 99, 235, 0.4);
    transform: scale(1.02);
    
    .wave {
      animation: wave-animation 0.6s ease-in-out;
    }
  }
}

@keyframes wave-animation {
  0% { transform: rotate(0deg); }
  10% { transform: rotate(14deg); }
  20% { transform: rotate(-8deg); }
  30% { transform: rotate(14deg); }
  40% { transform: rotate(-4deg); }
  50% { transform: rotate(10deg); }
  60% { transform: rotate(0deg); }
  100% { transform: rotate(0deg); }
}

.chart-card {
  border: none;
  border-radius: 24px;
  background: var(--el-bg-color-overlay);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
  }

  :deep(.el-card__header) {
    border-bottom: 1px solid var(--el-border-color-lighter);
    padding: 24px 24px 16px;
  }

  :deep(.el-card__body) {
    padding: 0 24px 24px;
  }
}

.wave {
  display: inline-block;
  animation: wave-animation 2.5s infinite;
  transform-origin: 70% 70%;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    animation: wave-animation 0.6s ease-in-out;
  }
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

.cursor-blink {
  display: inline-block;
  font-weight: 300;
  animation: blink 1s step-end infinite;
  color: rgba(255, 255, 255, 0.8);
}
</style>
