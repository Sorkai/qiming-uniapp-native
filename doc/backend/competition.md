# 赛事管理模块后端开发 Issue 提议

## 📋 模块概述

赛事管理模块是一个综合性的竞赛管理系统，包含以下四个核心子模块：

- **编程竞赛 (OJ)**: 在线编程判题系统
- **知识竞赛**: 题库训练与知识竞答
- **作文比赛**: AI辅助作文批改系统
- **综合竞赛**: 多类型混合赛事

### 前端页面结构

| 路由路径                     | 页面名称     | 说明                                                     |
| ---------------------------- | ------------ | -------------------------------------------------------- |
| `/competition/overview`      | 大屏概览     | 赛事模块总览，展示四大模块统计数据、近期赛事、积分排行榜 |
| `/competition/oj`            | 编程竞赛(OJ) | OJ题目管理，在线编程判题系统                             |
| `/competition/question-bank` | 知识竞赛题库 | 知识竞赛题库管理，支持多种题型                           |
| `/competition/essay`         | 作文比赛     | AI辅助作文批改系统                                       |
| `/competition/event-manage`  | 综合赛事管理 | 综合赛事CRUD、报名管理、排行榜                           |

前端页面已完成 UI 开发，但后端接口尚未实现。本文档详细描述所需的后端 API 接口规范。

---

## 🗄️ 数据库设计

### 1. 赛事表 (competition_event)

| 字段名         | 类型         | 说明                                  |
| -------------- | ------------ | ------------------------------------- |
| event_id       | BIGINT       | 主键，赛事ID                          |
| title          | VARCHAR(200) | 赛事名称                              |
| description    | TEXT         | 赛事简介                              |
| type           | ENUM         | 类型：coding/quiz/essay/comprehensive |
| start_time     | DATETIME     | 开始时间                              |
| end_time       | DATETIME     | 结束时间                              |
| question_count | INT          | 题目数量                              |
| time_limit     | INT          | 时间限制（分钟）                      |
| total_score    | INT          | 满分                                  |
| status         | ENUM         | 状态：upcoming/ongoing/ended          |
| created_by     | BIGINT       | 创建人ID                              |
| created_at     | DATETIME     | 创建时间                              |
| updated_at     | DATETIME     | 更新时间                              |

### 2. 赛事报名表 (competition_registration)

| 字段名        | 类型        | 说明                    |
| ------------- | ----------- | ----------------------- |
| id            | BIGINT      | 主键                    |
| event_id      | BIGINT      | 赛事ID                  |
| user_id       | BIGINT      | 用户ID                  |
| register_time | DATETIME    | 报名时间                |
| status        | ENUM        | 状态：pending/completed |
| score         | INT         | 得分                    |
| duration      | VARCHAR(20) | 用时                    |
| submit_time   | DATETIME    | 提交时间                |

### 3. OJ题目表 (oj_problem)

| 字段名        | 类型         | 说明                   |
| ------------- | ------------ | ---------------------- |
| problem_id    | BIGINT       | 主键，题目ID           |
| title         | VARCHAR(200) | 题目标题               |
| difficulty    | ENUM         | 难度：easy/medium/hard |
| tags          | JSON         | 标签数组               |
| content       | TEXT         | 题目内容（Markdown）   |
| input_format  | TEXT         | 输入格式说明           |
| output_format | TEXT         | 输出格式说明           |
| examples      | JSON         | 示例数组               |
| time_limit    | INT          | 时间限制（ms）         |
| memory_limit  | INT          | 内存限制（MB）         |
| hint          | TEXT         | 提示                   |
| test_cases    | JSON         | 测试用例（加密存储）   |
| accept_count  | INT          | 通过次数               |
| submit_count  | INT          | 提交次数               |
| status        | ENUM         | 状态：published/draft  |
| created_at    | DATETIME     | 创建时间               |

### 4. OJ提交记录表 (oj_submission)

| 字段名        | 类型        | 说明                                                                                    |
| ------------- | ----------- | --------------------------------------------------------------------------------------- |
| submission_id | BIGINT      | 主键                                                                                    |
| problem_id    | BIGINT      | 题目ID                                                                                  |
| user_id       | BIGINT      | 用户ID                                                                                  |
| language      | VARCHAR(20) | 编程语言                                                                                |
| code          | TEXT        | 代码内容                                                                                |
| status        | ENUM        | 状态：accepted/wrong_answer/time_limit/memory_limit/runtime_error/compile_error/pending |
| run_time      | INT         | 运行时间（ms）                                                                          |
| memory        | INT         | 内存使用（KB）                                                                          |
| test_results  | JSON        | 测试结果详情                                                                            |
| submit_time   | DATETIME    | 提交时间                                                                                |

### 5. 题库分类表 (question_category)

| 字段名      | 类型         | 说明     |
| ----------- | ------------ | -------- |
| category_id | BIGINT       | 主键     |
| name        | VARCHAR(100) | 分类名称 |
| parent_id   | BIGINT       | 父分类ID |
| sort_order  | INT          | 排序     |
| created_at  | DATETIME     | 创建时间 |

### 6. 题库题目表 (question_bank)

