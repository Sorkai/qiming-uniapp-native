# AI识屏回答功能 - 后端API文档

## 概述

AI识屏回答功能允许用户通过框选截图的方式，将屏幕内容发送给AI进行分析和问答。本文档定义了前后端交互所需的API接口。

## 基础信息

- **Base URL**: `/api/ai-assistant`
- **认证方式**: Bearer Token (JWT)
- **Content-Type**: `application/json`

## 接口列表

### 1. 分析截图

分析用户截取的屏幕图片，返回AI的初步分析结果。

**请求**

```
POST /api/ai-assistant/analyze
```

**请求头**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| Authorization | string | 是 | Bearer {token} |
| Content-Type | string | 是 | application/json |

**请求体**

```json
{
  "image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "sessionId": "uuid-string-optional"
}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| image | string | 是 | Base64编码的图片数据，支持PNG/JPEG格式，建议压缩后大小不超过1MB |
| sessionId | string | 否 | 会话ID，如果提供则继续该会话，否则创建新会话 |

**响应**

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "sessionId": "550e8400-e29b-41d4-a716-446655440000",
    "analysis": "这是一个Vue组件的代码截图，显示了一个表格组件的实现...",
    "suggestions": [
      "这段代码有什么问题？",
      "如何优化这个组件的性能？",
      "请解释这段代码的作用"
    ],
    "messageId": "msg-001"
  }
}
```

| 参数 | 类型 | 说明 |
|------|------|------|
| sessionId | string | 会话ID，用于后续对话 |
| analysis | string | AI对截图的分析结果 |
| suggestions | string[] | 建议的后续问题列表（可选，最多5个） |
| messageId | string | 消息ID，用于追踪 |

**错误码**

| code | message | 说明 |
|------|---------|------|
| 0 | success | 成功 |
| 401 | Unauthorized | 未登录或token过期 |
| 400 | Invalid image format | 图片格式不正确 |
| 413 | Image too large | 图片过大（超过5MB） |
| 500 | AI service error | AI服务异常 |

---

### 2. 发送对话消息

在已有会话中发送消息，进行多轮对话。

**请求**

```
POST /api/ai-assistant/chat
```

**请求头**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| Authorization | string | 是 | Bearer {token} |
| Content-Type | string | 是 | application/json |

**请求体**

```json
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "message": "请详细解释这段代码的作用",
  "context": {
    "screenshot": "data:image/png;base64,..."
  }
}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| sessionId | string | 是 | 会话ID |
| message | string | 是 | 用户发送的消息内容 |
| context | object | 否 | 上下文信息 |
| context.screenshot | string | 否 | 当前截图的Base64数据（用于AI参考） |

**响应**

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "reply": "这段代码是一个Vue 3组件，使用了Composition API...",
    "suggestions": [
      "如何添加错误处理？",
      "有没有更好的实现方式？"
    ],
    "messageId": "msg-002"
  }
}
```

| 参数 | 类型 | 说明 |
|------|------|------|
| reply | string | AI的回复内容，支持Markdown格式 |
| suggestions | string[] | 建议的后续问题列表（可选） |
| messageId | string | 消息ID |

**错误码**

| code | message | 说明 |
|------|---------|------|
| 0 | success | 成功 |
| 401 | Unauthorized | 未登录或token过期 |
| 404 | Session not found | 会话不存在或已过期 |
| 400 | Message is required | 消息内容为空 |
| 429 | Rate limit exceeded | 请求频率过高 |
| 500 | AI service error | AI服务异常 |

---

### 3. 获取历史会话列表

获取用户的历史对话会话列表。

**请求**

```
GET /api/ai-assistant/history
```

**请求头**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| Authorization | string | 是 | Bearer {token} |

**查询参数**

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| page | number | 否 | 1 | 页码 |
| pageSize | number | 否 | 10 | 每页数量，最大50 |

**响应**

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "sessionId": "550e8400-e29b-41d4-a716-446655440000",
        "title": "Vue组件代码分析",
        "preview": "这是一个Vue 3组件，使用了Composition API...",
        "messageCount": 5,
        "screenshot": "data:image/png;base64,...",
        "createdAt": 1704960000000,
        "updatedAt": 1704963600000
      }
    ],
    "total": 25,
    "page": 1,
    "pageSize": 10
  }
}
```

| 参数 | 类型 | 说明 |
|------|------|------|
| list | array | 会话列表 |
| list[].sessionId | string | 会话ID |
| list[].title | string | 会话标题（可由AI自动生成或取第一条消息摘要） |
| list[].preview | string | 预览内容（最后一条消息的前100字符） |
| list[].messageCount | number | 消息数量 |
| list[].screenshot | string | 截图缩略图（可选，建议压缩后返回） |
| list[].createdAt | number | 创建时间戳（毫秒） |
| list[].updatedAt | number | 最后更新时间戳（毫秒） |
| total | number | 总数量 |
| page | number | 当前页码 |
| pageSize | number | 每页数量 |

---

### 4. 获取会话详情

获取指定会话的完整对话记录。

**请求**

```
GET /api/ai-assistant/history/:sessionId
```

**请求头**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| Authorization | string | 是 | Bearer {token} |

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| sessionId | string | 是 | 会话ID |

**响应**

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "sessionId": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Vue组件代码分析",
    "screenshot": "data:image/png;base64,...",
    "messages": [
      {
        "id": "msg-001",
        "role": "user",
        "type": "image",
        "content": "data:image/png;base64,...",
        "timestamp": 1704960000000
      },
      {
        "id": "msg-002",
        "role": "assistant",
        "type": "text",
        "content": "这是一个Vue 3组件，使用了Composition API...",
        "timestamp": 1704960005000
      },
      {
        "id": "msg-003",
        "role": "user",
        "type": "text",
        "content": "请详细解释这段代码的作用",
        "timestamp": 1704960060000
      },
      {
        "id": "msg-004",
        "role": "assistant",
        "type": "text",
        "content": "好的，让我详细解释一下...",
        "timestamp": 1704960065000
      }
    ],
    "createdAt": 1704960000000,
    "updatedAt": 1704960065000
  }
}
```

