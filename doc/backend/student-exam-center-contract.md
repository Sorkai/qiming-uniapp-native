# 学生端试卷中心接口契约（可直接后端开发）

## 1. 目标

本契约用于对齐学生端试卷中心与教师端/管理端题目组卷器，确保：

- 学生看到的试卷来源于教师发布链路
- 学生端数据结构与教师端状态流转一致
- 学生端接口不泄露标准答案字段
- 前后端可直接并行开发

## 2. 鉴权与通用约定

- 基础路径: /edu/frontend/v1
- 角色要求: 学生角色
- 通用响应: { code: number, msg: string, data: T }
- code = 0 表示成功
- 时间字段统一使用字符串时间或毫秒时间戳（在接口描述中注明）

## 3. 接口清单

### 3.1 获取学生试卷列表

- 方法: GET
- 路径: /paper/list
- 用途: 试卷中心列表、状态统计、筛选

请求参数:

- pageNum: number
- pageSize?: number
- status?: available | submitted | graded | completed | expired | retake
- courseId?: number
- keyword?: string

响应 data:

- total: number
- list: Array
  - id: number
  - title: string
  - description?: string
  - courseId: number
  - courseName: string
  - timeLimit: number
  - totalPoints: number
  - totalQuestions: number
  - startTime: string
  - endTime: string
  - status: available | submitted | graded | completed | expired | retake
  - submissionId?: number
  - score?: number
  - allowRetake?: boolean
  - remainingRetakeCount?: number
  - retakeStartTime?: string
  - retakeEndTime?: string
- statistics:
  - available: number
  - submitted: number
  - graded: number
  - completed: number
  - expired: number
  - retake: number
  - avgScore: number

### 3.2 获取学生试卷详情（脱敏）

- 方法: GET
- 路径: /paper/detail/:paperId
- 用途: 学生详情页、考试前预览

响应 data:

- paperId: number
- title: string
- description?: string
- courseId: number
- courseName?: string
- creatorId: number
- creatorName?: string
- status: number
- timeLimit: number
- totalPoints: number
- totalQuestions: number
- startTime?: string
- endTime?: string
- createTime: string
- updateTime: string
- questionGroups?: Array
  - groupId: number
  - groupName: string
  - questionType: number
  - sortOrder: number
  - questions: Array
    - questionId: number
    - questionType: number
    - title: string
    - stem: string
    - options?: Array<{ key: string; content: string }>
    - matrixRows?: Array<{ key: string; content: string }>
    - matrixCols?: Array<{ key: string; content: string }>
    - matchingPairs?: Array<{ left: string; right: string }>
    - orderingItems?: string[]
    - points: number
    - difficulty?: number
    - knowledgePoints?: string[]
    - sortOrder: number

安全要求:

- 不得返回以下字段: correctAnswer, correctAnswers, referenceAnswer, analysis

### 3.3 开始考试

- 方法: POST
- 路径: /exam/start
- 请求体: { paperId: number }
- 用途: 创建或恢复学生答卷

响应 data:

- submissionId: number
- paper: 学生版脱敏试卷详情（同 3.2）
- remainingTime: number（秒）
- serverTime?: number（毫秒）

后端规则:

- 幂等: 存在未提交答卷时返回同一个 submissionId
- 必须校验考试可进入状态（available/retake）

### 3.4 保存答案

- 方法: POST
- 路径: /exam/save

请求体:

- submissionId: number
- questionId: number
- answer: string | string[] | number | object | Array<string | number>

响应 data 建议:

- savedAt: number（毫秒）

### 3.5 批量保存答案（可选但建议）

- 方法: POST
- 路径: /exam/save-batch

请求体:

- submissionId: number
- answers: Array<{ questionId: number; answer: any }>

响应 data:

- savedCount: number

### 3.6 保存题目答题时长

- 方法: POST
- 路径: /exam/save-duration

请求体:

- submissionId: number
- questionId: number
- enterTime: number（毫秒）
- leaveTime: number（毫秒）

响应 data:

- duration: number（本次计算时长，秒）

### 3.7 获取题目累计时长

- 方法: POST
- 路径: /exam/question-duration

请求体:

- submissionId: number
- questionId: number

响应 data:

- duration: number（累计时长，秒）

### 3.8 获取考试会话快照（断线恢复）

- 方法: GET
- 路径: /exam/session/:submissionId

响应 data:

- submissionId: number
- remainingTime: number
- status: in_progress | submitted | expired
- answers: Array<{ questionId: number; answer: any; duration?: number }>

### 3.9 提交试卷

- 方法: POST
- 路径: /exam/submit
- 请求体: { submissionId: number }

响应 data:

- showScore: boolean
- score?: number

后端规则:

- 必须防重复提交
- 提交后答卷状态不可回退

### 3.10 获取考试结果

- 方法: GET
- 路径: /exam/result/:submissionId

响应 data:

- submissionId: number
- paperId: number
- paperTitle: string
- studentId: number
- studentName: string
- submitTime?: string
- startTime?: string
- duration?: number
- totalScore?: number
- score?: number
- gradeStatus: number
- answers?: Array
  - questionId: number
  - answer: string | string[]
  - score?: number
  - comment?: string
  - isCorrect?: boolean

### 3.11 考试心跳（建议）

- 方法: POST
- 路径: /exam/heartbeat
- 请求体: { submissionId: number; clientTime: number }
- 响应 data: { serverTime: number }

### 3.12 防作弊事件上报（建议）

- 方法: POST
- 路径: /exam/anti-cheat/event

请求体:

- submissionId: number
- eventType: string
- eventTime: number
- detail?: string

## 4. 与教师端状态流转对齐要求

教师端状态基线:

- 0 草稿
- 1 已发布
- 2 考试中
- 3 已结束
- 4 批改中
- 5 已批改
- 6 已发布成绩

学生列表状态映射建议:

- available: 可进入考试（发布后且在可作答时间）
- retake: 可补考（高级发布策略开启且满足补考窗口）
- submitted: 学生已交卷，待批改
- graded: 已批改待发布
- completed: 已发布成绩
- expired: 已超时未提交

## 5. 当前前端已对接路径

- 试卷中心列表页: /student-exam-center/list
- 试卷详情页: /student-exam-center/detail/:id
- 在线答题页: /student-exam-center/do/:id
- 考试结果页: /exam-paper/result/:submissionId

以上页面已按本契约的接口路径接入，可直接联调。
