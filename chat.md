## 单课AI互动

- **接口地址**：`/edu/frontend/v1/ai/chat/stream`
- **后端调用链路**：Go 后端通过 `AIAgent.BaseURL` 转发到 Python `/api/v1/chat/stream`，并携带 `X-Internal-Api-Key` 进行内部鉴权。
- **请求方式**：POST
- **请求参数**：

```json
{
  "course_id": "int64",           // 课程ID（可选）
  "chapter_id": "int64",          // 章节ID，不传默认第一章（可选）
  "conversation_id": "string",    // 会话ID，前端生成，用于查询会话历史（可选）
  "message": "string"             // 用户问题
}
```

- **响应参数**：

```json
{
  "conversation_id": "string",    // 会话ID（可选）
  "delta": "string",             // 回复
  "finished": "bool"             // 是否结束
}
```

## AI 会话管理（2026-03-10 新增）

以下接口为 AI 多模态聊天改造的第一批已落地接口，由 Go 后端直接读写 MySQL，会话数据不再依赖 Python 进程内存保存。

### 创建会话

- 接口地址：`/edu/frontend/v1/ai/conversations`
- 请求方式：`POST`

请求示例：

```json
{
  "scene": "general",
  "course_id": 0,
  "chapter_id": 0
}
```

响应示例：

```json
{
  "code": 200,
  "msg": "OK",
  "data": {
    "conversation_id": "AICUF2026031015300012345678",
    "scene": "general",
    "title": "新会话",
    "expire_at": "2026-04-09 15:30:00",
    "created_at": "2026-03-10 15:30:00"
  }
}
```

### 会话列表

- 接口地址：`/edu/frontend/v1/ai/conversations?page=1&page_size=20&scene=general&keyword=`
- 请求方式：`GET`

### 会话详情

- 接口地址：`/edu/frontend/v1/ai/conversations/{conversation_id}`
- 请求方式：`GET`

### 删除会话

- 接口地址：`/edu/frontend/v1/ai/conversations/{conversation_id}`
- 请求方式：`DELETE`
- 当前行为：软删除

### 获取会话消息历史

- 接口地址：`/edu/frontend/v1/ai/conversations/{conversation_id}/messages?page=1&page_size=50`
- 请求方式：`GET`

### 上传聊天图片附件

- 接口地址：`/edu/frontend/v1/ai/chat/attachments`
- 请求方式：`POST`
- Content-Type：`multipart/form-data`

表单字段：

- `file`：图片文件，必填
- `scene`：可选
- `conversation_id`：可选，若传入则会校验会话归属
- `course_id`：可选，若传入则会校验课程访问权限

当前限制：

- 仅支持 `image/jpeg`、`image/png`、`image/webp`
- 单图最大 10MB

响应示例：

```json
{
  "code": 200,
  "msg": "OK",
  "data": {
    "attachment_id": "AIAUF2026031016100012345678",
    "url": "https://.../ai_chat/1/2026/03/10/AIAUF2026031016100012345678.jpg",
    "mime_type": "image/jpeg",
    "file_size": 123456,
    "width": 1024,
    "height": 768,
    "status": "ready",
    "created_at": "2026-03-10 16:10:00"
  }
}
```

### 新建会话并发起多模态流式对话

- 接口地址：`/edu/frontend/v1/ai/chat/multimodal/stream`
- 请求方式：`POST`

请求示例：

```json
{
  "scene": "general",
  "course_id": 35,
  "chapter_id": 57,
  "message": "请结合图片讲解这道题",
  "attachment_ids": ["AIAUF2026031016100012345678"],
  "metadata": {
    "enable_tools": "false"
  }
}
```

响应格式：`text/event-stream`

```text
data: {"event":"conversation.created","conversation_id":"AICUF...","created_at":"2026-03-10 18:00:00","finished":false}
data: {"event":"user_message.saved","conversation_id":"AICUF...","message_id":"AIMUF...","created_at":"2026-03-10 18:00:00","finished":false}
data: {"event":"assistant.delta","conversation_id":"AICUF...","message_id":"AIMUF...","delta":"这道题考查的是...","finished":false}
data: {"event":"assistant.completed","conversation_id":"AICUF...","message_id":"AIMUF...","content_text":"完整回答","finish_reason":"stop","usage":{"prompt_tokens":120,"completion_tokens":56,"total_tokens":176},"finished":true}
```

### 在已有会话继续多模态流式对话

- 接口地址：`/edu/frontend/v1/ai/conversations/{conversation_id}/stream`
- 请求方式：`POST`

请求示例：

```json
{
  "message": "继续结合上一张图说明第二问",
  "attachment_ids": [],
  "metadata": {
    "model_key": "gemini_3_flash_preview"
  }
}
```

请求体与上一个接口基本相同，但不再传 `scene/course_id/chapter_id`。

流式错误事件示例：

```text
data: {"event":"error","conversation_id":"AICUF...","error_message":"AI 服务暂时不可用","finished":true}
```

说明：

- 上述 8 个接口已在 Go 侧落地
- 若传入 `course_id`，后端会校验当前用户是否有该课程访问权限
- 多模态流式链路已完成 Go -> Python SSE 转发、用户消息落库、assistant 消息落库、token 使用量持久化与会话统计刷新
- Go 侧当前默认仅向 Python 传递最近 20 条历史消息，避免长会话无限膨胀
- 当前尚未完成真实服务联调验证

## 获取会话历史

- **接口地址**：`/edu/frontend/v1/ai/get/conversations`
- **后端调用链路**：Go 后端通过 `AIAgent.BaseURL` 转发到 Python `/api/v1/conversations/{conversation_id}/history`，并携带 `X-Internal-Api-Key`。
- **请求方式**：GET
- **请求参数**：


```  
conversation_id: string   // 会话ID
```

- **响应参数**：

```json
{
  "conversation_id": "string",    // 会话ID
  "history": [                    // 会话历史
    {
      "role": "string",           // 角色
      "content": "string",        // 内容
      "timestamp": "string"       // 时间
    }
  ]
}
```

## 单课问答（非流式）

- **接口地址**：`/edu/frontend/v1/ai/qa`
- **后端调用链路**：Go 后端通过 `AIAgent.BaseURL` 转发到 Python `/api/v1/chat`，并携带 `X-Internal-Api-Key` 进行内部鉴权。
- **请求方式**：POST
- **请求参数**：

```json
{
  "courseId": "int64",        // 课程ID（必填）
  "session_id": "string",    // 会话ID（可选）
  "userPrompt": "string"     // 用户提问内容（必填）
}
```

- **响应参数**：

```json
{
  "answer": "string"          // 回答内容
}
```