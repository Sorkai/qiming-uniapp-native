<template>
  <!-- 作业考试 -->
  <div
    v-show="visible"
    data-v-2cf49992=""
    class="homework-exam-wrapper"
    :class="currentTheme"
  >
    <!-- 头部 -->
    <CourseHeader
      :current-theme="currentTheme"
      title="作业考试"
      :user-avatar="userAvatar"
      :user-nickname="userNickname"
      @go-back="$emit('go-back')"
      @toggle-theme="$emit('toggle-theme')"
      @go-to-account="$emit('go-to-account')"
      @logout="$emit('logout')"
    />

    <!-- 内容 -->
    <div class="homework-container" :class="currentTheme">
      <el-tabs v-model="homeworkExamTab" class="homework-tabs">
        <el-tab-pane label="作业" name="homework">
          <div
            v-if="homeworkList && homeworkList.length > 0"
            class="homework-list"
          >
            <div
              v-for="(item, index) in homeworkList"
              :key="index"
              class="homework-item"
              :class="{ dark: currentTheme === 'dark' }"
              @click="viewHomework(item)"
            >
              <div class="homework-icon">
                <img :src="logo" alt="作业" />
              </div>
              <div class="homework-info">
                <div class="homework-title">{{ item.title }}</div>
                <div class="homework-meta">
                  <span>题目数量: {{ item.questionNum }}</span>
                  <span>总分: {{ item.totalPoints }}</span>
                  <span>截止日期: {{ formatDate(item.dueDate) }}</span>
                </div>
              </div>
              <div class="homework-status">
                <el-tag
                  :type="getHomeworkStatusType(item.status)"
                  effect="plain"
                >
                  {{ getHomeworkStatusText(item.status) }}
                </el-tag>
              </div>
              <div class="homework-action">
                <el-button size="small" type="primary">查看</el-button>
              </div>
            </div>
          </div>
          <el-empty v-else description="暂无作业">
            <template #image>
              <img :src="homeworkEmptyImg" alt="暂无作业" style="width: 120px; height: 120px;" />
            </template>
          </el-empty>
        </el-tab-pane>
        <el-tab-pane label="考试" name="exam">
          <div v-if="examList && examList.length > 0" class="exam-list">
            <div
              v-for="(item, index) in examList"
              :key="index"
              class="exam-item"
              :class="{ dark: currentTheme === 'dark' }"
              @click="viewExam(item)"
            >
              <div class="exam-icon">
                <img :src="logo" alt="考试" />
              </div>
              <div class="exam-info">
                <div class="exam-title">{{ item.title }}</div>
                <div class="exam-meta">
                  <span>题目数量: {{ item.questionNum }}</span>
                  <span>总分: {{ item.totalPoints }}</span>
                  <span>时间限制: {{ item.timeLimit }}分钟</span>
                  <span
                    >开始时间: {{ formatDate(item.availableFrom) }}</span
                  >
                  <span
                    >结束时间: {{ formatDate(item.availableTo) }}</span
                  >
                </div>
              </div>
              <div class="exam-status">
                <el-tag
                  :type="getExamStatusType(item.status)"
                  effect="plain"
                >
                  {{ getExamStatusText(item.status) }}
                </el-tag>
              </div>
              <div class="exam-action">
                <el-button size="small" type="primary">查看</el-button>
              </div>
            </div>
          </div>
          <el-empty v-else description="暂无考试" />
        </el-tab-pane>
        <!-- 随练标签页：嵌入新版随练组件 -->
        <el-tab-pane label="随练" name="practice">
          <WrongExercise :embedded="true" :course-id="courseId" />
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import CourseHeader from "./CourseHeader.vue";
import WrongExercise from "@/views/account/wrong-exercise.vue";
import logo from "@/assets/kecheng.jpg";
import homeworkEmptyImg from "@/assets/new-release/homework-svgrepo-com.svg?url";

// Props
const props = defineProps<{
  visible: boolean;
  currentTheme: string;
  courseId: number;
  homeworkList: any[];
  examList: any[];
  userAvatar: string;
  userNickname: string;
}>();

// Emits
defineEmits<{
  (e: "go-back"): void;
  (e: "toggle-theme"): void;
  (e: "go-to-account"): void;
  (e: "logout"): void;
}>();

const router = useRouter();
const homeworkExamTab = ref("homework");

// 格式化日期
const formatDate = (dateString: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
};

// 获取作业状态类型
const getHomeworkStatusType = (status: number) => {
  const typeMap: Record<number, "info" | "warning" | "success" | "danger" | "primary"> = {
    1: "info", // 未开始
    2: "warning", // 进行中
    3: "success", // 已完成
    4: "danger" // 已过期
  };
  return typeMap[status] || "info";
};

