# AI截屏提问助手 - 后端API文档

> 本文档基于前端实际代码生成，供后端开发直接参考实现。

## 基础信息

- **Base Path**: `/edu/v1/ai/screen`
- **认证方式**: Bearer Token (JWT)，所有接口需在请求头携带 `Authorization: Bearer {token}`
- **Content-Type**: `application/json`

## 通用响应格式

```json
{
  "code": 0,
  "msg": "success",
  "data": { ... }
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| code | number | 0=成功，非0=失败 |
| msg | string | 结果描述 |
| data | object \| null | 业务数据，失败时为 null |

### 通用错误码

| code | msg | 说明 |
|------|-----|------|
| 400 | Bad Request | 参数错误（缺失/格式不对） |
| 401 | Unauthorized | 未登录或 Token 过期 |
| 403 | Forbidden | 无权操作（如访问他人会话） |
| 413 | Image too large | 图片体积超限 |
| 429 | Rate limit exceeded | 请求频率过高 |
| 500 | Internal Server Error | 服务端/AI服务异常 |

---

## 接口列表

### 1. 分析截图（核心接口）

前端截屏后调用，发送 Base64 图片给后端，后端转发 AI 模型分析并返回结果。

```
POST /edu/v1/ai/screen/analyze
```

#### 请求体

```json
{
  "image": "data:image/png;base64,iVBORw0KGgoAAA...",
  "question": "请解释这段内容",
  "sessionId": "550e8400-e29b-41d4-a716-446655440000"
}
```

| 字段 | 类型 | 必填 | 约束 | 说明 |
|------|------|------|------|------|
| image | string | **是** | PNG/JPEG，Base64 编码后 ≤ 5MB | 截屏图片 |
| question | string | 否 | 最长 500 字符 | 用户附加问题，不传时后端可用默认 prompt |
| sessionId | string | 否 | UUID 格式 | 传入则延续已有会话，不传则创建新会话 |

#### 成功响应

```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "sessionId": "550e8400-e29b-41d4-a716-446655440000",
    "answer": "这是该截图的分析结果...",
    "suggestions": ["这段代码有什么问题？", "如何优化这个组件？"]
  }
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| data.sessionId | string | 会话ID（新建或已有），前端后续对话时回传 |
| data.answer | string | AI 分析结果，支持 Markdown 格式 |
| data.suggestions | string[] | 推荐的后续问题，可选，无则返回 `[]` |

#### 错误响应示例

```json
{ "code": 413, "msg": "Image too large", "data": null }
```

---

### 2. 继续对话

在已有会话中发送文本消息，进行多轮追问。

```
POST /edu/v1/ai/screen/chat
```

#### 请求体

```json
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "message": "请详细解释第3行代码"
}
```

| 字段 | 类型 | 必填 | 约束 | 说明 |
|------|------|------|------|------|
| sessionId | string | **是** | UUID 格式 | 会话ID，来自 analyze 接口返回 |
| message | string | **是** | 最长 500 字符 | 用户消息 |

#### 成功响应

```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "answer": "第3行代码的作用是...",
    "suggestions": ["还有其他写法吗？"]
  }
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| data.answer | string | AI 回复，支持 Markdown |
| data.suggestions | string[] | 推荐后续问题，无则 `[]` |

#### 特有错误码

| code | msg | 说明 |
|------|-----|------|
| 404 | Session not found | 会话不存在或已过期 |

---

### 3. 获取历史会话列表

分页获取当前用户的所有历史会话。

```
GET /edu/v1/ai/screen/history?page=1&pageSize=10
```

#### Query 参数

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| page | number | **是** | - | 页码，从1开始 |
| pageSize | number | **是** | - | 每页数量，前端默认传10 |

#### 成功响应

```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "total": 25,
    "list": [
      {
        "sessionId": "550e8400-...",
        "title": "Vue组件分析",
        "messages": [
          {
            "id": "msg_001",
            "role": "user",
            "content": "请分析这张截图",
            "image": "data:image/png;base64,...",
            "timestamp": 1704960000000
          },
          {
            "id": "msg_002",
            "role": "assistant",
            "content": "这是一个Vue 3组件...",
            "timestamp": 1704960005000
          }
        ],
        "screenshot": "data:image/png;base64,...",
        "createdAt": 1704960000000,
        "updatedAt": 1704963600000
      }
    ]
  }
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| data.total | number | 总会话数 |
| data.list | ChatSession[] | 会话列表 |
| data.list[].sessionId | string | 会话ID |
| data.list[].title | string | 会话标题（可取首条消息摘要） |
| data.list[].messages | ChatMessage[] | 该会话的消息列表 |
| data.list[].screenshot | string | 原始截图 Base64（可选） |
| data.list[].createdAt | number | 创建时间戳（毫秒） |
| data.list[].updatedAt | number | 更新时间戳（毫秒） |

