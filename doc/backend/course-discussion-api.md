---
title: 默认模块
language_tabs:
  - shell: Shell
  - http: HTTP
  - javascript: JavaScript
  - ruby: Ruby
  - python: Python
  - php: PHP
  - java: Java
  - go: Go
toc_footers: []
includes: []
search: true
code_clipboard: true
highlight_theme: darkula
headingLevel: 2
generator: "@tarslib/widdershins v4.0.30"


---

# 默认模块

AI教学服务平台接口文档整合。
包含了通用接口、前端（学生端）接口和后端（管理/教师端）接口。

主要模块：

- 用户中心
- 课程管理
- 作业与考试
- AI 互动
- 统计分析
- 教案管理

Base URLs:

# Authentication

- HTTP Authentication, scheme: bearer

# 课程讨论/讨论帖子

<a id="opIdcreateDiscussion"></a>

## POST 发布讨论

POST /edu/frontend/v1/courses/{courseId}/discussions

在指定课程下发布新的讨论帖子

> Body 请求参数

```json
{
  "title": "关于第三章的疑问",
  "content": "## 问题\n这里有个地方不太理解...",
  "tags": [
    "提问",
    "第三章"
  ]
}
```

### 请求参数

| 名称     | 位置 | 类型                                          | 必选 | 说明   |
| -------- | ---- | --------------------------------------------- | ---- | ------ |
| courseId | path | string                                        | 是   | 课程ID |
| body     | body | [CreatePostRequest](#schemacreatepostrequest) | 是   | none   |

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "postId": 1001,
    "status": "auto_approved"
  }
}
```

### 返回结果

| 状态码 | 状态码含义                                              | 说明     | 数据模型 |
| ------ | ------------------------------------------------------- | -------- | -------- |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1) | 发布成功 | Inline   |

### 返回数据结构

#### 枚举值

| 属性   | 值            |
| ------ | ------------- |
| status | pending       |
| status | auto_approved |

<a id="opIdgetDiscussionList"></a>

## GET 获取讨论列表

GET /edu/frontend/v1/courses/{courseId}/discussions

获取指定课程的讨论列表，支持分页和排序

### 请求参数

| 名称     | 位置  | 类型           | 必选 | 说明               |
| -------- | ----- | -------------- | ---- | ------------------ |
| courseId | path  | string         | 是   | 课程ID             |
| pageNum  | query | integer(int64) | 是   | 页码               |
| pageSize | query | integer(int64) | 否   | 每页数量（默认20） |
| sortBy   | query | string         | 否   | 排序方式           |
| tag      | query | string         | 否   | 标签筛选           |

#### 枚举值

| 属性   | 值           |
| ------ | ------------ |
| sortBy | latest       |
| sortBy | hot          |
| sortBy | most_replies |

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "total": 0,
    "list": [
      {
        "postId": 0,
        "title": "string",
        "content": "string",
        "authorId": 0,
        "authorName": "string",
        "authorAvatar": "string",
        "tags": [
          null
        ],
        "likeCount": 0,
        "replyCount": 0,
        "viewCount": 0,
        "isPinned": true,
        "isLiked": true,
        "createTime": "2019-08-24T14:15:22Z"
      }
    ]
  }
}
```

### 返回结果

| 状态码 | 状态码含义                                              | 说明     | 数据模型 |
| ------ | ------------------------------------------------------- | -------- | -------- |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1) | 获取成功 | Inline   |

### 返回数据结构

<a id="opIdgetDiscussionDetail"></a>

## GET 获取讨论详情

GET /edu/frontend/v1/discussions/{postId}

获取指定讨论帖子的详细信息

### 请求参数

| 名称   | 位置 | 类型           | 必选 | 说明   |
| ------ | ---- | -------------- | ---- | ------ |
| postId | path | integer(int64) | 是   | 帖子ID |

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "postId": 0,
    "courseId": "string",
    "courseName": "string",
    "title": "string",
    "content": "string",
    "contentHtml": "string",
    "authorId": 0,
    "authorName": "string",
    "authorAvatar": "string",
    "tags": [
      "string"
    ],
    "likeCount": 0,
    "replyCount": 0,
    "viewCount": 0,
    "isPinned": true,
    "isLiked": true,
    "isOwner": true,
    "createTime": "2019-08-24T14:15:22Z",
    "editedAt": "2019-08-24T14:15:22Z"
  }
}
```

### 返回结果

| 状态码 | 状态码含义                                              | 说明     | 数据模型 |
| ------ | ------------------------------------------------------- | -------- | -------- |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1) | 获取成功 | Inline   |

### 返回数据结构

<a id="opIdupdateDiscussion"></a>

## PUT 编辑讨论

PUT /edu/frontend/v1/discussions/{postId}

编辑自己发布的讨论帖子

> Body 请求参数

```json
{
  "title": "string",
  "content": "string",
  "tags": [
    "string"
  ]
}
```

### 请求参数

| 名称   | 位置 | 类型                                          | 必选 | 说明   |
| ------ | ---- | --------------------------------------------- | ---- | ------ |
| postId | path | integer(int64)                                | 是   | 帖子ID |
| body   | body | [UpdatePostRequest](#schemaupdatepostrequest) | 是   | none   |

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "msg": "success",
  "data": {}
}
```

### 返回结果

| 状态码 | 状态码含义                                              | 说明     | 数据模型                                |
| ------ | ------------------------------------------------------- | -------- | --------------------------------------- |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1) | 编辑成功 | [CommonResponse](#schemacommonresponse) |

<a id="opIddeleteDiscussion"></a>

## DELETE 删除讨论

DELETE /edu/frontend/v1/discussions/{postId}

删除自己发布的讨论帖子

### 请求参数

| 名称   | 位置 | 类型           | 必选 | 说明   |
| ------ | ---- | -------------- | ---- | ------ |
| postId | path | integer(int64) | 是   | 帖子ID |

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "msg": "success",
  "data": {}
}
```

### 返回结果

| 状态码 | 状态码含义                                              | 说明     | 数据模型                                |
| ------ | ------------------------------------------------------- | -------- | --------------------------------------- |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1) | 删除成功 | [CommonResponse](#schemacommonresponse) |

# 课程讨论/回复

<a id="opIdcreateReply"></a>

## POST 发布回复

POST /edu/frontend/v1/discussions/{postId}/replies

在指定讨论帖子下发布回复

> Body 请求参数

```json
{
  "content": "这个问题可以这样理解...",
  "parentReplyId": 0,
  "replyToUserId": 0
}
```

### 请求参数

| 名称   | 位置 | 类型                                            | 必选 | 说明   |
| ------ | ---- | ----------------------------------------------- | ---- | ------ |
| postId | path | integer(int64)                                  | 是   | 帖子ID |
| body   | body | [CreateReplyRequest](#schemacreatereplyrequest) | 是   | none   |

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "replyId": 0,
    "status": "pending"
  }
}
```

### 返回结果

| 状态码 | 状态码含义                                              | 说明     | 数据模型 |
| ------ | ------------------------------------------------------- | -------- | -------- |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1) | 发布成功 | Inline   |

### 返回数据结构

#### 枚举值

| 属性   | 值            |
| ------ | ------------- |
| status | pending       |
| status | auto_approved |

<a id="opIdgetReplyList"></a>

## GET 获取回复列表

GET /edu/frontend/v1/discussions/{postId}/replies

获取指定讨论帖子的回复列表

### 请求参数

