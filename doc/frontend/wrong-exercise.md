# 前端错题分析接口

基础前缀：`/edu/frontend/v1`

## 1. 错题分析

- **接口地址**：`/ai/wrong-exercise/analyze`- **请求方式**：POST
- **请求参数**：

````json
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
## 2. 错题分析历史

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
