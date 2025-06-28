# 前端作业与考试接口文档

## 1. 获取考试详情

**接口地址**：`/api/frontend/work/getExamDetail`

**请求方式**：POST

**请求参数**：

| 参数名 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| examId | int64 | 是 | 考试ID |
| courseId | int64 | 是 | 课程ID |

**响应参数**：

| 参数名 | 类型 | 说明 |
| --- | --- | --- |
| code | int | 状态码，0表示成功 |
| msg | string | 提示信息 |
| data | object | 响应数据 |
| data.examId | int64 | 考试ID |
| data.title | string | 考试标题 |
| data.description | string | 考试描述 |
| data.questionCount | int | 试题数量 |
| data.totalScore | int | 总分 |
| data.timeLimit | int | 时间限制（分钟） |
| data.startTime | string | 开始时间 |
| data.endTime | string | 结束时间 |
| data.questions | array | 试题列表 |
| data.questions[].questionId | int64 | 试题ID |
| data.questions[].title | string | 试题标题 |
| data.questions[].content | string | 试题内容 |
| data.questions[].type | int | 试题类型（1：单选题，2：多选题，3：判断题，4：填空题，5：简答题） |
| data.questions[].score | int | 分值 |
| data.questions[].options | array | 选项列表（选择题） |
| data.questions[].options[].optionId | string | 选项ID |
| data.questions[].options[].content | string | 选项内容 |

## 2. 提交考试答案

**接口地址**：`/api/frontend/work/submitExamAnswers`

**请求方式**：POST

**请求参数**：

| 参数名 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| examId | int64 | 是 | 考试ID |
| courseId | int64 | 是 | 课程ID |
| answers | array | 是 | 答案列表 |
| answers[].questionId | int64 | 是 | 试题ID |
| answers[].answer | string | 是 | 答案内容 |

**响应参数**：

| 参数名 | 类型 | 说明 |
| --- | --- | --- |
| code | int | 状态码，0表示成功 |
| msg | string | 提示信息 |
| data | object | 响应数据 |
| data.score | int | 得分 |
| data.totalScore | int | 总分 |

## 3. 获取作业详情

**接口地址**：`/api/frontend/work/getHomeworkDetail`

**请求方式**：POST

**请求参数**：

| 参数名 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| homeworkId | int64 | 是 | 作业ID |
| courseId | int64 | 是 | 课程ID |

**响应参数**：

| 参数名 | 类型 | 说明 |
| --- | --- | --- |
| code | int | 状态码，0表示成功 |
| msg | string | 提示信息 |
| data | object | 响应数据 |
| data.homeworkId | int64 | 作业ID |
| data.title | string | 作业标题 |
| data.description | string | 作业描述 |
| data.questionCount | int | 试题数量 |
| data.totalScore | int | 总分 |
| data.deadline | string | 截止日期 |
| data.questions | array | 试题列表 |
| data.questions[].questionId | int64 | 试题ID |
| data.questions[].title | string | 试题标题 |
| data.questions[].content | string | 试题内容 |
| data.questions[].type | int | 试题类型（1：单选题，2：多选题，3：判断题，4：填空题，5：简答题） |
| data.questions[].score | int | 分值 |
| data.questions[].options | array | 选项列表（选择题） |
| data.questions[].options[].optionId | string | 选项ID |
| data.questions[].options[].content | string | 选项内容 |

## 4. 提交作业答案

**接口地址**：`/api/frontend/work/submitHomeworkAnswers`

**请求方式**：POST

**请求参数**：

| 参数名 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| homeworkId | int64 | 是 | 作业ID |
| courseId | int64 | 是 | 课程ID |
| answers | array | 是 | 答案列表 |
| answers[].questionId | int64 | 是 | 试题ID |
| answers[].answer | string | 是 | 答案内容 |

**响应参数**：

| 参数名 | 类型 | 说明 |
| --- | --- | --- |
| code | int | 状态码，0表示成功 |
| msg | string | 提示信息 |
| data | object | 响应数据 |
| data.score | int | 得分 |
| data.totalScore | int | 总分 |

## 5. 获取用户课程考试列表

**接口地址**：`/api/frontend/work/getUserCourseExamList`

**请求方式**：POST

**请求参数**：

| 参数名 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| courseId | int64 | 是 | 课程ID |

**响应参数**：

| 参数名 | 类型 | 说明 |
| --- | --- | --- |
| code | int | 状态码，0表示成功 |
| msg | string | 提示信息 |
| data | array | 响应数据 |
| data[].examId | int64 | 考试ID |
| data[].title | string | 考试标题 |
| data[].description | string | 考试描述 |
| data[].questionCount | int | 试题数量 |
| data[].totalScore | int | 总分 |
| data[].timeLimit | int | 时间限制（分钟） |
| data[].startTime | string | 开始时间 |
| data[].endTime | string | 结束时间 |
| data[].status | int | 状态（1：未开始，2：进行中，3：已完成，4：已过期） |
| data[].score | int | 得分（仅当status=3时有值） |

## 6. 获取用户课程作业列表

**接口地址**：`/api/frontend/work/getUserCourseHomeworkList`

**请求方式**：POST

**请求参数**：

| 参数名 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| courseId | int64 | 是 | 课程ID |

**响应参数**：

| 参数名 | 类型 | 说明 |
| --- | --- | --- |
| code | int | 状态码，0表示成功 |
| msg | string | 提示信息 |
| data | array | 响应数据 |
| data[].homeworkId | int64 | 作业ID |
| data[].title | string | 作业标题 |
| data[].description | string | 作业描述 |
| data[].questionCount | int | 试题数量 |
| data[].totalScore | int | 总分 |
| data[].deadline | string | 截止日期 |
| data[].status | int | 状态（1：未开始，2：进行中，3：已完成，4：已过期） |
| data[].score | int | 得分（仅当status=3时有值） |

## 7. 获取用户错题列表

**接口地址**：`/api/frontend/work/getUserWrongQuestionList`

**请求方式**：POST

**请求参数**：

| 参数名 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| page | int | 是 | 页码，从1开始 |
| pageSize | int | 是 | 每页数量 |
| sourceType | int | 否 | 来源类型（1：作业，2：考试，不传则查询全部） |

**响应参数**：

| 参数名 | 类型 | 说明 |
| --- | --- | --- |
| code | int | 状态码，0表示成功 |
| msg | string | 提示信息 |
| data | object | 响应数据 |
| data.total | int64 | 总数 |
| data.list | array | 错题列表 |
| data.list[].wrongQuestionId | int64 | 错题ID |
| data.list[].questionId | int64 | 试题ID |
| data.list[].title | string | 试题标题 |
| data.list[].content | string | 试题内容 |
| data.list[].type | int | 试题类型（1：单选题，2：多选题，3：判断题，4：填空题，5：简答题） |
| data.list[].options | array | 选项列表（选择题） |
| data.list[].options[].optionId | string | 选项ID |
| data.list[].options[].content | string | 选项内容 |
| data.list[].answer | string | 正确答案 |
| data.list[].userAnswer | string | 用户答案 |
| data.list[].sourceType | int | 来源类型（1：作业，2：考试） |
| data.list[].sourceId | int64 | 来源ID（作业ID或考试ID） |
| data.list[].sourceTitle | string | 来源标题（作业标题或考试标题） |
| data.list[].createTime | string | 创建时间 |