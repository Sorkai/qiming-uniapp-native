# 在线组卷编辑器系统 - 完整设计文档（续）

## 四、AI智能功能设计（续）

### 4.2 AI难度评估与建议API

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
  coveredKnowledgePoints: string[];
  missingKnowledgePoints: string[];
  
  // 题型平衡度(0-100)
  typeBalance: number;
  typeDistribution: {
    type: string;
    count: number;
    percentage: number;
  }[];
  
  // 分值分布合理性 (0-100)
  scoreDistribution: number;
  
  // 预估完成时间（分钟）
  estimatedTime: number;
  
  // AI改进建议
  suggestions: string[];
  
  // 整体评分 (0-100)
  overallScore: number;
}

/** 获取AI分析 */
export const getAIAnalysis = (data: AIAnalysisParams) => {
  return http.request<ApiResponse<AIAnalysisResult>>(
    "post",
    "/edu/backend/v1/ai/paper/analyze",
    { data }
  );
};

/** AI推荐题目请求参数 */
export interface AIRecommendParams {
  courseId: number;
  questionTypes?: number[];
  difficultyRange?: [number, number];
  knowledgePoints?: string[];
  count: number;
  excludeQuestionIds?: number[];
}

/** AI推荐题目结果 */
export interface AIRecommendResult {
  questions: Array<Question & {
    aiReason: string;  // AI推荐理由
    relevanceScore: number;  // 相关度评分
  }>;
}

