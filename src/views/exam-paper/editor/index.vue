<script setup lang="ts">
import { ref, reactive, computed, onMounted, onBeforeUnmount } from "vue";
import { useRouter, useRoute } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";

defineOptions({
  name: "ExamPaperEditor"
});

const router = useRouter();
const route = useRoute();

// 试卷ID（编辑模式）
const paperId = computed(() => route.params.id as string);
const isEditMode = computed(() => !!paperId.value);

// 试卷数据
const paper = reactive({
  title: "未命名试卷",
  description: "",
  courseId: null as number | null,
  timeLimit: 90,
  totalPoints: 0,
  totalQuestions: 0,
  questionGroups: [] as any[]
});

// 自动保存状态
const autoSaveStatus = ref<"idle" | "saving" | "saved" | "error">("idle");
const lastSaveTime = ref("");

// 当前选中的题目ID
const activeQuestionId = ref<number | null>(null);

// 展开的分组
const expandedGroups = ref<number[]>([]);

// 左侧大纲是否折叠
const outlineCollapsed = ref(false);

// 右侧面板是否折叠
const overviewCollapsed = ref(false);

// 题型定义
const questionTypes = [
  { value: 1, label: "单选题", icon: "CircleCheck", color: "#409eff" },
  { value: 2, label: "多选题", icon: "Select", color: "#67c23a" },
  { value: 3, label: "判断题", icon: "Check", color: "#e6a23c" },
  { value: 4, label: "填空题", icon: "EditPen", color: "#f56c6c" },
  { value: 5, label: "简答题", icon: "Document", color: "#909399" },
  { value: 6, label: "论述题", icon: "Notebook", color: "#9c27b0" },
  { value: 7, label: "矩阵单选", icon: "Grid", color: "#00bcd4" },
  { value: 8, label: "矩阵多选", icon: "Menu", color: "#ff9800" },
  { value: 9, label: "连线题", icon: "Connection", color: "#795548" },
  { value: 10, label: "排序题", icon: "Sort", color: "#607d8b" }
];

// 课程列表
const courseList = ref([
  { id: 1, name: "高等数学" },
  { id: 2, name: "线性代数" },
  { id: 3, name: "概率论" }
]);

// AI分析结果
const aiAnalysis = reactive({
  difficulty: 3,
  knowledgeCoverage: 75,
  typeBalance: 80,
  suggestions: [
    "建议增加填空题数量",
    "难度分布较为合理",
    "可以考虑添加综合应用题"
  ]
});

// 计算总题数和总分
const updateTotals = () => {
  let totalQuestions = 0;
  let totalPoints = 0;
  paper.questionGroups.forEach(group => {
    totalQuestions += group.questions.length;
    group.questions.forEach((q: any) => {
      totalPoints += Number(q.points) || 0;
    });
  });
  paper.totalQuestions = totalQuestions;
  paper.totalPoints = totalPoints;
};

// 添加题型分组
const addQuestionGroup = (type: number) => {
  const typeInfo = questionTypes.find(t => t.value === type);
  const groupId = Date.now();
  paper.questionGroups.push({
    groupId,
    groupName: `${getChineseNumber(paper.questionGroups.length + 1)}、${typeInfo?.label}`,
    questionType: type,
    questions: [],
    sortOrder: paper.questionGroups.length
  });
  expandedGroups.value.push(groupId);
};

// 添加题目到分组
const addQuestion = (groupId: number) => {
  const group = paper.questionGroups.find(g => g.groupId === groupId);
  if (group) {
    const questionId = Date.now();
    group.questions.push({
      questionId,
      questionType: group.questionType,
      stem: "",
      options:
        group.questionType <= 3
          ? [
              { key: "A", content: "" },
              { key: "B", content: "" },
              { key: "C", content: "" },
              { key: "D", content: "" }
            ]
          : [],
      correctAnswer: "",
      correctAnswers: [],
      points: 5,
      analysis: "",
      referenceAnswer: "",
      sortOrder: group.questions.length
    });
    activeQuestionId.value = questionId;
    updateTotals();
  }
};

// 删除题目
const deleteQuestion = (groupId: number, questionId: number) => {
  const group = paper.questionGroups.find(g => g.groupId === groupId);
  if (group) {
    const index = group.questions.findIndex(
      (q: any) => q.questionId === questionId
    );
    if (index !== -1) {
      group.questions.splice(index, 1);
      updateTotals();
    }
  }
};

