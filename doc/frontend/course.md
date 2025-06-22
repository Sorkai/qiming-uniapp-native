# 前端课程管理接口

## 获取课程列表

- **接口地址**：`/edu/frontend/v1/course/list`
- **请求方式**：GET
- **请求参数**：

```
pageNum: int64     // 页码
pageSize: int64    // 页大小
queryType: int64   // 查询类型 0:全部 1:必修 2:选修 3:已学完 4:未学完（可选，默认0）
```

- **响应参数**：

```json
{
  "list": [              // 课程列表
    {
      "courseId": "int64",      // 课程Id
      "courseName": "string",   // 课程名称
      "thumbUrl": "string",     // 封面地址
      "isRequired": "int64",    // 是否必修 1:必修 0:选修
      "totalHours": "int64",    // 总课时数
      "finishedHours": "int64"  // 已完成课时数
    }
  ],
  "total": "int64"       // 总数
}
```

## 获取课程详情

- **接口地址**：`/edu/frontend/v1/course/detail`
- **请求方式**：GET
- **请求参数**：

```
courseId: int64    // 课程ID
```

- **响应参数**：

```json
{
  "courseId": "int64",          // 课程Id
  "courseName": "string",       // 课程名称
  "thumbUrl": "string",         // 封面地址
  "isRequired": "int64",        // 是否必修 1:必修 0:选修
  "totalHours": "int64",        // 总课时数
  "finishedHours": "int64",     // 已完成课时数
  "courseDesc": "string",       // 课程描述
  "courseChapterList": [        // 课程章节列表
    {
      "chapterId": "int64",      // 章节ID
      "name": "string",          // 章节标题
      "hourList": [              // 章节课时
        {
          "hourId": "int64",      // 课时ID
          "duration": "int64",    // 时长（秒）
          "title": "string",      // 课时标题
          "rType": "string",      // 资源类型
          "fileUrl": "string",    // 课时文件地址
          "finished": "int64"     // 是否完成 0:否 1:是
        }
      ]
    }
  ],
  "courseAttrList": [           // 课程附件列表
    {
      "resourceId": "int64",     // 附件资源ID
      "title": "string",         // 附件标题
      "rType": "string",         // 附件类型
      "attrId": "int64",         // 附件ID
      "fileUrl": "string"        // 附件地址
    }
  ]
}
```

## 课时完成上报

- **接口地址**：`/edu/frontend/v1/course/report/lesson`
- **请求方式**：POST
- **请求参数**：

```json
{
  "courseId": "int64", // 课程ID
  "hourId": "int64"    // 课时ID
}
```

- **响应参数**：无