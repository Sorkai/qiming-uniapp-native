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
  title: "基于 AI Agent 的企业降本增效可行性研究：以库存与留存为例",
  description: "非常感谢您的参与！如有涉及个人信息，我们将严格保密。",
  courseId: null as number | null,
  timeLimit: 90,
  totalPoints: 0,
  totalQuestions: 0,
  questionGroups: [] as any[],
  settings: {
    onePageOneQuestion: false,
    limitBrowser: true,
    limitIP: true,
    ipLimitTimes: 1,
    browserLimitTimes: 1,
    enableCaptcha: true,
    enablePassword: false,
    enableScoring: false,
    showScoreOnFinish: true,
    finishDisplayType: "score-and-detail"
  }
});

// 自动保存状态
const autoSaveStatus = ref<"idle" | "saving" | "saved" | "error">("saved");
const lastSaveTime = ref("13"); // 13 seconds ago in the image it says (13)
const autoSaveEnabled = ref(true);

// 当前选中的题目ID
const activeQuestionId = ref<number | null>(null);

// 侧边栏和工具栏状态
const activeCategory = ref("常用题型");
const activeLeftTab = ref("outline");
const activeRightTab = ref("paper");

// 展开的分组
const expandedGroups = ref<number[]>([]);

// 左侧大纲是否折叠
const outlineCollapsed = ref(false);

// 右侧面板是否折叠
const overviewCollapsed = ref(false);

// 题型分类定义
const questionTypeCategories = [
  {
    label: "常用题型",
    types: [
      { id: "radio", label: "单选题", icon: "CircleCheck", color: "#00bfa5" },
      { id: "checkbox", label: "多选题", icon: "Checked", color: "#00bfa5" },
      { id: "input", label: "填空题", icon: "Edit", color: "#00bfa5" },
      { id: "inputs", label: "多项填空", icon: "More", color: "#00bfa5" },
      { id: "rate", label: "评分题", icon: "Star", color: "#00bfa5" },
      { id: "sort", label: "排序题", icon: "Rank", color: "#00bfa5" },
      { id: "select", label: "下拉题", icon: "ArrowDown", color: "#00bfa5" },
      { id: "textarea", label: "文本题", icon: "Tickets", color: "#00bfa5" },
      { id: "upload", label: "上传", icon: "Upload", color: "#00bfa5" }
    ]
  },
  {
    label: "矩阵扩展",
    types: [
      { id: "m-radio", label: "单选题", icon: "Grid", color: "#00bfa5" },
      { id: "m-checkbox", label: "多选题", icon: "Menu", color: "#00bfa5" },
      { id: "m-input", label: "填空题", icon: "Platform", color: "#00bfa5" }
    ]
  },
  {
    label: "辅助组件",
    types: [
      { id: "page", label: "分页", icon: "Files", color: "#00bfa5" },
      { id: "section", label: "分段", icon: "Operation", color: "#00bfa5" }
    ]
  }
];