// 获取作业状态文本
const getHomeworkStatusText = (status: number) => {
  const textMap: Record<number, string> = {
    1: "未开始",
    2: "进行中",
    3: "已完成",
    4: "已过期"
  };
  return textMap[status] || "未知状态";
};

// 获取考试状态类型
const getExamStatusType = (status: number) => {
  const typeMap: Record<number, "info" | "warning" | "success" | "danger" | "primary"> = {
    1: "info", // 未开始
    2: "warning", // 进行中
    3: "success", // 已完成
    4: "danger" // 已过期
  };
  return typeMap[status] || "info";
};

// 获取考试状态文本
const getExamStatusText = (status: number) => {
  const textMap: Record<number, string> = {
    1: "未开始",
    2: "进行中",
    3: "已完成",
    4: "已过期"
  };
  return textMap[status] || "未知状态";
};

// 查看作业
const viewHomework = (homework: any) => {
  if (homework && homework.homeworkId) {
    if (homework.status === 2) {
      router.push({
        path: `/account/homework-detail`,
        query: {
          homeworkId: homework.homeworkId,
          courseId: props.courseId.toString()
        }
      });
    } else {
      ElMessage.warning(`${getHomeworkStatusText(homework.status)}状态的作业不可查看`);
    }
  }
};

// 查看考试
const viewExam = (exam: any) => {
  if (exam && exam.examId) {
    if (exam.status === 2) {
      router.push({
        path: `/account/exam-detail`,
        query: {
          examId: exam.examId,
          courseId: props.courseId.toString()
        }
      });
    } else {
      ElMessage.warning(`${getExamStatusText(exam.status)}状态的考试不可查看`);
    }
  }
};
</script>

<style scoped>
/* 作业考试相关样式 */
.homework-exam-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  background-color: #ffffff;
}

.homework-exam-wrapper.dark {
  background-color: #1a1a1a;
}

.homework-container {
  padding: 80px 20px 20px;
  width: 100%;
  height: 100%;
  overflow-y: auto;
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-sizing: border-box;
}

.homework-container.dark {
  background-color: #1a1a1a;
}

.homework-tabs {
  width: 90%;
  max-width: 1400px;
}

.homework-list,
.exam-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
  margin-top: 20px;
}

.homework-item,
.exam-item {
  display: flex;
  align-items: center;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 20px;
  background-color: #fff;
  transition: all 0.3s;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.homework-item.dark,
.exam-item.dark {
  background-color: #2a2a2a;
  border-color: #3e3e3e;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.homework-item:hover,
.exam-item:hover {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.homework-item.dark:hover,
.exam-item.dark:hover {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.3);
}

.homework-icon,
.exam-icon {
  flex-shrink: 0;
  margin-right: 15px;
}

.homework-icon img,
.exam-icon img {
  width: 50px;
  height: 50px;
  object-fit: contain;
}

.homework-info,
.exam-info {
  flex-grow: 1;
  overflow: hidden;
}

.homework-title,
.exam-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #303133;
}

.homework-item.dark .homework-title,
.exam-item.dark .exam-title {
  color: #e0e0e0;
}

.homework-meta,
.exam-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  font-size: 15px;
  color: #909399;
}

.homework-item.dark .homework-meta,
.exam-item.dark .exam-meta {
  color: #aaa;
}

.homework-status,
.exam-status {
  margin: 0 15px;
}

.homework-action,
.exam-action {
  flex-shrink: 0;
}

/* 标签页字体加大 */
:deep(.homework-tabs .el-tabs__item) {
  font-size: 18px;
  font-weight: 600;
}

/* 查看按钮加大 */
.material-action .el-button,
.homework-action .el-button,
.exam-action .el-button {
  font-size: 15px;
  padding: 10px 20px;
}

/* 状态标签加大 */
.homework-status .el-tag,
.exam-status .el-tag {
  font-size: 14px;
  padding: 6px 12px;
}

/* 浅色模式次要信息颜色优化 */
:deep(.light .homework-meta),
:deep(.light .exam-meta) {
  color: #409eff;
}

:deep(.light .homework-title),
:deep(.light .exam-title) {
  color: #1a1a1a;
  font-weight: bold;
}

/* 页面宽度全屏适配 */
.homework-container {
  padding-left: 2vw;
  padding-right: 2vw;
}

.homework-tabs {
  width: 100%;
  max-width: 100%;
}
</style>