| 名称     | 位置  | 类型           | 必选 | 说明               |
| -------- | ----- | -------------- | ---- | ------------------ |
| postId   | path  | integer(int64) | 是   | 帖子ID             |
| pageNum  | query | integer(int64) | 是   | 页码               |
| pageSize | query | integer(int64) | 否   | 每页数量（默认20） |

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "total": 0,
    "list": [
      {
        "replyId": 0,
        "content": "string",
        "contentHtml": "string",
        "authorId": 0,
        "authorName": "string",
        "authorAvatar": "string",
        "parentReplyId": 0,
        "replyToUserId": 0,
        "replyToUserName": "string",
        "likeCount": 0,
        "isLiked": true,
        "isOwner": true,
        "createTime": "2019-08-24T14:15:22Z"
      }
    ]
  }
}
```

### 返回结果

| 状态码 | 状态码含义                                              | 说明     | 数据模型 |
| ------ | ------------------------------------------------------- | -------- | -------- |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1) | 获取成功 | Inline   |

### 返回数据结构

<a id="opIdupdateReply"></a>

## PUT 编辑回复

PUT /edu/frontend/v1/discussions/replies/{replyId}

编辑自己发布的回复

> Body 请求参数

```json
{
  "content": "string"
}
```

### 请求参数

| 名称    | 位置 | 类型                                            | 必选 | 说明   |
| ------- | ---- | ----------------------------------------------- | ---- | ------ |
| replyId | path | integer(int64)                                  | 是   | 回复ID |
| body    | body | [UpdateReplyRequest](#schemaupdatereplyrequest) | 是   | none   |

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "msg": "success",
  "data": {}
}
```

### 返回结果

| 状态码 | 状态码含义                                              | 说明     | 数据模型                                |
| ------ | ------------------------------------------------------- | -------- | --------------------------------------- |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1) | 编辑成功 | [CommonResponse](#schemacommonresponse) |

<a id="opIddeleteReply"></a>

## DELETE 删除回复

DELETE /edu/frontend/v1/discussions/replies/{replyId}

删除自己发布的回复

### 请求参数

| 名称    | 位置 | 类型           | 必选 | 说明   |
| ------- | ---- | -------------- | ---- | ------ |
| replyId | path | integer(int64) | 是   | 回复ID |

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "msg": "success",
  "data": {}
}
```

### 返回结果

| 状态码 | 状态码含义                                              | 说明     | 数据模型                                |
| ------ | ------------------------------------------------------- | -------- | --------------------------------------- |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1) | 删除成功 | [CommonResponse](#schemacommonresponse) |

# 课程讨论/互动

<a id="opIdlikePost"></a>

## POST 点赞帖子

POST /edu/frontend/v1/discussions/{postId}/like

对指定帖子进行点赞

### 请求参数

| 名称   | 位置 | 类型           | 必选 | 说明   |
| ------ | ---- | -------------- | ---- | ------ |
| postId | path | integer(int64) | 是   | 帖子ID |

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "msg": "success",
  "data": {}
}
```

### 返回结果

| 状态码 | 状态码含义                                              | 说明     | 数据模型                                |
| ------ | ------------------------------------------------------- | -------- | --------------------------------------- |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1) | 点赞成功 | [CommonResponse](#schemacommonresponse) |

<a id="opIdunlikePost"></a>

## DELETE 取消点赞帖子

DELETE /edu/frontend/v1/discussions/{postId}/like

取消对指定帖子的点赞

### 请求参数

| 名称   | 位置 | 类型           | 必选 | 说明   |
| ------ | ---- | -------------- | ---- | ------ |
| postId | path | integer(int64) | 是   | 帖子ID |

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "msg": "success",
  "data": {}
}
```

### 返回结果

| 状态码 | 状态码含义                                              | 说明     | 数据模型                                |
| ------ | ------------------------------------------------------- | -------- | --------------------------------------- |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1) | 取消成功 | [CommonResponse](#schemacommonresponse) |

<a id="opIdlikeReply"></a>

## POST 点赞回复

POST /edu/frontend/v1/discussions/replies/{replyId}/like

对指定回复进行点赞

### 请求参数

| 名称    | 位置 | 类型           | 必选 | 说明   |
| ------- | ---- | -------------- | ---- | ------ |
| replyId | path | integer(int64) | 是   | 回复ID |

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "msg": "success",
  "data": {}
}
```

### 返回结果

| 状态码 | 状态码含义                                              | 说明     | 数据模型                                |
| ------ | ------------------------------------------------------- | -------- | --------------------------------------- |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1) | 点赞成功 | [CommonResponse](#schemacommonresponse) |

<a id="opIdunlikeReply"></a>

## DELETE 取消点赞回复

DELETE /edu/frontend/v1/discussions/replies/{replyId}/like

取消对指定回复的点赞

### 请求参数

| 名称    | 位置 | 类型           | 必选 | 说明   |
| ------- | ---- | -------------- | ---- | ------ |
| replyId | path | integer(int64) | 是   | 回复ID |

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "msg": "success",
  "data": {}
}
```

### 返回结果

| 状态码 | 状态码含义                                              | 说明     | 数据模型                                |
| ------ | ------------------------------------------------------- | -------- | --------------------------------------- |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1) | 取消成功 | [CommonResponse](#schemacommonresponse) |

<a id="opIdreportPost"></a>

## POST 举报帖子

POST /edu/frontend/v1/discussions/{postId}/report

举报违规帖子

> Body 请求参数

```json
{
  "reason": "inappropriate",
  "description": "包含不当言论"
}
```

### 请求参数

| 名称   | 位置 | 类型                                  | 必选 | 说明   |
| ------ | ---- | ------------------------------------- | ---- | ------ |
| postId | path | integer(int64)                        | 是   | 帖子ID |
| body   | body | [ReportRequest](#schemareportrequest) | 是   | none   |

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "msg": "success",
  "data": {}
}
```

### 返回结果

| 状态码 | 状态码含义                                              | 说明     | 数据模型                                |
| ------ | ------------------------------------------------------- | -------- | --------------------------------------- |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1) | 举报成功 | [CommonResponse](#schemacommonresponse) |

<a id="opIdreportReply"></a>

## POST 举报回复

POST /edu/frontend/v1/discussions/replies/{replyId}/report

举报违规回复

> Body 请求参数

```json
{
  "reason": "inappropriate",
  "description": "包含不当言论"
}
```

### 请求参数

| 名称    | 位置 | 类型                                  | 必选 | 说明   |
| ------- | ---- | ------------------------------------- | ---- | ------ |
| replyId | path | integer(int64)                        | 是   | 回复ID |
| body    | body | [ReportRequest](#schemareportrequest) | 是   | none   |

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "msg": "success",
  "data": {}
}
```

### 返回结果

| 状态码 | 状态码含义                                              | 说明     | 数据模型                                |
| ------ | ------------------------------------------------------- | -------- | --------------------------------------- |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1) | 举报成功 | [CommonResponse](#schemacommonresponse) |

# 课程讨论/审核

<a id="opIdgetPendingList"></a>

## GET 获取待审核列表

GET /edu/backend/v1/discussions/pending

获取待审核的帖子和回复列表

### 请求参数

| 名称     | 位置  | 类型           | 必选 | 说明               |
| -------- | ----- | -------------- | ---- | ------------------ |
| courseId | query | string         | 否   | 课程ID筛选         |
| type     | query | string         | 否   | 类型筛选           |
| pageNum  | query | integer(int64) | 是   | 页码               |
| pageSize | query | integer(int64) | 否   | 每页数量（默认20） |

#### 枚举值

| 属性 | 值    |
| ---- | ----- |
| type | all   |
| type | post  |
| type | reply |

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "total": 0,
    "list": [
      {
        "id": 0,
        "type": "[",
        "courseId": "string",
        "courseName": "string",
        "postId": 0,
        "postTitle": "string",
        "content": "string",
        "authorId": 0,
        "authorName": "string",
        "createTime": "2019-08-24T14:15:22Z"
      }
    ]
  }
}
```

### 返回结果

| 状态码 | 状态码含义                                              | 说明     | 数据模型 |
| ------ | ------------------------------------------------------- | -------- | -------- |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1) | 获取成功 | Inline   |

### 返回数据结构

#### 枚举值

| 属性 | 值    |
| ---- | ----- |
| type | post  |
| type | reply |

<a id="opIdreviewPost"></a>

## POST 审核帖子

POST /edu/backend/v1/discussions/{postId}/review

审核通过或拒绝帖子

> Body 请求参数

```json
{
  "action": "approve",
  "reason": "string"
}
```

### 请求参数