// 删除分组
const deleteGroup = (groupId: number) => {
  const index = paper.questionGroups.findIndex(g => g.groupId === groupId);
  if (index !== -1) {
    paper.questionGroups.splice(index, 1);
    updateTotals();
  }
};

// 获取中文数字
const getChineseNumber = (num: number) => {
  const numbers = ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十"];
  return numbers[num - 1] || num.toString();
};

// 获取题型名称
const getTypeName = (type: number) => {
  return questionTypes.find(t => t.value === type)?.label || "未知题型";
};

// 获取题型颜色
const getTypeColor = (type: number) => {
  return questionTypes.find(t => t.value === type)?.color || "#909399";
};

// 滚动到题目
const scrollToQuestion = (questionId: number) => {
  activeQuestionId.value = questionId;
  const element = document.getElementById(`question-${questionId}`);
  if (element) {
    element.scrollIntoView({ behavior: "smooth", block: "center" });
  }
};

// 保存试卷
const savePaper = async () => {
  autoSaveStatus.value = "saving";
  try {
    await new Promise(resolve => setTimeout(resolve, 1000));
    autoSaveStatus.value = "saved";
    lastSaveTime.value = new Date().toLocaleTimeString();
    ElMessage.success("保存成功");
  } catch (error) {
    autoSaveStatus.value = "error";
    ElMessage.error("保存失败");
  }
};

// 预览试卷
const previewPaper = () => {
  ElMessage.info("预览功能开发中");
};

// 发布试卷
const publishPaper = () => {
  if (paperId.value) {
    router.push(`/exam-paper/publish/${paperId.value}`);
  } else {
    ElMessage.warning("请先保存试卷");
  }
};

// 返回
const goBack = () => {
  if (autoSaveStatus.value === "saving") {
    ElMessageBox.confirm("正在保存中，确定要离开吗？", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    }).then(() => {
      router.back();
    });
  } else {
    router.back();
  }
};

// 拖拽开始
const onDragStart = (event: DragEvent, type: number) => {
  event.dataTransfer?.setData("questionType", String(type));
};

// 拖拽放置
const onDrop = (event: DragEvent) => {
  event.preventDefault();
  const type = Number(event.dataTransfer?.getData("questionType"));
  if (type) {
    addQuestionGroup(type);
  }
};

// 拖拽悬停
const onDragOver = (event: DragEvent) => {
  event.preventDefault();
};

// 刷新AI分析
const refreshAIAnalysis = () => {
  ElMessage.info("AI分析刷新中...");
};

// 获取难度文本
const getDifficultyText = (level: number) => {
  const texts = ["", "简单", "较易", "中等", "较难", "困难"];
  return texts[level] || "未知";
};

// 键盘快捷键
const handleKeydown = (event: KeyboardEvent) => {
  if ((event.ctrlKey || event.metaKey) && event.key === "s") {
    event.preventDefault();
    savePaper();
  }
};

onMounted(() => {
  document.addEventListener("keydown", handleKeydown);
  if (isEditMode.value) {
    paper.title = "2024年春季期中考试";}
});

onBeforeUnmount(() => {
  document.removeEventListener("keydown", handleKeydown);
});
</script>

