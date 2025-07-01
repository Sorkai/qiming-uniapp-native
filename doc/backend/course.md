# 后端课程管理接口

## 创建课程信息

- **接口地址**：`/edu/backend/v1/course/create`
- **请求方式**：POST
- **请求参数**：

```json
{
  "title": "string",           // 课程标题
  "thumb_url": "string",       // 课程封面地址
  "shortDesc": "string",       // 课程简介
  "isRequired": "int64",       // 是否必修，1: 必修，0: 选修
  "categoryIds": ["int64"],    // 课程分类ID列表
  "isChapter": "int64",        // 是否章节，1: 是，0: 否
  "endingTime": "string",      // 课程结束时间（yyyy-MM-dd hh:mm:ss）
  "chapterList": [             // 章节列表（可选）
    {
      "chapterId": "int64",     // 章节ID（可选）
      "name": "string",         // 章节标题
      "hourList": [             // 章节课时
        {
          "resourceId": "int64", // 课时资源ID
          "duration": "int64",   // 时长（秒）
          "title": "string",     // 课时标题（可选）
          "rType": "string",     // 资源类型（可选）
          "hourId": "int64",     // 课时ID（可选）
          "fileUrl": "string"    // 课时文件地址（可选）
        }
      ]
    }
  ],
  "hourList": [                // 课时列表（可选）
    {
      "resourceId": "int64",    // 课时资源ID
      "duration": "int64",      // 时长（秒）
      "title": "string",        // 课时标题（可选）
      "rType": "string",        // 资源类型（可选）
      "hourId": "int64",        // 课时ID（可选）
      "fileUrl": "string"       // 课时文件地址（可选）
    }
  ],
  "attrList": [                // 附件资源列表（可选）
    {
      "resourceId": "int64",    // 附件资源ID
      "title": "string",        // 附件标题（可选）
      "rType": "string",        // 附件类型（可选）
      "attrId": "int64",        // 附件ID（可选）
      "fileUrl": "string"       // 附件地址（可选）
    }
  ]
}
```

- **响应参数**：无

## 编辑课程基本信息

- **接口地址**：`/edu/backend/v1/course/update`
- **请求方式**：POST
- **请求参数**：

```json
{
  "courseId": "int64",         // 课程ID
  "title": "string",           // 课程标题（可选）
  "thumbUrl": "string",        // 课程封面Url（可选）
  "shortDesc": "string",       // 课程简介（可选）
  "isRequired": "int64",       // 是否必修，1: 必修，0: 选修
  "categoryIds": ["int64"],    // 课程分类ID列表
  "endingTime": "string"       // 课程结束时间（yyyy-MM-dd hh:mm:ss）（可选）
}
```

- **响应参数**：无

## 获取课程列表

- **接口地址**：`/edu/backend/v1/course/list`
- **请求方式**：GET
- **请求参数**：

```
pageNum: int64         // 页码
pageSize: int64        // 每页数量，默认20
courseName: string     // 课程名称（可选）
```

- **响应参数**：

```json
{
  "total": "int64",      // 总数
  "courseList": [        // 课程列表
    {
      "courseId": "int64",      // 课程ID
      "title": "string",        // 课程标题
      "thumbUrl": "string",     // 课程封面
      "shortDesc": "string",    // 课程简介
      "categoryDesc": "string", // 课程分类描述
      "isRequired": "int64",    // 是否必修，1: 必修，0: 选修
      "userName": "string",     // 用户名
      "startTime": "string",    // 开始时间
      "endTime": "string",      // 结束时间
      "categoryList": [         // 分类列表
        {
          "categoryId": "int64", // 分类ID
          "name": "string"       // 分类名称
        }
      ]
    }
  ]
}
```

## 获取课程课时列表

- **接口地址**：`/edu/backend/v1/course/hours/list`
- **请求方式**：GET
- **请求参数**：

```
courseId: int64    // 课程ID
```

- **响应参数**：