| 字段名        | 类型     | 说明                                   |
| ------------- | -------- | -------------------------------------- |
| question_id   | BIGINT   | 主键                                   |
| content       | TEXT     | 题目内容                               |
| type          | ENUM     | 类型：single/multiple/judge/fill/essay |
| difficulty    | ENUM     | 难度：easy/medium/hard                 |
| category_id   | BIGINT   | 分类ID                                 |
| score         | INT      | 分值                                   |
| options       | JSON     | 选项（选择题）                         |
| answer        | JSON     | 答案                                   |
| analysis      | TEXT     | 解析                                   |
| usage_count   | INT      | 使用次数                               |
| correct_count | INT      | 正确次数                               |
| created_at    | DATETIME | 创建时间                               |

### 7. 作文题目表 (essay_topic)

| 字段名         | 类型         | 说明     |
| -------------- | ------------ | -------- |
| topic_id       | BIGINT       | 主键     |
| title          | VARCHAR(200) | 题目标题 |
| requirement    | TEXT         | 写作要求 |
| word_limit_min | INT          | 最少字数 |
| word_limit_max | INT          | 最多字数 |
| deadline       | DATETIME     | 截止时间 |
| class_ids      | JSON         | 适用班级 |
| created_by     | BIGINT       | 创建人   |
| created_at     | DATETIME     | 创建时间 |

### 8. 作文提交表 (essay_submission)

| 字段名              | 类型     | 说明                                       |
| ------------------- | -------- | ------------------------------------------ |
| essay_id            | BIGINT   | 主键                                       |
| topic_id            | BIGINT   | 题目ID                                     |
| student_id          | BIGINT   | 学生ID                                     |
| content             | TEXT     | 作文内容                                   |
| word_count          | INT      | 字数                                       |
| submit_time         | DATETIME | 提交时间                                   |
| ai_score            | INT      | AI评分                                     |
| ai_result           | JSON     | AI批改结果                                 |
| teacher_score       | INT      | 教师评分                                   |
| teacher_comment     | TEXT     | 教师评语                                   |
| teacher_review_time | DATETIME | 教师批改时间                               |
| status              | ENUM     | 状态：pending/ai_reviewed/teacher_reviewed |

### 9. 训练记录表 (training_record)

| 字段名      | 类型     | 说明     |
| ----------- | -------- | -------- |
| id          | BIGINT   | 主键     |
| user_id     | BIGINT   | 用户ID   |
| question_id | BIGINT   | 题目ID   |
| user_answer | JSON     | 用户答案 |
| is_correct  | BOOLEAN  | 是否正确 |
| answer_time | DATETIME | 答题时间 |

---

## 🔌 后端 API 接口规范

### 基础前缀

- 后台管理接口：`/edu/backend/v1`
- 学生端接口：`/edu/frontend/v1`

---

## 一、赛事管理接口（后台）

### 1.1 获取赛事列表

- **接口地址**：`GET /edu/backend/v1/competition/event/list`- **请求参数**：

| 参数名   | 类型   | 必填 | 说明                 |
| -------- | ------ | ---- | -------------------- |
| pageNum  | number | 是   | 页码                 |
| pageSize | number | 否   | 每页数量，默认20     |
| title    | string | 否   | 赛事名称（模糊搜索） |
| type     | string | 否   | 类型筛选             |
| status   | string | 否   | 状态筛选             |

- **响应参数**：

````json
{
  "code": 200,
  "msg": "成功",
  "data": {
    "total": 100,
    "eventList": [
      {
        "eventId": 1,
        "title": "2024春季编程挑战赛",
        "description": "面向全校学生的编程竞赛",
        "type": "coding",
        "startTime": "2024-03-15 14:00:00",
        "endTime": "2024-03-15 17:00:00",
        "questionCount": 5,
        "timeLimit": 180,
        "totalScore": 500,
        "participants": 256,
        "status": "upcoming"
      }
    ]
  }
}

```text
### 1.2 获取赛事统计数据

- **接口地址**：`GET /edu/backend/v1/competition/event/stats`- **请求参数**：无
- **响应参数**：

```json
{
  "code": 200,
  "msg": "成功",
  "data": {
    "totalEvents": 24,
    "ongoingEvents": 3,
    "totalParticipants": 1580
  }
}

```text
### 1.3 创建/更新赛事

- **接口地址**：`POST /edu/backend/v1/competition/event/upsert`- **请求参数**：

```json
{
  "eventId": 0, // 0表示新增，非0表示更新
  "title": "赛事名称",
  "description": "赛事简介",
  "type": "coding",
  "startTime": "2024-03-15 14:00:00",
  "endTime": "2024-03-15 17:00:00",
  "questionCount": 5,
  "timeLimit": 180,
  "totalScore": 500,
  "status": "upcoming"
}

```text
### 1.4 删除赛事

- **接口地址**：`POST /edu/backend/v1/competition/event/delete`- **请求参数**：

```json
{
  "eventId": 1
}

```text
### 1.5 获取赛事报名列表

- **接口地址**：`GET /edu/backend/v1/competition/event/participants`- **请求参数**：

| 参数名  | 类型   | 必填 | 说明   |
| ------- | ------ | ---- | ------ |
| eventId | number | 是   | 赛事ID |

- **响应参数**：

```json
{
  "code": 200,
  "msg": "成功",
  "data": {
    "list": [
      {
        "userId": 1,
        "username": "student001",
        "realName": "张三",
        "className": "计算机2101班",
        "registerTime": "2024-03-10 10:30:00",
        "status": "completed"
      }
    ]
  }
}

