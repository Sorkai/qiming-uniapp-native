<template>
  <div class="homework-detail-container" :class="currentTheme">
    <!-- 头部 -->
    <div class="header" :class="currentTheme">
      <div class="header-content">
        <div class="back-btn" @click="goBack">
          <el-icon><ArrowLeft /></el-icon> 返回
        </div>
        <div class="title">作业</div>
        <div class="placeholder" />
      </div>
    </div>

    <!-- 主体内容 -->
    <div class="main-content" :class="currentTheme">
      <el-card v-loading="loading">
        <template #header>
          <div class="card-header">
            <h3>{{ homework.title }}</h3>
            <div class="meta-info">
              <span>总题数：{{ homework.questionCount }} 题</span>
              <span>总分值：{{ homework.totalScore }} 分</span>
              <span>截止日期：{{ formatDate(homework.deadline) }}</span>
            </div>
          </div>
        </template>

        <div v-if="!loading" class="questions-container">
          <!-- 作业描述 -->
          <div v-if="homework.description" class="description">
            <div class="label">作业说明：</div>
            <div class="content">{{ homework.description }}</div>
          </div>

          <!-- 问题列表 -->
          <div
            v-if="homework.questions && homework.questions.length > 0"
            class="questions-list"
          >
            <div
              v-for="(question, index) in homework.questions"
              :key="question.questionId"
              class="question-item"
              :class="{ dark: currentTheme === 'dark' }"
            >
              <div class="question-header">
                <div class="question-title">
                  <span class="question-number">{{ index + 1 }}.</span>
                  <span>{{ question.title }}</span>
                  <span class="question-type">{{
                    getQuestionType(question.type)
                  }}</span>
                  <span class="question-score">{{ question.score }} 分</span>
                </div>
              </div>

              <div class="question-content" v-html="question.content" />

              <!-- 选项 - 单选题 -->
              <div v-if="question.type === 1" class="options">
                <el-radio-group v-model="answers[question.questionId]">
                  <el-radio
                    v-for="option in question.options"
                    :key="option.optionId"
                    :label="option.optionId"
                    :disabled="submitting"
                  >
                    {{ option.optionId }}. {{ option.content }}
                  </el-radio>
                </el-radio-group>
              </div>

              <!-- 选项 - 多选题 -->
              <div v-else-if="question.type === 2" class="options">
                <el-checkbox-group v-model="answers[question.questionId]">
                  <el-checkbox
                    v-for="option in question.options"
                    :key="option.optionId"
                    :label="option.optionId"
                    :disabled="submitting"
                  >
                    {{ option.optionId }}. {{ option.content }}
                  </el-checkbox>
                </el-checkbox-group>
              </div>

              <!-- 判断题 -->
              <div v-else-if="question.type === 3" class="options">
                <el-radio-group v-model="answers[question.questionId]">
                  <el-radio label="1" :disabled="submitting">正确</el-radio>
                  <el-radio label="0" :disabled="submitting">错误</el-radio>
                </el-radio-group>
              </div>

              <!-- 填空题 -->
              <div v-else-if="question.type === 4" class="options">
                <el-input
                  v-model="answers[question.questionId]"
                  type="text"
                  placeholder="请输入答案"
                  :disabled="submitting"
                />
              </div>

              <!-- 简答题 -->
              <div v-else-if="question.type === 5" class="options">
                <el-input
                  v-model="answers[question.questionId]"
                  type="textarea"
                  :rows="4"
                  placeholder="请输入答案"
                  :disabled="submitting"
                />
              </div>

              <!-- 代码题 -->
              <div v-else-if="question.type === 6" class="options">
                <el-input
                  v-model="answers[question.questionId]"
                  type="textarea"
                  :rows="6"
                  placeholder="请输入代码答案"
                  :disabled="submitting"
                />
              </div>
            </div>
          </div>

          <!-- 提交按钮 -->
          <div class="submit-container">
            <el-button
              type="primary"
              size="large"
              :loading="submitting"
              @click="submitHomework"
            >
              提交作业
            </el-button>
          </div>
        </div>

        <el-empty
          v-else-if="!loading && !homework"
          description="未找到作业或作业已过期"
        />
      </el-card>
    </div>

    <!-- 提交结果弹窗 -->
    <el-dialog
      v-model="showResultDialog"
      :title="resultDialogTitle"
      width="400px"
    >
      <div class="result-content">
        <div v-if="submissionResult" class="score-info">
          <div class="score">{{ submissionResult.score }}</div>
          <div class="total-score">/ {{ submissionResult.totalScore }}</div>
        </div>
        <div class="result-message">{{ resultDialogMessage }}</div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="goBack">返回课程</el-button>
          <el-button type="primary" @click="showResultDialog = false"
            >确定</el-button
          >
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import { ArrowLeft } from "@element-plus/icons-vue";
import dayjs from "dayjs";
import {
  getHomeworkDetail,
  submitHomeworkAnswers,
  type HomeworkDetailResult,
  type HomeworkAnswerResult
} from "@/api/frontend/work";