| 名称   | 位置 | 类型                                  | 必选 | 说明   |
| ------ | ---- | ------------------------------------- | ---- | ------ |
| postId | path | integer(int64)                        | 是   | 帖子ID |
| body   | body | [ReviewRequest](#schemareviewrequest) | 是   | none   |

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "msg": "success",
  "data": {}
}
```

### 返回结果

| 状态码 | 状态码含义                                              | 说明     | 数据模型                                |
| ------ | ------------------------------------------------------- | -------- | --------------------------------------- |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1) | 审核成功 | [CommonResponse](#schemacommonresponse) |

<a id="opIdreviewReply"></a>

## POST 审核回复

POST /edu/backend/v1/discussions/replies/{replyId}/review

审核通过或拒绝回复

> Body 请求参数

```json
{
  "action": "approve",
  "reason": "string"
}
```

### 请求参数

| 名称    | 位置 | 类型                                  | 必选 | 说明   |
| ------- | ---- | ------------------------------------- | ---- | ------ |
| replyId | path | integer(int64)                        | 是   | 回复ID |
| body    | body | [ReviewRequest](#schemareviewrequest) | 是   | none   |

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "msg": "success",
  "data": {}
}
```

### 返回结果

| 状态码 | 状态码含义                                              | 说明     | 数据模型                                |
| ------ | ------------------------------------------------------- | -------- | --------------------------------------- |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1) | 审核成功 | [CommonResponse](#schemacommonresponse) |

# 课程讨论/内容管理

<a id="opIdpinPost"></a>

## POST 置顶帖子

POST /edu/backend/v1/discussions/{postId}/pin

将指定帖子设为置顶

### 请求参数

| 名称   | 位置 | 类型           | 必选 | 说明   |
| ------ | ---- | -------------- | ---- | ------ |
| postId | path | integer(int64) | 是   | 帖子ID |

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "msg": "success",
  "data": {}
}
```

### 返回结果

| 状态码 | 状态码含义                                              | 说明     | 数据模型                                |
| ------ | ------------------------------------------------------- | -------- | --------------------------------------- |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1) | 置顶成功 | [CommonResponse](#schemacommonresponse) |

<a id="opIdunpinPost"></a>

## DELETE 取消置顶

DELETE /edu/backend/v1/discussions/{postId}/pin

取消帖子的置顶状态

### 请求参数

| 名称   | 位置 | 类型           | 必选 | 说明   |
| ------ | ---- | -------------- | ---- | ------ |
| postId | path | integer(int64) | 是   | 帖子ID |

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "msg": "success",
  "data": {}
}
```

### 返回结果

| 状态码 | 状态码含义                                              | 说明     | 数据模型                                |
| ------ | ------------------------------------------------------- | -------- | --------------------------------------- |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1) | 取消成功 | [CommonResponse](#schemacommonresponse) |

<a id="opIdforceDeletePost"></a>

## DELETE 强制删除帖子

DELETE /edu/backend/v1/discussions/{postId}/force

管理员强制删除帖子（会记录审计日志）

> Body 请求参数

```json
{
  "reason": "string"
}
```

### 请求参数

| 名称   | 位置 | 类型                                            | 必选 | 说明   |
| ------ | ---- | ----------------------------------------------- | ---- | ------ |
| postId | path | integer(int64)                                  | 是   | 帖子ID |
| body   | body | [ForceDeleteRequest](#schemaforcedeleterequest) | 否   | none   |

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "msg": "success",
  "data": {}
}
```

### 返回结果

| 状态码 | 状态码含义                                              | 说明     | 数据模型                                |
| ------ | ------------------------------------------------------- | -------- | --------------------------------------- |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1) | 删除成功 | [CommonResponse](#schemacommonresponse) |

<a id="opIdforceDeleteReply"></a>

## DELETE 强制删除回复

DELETE /edu/backend/v1/discussions/replies/{replyId}/force

管理员强制删除回复（会记录审计日志）

> Body 请求参数

```json
{
  "reason": "string"
}
```

### 请求参数

| 名称    | 位置 | 类型                                            | 必选 | 说明   |
| ------- | ---- | ----------------------------------------------- | ---- | ------ |
| replyId | path | integer(int64)                                  | 是   | 回复ID |
| body    | body | [ForceDeleteRequest](#schemaforcedeleterequest) | 否   | none   |

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "msg": "success",
  "data": {}
}
```

### 返回结果

| 状态码 | 状态码含义                                              | 说明     | 数据模型                                |
| ------ | ------------------------------------------------------- | -------- | --------------------------------------- |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1) | 删除成功 | [CommonResponse](#schemacommonresponse) |

# 课程讨论/举报处理

<a id="opIdgetReportList"></a>

## GET 获取举报列表

GET /edu/backend/v1/discussions/reports

获取举报记录列表

### 请求参数

| 名称     | 位置  | 类型           | 必选 | 说明               |
| -------- | ----- | -------------- | ---- | ------------------ |
| status   | query | string         | 否   | 状态筛选           |
| pageNum  | query | integer(int64) | 是   | 页码               |
| pageSize | query | integer(int64) | 否   | 每页数量（默认20） |

#### 枚举值

| 属性   | 值       |
| ------ | -------- |
| status | pending  |
| status | accepted |
| status | rejected |

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "total": 0,
    "list": [
      {
        "reportId": 0,
        "targetType": "[",
        "targetId": 0,
        "targetContent": "string",
        "reporterId": 0,
        "reporterName": "string",
        "reason": "string",
        "description": "string",
        "status": "[",
        "createTime": "2019-08-24T14:15:22Z"
      }
    ]
  }
}
```

### 返回结果

| 状态码 | 状态码含义                                              | 说明     | 数据模型 |
| ------ | ------------------------------------------------------- | -------- | -------- |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1) | 获取成功 | Inline   |

### 返回数据结构

#### 枚举值

| 属性       | 值       |
| ---------- | -------- |
| targetType | post     |
| targetType | reply    |
| status     | pending  |
| status     | accepted |
| status     | rejected |

<a id="opIdhandleReport"></a>

## POST 处理举报

POST /edu/backend/v1/discussions/reports/{reportId}/handle

处理举报（接受或拒绝）

> Body 请求参数

```json
{
  "action": "accept",
  "note": "string"
}
```

### 请求参数

| 名称     | 位置 | 类型                                              | 必选 | 说明   |
| -------- | ---- | ------------------------------------------------- | ---- | ------ |
| reportId | path | integer(int64)                                    | 是   | 举报ID |
| body     | body | [HandleReportRequest](#schemahandlereportrequest) | 是   | none   |

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "msg": "success",
  "data": {}
}
```

### 返回结果

| 状态码 | 状态码含义                                              | 说明     | 数据模型                                |
| ------ | ------------------------------------------------------- | -------- | --------------------------------------- |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1) | 处理成功 | [CommonResponse](#schemacommonresponse) |

# 课程讨论/统计与日志

<a id="opIdgetStatistics"></a>

## GET 获取讨论统计数据

GET /edu/backend/v1/discussions/statistics

获取讨论区的统计数据

### 请求参数

| 名称     | 位置  | 类型   | 必选 | 说明       |
| -------- | ----- | ------ | ---- | ---------- |
| courseId | query | string | 否   | 课程ID筛选 |

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "totalPosts": 0,
    "totalReplies": 0,
    "totalLikes": 0,
    "pendingPosts": 0,
    "pendingReplies": 0,
    "pendingReports": 0,
    "activeUsers": 0,
    "todayPosts": 0,
    "todayReplies": 0
  }
}
```

### 返回结果

| 状态码 | 状态码含义                                              | 说明     | 数据模型 |
| ------ | ------------------------------------------------------- | -------- | -------- |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1) | 获取成功 | Inline   |

### 返回数据结构

<a id="opIdgetAuditLogs"></a>

## GET 获取审计日志

GET /edu/backend/v1/discussions/audit-logs

获取讨论区操作的审计日志

### 请求参数

| 名称       | 位置  | 类型              | 必选 | 说明               |
| ---------- | ----- | ----------------- | ---- | ------------------ |
| targetType | query | string            | 否   | 目标类型筛选       |
| action     | query | string            | 否   | 操作类型筛选       |
| operatorId | query | integer(int64)    | 否   | 操作人ID筛选       |
| startTime  | query | string(date-time) | 否   | 开始时间           |
| endTime    | query | string(date-time) | 否   | 结束时间           |
| pageNum    | query | integer(int64)    | 是   | 页码               |
| pageSize   | query | integer(int64)    | 否   | 每页数量（默认20） |

#### 枚举值

| 属性       | 值    |
| ---------- | ----- |
| targetType | post  |
| targetType | reply |

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "total": 0,
    "list": [
      {
        "id": 0,
        "targetType": "[",
        "targetId": 0,
        "action": "string",
        "operatorId": 0,
        "operatorName": "string",
        "operatorRole": "string",
        "reason": "string",
        "previousStatus": "string",
        "newStatus": "string",
        "createTime": "2019-08-24T14:15:22Z"
      }
    ]
  }
}
```

