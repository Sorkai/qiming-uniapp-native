# 作业与考试接口文档

## 接口前缀

所有接口的前缀为：`edu/frontend/v1`

## 接口认证

所有接口都需要JWT认证

## 接口列表

### 1. 获取试卷信息及试题信息

#### 接口描述

获取指定试卷的详细信息及其包含的试题信息。

#### 请求方式

- 请求方法: GET
- 请求路径: `/exam/detail`

#### 请求参数

| 参数名 | 类型 | 必填 | 描述 |
| ------ | ---- | ---- | ---- |
| examId | int64 | 是 | 试卷ID |

#### 响应参数

| 参数名 | 类型 | 描述 |
| ------ | ---- | ---- |
| examId | int64 | 考试ID |
| courseId | int64 | 课程ID |
| courseName | string | 课程名称 |
| title | string | 考试标题 |
| description | string | 考试描述 |
| questionNum | int64 | 试题数 |
| totalPoints | int64 | 考试总分 |
| timeLimit | int64 | 时间限制(分钟) |
| availableFrom | string | 考试开始时间 |
| availableTo | string | 考试结束时间 |
| finished | int64 | 是否完成 0:未完成 1:完成 |
| score | int64 | 考试的得分（如果已完成） |
| questionList | array | 试题列表 |

##### questionList 数组项

| 参数名 | 类型 | 描述 |
| ------ | ---- | ---- |
| questionId | int64 | 试题ID |
| questionType | int64 | 题型:1-单选/2-多选/3-判断/4-填空/5-简答/6-论述 |
| title | string | 题目标题 |
| stem | string | 题目题干 |
| options | string | 选项(JSON格式，如{"A":"选项1","B":"选项2"}) |
| points | int64 | 题目分值 |
| sortOrder | int64 | 题目排序 |
| isCorrect | int64 | 是否正确 0:不正确 1:正确（完成的状态时，前端展示） |
| userAnswer | string | 用户答案（完成的状态时，前端展示） |
| analysis | string | 解析（完成的状态时，前端展示） |
| correctAnswer | string | 正确答案（完成的状态时，前端展示） |

### 2. 获取作业信息及作业试题信息

#### 接口描述

获取指定作业的详细信息及其包含的试题信息。

#### 请求方式

- 请求方法: GET
- 请求路径: `/homework/detail`

#### 请求参数

| 参数名 | 类型 | 必填 | 描述 |
| ------ | ---- | ---- | ---- |
| homeworkId | int64 | 是 | 作业ID |

#### 响应参数

| 参数名 | 类型 | 描述 |
| ------ | ---- | ---- |
| homeworkId | int64 | 作业ID |
| courseId | int64 | 课程ID |
| courseName | string | 课程名称 |
| chapterId | int64 | 章节ID |
| chapterName | string | 章节名称 |
| hourId | int64 | 课时ID |
| hourName | string | 课时名称 |
| title | string | 作业标题 |
| description | string | 作业描述 |
| questionNum | int64 | 试题数 |
| totalPoints | int64 | 作业总分 |
| dueDate | string | 截止日期 |
| finished | int64 | 是否完成 0:未完成 1:完成 |
| score | int64 | 作业的得分（如果已完成） |
| questionList | array | 试题列表 |

##### questionList 数组项

同上方试卷接口中的 questionList 数组项。

### 3. 提交试卷答案

#### 接口描述

提交用户完成的试卷答案。

#### 请求方式

- 请求方法: POST
- 请求路径: `/exam/submit`

#### 请求参数

| 参数名 | 类型 | 必填 | 描述 |
| ------ | ---- | ---- | ---- |
| examId | int64 | 是 | 考试ID |
| answers | array | 是 | 答案列表 |

##### answers 数组项

| 参数名 | 类型 | 必填 | 描述 |
| ------ | ---- | ---- | ---- |
| questionId | int64 | 是 | 试题ID |
| answer | string | 是 | 答案内容 |

#### 响应参数

| 参数名 | 类型 | 描述 |
| ------ | ---- | ---- |
| score | int64 | 得分 |
| totalPoints | int64 | 总分 |
| correctCount | int64 | 正确题目数 |
| totalCount | int64 | 总题目数 |

### 4. 提交作业答案

#### 接口描述

提交用户完成的作业答案。

#### 请求方式

- 请求方法: POST
- 请求路径: `/homework/submit`

#### 请求参数

