# 在线组卷编辑器系统设计文档

## 一、系统概述

### 1.1 功能需求

本系统是一个面向教育场景的在线组卷编辑器，主要功能包括：

1. **教师端/管理端功能**
   - 创建和编辑试卷（支持多种题型）
   - 试卷库管理（查看、编辑、删除、复制试卷）
   - 同步试卷到学生端（作业/考试）
   - 设置题目分值
   - 主观题阅卷打分
   - 查看出题历史和阅卷情况
   - 成绩统计分析

2. **学生端功能**
   - 查看待完成的作业/考试
   - 在线答题
   - 查看已参加的考试记录
   - 查看成绩和答案解析

### 1.2 技术栈

- **前端框架**: Vue 3 + TypeScript
- **UI组件库**: Element Plus
- **状态管理**: Pinia
- **拖拽组件**: vuedraggable / sortablejs
- **富文本编辑**: Wangeditor
- **表格组件**: vxe-table / @pureadmin/table

---

## 二、页面结构设计

### 2.1 教师端/管理端页面

```
src/views/exam-paper/
├── index.vue                    # 试卷库列表页面
├── editor/
│   ├── index.vue# 试卷编辑器主页面
│   └── components/
│       ├── PaperHeader.vue      # 试卷头部信息编辑
│       ├── QuestionList.vue     # 题目列表容器（支持拖拽排序）
│       ├── QuestionItem.vue     # 单个题目容器
│       ├── QuestionToolbar.vue  # 题目工具栏（添加题目按钮组）
│       └── questions/           # 各种题型组件
│           ├── SingleChoice.vue     # 单选题
│           ├── MultipleChoice.vue   # 多选题
│           ├── TrueFalse.vue        # 判断题
│           ├── FillBlank.vue        # 填空题
│           ├── ShortAnswer.vue      # 简答题
│           ├── Essay.vue            # 论述题
│           ├── Matching.vue         # 连线题/匹配题
│           └── Composite.vue        # 组合题/材料题
├── publish/
│   └── index.vue                # 发布设置页面（同步到作业/考试）
├── grading/
│   ├── index.vue                #阅卷列表页面
│   └── detail.vue               # 阅卷详情页面
├── statistics/
│   └── index.vue                # 成绩统计分析页面
└── history/
    └── index.vue                # 出题历史页面
```

### 2.2 学生端页面

```
src/views/student-exam/
├── list/
│   └── index.vue                # 考试/作业列表
├── take/
│   └── index.vue                # 答题页面
├── result/
│   └── index.vue                # 成绩查看页面
└── history/
    └── index.vue                # 考试历史记录
```

---

## 三、核心组件设计

### 3.1 试卷编辑器主界面布局

