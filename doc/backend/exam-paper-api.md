# 题目组卷器模块 API 接口文档

> 教师端/管理端题目组卷器模块接口设计，共 53 个接口，方案成熟可直接交付后端开发。

## 一、试卷管理（14个）

| 序号 | 接口名称 | 方法 | 路径 | 作用 |
|------|---------|------|------|------|
| 1 | `getOverviewStatistics` | GET | /edu/backend/v1/paper/overview/statistics | 获取总览统计数据（试卷总数、已发布数、待阅卷数、平均分） |
| 2 | `getRecentPapers` | GET | /edu/backend/v1/paper/recent | 获取最近编辑的试卷列表 |
| 3 | `getPaperList` | GET | /edu/backend/v1/paper/list | 获取试卷列表（分页、筛选） |
| 4 | `getPaperDetail` | GET | /edu/backend/v1/paper/detail/:paperId | 获取试卷详情（含题目分组） |
| 5 | `createPaper` | POST | /edu/backend/v1/paper/create | 创建试卷 |
| 6 | `updatePaper` | POST | /edu/backend/v1/paper/update | 更新试卷 |
| 7 | `deletePaper` | POST | /edu/backend/v1/paper/delete | 删除试卷 |
| 8 | `saveAsTemplate` | POST | /edu/backend/v1/paper/save-as-template | 保存为私有模板 |
| 9 | `getMyTemplates` | GET | /edu/backend/v1/paper/template/my | 获取我的模板列表 |
| 10 | `getTemplateDetail` | GET | /edu/backend/v1/paper/template/:templateId | 获取模板详情 |
| 11 | `createTemplate` | POST | /edu/backend/v1/paper/template/create | 创建空白模板 |
| 12 | `deleteTemplate` | POST | /edu/backend/v1/paper/template/delete | 删除模板 |
| 13 | `getPaperStatistics` | GET | /edu/backend/v1/paper/statistics/:paperId | 获取试卷统计数据 |
| 14 | `getSystemTemplateStats` | GET | /edu/backend/v1/paper/template/system/stats | 获取系统模板统计数据（题数、分值、使用人数） |

## 二、试卷发布（5个）

| 序号 | 接口名称 | 方法 | 路径 | 作用 |
|------|---------|------|------|------|
| 9 | `publishPaper` | POST | /edu/backend/v1/paper/publish | 发布试卷（基础配置） |
| 10 | `publishPaperAdvanced` | POST | /edu/backend/v1/paper/publish-advanced | 发布试卷（高级配置：防作弊、补考等） |
| 11 | `unpublishPaper` | POST | /edu/backend/v1/paper/unpublish | 撤回发布 |
| 12 | `getPublishClasses` | GET | /edu/backend/v1/paper/publish/classes | 获取可发布的班级列表 |
| 13 | `getPublishStudents` | GET | /edu/backend/v1/paper/publish/students | 获取可发布的学生列表 |

## 三、阅卷批改（8个）

| 序号 | 接口名称 | 方法 | 路径 | 作用 |
|------|---------|------|------|------|
| 17 | `getGradingStatistics` | GET | /edu/backend/v1/paper/grading/statistics | 获取阅卷统计（待阅卷/阅卷中/已完成/总答卷数） |
| 18 | `getGradingPaperList` | GET | /edu/backend/v1/paper/grading/list | 获取待阅卷试卷列表（按试卷分组） |
| 19 | `getSubmissionList` | GET | /edu/backend/v1/paper/submission/list | 获取答卷列表（阅卷用） |
| 20 | `getSubmissionDetail` | GET | /edu/backend/v1/paper/submission/detail/:submissionId | 获取答卷详情（阅卷用） |
| 21 | `submitGrade` | POST | /edu/backend/v1/paper/grade/submit | 提交批改结果 |
| 22 | `autoGradeObjective` | POST | /edu/backend/v1/paper/grade/auto | 批量自动批改客观题 |
| 23 | `releaseScores` | POST | /edu/backend/v1/paper/score/release | 发布成绩 |
| 24 | `exportSubmissions` | GET | /edu/backend/v1/paper/submission/export | 导出答卷（Word/PDF/Excel） |

## 四、题库管理（16个）

