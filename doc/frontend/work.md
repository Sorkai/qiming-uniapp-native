# 前端作业与考试接口文档

基础前缀：`/edu/frontend/v1`

## 1. 获取用户课程考试列表

- **接口地址**：`/course/exam/list`
- **请求方式**：GET
- **请求参数**：
  - `courseId`: number

- **响应参数**：
```json
{
  "code": 200,
  "msg": "成功",
  "data": [
    {
      "examId": 1,
      "title": "Python 期中考试",
      "description": "string",
      "questionNum": 20,
      "totalPoints": 100,
      "timeLimit": 90,
      "availableFrom": "string",
      "availableTo": "string",
      "status": 2, // 1:未开始 2:进行中 3:已完成 4:已过期
      "score": 0
    }
  ]
}
```

## 2. 获取考试详情

- **接口地址**：`/exam/detail`
- **请求方式**：GET
- **请求参数**：
  - `examId`: number
  - `courseId`: number

- **响应参数**：
```json
{
  "code": 200,
  "msg": "成功",
  "data": {
    "examId": 1,
    "title": "string",
    "description": "string",
    "questionCount": 5,
    "totalScore": 100,
    "timeLimit": 90,
    "startTime": "string",
    "endTime": "string",
    "questions": [
      {
        "questionId": 1,
        "title": "string",
        "content": "string",
        "type": 1, // 1:单选 2:多选 3:判断 4:填空 5:简答
        "score": 20,
        "options": [
          { "optionId": "A", "content": "string" }
        ]
      }
    ]
  }
}
```

## 3. 提交考试答案

- **接口地址**：`/exam/submit`
- **请求方式**：POST
- **请求参数**：
```json
{
  "examId": 1,
  "courseId": 1,
  "answers": [
    { "questionId": 1, "answer": "A" }
  ]
}
```
- **响应参数**：
```json
{
  "code": 200,
  "msg": "成功",
  "data": {
    "score": 80,
    "totalScore": 100
  }
}
```

## 4. 获取用户课程作业列表

- **接口地址**：`/course/homework/list`
- **请求方式**：GET
- **请求参数**：
  - `courseId`: number

- **响应参数**：
```json
{
  "code": 200,
  "msg": "成功",
  "data": [
    {
      "homeworkId": 1,
      "title": "string",
      "description": "string",
      "questionNum": 10,
      "totalPoints": 100,
      "dueDate": "string",
      "status": 2,
      "score": 0
    }
  ]
}
```

## 5. 获取作业详情

- **接口地址**：`/homework/detail`
- **请求方式**：GET
- **请求参数**：
  - `homeworkId`: number
  - `courseId`: number

- **响应参数**：
```json
{
  "code": 200,
  "msg": "成功",
  "data": {
    "homeworkId": 1,
    "title": "string",
    "description": "string",
    "questionCount": 10,
    "totalScore": 100,
    "deadline": "string",
    "questions": [
      {
        "questionId": 1,
        "title": "string",
        "content": "string",
        "type": 1,
        "score": 10,
        "options": []
      }
    ]
  }
}
```

## 6. 提交作业答案

- **接口地址**：`/homework/submit`
- **请求方式**：POST
- **请求参数**：
```json
{
  "homeworkId": 1,
  "courseId": 1,
  "answers": [
    { "questionId": 1, "answer": "string" }
  ]
}
```
- **响应参数**：
```json
{
  "code": 200,
  "msg": "成功",
  "data": {
    "score": 90,
    "totalScore": 100
  }
}
```

## 7. 获取用户错题列表

- **接口地址**：`/wrong/question/list`
- **请求方式**：GET
- **请求参数**：
  - `pageNum`: number
  - `pageSize`: number
  - `sourceType`: number (1:作业 2:考试 3:自测题)
  - `courseId`: number (可选)

- **响应参数**：
```json
{
  "code": 200,
  "msg": "成功",
  "data": {
    "total": 10,
    "list": [
      {
        "id": 1,
        "sourceType": 1,
        "sourceId": 1,
        "sourceName": "string",
        "questionId": 1,
        "questionType": 1,
        "title": "string",
        "stem": "string",
        "options": "string", // JSON字符串
        "analysis": "string",
        "answer": "string",
        "userAnswer": "string",
        "wrongNum": 2,
        "lastWrongTime": "string"
      }
    ]
  }
}
```
