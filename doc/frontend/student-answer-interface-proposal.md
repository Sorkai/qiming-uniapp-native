# 学生端答题界面接口方案（基于现有教师端组卷器）

## 1. 现有教师端/管理员端组卷器文档定位

以下文档是当前仓库中可直接用于开发的主文档：

- `doc/backend/exam-paper-api-complete.md`
  - 教师端/管理端完整接口定义（创建、更新、发布、阅卷、统计）
  - 包含试卷状态流转职责划分
- `doc/backend/exam-paper-api.md`
  - 60 个接口总览（含学生端 5 个基础接口）
- `doc/frontend/exam-paper-editor-complete.md`
  - 组卷编辑器前端交互与页面结构（自动保存、发布、预览等）
- `doc/backend/student-exam-api.md`
  - 学生考试接口专项文档（含保存时长、结果查看等）
- `doc/frontend/student-exam-center.md`
  - 学生试卷中心功能文档（列表/详情/答题入口）

## 2. 现状对齐（代码与文档）

### 2.1 已落地的学生端能力

当前前端已存在：

- 试卷列表页：`src/views/exam-paper/student-center/index.vue`
- 试卷详情页：`src/views/exam-paper/student-center/detail.vue`
- 在线答题页：`src/views/exam-paper/do/index.vue`
- 路由入口：`/student-exam-center/do/:id`
- API 封装：`src/api/examPaper.ts`
  - `getStudentPaperList`
  - `startExam`
  - `saveAnswer`
  - `saveDuration`
  - `getQuestionDuration`
  - `submitExam`
  - `getExamResult`

### 2.2 已对齐项（你提到的“学生端主页面试卷中心”）

你在学生端主页面新开的“试卷中心”入口，当前是**已对齐并生效**的：

- 学生菜单路由模块已存在：`src/router/modules/studentExamCenter.ts`
- 菜单仅学生可见：`roles: ["student"]`
- 主入口路径：`/student-exam-center`
- 列表页路径：`/student-exam-center/list`
- 页面标题当前为：`试题试卷中心`（如果你希望统一成“试卷中心”，可只改路由 meta.title 和页面标题文案）

### 2.3 已完成的关键对齐

1) 学生详情接口脱敏化
- 已从教师端详情接口切换为学生端接口：`GET /edu/frontend/v1/paper/detail/:paperId`
- 学生端详情不再依赖教师侧完整 DTO

2) 学生答题页题型对齐到 14 种
- 学生答题页已补齐矩阵、连线、排序、滑动评分、NPS评分、星级评分、组合材料题作答能力
- 题型识别兼容数字枚举与字符串ID（与教师编辑器一致）

3) 成绩页路由闭环
- 已新增结果页并接入 `GET /edu/frontend/v1/exam/result/:submissionId`
- 列表页“查看成绩”可直达结果页

4) 学生端会话增强接口预留
- 前端已定义 `save-batch`、`session`、`heartbeat`、`anti-cheat/event` 封装，便于后端直接实现联调

### 2.4 统一后端文档

已输出统一契约文档（教师管理端 + 学生试卷中心）：

- `doc/backend/exam-paper-unified-frontend-contract.md`

## 3. 学生端答题界面建议接口（按优先级）

## 3.1 P0（必须）

### A. 获取学生可答试卷列表
- 方法: GET
- 路径: `/edu/frontend/v1/paper/list`
- 用途: 列表页、状态统计、筛选
- 关键返回:
  - `list[]`（状态、时长、分值、submissionId、retake 信息）
  - `statistics`（available/submitted/graded/completed/expired/retake）

### B. 获取学生试卷详情（脱敏预览）
- 方法: GET
- 路径: `/edu/frontend/v1/paper/detail/:paperId`
- 用途: 详情页展示与考前确认
- 关键要求:
  - 返回题目结构与展示所需内容
  - 不返回标准答案字段（如 correctAnswer、analysis）

### C. 开始考试（幂等）
- 方法: POST
- 路径: `/edu/frontend/v1/exam/start`
- 请求: `{ paperId }`
- 返回:
  - `submissionId`
  - `paper`（学生作答 DTO）
  - `remainingTime`
  - `serverTime`（建议新增，用于前后端时间校准）
- 说明:
  - 若该学生已有未提交答卷，应返回同一 `submissionId`（继续作答）

### D. 自动保存答案
- 方法: POST
- 路径: `/edu/frontend/v1/exam/save`
- 请求: `{ submissionId, questionId, answer }`
- 返回建议:
  - `savedAt`
  - `version`（可选，用于并发覆盖控制）