const route = useRoute();
const router = useRouter();
const currentTheme = ref("light"); // 保留变量但不提供切换功能

// 作业相关数据
const loading = ref(true);
const submitting = ref(false);
const homework = ref<HomeworkDetailResult>({} as HomeworkDetailResult);
const answers = reactive<Record<number, string | string[]>>({});

// 提交结果相关
const showResultDialog = ref(false);
const resultDialogTitle = ref("作业提交结果");
const resultDialogMessage = ref("");
const submissionResult = ref<HomeworkAnswerResult | null>(null);

// 获取作业详情
const fetchHomeworkDetail = async () => {
  try {
    loading.value = true;
    const homeworkId = Number(route.query.homeworkId);
    const courseId = Number(route.query.courseId);

    if (!homeworkId || !courseId) {
      ElMessage.error("参数错误");
      router.back();
      return;
    }

    const response = await getHomeworkDetail({
      homeworkId,
      courseId
    });

    if (response.code === 200 && response.data) {
      // 适配返回的数据结构
      homework.value = {
        homeworkId: response.data.homeworkId,
        title: response.data.title,
        description: response.data.description,
        questionCount: response.data.questionNum,
        totalScore: response.data.totalPoints,
        deadline: response.data.dueDate,
        questions: response.data.questionList
          .map(item => {
            // 处理选项，将JSON字符串解析为数组
            let options = [];
            if (item.options && item.options !== "null") {
              try {
                options = JSON.parse(item.options).map((opt, index) => {
                  return {
                    optionId: String.fromCharCode(65 + index), // 使用A, B, C, D作为选项ID
                    content: opt
                  };
                });
              } catch (e) {
                console.error("解析选项出错", e);
              }
            }

            return {
              questionId: item.questionId,
              title: item.title,
              content: item.stem || item.title,
              type: item.questionType,
              score: item.points,
              options,
              sortOrder: item.sortOrder
            };
          })
          .sort((a, b) => a.sortOrder - b.sortOrder) // 根据sortOrder排序
      };
    } else {
      ElMessage.error(response.msg || "获取作业详情失败");
    }
  } catch (error) {
    console.error("获取作业详情失败", error);
    ElMessage.error("获取作业详情失败");
  } finally {
    loading.value = false;
  }
};

// 提交作业
const submitHomework = async () => {
  try {
    // 确认提交
    await ElMessageBox.confirm("确认提交作业吗？提交后将不可修改", "提交确认", {
      confirmButtonText: "确认提交",
      cancelButtonText: "取消",
      type: "warning"
    });

    submitting.value = true;

    // 处理答案格式
    const formattedAnswers = [];
    for (const questionId in answers) {
      const answer = answers[questionId];
      let formattedAnswer = "";

      // 如果是代码题，添加语言信息
      if (
        homework.value.questions.find(q => q.questionId === Number(questionId))
          ?.type === 6
      ) {
        formattedAnswer = Array.isArray(answer)
          ? answer.join("")
          : answer?.toString() || "";
      } else {
        // 如果是多选题，需要将数组转换为字符串
        formattedAnswer = Array.isArray(answer)
          ? answer.join(",")
          : answer?.toString() || "";
      }

      formattedAnswers.push({
        questionId: Number(questionId),
        answer: formattedAnswer
      });
    }

    const homeworkId = Number(route.query.homeworkId);
    const courseId = Number(route.query.courseId);

    try {
      const response = await submitHomeworkAnswers({
        homeworkId,
        courseId,
        answers: formattedAnswers
      });

      if (response.code === 0 || response.code === 200) {
        submissionResult.value = {
          score: response.data.score,
          totalScore: homework.value.totalScore
        };
        resultDialogTitle.value = "作业提交成功";
        resultDialogMessage.value = `您的得分为 ${response.data.score}/${homework.value.totalScore}`;
        showResultDialog.value = true;
      } else {
        ElMessage.error(response.msg || "提交作业失败");
      }
    } catch (error: any) {
      // 捕获网络请求错误
      if (error.response && error.response.data && error.response.data.msg) {
        // 直接使用后端返回的错误信息
        ElMessage.error(error.response.data.msg);
      } else {
        ElMessage.error("提交作业失败");
      }
    }
  } catch (error: any) {
    if (error === "cancel") return;
    console.error("提交作业失败", error);
    ElMessage.error("操作取消");
  } finally {
    submitting.value = false;
  }
};