| 序号 | 接口名称 | 方法 | 路径 | 作用 |
|------|---------|------|------|------|
| 19 | `searchQuestionBank` | GET | /edu/backend/v1/question-bank/search | 搜索题库题目 |
| 20 | `getQuestionBankList` | GET | /edu/backend/v1/question-bank/list | 获取题库列表（分页） |
| 21 | `getQuestionBankStatistics` | GET | /edu/backend/v1/question-bank/statistics | 获取题库统计数据 |
| 22 | `createQuestion` | POST | /edu/backend/v1/question-bank/create | 创建题目 |
| 23 | `updateQuestion` | POST | /edu/backend/v1/question-bank/update | 更新题目 |
| 24 | `deleteQuestion` | POST | /edu/backend/v1/question-bank/delete | 删除题目 |
| 25 | `batchDeleteQuestions` | POST | /edu/backend/v1/question-bank/batch-delete | 批量删除题目 |
| 26 | `importQuestions` | POST | /edu/backend/v1/question-bank/import | 导入题目 |
| 27 | `exportQuestions` | GET | /edu/backend/v1/question-bank/export | 导出题目 |
| 28 | `archiveQuestionToBank` | POST | /edu/backend/v1/question-bank/archive | 归档题目到题库 |
| 29 | `batchArchiveToBank` | POST | /edu/backend/v1/question-bank/batch-archive | 批量归档到题库 |
| 30 | `getQuestionFolders` | GET | /edu/backend/v1/question-bank/folders | 获取文件夹列表 |
| 31 | `createQuestionFolder` | POST | /edu/backend/v1/question-bank/folders/create | 创建文件夹 |
| 32 | `updateQuestionFolder` | POST | /edu/backend/v1/question-bank/folders/update | 更新文件夹 |
| 33 | `deleteQuestionFolder` | POST | /edu/backend/v1/question-bank/folders/delete | 删除文件夹 |
| 34 | `moveQuestionsToFolder` | POST | /edu/backend/v1/question-bank/move-to-folder | 移动题目到文件夹 |

## 五、AI 智能功能（3个）

| 序号 | 接口名称 | 方法 | 路径 | 作用 |
|------|---------|------|------|------|
| 35 | `aiGenerateQuestion` | POST | /edu/backend/v1/ai/generate-question | AI 生成题目 |
| 36 | `aiAnalyzePaper` | POST | /edu/backend/v1/ai/paper/analyze | AI 分析试卷（难度、题型分布等） |
| 37 | `getKnowledgePoints` | GET | /edu/backend/v1/knowledge-points | 获取知识点列表 |

## 六、学情分析（2个）

| 序号 | 接口名称 | 方法 | 路径 | 作用 |
|------|---------|------|------|------|
| 38 | `getLearningAnalytics` | GET | /edu/backend/v1/paper/learning-analytics | 获取学情分析数据 |
| 39 | `getCourseList` | GET | /edu/backend/v1/course/list | 获取课程列表（筛选用） |

## 七、学生端（5个）

| 序号 | 接口名称 | 方法 | 路径 | 作用 |
|------|---------|------|------|------|
| 40 | `getStudentExamList` | GET | /edu/frontend/v1/exam/list | 获取学生考试列表 |
| 41 | `startExam` | POST | /edu/frontend/v1/exam/start | 开始考试 |
| 42 | `saveAnswer` | POST | /edu/frontend/v1/exam/save | 保存答案（自动保存） |
| 43 | `submitExam` | POST | /edu/frontend/v1/exam/submit | 提交试卷 |
| 44 | `getExamResult` | GET | /edu/frontend/v1/exam/result/:submissionId | 查看考试结果 |

---

## 接口统计

| 模块 | 接口数量 |
|------|---------|
| 试卷管理 | 14 |
| 试卷发布 | 5 |
| 阅卷批改 | 8 |
| 题库管理 | 16 |
| AI 智能功能 | 3 |
| 学情分析 | 2 |
| 学生端 | 5 |
| **总计** | **53** |

---

## 技术说明

- 所有接口均已定义完整的 TypeScript 类型
- 请求参数和响应结构已在 `src/api/examPaper.ts` 中定义
- Mock 数据已在 `mock/examPaper.ts` 中配置
- 前端页面已完成对接，可直接测试

## 相关文件

- API 定义：`src/api/examPaper.ts`
- Mock 数据：`mock/examPaper.ts`
- 前端文档：`doc/frontend/exam-paper-editor-complete.md`