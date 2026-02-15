# 题目组卷器 API 接口文档（教师端/管理端）

> 基础路径：`/edu/backend/v1`
> 响应格式：`{ code: number, msg: string, data: T }`
> code=0 表示成功

---

## 一、试卷管理

### 1.1 获取总览统计数据
- **接口**: `GET /paper/overview/statistics`
- **用途**: 首页展示试卷总览统计
- **响应**:
```typescript
{
  totalPapers: number;      // 试卷总数
  publishedCount: number;   // 已发布数
  gradingCount: number;     // 待阅卷数
  averageScore: number;     // 平均分
}
```

### 1.2 获取我的试卷统计数据
- **接口**: `GET /paper/my/statistics`
- **用途**: "我的试卷"页面顶部统计卡片展示
- **说明**: 统计当前登录教师自己创建的试卷数据
- **响应**:
```typescript
{
  total: number;            // 试卷总数（我创建的）
  published: number;        // 已发布数（status >= 1）
  draft: number;            // 草稿数（status = 0）
  recent: number;           // 近7天创建数
}
```
> ⚠️ 前端现状：`my-papers/index.vue` 中此数据为硬编码，需要对接此接口

### 1.3 获取最近编辑的试卷
- **接口**: `GET /paper/recent`
- **参数**: `limit?: number` (默认5)
- **响应**:
```typescript
Array<{
  id: number;
  title: string;
  courseName: string;
  updateTime: string;
  status: number;           // 0-草稿 1-已发布 2-考试中 3-已结束 4-批改中 5-已批改 6-已发布成绩
  questionCount: number;
  totalPoints: number;
}>
```

### 1.4 获取试卷列表
- **接口**: `GET /paper/list`
- **参数**:
```typescript
{
  pageNum: number;          // 页码（必填）
  pageSize?: number;        // 每页数量，默认10
  courseId?: number;        // 课程ID筛选
  status?: number;          // 状态筛选 (0-6)
  keyword?: string;         // 关键词搜索（标题/课程名）
  creatorId?: number;       // 创建者ID
}
```
- **响应**:
```typescript
{
  total: number;
  list: Array<{
    paperId: number;
    title: string;
    courseName: string;
    creatorName: string;
    status: number;
    statusText: string;
    timeLimit: number;        // 考试时长（分钟）
    totalPoints: number;
    totalQuestions: number;
    startTime?: string;
    endTime?: string;
    createTime: string;
    participantCount: number; // 参与人数
    submittedCount: number;   // 已提交人数
    gradedCount: number;      // 已批改人数
  }>
}
```

### 1.5 获取试卷详情
- **接口**: `GET /paper/detail/{paperId}`
- **响应**:
```typescript
{
  paperId: number;
  title: string;
  description?: string;
  courseId: number;
  courseName?: string;
  creatorId: number;
  creatorName?: string;
  status: number;
  timeLimit: number;
  totalPoints: number;
  totalQuestions: number;
  startTime?: string;
  endTime?: string;
  createTime: string;
  updateTime: string;
  questionGroups: Array<{
    groupId: number;
    groupName: string;        // 如"一、单选题"
    questionType: number;     // 1-单选 2-多选 3-判断 4-填空 5-简答 6-论述 7-矩阵单选 8-矩阵多选 9-连线 10-排序 11-滑动评分 12-NPS评分 13-星级评分 14-组合材料
    sortOrder: number;
    questions: Array<Question>;
  }>;
}
```