```text
### 1.6 获取赛事排行榜

- **接口地址**：`GET /edu/backend/v1/competition/event/rankings`- **请求参数**：

| 参数名  | 类型   | 必填 | 说明   |
| ------- | ------ | ---- | ------ |
| eventId | number | 是   | 赛事ID |

- **响应参数**：

```json
{
  "code": 200,
  "msg": "成功",
  "data": {
    "list": [
      {
        "userId": 1,
        "username": "student001",
        "avatar": "/avatars/1.jpg",
        "className": "计算机2101班",
        "score": 480,
        "duration": "2小时15分"
      }
    ]
  }
}

```text
---

## 二、OJ 题目管理接口（后台）

### 2.1 获取OJ统计数据

- **接口地址**：`GET /edu/backend/v1/oj/stats`- **响应参数**：

```json
{
  "code": 200,
  "msg": "成功",
  "data": {
    "totalProblems": 500,
    "totalSubmissions": 12580,
    "acceptRate": 45.6,
    "activeUsers": 320
  }
}

```text
### 2.2 获取OJ题目列表

- **接口地址**：`GET /edu/backend/v1/oj/problem/list`- **请求参数**：

| 参数名     | 类型   | 必填 | 说明     |
| ---------- | ------ | ---- | -------- |
| pageNum    | number | 是   | 页码     |
| pageSize   | number | 否   | 每页数量 |
| title      | string | 否   | 题目标题 |
| difficulty | string | 否   | 难度     |
| tags       | string | 否   | 标签     |

- **响应参数**：

```json
{
  "code": 200,
  "msg": "成功",
  "data": {
    "total": 500,
    "list": [
      {
        "problemId": 1,
        "title": "两数之和",
        "difficulty": "easy",
        "tags": ["数组", "哈希表"],
        "acceptCount": 1200,
        "submitCount": 2500,
        "acceptRate": 48.0,
        "timeLimit": 1000,
        "memoryLimit": 256,
        "status": "published",
        "createTime": "2024-01-01 10:00:00"
      }
    ]
  }
}

```text
### 2.3 获取OJ题目详情

- **接口地址**：`GET /edu/backend/v1/oj/problem/detail`- **请求参数**：

| 参数名    | 类型   | 必填 | 说明   |
| --------- | ------ | ---- | ------ |
| problemId | number | 是   | 题目ID |

- **响应参数**：

```json
{
  "code": 200,
  "msg": "成功",
  "data": {
    "problemId": 1,
    "title": "两数之和",
    "difficulty": "easy",
    "tags": ["数组", "哈希表"],
    "content": "给定一个整数数组 nums 和一个整数目标值 target...",
    "inputFormat": "第一行包含两个整数 n 和 target...",
    "outputFormat": "输出两个整数，表示两个数的下标...",
    "examples": [
      {
        "input": "4 9\n2 7 11 15",
        "output": "0 1",
        "explanation": "因为 nums[0] + nums[1] == 9"
      }
    ],
    "timeLimit": 1000,
    "memoryLimit": 256,
    "hint": "可以使用哈希表优化时间复杂度",
    "testCases": [
      { "input": "4 9\n2 7 11 15", "output": "0 1" },
      { "input": "3 6\n3 2 4", "output": "1 2" }
    ]
  }
}

```text
### 2.4 创建/更新OJ题目

- **接口地址**：`POST /edu/backend/v1/oj/problem/upsert`- **请求参数**：

```json
{
  "problemId": 0,
  "title": "题目标题",
  "difficulty": "easy",
  "tags": ["数组", "哈希表"],
  "content": "题目内容（Markdown）",
  "inputFormat": "输入格式说明",
  "outputFormat": "输出格式说明",
  "examples": [{ "input": "...", "output": "...", "explanation": "..." }],
  "timeLimit": 1000,
  "memoryLimit": 256,
  "hint": "提示",
  "testCases": [{ "input": "...", "output": "..." }],
  "status": "published"
}

```text
### 2.5 删除OJ题目

- **接口地址**：`POST /edu/backend/v1/oj/problem/delete`- **请求参数**：

```json
{
  "problemId": 1
}

```text
### 2.6 获取提交记录列表

- **接口地址**：`GET /edu/backend/v1/oj/submission/list`- **请求参数**：

| 参数名    | 类型   | 必填 | 说明     |
| --------- | ------ | ---- | -------- |
| pageNum   | number | 是   | 页码     |
| pageSize  | number | 否   | 每页数量 |
| problemId | number | 否   | 题目ID   |
| userId    | number | 否   | 用户ID   |
| status    | string | 否   | 状态     |
| language  | string | 否   | 语言     |

- **响应参数**：

```json
{
  "code": 200,
  "msg": "成功",
  "data": {
    "total": 12580,
    "list": [
      {
        "submissionId": 1,
        "problemId": 1,
        "problemTitle": "两数之和",
        "userId": 1,
        "username": "student001",
        "language": "cpp",
        "status": "accepted",
        "runTime": 12,
        "memory": 1024,
        "submitTime": "2024-03-10 10:30:00"
      }
    ]
  }
}

