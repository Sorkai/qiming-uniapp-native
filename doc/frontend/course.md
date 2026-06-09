# 前端课程模块接口文档

基础前缀：`/edu/frontend/v1`

## 1. 获取课程列表

- **接口地址**：`/course/list`- **请求方式**：GET
- **请求参数**：

    -`pageNum`: number (页码)

    - `pageSize`: number (可选，每页数量，默认10)
    - `queryType`: number (可选，查询类型)
    - `status`: string (可选，状态筛选)

- **响应参数**：

````json
{
  "code": 200,
  "msg": "成功",
  "data": {
    "list": [
      {
        "courseId": 1,
        "courseName": "Python 基础入门",
        "thumbUrl": "string",
        "isRequired": 1, // 1:必修 0:选修
        "totalHours": 24,
        "finishedHours": 18
      }
    ],
    "total": 100
  }
}

```text
## 2. 获取课程详情

- **接口地址**：`/course/detail`- **请求方式**：GET
- **请求参数**：

    -`courseId`: number (课程ID)

- **响应参数**：

```json
{
  "code": 200,
  "msg": "成功",
  "data": {
    "courseId": 1,
    "courseName": "string",
    "thumbUrl": "string",
    "isRequired": 1,
    "totalHours": 24,
    "finishedHours": 18,
    "courseDesc": "string",
    "courseChapterList": [
      {
        "chapterId": 1,
        "name": "章节名称",
        "hourList": [
          {
            "hourId": 1,
            "duration": 1800,
            "title": "课时标题",
            "rType": "video",
            "fileUrl": "string",
            "finished": 1 // 1:完成 0:未完成
          }
        ]
      }
    ],
    "courseAttrList": [
      {
        "resourceId": 1,
        "title": "附件标题",
        "rType": "pdf",
        "attrId": 1,
        "fileUrl": "string"
      }
    ]
  }
}

```text
## 3. 课时完成上报

- **接口地址**：`/course/report/lesson`- **请求方式**：POST
- **请求参数**：

```json
{
  "courseId": 1,
  "hourId": 1
}

```text


- **响应参数**：

```json
{
  "code": 200,
  "msg": "成功",
  "data": null
}

```text
## 4. 获取课程学习效果

- **接口地址**：`/course/study/effect`- **请求方式**：GET
- **请求参数**：

    -`courseId`: number

- **响应参数**：

```json
{
  "code": 200,
  "msg": "成功",
  "data": {
    "courseId": 1,
    "keyPointNum": 12,
    "difficultPointNum": 5,
    "knowledgePointNum": 28,
    "conceptNum": 15,
    "chapterList": [
      {
        "chapterId": 1,
        "chapterName": "string",
        "keyPointArray": [{ "title": "string", "content": "string" }],
        "difficultPointArray": [{ "title": "string", "content": "string" }],
        "knowledgeArray": [{ "title": "string", "content": "string" }],
        "ConceptArray": [{ "title": "string", "content": "string" }]
      }
    ]
  }
}

```text
## 5. 获取课程成绩

- **接口地址**：`/course/score`- **请求方式**：GET
- **请求参数**：

    -`courseId`: number

- **响应参数**：

```json
{
  "code": 200,
  "msg": "成功",
  "data": {
    "courseId": 1,
    "courseScore": 85,
    "workScore": 90,
    "examScore": 78
  }
}

```text
## 6. 获取课程成绩详情列表

获取课程中每个作业/考试的得分、提交时间、评语等详细信息。

- **接口地址**：`/course/grades/list`- **请求方式**：GET
- **请求参数**：

    -`courseId`: number (课程ID)

- **响应参数**：

```json
{
  "code": 200,
  "msg": "成功",
  "data": {
    "list": [
      {
        "name": "第一章基础练习",
        "type": "作业",
        "score": 85,
        "submitTime": "2024-03-15 14:30:00",
        "gradedTime": "2024-03-16 10:00:00",
        "comment": "完成度较好，但部分细节需要注意"
      },
      {
        "name": "Python环境搭建实验",
        "type": "实验",
        "score": 95,
        "submitTime": "2024-03-18 11:20:00",
        "gradedTime": "2024-03-19 14:00:00",
        "comment": "实验报告详尽，操作规范"
      },
      {
        "name": "期中综合考试",
        "type": "考试",
        "score": 82,
        "submitTime": "2024-04-10 16:00:00",
        "gradedTime": "2024-04-12 09:00:00",
        "comment": "整体表现不错，继续保持"
      }
    ]
  }
}

```text
## 7. 获取课程成绩统计概览

获取课程成绩的统计指标，包含总作业数、完成数、平均分、最高分等。

- **接口地址**：`/course/grades/statistics`- **请求方式**：GET
- **请求参数**：

    -`courseId`: number (课程ID)

- **响应参数**：

```json
{
  "code": 200,
  "msg": "成功",
  "data": {
    "totalAssignments": 12,
    "completedAssignments": 8,
    "averageScore": 87.2,
    "highestScore": 98,
    "completionRate": 66.7
  }
}

```text
**字段说明**：
| 字段 | 类型 | 说明 |
|------|------|------|
| totalAssignments | number | 总作业/考试数 |
| completedAssignments | number | 已完成数 |
| averageScore | number | 平均分 |
| highestScore | number | 最高分 |
| completionRate | number | 完成率（百分比） |

## 8. 获取成绩班级对比数据

获取个人得分与班级平均分的对比数据，用于展示对比图表。

- **接口地址**：`/course/grades/class-comparison`- **请求方式**：GET
- **请求参数**：

    -`courseId`: number (课程ID)

- **响应参数**：

```json
{
  "code": 200,
  "msg": "成功",
  "data": {
    "categories": [
      "第一章作业",
      "环境搭建实验",
      "第二章作业",
      "单元测验",
      "综合实验",
      "期中考试",
      "第三章作业",
      "面向对象实验"
    ],
    "personalScores": [85, 95, 92, 78, 88, 82, 88, 90],
    "classAverages": [80, 88, 85, 75, 82, 78, 82, 85]
  }
}

```**字段说明**：
| 字段 | 类型 | 说明 |
|------|------|------|
| categories | string[] | 比较项名称列表（作业/考试/实验名称） |
| personalScores | number[] | 个人得分列表（与categories一一对应） |
| classAverages | number[] | 班级平均分列表（与categories一一对应） |

**成绩类型说明**：

-`作业`: 平时课后作业
- `考试`: 单元测验或期中期末考试
- `实验`: 实践操作实验项目
````
