# 在线组卷编辑器系统 - 完整设计文档

## 一、系统概述

### 1.1 核心功能模块

本系统是一个面向教育场景的智能在线组卷编辑器，主要功能包括：

#### 教师端/管理端功能

- **试卷编辑器**：可视化拖拽式组卷，支持多种题型
- **试卷库管理**：查看、编辑、删除、复制、导入导出试卷
- **智能AI辅助**：AI推荐题目、难度评估、改进建议
- **发布管理**：同步到学生端（作业/考试）
- **阅卷系统**：客观题自动批改、主观题人工打分
- **学情分析**：成绩统计、能力分析、AI智能分析报告

#### 学生端功能

- 查看待完成的作业/考试
- 在线答题（支持自动保存）
- 查看成绩和答案解析
- 个人能力分析图

### 1.2 技术栈

- **前端框架**: Vue 3 + TypeScript
- **UI组件库**: Element Plus
- **状态管理**: Pinia
- **拖拽组件**: vuedraggable / sortablejs / @vueuse/core
- **富文本编辑**: Wangeditor
- **图表组件**: ECharts
- **表格组件**: vxe-table / @pureadmin/table

---

## 二、编辑器界面设计

### 2.1 整体布局（四栏式设计）

```
┌──────────────────────────────────────────────┐
│  [Logo]试卷编辑器                [自动保存] [预览] [保存] [发布]         │
├────────────┬─────────────────────────────────────────────────┬───────────────┤
│            │  ┌─────────────────────────────────────────────┐││
│  左侧边栏   │  │              顶部工具栏                      ││   右侧边栏    │
│            │  │  [单选] [多选] [判断] [填空] [简答] [论述]││               │
│  题目大纲   │  │  [矩阵单选] [矩阵多选] [连线] [排序] [组合] ││   试卷总览    │
│            │  └─────────────────────────────────────────────┘│               │
│  ┌────────┐│  ┌─────────────────────────────────────────────┐│  ┌───────────┐│
│  │一、单选 ││  │                 基本信息  ││
│  │  1.题目1││  │              试卷编辑区域                    ││  │           ││
│  │  2.题目2││  │                                             ││  │ 总题数: 20││
│  │二、多选 ││  │（可拖拽排序的题目列表）             ││  │ 总分: 100 ││
│  │  3.题目3││  │                                             ││  │ 时长: 90分││
│  │三、判断 ││  │                                             ││  │           ││
│  │  4.题目4││  │                                             ││  ├───────────┤│
│  │四、简答 ││  │                                             ││  │ 题型分布  ││
│  │  5.题目5││  │                                             ││  │ [饼图]││
│  │         ││  │                                             ││
│  │         ││  │                                             ││├───────────┤│
│  │         ││  │                                             ││  │ AI分析    ││
│  │         ││  │                                             ││  │ 难度: 中等││
│  │         ││  │                                             ││  │ [建议...]  ││
│  └────────┘│  └─────────────────────────────────────────────┘│  └───────────┘│
│[+添加分组]│                │               │
└────────────┴─────────────────────────────────────────────────┴───────────────┘
```

### 2.2 左侧边栏 - 题目大纲导航

```vue
<!-- components/PaperOutline.vue -->
<template>
  <div class="paper-outline">
    <div class="outline-header">
      <span>题目大纲</span>
      <el-button size="small" @click="collapseAll">折叠全部</el-button>
    </div>
    
    <!-- 可拖拽的题型分组列表 -->
    <draggable 
      v-model="questionGroups" 
      item-key="groupId"
      handle=".group-handle"
      @end="onGroupDragEnd"
    >
      <template #item="{ element: group }">
        <div class="outline-group">
          <div class="group-header" @click="toggleGroup(group.groupId)">
            <el-icon class="group-handle"><Rank /></el-icon>
            <span>{{ group.groupName }}</span>
            <span class="group-info">{{ group.questions.length }}题/{{ group.totalPoints }}分</span>
          </div>
          
          <!-- 可拖拽的题目列表 -->
          <draggable
            v-show="expandedGroups.includes(group.groupId)"
            v-model="group.questions"
            item-key="questionId"
            group="questions"
            @end="onQuestionDragEnd"
          >
            <template #item="{ element: question, index }">
              <div 
                class="outline-item"
                :class="{ active: activeQuestionId === question.questionId }"
                @click="scrollToQuestion(question.questionId)"
              >
                <span class="item-number">{{ index + 1 }}.</span>
                <span class="item-title">{{ truncate(question.stem, 20) }}</span>
                <span class="item-points">{{ question.points }}分</span>
              </div>
            </template>
          </draggable>
        </div>
      </template>
    </draggable><el-button class="add-group-btn" @click="showAddGroupDialog">
      + 添加题型分组
    </el-button>
  </div>
</template>
```