### 返回结果

| 状态码 | 状态码含义                                              | 说明     | 数据模型 |
| ------ | ------------------------------------------------------- | -------- | -------- |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1) | 获取成功 | Inline   |

### 返回数据结构

#### 枚举值

| 属性       | 值    |
| ---------- | ----- |
| targetType | post  |
| targetType | reply |

# 课程讨论/敏感词管理

<a id="opIdgetSensitiveWordList"></a>

## GET 获取敏感词列表

GET /edu/backend/v1/admin/sensitive-words

获取敏感词列表（仅管理员）

### 请求参数

| 名称      | 位置  | 类型           | 必选 | 说明                       |
| --------- | ----- | -------------- | ---- | -------------------------- |
| category  | query | string         | 否   | 分类筛选                   |
| level     | query | integer        | 否   | 等级筛选                   |
| isEnabled | query | integer        | 否   | 是否启用筛选（-1表示全部） |
| keyword   | query | string         | 否   | 关键词搜索                 |
| pageNum   | query | integer(int64) | 是   | 页码                       |
| pageSize  | query | integer(int64) | 否   | 每页数量（默认20）         |

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "total": 0,
    "list": [
      {
        "id": 0,
        "word": "string",
        "category": "string",
        "level": 0,
        "replacement": "string",
        "isEnabled": true,
        "hitCount": 0,
        "createTime": "2019-08-24T14:15:22Z",
        "updateTime": "2019-08-24T14:15:22Z"
      }
    ]
  }
}
```

### 返回结果

| 状态码 | 状态码含义                                              | 说明     | 数据模型 |
| ------ | ------------------------------------------------------- | -------- | -------- |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1) | 获取成功 | Inline   |

### 返回数据结构

<a id="opIdcreateSensitiveWord"></a>

## POST 添加敏感词

POST /edu/backend/v1/admin/sensitive-words

添加新的敏感词（仅管理员）

> Body 请求参数

```json
{
  "word": "string",
  "category": "string",
  "level": 0,
  "replacement": "string"
}
```

### 请求参数

| 名称 | 位置 | 类型                                                         | 必选 | 说明 |
| ---- | ---- | ------------------------------------------------------------ | ---- | ---- |
| body | body | [CreateSensitiveWordRequest](#schemacreatesensitivewordrequest) | 是   | none |

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "id": 0
  }
}
```

### 返回结果

| 状态码 | 状态码含义                                              | 说明     | 数据模型 |
| ------ | ------------------------------------------------------- | -------- | -------- |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1) | 添加成功 | Inline   |

### 返回数据结构

<a id="opIdupdateSensitiveWord"></a>

## PUT 编辑敏感词

PUT /edu/backend/v1/admin/sensitive-words/{wordId}

编辑敏感词信息（仅管理员）

> Body 请求参数

```json
{
  "word": "string",
  "category": "string",
  "level": 0,
  "replacement": "string",
  "isEnabled": 0
}
```

### 请求参数

| 名称   | 位置 | 类型                                                         | 必选 | 说明     |
| ------ | ---- | ------------------------------------------------------------ | ---- | -------- |
| wordId | path | integer(int64)                                               | 是   | 敏感词ID |
| body   | body | [UpdateSensitiveWordRequest](#schemaupdatesensitivewordrequest) | 是   | none     |

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "msg": "success",
  "data": {}
}
```

### 返回结果

| 状态码 | 状态码含义                                              | 说明     | 数据模型                                |
| ------ | ------------------------------------------------------- | -------- | --------------------------------------- |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1) | 编辑成功 | [CommonResponse](#schemacommonresponse) |

<a id="opIddeleteSensitiveWord"></a>

## DELETE 删除敏感词

DELETE /edu/backend/v1/admin/sensitive-words/{wordId}

删除敏感词（仅管理员）

### 请求参数

| 名称   | 位置 | 类型           | 必选 | 说明     |
| ------ | ---- | -------------- | ---- | -------- |
| wordId | path | integer(int64) | 是   | 敏感词ID |

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "msg": "success",
  "data": {}
}
```

### 返回结果

| 状态码 | 状态码含义                                              | 说明     | 数据模型                                |
| ------ | ------------------------------------------------------- | -------- | --------------------------------------- |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1) | 删除成功 | [CommonResponse](#schemacommonresponse) |

<a id="opIdimportSensitiveWords"></a>

## POST 批量导入敏感词

POST /edu/backend/v1/admin/sensitive-words/import

批量导入敏感词（仅管理员）

> Body 请求参数

```json
{
  "words": [
    {
      "word": "string",
      "category": "string",
      "level": 0,
      "replacement": "string"
    }
  ]
}
```

### 请求参数

| 名称 | 位置 | 类型                                                         | 必选 | 说明 |
| ---- | ---- | ------------------------------------------------------------ | ---- | ---- |
| body | body | [ImportSensitiveWordsRequest](#schemaimportsensitivewordsrequest) | 是   | none |

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "successCount": 0,
    "failCount": 0
  }
}
```

### 返回结果

| 状态码 | 状态码含义                                              | 说明     | 数据模型 |
| ------ | ------------------------------------------------------- | -------- | -------- |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1) | 导入完成 | Inline   |

### 返回数据结构

# 课程讨论/用户信誉

<a id="opIdgetUserReputation"></a>

## GET 获取用户信誉分

GET /edu/backend/v1/admin/users/{userId}/reputation

获取指定用户的信誉分详情（仅管理员）

### 请求参数

| 名称   | 位置 | 类型           | 必选 | 说明   |
| ------ | ---- | -------------- | ---- | ------ |
| userId | path | integer(int64) | 是   | 用户ID |

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "userId": 0,
    "nickname": "string",
    "reputationScore": 0,
    "postCount": 0,
    "replyCount": 0,
    "likeReceived": 0,
    "reportReceived": 0
  }
}
```

### 返回结果

| 状态码 | 状态码含义                                              | 说明     | 数据模型 |
| ------ | ------------------------------------------------------- | -------- | -------- |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1) | 获取成功 | Inline   |

### 返回数据结构

<a id="opIdupdateUserReputation"></a>

## PUT 修改用户信誉分

PUT /edu/backend/v1/admin/users/{userId}/reputation

修改指定用户的信誉分（仅管理员）

> Body 请求参数

```json
{
  "reputationScore": 100,
  "reason": "string"
}
```

### 请求参数

