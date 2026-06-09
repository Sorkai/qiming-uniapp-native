# 题目组卷器模块 API 接口文档

> 教师端/管理端题目组卷器模块接口设计，共 60 个接口。

## 一、试卷管理（16个）

| 序号 | 接口名称 | 方法 | 路径 | 作用 |
|------|---------|------|------|------|
| 1 | `getOverviewStatistics` | GET | /edu/backend/v1/paper/overview/statistics | 获取总览统计数据（试卷总数、已发布数、待阅卷数、平均分） |
| 2 | `getMyPaperStatistics` | GET | /edu/backend/v1/paper/my/statistics | 获取我的试卷统计数据（总数、已发布、草稿、近7天创建） |
| 3 | `getRecentPapers` | GET | /edu/backend/v1/paper/recent | 获取最近编辑的试卷列表 |
| 4 | `getPaperList` | GET | /edu/backend/v1/paper/list | 获取试卷列表（分页、筛选） |
| 5 | `getPaperDetail` | GET | /edu/backend/v1/paper/detail/:paperId | 获取试卷详情（含题目分组） |
| 6 | `createPaper` | POST | /edu/backend/v1/paper/create | 创建试卷 |
| 7 | `updatePaper` | POST | /edu/backend/v1/paper/update | 更新试卷 |
| 8 | `deletePaper` | POST | /edu/backend/v1/paper/delete | 删除试卷 |
| 9 | `saveAsTemplate` | POST | /edu/backend/v1/paper/save-as-template | 保存为私有模板 |
| 10 | `getMyTemplates` | GET | /edu/backend/v1/paper/template/my | 获取我的模板列表 |
| 11 | `getTemplateDetail` | GET | /edu/backend/v1/paper/template/:templateId | 获取模板详情 |
| 12 | `createTemplate` | POST | /edu/backend/v1/paper/template/create | 创建空白模板 |
| 13 | `deleteTemplate` | POST | /edu/backend/v1/paper/template/delete | 删除模板 |
| 14 | `getPaperStatistics` | GET | /edu/backend/v1/paper/statistics/:paperId | 获取试卷统计数据 |
| 15 | `getSystemTemplateStats` | GET | /edu/backend/v1/paper/template/system/stats | 获取系统模板统计数据（题数、分值、使用人数） |
| 16 | `getSystemTemplatePreview` | GET | /edu/backend/v1/paper/template/system/preview | 获取系统模板预览（题目结构详情） |

## 二、试卷发布（5个）

| 序号 | 接口名称 | 方法 | 路径 | 作用 |
|------|---------|------|------|------|
| 17 | `publishPaper` | POST | /edu/backend/v1/paper/publish | 发布试卷（基础配置） |
| 18 | `publishPaperAdvanced` | POST | /edu/backend/v1/paper/publish-advanced | 发布试卷（高级配置：防作弊、补考等） |
| 19 | `unpublishPaper` | POST | /edu/backend/v1/paper/unpublish | 撤回发布 |
| 20 | `getPublishClasses` | GET | /edu/backend/v1/paper/publish/classes | 获取可发布的班级列表 |
| 21 | `getPublishStudents` | GET | /edu/backend/v1/paper/publish/students | 获取可发布的学生列表 |

## 三、阅卷批改（8个）

| 序号 | 接口名称 | 方法 | 路径 | 作用 |
|------|---------|------|------|------|
| 22 | `getGradingStatistics` | GET | /edu/backend/v1/paper/grading/statistics | 获取阅卷统计（待阅卷/阅卷中/已完成/总答卷数） |
| 23 | `getGradingPaperList` | GET | /edu/backend/v1/paper/grading/list | 获取待阅卷试卷列表（按试卷分组） |
| 24 | `getSubmissionList` | GET | /edu/backend/v1/paper/submission/list | 获取答卷列表（阅卷用） |
| 25 | `getSubmissionDetail` | GET | /edu/backend/v1/paper/submission/detail/:submissionId | 获取答卷详情（阅卷用） |
| 26 | `submitGrade` | POST | /edu/backend/v1/paper/grade/submit | 提交批改结果 |
| 27 | `autoGradeObjective` | POST | /edu/backend/v1/paper/grade/auto | 批量自动批改客观题 |
| 28 | `releaseScores` | POST | /edu/backend/v1/paper/score/release | 发布成绩 |
| 29 | `exportSubmissions` | GET | /edu/backend/v1/paper/submission/export | 导出答卷（Word/PDF/Excel） |

## 四、题库管理（16个）