### 2.3 顶部工具栏 - 题型拖拽区

```vue
<!-- components/QuestionToolbar.vue -->
<template>
  <div class="question-toolbar">
    <div class="toolbar-title">题型工具栏（拖拽到下方添加题目）</div>
    
    <div class="toolbar-items">
      <!-- 基础题型 -->
      <div class="toolbar-section">
        <span class="section-title">基础题型</span>
        <div class="question-types">
          <div 
            v-for="type in basicTypes" 
            :key="type.value"
            class="type-item"
            draggable="true"
            @dragstart="onDragStart($event, type)"
          >
            <el-icon :size="24"><component :is="type.icon" /></el-icon>
            <span>{{ type.label }}</span>
          </div>
        </div>
      </div>
      
      <!-- 高级题型 -->
      <div class="toolbar-section">
        <span class="section-title">高级题型</span>
        <div class="question-types">
          <div 
            v-for="type in advancedTypes" 
            :key="type.value"
            class="type-item"
            draggable="true"
            @dragstart="onDragStart($event, type)"
          >
            <el-icon :size="24"><component :is="type.icon" /></el-icon>
            <span>{{ type.label }}</span>
          </div>
        </div>
      </div>
      
      <!-- 快捷操作 -->
      <div class="toolbar-actions">
        <el-button @click="showAIRecommend">
          <el-icon><MagicStick /></el-icon>
          AI智能推荐
        </el-button>
        <el-button @click="importFromBank">
          <el-icon><FolderOpened /></el-icon>
          从题库导入
        </el-button>
        <el-button @click="batchImport">
          <el-icon><Upload /></el-icon>
          批量导入
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const basicTypes = [
  { value: 1, label: '单选题', icon: 'CircleCheck' },
  { value: 2, label: '多选题', icon: 'Select' },
  { value: 3, label: '判断题', icon: 'Check' },
  { value: 4, label: '填空题', icon: 'EditPen' },
  { value: 5, label: '简答题', icon: 'Document' },
  { value: 6, label: '论述题', icon: 'Notebook' },
];

const advancedTypes = [
  { value: 7, label: '矩阵单选', icon: 'Grid' },
  { value: 8, label: '矩阵多选', icon: 'Menu' },
  { value: 9, label: '连线题', icon: 'Connection' },
  { value: 10, label: '排序题', icon: 'Sort' },
  { value: 11, label: '组合题', icon: 'Files' },
];
</script>
```

### 2.4 右侧边栏 - 试卷总览与AI分析

