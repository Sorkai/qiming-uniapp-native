<script setup lang="ts">
import { ref } from "vue";
import ReCol from "@/components/ReCol";
import { useDark } from "./utils";
import {
  TeacherStudentUsage,
  WeekUsage,
  CourseStatistics,
  EfficientIndex
} from "./components/charts";
import { isAdmin } from "@/utils/auth";
import { useUserStoreHook } from "@/store/modules/user";
import welcomeBanner from "@/assets/kecheng.jpg";

defineOptions({
  name: "Welcome"
});

const { isDark } = useDark();
const userStore = useUserStoreHook();
const username = ref(userStore.username);

// 判断当前用户是否是管理员
const isAdminUser = ref(isAdmin());
</script>

<template>
  <div>
    <!-- Welcome Banner -->
    <el-card shadow="never" class="welcome-card" :body-style="{ padding: 0 }">
      <div class="welcome-banner">
        <div class="welcome-text">
          <h2 class="welcome-title">欢迎回来, {{ username }}!</h2>
          <p class="welcome-subtitle">开始新的一天，继续你的学习旅程吧。</p>
        </div>
      </div>
    </el-card>

    <!-- 统计API图表部分 -->
    <el-row :gutter="24" justify="space-around" class="mt-4">
      <!-- 只有管理员才能看到这两个图表 -->
      <template v-if="isAdminUser">
      <re-col
        v-motion
        class="mb-[18px]"
          :value="12"
          :md="12"
          :sm="24"
        :xs="24"
        :initial="{
          opacity: 0,
          y: 100
        }"
        :enter="{
          opacity: 1,
          y: 0,
          transition: {
              delay: 100
          }
        }"
      >
        <el-card shadow="never">
          <template #header>
            <div class="flex items-center justify-between">
              <span class="text-md font-medium">
                <re-icon
                  icon="ep:data-line"
                  class="mr-2"
                  style="vertical-align: middle"
                />
                最近7天使用情况
              </span>
            </div>
          </template>
          <TeacherStudentUsage />
        </el-card>
      </re-col>

      <re-col
        v-motion
        class="mb-[18px]"
          :value="12"
          :md="12"
          :sm="24"
        :xs="24"
        :initial="{
          opacity: 0,
          y: 100
        }"
        :enter="{
          opacity: 1,
          y: 0,
          transition: {
              delay: 150
          }
        }"
      >
          <el-card shadow="never">
            <template #header>
              <div class="flex items-center justify-between">
                <span class="text-md font-medium">
                  <re-icon
                    icon="ep:data-analysis"
                    class="mr-2"
                    style="vertical-align: middle"
                  />
                  一周内使用总情况
                </span>
              </div>
            </template>
            <WeekUsage />
          </el-card>
      </re-col>
      </template>
      
      <!-- 教学效率指数图表（所有用户可见） -->
      <re-col
        v-motion
        class="mb-[18px]"
        :value="24"
        :md="24"
        :sm="24"
        :xs="24"
        :initial="{
          opacity: 0,
          y: 100
        }"
        :enter="{
          opacity: 1,
          y: 0,
          transition: {
            delay: 180
          }
        }"
      >
        <el-card shadow="never">
          <template #header>
            <div class="flex items-center justify-between">
              <span class="text-md font-medium">
                <re-icon
                  icon="ep:trend-charts"
                  class="mr-2"
                  style="vertical-align: middle"
                />
                教学效率指数
              </span>
            </div>
          </template>
          <EfficientIndex />
        </el-card>
      </re-col>

      <!-- 所有用户(包括教师)都可以看到课程统计 -->
      <re-col
        v-motion
        class="mb-[18px]"
        :value="24"
        :md="24"
        :sm="24"
        :xs="24"
        :initial="{
          opacity: 0,
          y: 100
        }"
        :enter="{
          opacity: 1,
          y: 0,
          transition: {
            delay: 200
          }
        }"
      >
        <el-card shadow="never">
          <template #header>
            <div class="flex items-center justify-between">
              <span class="text-md font-medium">
                <re-icon
                  icon="ep:reading"
                  class="mr-2"
                  style="vertical-align: middle"
                />
                课程统计
              </span>
            </div>
          </template>
          <CourseStatistics />
        </el-card>
      </re-col>
    </el-row>
  </div>
</template>

<style lang="scss" scoped>
.welcome-card {
  border: none;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 24px;
}

.welcome-banner {
  height: 200px;
  background-image: url("@/assets/kecheng.jpg");
  background-size: cover;
  background-position: center;
  position: relative;
  display: flex;
  align-items: center;
  padding: 0 40px;
  color: #fff;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.4);
    z-index: 1;
  }
}

.welcome-text {
  position: relative;
  z-index: 2;
}

.welcome-title {
  font-size: 2.5rem;
  font-weight: 600;
  margin: 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.welcome-subtitle {
  font-size: 1.2rem;
  margin-top: 10px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

:deep(.el-card) {
  transition: all 0.3s;
  border-radius: 8px;
  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--el-box-shadow-light);
  }
}

.mt-4 {
  margin-top: 1rem;
}
</style>