> **ChatMessage 结构：**

| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 消息ID |
| role | "user" \| "assistant" | 角色 |
| content | string | 文本内容 |
| image | string | Base64图片（仅用户截图消息有） |
| timestamp | number | 时间戳（毫秒） |

---

### 4. 获取单个会话详情

获取指定会话的完整对话记录。

```
GET /edu/v1/ai/screen/session/{sessionId}
```

#### 路径参数

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| sessionId | string | **是** | 会话ID |

#### 成功响应

```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "sessionId": "550e8400-...",
    "title": "Vue组件分析",
    "messages": [
      {
        "id": "msg_001",
        "role": "user",
        "content": "请分析这张截图",
        "image": "data:image/png;base64,...",
        "timestamp": 1704960000000
      },
      {
        "id": "msg_002",
        "role": "assistant",
        "content": "这是一个Vue 3组件...",
        "timestamp": 1704960005000
      }
    ],
    "screenshot": "data:image/png;base64,...",
    "createdAt": 1704960000000,
    "updatedAt": 1704960065000
  }
}
```

#### 特有错误码

| code | msg | 说明 |
|------|-----|------|
| 404 | Session not found | 会话不存在 |
| 403 | Forbidden | 无权访问该会话 |

---

### 5. 删除会话

删除指定的历史会话及其所有消息。

```
DELETE /edu/v1/ai/screen/history/{sessionId}
```

#### 路径参数

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| sessionId | string | **是** | 会话ID |

#### 成功响应

```json
{
  "code": 0,
  "msg": "success",
  "data": null
}
```

#### 特有错误码

| code | msg | 说明 |
|------|-----|------|
| 404 | Session not found | 会话不存在 |
| 403 | Forbidden | 无权删除该会话 |

---

## 数据模型（TypeScript 参考）

```typescript
// 会话
interface ChatSession {
  sessionId: string;      // UUID
  title: string;          // 会话标题
  messages: ChatMessage[];
  screenshot?: string;    // 原始截图 Base64
  createdAt: number;      // 毫秒时间戳
  updatedAt: number;
}

// 消息
interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  image?: string;         // 仅 user 类型的截图消息
  timestamp: number;
}
```

---

## 后端实现注意事项

1. **图片处理**：前端已做压缩，后端仍需校验大小（≤5MB）和格式（PNG/JPEG）。建议将图片存对象存储，数据库只存 URL。
2. **AI 模型**：需使用支持视觉的模型（GPT-4V / Claude 3 等），将图片+历史消息一起发送。
3. **会话管理**：建议设置过期时间（如30天），每用户上限（如100个），超限自动清理最旧会话。
4. **限流**：建议单用户 10 次/分钟。
5. **超时**：AI 分析可能较慢，建议后端设置 30s 超时，超时返回 500。
6. **安全**：用户只能访问/删除自己的会话；建议对图片做敏感内容检测；`question`/`message` 字段需防 XSS。
7. **suggestions 为空时**：统一返回空数组 `[]`，不要返回 `null` 或不返回该字段。

---

## 前端已有对应代码

| 文件 | 说明 |
|------|------|
| `src/api/aiAssistant.ts` | 5个接口的 API 调用函数 |
| `src/components/AiScreenCapture/types.ts` | 所有类型定义 |
| `src/components/AiScreenCapture/hooks/useAiChat.ts` | 对话逻辑 Hook |
| `src/components/AiScreenCapture/hooks/useScreenCapture.ts` | 截图逻辑 Hook |
| `src/components/AiScreenCapture/index.vue` | 主组件 |
| `src/components/AiScreenCapture/ChatDialog.vue` | 对话框组件 |

---

## 更新日志

| 版本 | 日期 | 说明 |
|------|------|------|
| 2.0.0 | 2026-03-10 | 基于前端代码重写，修正URL/字段/接口数量 |