```vue
<!-- components/PaperOverview.vue -->
<template>
  <div class="paper-overview">
    <!-- 基本信息 -->
    <el-card class="overview-card">
      <template #header>
        <span>试卷信息</span>
      </template>
      <el-form label-width="70px" size="small">
        <el-form-item label="试卷标题">
          <el-input v-model="paper.title" placeholder="请输入试卷标题" />
        </el-form-item>
        <el-form-item label="所属课程">
          <el-select v-model="paper.courseId" placeholder="选择课程">
            <el-option 
              v-for="course in courses" 
              :key="course.id" 
              :label="course.name" 
              :value="course.id" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="考试时长">
          <el-input-number v-model="paper.timeLimit" :min="10" :max="300" />
          <span class="unit">分钟</span>
        </el-form-item>
      </el-form>
      <div class="stats-row">
        <div class="stat-item">
          <span class="stat-value">{{ paper.totalQuestions }}</span>
          <span class="stat-label">总题数</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ paper.totalPoints }}</span>
          <span class="stat-label">总分</span>
        </div>
      </div>
    </el-card>
    
    <!-- 题型分布图 -->
    <el-card class="overview-card">
      <template #header>
        <span>题型分布</span>
      </template>
      <div ref="pieChartRef" class="chart-container"></div>
    </el-card>
    
    <!-- AI智能分析 -->
    <el-card class="overview-card ai-analysis">
      <template #header>
        <span><el-icon><MagicStick /></el-icon> AI智能分析</span><el-button size="small" @click="refreshAIAnalysis" :loading="aiLoading">
          刷新分析
        </el-button>
      </template>
      <div class="ai-content">
        <!-- 难度评估 -->
        <div class="analysis-item">
          <span class="item-label">难度评估：</span>
          <el-rate v-model="aiAnalysis.difficulty" disabled />
          <el-tag :type="getDifficultyType(aiAnalysis.difficulty)">
            {{ getDifficultyText(aiAnalysis.difficulty) }}
          </el-tag>
        </div>
        
        <!-- 知识点覆盖 -->
        <div class="analysis-item">
          <span class="item-label">知识点覆盖：</span>
          <el-progress :percentage="aiAnalysis.knowledgeCoverage" />
        </div>
        
        <!-- 题型平衡度 -->
        <div class="analysis-item">
          <span class="item-label">题型平衡度：</span>
          <el-progress :percentage="aiAnalysis.typeBalance" status="success" />
        </div>
        
        <!-- AI建议 -->
        <div class="ai-suggestions">
          <div class="suggestions-title">改进建议：</div>
          <ul class="suggestions-list">
            <li v-for="(suggestion, index) in aiAnalysis.suggestions" :key="index">
              {{ suggestion }}
            </li>
          </ul>
        </div>
      </div>
    </el-card>
  </div>
</template>
```

---

## 三、题型组件设计

### 3.1 矩阵单选题组件

```vue
<!-- components/questions/MatrixSingleChoice.vue -->
<template>
  <div class="question-matrix-single">
    <div class="question-header">
      <span class="question-type-tag">矩阵单选</span>
      <div class="question-actions">
        <el-button size="small" @click="editQuestion">编辑</el-button>
        <el-button size="small" type="danger" @click="deleteQuestion">删除</el-button>
      </div>
    </div>
    
    <!-- 题干编辑 -->
    <div class="question-stem">
      <el-input
        v-model="question.stem"
        type="textarea"
        placeholder="请输入题目说明"
        :autosize="{ minRows: 2}"
      />
    </div>
    
    <!-- 矩阵配置 -->
    <div class="matrix-config">
      <div class="config-row">
        <span>行数（题目数）：</span>
        <el-input-number v-model="rowCount" :min="2" :max="20" @change="updateMatrix" />
        <span class="ml-4">列数（选项数）：</span>
        <el-input-number v-model="colCount" :min="2" :max="10" @change="updateMatrix" />
      </div>
    </div>
    
    <!-- 矩阵表格 -->
    <div class="matrix-table-wrapper">
      <table class="matrix-table">
        <thead>
          <tr>
            <th class="row-header">题目/选项</th>
            <th v-for="(col, colIndex) in question.columns" :key="colIndex"><el-input 
                v-model="col.label" 
                placeholder="选项标题"
                size="small"
              />
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, rowIndex) in question.rows" :key="rowIndex">
            <td class="row-header">
              <el-input 
                v-model="row.label" 
                placeholder="题目内容"
                size="small"
              />
            </td><td v-for="(col, colIndex) in question.columns" :key="colIndex">
              <el-radio
                v-model="row.answer" 
                :label="col.value"
                @change="updateAnswer(rowIndex, colIndex)"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- 分值设置 -->
    <div class="question-score">
      <span>每行分值：</span>
      <el-input-number v-model="question.pointsPerRow" :min="1" :max="10" />
      <span class="total-points">总分：{{ question.pointsPerRow * question.rows.length }}分</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';

interface MatrixRow {
  label: string;
  answer: string;
}

interface MatrixColumn {
  label: string;
  value: string;
}

interface MatrixQuestion {
  questionId?: number;
  questionType: number;
  stem: string;
  rows: MatrixRow[];
  columns: MatrixColumn[];
  pointsPerRow: number;
}

const props = defineProps<{
  question: MatrixQuestion;
}>();

const emit = defineEmits(['update:question', 'delete']);

const rowCount = ref(props.question.rows.length || 3);
const colCount = ref(props.question.columns.length || 4);

const updateMatrix = () => {
  // 更新行
  while (props.question.rows.length < rowCount.value) {
    props.question.rows.push({ label: '', answer: '' });
  }
  while (props.question.rows.length > rowCount.value) {
    props.question.rows.pop();
  }
  
  // 更新列
  const columnLabels = ['非常不满意', '不满意', '一般', '满意', '非常满意'];
  while (props.question.columns.length < colCount.value) {
    const index = props.question.columns.length;
    props.question.columns.push({ 
      label: columnLabels[index] || `选项${index + 1}`, 
      value: String(index + 1) 
    });
  }
  while (props.question.columns.length > colCount.value) {
    props.question.columns.pop();
  }
};
</script>
```