### 1.6 创建试卷
- **接口**: `POST /paper/create`
- **请求体**:
```typescript
{
  title: string;              // 试卷标题（必填）
  description?: string;
  courseId: number;           // 课程ID（必填）
  timeLimit: number;          // 考试时长（必填）
  questionGroups: Array<{
    groupName: string;
    questionType: number;
    questions: Array<{
      questionType: number;
      title: string;
      stem: string;           // 题干
      options?: Array<{ key: string; content: string }>;
      correctAnswer?: string;
      correctAnswers?: string[];
      referenceAnswer?: string;
      analysis?: string;
      points: number;
      difficulty?: number;    // 1-5
      knowledgePoints?: string[];
      // 矩阵题专用字段 (questionType=7,8)
      matrixRows?: Array<{ key: string; content: string }>;
      matrixColumns?: Array<{ key: string; content: string }>;
      // 连线题专用字段 (questionType=9)
      matchingLeft?: Array<{ key: string; content: string }>;
      matchingRight?: Array<{ key: string; content: string }>;
      matchingCorrect?: Array<{ left: string; right: string }>;
      // 排序题专用字段 (questionType=10)
      orderItems?: Array<{ key: string; content: string }>;
      correctOrder?: string[];
      // 滑动评分专用字段 (questionType=11)
      sliderMin?: number;       // 最小值，默认0
      sliderMax?: number;       // 最大值，默认100
      sliderStep?: number;      // 步长，默认1
      sliderLabels?: { min: string; max: string }; // 两端标签
      // NPS评分专用字段 (questionType=12)
      npsMin?: number;          // 最小值，固定0
      npsMax?: number;          // 最大值，固定10
      npsLabels?: { min: string; max: string }; // 如"完全不推荐"/"强烈推荐"
      // 星级评分专用字段 (questionType=13)
      starCount?: number;       // 星星数量，默认5
      starLabels?: string[];    // 各星级标签，如["很差","较差","一般","较好","很好"]
      // 组合材料题专用字段 (questionType=14)
      material?: string;        // 材料/阅读文本
      subQuestions?: Array<{    // 子题目列表
        subType: string;        // radio/checkbox/input/textarea
        stem: string;
        options?: Array<{ key: string; content: string }>;
        correctAnswer?: string;
        correctAnswers?: string[];
        referenceAnswer?: string;
        points: number;
      }>;
    }>;
  }>;
}
```
- **响应**: `{ paperId: number }`

### 1.7 更新试卷
- **接口**: `POST /paper/update`
- **请求体**:
```typescript
{
  paperId: number;            // 必填
  title?: string;
  description?: string;
  timeLimit?: number;
  questionGroups?: Array<{
    groupId?: number;         // 已有分组传ID，新分组不传
    groupName: string;
    questionType: number;
    questions: Array<{
      questionId?: number;    // 已有题目传ID
      // ...其他题目字段
    }>;
  }>;
}
```

### 1.8 删除试卷
- **接口**: `POST /paper/delete`
- **请求体**: `{ paperId: number }`

---

## 二、试卷发布

### 2.1 发布试卷（基础）
- **接口**: `POST /paper/publish`
- **请求体**:
```typescript
{
  paperId: number;
  config: {
    targetType: number;       // 1-全部学生 2-指定班级 3-指定学生
    targetIds?: number[];     // 班级ID或学生ID列表
    startTime: string;        // 开始时间
    endTime: string;          // 结束时间
    allowLateSubmit?: boolean;
    lateSubmitDeadline?: string;
    shuffleQuestions?: boolean;
    shuffleOptions?: boolean;
    showAnalysis?: boolean;
    showCorrectAnswer?: boolean;
  };
}
```

### 2.2 发布试卷（高级配置）
- **接口**: `POST /paper/publish-advanced`
- **请求体**:
```typescript
{
  paperId: number;
  config: {
    // 基础配置（同上）
    targetType: number;
    targetIds?: number[];
    startTime: string;
    endTime: string;
    // 防作弊设置
    antiCheat?: {
      ipRestriction?: boolean;        // IP限制
      browserFingerprint?: boolean;   // 浏览器指纹检测
      preventWindowSwitch?: boolean;  // 禁止切换窗口
      maxWindowSwitchWarnings?: number;
    };
    // 补考设置
    retake?: {
      allowRetake?: boolean;
      maxRetakeCount?: number;
      retakeStartTime?: string;
      retakeEndTime?: string;
      useOriginalQuestions?: boolean;
    };
    // 成绩设置
    scoring?: {
      passScore?: number;             // 及格分数线
      useHighestScore?: boolean;      // 取最高分
    };
  };
}
```

### 2.3 撤回发布
- **接口**: `POST /paper/unpublish`
- **请求体**: `{ paperId: number }`