const questionTypes = questionTypeCategories.flatMap(c => c.types);

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
const addQuestionGroup = (typeId: string) => {
  const typeInfo = questionTypes.find(t => t.id === typeId);
  const groupId = Date.now();
  paper.questionGroups.push({
    groupId,
    groupName: typeInfo?.label,
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
    group.questions.push({
      questionId,
      questionType: group.questionType,
      stem: "",
      options:
        group.questionType === "radio" || group.questionType === "checkbox"
          ? [
              { key: "A", content: "选项一" },
              { key: "B", content: "选项二" }
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
    await new Promise(resolve => setTimeout(resolve, 800));
    autoSaveStatus.value = "saved";
    lastSaveTime.value = "刚刚";
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
  ElMessage.success("试卷发布成功！");
};

// 返回
const goBack = () => {
  router.back();
};

// 拖拽开始
const onDragStart = (event: DragEvent, typeId: string) => {
  event.dataTransfer?.setData("questionType", typeId);
};

// 拖拽放置
const onDrop = (event: DragEvent) => {
  event.preventDefault();
  const typeId = event.dataTransfer?.getData("questionType");
  if (typeId) {
    addQuestionGroup(typeId);
  }
};

// 拖拽悬停
const onDragOver = (event: DragEvent) => {
  event.preventDefault();
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
  
  // Seed initial data to match the image
  const initialGroupId = Date.now();
  paper.questionGroups.push({
    groupId: initialGroupId,
    groupName: "常规题型",
    questionType: "radio",
    questions: [
      {
        questionId: 1,
        questionType: "radio",
        stem: "您从事或了解的电商经营模式主要是？",
        options: [
          { key: "A", content: "品牌自营" },
          { key: "B", content: "直播带货" },
          { key: "C", content: "其他" }
        ],
        correctAnswer: "",
        points: 5
      },
      {
        questionId: 2,
        questionType: "radio",
        stem: "在店铺运营中，最让您头疼的问题是什么？",
        options: [
          { key: "A", content: "库存积压" },
          { key: "B", content: "热销款断货" },
          { key: "C", content: "客户咨询量大，回复不过来" },
          { key: "D", content: "用户复购率低，留不住人" },
          { key: "E", content: "营销成本太高" }
        ],
        correctAnswer: "",
        points: 5
      },
      {
        questionId: 3,
        questionType: "radio",
        stem: "目前的库存管理方式主要依靠什么？",
        options: [
          { key: "A", content: "人工登记" }
        ],
        correctAnswer: "",
        points: 5
      }
    ]
  });
});

onBeforeUnmount(() => {
  document.removeEventListener("keydown", handleKeydown);
});
</script>

<template>
  <div class="exam-paper-editor">
    <!-- Top Navigation -->
    <div class="editor-header">
      <div class="header-left">
        <div class="logo">
          <img src="https://avatars.githubusercontent.com/u/15619125?s=200&v=4" alt="logo" class="logo-img" />
          <span class="logo-text">调问网-全新问卷编辑器</span>
          <span class="logo-subtext">拖拽或点击图标即可加入题目</span>
        </div>
      </div>
      <div class="header-center">
        <div class="nav-tabs">
          <div class="nav-tab active">问卷设计</div>
          <div class="nav-tab">答卷收集</div>
          <div class="nav-tab">数据统计</div>
          <div class="nav-tab">我的项目</div>
        </div>
      </div>
      <div class="header-right">
        <el-button link>
          <el-icon><Monitor /></el-icon>
          切换布局
          <el-icon class="el-icon--right"><ArrowDown /></el-icon>
        </el-button>
        <el-divider direction="vertical" />
        <el-button link>问卷设计</el-button>
        <el-button link>答卷收集</el-button>
        <el-button link>数据统计</el-button>
        <el-button link>我的项目</el-button>
      </div>
    </div>

    <!-- Toolbar -->
    <div class="question-toolbar">
      <div class="toolbar-left">
        <el-tabs v-model="activeCategory" class="toolbar-tabs">
          <el-tab-pane
            v-for="cat in questionTypeCategories"
            :key="cat.label"
            :label="cat.label"
            :name="cat.label"
          >
            <div class="toolbar-items">
              <div
                v-for="type in cat.types"
                :key="type.id"
                class="type-item"
                draggable="true"
                @dragstart="onDragStart($event, type.id)"
                @click="addQuestionGroup(type.id)"
              >
                <div class="type-icon-wrapper">
                  <el-icon><component :is="type.icon" /></el-icon>
                </div>
                <span class="type-label">{{ type.label }}</span>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
      <div class="toolbar-right">
        <div class="auto-save">
          <el-switch v-model="autoSaveEnabled" size="small" />
          <span class="auto-save-text">自动保存 ({{ lastSaveTime }})</span>
        </div>
        <el-button type="primary" color="#00bfa5" @click="publishPaper">
          <el-icon><Promotion /></el-icon>
          发布
        </el-button>
        <el-button @click="savePaper">
          <el-icon><DocumentChecked /></el-icon>
          保存
        </el-button>
      </div>
    </div>

    <div class="editor-main">
      <!-- Left Outline -->
      <div class="editor-outline" :class="{ collapsed: outlineCollapsed }">
        <div class="outline-header">
          <el-tabs v-model="activeLeftTab" class="full-width-tabs">
            <el-tab-pane label="大纲" name="outline" />
            <el-tab-pane label="题库" name="library" />
          </el-tabs>
          <el-button
            link
            class="collapse-btn"
            @click="outlineCollapsed = !outlineCollapsed"
          >
            <el-icon v-if="outlineCollapsed"><Close /></el-icon>
            <el-icon v-else><CircleClose /></el-icon>
          </el-button>
        </div>
        
        <div v-if="!outlineCollapsed" class="outline-content">
          <div class="outline-help" v-if="paper.questionGroups.length > 0">
            <el-icon><InfoFilled /></el-icon>
            拖动目录可修改题目排序
          </div>
          
          <div
            v-for="(group, gIndex) in paper.questionGroups"
            :key="group.groupId"
            class="outline-group"
          >
            <div
              v-for="(question, qIndex) in group.questions"
              :key="question.questionId"
              class="question-item"
              :class="{ active: activeQuestionId === question.questionId }"
              @click="scrollToQuestion(question.questionId)"
            >
              <span class="item-number">Q{{ qIndex + 1 }}.</span>
              <span class="item-title">
                {{ question.stem || "未填写题目" }}
              </span>
            </div>
          </div>
          
          <div v-if="paper.questionGroups.length === 0" class="outline-empty">
            <el-empty description="暂无题目" :image-size="60" />
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="editor-content" @drop="onDrop" @dragover="onDragOver">
        <div class="paper-canvas">
          <h1 class="paper-title-display">{{ paper.title }}</h1>
          <p class="paper-description-display">{{ paper.description }}</p>
          
          <div class="canvas-help-text" v-if="paper.questionGroups.length === 0">
            拖动上方工具栏题目控件到下方区域，可以增加新题目
          </div>

          <div class="questions-container">
            <div
              v-for="group in paper.questionGroups"
              :key="group.groupId"
              class="question-group"
            >
              <div
                v-for="(question, qIndex) in group.questions"
                :key="question.questionId"
                :id="`question-${question.questionId}`"
                class="question-card"
                :class="{ active: activeQuestionId === question.questionId }"
                @click="activeQuestionId = question.questionId"
              >
                <div class="question-body">
                  <div class="question-stem-row">
                    <span class="question-index">{{ qIndex + 1 }}、</span>
                    <el-input
                      v-model="question.stem"
                      placeholder="从您从事或了解的电商经营模式主要是？"
                      class="stem-input"
                    />
                  </div>

                  <div class="question-options">
                    <div
                      v-for="option in question.options"
                      :key="option.key"
                      class="option-row"
                    >
                      <el-radio
                        v-if="question.questionType === 'radio'"
                        disabled
                        class="option-mark"
                      />
                      <el-input
                        v-model="option.content"
                        placeholder="选项内容"
                        class="option-input"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Settings -->
      <div class="editor-settings" :class="{ collapsed: overviewCollapsed }">
        <div class="settings-header">
          <el-tabs v-model="activeRightTab" class="full-width-tabs">
            <el-tab-pane label="问卷设置" name="paper" />
            <el-tab-pane label="题目设置" name="question" />
          </el-tabs>
          <el-button
            link
            class="collapse-btn"
            @click="overviewCollapsed = !overviewCollapsed"
          >
            <el-icon><Close /></el-icon>
          </el-button>
        </div>

        <div v-if="!overviewCollapsed" class="settings-content">
          <div v-if="activeRightTab === 'paper'" class="paper-settings">
            <div class="settings-help">
              <el-icon><InfoFilled /></el-icon>
              可以配置整个问卷的基本属性
              <el-icon class="close-help"><Close /></el-icon>
            </div>

            <el-checkbox v-model="paper.settings.onePageOneQuestion" label="一页一题" />
            
            <div class="settings-section">
              <div class="section-title">回答限制</div>
              <el-checkbox v-model="paper.settings.limitBrowser">
                启用浏览器终端回答限制
              </el-checkbox>
              <div class="setting-detail" v-if="paper.settings.limitBrowser">
                每个浏览器可回答次数
                <el-input-number v-model="paper.settings.browserLimitTimes" size="small" />
                次
              </div>

              <el-checkbox v-model="paper.settings.limitIP">
                启用IP回答限制
              </el-checkbox>
              <div class="setting-detail" v-if="paper.settings.limitIP">
                每个IP可回答次数
                <el-input-number v-model="paper.settings.ipLimitTimes" size="small" />
                次
              </div>

              <el-checkbox v-model="paper.settings.enableCaptcha">
                重复回答启用验证码
              </el-checkbox>
              <el-checkbox v-model="paper.settings.enablePassword">
                启用通过密码答卷
              </el-checkbox>
            </div>

            <div class="settings-section">
              <div class="section-title">计分属性</div>
              <el-checkbox v-model="paper.settings.enableScoring">
                打开计分功能
              </el-checkbox>
              <el-checkbox v-model="paper.settings.showScoreOnFinish">
                答卷结束显示总分
              </el-checkbox>
              <div class="setting-detail" v-if="paper.settings.showScoreOnFinish">
                <el-select v-model="paper.settings.finishDisplayType" size="small">
                  <el-option label="直接显示总分与详细" value="score-and-detail" />
                </el-select>
              </div>
            </div>

            <div class="settings-section">
              <div class="section-title">开始结束</div>
              <el-checkbox label="指定结束份数" />
              <el-checkbox label="指定开始时间" />
              <el-checkbox label="指定结束时间" />
            </div>
          </div>
          
          <div v-else class="question-settings">
            <el-empty v-if="!activeQuestionId" description="请选择一个题目进行设置" />
            <div v-else>
              <!-- Questionnaire question settings would go here -->
              <p>正在设置题目 ID: {{ activeQuestionId }}</p>
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
  background: #f0f2f5;
  color: #333;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

/* Header Styles */
.editor-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 50px;
  padding: 0 20px;
  background: #001529;
  color: #fff;
  z-index: 100;

  .header-left {
    .logo {
      display: flex;
      align-items: center;
      gap: 10px;
      
      .logo-img {
        width: 24px;
        height: 24px;
        border-radius: 4px;
      }
      
      .logo-text {
        font-weight: 600;
        font-size: 16px;
      }
      
      .logo-subtext {
        font-size: 12px;
        color: rgba(255, 255, 255, 0.45);
        margin-left: 10px;
      }
    }
  }

  .header-center {
    flex: 1;
    display: flex;
    justify-content: center;
    
    .nav-tabs {
      display: flex;
      gap: 30px;
      
      .nav-tab {
        height: 50px;
        line-height: 50px;
        cursor: pointer;
        font-size: 14px;
        color: rgba(255, 255, 255, 0.65);
        position: relative;
        transition: color 0.3s;
        
        &:hover {
          color: #fff;
        }
        
        &.active {
          color: #fff;
          font-weight: 600;
          &::after {
            content: "";
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 3px;
            background: #1890ff;
          }
        }
      }
    }
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 15px;
    
    .el-button {
      color: rgba(255, 255, 255, 0.85);
      font-size: 13px;
      &:hover {
        color: #fff;
      }
    }
    
    .el-divider {
      border-color: rgba(255, 255, 255, 0.15);
    }
  }
}

/* Question Toolbar Styles */
.question-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 110px;
  padding: 0 20px;
  background: #fff;
  border-bottom: 1px solid #e8e8e8;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  z-index: 99;

  .toolbar-left {
    flex: 1;
    height: 100%;
    
    :deep(.el-tabs) {
      height: 100%;
      .el-tabs__header {
        margin-bottom: 5px;
        .el-tabs__item {
          font-size: 12px;
          height: 30px;
          line-height: 30px;
          color: #00bfa5;
          &.is-active {
            color: #00bfa5;
            font-weight: bold;
          }
        }
        .el-tabs__nav-wrap::after {
          height: 1px;
        }
        .el-tabs__active-bar {
          background-color: #00bfa5;
        }
      }
    }
  }

  .toolbar-items {
    display: flex;
    gap: 12px;
    padding: 5px 0;
  }

  .type-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;
    width: 50px;
    cursor: grab;
    transition: all 0.3s;

    &:hover {
      transform: translateY(-2px);
      .type-icon-wrapper {
        border-color: #00bfa5;
        color: #00bfa5;
      }
    }

    .type-icon-wrapper {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border: 1px solid #e8e8e8;
      border-radius: 4px;
      font-size: 18px;
      color: #00bfa5;
      background: #fff;
      transition: all 0.3s;
    }

    .type-label {
      font-size: 11px;
      color: #666;
    }
  }

  .toolbar-right {
    display: flex;
    align-items: center;
    gap: 15px;
    
    .auto-save {
      display: flex;
      align-items: center;
      gap: 8px;
      .auto-save-text {
        font-size: 12px;
        color: #999;
      }
    }
  }
}

.editor-main {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* Sidebar Styles */
.editor-outline, .editor-settings {
  width: 260px;
  background: #fff;
  display: flex;
  flex-direction: column;
  transition: width 0.3s;
  overflow: hidden;
  border-right: 1px solid #e8e8e8;

  &.collapsed {
    width: 0;
    border: none;
  }

  .outline-header, .settings-header {
    display: flex;
    align-items: center;
    padding: 0 10px;
    height: 40px;
    border-bottom: 1px solid #f0f0f0;
    
    .full-width-tabs {
      flex: 1;
      :deep(.el-tabs__header) {
        margin: 0;
        border-bottom: none;
        .el-tabs__nav-wrap::after { display: none; }
        .el-tabs__item { 
          font-size: 13px; 
          height: 40px; 
          line-height: 40px;
        }
      }
    }
    
    .collapse-btn {
      padding: 5px;
      color: #999;
    }
  }
}

.editor-settings {
  border-right: none;
  border-left: 1px solid #e8e8e8;
}

.outline-content, .settings-content {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
}

.outline-help, .settings-help {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px;
  background: #fdf6ec;
  color: #e6a23c;
  font-size: 12px;
  border-radius: 4px;
  margin-bottom: 15px;
  position: relative;
  
  .close-help {
    position: absolute;
    right: 5px;
    cursor: pointer;
  }
}

.question-item {
  display: flex;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  color: #666;
  transition: background 0.3s;

  &:hover {
    background: #f5f5f5;
  }

  &.active {
    background: #e6f7ff;
    color: #1890ff;
  }

  .item-number {
    flex-shrink: 0;
    font-weight: 600;
  }

  .item-title {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

/* Main Canvas Styles */
.editor-content {
  flex: 1;
  padding: 30px 50px;
  overflow-y: auto;
  display: flex;
  justify-content: center;
}

.paper-canvas {
  width: 100%;
  max-width: 850px;
  background: #fff;
  min-height: 1000px;
  padding: 40px 60px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border-radius: 2px;
  position: relative;

  .paper-title-display {
    font-size: 20px;
    font-weight: 600;
    text-align: center;
    margin-bottom: 20px;
    color: #333;
  }

  .paper-description-display {
    font-size: 14px;
    color: #666;
    text-align: center;
    margin-bottom: 40px;
    padding: 0 20px;
  }

  .canvas-help-text {
    text-align: center;
    color: #999;
    font-size: 13px;
    margin: 50px 0;
  }
}

.question-card {
  padding: 20px;
  margin-bottom: 15px;
  border: 1px solid transparent;
  transition: all 0.3s;
  border-radius: 6px;

  &:hover {
    background: #f9f9f9;
  }

  &.active {
    background: #fff;
    border-color: #e8e8e8;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }

  .question-body {
    .question-stem-row {
      display: flex;
      gap: 10px;
      margin-bottom: 15px;
      
      .question-index {
        font-size: 16px;
        font-weight: 500;
        margin-top: 5px;
      }
      
      .stem-input {
        :deep(.el-input__wrapper) {
          box-shadow: none;
          background: transparent;
          font-size: 15px;
          padding: 0;
          &:hover { box-shadow: none; }
          &.is-focus { box-shadow: none; }
        }
      }
    }

    .question-options {
      padding-left: 30px;
      
      .option-row {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 8px;
        
        .option-mark {
          margin-right: 0;
        }
        
        .option-input {
          :deep(.el-input__wrapper) {
            box-shadow: none;
            background: transparent;
            padding: 0;
            &:hover { box-shadow: none; }
            &.is-focus { box-shadow: none; }
          }
        }
      }
    }
  }
}

/* Settings Styles */
.settings-section {
  margin-top: 25px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;

  .section-title {
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 12px;
    color: #333;
  }

  .el-checkbox {
    display: block;
    margin-bottom: 10px;
    height: auto;
    font-weight: normal;
    color: #666;
    font-size: 13px;
  }
}

.setting-detail {
  font-size: 12px;
  color: #999;
  margin-left: 24px;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 5px;
  
  .el-input-number {
    width: 60px;
  }
}
</style>
