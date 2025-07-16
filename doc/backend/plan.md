# 教案管理接口文档

## 接口前缀

所有接口都有共同的前缀：`edu/backend/v1`

## 认证方式

所有接口都需要 JWT 认证，请在请求头中添加 `Authorization` 字段。

## 接口列表

### 1. 生成教案

- **接口路径**：`/course/generate/teacher/plan`
- **请求方式**：POST
- **接口描述**：生成课程章节的教案

#### 请求参数

```json
{
  "course_id": 1, // 课程id
  "chapter_id": 1 // 章节id
}
```

| 参数名 | 类型 | 必填 | 描述 |
| ------ | ---- | ---- | ---- |
| course_id | int64 | 是 | 课程id |
| chapter_id | int64 | 是 | 章节id |

#### 响应参数

```json
{}
```

### 2. 查看生成教案列表

- **接口路径**：`/course/teacher/plan/list`
- **请求方式**：GET
- **接口描述**：获取已生成的教案列表

#### 请求参数

| 参数名 | 类型 | 必填 | 描述 |
| ------ | ---- | ---- | ---- |
| pageNum | int64 | 是 | 页码 |
| pageSize | int64 | 否 | 每页数量，默认20 |

#### 响应参数

```json
{
  "total": 100, // 总数
  "teacherPlanList": [
    {
      "teacherPlanId": 1, // 教案id
      "courseId": 1, // 课程id
      "chapterId": 1, // 章节id
      "courseName": "课程名称", // 课程名称
      "chapterName": "章节名称" // 章节名称
    }
  ]
}
```

| 参数名 | 类型 | 描述 |
| ------ | ---- | ---- |
| total | int64 | 总数 |
| teacherPlanList | array | 教案列表 |
| teacherPlanList[].teacherPlanId | int64 | 教案id |
| teacherPlanList[].courseId | int64 | 课程id |
| teacherPlanList[].chapterId | int64 | 章节id |
| teacherPlanList[].courseName | string | 课程名称 |
| teacherPlanList[].chapterName | string | 章节名称 |

### 3. 查看教案生成进度

- **接口路径**：`/course/teacher/plan/progress`
- **请求方式**：GET
- **接口描述**：查询教案生成的进度状态

#### 请求参数

| 参数名 | 类型 | 必填 | 描述 |
| ------ | ---- | ---- | ---- |
| teacherPlanId | int64 | 是 | 教案id |

#### 响应参数

```json
{
  "progress": 1, // 进度 1:生成中 2:已生成
  "downloadUrl": "https://example.com/download/123" // 下载地址，已生成才会返回
}
```

| 参数名 | 类型 | 描述 |
| ------ | ---- | ---- |
| progress | int64 | 进度状态：1-生成中，2-已生成 |
| downloadUrl | string | 下载地址，仅在已生成状态(progress=2)时返回 |