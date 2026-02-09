# 在线组卷编辑器系统设计文档 - 第二部分

## 四、数据模型设计

### 4.1 题目类型枚举

```typescript
// types/exam-paper.d.ts

/** 题目类型枚举 */
export enum QuestionType {
  SINGLE_CHOICE = 1,    // 单选题
  MULTIPLE_CHOICE = 2,  // 多选题
  TRUE_FALSE = 3,       // 判断题
  FILL_BLANK = 4,       // 填空题
  SHORT_ANSWER = 5,     // 简答题
  ESSAY = 6,            // 论述题
  MATCHING = 7,         // 连线题/匹配题
  COMPOSITE = 8         // 组合题/材料题
}

/** 试卷状态枚举 */
export enum PaperStatus {
  DRAFT = 0,      // 草稿
  PUBLISHED = 1,  // 已发布
  CLOSED = 2,     // 已关闭ARCHIVED = 3    // 已归档
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

/**阅卷状态枚举 */
export enum GradingStatus {
  NOT_GRADED = 0,      // 未阅卷
  PARTIAL_GRADED = 1,  // 部分阅卷
  FULLY_GRADED = 2     // 已完成阅卷
}
```

### 4.2 核心数据结构

```typescript
/** 选项数据结构 */
export interface QuestionOption {
  key: string;      // 选项标识 A/B/C/D...
  content: string;  // 选项内容（支持HTML）
  isCorrect?: boolean; // 是否正确答案（多选题用）
}

/** 填空答案数据结构 */
export interface BlankAnswer {
  index: number;    // 空的序号
  answer: string;   // 答案（支持多个正确答案，用|分隔）
  points: number;   // 该空分值
}

/** 匹配项数据结构 */
export interface MatchingItem {
  leftId: string;   // 左侧项ID
  left: string;     // 左侧内容
  rightId: string;  // 右侧项ID
  right: string;    // 右侧内容
}

/** 题目基础数据结构 */
export interface Question {
  questionId?: number;
  questionType: QuestionType;
  title: string;               // 题目标题（简短描述）
  stem: string;                // 题干内容（支持HTML）
  options?: QuestionOption[];  // 选项（选择题用）
  correctAnswer?: string;      // 正确答案
  blanks?: BlankAnswer[];      // 填空答案
  matchingItems?: MatchingItem[]; // 匹配项
  referenceAnswer?: string;    // 参考答案（主观题用）
  scoringCriteria?: string;    // 评分标准
  analysis?: string;           // 答案解析
  points: number;              // 分值
  difficulty: number;          // 难度等级 1-5
  sortOrder: number;           // 排序序号
  tags?: string[];             // 标签
  images?: string[];           // 图片URL列表
}

/** 题型分组数据结构 */
export interface QuestionGroup {
  groupId?: number;
  groupName: string;       // 分组名称（如"一、单选题"）
  questionType: QuestionType;
  questions: Question[];
  totalPoints: number;     // 该组总分
  sortOrder: number;       // 排序序号
}

/** 试卷数据结构 */
export interface ExamPaper {
  paperId?: number;
  title: string;           // 试卷标题
  description?: string;    // 试卷说明
  courseId?: number;       // 所属课程ID
  courseName?: string;     // 课程名称
  creatorId?: number;      // 创建者ID
  creatorName?: string;    // 创建者名称
  questionGroups: QuestionGroup[];  // 题型分组列表
  totalQuestions: number;  // 总题数
  totalPoints: number;     // 总分
  timeLimit?: number;      // 考试时长（分钟）
  status: PaperStatus;     // 试卷状态
  createTime?: string;
  updateTime?: string;
}
```

### 4.3 发布配置数据结构

```typescript
/** 发布配置数据结构 */
export interface PublishConfig {
  paperId: number;
  publishType: PublishType;
  course