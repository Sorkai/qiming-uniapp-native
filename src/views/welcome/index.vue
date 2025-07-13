<script setup lang="ts">
import { ref } from "vue";
import ReCol from "@/components/ReCol";
import { useDark } from "./utils";
import { 
  TeacherStudentUsage,
  WeekUsage, 
  CourseStatistics
} from "./components/charts";
import { isAdmin } from "@/utils/auth";

defineOptions({
  name: "Welcome"
});

const { isDark } = useDark();

// 判断当前用户是否是管理员
const isAdminUser = ref(isAdmin());
</script>

<template>
  <div>
    <!-- 统计API图表部分 -->
    <el-row :gutter="24" justify="space-around">
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
          <div class="flex justify-between">
                <span class="text-md font-medium">最近7天使用情况</span>
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
          <div class="flex justify-between">
                <span class="text-md font-medium">一周内使用总情况</span>
          </div>
            </template>
            <WeekUsage />
        </el-card>
      </re-col>
      </template>

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
          <div class="flex justify-between">
              <span class="text-md font-medium">课程统计</span>
          </div>
          </template>
          <CourseStatistics />
        </el-card>
      </re-col>
    </el-row>
  </div>
</template>

<style lang="scss" scoped>
:deep(.el-card) {
  transition: all 0.3s;
  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--el-box-shadow-light);
  }
}
</style>