### 2.4 获取可发布的班级列表
- **接口**: `GET /paper/publish/classes`
- **参数**: `courseId: number`
- **响应**:
```typescript
Array<{
  classId: number;
  className: string;
  studentCount: number;
}>
```

### 2.5 获取可发布的学生列表
- **接口**: `GET /paper/publish/students`
- **参数**:
```typescript
{
  courseId: number;
  classId?: number;
  keyword?: string;
}
```
- **响应**:
```typescript
Array<{
  studentId: number;
  studentName: string;
  studentNo: string;
  className: string;
}>
```

---

## 三、阅卷管理

### 3.1 获取阅卷统计数据
- **接口**: `GET /paper/grading/statistics`
- **响应**:
```typescript
{
  pending: number;    // 待阅卷试卷数
  grading: number;    // 阅卷中试卷数
  completed: number;  // 已完成试卷数
  total: number;      // 总答卷数
}
```

### 3.2 获取待阅卷试卷列表
- **接口**: `GET /paper/grading/list`
- **参数**:
```typescript
{
  pageNum: number;
  pageSize?: number;
  keyword?: string;
  status?: 'pending' | 'grading' | 'completed';
  courseId?: number;
}
```
- **响应**:
```typescript
{
  total: number;
  list: Array<{
    id: number;
    paperTitle: string;
    courseName: string;
    studentCount: number;
    gradedCount: number;
    pendingCount: number;
    status: 'pending' | 'grading' | 'completed';
    deadline: string;
    publishTime: string;
  }>;
}
```

### 3.3 获取答卷列表
- **接口**: `GET /paper/submission/list`
- **参数**:
```typescript
{
  paperId: number;        // 必填
  pageNum: number;
  pageSize?: number;
  submitStatus?: number;  // 0-未提交 1-已提交 2-迟交
  gradeStatus?: number;   // 0-未批改 1-批改中 2-已批改
  keyword?: string;       // 学生姓名/学号
}
```
- **响应**:
```typescript
{
  total: number;
  list: Array<{
    submissionId: number;
    paperId: number;
    paperTitle: string;
    studentId: number;
    studentName: string;
    studentNo: string;
    className: string;
    submitStatus: number;
    submitTime?: string;
    startTime?: string;
    duration?: number;      // 用时（秒）
    totalScore?: number;
    score?: number;
    gradeStatus: number;
    graderId?: number;
    graderName?: string;
    gradeTime?: string;
  }>;
}
```

### 3.4 获取答卷详情
- **接口**: `GET /paper/submission/detail/{submissionId}`
- **响应**:
```typescript
{
  // 基本信息同上
  answers: Array<{
    questionId: number;
    answer: string | string[];
    score?: number;
    comment?: string;
    isCorrect?: boolean;
  }>;
}
```

### 3.5 提交批改
- **接口**: `POST /paper/grade/submit`
- **请求体**:
```typescript
{
  submissionId: number;
  grades: Array<{
    questionId: number;
    score: number;
    comment?: string;
  }>;
}
```

### 3.6 批量自动批改（客观题）
- **接口**: `POST /paper/grade/auto`
- **请求体**: `{ paperId: number }`
- **响应**: `{ gradedCount: number }`

### 3.7 发布成绩
- **接口**: `POST /paper/score/release`
- **请求体**: `{ paperId: number }`

### 3.8 导出答卷
- **接口**: `GET /paper/submission/export`
- **参数**:
```typescript
{
  paperId: number;
  submissionIds?: number[];
  format: 'word' | 'pdf' | 'excel';
  includeAnswer?: boolean;
  includeScore?: boolean;
}
```
- **响应**: `{ downloadUrl: string }`

---

## 四、统计分析

### 4.1 获取试卷统计数据
- **接口**: `GET /paper/statistics/{paperId}`
- **响应**:
```typescript
{
  paperId: number;
  paperTitle: string;
  participantCount: number;
  submittedCount: number;
  gradedCount: number;
  averageScore: number;
  maxScore: number;
  minScore: number;
  passRate: number;         // 0-1
  excellentRate: number;    // >=90分占比
  scoreDistribution: Array<{
    range: string;          // 如"0-59"
    count: number;
    percentage: number;
  }>;
  questionAccuracy: Array<{
    questionId: number;
    questionTitle: string;
    accuracy: number;       // 正确率 0-1
  }>;
}
```

