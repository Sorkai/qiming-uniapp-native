# 前端错题分析接口

基础前缀：/edu/frontend/v1

## 1. 错题分析

- 方法：POST
- 路径：/ai/wrong-exercise/analyze
- Content-Type: application/json
- 鉴权：需要（JWT）

请求体：
{
  "course_id": 1001,
  "original_exercise_id": "exercise_001",
  "original_exercise_content": "计算 2 + 3 × 4 的值",
  "student_answer": "20",
  "correct_answer": "14"
}

响应：
{
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

PowerShell 示例：

$headers = @{ "Authorization" = "Bearer <TOKEN>"; "Content-Type" = "application/json" }
$body = @{ course_id = 1001; original_exercise_id = "exercise_001"; original_exercise_content = "计算 2 + 3 × 4 的值"; student_answer = "20"; correct_answer = "14" } | ConvertTo-Json
Invoke-RestMethod -Method POST -Uri "http://localhost:1004/edu/frontend/v1/ai/wrong-exercise/analyze" -Headers $headers -Body $body

## 2. 错题分析历史

- 方法：GET
- 路径：/ai/wrong-exercise/history
- Query：course_id(可选), page(默认1), page_size(默认10)
- 鉴权：需要（JWT）

响应：
{
  "total": 1,
  "page": 1,
  "page_size": 10,
  "total_pages": 1,
  "records": [
    {
      "id": "wrong_exercise_20250817_152333_98902bea",
      "course_id": "math_001",
      "original_exercise_id": "exercise_001",
      "original_exercise_content": "...",
      "student_answer": "20",
      "correct_answer": "14",
      "analysis": { "error_type": "...", "error_reason": "...", "knowledge_points": ["..."], "learning_suggestions": "..." },
      "generated_exercises": [ { "exercise_id": "generated_ex_001", "question": "..." } ],
      "created_at": "2025-08-17T15:23:33.403345",
      "updated_at": "2025-08-17T15:23:33.403358"
    }
  ]
}

PowerShell 示例：

$headers = @{ "Authorization" = "Bearer <TOKEN>" }
Invoke-RestMethod -Method GET -Uri "http://localhost:1004/edu/frontend/v1/ai/wrong-exercise/history?course_id=math_001&page=1&page_size=5" -Headers $headers
