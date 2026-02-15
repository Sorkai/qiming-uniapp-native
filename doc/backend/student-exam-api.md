# 学生端考试 API 接口文档

> 基础路径：`/edu/frontend/v1`
> 响应格式：`{ code: number, msg: string, data: T }`
> code=0 表示成功

---

## 一、学生试卷中心

### 1.1 获取学生试卷列表
- **接口**: `GET /paper/list`
- **用途**: 学生试卷中心，查看可参加的考试
- **参数**:
```typescript
{
  pageNum: number;          // 页码
  pageSize?: number;        // 每页数量，默认12
  status?: string;          // 状态筛选: available | submitted | graded | completed | expired | retake
  courseId?: number;        // 课程ID
  keyword?: string;         // 关键词搜索
}
```
- **响应**:
```typescript
{
  total: number;
  list: Array<{
    id: number;
    title: string;
    description?: string;
    courseId: number;
    courseName: string;
    timeLimit: number;
    totalPoints: number;
    totalQuestions: number;
    startTime: string;
    endTime: string;
    status: "available" | "submitted" | "graded" | "completed" | "expired" | "retake";
    submissionId?: number;
    score?: number;
    allowRetake?: boolean;
    remainingRetakeCount?: number;
    retakeStartTime?: string;
    retakeEndTime?: string;
  }>;
  statistics: {
    available: number;      // 待完成数量
    submitted: number;      // 已提交待批改数量
    graded: number;         // 已批改待发布数量
    completed: number;      // 已完成数量
    expired: number;        // 已过期数量
    retake: number;         // 补考中数量
    avgScore: number;       // 平均分
  };
}
```

### 1.2 开始考试
- **接口**: `POST /exam/start`
- **请求体**: `{ paperId: number }`
- **响应**:
```typescript
{
  submissionId: number;     // 答卷ID
  paper: {                  // 试卷详情
    paperId: number;
    title: string;
    description?: string;
    timeLimit: number;
    totalPoints: number;
    totalQuestions: number;
    questionGroups: Array<QuestionGroup>;
  };
  remainingTime: number;    // 剩余时间（秒）
}
```

### 1.3 保存答案（自动保存）
- **接口**: `POST /exam/save`
- **用途**: 保存学生答案
- **请求体**:
```typescript
{
  submissionId: number;     // 答卷ID
  questionId: number;       // 题目ID
  answer: string | string[]; // 答案内容
  duration?: number;        // 该题累计答题时长（秒）
}
```
- **响应**: `{ code: 0, msg: "保存成功" }`

### 1.4 保存答题时长（新增）
- **接口**: `POST /exam/save-duration`
- **用途**: 记录答题时长，使用时间戳方式
- **请求体**:
```typescript
{
  submissionId: number;     // 答卷ID
  questionId: number;       // 题目ID
  enterTime: number;        // 进入该题的时间戳（毫秒）
  leaveTime: number;        // 离开该题的时间戳（毫秒）
}
```
- **说明**:
  - 后端计算时长差值（秒）并累加到该题的总答题时长
  - 时长计算公式：`duration = (leaveTime - enterTime) / 1000`
  - 后端需要在数据库中维护每道题的累计答题时长
  - 如果学生切换题目后再回来，时长会继续累加
- **响应**: `{ code: 0, msg: "保存成功", data: { duration: number } }`

### 1.5 获取题目答题时长
- **接口**: `POST /exam/question-duration`
- **用途**: 获取某道题目的累计答题时长（用于前端显示）
- **请求体**:
```typescript
{
  submissionId: number;     // 答卷ID
  questionId: number;       // 题目ID
}
```
- **响应**:
```typescript
{
  duration: number;         // 该题累计答题时长（秒）
}
```
- **说明**:
  - 返回后端数据库中存储的该题累计答题时长
  - 前端可以用这个值加上当前正在计时的部分来显示实时用时

### 1.6 提交试卷
- **接口**: `POST /exam/submit`
- **请求体**: `{ submissionId: number }`
- **响应**:
```typescript
{
  score?: number;           // 得分（如果立即显示）
  showScore: boolean;       // 是否显示分数
}
```

### 1.7 查看考试结果
- **接口**: `GET /exam/result/{submissionId}`
- **响应**:
```typescript
{
  submissionId: number;
  paperId: number;
  paperTitle: string;
  studentId: number;
  studentName: string;
  submitTime: string;
  startTime: string;
  duration: number;         // 总用时（秒）
  totalScore: number;
  score: number;
  gradeStatus: number;
  answers: Array<{
    questionId: number;
    answer: string | string[];
    score?: number;
    comment?: string;
    isCorrect?: boolean;
    duration?: number;      // 该题答题时长（秒）
  }>;
}
```

### 1.8 获取学生考试列表（旧接口）
- **接口**: `GET /exam/list`
- **用途**: 获取学生考试列表（简化版）
- **参数**:
```typescript
{
  pageNum: number;
  pageSize?: number;
  courseId?: number;
  status?: number;          // 0-待考试 1-进行中 2-已结束
}
```
- **响应**:
```typescript
{
  total: number;
  list: Array<{
    paperId: number;
    paperTitle: string;
    courseName: string;
    timeLimit: number;
    totalPoints: number;
    startTime: string;
    endTime: string;
    status: number;         // 0-待考试 1-进行中 2-已结束
    submitted: boolean;
    score?: number;
  }>;
}
```