### 4.2 获取学情分析数据
- **接口**: `GET /paper/learning-analytics`
- **参数**:
```typescript
{
  courseId?: number;
  startDate?: string;
  endDate?: string;
}
```
- **响应**:
```typescript
{
  overview: {
    totalExams: number;
    totalStudents: number;
    avgScore: number;
    passRate: number;
  };
  scoreDistribution: Array<{ range: string; count: number; percentage: number }>;
  knowledgePoints: Array<{ name: string; mastery: number; questionCount: number }>;
  questionTypeStats: Array<{ type: string; correctRate: number; avgTime: number }>;
  examTrends: Array<{ date: string; avgScore: number; passRate: number }>;
  studentRanking: Array<{
    rank: number;
    name: string;
    studentId: string;
    score: number;
    trend: 'up' | 'down' | 'same';
  }>;
}
```

---

## 五、题库管理

### 5.1 获取题库列表
- **接口**: `GET /question-bank/list`
- **参数**:
```typescript
{
  pageNum: number;
  pageSize?: number;
  keyword?: string;
  type?: string;            // radio/checkbox/judge/input/textarea/textarea-essay/matrix-single/matrix-multiple/matching/ordering/slider/nps-rating/star-rating/composite
  difficulty?: string;      // easy/medium/hard
  knowledgePoint?: string;
  folderId?: number;
}
```
- **响应**:
```typescript
{
  total: number;
  list: Array<{
    id: number;
    type: string;
    typeName: string;
    stem: string;
    options?: Array<{ key: string; content: string }>;
    correctAnswer?: string;
    correctAnswers?: string[];
    blanks?: Array<{ answer: string }>;
    referenceAnswer?: string;
    analysis?: string;
    knowledgePoints: string[];
    difficulty: string;
    difficultyName: string;
    points: number;
    createTime: string;
    useCount: number;
    folderId?: number;
    folderName?: string;
    subject?: string;
    subjectName?: string;
    // 矩阵题
    matrixRows?: Array<{ key: string; content: string }>;
    matrixColumns?: Array<{ key: string; content: string }>;
    // 连线题
    matchingLeft?: Array<{ key: string; content: string }>;
    matchingRight?: Array<{ key: string; content: string }>;
    matchingCorrect?: Array<{ left: string; right: string }>;
    // 排序题
    orderItems?: Array<{ key: string; content: string }>;
    correctOrder?: string[];
    // 滑动评分
    sliderMin?: number;
    sliderMax?: number;
    sliderStep?: number;
    sliderLabels?: { min: string; max: string };
    // NPS评分
    npsMin?: number;
    npsMax?: number;
    npsLabels?: { min: string; max: string };
    // 星级评分
    starCount?: number;
    starLabels?: string[];
    // 组合材料题
    material?: string;
    subQuestions?: Array<{
      subType: string;
      stem: string;
      options?: Array<{ key: string; content: string }>;
      correctAnswer?: string;
      correctAnswers?: string[];
      referenceAnswer?: string;
      points: number;
    }>;
  }>;
}
```

### 5.2 搜索题库题目
- **接口**: `GET /question-bank/search`
- **参数**: 同 5.1
- **响应**: 同 5.1

### 5.3 获取题库统计数据
- **接口**: `GET /question-bank/statistics`
- **响应**:
```typescript
{
  total: number;
  radio: number;
  checkbox: number;
  judge: number;
  input: number;
  textarea: number;
  'textarea-essay': number;
  'matrix-single': number;
  'matrix-multiple': number;
  matching: number;
  ordering: number;
  slider: number;
  'nps-rating': number;
  'star-rating': number;
  composite: number;
}
```

### 5.4 创建题目
- **接口**: `POST /question-bank/create`
- **请求体**: 题目完整信息
- **响应**: `{ id: number }`

### 5.5 更新题目
- **接口**: `POST /question-bank/update`
- **请求体**: 题目完整信息（含id）