| 参数名 | 类型 | 必填 | 描述 |
| ------ | ---- | ---- | ---- |
| homeworkId | int64 | 是 | 作业ID |
| answers | array | 是 | 答案列表 |

##### answers 数组项

| 参数名 | 类型 | 必填 | 描述 |
| ------ | ---- | ---- | ---- |
| questionId | int64 | 是 | 试题ID |
| answer | string | 是 | 答案内容 |

#### 响应参数

| 参数名 | 类型 | 描述 |
| ------ | ---- | ---- |
| score | int64 | 得分 |
| totalPoints | int64 | 总分 |
| correctCount | int64 | 正确题目数 |
| totalCount | int64 | 总题目数 |

### 5. 获取用户课程下试卷列表信息

#### 接口描述

获取用户在指定课程下的试卷列表信息。

#### 请求方式

- 请求方法: GET
- 请求路径: `/course/exam/list`

#### 请求参数

| 参数名 | 类型 | 必填 | 描述 |
| ------ | ---- | ---- | ---- |
| courseId | int64 | 是 | 课程ID |

#### 响应参数

| 参数名 | 类型 | 描述 |
| ------ | ---- | ---- |
| list | array | 试卷列表 |

##### list 数组项

| 参数名 | 类型 | 描述 |
| ------ | ---- | ---- |
| examId | int64 | 考试ID |
| title | string | 考试标题 |
| description | string | 考试描述 |
| questionNum | int64 | 试题数 |
| totalPoints | int64 | 考试总分 |
| timeLimit | int64 | 时间限制(分钟) |
| availableFrom | string | 考试开始时间 |
| availableTo | string | 考试结束时间 |
| status | int64 | 状态：1-未开始，2-进行中，3-已完成，4-已过期 |
| score | int64 | 得分（如果已完成） |

### 6. 获取用户课程下作业列表信息

#### 接口描述

获取用户在指定课程下的作业列表信息。

#### 请求方式

- 请求方法: GET
- 请求路径: `/course/homework/list`

#### 请求参数

| 参数名 | 类型 | 必填 | 描述 |
| ------ | ---- | ---- | ---- |
| courseId | int64 | 是 | 课程ID |

#### 响应参数

| 参数名 | 类型 | 描述 |
| ------ | ---- | ---- |
| list | array | 作业列表 |

##### list 数组项

| 参数名 | 类型 | 描述 |
| ------ | ---- | ---- |
| homeworkId | int64 | 作业ID |
| title | string | 作业标题 |
| description | string | 作业描述 |
| questionNum | int64 | 试题数 |
| totalPoints | int64 | 作业总分 |
| dueDate | string | 截止日期 |
| status | int64 | 状态：1-未开始，2-进行中，3-已完成，4-已过期 |
| score | int64 | 得分（如果已完成） |

### 7. 分页获取用户错题列表

#### 接口描述

分页获取用户的错题列表信息。

#### 请求方式

- 请求方法: GET
- 请求路径: `/wrong/question/list`

#### 请求参数

| 参数名 | 类型 | 必填 | 描述 |
| ------ | ---- | ---- | ---- |
| pageNum | int64 | 否 | 页码，默认为1 |
| pageSize | int64 | 否 | 每页数量，默认为10 |
| sourceType | int64 | 否 | 来源类型 1:作业 2:考试 3:自测题，不传则查询所有 |
| courseId | int64 | 否 | 课程ID（可选筛选条件） |

说明：用户ID不需要在参数中传递，接口从JWT中获取当前登录用户ID。

#### 响应参数

| 参数名 | 类型 | 描述 |
| ------ | ---- | ---- |
| list | array | 错题列表 |
| total | int64 | 总数 |

##### list 数组项

| 参数名 | 类型 | 描述 |
| ------ | ---- | ---- |
| id | int64 | 错题ID |
| sourceType | int64 | 来源类型 1:作业 2:考试 3:自测题 |
| sourceId | int64 | 来源ID |
| sourceName | string | 来源名称 |
| questionId | int64 | 题目ID |
| questionType | int64 | 题型:1-单选/2-多选/3-判断/4-填空/5-简答/6-论述 |
| title | string | 题目标题 |
| stem | string | 题目题干 |
| options | string | 选项(JSON格式，如{"A":"选项1","B":"选项2"}) |
| analysis | string | 解析 |
| answer | string | 正确答案 |
| userAnswer | string | 用户答案 |
| wrongNum | int64 | 错误次数 |
| lastWrongTime | string | 最近错误时间，格式：yyyy-MM-dd HH:mm:ss |