```text
### 2.7 获取提交详情

- **接口地址**：`GET /edu/backend/v1/oj/submission/detail`- **请求参数**：

| 参数名       | 类型   | 必填 | 说明   |
| ------------ | ------ | ---- | ------ |
| submissionId | number | 是   | 提交ID |

- **响应参数**：

```json
{
  "code": 200,
  "msg": "成功",
  "data": {
    "submissionId": 1,
    "problemId": 1,
    "problemTitle": "两数之和",
    "userId": 1,
    "username": "student001",
    "language": "cpp",
    "code": "#include <iostream>...",
    "status": "accepted",
    "runTime": 12,
    "memory": 1024,
    "submitTime": "2024-03-10 10:30:00",
    "testResults": [
      {
        "caseId": 1,
        "status": "accepted",
        "runTime": 5,
        "memory": 512
      }
    ]
  }
}

```text
---

## 三、作文批改管理接口（后台）

### 3.1 获取作文统计数据

- **接口地址**：`GET /edu/backend/v1/essay/stats`- **响应参数**：

```json
{
  "code": 200,
  "msg": "成功",
  "data": {
    "totalEssays": 856,
    "pendingReview": 45,
    "avgScore": 78,
    "todaySubmissions": 23
  }
}

```text
### 3.2 获取作文列表

- **接口地址**：`GET /edu/backend/v1/essay/list`- **请求参数**：

| 参数名   | 类型   | 必填 | 说明     |
| -------- | ------ | ---- | -------- |
| pageNum  | number | 是   | 页码     |
| pageSize | number | 否   | 每页数量 |
| keyword  | string | 否   | 关键词   |
| status   | string | 否   | 状态     |
| topicId  | number | 否   | 题目ID   |

- **响应参数**：

```json
{
  "code": 200,
  "msg": "成功",
  "data": {
    "total": 856,
    "list": [
      {
        "essayId": 1,
        "topicId": 1,
        "topicTitle": "我的理想",
        "studentId": 1,
        "studentName": "张三",
        "className": "高一(1)班",
        "wordCount": 850,
        "submitTime": "2024-03-10 10:30:00",
        "aiScore": 82,
        "teacherScore": null,
        "status": "ai_reviewed"
      }
    ]
  }
}

```text
### 3.3 获取作文详情

- **接口地址**：`GET /edu/backend/v1/essay/detail`- **请求参数**：

| 参数名  | 类型   | 必填 | 说明   |
| ------- | ------ | ---- | ------ |
| essayId | number | 是   | 作文ID |

- **响应参数**：

```json
{
  "code": 200,
  "msg": "成功",
  "data": {
    "essayId": 1,
    "topicId": 1,
    "topicTitle": "我的理想",
    "topicRequirement": "请以"我的理想"为题，写一篇不少于800字的作文...",
    "studentId": 1,
    "studentName": "张三",
    "className": "高一(1)班",
    "content": "作文内容...",
    "wordCount": 850,
    "submitTime": "2024-03-10 10:30:00",
    "aiResult": {
      "score": 82,
      "dimensions": [
        {"name": "内容", "score": 28, "maxScore": 35, "comment": "内容充实，主题明确"},
        {"name": "结构", "score": 18, "maxScore": 20, "comment": "结构完整，层次分明"},
        {"name": "语言", "score": 22, "maxScore": 30, "comment": "语言流畅，用词准确"},
        {"name": "书写", "score": 14, "maxScore": 15, "comment": "书写工整"}
      ],
      "strengths": ["主题鲜明", "结构清晰", "语言流畅"],
      "weaknesses": ["部分论据不够充分", "结尾略显仓促"],
      "suggestions": ["可以增加更多具体事例", "结尾可以升华主题"],
      "corrections": [
        {"original": "我的理想是当一名老师", "corrected": "我的理想是成为一名教师", "type": "用词", "reason": "用词更加正式"}
      ]
    },
    "teacherResult": null
  }
}

```text
### 3.4 提交教师批改结果

- **接口地址**：`POST /edu/backend/v1/essay/review`- **请求参数**：

```json
{
  "essayId": 1,
  "score": 85,
  "comment": "文章主题明确，结构完整，语言流畅。建议在论据方面可以更加充实。"
}

```text
### 3.5 请求AI批改

- **接口地址**：`POST /edu/backend/v1/essay/ai-review`- **请求参数**：

```json
{
  "essayId": 1
}

```text
### 3.6 发布作文题目

- **接口地址**：`POST /edu/backend/v1/essay/topic/publish`- **请求参数**：

```json
{
  "topicId": 0,
  "title": "我的理想",
  "requirement": "请以"我的理想"为题，写一篇不少于800字的作文...",
  "wordLimit": {"min": 800, "max": 1200},
  "deadline": "2024-03-20 23:59:59",
  "classIds": [1, 2, 3]
}