### 3.2 矩阵多选题组件

```vue
<!-- components/questions/MatrixMultipleChoice.vue -->
<template>
  <div class="question-matrix-multiple">
    <div class="question-header">
      <span class="question-type-tag">矩阵多选</span>
    </div>
    
    <!-- 题干编辑 -->
    <div class="question-stem">
      <el-input
        v-model="question.stem"
        type="textarea"
        placeholder="请输入题目说明"
      />
    </div>
    
    <!-- 矩阵配置 -->
    <div class="matrix-config">
      <div class="config-row">
        <span>行数：</span>
        <el-input-number v-model="rowCount" :min="2" :max="20" />
        <span class="ml-4">列数：</span>
        <el-input-number v-model="colCount" :min="2" :max="10" />
        <span class="ml-4">每行最多选：</span>
        <el-input-number v-model="question.maxSelectPerRow" :min="1" :max="colCount" />
      </div>
    </div>
    
    <!-- 矩阵表格 -->
    <div class="matrix-table-wrapper">
      <table class="matrix-table">
        <thead>
          <tr>
            <th class="row-header">题目/选项</th>
            <th v-for="(col, colIndex) in question.columns" :key="colIndex">
              <el-input v-model="col.label" size="small" />
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, rowIndex) in question.rows" :key="rowIndex">
            <td class="row-header">
              <el-input v-model="row.label" size="small" />
            </td>
            <td v-for="(col, colIndex) in question.columns" :key="colIndex">
              <el-checkbox 
                v-model="row.answers"
                :label="col.value"
                :disabled="!row.answers.includes(col.value) && row.answers.length >= question.maxSelectPerRow"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
```

### 3.3 连线题组件

```vue
<!-- components/questions/MatchingQuestion.vue -->
<template>
  <div class="question-matching">
    <div class="question-header">
      <span class="question-type-tag">连线题</span></div>
    
    <div class="question-stem">
      <el-input v-model="question.stem" type="textarea" placeholder="请输入题目说明" />
    </div>
    
    <!-- 连线配置 -->
    <div class="matching-config">
      <el-button size="small" @click="addPair">+ 添加配对项</el-button>
      <el-checkbox v-model="question.shuffleRight">打乱右侧顺序</el-checkbox>
    </div>
    
    <!-- 配对项列表 -->
    <div class="matching-pairs">
      <div v-for="(pair, index) in question.pairs" :key="index" class="pair-item">
        <div class="pair-left">
          <el-input v-model="pair.left" placeholder="左侧内容" />
        </div>
        <div class="pair-connector">
          <el-icon><Right /></el-icon>
        </div>
        <div class="pair-right">
          <el-input v-model="pair.right" placeholder="右侧内容" />
        </div><el-button type="danger" size="small" @click="removePair(index)">
          <el-icon><Delete /></el-icon>
        </el-button>
      </div>
    </div>
    <!-- 分值设置 -->
    <div class="question-score">
      <span>每对分值：</span>
      <el-input-number v-model="question.pointsPerPair" :min="1" />
      <span>总分：{{ question.pointsPerPair * question.pairs.length }}分</span>
    </div>
  </div>
</template>
```

### 3.4 排序题组件

