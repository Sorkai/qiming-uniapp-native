## 单课AI互动

- **接口地址**：`/edu/frontend/v1/ai/chat/stream`
- **请求方式**：POST
- **请求参数**：

```json
{
  "course_id": "int64",           // 课程ID（可选）
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

## 获取会话历史

- **接口地址**：`/edu/frontend/v1/ai/get/conversations`
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