```text
### 3.7 获取作文题目列表

- **接口地址**：`GET /edu/backend/v1/essay/topic/list`- **响应参数**：

```json
{
  "code": 200,
  "msg": "成功",
  "data": {
    "list": [
      {
        "topicId": 1,
        "title": "我的理想",
        "deadline": "2024-03-20 23:59:59",
        "submissions": 45
      }
    ]
  }
}

```text
---

## 四、题库管理接口（后台）

### 4.1 获取题库统计数据

- **接口地址**：`GET /edu/backend/v1/question-bank/stats`- **响应参数**：

```json
{
  "code": 200,
  "msg": "成功",
  "data": {
    "totalQuestions": 3000,
    "totalCategories": 12,
    "usageCount": 15680,
    "avgAccuracy": 72.5
  }
}

```text
### 4.2 获取分类树

- **接口地址**：`GET /edu/backend/v1/question-bank/category/tree`- **响应参数**：

```json
{
  "code": 200,
  "msg": "成功",
  "data": [
    {
      "categoryId": 1,
      "name": "数据结构",
      "questionCount": 150,
      "children": [
        { "categoryId": 11, "name": "数组", "questionCount": 50 },
        { "categoryId": 12, "name": "链表", "questionCount": 40 }
      ]
    }
  ]
}

```text
### 4.3 创建/更新分类

- **接口地址**：`POST /edu/backend/v1/question-bank/category/upsert`- **请求参数**：

```json
{
  "categoryId": 0,
  "name": "分类名称",
  "parentId": 0
}

```text
### 4.4 删除分类

- **接口地址**：`POST /edu/backend/v1/question-bank/category/delete`- **请求参数**：

```json
{
  "categoryId": 1
}

```text
### 4.5 获取题目列表

- **接口地址**：`GET /edu/backend/v1/question-bank/question/list`- **请求参数**：

| 参数名     | 类型   | 必填 | 说明     |
| ---------- | ------ | ---- | -------- |
| pageNum    | number | 是   | 页码     |
| pageSize   | number | 否   | 每页数量 |
| categoryId | number | 否   | 分类ID   |
| type       | string | 否   | 题型     |
| difficulty | string | 否   | 难度     |
| keyword    | string | 否   | 关键词   |

- **响应参数**：

```json
{
  "code": 200,
  "msg": "成功",
  "data": {
    "total": 3000,
    "list": [
      {
        "questionId": 1,
        "content": "以下哪个数据结构支持O(1)时间复杂度的随机访问？",
        "type": "single",
        "difficulty": "easy",
        "categoryId": 1,
        "categoryName": "数据结构",
        "score": 5,
        "usageCount": 120,
        "accuracy": 75.5,
        "createTime": "2024-01-01 10:00:00"
      }
    ]
  }
}

```text
### 4.6 获取题目详情

- **接口地址**：`GET /edu/backend/v1/question-bank/question/detail`- **请求参数**：

| 参数名     | 类型   | 必填 | 说明   |
| ---------- | ------ | ---- | ------ |
| questionId | number | 是   | 题目ID |

- **响应参数**：

```json
{
  "code": 200,
  "msg": "成功",
  "data": {
    "questionId": 1,
    "content": "以下哪个数据结构支持O(1)时间复杂度的随机访问？",
    "type": "single",
    "difficulty": "easy",
    "categoryId": 1,
    "score": 5,
    "options": [
      { "content": "数组", "isAnswer": true },
      { "content": "链表", "isAnswer": false },
      { "content": "栈", "isAnswer": false },
      { "content": "队列", "isAnswer": false }
    ],
    "answer": 0,
    "analysis": "数组在内存中是连续存储的，可以通过下标直接访问任意元素，时间复杂度为O(1)。"
  }
}

```text
### 4.7 创建/更新题目

- **接口地址**：`POST /edu/backend/v1/question-bank/question/upsert`- **请求参数**：

```json
{
  "questionId": 0,
  "content": "题目内容",
  "type": "single",
  "difficulty": "easy",
  "categoryId": 1,
  "score": 5,
  "options": [
    { "content": "选项A", "isAnswer": true },
    { "content": "选项B", "isAnswer": false }
  ],
  "answer": 0,
  "analysis": "解析内容"
}

```text
### 4.8 删除题目

- **接口地址**：`POST /edu/backend/v1/question-bank/question/delete`- **请求参数**：

```json
{
  "questionId": 1
}

```text
### 4.9 批量删除题目

- **接口地址**：`POST /edu/backend/v1/question-bank/question/batch-delete`- **请求参数**：

```json
{
  "questionIds": [1, 2, 3]
}

```text
### 4.10 导入题目

- **接口地址**：`POST /edu/backend/v1/question-bank/question/import`- **请求参数**：FormData（Excel文件）
- **响应参数**：

```json
{
  "code": 200,
  "msg": "成功",
  "data": {
    "success": 95,
    "failed": 5
  }
}