```
┌─────────────────────────────────────────────────────────────────┐
│  试卷标题输入框[保存] [预览]│
├─────────────────────────────────────────────────────────────────┤
│┌─────────────────────────────────────────────────────────┐   │
│  │ 试卷基本信息                                              │   │
│  │ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐         │   │
│  │ │ 所属课程    │ │ 考试时长│ │ 总分        │         │   │
│  │ └─────────────┘ └─────────────┘         │   │
│  │ ┌─────────────────────────────────────────────┐         │   │
│  │ │ 试卷说明/注意事项                            │         │   │
│  │ └─────────────────────────────────────────────┘         │   │
│  └─────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 题目列表区域（可拖拽排序）                                │   │
│  │                                          │   │
│  │ ┌──────────────────────────────────────────────────────┐│   │
│  │ │ 一、单选题（共X题，共X分）                    [+添加] ││   │
│  │ │ ┌────────────────────────────────────────────────┐  ││   │
│  │ │ │ 1. 题目内容...[2分] [编辑] [删除]  │  ││   │
│  │ │ │    A. 选项1B. 选项2  C. 选项3  D. 选项4     │  ││   │
│  │ │ │正确答案: A                                 │  ││   │
│  │ │ └────────────────────────────────────────────────┘  ││   │
│  │ └──────────────────────────────────────────────────────┘│   │
│  │                                                          │   │
│  │ ┌──────────────────────────────────────────────────────┐│   │
│  │ │ 二、多选题（共X题，共X分）                    [+添加] ││   │
│  │ │ ...││   │
│  │ └──────────────────────────────────────────────────────┘│   │
│  │                                                          │   │
│  │ ┌──────────────────────────────────────────────────────┐│   │
│  │ │ 三、判断题（共X题，共X分）                    [+添加] ││   │
│  │ │ ...                                                   ││   │
│  │ └──────────────────────────────────────────────────────┘│   │
│  │                                                          │   │
│  └─────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│  [+ 添加题型分组]                                                │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐│
│  │单选│ │多选│ │判断│ │填空│ │简答│ │论述│ │连线│ │组合│      │
│  └────┘ └────┘ └────┘ └────┘ └────┘ └────┘ └────┘ └────┘      │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 题目编辑组件设计

#### 3.2.1 单选题组件 (SingleChoice.vue)

```vue
<template>
  <div class="question-single-choice">
    <!-- 题目内容编辑 -->
    <div class="question-stem">
      <el-input
        v-model="question.stem"
        type="textarea"
        placeholder="请输入题目内容"
        :autosize="{ minRows: 2 }"
      />
      <!-- 支持插入图片、公式 -->
      <div class="stem-toolbar">
        <el-button size="small" @click="insertImage">插入图片</el-button>
        <el-button size="small" @click="insertFormula">插入公式</el-button>
      </div>
    </div>
    
    <!-- 选项编辑 -->
    <div class="question-options">
      <draggable v-model="question.options" item-key="key">
        <template #item="{ element, index }">
          <div class="option-item">
            <span class="option-label">{{ getOptionLabel(index) }}</span>
            <el-input v-model="element.content" placeholder="请输入选项内容" />
            <el-radio v-model="question.correctAnswer" :label="getOptionLabel(index)">
              正确答案
            </el-radio>
            <el-button type="danger" size="small" @click="removeOption(index)">
              删除
            </el-button>
          </div>
        </template>
      </draggable>
      <el-button @click="addOption">+ 添加选项</el-button>
    </div>
    
    <!-- 分值设置 -->
    <div class="question-score">
      <span>分值：</span>
      <el-input-number v-model="question.points" :min="1" :max="100" />
    </div>
    
    <!-- 答案解析 -->
    <div class="question-analysis">
      <el-input
        v-model="question.analysis"
        type="textarea"
        placeholder="请输入答案解析（可选）"
        :autosize="{ minRows: 2 }"
      />
    </div>
  </div>
</template>
```

#### 3.2.2 填空题组件 (FillBlank.vue)

```vue
<template>
  <div class="question-fill-blank">
    <!-- 题目内容编辑（支持在文本中插入空格） -->
    <div class="question-stem">
      <div class="stem-editor" contenteditable @input="handleStemInput">
        <!-- 使用特殊标记表示填空位置 -->
      </div>
      <div class="stem-toolbar">
        <el-button size="small" @click="insertBlank">插入填空</el-button>
        <el-button size="small" @click="insertImage">插入图片</el-button></div>
    </div>
    
    <!-- 答案设置（每个空的答案） -->
    <div class="blank-answers">
      <div v-for="(blank, index) in question.blanks" :key="index" class="blank-item">
        <span>第{{ index + 1 }}空答案：</span>
        <el-input v-model="blank.answer" placeholder="请输入答案" />
        <span>分值：</span>
        <el-input-number v-model="blank.points" :min="1" />
      </div>
    </div>
    
    <!-- 答案解析 -->
    <div class="question-analysis">
      <el-input
        v-model="question.analysis"
        type="textarea"
        placeholder="请输入答案解析（可选）"
      />
    </div>
  </div>
</template>
```

#### 3.2.3 简答题/论述题组件 (ShortAnswer.vue / Essay.vue)

```vue
<template>
  <div class="question-short-answer">
    <!-- 题目内容 -->
    <div class="question-stem">
      <el-input
        v-model="question.stem"
        type="textarea"
        placeholder="请输入题目内容"
        :autosize="{ minRows: 3 }"
      />
    </div>
    
    <!-- 参考答案（用于教师阅卷参考） -->
    <div class="reference-answer">
      <span>参考答案：</span>
      <el-input
        v-model="question.referenceAnswer"
        type="textarea"
        placeholder="请输入参考答案"
        :autosize="{ minRows: 3 }"
      />
    </div>
    
    <!-- 评分标准 -->
    <div class="scoring-criteria">
      <span>评分标准：</span>
      <el-input
        v-model="question.scoringCriteria"
        type="textarea"
        placeholder="请输入评分标准（可选）"
        :autosize="{ minRows: 2 }"
      />
    </div>
    
    <!-- 分值设置 -->
    <div class="question-score">
      <span>分值：</span>
      <el-input-number v-model="question.points" :min="1" :max="100" />
    </div>
  </div>
</template>