| 序号 | 接口名称 | 方法 | 路径 | 作用 |
|------|---------|------|------|------|
| 30 | `searchQuestionBank` | GET | /edu/backend/v1/question-bank/search | 搜索题库题目 |
| 31 | `getQuestionBankList` | GET | /edu/backend/v1/question-bank/list | 获取题库列表（分页） |
| 32 | `getQuestionBankStatistics` | GET | /edu/backend/v1/question-bank/statistics | 获取题库统计数据 |
| 33 | `createQuestion` | POST | /edu/backend/v1/question-bank/create | 创建题目 |
| 34 | `updateQuestion` | POST | /edu/backend/v1/question-bank/update | 更新题目 |
| 35 | `deleteQuestion` | POST | /edu/backend/v1/question-bank/delete | 删除题目 |
| 36 | `batchDeleteQuestions` | POST | /edu/backend/v1/question-bank/batch-delete | 批量删除题目 |
| 37 | `importQuestions` | POST | /edu/backend/v1/question-bank/import | 导入题目 |
| 38 | `exportQuestions` | GET | /edu/backend/v1/question-bank/export | 导出题目 |
| 39 | `archiveQuestionToBank` | POST | /edu/backend/v1/question-bank/archive | 归档题目到题库 |
| 40 | `batchArchiveToBank` | POST | /edu/backend/v1/question-bank/batch-archive | 批量归档到题库 |
| 41 | `getQuestionFolders` | GET | /edu/backend/v1/question-bank/folders | 获取文件夹列表 |
| 42 | `createQuestionFolder` | POST | /edu/backend/v1/question-bank/folders/create | 创建文件夹 |
| 43 | `updateQuestionFolder` | POST | /edu/backend/v1/question-bank/folders/update | 更新文件夹 |
| 44 | `deleteQuestionFolder` | POST | /edu/backend/v1/question-bank/folders/delete | 删除文件夹 |
| 45 | `moveQuestionsToFolder` | POST | /edu/backend/v1/question-bank/move-to-folder | 移动题目到文件夹 |

## 五、试卷文件夹管理（5个）

| 序号 | 接口名称 | 方法 | 路径 | 作用 |
|------|---------|------|------|------|
| 46 | `getPaperFolders` | GET | /edu/backend/v1/paper/folders | 获取试卷文件夹列表 |
| 47 | `createPaperFolder` | POST | /edu/backend/v1/paper/folders/create | 创建试卷文件夹 |
| 48 | `updatePaperFolder` | POST | /edu/backend/v1/paper/folders/update | 更新试卷文件夹 |
| 49 | `deletePaperFolder` | POST | /edu/backend/v1/paper/folders/delete | 删除试卷文件夹 |
| 50 | `movePapersToFolder` | POST | /edu/backend/v1/paper/move-to-folder | 移动试卷到文件夹 |

## 六、AI 智能功能（3个）

| 序号 | 接口名称 | 方法 | 路径 | 作用 |
|------|---------|------|------|------|
| 51 | `aiGenerateQuestion` | POST | /edu/backend/v1/ai/generate-question | AI 生成题目 |
| 52 | `aiAnalyzePaper` | POST | /edu/backend/v1/ai/paper/analyze | AI 分析试卷（难度、题型分布等） |
| 53 | `getKnowledgePoints` | GET | /edu/backend/v1/knowledge-points | 获取知识点列表 |

## 七、学情分析（2个）

| 序号 | 接口名称 | 方法 | 路径 | 作用 |
|------|---------|------|------|------|
| 54 | `getLearningAnalytics` | GET | /edu/backend/v1/paper/learning-analytics | 获取学情分析数据 |
| 55 | `getCourseList` | GET | /edu/backend/v1/course/list | 获取课程列表（筛选用） |

## 八、学生端（5个）

| 序号 | 接口名称 | 方法 | 路径 | 作用 |
|------|---------|------|------|------|
| 56 | `getStudentExamList` | GET | /edu/frontend/v1/exam/list | 获取学生考试列表 |
| 57 | `startExam` | POST | /edu/frontend/v1/exam/start | 开始考试 |
| 58 | `saveAnswer` | POST | /edu/frontend/v1/exam/save | 保存答案（自动保存） |
| 59 | `submitExam` | POST | /edu/frontend/v1/exam/submit | 提交试卷 |
| 60 | `getExamResult` | GET | /edu/frontend/v1/exam/result/:submissionId | 查看考试结果 |

---

## 接口统计

| 模块 | 接口数量 |
|------|---------:|
| 试卷管理 | 16 |
| 试卷发布 | 5 |
| 阅卷批改 | 8 |
| 题库管理 | 16 |
| 试卷文件夹管理 | 5 |
| AI 智能功能 | 3 |
| 学情分析 | 2 |
| 学生端 | 5 |
| **总计** | **60** |

---

## 支持的题型（14种）

| 编号 | 题型 | 前端type | 说明 |
|------|------|----------|------|
| 1 | 单选题 | radio | 选项A/B/C/D，单选 |
| 2 | 多选题 | checkbox | 选项A/B/C/D，多选 |
| 3 | 判断题 | judge | 对/错 |
| 4 | 填空题 | input | 支持多个填空 |
| 5 | 简答题 | textarea | 文本作答 |
| 6 | 论述题 | textarea-essay | 长文本作答 |
| 7 | 矩阵单选 | matrix-single | 行×列矩阵，每行单选 |
| 8 | 矩阵多选 | matrix-multiple | 行×列矩阵，每行多选 |
| 9 | 连线题 | matching | 左右配对连线 |
| 10 | 排序题 | ordering | 拖拽排序 |
| 11 | 滑动评分 | slider | 0-100滑块评分 |
| 12 | NPS评分 | nps-rating | 0-10推荐意愿评分 |
| 13 | 星级评分 | star-rating | 1-5星评分 |
| 14 | 组合材料题 | composite | 材料+多个子题目 |

> 详细数据结构见 `doc/backend/exam-paper-api-complete.md`

## 技术说明

- 所有接口均已定义完整的 TypeScript 类型
- 请求参数和响应结构已在 `src/api/examPaper.ts` 中定义
- Mock 数据已在 `mock/examPaper.ts` 中配置
- 前端页面已完成对接，可直接测试

## 相关文件

- API 定义：`src/api/examPaper.ts`
- Mock 数据：`mock/examPaper.ts`
- 前端文档：`doc/frontend/exam-paper-editor-complete.md`