### 5.6 删除题目
- **接口**: `POST /question-bank/delete`
- **请求体**: `{ id: number }`

### 5.7 批量删除题目
- **接口**: `POST /question-bank/batch-delete`
- **请求体**: `{ ids: number[] }`

### 5.8 导入题目
- **接口**: `POST /question-bank/import`
- **请求体**:
```typescript
{
  file?: File;
  questions?: Array<QuestionItem>;
  folderId?: number;
}
```
- **响应**: `{ importedCount: number; failedCount: number }`

### 5.9 导出题目
- **接口**: `GET /question-bank/export`
- **参数**:
```typescript
{
  ids?: number[];
  folderId?: number;
  format?: 'json' | 'excel' | 'word';
}
```
- **响应**: `{ downloadUrl: string }`

### 5.10 归档题目到题库
- **接口**: `POST /question-bank/archive`
- **请求体**: `{ questions: Array<QuestionItem> }`
- **响应**: `{ archivedCount: number }`

### 5.11 批量归档题目
- **接口**: `POST /question-bank/batch-archive`
- **请求体**: `{ questions: Array<QuestionItem> }`
- **响应**: `{ archivedCount: number }`

---

## 六、题库文件夹管理

### 6.1 获取文件夹列表
- **接口**: `GET /question-bank/folders`
- **响应**:
```typescript
Array<{
  id: number;
  name: string;
  parentId?: number;
  questionCount: number;
  createTime: string;
  children?: Array<...>;
}>
```

### 6.2 创建文件夹
- **接口**: `POST /question-bank/folders/create`
- **请求体**: `{ name: string; parentId?: number }`
- **响应**: `{ id: number }`

### 6.3 更新文件夹
- **接口**: `POST /question-bank/folders/update`
- **请求体**: `{ id: number; name: string }`

### 6.4 删除文件夹
- **接口**: `POST /question-bank/folders/delete`
- **请求体**: `{ id: number }`

### 6.5 移动题目到文件夹
- **接口**: `POST /question-bank/move-to-folder`
- **请求体**: `{ questionIds: number[]; folderId: number }`

---

## 七、试卷文件夹管理

### 7.1 获取试卷文件夹列表
- **接口**: `GET /paper/folders`
- **响应**:
```typescript
Array<{
  id: number;
  name: string;
  parentId?: number;
  paperCount: number;
  createTime: string;
  children?: Array<...>;
}>
```

### 7.2 创建试卷文件夹
- **接口**: `POST /paper/folders/create`
- **请求体**: `{ name: string; parentId?: number }`
- **响应**: `{ id: number }`

### 7.3 更新试卷文件夹
- **接口**: `POST /paper/folders/update`
- **请求体**: `{ id: number; name: string }`

### 7.4 删除试卷文件夹
- **接口**: `POST /paper/folders/delete`
- **请求体**: `{ id: number }`
- **说明**: 删除文件夹后，文件夹内的试卷将移至"全部试卷"（folderId 置为 null）

### 7.5 移动试卷到文件夹
- **接口**: `POST /paper/move-to-folder`
- **请求体**: `{ paperIds: number[]; folderId: number }`

---

## 八、模板管理

### 8.1 获取我的模板列表
- **接口**: `GET /paper/template/my`
- **响应**:
```typescript
Array<{
  id: number;
  name: string;
  description?: string;
  questionTypes: string[];
  totalQuestions: number;
  totalPoints: number;
  createTime: string;
}>
```

### 8.2 获取模板详情
- **接口**: `GET /paper/template/{templateId}`
- **响应**:
```typescript
{
  title: string;
  description?: string;
  timeLimit: number;
  questionGroups: Array<QuestionGroup>;
}
```

### 8.3 保存为模板
- **接口**: `POST /paper/save-as-template`
- **请求体**:
```typescript
{
  name: string;
  description?: string;
  questionGroups: Array<QuestionGroup>;
}
```
- **响应**: `{ templateId: number }`

### 8.4 创建空白模板
- **接口**: `POST /paper/template/create`
- **请求体**: `{ name: string; description?: string }`
- **响应**: `{ templateId: number }`