```text
---

## 五、大屏概览统计接口（后台）

### 5.1 获取赛事大屏概览数据

- **接口地址**：`GET /edu/backend/v1/competition/overview`- **请求参数**：无
- **响应参数**：

```json
{
  "code": 200,
  "msg": "成功",
  "data": {
    "codingStats": {
      "totalProblems": 500,
      "totalSubmissions": 12580,
      "acceptRate": 45.6,
      "activeUsers": 320
    },
    "quizStats": {
      "totalQuestions": 3000,
      "totalCategories": 12,
      "totalParticipants": 1580,
      "avgAccuracy": 72.5
    },
    "essayStats": {
      "totalEssays": 856,
      "pendingReview": 45,
      "avgScore": 78,
      "todaySubmissions": 23
    },
    "comprehensiveStats": {
      "totalEvents": 24,
      "ongoingEvents": 3,
      "totalParticipants": 2580,
      "avgScore": 82
    }
  }
}

```text
---

## 六、学生端接口（前端）

### 6.1 获取学生OJ统计

- **接口地址**：`GET /edu/frontend/v1/oj/stats`- **响应参数**：

```json
{
  "code": 200,
  "msg": "成功",
  "data": {
    "totalProblems": 500,
    "solved": 45,
    "attempted": 12,
    "rank": 128
  }
}

```text
### 6.2 获取学生端题目列表

- **接口地址**：`GET /edu/frontend/v1/oj/problem/list`- **请求参数**：

| 参数名     | 类型   | 必填 | 说明                                |
| ---------- | ------ | ---- | ----------------------------------- |
| pageNum    | number | 是   | 页码                                |
| pageSize   | number | 否   | 每页数量                            |
| title      | string | 否   | 题目标题                            |
| difficulty | string | 否   | 难度                                |
| tags       | string | 否   | 标签                                |
| status     | string | 否   | 状态：all/solved/attempted/unsolved |

- **响应参数**：

```json
{
  "code": 200,
  "msg": "成功",
  "data": {
    "total": 500,
    "list": [
      {
        "problemId": 1,
        "title": "两数之和",
        "difficulty": "easy",
        "tags": ["数组", "哈希表"],
        "acceptRate": 48.0,
        "myStatus": "solved"
      }
    ]
  }
}

```text
### 6.3 获取学生端题目详情

- **接口地址**：`GET /edu/frontend/v1/oj/problem/detail`- **请求参数**：

| 参数名    | 类型   | 必填 | 说明   |
| --------- | ------ | ---- | ------ |
| problemId | number | 是   | 题目ID |

- **响应参数**：

```json
{
  "code": 200,
  "msg": "成功",
  "data": {
    "problemId": 1,
    "title": "两数之和",
    "difficulty": "easy",
    "tags": ["数组", "哈希表"],
    "content": "给定一个整数数组 nums 和一个整数目标值 target...",
    "inputFormat": "第一行包含两个整数 n 和 target...",
    "outputFormat": "输出两个整数，表示两个数的下标...",
    "examples": [
      {
        "input": "4 9\n2 7 11 15",
        "output": "0 1",
        "explanation": "因为 nums[0] + nums[1] == 9"
      }
    ],
    "timeLimit": 1000,
    "memoryLimit": 256,
    "hint": "可以使用哈希表优化时间复杂度",
    "myStatus": "solved"
  }
}

```text
### 6.4 获取我的提交记录

- **接口地址**：`GET /edu/frontend/v1/oj/submission/my`- **请求参数**：

| 参数名    | 类型   | 必填 | 说明     |
| --------- | ------ | ---- | -------- |
| pageNum   | number | 是   | 页码     |
| pageSize  | number | 否   | 每页数量 |
| problemId | number | 否   | 题目ID   |

- **响应参数**：

```json
{
  "code": 200,
  "msg": "成功",
  "data": {
    "total": 100,
    "list": [
      {
        "submissionId": 1,
        "problemId": 1,
        "problemTitle": "两数之和",
        "language": "cpp",
        "status": "accepted",
        "runTime": 12,
        "memory": 1024,
        "submitTime": "2024-03-10 10:30:00"
      }
    ]
  }
}

```text
### 6.5 运行代码

- **接口地址**：`POST /edu/frontend/v1/oj/run`- **请求参数**：

```json
{
  "problemId": 1,
  "language": "cpp",
  "code": "#include <iostream>...",
  "input": "4 9\n2 7 11 15"
}

```text


- **响应参数**：

```json
{
  "code": 200,
  "msg": "成功",
  "data": {
    "status": "success",
    "output": "0 1",
    "runTime": 12,
    "memory": 1024,
    "error": null
  }
}

```text
### 6.6 提交代码

- **接口地址**：`POST /edu/frontend/v1/oj/submit`- **请求参数**：

```json
{
  "problemId": 1,
  "language": "cpp",
  "code": "#include <iostream>..."
}

```text


- **响应参数**：

```json
{
  "code": 200,
  "msg": "成功",
  "data": {
    "submissionId": 12345,
    "status": "accepted",
    "runTime": 12,
    "memory": 1024,
    "passedCases": 10,
    "totalCases": 10
  }
}

```text
---

## 七、学生端作文接口（前端）

### 7.1 获取作文题目列表

- **接口地址**：`GET /edu/frontend/v1/essay/topics`- **请求参数**：无
- **响应参数**：

```json
{
  "code": 200,
  "msg": "成功",
  "data": {
    "list": [
      {
        "topicId": 1,
        "title": "我的理想",
        "requirement": "请以"我的理想"为题，写一篇不少于800字的作文...",
        "wordLimit": {"min": 800, "max": 1200},
        "deadline": "2024-03-20 23:59:59",
        "hasSubmitted": true,
        "score": 85
      }
    ]
  }
}