| 名称   | 位置 | 类型                                                      | 必选 | 说明   |
| ------ | ---- | --------------------------------------------------------- | ---- | ------ |
| userId | path | integer(int64)                                            | 是   | 用户ID |
| body   | body | [UpdateReputationRequest](#schemaupdatereputationrequest) | 是   | none   |

> 返回示例

> 200 Response

```json
{
  "code": 0,
  "msg": "success",
  "data": {}
}
```

### 返回结果

| 状态码 | 状态码含义                                              | 说明     | 数据模型                                |
| ------ | ------------------------------------------------------- | -------- | --------------------------------------- |
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1) | 修改成功 | [CommonResponse](#schemacommonresponse) |

# 数据模型

<h2 id="tocS_CommonResponse">CommonResponse</h2>

<a id="schemacommonresponse"></a>
<a id="schema_CommonResponse"></a>
<a id="tocScommonresponse"></a>
<a id="tocscommonresponse"></a>

```json
{
  "code": 0,
  "msg": "success",
  "data": {}
}

```

### 属性

| 名称 | 类型    | 必选  | 约束 | 中文名 | 说明               |
| ---- | ------- | ----- | ---- | ------ | ------------------ |
| code | integer | false | none |        | 响应码，0 表示成功 |
| msg  | string  | false | none |        | 响应消息           |
| data | object  | false | none |        | 响应数据           |

<h2 id="tocS_CreatePostRequest">CreatePostRequest</h2>

<a id="schemacreatepostrequest"></a>
<a id="schema_CreatePostRequest"></a>
<a id="tocScreatepostrequest"></a>
<a id="tocscreatepostrequest"></a>

```json
{
  "title": "关于第三章的疑问",
  "content": "## 问题\n这里有个地方不太理解...",
  "tags": [
    "提问",
    "第三章"
  ]
}

```

### 属性

| 名称    | 类型     | 必选  | 约束 | 中文名 | 说明                 |
| ------- | -------- | ----- | ---- | ------ | -------------------- |
| title   | string   | false | none |        | 标题（可选）         |
| content | string   | true  | none |        | 内容（Markdown格式） |
| tags    | [string] | false | none |        | 标签列表（可选）     |

<h2 id="tocS_CreatePostResponse">CreatePostResponse</h2>

<a id="schemacreatepostresponse"></a>
<a id="schema_CreatePostResponse"></a>
<a id="tocScreatepostresponse"></a>
<a id="tocscreatepostresponse"></a>

```json
{
  "postId": 1001,
  "status": "auto_approved"
}

```

### 属性

| 名称   | 类型           | 必选  | 约束 | 中文名 | 说明     |
| ------ | -------------- | ----- | ---- | ------ | -------- |
| postId | integer(int64) | false | none |        | 帖子ID   |
| status | string         | false | none |        | 审核状态 |

#### 枚举值

| 属性   | 值            |
| ------ | ------------- |
| status | pending       |
| status | auto_approved |

<h2 id="tocS_PostListItem">PostListItem</h2>

<a id="schemapostlistitem"></a>
<a id="schema_PostListItem"></a>
<a id="tocSpostlistitem"></a>
<a id="tocspostlistitem"></a>

```json
{
  "postId": 0,
  "title": "string",
  "content": "string",
  "authorId": 0,
  "authorName": "string",
  "authorAvatar": "string",
  "tags": [
    "string"
  ],
  "likeCount": 0,
  "replyCount": 0,
  "viewCount": 0,
  "isPinned": true,
  "isLiked": true,
  "createTime": "2019-08-24T14:15:22Z"
}

```

### 属性

| 名称         | 类型              | 必选  | 约束 | 中文名 | 说明               |
| ------------ | ----------------- | ----- | ---- | ------ | ------------------ |
| postId       | integer(int64)    | false | none |        | 帖子ID             |
| title        | string            | false | none |        | 标题               |
| content      | string            | false | none |        | 内容摘要           |
| authorId     | integer(int64)    | false | none |        | 作者ID             |
| authorName   | string            | false | none |        | 作者昵称           |
| authorAvatar | string            | false | none |        | 作者头像URL        |
| tags         | [string]          | false | none |        | 标签               |
| likeCount    | integer(int64)    | false | none |        | 点赞数             |
| replyCount   | integer(int64)    | false | none |        | 回复数             |
| viewCount    | integer(int64)    | false | none |        | 浏览数             |
| isPinned     | boolean           | false | none |        | 是否置顶           |
| isLiked      | boolean           | false | none |        | 当前用户是否已点赞 |
| createTime   | string(date-time) | false | none |        | 创建时间           |

<h2 id="tocS_PostListResponse">PostListResponse</h2>

<a id="schemapostlistresponse"></a>
<a id="schema_PostListResponse"></a>
<a id="tocSpostlistresponse"></a>
<a id="tocspostlistresponse"></a>

```json
{
  "total": 0,
  "list": [
    {
      "postId": 0,
      "title": "string",
      "content": "string",
      "authorId": 0,
      "authorName": "string",
      "authorAvatar": "string",
      "tags": [
        "string"
      ],
      "likeCount": 0,
      "replyCount": 0,
      "viewCount": 0,
      "isPinned": true,
      "isLiked": true,
      "createTime": "2019-08-24T14:15:22Z"
    }
  ]
}

```

### 属性

| 名称  | 类型                                  | 必选  | 约束 | 中文名 | 说明 |
| ----- | ------------------------------------- | ----- | ---- | ------ | ---- |
| total | integer(int64)                        | false | none |        | 总数 |
| list  | [[PostListItem](#schemapostlistitem)] | false | none |        | none |

<h2 id="tocS_PostDetailResponse">PostDetailResponse</h2>

<a id="schemapostdetailresponse"></a>
<a id="schema_PostDetailResponse"></a>
<a id="tocSpostdetailresponse"></a>
<a id="tocspostdetailresponse"></a>

```json
{
  "postId": 0,
  "courseId": "string",
  "courseName": "string",
  "title": "string",
  "content": "string",
  "contentHtml": "string",
  "authorId": 0,
  "authorName": "string",
  "authorAvatar": "string",
  "tags": [
    "string"
  ],
  "likeCount": 0,
  "replyCount": 0,
  "viewCount": 0,
  "isPinned": true,
  "isLiked": true,
  "isOwner": true,
  "createTime": "2019-08-24T14:15:22Z",
  "editedAt": "2019-08-24T14:15:22Z"
}

```

### 属性

| 名称         | 类型              | 必选  | 约束 | 中文名 | 说明                 |
| ------------ | ----------------- | ----- | ---- | ------ | -------------------- |
| postId       | integer(int64)    | false | none |        | 帖子ID               |
| courseId     | string            | false | none |        | 课程ID               |
| courseName   | string            | false | none |        | 课程名称             |
| title        | string            | false | none |        | 标题                 |
| content      | string            | false | none |        | 原始内容（Markdown） |
| contentHtml  | string            | false | none |        | 渲染后的HTML         |
| authorId     | integer(int64)    | false | none |        | 作者ID               |
| authorName   | string            | false | none |        | 作者昵称             |
| authorAvatar | string            | false | none |        | 作者头像URL          |
| tags         | [string]          | false | none |        | 标签                 |
| likeCount    | integer(int64)    | false | none |        | 点赞数               |
| replyCount   | integer(int64)    | false | none |        | 回复数               |
| viewCount    | integer(int64)    | false | none |        | 浏览数               |
| isPinned     | boolean           | false | none |        | 是否置顶             |
| isLiked      | boolean           | false | none |        | 当前用户是否已点赞   |
| isOwner      | boolean           | false | none |        | 是否为作者本人       |
| createTime   | string(date-time) | false | none |        | 创建时间             |
| editedAt     | string(date-time) | false | none |        | 最后编辑时间         |

<h2 id="tocS_UpdatePostRequest">UpdatePostRequest</h2>

<a id="schemaupdatepostrequest"></a>
<a id="schema_UpdatePostRequest"></a>
<a id="tocSupdatepostrequest"></a>
<a id="tocsupdatepostrequest"></a>

```json
{
  "title": "string",
  "content": "string",
  "tags": [
    "string"
  ]
}

```

### 属性

| 名称    | 类型     | 必选  | 约束 | 中文名 | 说明         |
| ------- | -------- | ----- | ---- | ------ | ------------ |
| title   | string   | false | none |        | 标题（可选） |
| content | string   | true  | none |        | 内容         |
| tags    | [string] | false | none |        | 标签（可选） |

<h2 id="tocS_CreateReplyRequest">CreateReplyRequest</h2>

<a id="schemacreatereplyrequest"></a>
<a id="schema_CreateReplyRequest"></a>
<a id="tocScreatereplyrequest"></a>
<a id="tocscreatereplyrequest"></a>

```json
{
  "content": "这个问题可以这样理解...",
  "parentReplyId": 0,
  "replyToUserId": 0
}

```

### 属性

| 名称          | 类型           | 必选  | 约束 | 中文名 | 说明                         |
| ------------- | -------------- | ----- | ---- | ------ | ---------------------------- |
| content       | string         | true  | none |        | 内容                         |
| parentReplyId | integer(int64) | false | none |        | 父回复ID（可选，用于楼中楼） |
| replyToUserId | integer(int64) | false | none |        | 回复目标用户ID（可选）       |

<h2 id="tocS_CreateReplyResponse">CreateReplyResponse</h2>

<a id="schemacreatereplyresponse"></a>
<a id="schema_CreateReplyResponse"></a>
<a id="tocScreatereplyresponse"></a>
<a id="tocscreatereplyresponse"></a>

```json
{
  "replyId": 0,
  "status": "pending"
}

```

### 属性

| 名称    | 类型           | 必选  | 约束 | 中文名 | 说明     |
| ------- | -------------- | ----- | ---- | ------ | -------- |
| replyId | integer(int64) | false | none |        | 回复ID   |
| status  | string         | false | none |        | 审核状态 |

#### 枚举值

| 属性   | 值            |
| ------ | ------------- |
| status | pending       |
| status | auto_approved |

<h2 id="tocS_ReplyListItem">ReplyListItem</h2>

<a id="schemareplylistitem"></a>
<a id="schema_ReplyListItem"></a>
<a id="tocSreplylistitem"></a>
<a id="tocsreplylistitem"></a>

```json
{
  "replyId": 0,
  "content": "string",
  "contentHtml": "string",
  "authorId": 0,
  "authorName": "string",
  "authorAvatar": "string",
  "parentReplyId": 0,
  "replyToUserId": 0,
  "replyToUserName": "string",
  "likeCount": 0,
  "isLiked": true,
  "isOwner": true,
  "createTime": "2019-08-24T14:15:22Z"
}

```

### 属性

| 名称            | 类型              | 必选  | 约束 | 中文名 | 说明               |
| --------------- | ----------------- | ----- | ---- | ------ | ------------------ |
| replyId         | integer(int64)    | false | none |        | 回复ID             |
| content         | string            | false | none |        | 原始内容           |
| contentHtml     | string            | false | none |        | 渲染后的HTML       |
| authorId        | integer(int64)    | false | none |        | 作者ID             |
| authorName      | string            | false | none |        | 作者昵称           |
| authorAvatar    | string            | false | none |        | 作者头像URL        |
| parentReplyId   | integer(int64)    | false | none |        | 父回复ID           |
| replyToUserId   | integer(int64)    | false | none |        | 回复目标用户ID     |
| replyToUserName | string            | false | none |        | 回复目标用户昵称   |
| likeCount       | integer(int64)    | false | none |        | 点赞数             |
| isLiked         | boolean           | false | none |        | 当前用户是否已点赞 |
| isOwner         | boolean           | false | none |        | 是否为作者本人     |
| createTime      | string(date-time) | false | none |        | 创建时间           |

<h2 id="tocS_ReplyListResponse">ReplyListResponse</h2>

<a id="schemareplylistresponse"></a>
<a id="schema_ReplyListResponse"></a>
<a id="tocSreplylistresponse"></a>
<a id="tocsreplylistresponse"></a>

```json
{
  "total": 0,
  "list": [
    {
      "replyId": 0,
      "content": "string",
      "contentHtml": "string",
      "authorId": 0,
      "authorName": "string",
      "authorAvatar": "string",
      "parentReplyId": 0,
      "replyToUserId": 0,
      "replyToUserName": "string",
      "likeCount": 0,
      "isLiked": true,
      "isOwner": true,
      "createTime": "2019-08-24T14:15:22Z"
    }
  ]
}

```

### 属性

| 名称  | 类型                                    | 必选  | 约束 | 中文名 | 说明 |
| ----- | --------------------------------------- | ----- | ---- | ------ | ---- |
| total | integer(int64)                          | false | none |        | 总数 |
| list  | [[ReplyListItem](#schemareplylistitem)] | false | none |        | none |

<h2 id="tocS_UpdateReplyRequest">UpdateReplyRequest</h2>

<a id="schemaupdatereplyrequest"></a>
<a id="schema_UpdateReplyRequest"></a>
<a id="tocSupdatereplyrequest"></a>
<a id="tocsupdatereplyrequest"></a>

```json
{
  "content": "string"
}

```

### 属性

| 名称    | 类型   | 必选 | 约束 | 中文名 | 说明 |
| ------- | ------ | ---- | ---- | ------ | ---- |
| content | string | true | none |        | 内容 |

<h2 id="tocS_ReportRequest">ReportRequest</h2>

<a id="schemareportrequest"></a>
<a id="schema_ReportRequest"></a>
<a id="tocSreportrequest"></a>
<a id="tocsreportrequest"></a>

```json
{
  "reason": "inappropriate",
  "description": "包含不当言论"
}

```

### 属性

| 名称        | 类型   | 必选  | 约束 | 中文名 | 说明             |
| ----------- | ------ | ----- | ---- | ------ | ---------------- |
| reason      | string | true  | none |        | 举报原因         |
| description | string | false | none |        | 详细说明（可选） |

#### 枚举值

| 属性   | 值            |
| ------ | ------------- |
| reason | spam          |
| reason | abuse         |
| reason | inappropriate |
| reason | other         |

<h2 id="tocS_PendingItem">PendingItem</h2>

<a id="schemapendingitem"></a>
<a id="schema_PendingItem"></a>
<a id="tocSpendingitem"></a>
<a id="tocspendingitem"></a>

```json
{
  "id": 0,
  "type": "post",
  "courseId": "string",
  "courseName": "string",
  "postId": 0,
  "postTitle": "string",
  "content": "string",
  "authorId": 0,
  "authorName": "string",
  "createTime": "2019-08-24T14:15:22Z"
}

```

### 属性

| 名称       | 类型              | 必选  | 约束 | 中文名 | 说明                 |
| ---------- | ----------------- | ----- | ---- | ------ | -------------------- |
| id         | integer(int64)    | false | none |        | ID                   |
| type       | string            | false | none |        | 类型                 |
| courseId   | string            | false | none |        | 课程ID               |
| courseName | string            | false | none |        | 课程名称             |
| postId     | integer(int64)    | false | none |        | 帖子ID（如果是回复） |
| postTitle  | string            | false | none |        | 帖子标题             |
| content    | string            | false | none |        | 内容摘要             |
| authorId   | integer(int64)    | false | none |        | 作者ID               |
| authorName | string            | false | none |        | 作者昵称             |
| createTime | string(date-time) | false | none |        | 创建时间             |

#### 枚举值

| 属性 | 值    |
| ---- | ----- |
| type | post  |
| type | reply |

<h2 id="tocS_PendingListResponse">PendingListResponse</h2>

<a id="schemapendinglistresponse"></a>
<a id="schema_PendingListResponse"></a>
<a id="tocSpendinglistresponse"></a>
<a id="tocspendinglistresponse"></a>

```json
{
  "total": 0,
  "list": [
    {
      "id": 0,
      "type": "post",
      "courseId": "string",
      "courseName": "string",
      "postId": 0,
      "postTitle": "string",
      "content": "string",
      "authorId": 0,
      "authorName": "string",
      "createTime": "2019-08-24T14:15:22Z"
    }
  ]
}

```

### 属性

| 名称  | 类型                                | 必选  | 约束 | 中文名 | 说明 |
| ----- | ----------------------------------- | ----- | ---- | ------ | ---- |
| total | integer(int64)                      | false | none |        | 总数 |
| list  | [[PendingItem](#schemapendingitem)] | false | none |        | none |

<h2 id="tocS_ReviewRequest">ReviewRequest</h2>

<a id="schemareviewrequest"></a>
<a id="schema_ReviewRequest"></a>
<a id="tocSreviewrequest"></a>
<a id="tocsreviewrequest"></a>

```json
{
  "action": "approve",
  "reason": "string"
}

```

### 属性

| 名称   | 类型   | 必选  | 约束 | 中文名 | 说明             |
| ------ | ------ | ----- | ---- | ------ | ---------------- |
| action | string | true  | none |        | 操作             |
| reason | string | false | none |        | 拒绝原因（可选） |

#### 枚举值

| 属性   | 值      |
| ------ | ------- |
| action | approve |
| action | reject  |

<h2 id="tocS_ForceDeleteRequest">ForceDeleteRequest</h2>

<a id="schemaforcedeleterequest"></a>
<a id="schema_ForceDeleteRequest"></a>
<a id="tocSforcedeleterequest"></a>
<a id="tocsforcedeleterequest"></a>

```json
{
  "reason": "string"
}

```

### 属性

| 名称   | 类型   | 必选  | 约束 | 中文名 | 说明             |
| ------ | ------ | ----- | ---- | ------ | ---------------- |
| reason | string | false | none |        | 删除原因（可选） |

<h2 id="tocS_ReportItem">ReportItem</h2>

<a id="schemareportitem"></a>
<a id="schema_ReportItem"></a>
<a id="tocSreportitem"></a>
<a id="tocsreportitem"></a>

```json
{
  "reportId": 0,
  "targetType": "post",
  "targetId": 0,
  "targetContent": "string",
  "reporterId": 0,
  "reporterName": "string",
  "reason": "string",
  "description": "string",
  "status": "pending",
  "createTime": "2019-08-24T14:15:22Z"
}

```

### 属性

| 名称          | 类型              | 必选  | 约束 | 中文名 | 说明         |
| ------------- | ----------------- | ----- | ---- | ------ | ------------ |
| reportId      | integer(int64)    | false | none |        | 举报ID       |
| targetType    | string            | false | none |        | 目标类型     |
| targetId      | integer(int64)    | false | none |        | 目标ID       |
| targetContent | string            | false | none |        | 目标内容摘要 |
| reporterId    | integer(int64)    | false | none |        | 举报人ID     |
| reporterName  | string            | false | none |        | 举报人昵称   |
| reason        | string            | false | none |        | 举报原因     |
| description   | string            | false | none |        | 详细说明     |
| status        | string            | false | none |        | 状态         |
| createTime    | string(date-time) | false | none |        | 创建时间     |

#### 枚举值

| 属性       | 值       |
| ---------- | -------- |
| targetType | post     |
| targetType | reply    |
| status     | pending  |
| status     | accepted |
| status     | rejected |

<h2 id="tocS_ReportListResponse">ReportListResponse</h2>

<a id="schemareportlistresponse"></a>
<a id="schema_ReportListResponse"></a>
<a id="tocSreportlistresponse"></a>
<a id="tocsreportlistresponse"></a>

```json
{
  "total": 0,
  "list": [
    {
      "reportId": 0,
      "targetType": "post",
      "targetId": 0,
      "targetContent": "string",
      "reporterId": 0,
      "reporterName": "string",
      "reason": "string",
      "description": "string",
      "status": "pending",
      "createTime": "2019-08-24T14:15:22Z"
    }
  ]
}

```

### 属性

| 名称  | 类型                              | 必选  | 约束 | 中文名 | 说明 |
| ----- | --------------------------------- | ----- | ---- | ------ | ---- |
| total | integer(int64)                    | false | none |        | 总数 |
| list  | [[ReportItem](#schemareportitem)] | false | none |        | none |

<h2 id="tocS_HandleReportRequest">HandleReportRequest</h2>

<a id="schemahandlereportrequest"></a>
<a id="schema_HandleReportRequest"></a>
<a id="tocShandlereportrequest"></a>
<a id="tocshandlereportrequest"></a>

```json
{
  "action": "accept",
  "note": "string"
}

```

### 属性

| 名称   | 类型   | 必选  | 约束 | 中文名 | 说明             |
| ------ | ------ | ----- | ---- | ------ | ---------------- |
| action | string | true  | none |        | 操作             |
| note   | string | false | none |        | 处理备注（可选） |

#### 枚举值

| 属性   | 值     |
| ------ | ------ |
| action | accept |
| action | reject |

<h2 id="tocS_AuditLogItem">AuditLogItem</h2>

<a id="schemaauditlogitem"></a>
<a id="schema_AuditLogItem"></a>
<a id="tocSauditlogitem"></a>
<a id="tocsauditlogitem"></a>

```json
{
  "id": 0,
  "targetType": "post",
  "targetId": 0,
  "action": "string",
  "operatorId": 0,
  "operatorName": "string",
  "operatorRole": "string",
  "reason": "string",
  "previousStatus": "string",
  "newStatus": "string",
  "createTime": "2019-08-24T14:15:22Z"
}

```

### 属性

| 名称           | 类型              | 必选  | 约束 | 中文名 | 说明       |
| -------------- | ----------------- | ----- | ---- | ------ | ---------- |
| id             | integer(int64)    | false | none |        | 日志ID     |
| targetType     | string            | false | none |        | 目标类型   |
| targetId       | integer(int64)    | false | none |        | 目标ID     |
| action         | string            | false | none |        | 操作类型   |
| operatorId     | integer(int64)    | false | none |        | 操作人ID   |
| operatorName   | string            | false | none |        | 操作人昵称 |
| operatorRole   | string            | false | none |        | 操作人角色 |
| reason         | string            | false | none |        | 操作原因   |
| previousStatus | string            | false | none |        | 操作前状态 |
| newStatus      | string            | false | none |        | 操作后状态 |
| createTime     | string(date-time) | false | none |        | 创建时间   |

#### 枚举值

| 属性       | 值    |
| ---------- | ----- |
| targetType | post  |
| targetType | reply |

<h2 id="tocS_AuditLogListResponse">AuditLogListResponse</h2>

<a id="schemaauditloglistresponse"></a>
<a id="schema_AuditLogListResponse"></a>
<a id="tocSauditloglistresponse"></a>
<a id="tocsauditloglistresponse"></a>

```json
{
  "total": 0,
  "list": [
    {
      "id": 0,
      "targetType": "post",
      "targetId": 0,
      "action": "string",
      "operatorId": 0,
      "operatorName": "string",
      "operatorRole": "string",
      "reason": "string",
      "previousStatus": "string",
      "newStatus": "string",
      "createTime": "2019-08-24T14:15:22Z"
    }
  ]
}

```

### 属性

| 名称  | 类型                                  | 必选  | 约束 | 中文名 | 说明 |
| ----- | ------------------------------------- | ----- | ---- | ------ | ---- |
| total | integer(int64)                        | false | none |        | 总数 |
| list  | [[AuditLogItem](#schemaauditlogitem)] | false | none |        | none |

<h2 id="tocS_StatisticsResponse">StatisticsResponse</h2>

<a id="schemastatisticsresponse"></a>
<a id="schema_StatisticsResponse"></a>
<a id="tocSstatisticsresponse"></a>
<a id="tocsstatisticsresponse"></a>

```json
{
  "totalPosts": 0,
  "totalReplies": 0,
  "totalLikes": 0,
  "pendingPosts": 0,
  "pendingReplies": 0,
  "pendingReports": 0,
  "activeUsers": 0,
  "todayPosts": 0,
  "todayReplies": 0
}

```

### 属性

| 名称           | 类型           | 必选  | 约束 | 中文名 | 说明         |
| -------------- | -------------- | ----- | ---- | ------ | ------------ |
| totalPosts     | integer(int64) | false | none |        | 总帖子数     |
| totalReplies   | integer(int64) | false | none |        | 总回复数     |
| totalLikes     | integer(int64) | false | none |        | 总点赞数     |
| pendingPosts   | integer(int64) | false | none |        | 待审核帖子数 |
| pendingReplies | integer(int64) | false | none |        | 待审核回复数 |
| pendingReports | integer(int64) | false | none |        | 待处理举报数 |
| activeUsers    | integer(int64) | false | none |        | 活跃用户数   |
| todayPosts     | integer(int64) | false | none |        | 今日新帖数   |
| todayReplies   | integer(int64) | false | none |        | 今日新回复数 |

<h2 id="tocS_SensitiveWordItem">SensitiveWordItem</h2>

<a id="schemasensitiveworditem"></a>
<a id="schema_SensitiveWordItem"></a>
<a id="tocSsensitiveworditem"></a>
<a id="tocssensitiveworditem"></a>

```json
{
  "id": 0,
  "word": "string",
  "category": "string",
  "level": 0,
  "replacement": "string",
  "isEnabled": true,
  "hitCount": 0,
  "createTime": "2019-08-24T14:15:22Z",
  "updateTime": "2019-08-24T14:15:22Z"
}

```

### 属性

| 名称        | 类型              | 必选  | 约束 | 中文名 | 说明     |
| ----------- | ----------------- | ----- | ---- | ------ | -------- |
| id          | integer(int64)    | false | none |        | ID       |
| word        | string            | false | none |        | 敏感词   |
| category    | string            | false | none |        | 分类     |
| level       | integer           | false | none |        | 风险等级 |
| replacement | string            | false | none |        | 替换文本 |
| isEnabled   | boolean           | false | none |        | 是否启用 |
| hitCount    | integer(int64)    | false | none |        | 命中次数 |
| createTime  | string(date-time) | false | none |        | 创建时间 |
| updateTime  | string(date-time) | false | none |        | 更新时间 |

<h2 id="tocS_SensitiveWordListResponse">SensitiveWordListResponse</h2>

<a id="schemasensitivewordlistresponse"></a>
<a id="schema_SensitiveWordListResponse"></a>
<a id="tocSsensitivewordlistresponse"></a>
<a id="tocssensitivewordlistresponse"></a>

```json
{
  "total": 0,
  "list": [
    {
      "id": 0,
      "word": "string",
      "category": "string",
      "level": 0,
      "replacement": "string",
      "isEnabled": true,
      "hitCount": 0,
      "createTime": "2019-08-24T14:15:22Z",
      "updateTime": "2019-08-24T14:15:22Z"
    }
  ]
}

```

### 属性

| 名称  | 类型                                            | 必选  | 约束 | 中文名 | 说明 |
| ----- | ----------------------------------------------- | ----- | ---- | ------ | ---- |
| total | integer(int64)                                  | false | none |        | 总数 |
| list  | [[SensitiveWordItem](#schemasensitiveworditem)] | false | none |        | none |

<h2 id="tocS_CreateSensitiveWordRequest">CreateSensitiveWordRequest</h2>

<a id="schemacreatesensitivewordrequest"></a>
<a id="schema_CreateSensitiveWordRequest"></a>
<a id="tocScreatesensitivewordrequest"></a>
<a id="tocscreatesensitivewordrequest"></a>

```json
{
  "word": "string",
  "category": "string",
  "level": 0,
  "replacement": "string"
}

```

### 属性

| 名称        | 类型    | 必选  | 约束 | 中文名 | 说明                    |
| ----------- | ------- | ----- | ---- | ------ | ----------------------- |
| word        | string  | true  | none |        | 敏感词                  |
| category    | string  | false | none |        | 分类（可选）            |
| level       | integer | false | none |        | 风险等级（可选，默认1） |
| replacement | string  | false | none |        | 替换文本（可选）        |

<h2 id="tocS_CreateSensitiveWordResponse">CreateSensitiveWordResponse</h2>

<a id="schemacreatesensitivewordresponse"></a>
<a id="schema_CreateSensitiveWordResponse"></a>
<a id="tocScreatesensitivewordresponse"></a>
<a id="tocscreatesensitivewordresponse"></a>

```json
{
  "id": 0
}

```

### 属性

| 名称 | 类型           | 必选  | 约束 | 中文名 | 说明         |
| ---- | -------------- | ----- | ---- | ------ | ------------ |
| id   | integer(int64) | false | none |        | 新增敏感词ID |

<h2 id="tocS_UpdateSensitiveWordRequest">UpdateSensitiveWordRequest</h2>

<a id="schemaupdatesensitivewordrequest"></a>
<a id="schema_UpdateSensitiveWordRequest"></a>
<a id="tocSupdatesensitivewordrequest"></a>
<a id="tocsupdatesensitivewordrequest"></a>

```json
{
  "word": "string",
  "category": "string",
  "level": 0,
  "replacement": "string",
  "isEnabled": 0
}

```

### 属性

| 名称        | 类型    | 必选  | 约束 | 中文名 | 说明                  |
| ----------- | ------- | ----- | ---- | ------ | --------------------- |
| word        | string  | false | none |        | 敏感词（可选）        |
| category    | string  | false | none |        | 分类（可选）          |
| level       | integer | false | none |        | 风险等级（可选）      |
| replacement | string  | false | none |        | 替换文本（可选）      |
| isEnabled   | integer | false | none |        | 是否启用（可选，0/1） |

<h2 id="tocS_ImportSensitiveWordsRequest">ImportSensitiveWordsRequest</h2>

<a id="schemaimportsensitivewordsrequest"></a>
<a id="schema_ImportSensitiveWordsRequest"></a>
<a id="tocSimportsensitivewordsrequest"></a>
<a id="tocsimportsensitivewordsrequest"></a>

```json
{
  "words": [
    {
      "word": "string",
      "category": "string",
      "level": 0,
      "replacement": "string"
    }
  ]
}

```

### 属性

| 名称          | 类型     | 必选  | 约束 | 中文名 | 说明                    |
| ------------- | -------- | ----- | ---- | ------ | ----------------------- |
| words         | [object] | true  | none |        | none                    |
| » word        | string   | true  | none |        | 敏感词                  |
| » category    | string   | false | none |        | 分类（可选）            |
| » level       | integer  | false | none |        | 风险等级（可选，默认1） |
| » replacement | string   | false | none |        | 替换文本（可选）        |

<h2 id="tocS_ImportSensitiveWordsResponse">ImportSensitiveWordsResponse</h2>

<a id="schemaimportsensitivewordsresponse"></a>
<a id="schema_ImportSensitiveWordsResponse"></a>
<a id="tocSimportsensitivewordsresponse"></a>
<a id="tocsimportsensitivewordsresponse"></a>

```json
{
  "successCount": 0,
  "failCount": 0
}

```

### 属性

| 名称         | 类型           | 必选  | 约束 | 中文名 | 说明     |
| ------------ | -------------- | ----- | ---- | ------ | -------- |
| successCount | integer(int64) | false | none |        | 成功数量 |
| failCount    | integer(int64) | false | none |        | 失败数量 |

<h2 id="tocS_UserReputationResponse">UserReputationResponse</h2>

<a id="schemauserreputationresponse"></a>
<a id="schema_UserReputationResponse"></a>
<a id="tocSuserreputationresponse"></a>
<a id="tocsuserreputationresponse"></a>

```json
{
  "userId": 0,
  "nickname": "string",
  "reputationScore": 0,
  "postCount": 0,
  "replyCount": 0,
  "likeReceived": 0,
  "reportReceived": 0
}

```

### 属性

| 名称            | 类型           | 必选  | 约束 | 中文名 | 说明       |
| --------------- | -------------- | ----- | ---- | ------ | ---------- |
| userId          | integer(int64) | false | none |        | 用户ID     |
| nickname        | string         | false | none |        | 昵称       |
| reputationScore | integer        | false | none |        | 信誉分     |
| postCount       | integer(int64) | false | none |        | 发帖数     |
| replyCount      | integer(int64) | false | none |        | 回复数     |
| likeReceived    | integer(int64) | false | none |        | 收到的赞   |
| reportReceived  | integer(int64) | false | none |        | 收到的举报 |

<h2 id="tocS_UpdateReputationRequest">UpdateReputationRequest</h2>

<a id="schemaupdatereputationrequest"></a>
<a id="schema_UpdateReputationRequest"></a>
<a id="tocSupdatereputationrequest"></a>
<a id="tocsupdatereputationrequest"></a>

```json
{
  "reputationScore": 100,
  "reason": "string"
}

```

### 属性

| 名称            | 类型    | 必选  | 约束 | 中文名 | 说明                |
| --------------- | ------- | ----- | ---- | ------ | ------------------- |
| reputationScore | integer | true  | none |        | 新的信誉分（0-100） |
| reason          | string  | false | none |        | 修改原因（可选）    |