### 8.5 删除模板
- **接口**: `POST /paper/template/delete`
- **请求体**: `{ templateId: number }`

### 8.6 获取系统模板统计数据
- **接口**: `GET /paper/template/system/stats`
- **说明**: 系统模板基本信息在前端定义，此接口仅返回动态统计（主要是使用人数）
- **响应**:
```typescript
Array<{
  templateKey: string;      // standard | quick | comprehensive | survey
  questionCount: number;
  totalPoints: number;
  useCount: number;         // 使用人数（动态统计）
}>
```

**系统模板 templateKey 对照表**:

| templateKey | 模板名称 | 题目构成 | 题数 | 总分 |
|---|---|---|---|---|
| standard | 标准考试模板 | 单选10道(2分)·多选5道(4分)·填空5道(4分)·大题10道(4分) | 30 | 100 |
| quick | 快速测验模板 | 单选3道(5分)·多选2道(5分) | 5 | 25 |
| comprehensive | 综合能力测试 | 单选10道(3分)·简答5道(9分) | 15 | 75 |
| survey | 学情调查问卷 | 单选10道(4分)·多选2道(5分)·简答5道(10分)·判断5道(4分) | 22 | 120 |

### 8.7 获取系统模板预览（题目详情）
- **接口**: `GET /paper/template/system/preview`
- **参数**: `templateKey: string` (standard | quick | comprehensive | survey)
- **说明**: 返回系统模板的完整题目结构，用于预览
- **响应**:
```typescript
{
  templateKey: string;
  name: string;
  description: string;
  totalQuestions: number;
  totalPoints: number;
  questionGroups: Array<{
    groupName: string;        // 如"一、单选题"
    questionType: string;     // radio/checkbox/input/textarea/judge
    count: number;            // 题目数量
    pointsPerQuestion: number; // 每题分值
    subtotal: number;         // 小计分数
    sampleQuestions: Array<{  // 示例题目（可选，用于预览展示）
      stem: string;
      options?: Array<{ key: string; content: string }>;
    }>;
  }>;
}
```

---

## 九、AI 功能

### 9.1 AI 生成题目
- **接口**: `POST /ai/generate-question`
- **请求体**:
```typescript
{
  knowledgePoints: string;
  questionType: string;       // radio/checkbox/judge/input/textarea/textarea-essay/matrix-single/matrix-multiple/matching/ordering/slider/nps-rating/star-rating/composite
  difficulty: string;         // easy/medium/hard
  count: number;
  includeAnalysis: boolean;
  mode?: 'generate' | 'recommend' | 'polish';
  excludeQuestionIds?: number[];  // recommend模式排除已有题目
  polishMode?: boolean;
  originalContent?: string;
}
```
- **响应**:
```typescript
Array<{
  id: number;
  type: string;
  stem: string;
  options?: Array<{ key: string; content: string }>;
  correctAnswer?: string;
  correctAnswers?: string[];
  blanks?: Array<{ answer: string }>;
  referenceAnswer?: string;
  analysis?: string;
  difficulty: string;
  knowledgePoints: string[];
}>
```

### 9.2 AI 分析试卷
- **接口**: `POST /ai/paper/analyze`
- **请求体**:
```typescript
{
  questionGroups: Array<{
    groupName: string;
    questionType: string;
    questions: Array<{
      stem: string;
      points: number;
      difficulty?: number;
      knowledgePoints?: string[];
    }>;
  }>;
}
```
- **响应**:
```typescript
{
  difficulty: number;           // 1-5
  difficultyDescription: string;
  knowledgeCoverage: number;    // 0-100
  typeBalance: number;          // 0-100
  estimatedTime: number;        // 分钟
  overallScore: number;         // 0-100
  questionTypeDistribution: Array<{
    name: string;
    type: string;
    count: number;
    percentage: number;
  }>;
  suggestions: string[];
}
```

---

## 十、知识点管理

### 10.1 获取知识点列表
- **接口**: `GET /knowledge-points`
- **响应**:
```typescript
Array<{
  id: number;
  name: string;
  parentId?: number;
  questionCount: number;
  children?: Array<...>;
}>
```