```text
### 7.2 获取我的作文

- **接口地址**：`GET /edu/frontend/v1/essay/my`- **请求参数**：

| 参数名  | 类型   | 必填 | 说明   |
| ------- | ------ | ---- | ------ |
| topicId | number | 是   | 题目ID |

- **响应参数**：

```json
{
  "code": 200,
  "msg": "成功",
  "data": {
    "essayId": 1,
    "content": "作文内容...",
    "wordCount": 850,
    "submitTime": "2024-03-10 10:30:00",
    "status": "ai_reviewed",
    "aiResult": {
      "score": 82,
      "dimensions": [
        {
          "name": "内容",
          "score": 28,
          "maxScore": 35,
          "comment": "内容充实，主题明确"
        },
        {
          "name": "结构",
          "score": 18,
          "maxScore": 20,
          "comment": "结构完整，层次分明"
        },
        {
          "name": "语言",
          "score": 22,
          "maxScore": 30,
          "comment": "语言流畅，用词准确"
        },
        { "name": "书写", "score": 14, "maxScore": 15, "comment": "书写工整" }
      ],
      "strengths": ["主题鲜明", "结构清晰", "语言流畅"],
      "weaknesses": ["部分论据不够充分", "结尾略显仓促"],
      "suggestions": ["可以增加更多具体事例", "结尾可以升华主题"],
      "corrections": [
        {
          "original": "我的理想是当一名老师",
          "corrected": "我的理想是成为一名教师",
          "type": "用词",
          "reason": "用词更加正式"
        }
      ]
    },
    "teacherResult": {
      "score": 85,
      "comment": "文章主题明确，结构完整，语言流畅。",
      "reviewTime": "2024-03-12 15:30:00"
    }
  }
}

```text
### 7.3 保存草稿

- **接口地址**：`POST /edu/frontend/v1/essay/draft`- **请求参数**：

```json
{
  "topicId": 1,
  "content": "作文内容..."
}

```text


- **响应参数**：

```json
{
  "code": 200,
  "msg": "保存成功"
}

```text
### 7.4 提交作文

- **接口地址**：`POST /edu/frontend/v1/essay/submit`- **请求参数**：

```json
{
  "topicId": 1,
  "content": "作文内容..."
}

```text


- **响应参数**：

```json
{
  "code": 200,
  "msg": "成功",
  "data": {
    "essayId": 1
  }
}

```text
### 7.5 请求AI预检查

- **接口地址**：`POST /edu/frontend/v1/essay/ai-check`- **请求参数**：

```json
{
  "content": "作文内容..."
}

```text


- **响应参数**：

```json
{
  "code": 200,
  "msg": "成功",
  "data": {
    "score": 78,
    "dimensions": [
      { "name": "内容", "score": 25, "maxScore": 35 },
      { "name": "结构", "score": 16, "maxScore": 20 },
      { "name": "语言", "score": 24, "maxScore": 30 },
      { "name": "书写", "score": 13, "maxScore": 15 }
    ],
    "suggestions": ["可以增加更多具体事例", "结尾可以升华主题"],
    "corrections": [
      { "original": "错误文字", "corrected": "正确文字", "type": "用词" }
    ]
  }
}

```text
---

## 八、学生端题库训练接口（前端）

### 8.1 获取训练分类列表

- **接口地址**：`GET /edu/frontend/v1/training/categories`- **请求参数**：无
- **响应参数**：

```json
{
  "code": 200,
  "msg": "成功",
  "data": [
    {
      "categoryId": 1,
      "name": "数据结构",
      "total": 150,
      "completed": 45,
      "children": [
        { "categoryId": 11, "name": "数组", "total": 50, "completed": 20 },
        { "categoryId": 12, "name": "链表", "total": 40, "completed": 15 }
      ]
    }
  ]
}

```text
### 8.2 获取训练题目

- **接口地址**：`GET /edu/frontend/v1/training/questions`- **请求参数**：

| 参数名     | 类型   | 必填 | 说明                    |
| ---------- | ------ | ---- | ----------------------- |
| categoryId | number | 是   | 分类ID                  |
| mode       | string | 是   | 模式：sequential/random |

- **响应参数**：

```json
{
  "code": 200,
  "msg": "成功",
  "data": {
    "list": [
      {
        "questionId": 1,
        "content": "以下哪个数据结构支持O(1)时间复杂度的随机访问？",
        "type": "single",
        "difficulty": "easy",
        "score": 5,
        "options": [
          { "content": "数组", "isAnswer": true },
          { "content": "链表", "isAnswer": false },
          { "content": "栈", "isAnswer": false },
          { "content": "队列", "isAnswer": false }
        ],
        "answer": 0,
        "analysis": "数组在内存中是连续存储的，可以通过下标直接访问任意元素，时间复杂度为O(1)。"
      }
    ]
  }
}

```text
### 8.3 提交训练答案

- **接口地址**：`POST /edu/frontend/v1/training/answer`- **请求参数**：

```json
{
  "questionId": 1,
  "answer": 0,
  "isCorrect": true
}