<template>
  <div class="exam-paper-editor">
    <div class="editor-header">
      <div class="header-left">
        <el-button text @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <el-divider direction="vertical" />
        <el-input
          v-model="paper.title"
          class="title-input"
          placeholder="请输入试卷标题"/>
      </div>
      <div class="header-center">
        <span class="save-status"><template v-if="autoSaveStatus === 'saving'">
            <el-icon class="is-loading"><Loading /></el-icon>
            保存中...
          </template>
          <template v-else-if="autoSaveStatus === 'saved'">
            <el-icon color="#67c23a"><CircleCheck /></el-icon>
            已保存 {{ lastSaveTime }}
          </template>
          <template v-else-if="autoSaveStatus === 'error'">
            <el-icon color="#f56c6c"><CircleClose /></el-icon>
            保存失败
          </template>
        </span></div>
      <div class="header-right">
        <el-button @click="previewPaper">
          <el-icon><View /></el-icon>
          预览
        </el-button>
        <el-button @click="savePaper">
          <el-icon><DocumentChecked /></el-icon>
          保存
        </el-button>
        <el-button type="primary" @click="publishPaper">
          <el-icon><Promotion /></el-icon>
          发布
        </el-button>
      </div>
    </div>

    <div class="question-toolbar">
      <div class="toolbar-label">题型工具栏（拖拽到下方添加）：</div>
      <div class="toolbar-items">
        <div
          v-for="type in questionTypes"
          :key="type.value"
          class="type-item"
          draggable="true"
          @dragstart="onDragStart($event, type.value)"
        >
          <div class="type-icon" :style="{ background: type.color }">
            <el-icon><component :is="type.icon" /></el-icon>
          </div>
          <span class="type-label">{{ type.label }}</span>
        </div>
      </div><div class="toolbar-actions">
        <el-button size="small" @click="refreshAIAnalysis">
          <el-icon><MagicStick /></el-icon>
          AI推荐
        </el-button>
      </div>
    </div>

    <div class="editor-main">
      <div class="editor-outline" :class="{ collapsed: outlineCollapsed }">
        <div class="outline-header">
          <span v-if="!outlineCollapsed">题目大纲</span>
          <el-button
            text
            size="small"
            @click="outlineCollapsed = !outlineCollapsed"
          >
            <el-icon>
              <component :is="outlineCollapsed ? 'Expand' : 'Fold'" />
            </el-icon>
          </el-button>
        </div>
        <div v-if="!outlineCollapsed" class="outline-content">
          <div
            v-for="group in paper.questionGroups"
            :key="group.groupId"
            class="outline-group"
          >
            <div
              class="group-header"
              @click="
                expandedGroups.includes(group.groupId)
                  ? expandedGroups.splice(
                      expandedGroups.indexOf(group.groupId),
                      1
                    )
                  : expandedGroups.push(group.groupId)
              "
            >
              <el-icon>
                <component
                  :is="
                    expandedGroups.includes(group.groupId)
                      ? 'ArrowDown'
                      : 'ArrowRight'
                  "
                />
              </el-icon>
              <span>{{ group.groupName }}</span><span class="group-count">{{ group.questions.length }}题</span>
            </div>
            <div
              v-show="expandedGroups.includes(group.groupId)"
              class="group-questions"
            >
              <div
                v-for="(question, index) in group.questions"
                :key="question.questionId"
                class="question-item"
                :class="{ active: activeQuestionId === question.questionId }"
                @click="scrollToQuestion(question.questionId)"
              >
                <span class="item-number">{{ index + 1 }}.</span>
                <span class="item-title">
                  {{
                    question.stem
                      ? question.stem.substring(0, 15) + "..."
                      : "未填写题目"
                  }}
                </span>
              </div>
            </div>
          </div>
          <div v-if="paper.questionGroups.length === 0" class="outline-empty">
            <el-empty description="暂无题目" :image-size="60" />
          </div>
        </div>
      </div>

      <div class="editor-content" @drop="onDrop" @dragover="onDragOver">
        <el-card class="paper-info-card" shadow="never">
          <el-form label-width="80px" size="small">
            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="所属课程">
                  <el-select
                    v-model="paper.courseId"
                    placeholder="选择课程"
                    style="width: 100%"
                  >
                    <el-option
                      v-for="course in courseList"
                      :key="course.id"
                      :label="course.name"
                      :value="course.id"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="考试时长">
                  <el-input-number
                    v-model="paper.timeLimit"
                    :min="10"
                    :max="300"
                    style="width: 100%"/>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="试卷说明">
                  <el-input v-model="paper.description" placeholder="可选" />
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </el-card>

        <div class="questions-container">
          <div
            v-for="group in paper.questionGroups"
            :key="group.groupId"
            class="question-group"
          >
            <div class="group-header-bar">
              <span
                class="group-type-tag"
                :style="{ background: getTypeColor(group.questionType) }"
              >
                {{ getTypeName(group.questionType) }}
              </span>
              <span class="group-title">{{ group.groupName }}</span>
              <span class="group-stats">
                共{{ group.questions.length }}题，
                {{
                  group.questions.reduce(
                    (sum: number, q: any) => sum + (Number(q.points) || 0),
                    0
                  )
                }}分
              </span>
              <div class="group-actions">
                <el-button
                  type="primary"
                  size="small"
                  @click="addQuestion(group.groupId)"
                >
                  <el-icon><Plus /></el-icon>
                  添加题目
                </el-button>
                <el-button
                  type="danger"
                  size="small"
                  text
                  @click="deleteGroup(group.groupId)"
                >
                  删除分组
                </el-button>
              </div>
            </div>

            <div
              v-for="(question, qIndex) in group.questions"
              :key="question.questionId"
              :id="`question-${question.questionId}`"
              class="question-card"
              :class="{ active: activeQuestionId === question.questionId }"
              @click="activeQuestionId = question.questionId"
            >
              <div class="question-header">
                <span class="question-number">{{ qIndex + 1 }}.</span>
                <span class="question-points">
                  <el-input-number
                    v-model="question.points"
                    :min="1"
                    :max="100"
                    size="small"
                    controls-position="right"
                    @change="updateTotals"
                  />分
                </span>
                <el-button
                  type="danger"
                  size="small"
                  text
                  @click.stop="deleteQuestion(group.groupId, question.questionId)"
                >
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>

              <div class="question-stem">
                <el-input
                  v-model="question.stem"
                  type="textarea"
                  placeholder="请输入题目内容"
                  :autosize="{ minRows: 2, maxRows: 6 }"
                />
              </div>

              <div
                v-if="[1, 2].includes(question.questionType)"
                class="question-options"
              >
                <div
                  v-for="option in question.options"
                  :key="option.key"
                  class="option-item"
                >
                  <span class="option-key">{{ option.key }}.</span>
                  <el-input
                    v-model="option.content"
                    placeholder="请输入选项内容"
                  />
                  <el-radio
                    v-if="question.questionType === 1"
                    v-model="question.correctAnswer"
                    :value="option.key"
                  >
                    正确
                  </el-radio>
                  <el-checkbox
                    v-if="question.questionType === 2"
                    v-model="question.correctAnswers"
                    :value="option.key"
                  >
                    正确
                  </el-checkbox>
                </div>
                <el-button
                  size="small"
                  text
                  @click="
                    question.options.push({
                      key: String.fromCharCode(65 + question.options.length),
                      content: ''
                    })
                  "
                >
                  + 添加选项
                </el-button>
              </div>

              <div v-if="question.questionType === 3" class="question-options">
                <el-radio-group v-model="question.correctAnswer">
                  <el-radio value="true">正确</el-radio>
                  <el-radio value="false">错误</el-radio>
                </el-radio-group>
              </div>

              <div
                v-if="[5, 6].includes(question.questionType)"
                class="question-reference"
              >
                <div class="reference-label">参考答案：</div>
                <el-input
                  v-model="question.referenceAnswer"
                  type="textarea"
                  placeholder="请输入参考答案":autosize="{ minRows: 2, maxRows: 4 }"
                />
              </div>

              <div class="question-analysis">
                <el-collapse>
                  <el-collapse-item title="答案解析（可选）">
                    <el-input
                      v-model="question.analysis"
                      type="textarea"
                      placeholder="请输入答案解析"
                      :autosize="{ minRows: 2, maxRows: 4 }"
                    />
                  </el-collapse-item>
                </el-collapse>
              </div>
            </div>

            <div v-if="group.questions.length === 0" class="group-empty">
              <el-button
                type="primary"
                text
                @click="addQuestion(group.groupId)"
              >
                <el-icon><Plus /></el-icon>
                添加第一道题目
              </el-button>
            </div>
          </div>

          <div v-if="paper.questionGroups.length === 0" class="content-empty">
            <el-empty description="从上方工具栏拖拽题型开始组卷">
              <el-button type="primary" @click="addQuestionGroup(1)">
                添加单选题
              </el-button>
            </el-empty>
          </div>
        </div>
      </div>

      <div class="editor-overview" :class="{ collapsed: overviewCollapsed }">
        <div class="overview-header">
          <el-button
            text
            size="small"
            @click="overviewCollapsed = !overviewCollapsed"
          >
            <el-icon>
              <component :is="overviewCollapsed ? 'Fold' : 'Expand'" />
            </el-icon></el-button>
          <span v-if="!overviewCollapsed">试卷总览</span>
        </div>
        <div v-if="!overviewCollapsed" class="overview-content">
          <div class="overview-stats">
            <div class="stat-item">
              <span class="stat-label">总题数</span>
              <span class="stat-value">{{ paper.totalQuestions }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">总分</span>
              <span class="stat-value">{{ paper.totalPoints }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">时长</span>
              <span class="stat-value">{{ paper.timeLimit }}分钟</span>
            </div>
          </div>

          <div class="ai-analysis">
            <div class="analysis-header">
              <el-icon><MagicStick /></el-icon>
              <span>AI分析</span>
              <el-button text size="small" @click="refreshAIAnalysis">
                刷新
              </el-button>
            </div>
            <div class="analysis-item">
              <span class="item-label">难度评估</span>
              <el-rate v-model="aiAnalysis.difficulty" disabled /><span class="item-text">{{
                getDifficultyText(aiAnalysis.difficulty)
              }}</span>
            </div>
            <div class="analysis-item">
              <span class="item-label">知识点覆盖</span>
              <el-progress
                :percentage="aiAnalysis.knowledgeCoverage"
                :stroke-width="8"
              />
            </div>
            <div class="analysis-item">
              <span class="item-label">题型平衡度</span>
              <el-progress
                :percentage="aiAnalysis.typeBalance"
                :stroke-width="8"
                status="success"
              />
            </div>
            <div class="analysis-suggestions">
              <div class="suggestions-title">改进建议：</div>
              <ul class="suggestions-list">
                <li v-for="(s, i) in aiAnalysis.suggestions" :key="i">
                  {{ s }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.exam-paper-editor {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f5f7fa;
}

.editor-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 56px;
  padding: 0 20px;
  background: #fff;
  border-bottom: 1px solid #ebeef5;

  .header-left {
    display: flex;
    align-items: center;

    .title-input {
      width: 300px;
      margin-left: 12px;

      :deep(.el-input__wrapper) {
        box-shadow: none;
        font-size: 18px;
        font-weight: 600;
      }
    }
  }

  .header-center {
    .save-status {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 13px;
      color: #909399;
    }
  }

  .header-right {
    display: flex;
    gap: 8px;}
}

.question-toolbar {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 20px;
  background: #fff;
  border-bottom: 1px solid #ebeef5;

  .toolbar-label {
    font-size: 13px;
    color: #606266;
    white-space: nowrap;
  }

  .toolbar-items {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    flex: 1;
  }

  .type-item {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    background: #f5f7fa;
    border-radius: 4px;
    cursor: grab;
    transition: all 0.3s;

    &:hover {
      background: #ecf5ff;
      transform: translateY(-2px);
    }

    &:active {
      cursor: grabbing;
    }

    .type-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      color: #fff;
      border-radius: 4px;font-size: 14px;
    }

    .type-label {
      font-size: 13px;
      color: #606266;
    }
  }

  .toolbar-actions {
    flex-shrink: 0;
  }
}

.editor-main {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.editor-outline {
  width: 240px;
  background: #fff;
  border-right: 1px solid #ebeef5;
  transition: width 0.3s;overflow: hidden;

  &.collapsed {
    width: 48px;
  }

  .outline-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px;
    border-bottom: 1px solid #ebeef5;
    font-weight: 600;
  }

  .outline-content {
    padding: 12px;
    overflow-y: auto;
    height: calc(100% - 48px);
  }

  .outline-group {
    margin-bottom: 8px;

    .group-header {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px;
      cursor: pointer;
      border-radius: 4px;

      &:hover {
        background: #f5f7fa;
      }

      .group-count {
        margin-left: auto;
        font-size: 12px;
        color: #909399;
      }
    }

    .group-questions {
      padding-left: 24px;
    }

    .question-item {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 6px 8px;
      cursor: pointer;
      border-radius: 4px;
      font-size: 13px;

      &:hover {
        background: #f5f7fa;
      }

      &.active {
        background: #ecf5ff;
        color: #409eff;
      }

      .item-number {
        color: #909399;
      }

      .item-title {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
  }

  .outline-empty {
    padding: 20px;
  }
}

.editor-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;

  .paper-info-card {
    margin-bottom: 20px;}

  .questions-container {
    .question-group {
      margin-bottom: 24px;

      .group-header-bar {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 16px;
        background: #fafafa;
        border-radius: 8px 8px 0 0;
        border: 1px solid #ebeef5;border-bottom: none;

        .group-type-tag