---

## 十一、课程相关

### 11.1 获取课程列表
- **接口**: `GET /course/list`
- **响应**: `Array<{ id: number; name: string }>`

---

## 附录：枚举值定义

### 试卷状态 (PaperStatus)
| 值 | 含义 |
|---|---|
| 0 | 草稿 |
| 1 | 已发布 |
| 2 | 考试中 |
| 3 | 已结束 |
| 4 | 批改中 |
| 5 | 已批改 |
| 6 | 已发布成绩 |

### 试卷状态流转说明（前后端职责划分）

> 状态流转路径：`0(草稿) → 1(已发布) → 2(考试中) → 3(已结束) → 4(批改中) → 5(已批改) → 6(已发布成绩)`

| 状态变化 | 触发条件 | 负责方 | 实现说明 |
|---|---|---|---|
| → 0 草稿 | 教师保存/自动保存试卷 | 前端调 `POST /paper/create` 或 `POST /paper/update`，后端写入 status=0 | 前端编辑器已实现 30 秒自动保存 + 离开页面提示保存 |
| 0 → 1 已发布 | 教师点击"发布"按钮 | 前端调 `POST /paper/publish` 或 `POST /paper/publish-advanced`，后端改 status=1 | 前端已实现发布按钮和配置面板 |
| 1 → 2 考试中 | 到达考试开始时间（startTime） | **后端定时任务**自动检测并更新 | 不能依赖前端触发，因为教师可能不在线。后端需要定时扫描 status=1 且 startTime ≤ 当前时间的试卷 |
| 2 → 3 已结束 | 到达考试结束时间（endTime），或所有应提交学生均已提交 | **后端定时任务** + **提交时检查** | 两种触发方式：①定时任务扫描 endTime ≤ 当前时间；②每次学生提交答卷后检查是否全部提交完成 |
| 3 → 4 批改中 | 教师开始批改第一份答卷 | **后端自动判断**：首次调用 `POST /paper/grade/submit` 时检查 | 后端在收到批改请求时，若试卷 status=3 则自动更新为 4 |
| 4 → 5 已批改 | 所有答卷批改完成 | **后端自动判断**：每次批改提交后检查 | 后端在每次 `POST /paper/grade/submit` 后检查该试卷所有答卷是否全部批改完成，若是则更新为 5 |
| 5 → 6 已发布成绩 | 教师点击"发布成绩" | 前端调 `POST /paper/score/release`，后端改 status=6 | 前端已定义 `releaseScores` API |

**后端开发要点：**
1. 需要实现**定时任务**（建议每分钟执行一次），负责 `1→2` 和 `2→3` 的自动状态流转
2. `POST /paper/grade/submit` 接口内部需要附带状态检查逻辑，负责 `3→4` 和 `4→5` 的自动流转
3. 前端只负责主动触发 `→0`、`0→1`、`5→6` 三个状态变化，其余均由后端自动处理
4. `GET /paper/recent` 返回的 status 字段直接从数据库读取即可，前端已有完整的 7 种状态展示能力（`getPaperStatusText` / `getPaperStatusType` 工具函数）

### 题型 (QuestionType)
| 值 | 含义 | 前端type |
|---|---|---|
| 1 | 单选题 | radio |
| 2 | 多选题 | checkbox |
| 3 | 判断题 | judge |
| 4 | 填空题 | input |
| 5 | 简答题 | textarea |
| 6 | 论述题 | textarea-essay |
| 7 | 矩阵单选 | matrix-single |
| 8 | 矩阵多选 | matrix-multiple |
| 9 | 连线题 | matching |
| 10 | 排序题 | ordering |
| 11 | 滑动评分 | slider |
| 12 | NPS评分 | nps-rating |
| 13 | 星级评分 | star-rating |
| 14 | 组合材料题 | composite |

### 难度等级
| 值 | 含义 |
|---|---|
| easy | 简单 |
| medium | 中等 |
| hard | 困难 |

### 发布目标类型
| 值 | 含义 |
|---|---|
| 1 | 全部学生 |
| 2 | 指定班级 |
| 3 | 指定学生 |