```text


- **响应参数**：

```json
{
  "code": 200,
  "msg": "成功"
}

```text
### 8.4 获取错题列表

- **接口地址**：`GET /edu/frontend/v1/training/wrong`- **请求参数**：无
- **响应参数**：

```json
{
  "code": 200,
  "msg": "成功",
  "data": {
    "list": [
      {
        "questionId": 1,
        "content": "以下哪个数据结构支持O(1)时间复杂度的随机访问？",
        "type": "single",
        "difficulty": "easy",
        "wrongCount": 3,
        "lastWrongTime": "2024-03-10 10:30:00",
        "options": [
          { "content": "数组", "isAnswer": true },
          { "content": "链表", "isAnswer": false },
          { "content": "栈", "isAnswer": false },
          { "content": "队列", "isAnswer": false }
        ],
        "answer": 0,
        "analysis": "数组在内存中是连续存储的..."
      }
    ]
  }
}

```text
### 8.5 清空错题

- **接口地址**：`POST /edu/frontend/v1/training/wrong/clear`- **请求参数**：无
- **响应参数**：

```json
{
  "code": 200,
  "msg": "成功"
}

```text
### 8.6 开始模拟考试

- **接口地址**：`POST /edu/frontend/v1/training/exam/start`- **请求参数**：

```json
{
  "categoryId": 1,
  "questionCount": 20,
  "duration": 60
}

```text


- **响应参数**：

```json
{
  "code": 200,
  "msg": "成功",
  "data": {
    "examId": 1,
    "questions": [
      {
        "questionId": 1,
        "content": "以下哪个数据结构支持O(1)时间复杂度的随机访问？",
        "type": "single",
        "difficulty": "easy",
        "score": 5,
        "options": [
          { "content": "数组" },
          { "content": "链表" },
          { "content": "栈" },
          { "content": "队列" }
        ]
      }
    ]
  }
}

```text
### 8.7 提交模拟考试

- **接口地址**：`POST /edu/frontend/v1/training/exam/submit`- **请求参数**：

```json
{
  "questions": [{ "questionId": 1 }, { "questionId": 2 }],
  "answers": [0, 1]
}

```text


- **响应参数**：

```json
{
  "code": 200,
  "msg": "成功",
  "data": {
    "score": 85,
    "totalScore": 100,
    "correctCount": 17,
    "wrongCount": 3,
    "details": [
      {
        "questionId": 1,
        "isCorrect": true,
        "userAnswer": 0,
        "correctAnswer": 0
      }
    ]
  }
}

```text
---

## 九、学生端综合统计接口（前端）

### 9.1 获取学生竞赛综合统计

- **接口地址**：`GET /edu/frontend/v1/competition/overview`- **请求参数**：无
- **响应参数**：

```json
{
  "code": 200,
  "msg": "成功",
  "data": {
    "ojStats": {
      "total": 500,
      "solved": 45,
      "rank": 128
    },
    "essayStats": {
      "submitted": 5,
      "avgScore": 82
    },
    "trainingStats": {
      "completed": 200,
      "accuracy": 75.5
    }
  }
}

```text
---

## 十、积分排行榜接口（后台）

### 10.1 获取积分排行榜

- **接口地址**：`GET /edu/backend/v1/competition/leaderboard`- **请求参数**：

| 参数名 | 类型   | 必填 | 说明                       |
| ------ | ------ | ---- | -------------------------- |
| type   | string | 是   | 类型：total/weekly/monthly |

- **响应参数**：

```json
{
  "code": 200,
  "msg": "成功",
  "data": {
    "list": [
      {
        "userId": 1,
        "username": "student001",
        "avatar": "/avatars/1.jpg",
        "points": 9800,
        "rank": 1
      }
    ]
  }
}

````

---

## 🔧 技术要求

### 1. OJ 判题系统

- 需要集成代码沙箱执行环境
- 支持语言：C/C++、Java、Python、JavaScript
- 需要实现：
    - 代码编译
    - 运行时间/内存限制
    - 测试用例对比
    - 安全隔离

### 2. AI 作文批改

- 集成大语言模型 API
- 实现多维度评分：
    - 内容（35分）
    - 结构（20分）
    - 语言（30分）
    - 书写（15分）
- 提供修改建议和错误纠正

### 3. 实时排行榜

- 使用 Redis 缓存排行数据
- 支持实时更新
- 分页查询优化

---

## 📅 开发计划建议

### 第一阶段（2周）

- [ ] 数据库表设计与创建
- [ ] 赛事管理 CRUD 接口
- [ ] 题库管理 CRUD 接口

### 第二阶段（2周）

- [ ] OJ 判题系统核心功能
- [ ] 代码沙箱环境搭建
- [ ] 提交记录管理

### 第三阶段（2周）

- [ ] 作文批改系统
- [ ] AI 批改集成
- [ ] 教师批改功能

### 第四阶段（1周）

- [ ] 大屏概览统计接口
- [ ] 排行榜功能
- [ ] 性能优化与测试

---

## 📝 备注

1. 所有接口需要进行权限验证
2. 后台接口需要管理员/教师权限
3. 学生端接口需要学生登录权限
4. 建议使用 Redis 缓存热点数据
5. OJ 判题建议使用消息队列异步处理
