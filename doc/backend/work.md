# 后端课程作业与考试管理接口

## 课程考试相关接口

### 获取课程考试列表

- **接口地址**：`/edu/backend/v1/course/exam/list`
- **请求方式**：GET
- **请求参数**：

| 参数名 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| pageNum | int64 | 是 | 页码 |
| pageSize | int64 | 否 | 每页数量，默认20 |
| courseId | int64 | 否 | 课程ID |
| courseName | string | 否 | 课程名称，用于模糊查询 |

- **响应参数**：

```json
{
  "total": "int64",           // 总记录数
  "examList": [               // 试卷信息列表
    {
      "examId": "int64",        // 考试ID
      "courseId": "int64",      // 课程ID
      "courseName": "string",   // 课程名称
      "title": "string",        // 考试标题
      "description": "string",  // 考试描述
      "questionNum": "int64",   // 试题数
      "totalPoints": "int64",   // 考试总分
      "timeLimit": "int64",     // 时间限制(分钟)
      "availableFrom": "string", // 考试开始时间
      "availableTo": "string"   // 考试结束时间
    }
  ]
}
```

### 获取考试试题列表

- **接口地址**：`/edu/backend/v1/exam/question/list`
- **请求方式**：GET
- **请求参数**：

| 参数名 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| pageNum | int64 | 是 | 页码 |
| pageSize | int64 | 否 | 每页数量，默认20 |
| examId | int64 | 是 | 试卷ID |

- **响应参数**：

```json
{
  "total": "int64",           // 总记录数
  "questionList": [           // 试题信息列表
    {
      "questionType": "int64",  // 题型:1-单选/2-多选/3-判断/4-填空/5-简答/6-论述
      "title": "string",        // 题目标题
      "stem": "string",         // 题目题干
      "options": "string",      // 选项(JSON格式，如{"A":"选项1","B":"选项2"})
      "correctAnswer": "string", // 正确答案
      "analysis": "string",     // 题目解析
      "points": "int64",        // 题目分值
      "difficulty": "int64",    // 难度等级(1-5)
      "sortOrder": "int64"      // 题目排序
    }
  ]
}
```

### 创建课程考试

- **接口地址**：`/edu/backend/v1/course/exam/create`
- **请求方式**：POST
- **请求参数**：

```json
{
  "courseId": "int64",      // 关联课程ID
  "title": "string",        // 考试标题
  "description": "string",  // 考试描述
  "timeLimit": "int64",     // 时间限制(分钟)
  "availableFrom": "string", // 考试开始时间 yyyy-MM-dd HH:mm:ss
  "availableTo": "string"   // 考试结束时间 yyyy-MM-dd HH:mm:ss
}
```

- **响应参数**：

```json
{
  "examId": "int64"         // 考试ID
}
```

### 更新课程考试

- **接口地址**：`/edu/backend/v1/course/exam/update`
- **请求方式**：POST
- **请求参数**：

```json
{
  "examId": "int64",        // 考试ID
  "title": "string",        // 考试标题（可选）
  "description": "string",  // 考试描述（可选）
  "timeLimit": "int64",     // 时间限制(分钟)（可选）
  "availableFrom": "string", // 考试开始时间 yyyy-MM-dd HH:mm:ss（可选）
  "availableTo": "string"   // 考试结束时间 yyyy-MM-dd HH:mm:ss（可选）
}
```

- **响应参数**：

```json
{}
```

### 删除课程考试

- **接口地址**：`/edu/backend/v1/course/exam/delete`
- **请求方式**：POST
- **请求参数**：

```json
{
  "examId": "int64"         // 考试ID
}
```

- **响应参数**：

```json
{}
```

### 批量添加课程考试试题

- **接口地址**：`/edu/backend/v1/exam/question/batch/add`
- **请求方式**：POST
- **请求参数**：

```json
{
  "examId": "int64",        // 考试ID
  "questions": [            // 试题列表
    {
      "questionType": "int64",  // 题型:1-单选/2-多选/3-判断/4-填空/5-简答/6-论述
      "title": "string",        // 题目标题
      "stem": "string",         // 题目题干
      "options": "string",      // 选项(JSON格式，如{"A":"选项1","B":"选项2"})
      "correctAnswer": "string", // 正确答案
      "analysis": "string",     // 题目解析
      "points": "int64",        // 题目分值
      "difficulty": "int64",    // 难度等级(1-5)
      "sortOrder": "int64"      // 题目排序
    }
  ]
}
```

- **响应参数**：

```json
{}
```

## 课程作业相关接口

### 获取课程章节作业列表

- **接口地址**：`/edu/backend/v1/course/homework/list`
- **请求方式**：GET
- **请求参数**：

| 参数名 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| pageNum | int64 | 是 | 页码 |
| pageSize | int64 | 否 | 每页数量，默认20 |
| courseId | int64 | 否 | 课程ID |
| chapterId | int64 | 否 | 章节ID |
| homeworkName | string | 否 | 作业名称，用于模糊查询 |

- **响应参数**：

