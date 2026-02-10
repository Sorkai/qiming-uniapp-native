<script setup lang="ts">
import {
  ref,
  reactive,
  computed,
  onMounted,
  onBeforeUnmount,
  watch
} from "vue";
import { useRouter, useRoute } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import { onBeforeRouteLeave } from "vue-router";
import draggable from "vuedraggable";

defineOptions({
  name: "ExamPaperEditor"
});

// 自定义SVG图标组件
const LogoIcon = {
  template: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L2 7l10 5 10-5-10-5z" fill="#00bfa5"/>
    <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="#00bfa5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`
};

const RadioIcon = {
  template: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <circle cx="12" cy="12" r="9"/>
    <circle cx="12" cy="12" r="4" fill="currentColor"/>
  </svg>`
};

const CheckboxIcon = {
  template: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <rect x="3" y="3" width="18" height="18" rx="2"/>
    <path d="M9 12l2 2 4-4" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`
};

const InputIcon = {
  template: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <rect x="3" y="6" width="18" height="12" rx="2"/>
    <line x1="7" y1="12" x2="17" y2="12"/>
  </svg>`
};

const TextareaIcon = {
  template: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <rect x="3" y="3" width="18" height="18" rx="2"/>
    <line x1="7" y1="8" x2="17" y2="8"/>
    <line x1="7" y1="12" x2="17" y2="12"/>
    <line x1="7" y1="16" x2="13" y2="16"/>
  </svg>`
};