/** 获取AI推荐题目 */
export const getAIRecommendQuestions = (data: AIRecommendParams) => {
  return http.request<ApiResponse<AIRecommendResult>>(
    "post",
    "/edu/backend/v1/ai/question/recommend",
    { data }
  );
};
```

---

## 五、学情分析系统设计

### 5.1 成绩统计页面

```vue
<!-- views/exam-paper/statistics/index.vue -->
<template>
  <div class="statistics-page">
    <!--顶部筛选 -->
    <el-card class="filter-card">
      <el-form :inline="true" :model="filterForm">
        <el-form-item label="考试/作业">
          <el-select v-model="filterForm.publishId" placeholder="选择考试">
            <el-option 
              v-for="item in publishList" 
              :key="item.publishId" 
              :label="item.title" 
              :value="item.publishId" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="班级">
          <el-select v-model="filterForm.classId" placeholder="选择班级">
            <el-option label="全部班级" value="" />
            <el-option 
              v-for="item in classList" 
              :key="item.classId" 
              :label="item.className" 
              :value="item.classId" 
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadStatistics">查询</el-button>
          <el-button @click="exportReport">导出报告</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <!-- 统计概览 -->
    <el-row :gutter="20" class="overview-row">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-value">{{ stats.participantCount }}</div>
          <div class="stat-label">参与人数</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-value">{{ stats.averageScore }}</div>
          <div class="stat-label">平均分</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-value">{{ stats.highestScore }}</div>
          <div class="stat-label">最高分</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-value">{{ stats.passRate }}%</div>
          <div class="stat-label">及格率</div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 图表区域 -->
    <el-row :gutter="20">
      <!-- 成绩分布直方图 -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>成绩分布</span>
          </template>
          <div ref="histogramRef" class="chart-container"></div>
        </el-card>
      </el-col>
      
      <!-- 成绩等级饼图 -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>成绩等级分布</span>
          </template>
          <div ref="gradeChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>
    <!-- AI学情分析 -->
    <el-card class="ai-analysis-card">
      <template #header>
        <span><el-icon><MagicStick /></el-icon> AI学情分析</span><el-button size="small" @click="refreshAIAnalysis" :loading="aiLoading">
          刷新分析
        </el-button>
      </template><div class="ai-analysis-content">
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="analysis-section">
              <h4>整体表现分析</h4>
              <p>{{ aiAnalysis.overallAnalysis }}</p>
            </div>
            <div class="analysis-section">
              <h4>薄弱知识点</h4>
              <div class="weak-points">
                <el-tag
                  v-for="point in aiAnalysis.weakPoints" 
                  :key="point.name"
                  type="danger"
                >
                  {{ point.name }} (正确率: {{ point.correctRate }}%)
                </el-tag>
              </div>
            <div class="analysis-section">
              <h4>教学建议</h4>
              <ul>
                <li v-for="(suggestion, index) in aiAnalysis.teachingSuggestions" :key="index">
                  {{ suggestion }}
                </li>
              </ul>
            </div>
          </el-col>
          <el-col :span="12">
            <!-- 知识点掌握雷达图 -->
            <div ref="radarChartRef" class="chart-container"></div>
          </el-col>
        </el-row>
      </div>
    </el-card>
    
    <!-- 题目分析表格 -->
    <el-card>
      <template #header>
        <span>题目分析</span>
      </template>
      <el-table :data="questionAnalysis" stripe>
        <el-table-column prop="questionNo" label="题号" width="80" />
        <el-table-column prop="questionType" label="题型" width="100">
          <template #default="{ row }">
            <el-tag size="small">{{ getTypeName(row.questionType) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="stem" label="题目内容" show-overflow-tooltip />
        <el-table-column prop="correctRate" label="正确率" width="120">
          <template #default="{ row }">
            <el-progress 
              :percentage="row.correctRate" 
              :status="getProgressStatus(row.correctRate)"/>
          </template>
        </el-table-column>
        <el-table-column prop="avgScore" label="平均得分" width="100" />
        <el-table-column prop="discrimination" label="区分度" width="100">
          <template #default="{ row }">
            <el-tag :type="getDiscriminationType(row.discrimination)">
              {{ row.discrimination.toFixed(2) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100">
          <template #default="{ row }">
            <el-button size="small" @click="viewQuestionDetail(row)">
              详情
            </el-button></template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>
```

### 5.2 学生个人能力分析

```vue
<!-- views/student-exam/result/index.vue -->
<template>
  <div class="exam-result-page">
    <!-- 成绩概览 -->
    <el-card class="score-card">
      <div class="score-main">
        <div class="score-circle" :class="getScoreClass(result.totalScore)"><span class="score-value">{{ result.totalScore }}</span>
          <span class="score-total">/ {{ result.fullScore }}</span>
        </div>
        <div class="score-info">
          <div class="info-item">
            <span class="label">排名：</span>
            <span class="value">{{ result.rank }} / {{ result.totalStudents }}</span>
          </div>
          <div class="info-item">
            <span class="label">用时：</span>
            <span class="value">{{ formatTime(result.usedTime) }}</span>
          </div>
          <div class="info-item">
            <span class="label">等级：</span>
            <el-tag :type="getGradeType(result.grade)">{{ result.grade }}</el-tag>
          </div>
        </div>
      </div></el-card>
    
    <!-- 能力分析 -->
    <el-row :gutter="20">
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>个人能力图</span>
          </template>
          <div ref="abilityRadarRef" class="chart-container"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>知识点掌握情况</span>
          </template>
          <div class="knowledge-list">
            <div 
              v-for="item in result.knowledgePoints" 
              :key="item.name" 
              class="knowledge-item"
            >
              <span class="name">{{ item.name }}</span>
              <el-progress 
                :percentage="item.mastery" 
                :status="getMasteryStatus(item.mastery)"
              />
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- AI个性化建议 -->
    <el-card class="ai-suggestion-card">
      <template #header>
        <span><el-icon><MagicStick /></el-icon> AI学习建议</span>
      </template>
      <div class="suggestion-content">
        <div class="suggestion-section">
          <h4>整体评价</h4>
          <p>{{ aiSuggestion.overallComment }}</p>
        </div>
        <div class="suggestion-section">
          <h4>需要加强的知识点</h4>
          <div class="weak-points">
            <div v-for="point in aiSuggestion.weakPoints" :key="point.name" class="weak-point-item">
              <el-tag type="warning">{{ point.name }}</el-tag>
              <span class="point-suggestion">{{ point.suggestion }}</span>
            </div>
          </div>
        </div>
        <div class="suggestion-section">
          <h4>推荐练习</h4>
          <el-button type="primary" @click="goToPractice">
            开始针对性练习
          </el-button>
        </div>
      </div>
    </el-card>
    
    <!-- 答题详情 -->
    <el-card>
      <template #header>
        <span>答题详情</span>
        <el-switch v-model="showAnswer" active-text="显示答案" />
      </template>
      <div class="answer-list">
        <div 
          v-for="(answer, index) in result.answers" 
          :key="answer.questionId" 
          class="answer-item"
          :class="{ correct: answer.isCorrect, wrong: !answer.isCorrect }"
        >
          <div class="question-header">
            <span class="question-no">{{ index + 1 }}.</span>
            <el-tag size="small">{{ getTypeName(answer.questionType) }}</el-tag>
            <span class="question-score">
              {{ answer.score }} / {{ answer.fullScore }}分
            </span>
          </div>
          <div class="question-stem" v-html="answer.stem"></div>
          <div class="student-answer">
            <span class="label">你的答案：</span>
            <span class="answer-content">{{ answer.studentAnswer || '未作答' }}</span>
          </div>
          <div v-if="showAnswer" class="correct-answer">
            <span class="label">正确答案：</span>
            <span class="answer-content">{{ answer.correctAnswer }}</span>
          </div>
          <div v-if="showAnswer && answer.analysis" class="answer-analysis">
            <span class="label">解析：</span>
            <span class="analysis-content">{{ answer.analysis }}</span>
          </div><div v-if="answer.teacherComment" class="teacher-comment">
            <span class="label">教师评语：</span>
            <span class="comment-content">{{ answer.teacherComment }}</span>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>
```

---

## 六、阅卷系统设计

### 6.1 阅卷列表页面

```vue
<!-- views/exam-paper/grading/index.vue -->
<template>
  <div class="grading-list-page">
    <!-- 筛选条件 -->
    <el-card class="filter-card">
      <el-form :inline="true" :model="filterForm">
        <el-form-item label="考试/作业">
          <el-select v-model="filterForm.publishId" placeholder="选择">
            <el-option 
              v-for="item in publishList" 
              :key="item.publishId" 
              :label="item.title" 
              :value="item.publishId" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="阅卷状态">
          <el-select v-model="filterForm.gradingStatus" placeholder="全部">
            <el-option label="全部" value="" />
            <el-option label="未阅卷" :value="0" />
            <el-option label="部分阅卷" :value="1" />
            <el-option label="已完成" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadList">查询</el-button></el-form-item>
      </el-form>
    </el-card>
    
    <!-- 阅卷进度 -->
    <el-card class="progress-card">
      <div class="progress-info">
        <span>阅卷进度：</span>
        <el-progress 
          :percentage="gradingProgress" 
          :format="() => `${gradedCount}/${totalCount}`"/>
      </div>
      <div class="progress-actions">
        <el-button type="primary" @click="startBatchGrading">
          开始批量阅卷
        </el-button>
        <el-button @click="exportGrades">导出成绩</el-button>
      </div>
    </el-card>
    
    <!-- 学生列表 -->
    <el-card>
      <el-table :data="studentList" stripe @row-click="goToGrading">
        <el-table-column prop="studentName" label="学生姓名" />
        <el-table-column prop="studentNo" label="学号" />
        <el-table-column prop="className" label="班级" />
        <el-table-column prop="submitTime" label="提交时间" />
        <el-table-column prop="objectiveScore" label="客观题得分" />
        <el-table-column prop="subjectiveScore" label="主观题得分">
          <template #default="{ row }">
            <span v-if="row.gradingStatus === 2">{{ row.subjectiveScore }}</span>
            <el-tag v-else type="warning">待阅卷</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="totalScore" label="总分">
          <template #default="{ row }">
            <span v-if="row.gradingStatus === 2">{{ row.totalScore }}</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="gradingStatus" label="状态">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.gradingStatus)">
              {{ getStatusText(row.gradingStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button size="small" type="primary" @click.stop="goToGrading(row)">
              {{ row.gradingStatus === 2 ? '查看' : '阅卷' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        @change="loadList"
      />
    </el-card>
  </div>
</template>
```

### 6.2 阅卷详情页面

```vue
<!-- views/exam-paper/grading/detail.vue -->
<template>
  <div class="grading-detail-page">
    <!-- 学生信息 -->
    <el-card class="student-info-card">
      <div class="student-info">
        <span>学生：{{ studentInfo.name }}</span>
        <span>学号：{{ studentInfo.studentNo }}</span>
        <span>班级：{{ studentInfo.className }}</span>
        <span>提交时间：{{ studentInfo.submitTime }}</span>
      </div>
      <div class="grading-actions">
        <el-button @click="prevStudent" :disabled="!hasPrev">上一份</el-button>
        <el-button @click="nextStudent" :disabled="!hasNext">下一份</el-button><el-button type="primary" @click="submitGrading" :loading="submitting">
          提交阅卷
        </el-button>
      </div>
    </el-card>
    
    <!-- 答卷内容 -->
    <div class="answer-content">
      <div 
        v-for="(question, index) in questions" 
        :key="question.questionId"
        class="question-grading-item"
        :class="{ 'is-subjective': isSubjective(question.questionType) }"
      >
        <div class="question-header">
          <span class="question-no">第{{ index + 1 }}题</span>
          <el-tag size="small">{{ getTypeName(question.questionType) }}</el-tag>
          <span class="question-points">（{{ question.points }}分）</span>
        </div>
        <div class="question-stem" v-html="question.stem"></div>
        
        <!-- 学生答案 -->
        <div class="student-answer-section">
          <div class="section-title">学生答案：</div>
          <div class="answer-content" v-html="question.studentAnswer || '未作答'"></div>
        </div>
        
        <!-- 参考答案（主观题显示） -->
        <div v-if="isSubjective(question.questionType)" class="reference-answer-section">
          <div class="section-title">参考答案：</div>
          <div class="answer-content">{{ question.referenceAnswer }}</div><div v-if="question.scoringCriteria" class="scoring-criteria">
            <div class="section-title">评分标准：</div>
            <div class="criteria-content">{{ question.scoringCriteria }}</div>
          </div>
        </div>
        
        <!-- 评分区域 -->
        <div class="grading-section">
          <div class="score-input">
            <span>得分：</span>
            <el-input-number 
              v-model="question.score" 
              :min="0" 
              :max="question.points"
              :disabled="!isSubjective(question.questionType)"
            />
            <span class="max-score">/ {{ question.points }}分</span>
          </div>
          
          <!-- 主观题评语 -->
          <div v-if="isSubjective(question.questionType)" class="comment-input">
            <span>评语：</span>
            <el-input 
              v-model="question.comment" 
              type="textarea" 
              placeholder="输入评语（可选）"
              :rows="2"
            />
          </div>
          
          <!-- 快捷评语 -->
          <div v-if="isSubjective(question.questionType)" class="quick-comments">
            <el-tag
              v-for="comment in quickComments" 
              :key="comment"
              @click="addQuickComment(question, comment)"
              class="quick-comment-tag"
            >
              {{ comment }}
            </el-tag>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 底部汇总 -->
    <el-card class="summary-card">
      <div class="score-summary">
        <div class="summary-item">
          <span class="label">客观题得分：</span>
          <span class="value">{{ objectiveScore }}</span>
        </div>
        <div class="summary-item">
          <span class="label">主观题得分：</span>
          <span class="value">{{ subjectiveScore }}</span>
        </div>
        <div class="summary-item total">
          <span class="label">总分：</span>
          <span class="value">{{ totalScore }}</span>
        </div>
      </div></el-card>
  </div>
</template>

<script setup lang="ts">
const quickComments = [
  '回答正确，表述清晰',
  '基本正确，但表述不够完整',
  '部分正确，需要补充',
  '答案不完整',
  '理解有偏差',
  '未能抓住要点',
];
</script>
```

---

## 七、数据模型完整定义

### 7.1 题目类型枚举

```typescript
// types/exam-paper.d.ts

/** 题目类型枚举 */
export enum QuestionType {
  SINGLE_CHOICE = 1,      // 单选题
  MULTIPLE_CHOICE = 2,    // 多选题
  TRUE_FALSE = 3,         // 判断题
  FILL_BLANK = 4,         // 填空题
  SHORT_ANSWER = 5,       // 简答题
  ESSAY = 6,              // 论述题
  MATRIX_SINGLE = 7,      // 矩阵单选
  MATRIX_MULTIPLE = 8,    // 矩阵多选
  MATCHING = 9,           // 连线题
  SORTING = 10,           // 排序题
  COMPOSITE = 11          // 组合题/材料题
}

/** 试卷状态枚举 */
export enum PaperStatus {
  DRAFT = 0,      // 草稿
  PUBLISHED = 1,  // 已发布
  CLOSED = 2,     // 已关闭
  ARCHIVED = 3    // 已归档
}

/** 发布类型枚举 */
export enum PublishType {
  HOMEWORK = 1,   // 作业
  EXAM = 2// 考试
}

/** 答题状态枚举 */
export enum AnswerStatus {
  NOT_STARTED = 0,  // 未开始
  IN_PROGRESS = 1,  // 答题中
  SUBMITTED = 2,    // 已提交
  TIMEOUT = 3       // 超时
}

/** 阅卷状态枚举 */
export enum GradingStatus {
  NOT_GRADED = 0,// 未阅卷
  PARTIAL_GRADED = 1,  // 部分阅卷
  FULLY_GRADED = 2     // 已完成阅卷
}
```

---

## 八、页面路由配置

```typescript
// router/modules/exam-paper.ts

export default {
  path: "/exam-paper",
  name: "ExamPaper",
  redirect: "/exam-paper/list",
  meta: {
    title: "试卷管理",
    icon: "Document",
    rank: 10
  },
  children: [
    {
      path: "/exam-paper/list",
      name: "ExamPaperList",
      component: () => import("@/views/exam-paper/index.vue"),
      meta: { title: "试卷库" }
    },
    {
      path: "/exam-paper/editor",
      name: "ExamPaperEditor",
      component: () => import("@/views/exam-paper/editor/index.vue"),
      meta: { title: "编辑试卷", showLink: false }
    },
    {
      path: "/exam-paper/editor/:id",
      name: "ExamPaperEditorEdit",
      component: () => import("@/views/exam-paper/editor/index.vue"),
      meta: { title: "编辑试卷", showLink: false }
    },
    {
      path: "/exam-paper/publish/:id",
      name: "ExamPaperPublish",
      component: () => import("@/views/exam-paper/publish/index.vue"),
      meta: { title: "发布设置", showLink: false }
    },
    {
      path: "/exam-paper/grading",
      name: "ExamPaperGrading",
      component: () => import("@/views/exam-paper/grading/index.vue"),
      meta: { title: "阅卷管理" }
    },
    {
      path: "/exam-paper/grading/:recordId",
      name: "ExamPaperGradingDetail",
      component: () => import("@/views/exam-paper/grading/detail.vue"),
      meta: { title: "阅卷详情", showLink: false }
    },
    {
      path: "/exam-paper/statistics",
      name: "ExamPaperStatistics",
      component: () => import("@/views/exam-paper/statistics/index.vue"),
      meta: { title: "学情分析" }
    },
    {
      path: "/exam-paper/history",
      name: "ExamPaperHistory",
      component: () => import("@/views/exam-paper/history/index.vue"),
      meta: { title: "出题历史" }
    }
  ]
};
```

---

## 九、实施计划

### 9.1 开发阶段划分

| 阶段 | 内容 | 预计工时 |
|------|------|----------|
| 第一阶段 | 基础架构搭建、数据模型定义、API接口设计 | 2天 |
| 第二阶段 | 试卷编辑器核心功能（基础题型） | 5天 |
| 第三阶段 | 高级题型（矩阵、连线、排序、组合） | 4天 |
| 第四阶段 | 试卷库管理、发布功能 | 2天 |
| 第五阶段 | 阅卷系统 | 3天 |
| 第六阶段 | 学情分析、统计图表 | 3天 |
| 第七阶段 | AI智能功能集成 | 3天 |
| 第八阶段 | 学生端答题页面 | 3天 |
| 第九阶段 | 测试、优化、Bug修复 | 3天 |

### 9.2 文件结构

```
src/views/exam-paper/
├── index.vue                    # 试卷库列表
├── editor/
│   ├──