```json
{
  "courseChapters": [    // 课程章节列表
    {
      "chapterId": "int64", // 章节ID
      "name": "string",     // 章节标题
      "hourList": [         // 章节课时列表
        {
          "resourceId": "int64", // 课时资源ID
          "duration": "int64",   // 时长（秒）
          "title": "string",     // 课时标题
          "rType": "string",     // 资源类型
          "hourId": "int64",     // 课时ID
          "fileUrl": "string"    // 课时文件地址
        }
      ]
    }
  ]
}
```

## 获取课程附件列表

- **接口地址**：`/edu/backend/v1/course/attr/list`
- **请求方式**：GET
- **请求参数**：

```
courseId: int64    // 课程ID
```

- **响应参数**：

```json
{
  "courseWares": [       // 课程附件列表
    {
      "resourceId": "int64", // 附件资源ID
      "title": "string",     // 附件标题
      "rType": "string",     // 附件类型
      "attrId": "int64",     // 附件ID
      "fileUrl": "string"    // 附件地址
    }
  ]
}
```

## 课程分配

- **接口地址**：`/edu/backend/v1/course/allocation`
- **请求方式**：POST
- **请求参数**：

```json
{
  "courseId": "int64",     // 课程ID
  "userIdList": ["int64"]  // 用户ID列表
}
```

- **响应参数**：无

## 获取课程可分配的学员列表

- **接口地址**：`/edu/backend/v1/course/allocation/user/list`
- **请求方式**：GET
- **请求参数**：

```
courseId: int64    // 课程ID
userName: string   // 用户名（可选）
pageNum: int64     // 页码
pageSize: int64    // 每页数量，默认20
```

- **响应参数**：

```json
{
  "total": "int64",  // 总数
  "list": [          // 列表
    {
      "userId": "int64",    // 用户ID
      "userName": "string", // 用户名
      "avatar": "string"    // 头像
    }
  ]
}
```

## 获取课程学员学习情况列表

- **接口地址**：`/edu/backend/v1/course/study/user/list`
- **请求方式**：GET
- **请求参数**：

```
courseId: int64    // 课程ID
userName: string   // 用户名（可选）
pageNum: int64     // 页码
pageSize: int64    // 每页数量，默认20
```

- **响应参数**：

```json
{
  "total": "int64",  // 总数
  "list": [          // 列表
    {
      "userId": "int64",            // 用户ID
      "userName": "string",         // 用户名
      "avatar": "string",           // 头像
      "totalHours": "int64",        // 总课时数
      "finishedHours": "int64",     // 已完成课时数
      "startStudyTime": "string",   // 开始学习时间 yyyy-MM-dd HH:mm:ss
      "finishedStudyTime": "string" // 完成学习时间 yyyy-MM-dd HH:mm:ss（可选）
    }
  ]
}
```

## 新增课程的章节及课时

- **接口地址**：`/edu/backend/v1/course/create/chapter`
- **请求方式**：POST
- **请求参数**：

```json
{
  "courseId": "int64",      // 课程ID
  "chapter": {              // 章节
    "chapterId": "int64",   // 章节ID（可选）
    "name": "string",       // 章节标题
    "hourList": [           // 章节课时
      {
        "resourceId": "int64", // 课时资源ID
        "duration": "int64",   // 时长（秒）
        "title": "string",     // 课时标题（可选）
        "rType": "string",     // 资源类型（可选）
        "hourId": "int64",     // 课时ID（可选）
        "fileUrl": "string"    // 课时文件地址（可选）
      }
    ]
  }
}
```

- **响应参数**：无

## 删除课程

- **接口地址**：`/edu/backend/v1/course/delete`
- **请求方式**：POST
- **请求参数**：

```json
{
  "courseId": "int64"      // 课程ID
}
```

- **响应参数**：无

## 删除章节

- **接口地址**：`/edu/backend/v1/course/delete/chapter`
- **请求方式**：POST
- **请求参数**：

```json
{
  "courseId": "int64",    // 课程ID
  "chapterId": "int64"    // 章节ID
}
```

- **响应参数**：无

## 删除课时

- **接口地址**：`/edu/backend/v1/course/delete/hour`
- **请求方式**：POST
- **请求参数**：

```json
{
  "courseId": "int64",    // 课程ID
  "chapterId": "int64",   // 章节ID
  "hourId": "int64"       // 课时ID
}
```

- **响应参数**：无