const JudgeIcon = {
  template: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <circle cx="12" cy="12" r="10"/>
    <path d="M8 12l3 3 5-6" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`
};

const DragIcon = {
  template: `<svg viewBox="0 0 24 24" fill="currentColor">
    <circle cx="9" cy="6" r="1.5"/>
    <circle cx="15" cy="6" r="1.5"/>
    <circle cx="9" cy="12" r="1.5"/>
    <circle cx="15" cy="12" r="1.5"/>
    <circle cx="9" cy="18" r="1.5"/>
    <circle cx="15" cy="18" r="1.5"/>
  </svg>`
};

// 图标映射
const iconComponents: Record<string, any> = {
  LogoIcon,
  RadioIcon,
  CheckboxIcon,
  InputIcon,
  TextareaIcon,
  JudgeIcon,
  DragIcon
};

const router = useRouter();
const route = useRoute();

// 试卷ID（编辑模式）
const paperId = computed(() => route.params.id as string);
const isEditMode = computed(() => !!paperId.value);

// 是否有未保存的更改
const hasUnsavedChanges = ref(false);

// 试卷数据 - 新建时为空白
const paper = reactive({
  title: "",
  description: "",
  courseId: null as number | null,
  timeLimit: 90,
  totalPoints: 0,
  totalQuestions: 0,
  questionGroups: [] as any[],
  settings: {
    shuffleQuestions: false,
    shuffleOptions: false,
    showScore: true,
    allowReview: true
  }
});

// 自动保存状态
const autoSaveStatus = ref<"idle" | "saving" | "saved" | "error">("idle");
const autoSaveSeconds = ref(30);
const autoSaveEnabled = ref(true);
let autoSaveCountdown: ReturnType<typeof setInterval> | null = null;

// 当前选中的题目
const activeQuestionId = ref<number | null>(null);

// 左侧大纲是否折叠
const outlineCollapsed = ref(false);

// 预览相关
const previewDialogVisible = ref(false);
const previewPaperSize = ref<"A4" | "A3">("A4");
const previewScale = ref(100);

// 题型定义
const questionTypes = [
  { id: "radio", label: "单选题", icon: "RadioIcon", color: "#00bfa5" },
  { id: "checkbox", label: "多选题", icon: "CheckboxIcon", color: "#00bfa5" },
  { id: "judge", label: "判断题", icon: "JudgeIcon", color: "#00bfa5" },
  { id: "input", label: "填空题", icon: "InputIcon", color: "#00bfa5" },
  { id: "textarea", label: "简答题", icon: "TextareaIcon", color: "#00bfa5" }
];

// 监听数据变化
watch(
  () => paper,
  () => {
    hasUnsavedChanges.value = true;
  },
  { deep: true }
);

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

// 获取全局题号
const getGlobalQuestionIndex = (groupIndex: number, questionIndex: number) => {
  let index = 0;
  for (let i = 0; i < groupIndex; i++) {
    index += paper.questionGroups[i].questions.length;
  }
  return index + questionIndex + 1;
};

// 添加题型分组
const addQuestionGroup = (typeId: string) => {
  const typeInfo = questionTypes.find(t => t.id === typeId);
  const groupId = Date.now();
  paper.questionGroups.push({
    groupId,
    groupName: typeInfo?.label || "题目组",
    questionType: typeId,
    questions: [],
    sortOrder: paper.questionGroups.length
  });
  addQuestion(groupId);
};

// 添加题目到分组
const addQuestion = (groupId: number) => {
  const group = paper.questionGroups.find(g => g.groupId === groupId);
  if (group) {
    const questionId = Date.now();
    const newQuestion: any = {
      questionId,
      questionType: group.questionType,
      stem: "",
      points: 5,
      analysis: "",
      sortOrder: group.questions.length
    };

    // 根据题型初始化选项和答案
    if (group.questionType === "radio") {
      newQuestion.options = [
        { key: "A", content: "" },
        { key: "B", content: "" },
        { key: "C", content: "" },
        { key: "D", content: "" }
      ];newQuestion.correctAnswer = "";
    } else if (group.questionType === "checkbox") {
      newQuestion.options = [
        { key: "A", content: "" },
        { key: "B", content: "" },
        { key: "C", content: "" },
        { key: "D", content: "" }
      ];
      newQuestion.correctAnswers = [];
    } else if (group.questionType === "judge") {
      newQuestion.options = [
        { key: "T", content: "正确" },
        { key: "F", content: "错误" }
      ];
      newQuestion.correctAnswer = "";
    } else if (group.questionType === "input") {
      newQuestion.blanks = [{ answer: "" }];
    } else if (group.questionType === "textarea") {
      newQuestion.referenceAnswer = "";
    }

    group.questions.push(newQuestion);activeQuestionId.value = questionId;
    updateTotals();
  }
};

// 删除题目
const deleteQuestion = (groupId: number, questionId: number) => {
  ElMessageBox.confirm("确定要删除这道题目吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(() => {
      const group = paper.questionGroups.find(g => g.groupId === groupId);
      if (group) {
        const index = group.questions.findIndex(
          (q: any) => q.questionId === questionId
        );
        if (index !== -1) {
          group.questions.splice(index, 1);
          if (activeQuestionId.value === questionId) {
            activeQuestionId.value = null;
          }
          updateTotals();ElMessage.success("删除成功");
        }
      }
    })
    .catch(() => {});
};

// 复制题目
const copyQuestion = (groupId: number, questionId: number) => {
  const group = paper.questionGroups.find(g => g.groupId === groupId);
  if (group) {
    const question = group.questions.find(
      (q: any) => q.questionId === questionId
    );
    if (question) {
      const newQuestion = JSON.parse(JSON.stringify(question));
      newQuestion.questionId = Date.now();
      newQuestion.sortOrder = group.questions.length;
      group.questions.push(newQuestion);
      activeQuestionId.value = newQuestion.questionId;
      updateTotals();
      ElMessage.success("复制成功");
    }
  }
};

// 添加选项
const addOption = (question: any) => {
  const keys = ["A", "B", "C", "D", "E", "F", "G", "H"];
  const nextKey =
    keys[question.options.length] || `选项${question.options.length + 1}`;
  question.options.push({ key: nextKey, content: "" });
};

// 删除选项
const removeOption = (question: any, index: number) => {
  if (question.options.length > 2) {
    question.options.splice(index, 1);const keys = ["A", "B", "C", "D", "E", "F", "G", "H"];
    question.options.forEach((opt: any, i: number) => {
      opt.key = keys[i] || `选项${i + 1}`;
    });
  } else {
    ElMessage.warning("至少保留两个选项");
  }
};

// 添加填空
const addBlank = (question: any) => {
  question.blanks.push({ answer: "" });
};

// 删除填空
const removeBlank = (question: any, index: number) => {
  if (question.blanks.length > 1) {
    question.blanks.splice(index, 1);
  } else {
    ElMessage.warning("至少保留一个填空");
  }
};

// 滚动到题目
const scrollToQuestion = (questionId: number) => {
  activeQuestionId.value = questionId;
  const element = document.getElementById(`question-${questionId}`);
  if (element) {
    element.scrollIntoView({ behavior: "smooth", block: "center" });
  }
};

// 大纲拖拽排序
const outlineQuestions = computed({
  get: () => {
    const questions: any[] = [];
    paper.questionGroups.forEach((group, groupIndex) => {
      group.questions.forEach((q: any, qIndex: number) => {
        questions.push({
          ...q,
          groupId: group.groupId,
          groupIndex,
          globalIndex: getGlobalQuestionIndex(groupIndex, qIndex)
        });
      });
    });
    return questions;
  },
  set: (newOrder: any[]) => {
    const groupMap = new Map<string, any[]>();
    newOrder.forEach(q => {
      const type = q.questionType;
      if (!groupMap.has(type)) {
        groupMap.set(type, []);
      }
      groupMap.get(type)!.push(q);
    });

    const newGroups: any[] = [];
    groupMap.forEach((questions, type) => {
      const typeInfo = questionTypes.find(t => t.id === type);
      newGroups.push({
        groupId: Date.now() + newGroups.length,
        groupName: typeInfo?.label || "题目组",
        questionType: type,
        questions: questions.map((q, i) => ({ ...q, sortOrder: i })),
        sortOrder: newGroups.length
      });
    });

    paper.questionGroups = newGroups;
    updateTotals();
  }
});

// 拖拽状态
const isDragging = ref(false);
const isDragOver = ref(false);

// 重置自动保存倒计时
const resetAutoSaveCountdown = () => {
  autoSaveSeconds.value = 30;
};

// 启动自动保存
const startAutoSave = () => {
  autoSaveCountdown = setInterval(() => {
    if (autoSaveEnabled.value && hasUnsavedChanges.value) {
      if (autoSaveSeconds.value > 0) {
        autoSaveSeconds.value--;
      }
      if (autoSaveSeconds.value <= 0) {
        savePaper(true);
        resetAutoSaveCountdown();
      }
    }
  }, 1000);
};

// 保存试卷
const savePaper = async (isAutoSave = false) => {
  if (!paper.title.trim()) {
    if (!isAutoSave) {
      ElMessage.warning("请输入试卷标题");
    }
    return;
  }

  autoSaveStatus.value = "saving";
  try {
    await new Promise(resolve => setTimeout(resolve, 500));
    autoSaveStatus.value = "saved";
    hasUnsavedChanges.value = false;
    resetAutoSaveCountdown();
    if (!isAutoSave) {
      ElMessage.success("保存成功");
    }
  } catch {
    autoSaveStatus.value = "error";
    if (!isAutoSave) {
      ElMessage.error("保存失败");
    }
  }
};

// 预览试卷
const previewPaper = () => {
  if (paper.questionGroups.length === 0) {
    ElMessage.warning("请先添加题目");
    return;
  }
  previewDialogVisible.value = true;
};

// 打印试卷
const printPaper = () => {
  window.print();
};

// 发布试卷
const publishPaper = () => {
  if (!paper.title.trim()) {
    ElMessage.warning("请输入试卷标题");
    return;
  }
  if (paper.questionGroups.length === 0) {
    ElMessage.warning("请至少添加一道题目");
    return;
  }
  ElMessageBox.confirm("确定要发布这份试卷吗？", "发布确认", {
    confirmButtonText: "确定发布",
    cancelButtonText: "取消",
    type: "info"
  })
    .then(() => {
      ElMessage.success("试卷发布成功！");
    })
    .catch(() => {});
};

// 返回
const goBack = () => {
  if (hasUnsavedChanges.value) {
    ElMessageBox.confirm("有未保存的更改，是否保存后再离开？", "提示", {
      confirmButtonText: "保存并离开",
      cancelButtonText: "不保存",
      distinguishCancelAndClose: true,
      type: "warning"
    })
      .then(() => {
        savePaper().then(() => {
          router.back();
        });
      })
      .catch(action => {
        if (action === "cancel") {
          router.back();
        }
      });
  } else {
    router.back();
  }
};

// 拖拽事件
const onDragStart = (event: DragEvent, typeId: string) => {
  if (event.dataTransfer) {
    event.dataTransfer.setData("text/plain", typeId);
    event.dataTransfer.effectAllowed = "copy";
  }
  isDragging.value = true;
};

const onDragEnd = () => {
  isDragging.value = false;
  isDragOver.value = false;
};

const onDrop = (event: DragEvent) => {
  event.preventDefault();
  event.stopPropagation();
  isDragOver.value = false;
  isDragging.value = false;

  const typeId = event.dataTransfer?.getData("text/plain");
  if (typeId) {
    addQuestionGroup(typeId);const typeName = questionTypes.find(t => t.id === typeId)?.label || "题目";
    ElMessage.success(`已添加${typeName}`);
  }
};

const onDragOver = (event: DragEvent) => {
  event.preventDefault();
  event.stopPropagation();
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = "copy";
  }
};

const onDragEnter = (event: DragEvent) => {
  event.preventDefault();
  isDragOver.value = true;
};

const onDragLeave = (event: DragEvent) => {
  event.preventDefault();
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
  const x = event.clientX;
  const y = event.clientY;
  if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
    isDragOver.value = false;
  }
};

// 键盘快捷键
const handleKeydown = (event: KeyboardEvent) => {
  if ((event.ctrlKey || event.metaKey) && event.key === "s") {
    event.preventDefault();
    savePaper();
  }
};

// 离开页面前确认
onBeforeRouteLeave((to, from, next) => {
  if (hasUnsavedChanges.value) {
    ElMessageBox.confirm("有未保存的更改，是否保存后再离开？", "提示", {
      confirmButtonText: "保存并离开",
      cancelButtonText: "不保存",
      distinguishCancelAndClose: true,
      type: "warning"
    })
      .then(() => {
        savePaper().then(() => next());
      })
      .catch(action => {
        if (action === "cancel") {
          next();
        } else {
          next(false);
        }
      });
  } else {
    next();
  }
});

onMounted(() => {
  document.addEventListener("keydown", handleKeydown);
  startAutoSave();

  if (isEditMode.value) {
    // TODO: 从API加载试卷数据
  }
});

onBeforeUnmount(() => {
  document.removeEventListener("keydown", handleKeydown);
  if (autoSaveCountdown) {
    clearInterval(autoSaveCountdown);
  }
});
</script>

<template>
  <div class="exam-paper-editor">
    <!--顶部固定区域 -->
    <div class="editor-fixed-top">
      <!--顶部导航 -->
      <div class="editor-header">
        <div class="header-left">
          <div class="logo" @click="goBack">
            <component :is="iconComponents.LogoIcon" class="logo-icon" />
            <span class="logo-text">启明在线组卷</span>
          </div>
        </div>
        <div class="header-center">
          <el-input
            v-model="paper.title"
            placeholder="请输入试卷标题"
            class="title-input"
            maxlength="100"
          />
        </div>
        <div class="header-right">
          <span class="auto-save-status"><template v-if="autoSaveEnabled && hasUnsavedChanges">
              <el-icon v-if="autoSaveStatus === 'saving'" class="is-loading">
                <Loading />
              </el-icon>
              <span v-else>{{ autoSaveSeconds }}秒后自动保存</span>
            </template>
            <template v-else-if="autoSaveStatus === 'saved'">
              <el-icon><Check /></el-icon>
              已保存
            </template></span>
          <el-button @click="previewPaper">
            <el-icon><View /></el-icon>
            预览
          </el-button>
          <el-button @click="savePaper()">
            <el-icon><DocumentChecked /></el-icon>
            保存
          </el-button>
          <el-button type="primary" @click="publishPaper">
            <el-icon><Promotion /></el-icon>
            发布
          </el-button>
        </div>
      </div>

      <!-- 工具栏 -->
      <div class="question-toolbar">
        <div class="toolbar-hint">拖拽或点击下方题型添加到试卷：</div>
        <div class="toolbar-items">
          <div
            v-for="type in questionTypes"
            :key="type.id"
            class="type-item"
            draggable="true"
            @dragstart="onDragStart($event, type.id)"
            @dragend="onDragEnd"
            @click="addQuestionGroup(type.id)"
          >
            <div class="type-icon-wrapper">
              <component :is="iconComponents[type.icon]" class="type-icon" />
            </div>
            <span class="type-label">{{ type.label }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 预览对话框 -->
    <el-dialog
      v-model="previewDialogVisible"
      title="试卷预览"
      width="90%"
      fullscreen
      class="preview-dialog"
    >
      <template #header>
        <div class="preview-header">
          <span class="preview-title">试卷预览</span>
          <div class="preview-controls">
            <el-radio-group v-model="previewPaperSize" size="small">
              <el-radio-button value="A4">A4</el-radio-button>
              <el-radio-button value="A3">A3</el-radio-button>
            </el-radio-group>
            <div class="scale-control">
              <span>缩放：</span>
              <el-slider
                v-model="previewScale"
                :min="50"
                :max="150"
                :step="10"
                :format-tooltip="(val: number) => `${val}%`"
                style="width: 120px"
              />
              <span>{{ previewScale }}%</span>
            </div>
            <el-button type="primary" size="small" @click="printPaper">
              <el-icon><Printer /></el-icon>
              打印
            </el-button>
          </div>
        </div>
      </template>
      <div class="preview-content">
        <div
          class="preview-paper"
          :class="[`paper-${previewPaperSize.toLowerCase()}`]"
          :style="{ transform: `scale(${previewScale / 100})` }"
        >
          <h1class="preview-paper-title">{{ paper.title || "未命名试卷" }}</h1>
          <p v-if="paper.description" class="preview-paper-desc">
            {{ paper.description }}
          </p>
          <div class="preview-paper-info">
            <span>总分：{{ paper.totalPoints }} 分</span>
            <span>题目数：{{ paper.totalQuestions }} 题</span>
          </div>
          <div class="preview-questions">
            <template
              v-for="(group, groupIndex) in paper.questionGroups"
              :key="group.groupId"
            >
              <div
                v-for="(question, qIndex) in group.questions"
                :key="question.questionId"
                class="preview-question"
              >
                <div class="preview-question-header">
                  <span class="preview-question-index">
                    {{ getGlobalQuestionIndex(groupIndex, qIndex) }}.
                  </span>
                  <span class="preview-question-type">[{{ group.groupName }}]</span
                  >
                  <span class="preview-question-points">
                    ({{ question.points }}分)
                  </span>
                </div>
                <div class="preview-question-stem">
                  {{ question.stem || "未填写题目" }}
                </div>
                <div
                  v-if="question.options && question.options.length > 0"
                  class="preview-question-options"
                >
                  <div
                    v-for="option in question.options"
                    :key="option.key"
                    class="preview-option"
                  >
                    {{ option.key }}. {{ option.content }}
                  </div>
                </div>
                <div
                  v-if="question.questionType === 'input'"
                  class="preview-blanks"
                >
                  <span
                    v-for="(blank, i) in question.blanks"
                    :key="i"
                    class="preview-blank"
                  >
                    ________
                  </span>
                </div>
                <div
                  v-if="question.questionType === 'textarea'"
                  class="preview-textarea"
                >
                  <div class="preview-answer-area"></div>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
    </el-dialog><div class="editor-main">
      <!-- 左侧大纲 -->
      <div class="editor-outline" :class="{ collapsed: outlineCollapsed }">
        <div class="outline-header">
          <span class="outline-title">题目大纲</span>
          <el-button
            link
            size="small"
            @click="outlineCollapsed = !outlineCollapsed"
          >
            <el-icon>
              <Fold v-if="!outlineCollapsed" />
              <Expand v-else />
            </el-icon>
          </el-button>
        </div>

        <div v-if="!outlineCollapsed" class="outline-content">
          <div class="outline-summary">
            共{{ paper.totalQuestions }} 题，{{ paper.totalPoints }} 分
          </div>

          <draggable
            v-if="outlineQuestions.length > 0"
            v-model="outlineQuestions"
            item-key="questionId"
            handle=".drag-handle"
            ghost-class="ghost-item"
            class="outline-list"
          >
            <template #item="{ element }">
              <div
                class="outline-item"
                :class="{ active: activeQuestionId === element.questionId }"
                @click="scrollToQuestion(element.questionId)"
              >
                <span class="drag-handle">
                  <component :is="iconComponents.DragIcon" class="drag-icon" />
                </span>
                <span class="item-index">{{ element.globalIndex }}.</span>
                <span class="item-title">
                  {{ element.stem || "未填写题目" }}
                </span>
                <span class="item-points">{{ element.points }}分</span>
              </div>
            </template>
          </draggable>

          <div v-else class="outline-empty">
            <el-empty description="暂无题目" :image-size="60" />
          </div>
        </div>
      </div>

      <!-- 主内容区-->
      <div
        class="editor-content"
        :class="{ 'drag-over': isDragOver, 'is-dragging': isDragging }"
        @drop="onDrop"
        @dragover="onDragOver"
        @dragenter="onDragEnter"
        @dragleave="onDragLeave"
      >
        <div class="paper-canvas">
          <!-- 试卷描述 -->
          <div class="paper-description">
            <el-input
              v-model="paper.description"
              type="textarea"
              placeholder="请输入试卷说明（选填）"
              :rows="2"
              maxlength="500"
              show-word-limit
            />
          </div>

          <!-- 空状态提示 -->
          <div v-if="paper.questionGroups.length === 0" class="empty-hint">
            <el-empty
              description="拖拽或点击上方题型添加题目"
              :image-size="120"
            />
          </div>

          <!-- 题目列表 -->
          <div class="questions-