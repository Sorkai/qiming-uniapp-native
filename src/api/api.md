# 后端 API 文档


## 基础信息
- 框架: FastAPI
- API 版本: v1
- 基础路径: /api/v1
- 内容类型: application/json
- 接口前缀：http://connect.nmb1.seetacloud.com:8000

## 模块说明

### 1. 对话聊天模块 (chat.py)
提供AI对话功能，支持学生和教师两种角色，包含普通对话和流式对话。

### 2. 文档处理模块 (file_upload.py)
提供文档上传、处理状态查询和任务管理功能，支持多种文件格式的异步处理。

## API 接口详情

### 对话聊天接口

#### 1. 非流式对话

**接口地址**: POST /chat

**功能描述**: 发送消息并获取AI助手的完整回复

**请求参数**:

```json
{
  "message": "string",              // 必填，用户消息内容
  "nickname": "string",             // 必填，用户昵称
  "role_type": 1,                   // 必填，用户角色类型 (1=USER, 2=TEACHER, 3=ADMIN)
  "user_id": 123,                   // 必填，用户ID，对应user表的id
  "conversation_id": "string",      // 可选，会话ID，不提供则自动生成
  "stream": false,                  // 可选，流式标志，此接口必须为false
  "context": {                      // 可选，对话上下文信息
    "course_info": {
      "course_id": 456,
      "course_name": "机器学习基础",
      "chapter_id": 789,
      "chapter_name": "监督学习"
    },
    "exercise_info": {
      "exercise_id": 101,
      "exercise_type": "选择题"
    },
    "learning_progress": {
      "completed_chapters": [1, 2, 3],
      "current_level": "初级"
    }
  }
}
```

**响应结果**:

```
{
  "conversation_id": "string",      // 会话ID
  "response": "string",             // AI助手回复内容
  "tool_calls": [                   // 可选，工具调用记录
    {
      "tool_name": "string",
      "parameters": {},
      "result": {}
    }
  ]
}
```

**状态码**:

- 200: 成功
- 400: 请求参数错误（如stream=true时提示使用流式接口）
- 500: 服务器内部错误

#### 2. 流式对话

**接口地址**: POST /chat/stream

**功能描述**: 发送消息并以流式方式接收AI助手的回复

**请求参数**: 与非流式对话相同

**响应格式**: Server-Sent Events (SSE)

**响应头**:

```
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive
```

**响应数据格式**:

```
data: {"conversation_id":"string","delta":"string","finished":false,"tool_calls":null}

data: {"conversation_id":"string","delta":"string","finished":true,"tool_calls":[]}
```

**字段说明**:

- conversation_id: 会话ID
- delta: 增量文本内容
- finished: 是否完成，true表示流式响应结束
- tool_calls: 工具调用记录（仅在完成时提供）

**状态码**:

- 200: 成功建立流式连接
- 500: 服务器内部错误

**示例**

curl -X POST "http://localhost:8000/api/v1/chat/stream" \
  -H "Content-Type: application/json" \
  -H "Accept: text/event-stream" \
  -d '{
    "message": "请帮我计算333乘以22等于多少？",
    "nickname": "test_user",
    "role_type": 2,
    "user_id": 123,
    "context": {
      "course_info": {
        "course_name": "数学基础",
        "course_id": "math_001"
      },
      "current_topic": "基础运算"
    }
  }' \
  --no-buffer

  响应：
  data: {"conversation_id":"5a5ecd63-6aca-4128-a0b2-4960cca27bb4","delta":"\n\n工具调用结果: {\"content\": \"[TextContent(type='text', text='{\\\\n  \\\"success\\\": true,\\\\n  \\\"data\\\": {\\\\n    \\\"expression\\\": \\\"333*22\\\",\\\\n    \\\"result\\\": 7326,\\\\n    \\\"result_type\\\": \\\"int\\\",\\\\n    \\\"status\\\": \\\"success\\\"\\\\n  },\\\\n  \\\"message\\\": \\\"数学运算成功\\\"\\\\n}', annotations=None)]\", \"status\": \"success\"}","finished":false,"tool_calls":null}

data: {"conversation_id":"5a5ecd63-6aca-4128-a0b2-4960cca27bb4","delta":"\n\n--- LLM整理结果 ---\n","finished":false,"tool_calls":null}

data: {"conversation_id":"5a5ecd63-6aca-4128-a0b2-4960cca27bb4","delta":"333","finished":false,"tool_calls":null}