### E. 记录题目答题时长
- 方法: POST
- 路径: `/edu/frontend/v1/exam/save-duration`
- 请求: `{ submissionId, questionId, enterTime, leaveTime }`
- 返回: `{ duration }`

### F. 提交试卷
- 方法: POST
- 路径: `/edu/frontend/v1/exam/submit`
- 请求: `{ submissionId }`
- 返回:
  - `showScore`
  - `score`（可选）
  - `submissionId`

### G. 查看考试结果
- 方法: GET
- 路径: `/edu/frontend/v1/exam/result/:submissionId`
- 用途: 成绩页、答题回顾
- 关键要求:
  - 按发布策略返回是否展示正确答案/解析
  - 返回各题得分、评语、总分、用时

## 3.2 P1（强烈建议）

### H. 获取考试会话快照（恢复作答）
- 方法: GET
- 路径: `/edu/frontend/v1/exam/session/:submissionId`
- 用途: 刷新页面或断网重连后恢复
- 返回:
  - `remainingTime`
  - `answers[]`
  - `questionDurations[]`
  - `status`（in_progress/submitted/expired）

### I. 心跳接口（防掉线、在线状态）
- 方法: POST
- 路径: `/edu/frontend/v1/exam/heartbeat`
- 请求: `{ submissionId, clientTime }`
- 用途: 记录在线状态、异常检测、超时保护

### J. 防作弊事件上报
- 方法: POST
- 路径: `/edu/frontend/v1/exam/anti-cheat/event`
- 请求:
  - `submissionId`
  - `eventType`（window_blur/copy/paste/devtools/fullscreen_exit 等）
  - `eventTime`
- 用途: 对齐教师发布时的高级配置策略

### K. 批量保存答案（降请求数）
- 方法: POST
- 路径: `/edu/frontend/v1/exam/save-batch`
- 请求: `{ submissionId, answers: [{ questionId, answer }] }`
- 用途: 网络抖动场景降低频繁单题请求

## 3.3 P2（体验增强）

### L. 获取单题用时（当前已有）
- 方法: POST
- 路径: `/edu/frontend/v1/exam/question-duration`
- 用途: 单题实时计时展示

### M. 标记题目状态
- 方法: POST
- 路径: `/edu/frontend/v1/exam/question-mark`
- 请求: `{ submissionId, questionId, marked }`
- 用途: 答题卡“稍后再看”

### N. 成绩发布通知拉取
- 方法: GET
- 路径: `/edu/frontend/v1/exam/result-notice/list`
- 用途: 学生中心显示“已发布成绩”提醒

## 4. 前端页面与接口映射建议

- 学生试卷列表页
  - `GET /paper/list`
- 学生试卷详情页
  - `GET /paper/detail/:paperId`（学生版脱敏）
- 在线答题页
  - 进入: `POST /exam/start`
  - 自动保存: `POST /exam/save` 或 `POST /exam/save-batch`
  - 时长: `POST /exam/save-duration`
  - 会话恢复: `GET /exam/session/:submissionId`
  - 交卷: `POST /exam/submit`
  - 心跳: `POST /exam/heartbeat`
  - 防作弊上报: `POST /exam/anti-cheat/event`
- 成绩与回顾页
  - `GET /exam/result/:submissionId`

## 5. DTO 安全边界建议（非常重要）

学生端接口必须使用独立 DTO，不要复用教师端 Paper/Question DTO。

学生作答 DTO 中建议移除以下字段（至少在未交卷前不返回）：

- `correctAnswer`
- `correctAnswers`
- `referenceAnswer`
- `analysis`

并增加：

- `displayType`（前端渲染器类型）
- `answerSchema`（不同题型统一答案结构定义）
- `policy`（是否允许切屏、是否展示剩余次数等）

## 6. 推荐落地顺序（2 周版）

第 1 周（打通闭环）
- 学生版 `paper/detail` 脱敏接口
- `exam/start` 幂等恢复
- `exam/save` + `exam/save-duration` + `exam/submit`
- 结果页接口对接与页面落地

第 2 周（稳定与增强）
- `exam/session` 恢复能力
- `exam/heartbeat`
- `exam/anti-cheat/event`
- 补齐题型渲染（矩阵/连线/排序/评分/组合题）

---

如果要继续推进，可以在本文件基础上再拆两份：

1. `student-answer-api-contract.md`（给后端）
2. `student-answer-page-flow.md`（给前端和测试）