---

## 二、数据库设计建议

### 答卷表 (exam_submissions)
```sql
CREATE TABLE exam_submissions (
  submission_id BIGINT PRIMARY KEY,
  paper_id BIGINT NOT NULL,
  student_id BIGINT NOT NULL,
  start_time DATETIME,
  submit_time DATETIME,
  total_duration INT DEFAULT 0,  -- 总答题时长（秒）
  -- 其他字段...
);
```

### 答案表 (exam_answers)
```sql
CREATE TABLE exam_answers (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  submission_id BIGINT NOT NULL,
  question_id BIGINT NOT NULL,
  answer TEXT,
  duration INT DEFAULT 0,        -- 该题累计答题时长（秒）
  score DECIMAL(5,2),
  is_correct BOOLEAN,
  -- 其他字段...
  UNIQUE KEY uk_submission_question (submission_id, question_id)
);
```

### 答题时长记录表 (exam_duration_logs) - 可选
```sql
CREATE TABLE exam_duration_logs (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  submission_id BIGINT NOT NULL,
  question_id BIGINT NOT NULL,
  enter_time BIGINT NOT NULL,    -- 进入时间戳（毫秒）
  leave_time BIGINT NOT NULL,    -- 离开时间戳（毫秒）
  duration INT NOT NULL,         -- 时长（秒）
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_submission (submission_id),
  INDEX idx_question (question_id)
);
```

---

## 三、后端实现要点

### 3.1 保存答案接口实现逻辑

```typescript
// POST /exam/save 伪代码
async function saveAnswer(req) {
  const { submissionId, questionId, answer, enterTime, leaveTime } = req.body;
  
  // 1. 保存答案内容
  await updateAnswer(submissionId, questionId, answer);
  
  // 2. 如果提供了时间戳，计算并累加时长
  if (enterTime && leaveTime) {
    const duration = Math.floor((leaveTime - enterTime) / 1000);
    
    // 累加到该题的总时长
    await incrementQuestionDuration(submissionId, questionId, duration);
    
    // 可选：记录详细日志
    await logDuration(submissionId, questionId, enterTime, leaveTime, duration);
  }
  
  return { code: 0, msg: "保存成功" };
}

// 累加题目时长
async function incrementQuestionDuration(submissionId, questionId, duration) {
  await db.query(`
    UPDATE exam_answers 
    SET duration = duration + ? 
    WHERE submission_id = ? AND question_id = ?
  `, [duration, submissionId, questionId]);
}
```

### 3.2 获取题目时长接口实现

```typescript
// POST /exam/question-duration 伪代码
async function getQuestionDuration(req) {
  const { submissionId, questionId } = req.body;
  
  const result = await db.query(`
    SELECT duration 
    FROM exam_answers 
    WHERE submission_id = ? AND question_id = ?
  `, [submissionId, questionId]);
  
  return {
    code: 0,
    msg: "success",
    data: { duration: result?.duration || 0 }
  };
}
```

### 3.3 时长数据的使用场景

1. **实时显示**: 前端显示 = 后端累计时长 + 当前正在计时的部分
2. **统计分析**: 分析学生在各题目上的用时分布
3. **异常检测**: 检测答题时长异常（过短或过长）
4. **学习分析**: 了解学生在哪些知识点上花费时间较多

---

## 四、前端实现要点

### 4.1 答题页面时长记录流程

```typescript
// 1. 进入题目时记录时间戳
function enterQuestion(questionId) {
  answerRecord.enterTime = Date.now();
}

// 2. 离开题目时发送时间戳
async function leaveQuestion(questionId) {
  if (answerRecord.enterTime > 0) {
    await saveAnswer({
      submissionId,
      questionId,
      answer: answerRecord.answer,
      enterTime: answerRecord.enterTime,
      leaveTime: Date.now()
    });
    answerRecord.enterTime = 0;
  }
}

// 3. 实时显示用时
const currentDuration = computed(() => {
  let duration = answerRecord.duration; // 后端返回的累计时长
  if (answerRecord.enterTime > 0) {
    // 加上当前正在计时的部分
    duration += Math.floor((Date.now() - answerRecord.enterTime) / 1000);
  }
  return duration;
});
```

### 4.2 切换题目时的处理

```typescript
function switchQuestion(newQuestionId) {
  // 1. 离开当前题目（发送时间戳）
  if (currentQuestion) {
    await leaveQuestion(currentQuestion.id);
  }
  
  // 2. 切换到新题目
  currentQuestionId = newQuestionId;
  
  // 3. 进入新题目（记录时间戳）
  enterQuestion(newQuestionId);
}
```

---

## 五、注意事项

1. **时间戳精度**: 使用毫秒级时间戳，确保精确计时
2. **网络延迟**: 时长计算基于客户端时间戳，不受网络延迟影响
3. **数据一致性**: 使用数据库事务确保答案和时长同时更新
4. **异常处理**: 处理时间戳异常（如 leaveTime < enterTime）
5. **性能优化**: 考虑批量更新时长，减少数据库操作
6. **数据安全**: 验证时间戳的合理性，防止作弊