data: {"conversation_id":"5a5ecd63-6aca-4128-a0b2-4960cca27bb4","delta":"乘以","finished":false,"tool_calls":null}

data: {"conversation_id":"5a5ecd63-6aca-4128-a0b2-4960cca27bb4","delta":"22","finished":false,"tool_calls":null}

data: {"conversation_id":"5a5ecd63-6aca-4128-a0b2-4960cca27bb4","delta":"的计算","finished":false,"tool_calls":null}

data: {"conversation_id":"5a5ecd63-6aca-4128-a0b2-4960cca27bb4","delta":"结果是","finished":false,"tool_calls":null}

data: {"conversation_id":"5a5ecd63-6aca-4128-a0b2-4960cca27bb4","delta":"732","finished":false,"tool_calls":null}

data: {"conversation_id":"5a5ecd63-6aca-4128-a0b2-4960cca27bb4","delta":"6","finished":false,"tool_calls":null}

data: {"conversation_id":"5a5ecd63-6aca-4128-a0b2-4960cca27bb4","delta":"。","finished":false,"tool_calls":null}

data: {"conversation_id":"5a5ecd63-6aca-4128-a0b2-4960cca27bb4","delta":"计算","finished":false,"tool_calls":null}

data: {"conversation_id":"5a5ecd63-6aca-4128-a0b2-4960cca27bb4","delta":"过程","finished":false,"tool_calls":null}

data: {"conversation_id":"5a5ecd63-6aca-4128-a0b2-4960cca27bb4","delta":"如下","finished":false,"tool_calls":null}

data: {"conversation_id":"5a5ecd63-6aca-4128-a0b2-4960cca27bb4","delta":"：\n","finished":false,"tool_calls":null}

data: {"conversation_id":"5a5ecd63-6aca-4128-a0b2-4960cca27bb4","delta":"333","finished":false,"tool_calls":null}

data: {"conversation_id":"5a5ecd63-6aca-4128-a0b2-4960cca27bb4","delta":" ×","finished":false,"tool_calls":null}

data: {"conversation_id":"5a5ecd63-6aca-4128-a0b2-4960cca27bb4","delta":" ","finished":false,"tool_calls":null}

data: {"conversation_id":"5a5ecd63-6aca-4128-a0b2-4960cca27bb4","delta":"20","finished":false,"tool_calls":null}

data: {"conversation_id":"5a5ecd63-6aca-4128-a0b2-4960cca27bb4","delta":" =","finished":false,"tool_calls":null}

data: {"conversation_id":"5a5ecd63-6aca-4128-a0b2-4960cca27bb4","delta":" ","finished":false,"tool_calls":null}

data: {"conversation_id":"5a5ecd63-6aca-4128-a0b2-4960cca27bb4","delta":"666","finished":false,"tool_calls":null}

data: {"conversation_id":"5a5ecd63-6aca-4128-a0b2-4960cca27bb4","delta":"0","finished":false,"tool_calls":null}

data: {"conversation_id":"5a5ecd63-6aca-4128-a0b2-4960cca27bb4","delta":"\n","finished":false,"tool_calls":null}

data: {"conversation_id":"5a5ecd63-6aca-4128-a0b2-4960cca27bb4","delta":"333","finished":false,"tool_calls":null}

data: {"conversation_id":"5a5ecd63-6aca-4128-a0b2-4960cca27bb4","delta":" ×","finished":false,"tool_calls":null}

data: {"conversation_id":"5a5ecd63-6aca-4128-a0b2-4960cca27bb4","delta":" ","finished":false,"tool_calls":null}

data: {"conversation_id":"5a5ecd63-6aca-4128-a0b2-4960cca27bb4","delta":"2","finished":false,"tool_calls":null}

data: {"conversation_id":"5a5ecd63-6aca-4128-a0b2-4960cca27bb4","delta":" =","finished":false,"tool_calls":null}

data: {"conversation_id":"5a5ecd63-6aca-4128-a0b2-4960cca27bb4","delta":" ","finished":false,"tool_calls":null}

data: {"conversation_id":"5a5ecd63-6aca-4128-a0b2-4960cca27bb4","delta":"666","finished":false,"tool_calls":null}

data: {"conversation_id":"5a5ecd63-6aca-4128-a0b2-4960cca27bb4","delta":"\n","finished":false,"tool_calls":null}