```vue
<!-- components/questions/SortingQuestion.vue -->
<template>
  <div class="question-sorting">
    <div class="question-header">
      <span class="question-type-tag">排序题</span>
    </div>
    
    <div class="question-stem">
      <el-input v-model="question.stem" type="textarea" placeholder="请输入题目说明" />
    </div>
    
    <!-- 排序项配置 -->
    <div class="sorting-items">
      <div class="items-header">
        <span>正确排序（从上到下）：</span>
        <el-button size="small" @click="addItem">+ 添加选项</el-button>
      </div>
      
      <draggable v-model="question.items" item-key="id" handle=".drag-handle">
        <template #item="{ element, index }">
          <div class="sort-item">
            <el-icon class="drag-handle"><Rank /></el-icon>
            <span class="item-order">{{ index + 1 }}.</span>
            <el-input v-model="element.content" placeholder="排序项内容" />
            <el-button type="danger" size="small" @click="removeItem(index)">
              <el-icon><Delete /></el-icon>
            </el-button>
          </div>
        </template>
      </draggable>
    </div><div class="question-score">
      <span>分值：</span>
      <el-input-number v-model="question.points" :min="1" /></div>
  </div>
</template>
```

---

## 四、AI智能功能设计

### 4.1 AI推荐题目

```vue
<!-- components/AIRecommendDialog.vue -->
<template>
  <el-dialog v-model="visible" title="AI智能推荐题目" width="800px">
    <!-- 推荐条件设置 -->
    <div class="recommend-config">
      <el-form :model="config" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="题型">
              <el-select v-model="config.questionType" multiple placeholder="选择题型">
                <el-option label="单选题" :value="1" />
                <el-option label="多选题" :value="2" />
                <el-option label="判断题" :value="3" />
                <el-option label="填空题" :value="4" />
                <el-option label="简答题" :value="5" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="难度范围">
              <el-slider v-model="config.difficultyRange" range :min="1" :max="5" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="知识点">
              <el-cascader 
                v-model="config.knowledgePoints" 
                :options="knowledgeTree"
                :props="{ multiple: true }"
                placeholder="选择知识点"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="推荐数量">
              <el-input-number v-model="config.count" :min="1" :max="50" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      
      <el-button type="primary" @click="getRecommendations" :loading="loading">
        <el-icon><MagicStick /></el-icon>
        获取AI推荐
      </el-button>
    </div>
    
    <!-- 推荐结果列表 -->
    <div class="recommend-results" v-if="recommendations.length">
      <div class="results-header">
        <span>推荐结果（{{ recommendations.length }}题）</span>
        <el-checkbox v-model="selectAll" @change="toggleSelectAll">全选</el-checkbox>
      </div>
      
      <div class="results-list">
        <div 
          v-for="item in recommendations" 
          :key="item.questionId" 
          class="result-item"
          :class="{ selected: selectedIds.includes(item.questionId) }"
        >
          <el-checkbox v-model="selectedIds" :label="item.questionId" />
          <div class="item-content">
            <div class="item-header">
              <el-tag size="small">{{ getTypeName(item.questionType) }}</el-tag>
              <el-rate v-model="item.difficulty" disabled size="small" />
              <span class="item-points">{{ item.points }}分</span>
            </div>
            <div class="item-stem">{{ item.stem }}</div>
            <div class="item-tags">
              <el-tag v-for="tag in item.tags" :key="tag" size="small" type="info">
                {{ tag }}
              </el-tag>
            </div>
          </div><div class="item-ai-reason">
            <el-icon><InfoFilled /></el-icon>
            <span>{{ item.aiReason }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="addSelectedQuestions" :disabled="!selectedIds.length">
        添加选中题目（{{ selectedIds.length }}）
      </el-button>
    </template>
  </el-dialog>
</template>
```

### 4.2 AI难度评估与建议

```typescript
// api/ai-analysis.ts

/** AI分析试卷请求参数 */
export interface AIAnalysisParams {
  paperId?: number;
  questionGroups: QuestionGroup[];
}

/** AI分析结果 */
export interface AIAnalysisResult {
  // 难度评估(1-5)
  difficulty: number;
  difficultyDescription: string;
  
  // 知识点覆盖率 (0-100)
  knowledgeCoverage: number;
  coveredKnowledgePoints: