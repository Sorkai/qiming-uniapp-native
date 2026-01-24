# 前端 AI 接口文档

基础前缀：`/edu/frontend/v1`

## 1. AI 聊天流式接口

- **接口地址**：`/ai/chat/stream`- **请求方式**：POST
- **Content-Type**: application/json
- **鉴权**：需要（JWT）

**请求参数**：

````json
{
  "course_id": 1, // 课程ID（可选）
  "conversation_id": "string", // 会话ID（可选）
  "message": "string", // 消息内容
  "chapter_id": 1 // 章节ID（可选）
}

```text
**响应参数** (SSE流式)：

```json
{
  "conversation_id": "string", // 会话ID
  "delta": "string", // 增量内容
  "finished": true // 是否完成
}

```text
## 2. 获取会话历史

- **接口地址**：`/ai/get/conversations`- **请求方式**：GET
- **请求参数**：
    -`conversation_id`: string (会话ID)
- **响应参数**：

```json
{
  "code": 200,
  "msg": "成功",
  "data": {
    "messages": [
      {
        "role": "user", // 角色 user/assistant
        "content": "string" // 消息内容
      }
    ]
  }
}

```text
## 3. 作文批改分析

- **接口地址**：`/ai/essay/analyze`- **请求方式**：POST
- **请求参数**：

```json
{
  "essayType": "chinese", // chinese | english
  "content": "string"
}

```text


- **响应参数**：

```json
{
  "code": 200,
  "msg": "成功",
  "data": {
    "score": 85, // 总分
    "content": "string", // 内容评价
    "structure": "string", // 结构评价
    "language": "string", // 语言评价
    "suggestions": "string" // 改进建议
  }
}

```text
## 4. 错题分析

- **接口地址**：`/ai/wrong-exercise/analyze`- **请求方式**：POST
- **请求参数**：

```json
{
  "course_id": 1001,
  "original_exercise_id": "exercise_001",
  "original_exercise_content": "计算 2 + 3 × 4 的值",
  "student_answer": "20",
  "correct_answer": "14"
}

```text


- **响应参数**：

```json
{
  "code": 200,
  "msg": "成功",
  "data": {
    "analysis": {
      "error_type": "概念理解错误",
      "error_reason": "...",
      "knowledge_points": ["..."],
      "learning_suggestions": "..."
    },
    "generated_exercises": [
      {
        "exercise_id": "generated_ex_001",
        "question": "...",
        "options": ["A. ...", "B. ..."],
        "correct_answer": "B",
        "explanation": "...",
        "difficulty_level": "easy",
        "knowledge_points": ["..."]
      }
    ]
  }
}

```text
## 5. 错题分析历史

- **接口地址**：`/ai/wrong-exercise/history`- **请求方式**：GET
- **请求参数**：
    -`course_id`: int64 (可选)
    - `page`: int (默认1)
    - `page_size`: int (默认10)
- **响应参数**：

```json
{
  "code": 200,
  "msg": "成功",
  "data": {
    "total": 1,
    "page": 1,
    "page_size": 10,
    "total_pages": 1,
    "records": [
      {
        "id": "string",
        "course_id": "string",
        "original_exercise_id": "string",
        "original_exercise_content": "...",
        "student_answer": "...",
        "correct_answer": "...",
        "analysis": {},
        "generated_exercises": [],
        "created_at": "string",
        "updated_at": "string"
      }
    ]
  }
}

````