data: {"conversation_id":"5a5ecd63-6aca-4128-a0b2-4960cca27bb4","delta":"然后将","finished":false,"tool_calls":null}

data: {"conversation_id":"5a5ecd63-6aca-4128-a0b2-4960cca27bb4","delta":"两个","finished":false,"tool_calls":null}

data: {"conversation_id":"5a5ecd63-6aca-4128-a0b2-4960cca27bb4","delta":"部分","finished":false,"tool_calls":null}

data: {"conversation_id":"5a5ecd63-6aca-4128-a0b2-4960cca27bb4","delta":"相加","finished":false,"tool_calls":null}

data: {"conversation_id":"5a5ecd63-6aca-4128-a0b2-4960cca27bb4","delta":"：","finished":false,"tool_calls":null}

data: {"conversation_id":"5a5ecd63-6aca-4128-a0b2-4960cca27bb4","delta":"666","finished":false,"tool_calls":null}

data: {"conversation_id":"5a5ecd63-6aca-4128-a0b2-4960cca27bb4","delta":"0","finished":false,"tool_calls":null}

data: {"conversation_id":"5a5ecd63-6aca-4128-a0b2-4960cca27bb4","delta":" +","finished":false,"tool_calls":null}

data: {"conversation_id":"5a5ecd63-6aca-4128-a0b2-4960cca27bb4","delta":" ","finished":false,"tool_calls":null}

data: {"conversation_id":"5a5ecd63-6aca-4128-a0b2-4960cca27bb4","delta":"666","finished":false,"tool_calls":null}

data: {"conversation_id":"5a5ecd63-6aca-4128-a0b2-4960cca27bb4","delta":" =","finished":false,"tool_calls":null}

data: {"conversation_id":"5a5ecd63-6aca-4128-a0b2-4960cca27bb4","delta":" ","finished":false,"tool_calls":null}

data: {"conversation_id":"5a5ecd63-6aca-4128-a0b2-4960cca27bb4","delta":"732","finished":false,"tool_calls":null}

data: {"conversation_id":"5a5ecd63-6aca-4128-a0b2-4960cca27bb4","delta":"6","finished":false,"tool_calls":null}

data: {"conversation_id":"5a5ecd63-6aca-4128-a0b2-4960cca27bb4","delta":"\n\n","finished":false,"tool_calls":null}

data: {"conversation_id":"5a5ecd63-6aca-4128-a0b2-4960cca27bb4","delta":"如果你","finished":false,"tool_calls":null}

data: {"conversation_id":"5a5ecd63-6aca-4128-a0b2-4960cca27bb4","delta":"需要","finished":false,"tool_calls":null}

data: {"conversation_id":"5a5ecd63-6aca-4128-a0b2-4960cca27bb4","delta":"进一步","finished":false,"tool_calls":null}

data: {"conversation_id":"5a5ecd63-6aca-4128-a0b2-4960cca27bb4","delta":"了解","finished":false,"tool_calls":null}

data: {"conversation_id":"5a5ecd63-6aca-4128-a0b2-4960cca27bb4","delta":"乘法","finished":false,"tool_calls":null}

data: {"conversation_id":"5a5ecd63-6aca-4128-a0b2-4960cca27bb4","delta":"运算","finished":false,"tool_calls":null}

data: {"conversation_id":"5a5ecd63-6aca-4128-a0b2-4960cca27bb4","delta":"方法","finished":false,"tool_calls":null}

data: {"conversation_id":"5a5ecd63-6aca-4128-a0b2-4960cca27bb4","delta":"或有","finished":false,"tool_calls":null}

data: {"conversation_id":"5a5ecd63-6aca-4128-a0b2-4960cca27bb4","delta":"其他","finished":false,"tool_calls":null}

data: {"conversation_id":"5a5ecd63-6aca-4128-a0b2-4960cca27bb4","delta":"数学","finished":false,"tool_calls":null}

data: {"conversation_id":"5a5ecd63-6aca-4128-a0b2-4960cca27bb4","delta":"问题","finished":false,"tool_calls":null}

data: {"conversation_id":"5a5ecd63-6aca-4128-a0b2-4960cca27bb4","delta":"，","finished":false,"tool_calls":null}

data: {"conversation_id":"5a5ecd63-6aca-4128-a0b2-4960cca27bb4","delta":"可以","finished":false,"tool_calls":null}

data: {"conversation_id":"5a5ecd63-6aca-4128-a0b2-4960cca27bb4","delta":"随时","finished":false,"tool_calls":null}

data: {"conversation_id":"5a5ecd63-6aca-4128-a0b2-4960cca27bb4","delta":"告诉我","finished":false,"tool_calls":null}

data: {"conversation_id":"5a5ecd63-6aca-4128-a0b2-4960cca27bb4","delta":"。","finished":false,"tool_calls":null}

data: {"conversation_id":"5a5ecd63-6aca-4128-a0b2-4960cca27bb4","delta":"","finished":true,"tool_calls":null}

#### 3. 获取对话历史

**接口地址**: GET /conversations/{conversation_id}/history

**功能描述**: 获取指定会话的历史记录

**路径参数**:

- conversation_id (string): 会话ID

**响应结果**:

```json
{
  "conversation_id": "string",      // 会话ID
  "history": [                      // 对话历史记录
    {
      "role": "user|assistant|system",
      "content": "string",
      "timestamp": "2024-01-01T00:00:00Z"
    }
  ]
}
```

**状态码**:

- 200: 成功
- 404: 会话不存在
- 500: 服务器内部错误

### 文档处理接口

#### 1. 文档上传

**接口地址**: POST /documents/upload

**功能描述**: 上传文档文件并启动异步处理任务

**请求格式**: multipart/form-data

**请求参数**:

- file (File): 必填，上传的文件
- course_id (string): 必填，课程ID
- course_name (string): 必填，课程名称
- chapter_id (string): 可选，章节ID
- chapter_name (string): 可选，章节名称
- auto_generate (boolean): 可选，是否自动生成，默认true

**支持的文件格式**:

- 文档类型: .docx, .doc, .pdf, .txt
- 视频类型: .mp4, .avi, .mov

**响应结果**:

```
{
  "task_id": "string",              // 处理任务ID
  "status": "processing",           // 处理状态
  "message": "文件上传成功，正在后台处理"  // 状态消息
}
```

**状态码**:

- 200: 上传成功
- 400: 文件类型不支持
- 500: 服务器内部错误

#### 2. 查询处理状态

**接口地址**: GET /documents/status/{task_id}

**功能描述**: 查询文档处理任务的当前状态

**路径参数**:

- task_id (string): 任务ID

**响应结果**:

```json
{
  "task_id": "string",              // 任务ID
  "status": "processing|completed|failed", // 处理状态
  "progress": 75.5,                 // 处理进度 (0-100)
  "message": "string",              // 状态消息
  "result": {                       // 可选，处理结果
    "document_id": "string",
    "extracted_content": "string",
    "metadata": {}
  }
}
```

**状态说明**:

- processing: 正在处理中
- completed: 处理完成
- failed: 处理失败


#### 3. 取消处理任务

**接口地址**: DELETE /documents/tasks/{task_id}

**功能描述**: 取消正在进行的文档处理任务

**路径参数**:

- task_id (string): 任务ID

**响应结果**:

```
{
  "message": "任务已取消"
}
```

## 数据模型

### 用户角色枚举

```
class UserRole(int, Enum):
    USER = 1      # 学生
    TEACHER = 2   # 教师
    ADMIN = 3     # 管理员
```

### 文件类型枚举

```
class FileType(str, Enum):
    WORD = "word"      # Word文档
    VIDEO = "video"    # 视频文件
    AUDIO = "audio"    # 音频文件
    PDF = "pdf"        # PDF文档
    TEXT = "text"      # 文本文件
```

## 错误处理

所有接口都遵循统一的错误响应格式：

```
{
  "detail": "错误描述信息"
}
```

## 使用示例

### 1. 发起对话

```
curl -X POST "http://localhost:8000/api/v1/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "请解释一下机器学习的基本概念",
    "nickname": "张三",
    "role_type": 1,
    "user_id": 123,
    "context": {
      "course_info": {
        "course_id": 456,
        "course_name": "机器学习基础"
      }
    }
  }'
```

### 2. 上传文档

```
curl -X POST "http://localhost:8000/api/v1/documents/upload" \
  -F "file=@document.pdf" \
  -F "course_id=123" \
  -F "course_name=机器学习基础" \
  -F "auto_generate=true"
```

### 3. 查询处理状态

```
curl -X GET "http://localhost:8000/api/v1/documents/status/task-uuid-123"
```
```