// 获取题目类型文本
const getQuestionType = (type: number): string => {
  const typeMap = {
    1: "单选题",
    2: "多选题",
    3: "判断题",
    4: "填空题",
    5: "简答题",
    6: "代码题"
  };
  return typeMap[type] || "未知题型";
};

// 格式化日期
const formatDate = (dateStr: string): string => {
  if (!dateStr) return "-";
  return dayjs(dateStr).format("YYYY-MM-DD HH:mm:ss");
};

// 返回上一页
const goBack = () => {
  router.back();
};

onMounted(() => {
  fetchHomeworkDetail();
});
</script>

<style lang="scss" scoped>
.homework-detail-container {
  min-height: 100vh;
  padding: 70px 0 30px;
  background-color: #f5f7fa;
  transition: background-color 0.3s;

  &.dark {
    background-color: #1a1a1a;
    color: #e0e0e0;
  }

  .header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 60px;
    background-color: #fff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    z-index: 1000;
    transition: background-color 0.3s;

    &.dark {
      background-color: #252525;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    }

    .header-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 100%;
      padding: 0 20px;
      max-width: 1200px;
      margin: 0 auto;

      .back-btn {
        display: flex;
        align-items: center;
        cursor: pointer;
        font-size: 14px;
        min-width: 60px;

        .el-icon {
          margin-right: 5px;
        }
      }

      .title {
        font-size: 18px;
        font-weight: bold;
        flex: 1;
        text-align: center;
      }

      .placeholder {
        min-width: 60px;
      }
    }
  }

  .main-content {
    max-width: 1000px;
    margin: 0 auto;
    padding: 0 20px;

    &.dark {
      .el-card {
        background-color: #252525;
        color: #e0e0e0;
        border: 1px solid #333;
      }
    }

    .card-header {
      h3 {
        margin: 0;
        margin-bottom: 10px;
        text-align: center;
      }

      .meta-info {
        display: flex;
        flex-wrap: wrap;
        gap: 15px;
        font-size: 14px;
        color: #666;
        justify-content: center;
      }
    }

    .questions-container {
      .description {
        margin-bottom: 20px;
        padding: 15px;
        background-color: #f8f9fa;
        border-radius: 4px;

        .label {
          font-weight: bold;
          margin-bottom: 10px;
        }

        .content {
          white-space: pre-wrap;
        }

        .dark & {
          background-color: #333;
        }
      }

      .questions-list {
        .question-item {
          margin-bottom: 30px;
          padding: 20px;
          border-radius: 6px;
          background-color: #fff;
          box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);

          &.dark {
            background-color: #333;
            box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.15);
          }

          .question-header {
            margin-bottom: 15px;

            .question-title {
              display: flex;
              align-items: center;
              font-size: 16px;
              font-weight: bold;

              .question-number {
                margin-right: 8px;
              }

              .question-type,
              .question-score {
                margin-left: 10px;
                font-size: 14px;
                color: #606266;
                font-weight: normal;
              }
            }
          }

          .question-content {
            margin-bottom: 15px;
            line-height: 1.6;
          }

          .options {
            margin-top: 15px;
          }
        }
      }

      .submit-container {
        display: flex;
        justify-content: center;
        margin-top: 40px;
      }
    }
  }
}

.result-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0;

  .score-info {
    display: flex;
    align-items: baseline;
    margin-bottom: 20px;

    .score {
      font-size: 36px;
      font-weight: bold;
      color: #409eff;
    }

    .total-score {
      font-size: 18px;
      color: #606266;
      margin-left: 5px;
    }
  }

  .result-message {
    font-size: 16px;
    text-align: center;
  }
}
</style>