```json
{
  "total": "int64",           // 总记录数
  "homeworkList": [           // 作业信息列表
    {
      "homeworkId": "int64",    // 作业ID
      "courseId": "int64",      // 课程ID
      "courseName": "string",   // 课程名称
      "chapterId": "int64",     // 章节ID
      "chapterName": "string",  // 章节名称
      "hourId": "int64",        // 课时ID
      "hourName": "string",     // 课时名称
      "title": "string",        // 作业标题
      "description": "string",  // 作业描述
      "questionNum": "int64",   // 试题数
      "totalPoints": "int64",   // 作业总分
      "dueDate": "string"       // 截止日期
    }
  ]
}
```

### 获取课程作业试题列表

- **接口地址**：`/edu/backend/v1/homework/question/list`
- **请求方式**：GET
- **请求参数**：

| 参数名 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| pageNum | int64 | 是 | 页码 |
| pageSize | int64 | 否 | 每页数量，默认20 |
| homeworkId | int64 | 是 | 作业ID |

- **响应参数**：

```json
{
  "total": "int64",           // 总记录数
  "questionList": [           // 试题信息列表
    {
      "questionType": "int64",  // 题型:1-单选/2-多选/3-判断/4-填空/5-简答/6-论述
      "title": "string",        // 题目标题
      "stem": "string",         // 题目题干
      "options": "string",      // 选项(JSON格式，如{"A":"选项1","B":"选项2"})
      "correctAnswer": "string", // 正确答案
      "analysis": "string",     // 题目解析
      "points": "int64",        // 题目分值
      "difficulty": "int64",    // 难度等级(1-5)
      "sortOrder": "int64"      // 题目排序
    }
  ]
}
```

### 创建课程作业

- **接口地址**：`/edu/backend/v1/course/homework/create`
- **请求方式**：POST
- **请求参数**：

```json
{
  "courseId": "int64",      // 关联课程ID
  "chapterId": "int64",     // 关联章节ID
  "hourId": "int64",        // 关联课时ID
  "title": "string",        // 作业标题
  "description": "string",  // 作业描述
  "dueDate": "string"       // 截止日期 yyyy-MM-dd HH:mm:ss
}
```

- **响应参数**：

```json
{
  "homeworkId": "int64"     // 作业ID
}
```

### 更新课程作业

- **接口地址**：`/edu/backend/v1/course/homework/update`
- **请求方式**：POST
- **请求参数**：

```json
{
  "homeworkId": "int64",    // 作业ID
  "title": "string",        // 作业标题（可选）
  "description": "string",  // 作业描述（可选）
  "dueDate": "string"       // 截止日期 yyyy-MM-dd HH:mm:ss（可选）
}
```

- **响应参数**：

```json
{}
```

### 删除课程作业

- **接口地址**：`/edu/backend/v1/course/homework/delete`
- **请求方式**：POST
- **请求参数**：

```json
{
  "homeworkId": "int64"     // 作业ID
}
```

- **响应参数**：

```json
{}
```

### 批量添加课程作业试题

- **接口地址**：`/edu/backend/v1/homework/question/batch/add`
- **请求方式**：POST
- **请求参数**：

```json
{
  "homeworkId": "int64",    // 作业ID
  "questions": [            // 试题列表
    {
      "questionType": "int64",  // 题型:1-单选/2-多选/3-判断/4-填空/5-简答/6-论述
      "title": "string",        // 题目标题
      "stem": "string",         // 题目题干
      "options": "string",      // 选项(JSON格式，如{"A":"选项1","B":"选项2"})
      "correctAnswer": "string", // 正确答案
      "analysis": "string",     // 题目解析
      "points": "int64",        // 题目分值
      "difficulty": "int64",    // 难度等级(1-5)
      "sortOrder": "int64"      // 题目排序
    }
  ]
}
```

- **响应参数**：

```json
{
  "code": 200,
  "msg": "成功",
  "data": null
}
```

### 创建课程考试

- **接口地址**：`/edu/backend/v1/course/exam/create`
- **请求方式**：POST
- **请求参数**：

```json
{
  "courseId": "int64",      // 关联课程ID
  "title": "string",        // 考试标题
  "description": "string",  // 考试描述
  "timeLimit": "int64",     // 时间限制(分钟)
  "availableFrom": "string", // 考试开始时间 yyyy-MM-dd HH:mm:ss
  "availableTo": "string"   // 考试结束时间 yyyy-MM-dd HH:mm:ss
}
```

### 删除试卷、作业的单道习题
#### 删除后需调用习题列表查询，才能看到添加的习题
- **接口地址**：`/edu/backend/v1/work/delete/question`
- **请求方式**：POST
- **请求参数**：

```json
{
  "deleteType": "int64",      // 删除类型 1:试卷 2:作业
  "sourceId": "int64",        // 试卷、作业的ID
  "questionId": "int64"  // 习题的ID
}
```
- **响应参数**：

```json
{}
```

### 随机添加一道试卷、作业的习题
#### 新增后需调用习题列表查询，才能看到添加的习题
- **接口地址**：`/edu/backend/v1/work/round/add/question`
- **请求方式**：POST
- **请求参数**：

```json
{
  "addType": "int64",      // 新增的类型 1:试卷 2:作业
  "sourceId": "int64"        // 试卷、作业的ID
}
```

- **响应参数**：

```json
{}
```