| 参数 | 类型 | 说明 |
|------|------|------|
| sessionId | string | 会话ID |
| title | string | 会话标题 |
| screenshot | string | 原始截图（Base64） |
| messages | array | 消息列表 |
| messages[].id | string | 消息ID |
| messages[].role | string | 角色：`user` 或 `assistant` |
| messages[].type | string | 消息类型：`text` 或 `image` |
| messages[].content | string | 消息内容（文本或Base64图片） |
| messages[].timestamp | number | 消息时间戳（毫秒） |
| createdAt | number | 创建时间戳 |
| updatedAt | number | 最后更新时间戳 |

**错误码**

| code | message | 说明 |
|------|---------|------|
| 0 | success | 成功 |
| 401 | Unauthorized | 未登录或token过期 |
| 404 | Session not found | 会话不存在 |
| 403 | Forbidden | 无权访问该会话 |

---

### 5. 删除会话

删除指定的历史会话。

**请求**

```
DELETE /api/ai-assistant/history/:sessionId
```

**请求头**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| Authorization | string | 是 | Bearer {token} |

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| sessionId | string | 是 | 会话ID |

**响应**

```json
{
  "code": 0,
  "message": "success",
  "data": null
}
```

**错误码**

| code | message | 说明 |
|------|---------|------|
| 0 | success | 成功 |
| 401 | Unauthorized | 未登录或token过期 |
| 404 | Session not found | 会话不存在 |
| 403 | Forbidden | 无权删除该会话 |

---

## 数据模型

### ChatSession（会话）

```typescript
interface ChatSession {
  sessionId: string;      // 会话唯一标识（UUID）
  userId: string;         // 用户ID
  title: string;          // 会话标题
  screenshot: string;     // 原始截图（Base64）
  messages: ChatMessage[]; // 消息列表
  createdAt: number;      // 创建时间戳
  updatedAt: number;      // 更新时间戳
}
```

### ChatMessage（消息）

```typescript
interface ChatMessage {
  id: string;             // 消息唯一标识
  role: 'user' | 'assistant'; // 角色
  type: 'text' | 'image'; // 消息类型
  content: string;        // 消息内容
  timestamp: number;      // 时间戳
}
```

---

## 实现建议

### 1. 图片处理

- 前端会对截图进行压缩，建议后端也做大小限制（如5MB）
- 建议将图片存储到对象存储（如OSS），数据库只存储URL
- 历史列表返回的截图建议使用缩略图

### 2. AI服务集成

- 建议使用流式响应（SSE）提升用户体验
- 需要将图片和对话历史一起发送给AI模型
- 建议使用支持视觉能力的模型（如GPT-4V、Claude 3等）

### 3. 会话管理

- 会话建议设置过期时间（如30天）
- 每个用户的会话数量建议设置上限（如100个）
- 超出限制时自动删除最旧的会话

### 4. 安全考虑

- 所有接口需要验证用户登录状态
- 用户只能访问自己的会话数据
- 图片内容建议做敏感信息检测
- 建议对API调用频率做限制

### 5. 性能优化

- 历史列表接口建议使用分页
- 图片建议使用CDN加速
- 考虑使用缓存减少数据库查询

---

## 前端API调用示例

```typescript
// src/api/aiAssistant.ts

import { http } from "@/utils/http";

// 分析截图
export const analyzeScreen = (data: { image: string; sessionId?: string }) => {
  return http.request<{
    sessionId: string;
    analysis: string;
    suggestions: string[];
    messageId: string;
  }>("post", "/ai-assistant/analyze", { data });
};

// 发送对话消息
export const chatWithContext = (data: {
  sessionId: string;
  message: string;
  context?: { screenshot?: string };
}) => {
  return http.request<{
    reply: string;
    suggestions: string[];
    messageId: string;
  }>("post", "/ai-assistant/chat", { data });
};

// 获取历史会话列表
export const getChatHistory = (params: { page?: number; pageSize?: number }) => {
  return http.request<{
    list: ChatSession[];
    total: number;
    page: number;
    pageSize: number;
  }>("get", "/ai-assistant/history", { params });
};

// 获取会话详情
export const getChatSession = (sessionId: string) => {
  return http.request<ChatSession>("get", `/ai-assistant/history/${sessionId}`);
};

// 删除会话
export const deleteChatHistory = (sessionId: string) => {
  return http.request("delete", `/ai-assistant/history/${sessionId}`);
};
```

---

## 更新日志

| 版本 | 日期 | 说明 |
|------|------|------|
| 1.0.0 | 2026-01-12 | 初始版本 |
