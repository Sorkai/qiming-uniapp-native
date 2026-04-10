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

# Frontend-Chat

## POST 单课AI互动 (流式)

POST /edu/frontend/v1/ai/chat/stream

> Body 请求参数

```json
{
  "course_id": 0,
  "chapter_id": 0,
  "conversation_id": "string",
  "message": "string"
}
```

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|body|body|object| 否 |none|
|» course_id|body|integer(int64)| 否 |none|
|» chapter_id|body|integer(int64)| 否 |章节ID，不传默认第一章|
|» conversation_id|body|string| 否 |none|
|» message|body|string| 否 |none|

> 返回示例

> 200 Response

```json
{
  "conversation_id": "string",
  "delta": "string",
  "finished": true
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|成功|Inline|

### 返回数据结构

状态码 **200**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» conversation_id|string|false|none||none|
|» delta|string|false|none||none|
|» finished|boolean|false|none||none|

## GET 获取会话历史

GET /edu/frontend/v1/ai/get/conversations

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|conversation_id|query|string| 是 |none|

> 返回示例

> 200 Response

```json
{
  "conversation_id": "string",
  "history": [
    {
      "role": "string",
      "content": "string",
      "timestamp": "string"
    }
  ]
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|成功|Inline|

### 返回数据结构

状态码 **200**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» conversation_id|string|false|none||none|
|» history|[object]|false|none||none|
|»» role|string|false|none||none|
|»» content|string|false|none||none|
|»» timestamp|string|false|none||none|

## POST 单课问答（非流式）

POST /edu/frontend/v1/ai/qa

非流式单课问答接口

> Body 请求参数

```json
{
  "courseId": 0,
  "session_id": "string",
  "userPrompt": "string"
}
```

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|body|body|object| 是 |none|
|» courseId|body|integer(int64)| 是 |课程ID|
|» session_id|body|string| 否 |会话ID|
|» userPrompt|body|string| 是 |用户提问内容|

> 返回示例

> 200 Response

```json
{
  "answer": "string"
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|成功|Inline|

### 返回数据结构

状态码 **200**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» answer|string|false|none||回答内容|

## POST 创建 AI 会话

POST /edu/frontend/v1/ai/conversations

创建新的 AI 多模态聊天会话。

> Body 请求参数

```json
{
  "scene": "string",
  "course_id": 0,
  "chapter_id": 0
}
```

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|body|body|object| 是 |none|
|» scene|body|string| 否 |会话场景，默认 general|
|» course_id|body|integer(int64)| 否 |课程ID，可选|
|» chapter_id|body|integer(int64)| 否 |章节ID，可选|

> 返回示例

> 200 Response

```json
{
  "conversation_id": "string",
  "scene": "string",
  "course_id": 0,
  "chapter_id": 0,
  "title": "string",
  "expire_at": "string",
  "created_at": "string"
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|成功|Inline|

### 返回数据结构

状态码 **200**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» conversation_id|string|false|none||none|
|» scene|string|false|none||none|
|» course_id|integer(int64)|false|none||none|
|» chapter_id|integer(int64)|false|none||none|
|» title|string|false|none||none|
|» expire_at|string|false|none||none|
|» created_at|string|false|none||none|

## GET 获取 AI 会话列表

GET /edu/frontend/v1/ai/conversations

分页获取当前用户的 AI 会话列表。

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|page|query|integer(int64)| 否 |none|
|page_size|query|integer(int64)| 否 |none|
|scene|query|string| 否 |none|
|keyword|query|string| 否 |none|

> 返回示例

> 200 Response

```json
{
  "total": 0,
  "list": [
    {
      "conversation_id": "string",
      "scene": "string",
      "course_id": 0,
      "chapter_id": 0,
      "title": "string",
      "summary": "string",
      "last_message_preview": "string",
      "last_message_at": "string",
      "message_count": 0,
      "attachment_count": 0,
      "expire_at": "string",
      "created_at": "string"
    }
  ],
  "page": 0,
  "page_size": 0,
  "has_more": true
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|成功|Inline|

### 返回数据结构

状态码 **200**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» total|integer(int64)|false|none||none|
|» list|[object]|false|none||none|
|»» conversation_id|string|false|none||none|
|»» scene|string|false|none||none|
|»» course_id|integer(int64)|false|none||none|
|»» chapter_id|integer(int64)|false|none||none|
|»» title|string|false|none||none|
|»» summary|string|false|none||none|
|»» last_message_preview|string|false|none||none|
|»» last_message_at|string|false|none||none|
|»» message_count|integer(int64)|false|none||none|
|»» attachment_count|integer(int64)|false|none||none|
|»» expire_at|string|false|none||none|
|»» created_at|string|false|none||none|
|» page|integer(int64)|false|none||none|
|» page_size|integer(int64)|false|none||none|
|» has_more|boolean|false|none||none|

## GET 获取 AI 会话详情

GET /edu/frontend/v1/ai/conversations/{conversationId}

获取指定 AI 会话详情。

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|conversationId|path|string| 是 |none|

> 返回示例

> 200 Response

```json
{
  "conversation_id": "string",
  "scene": "string",
  "course_id": 0,
  "chapter_id": 0,
  "title": "string",
  "summary": "string",
  "status": "string",
  "message_count": 0,
  "attachment_count": 0,
  "last_message_at": "string",
  "expire_at": "string",
  "created_at": "string",
  "updated_at": "string"
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|成功|Inline|

### 返回数据结构

状态码 **200**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» conversation_id|string|false|none||none|
|» scene|string|false|none||none|
|» course_id|integer(int64)|false|none||none|
|» chapter_id|integer(int64)|false|none||none|
|» title|string|false|none||none|
|» summary|string|false|none||none|
|» status|string|false|none||none|
|» message_count|integer(int64)|false|none||none|
|» attachment_count|integer(int64)|false|none||none|
|» last_message_at|string|false|none||none|
|» expire_at|string|false|none||none|
|» created_at|string|false|none||none|
|» updated_at|string|false|none||none|

## DELETE 删除 AI 会话

DELETE /edu/frontend/v1/ai/conversations/{conversationId}

软删除指定 AI 会话。

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|conversationId|path|string| 是 |none|

> 返回示例

> 200 Response

```json
{
  "conversation_id": "string",
  "deleted": true
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|成功|Inline|

### 返回数据结构

状态码 **200**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» conversation_id|string|false|none||none|
|» deleted|boolean|false|none||none|

## GET 获取 AI 会话消息历史

GET /edu/frontend/v1/ai/conversations/{conversationId}/messages

分页获取指定会话的消息历史。

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|conversationId|path|string| 是 |none|
|page|query|integer(int64)| 否 |none|
|page_size|query|integer(int64)| 否 |none|

> 返回示例

> 200 Response

```json
{
  "total": 0,
  "list": [
    {
      "message_id": "string",
      "role": "string",
      "content_text": "string",
      "content_segments": [
        {
          "type": "string",
          "text": "string",
          "attachment_id": "string",
          "url": "string",
          "mime_type": "string",
          "width": 0,
          "height": 0
        }
      ],
      "attachments": [
        {
          "attachment_id": "string",
          "url": "string",
          "mime_type": "string",
          "width": 0,
          "height": 0,
          "file_size": 0
        }
      ],
      "status": "string",
      "tool_calls": [
        {
          "property1": "string",
          "property2": "string"
        }
      ],
      "created_at": "string"
    }
  ],
  "page": 0,
  "page_size": 0,
  "has_more": true
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|成功|Inline|

### 返回数据结构

状态码 **200**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» total|integer(int64)|false|none||none|
|» list|[object]|false|none||none|
|»» message_id|string|false|none||none|
|»» role|string|false|none||none|
|»» content_text|string|false|none||none|
|»» content_segments|[object]|false|none||none|
|»»» type|string|false|none||none|
|»»» text|string|false|none||none|
|»»» attachment_id|string|false|none||none|
|»»» url|string|false|none||none|
|»»» mime_type|string|false|none||none|
|»»» width|integer(int64)|false|none||none|
|»»» height|integer(int64)|false|none||none|
|»» attachments|[object]|false|none||none|
|»»» attachment_id|string|false|none||none|
|»»» url|string|false|none||none|
|»»» mime_type|string|false|none||none|
|»»» width|integer(int64)|false|none||none|
|»»» height|integer(int64)|false|none||none|
|»»» file_size|integer(int64)|false|none||none|
|»» status|string|false|none||none|
|»» tool_calls|[object]|false|none||none|
|»»» **additionalProperties**|string|false|none||none|
|»» created_at|string|false|none||none|
|» page|integer(int64)|false|none||none|
|» page_size|integer(int64)|false|none||none|
|» has_more|boolean|false|none||none|

## POST 上传 AI 聊天图片附件

POST /edu/frontend/v1/ai/chat/attachments

上传聊天图片并返回 attachment_id。

> Body 请求参数

```yaml
file: ""
scene: ""
conversation_id: ""
course_id: 0

```

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|body|body|object| 是 |none|
|» file|body|string(binary)| 是 |none|
|» scene|body|string| 否 |none|
|» conversation_id|body|string| 否 |none|
|» course_id|body|integer(int64)| 否 |none|

> 返回示例

> 200 Response

```json
{
  "attachment_id": "string",
  "url": "string",
  "mime_type": "string",
  "file_size": 0,
  "width": 0,
  "height": 0,
  "status": "string",
  "created_at": "string"
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|成功|Inline|

### 返回数据结构

状态码 **200**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» attachment_id|string|false|none||none|
|» url|string|false|none||none|
|» mime_type|string|false|none||none|
|» file_size|integer(int64)|false|none||none|
|» width|integer(int64)|false|none||none|
|» height|integer(int64)|false|none||none|
|» status|string|false|none||none|
|» created_at|string|false|none||none|

## POST 新建会话并发起多模态流式对话

POST /edu/frontend/v1/ai/chat/multimodal/stream

创建新会话并发起支持图片输入的多模态 SSE 对话。`message` 与 `attachment_ids` 不能同时为空。

> Body 请求参数

```json
{
  "scene": "string",
  "course_id": 0,
  "chapter_id": 0,
  "message": "string",
  "attachment_ids": [
    "string"
  ],
  "metadata": {
    "property1": "string",
    "property2": "string"
  }
}
```

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|body|body|object| 是 |none|
|» scene|body|string| 否 |none|
|» course_id|body|integer(int64)| 否 |none|
|» chapter_id|body|integer(int64)| 否 |none|
|» message|body|string| 否 |none|
|» attachment_ids|body|[string]| 否 |none|
|» metadata|body|object| 否 |none|
|»» **additionalProperties**|body|string| 否 |none|

> 返回示例

> 200 Response

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|SSE 事件流|Inline|

### 返回数据结构

状态码 **200**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» event|string|false|none||none|
|» conversation_id|string|false|none||none|
|» message_id|string|false|none||none|
|» delta|string|false|none||none|
|» content_text|string|false|none||none|
|» finish_reason|string|false|none||none|
|» finished|boolean|false|none||none|
|» error_message|string|false|none||none|
|» created_at|string|false|none||none|
|» usage|object|false|none||none|
|»» prompt_tokens|integer(int64)|false|none||none|
|»» completion_tokens|integer(int64)|false|none||none|
|»» total_tokens|integer(int64)|false|none||none|

## POST 在已有会话中继续多模态流式对话

POST /edu/frontend/v1/ai/conversations/{conversationId}/stream

在已有 AI 会话中继续发起多模态 SSE 对话。`message` 与 `attachment_ids` 不能同时为空。

> Body 请求参数

```json
{
  "message": "string",
  "attachment_ids": [
    "string"
  ],
  "metadata": {
    "property1": "string",
    "property2": "string"
  }
}
```

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|conversationId|path|string| 是 |none|
|body|body|object| 是 |none|
|» message|body|string| 否 |none|
|» attachment_ids|body|[string]| 否 |none|
|» metadata|body|object| 否 |none|
|»» **additionalProperties**|body|string| 否 |none|

> 返回示例

> 200 Response

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|SSE 事件流|Inline|

### 返回数据结构

状态码 **200**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» event|string|false|none||none|
|» conversation_id|string|false|none||none|
|» message_id|string|false|none||none|
|» delta|string|false|none||none|
|» content_text|string|false|none||none|
|» finish_reason|string|false|none||none|
|» finished|boolean|false|none||none|
|» error_message|string|false|none||none|
|» created_at|string|false|none||none|
|» usage|object|false|none||none|
|»» prompt_tokens|integer(int64)|false|none||none|
|»» completion_tokens|integer(int64)|false|none||none|
|»» total_tokens|integer(int64)|false|none||none|

# 数据模型

