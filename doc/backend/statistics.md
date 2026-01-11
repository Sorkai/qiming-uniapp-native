# 后端统计接口

## 获取最近7天老师使用情况【管理端统计】

- **接口地址**：`/edu/backend/v1/statistics/teacher/usage`
- **请求方式**：GET
- **请求参数**：无
- **响应参数**：

```json
{
  "usageInfoList": [      // 使用信息列表
    {
      "date": "string",    // 日期 yyyy-MM-dd
      "usageNum": "int64"  // 使用次数
    }
  ]
}
```

## 获取最近7天学生使用情况【管理端统计】

- **接口地址**：`/edu/backend/v1/statistics/student/usage`
- **请求方式**：GET
- **请求参数**：无
- **响应参数**：

```json
{
  "usageInfoList": [      // 使用信息列表
    {
      "date": "string",    // 日期 yyyy-MM-dd
      "usageNum": "int64"  // 使用次数
    }
  ]
}
```

## 获取教学效率指数【管理端统计】

- **接口地址**：`/edu/backend/v1/statistics/efficient/index`
- **请求方式**：GET
- **请求参数**：无
- **响应参数**：

```json
{
  "code": 200,
  "msg": "成功",
  "data": {
    "efficientIndexList": [ // 教学效率指数列表
      {
          "courseName": "string", // 课程名称
          "planTime": 120, // 备课耗时（分钟）
          "correctPlanTime": 30,// 备课修正耗时（分钟）
          "planWorkTime": 60,// 作业设计耗时（分钟）
          "correctPlanWorkTime": 15,// 作业设计修正耗时（分钟）
          "optimizeDirection": "string" // 优化方向建议
      }
    ]
  }
}
```


## 获取一周内学生、老师的总使用情况【管理端统计】

- **接口地址**：`/edu/backend/v1/statistics/week/usage`
- **请求方式**：GET
- **请求参数**：无
- **响应参数**：

```json
{
  "studentTotalNum": "int64",  // 学生总次数
  "teacherTotalNum": "int64"   // 老师总次数
}
```

## 统计老师课程下学生完成的进度【老师端统计】

- **接口地址**：`/edu/backend/v1/statistics/course/users/progress`
- **请求方式**：GET
- **请求参数**：无
- **响应参数**：

```json
{
  "courseUsersProgress": [      // 课程进度列表
    {
      "courseId": "int64",      // 课程id
      "courseName": "string",   // 课程名称
      "usersProgress": [         // 学生进度列表
        {
          "userId": "int64",     // 用户id
          "userName": "string",  // 用户名称
          "progress": "int64"    // 进度 后端返回50代表完成50%
        }
      ]
    }
  ]
}
```

## 统计老师课程考试学生成绩情况【老师端统计】

- **接口地址**：`/edu/backend/v1/statistics/course/users/exam/info`
- **请求方式**：GET
- **请求参数**：无
- **响应参数**：

```json
{
  "courseUsersExamInfoList": [    // 课程考试学生成绩情况列表
    {
      "courseId": "int64",        // 课程id
      "courseName": "string",     // 课程名称
      "examId": "int64",          // 考试id
      "examName": "string",       // 考试名称
      "examInfo": [               // 考试成绩等级信息
        {
          "level": "int64",        // 成绩等级 1:差 2:中等 3:良好 4:优秀
          "levelNum": "int64",     // 等级对应的学生人数
          "levelUserList": [       // 等级对应的学生列表
            {
              "userId": "int64",    // 用户id
              "userName": "string"  // 用户名称
            }
          ]
        }
      ]
    }
  ]
}
```
