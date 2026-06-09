# 视频分析后端接口文档

## 概述

Go 后端提供视频分析管理接口，通过调用 Python AI-Agent 的通义听悟服务实现视频转写、摘要、章节速览等功能。

## 访问边界（重要）

- 用户端（包括管理员）只应调用 Go 后端接口。
- Python AI-Agent 接口（如 `/api/v1/video/analyze`）属于服务间内部调用，不作为用户直连入口。
- 对外鉴权、权限控制与业务编排统一由 Go 后端负责。
- Go 调用 Python 时统一携带 `X-Internal-Api-Key` 请求头；Python 业务接口会校验该值，不匹配直接拒绝。

## 架构流程

```
教师前端 → Go 后端 → Python AI-Agent → 通义听悟
                ↑                    ↓
                └── 回调/轮询 ←──────┘
```

1. 教师通过后端管理接口提交视频分析任务
2. Go 后端调用 Python AI-Agent `/api/v1/video/analyze`
3. Python 异步处理，完成后回调 Go 的 `/edu/v1/video/analyze/callback`
4. Go 收到回调后主动拉取 Python 完整结果存入 MySQL
5. 如果回调未到达，Go 定时任务每 2 分钟轮询兜底

## 并发与一致性（2026-02-19）

- 轮询去重：Go 侧对同一 `taskId` 增加进程内轮询守卫，避免“提交即轮询 + cron 轮询”导致同任务并发轮询协程叠加。
- 原子状态流转：轮询写库改为调用 `TryUpdateStatusFromNonTerminal`，与回调处理保持一致，避免非原子全量更新覆盖已落库状态。
- 终态短路：轮询检测到任务进入 `completed/failed/cancelled` 后立即停止。

## 稳定性加固（2026-02-19）

- 提交参数校验：`filePath` 增加对象键格式校验，拒绝 `..`、反斜杠与绝对路径等非法输入。
- 远端调用健壮性：Go 提交 Python 任务时补充 `http.NewRequestWithContext` 错误处理与非 2xx 状态码校验。
- 去重异常处理：去重查询失败不再忽略；插入失败时增加二次查询兜底并返回已存在进行中任务。
- 任务扫描限流：`FindProcessingTasks` 增加 `ORDER BY id DESC LIMIT 1000`，避免全量扫描压力。
- 回调后台拉取：回调触发的结果拉取改为超时上下文（2 分钟），避免后台 goroutine 无期限阻塞。

## Python 任务状态持久化（重启恢复）

- Python AI-agent 会将视频任务状态持久化到 `video_analysis_task_states`。
- AI-agent 重启后会恢复非终态任务并重新启动轮询兜底，避免“重启后查不到任务状态”。
- Go 侧通过 `taskId` 查询 Python 状态接口时，Python 会优先读内存，未命中则回退读持久化状态。

### 自动触发（当前实现）

- 在“创建课程”“新增章节”“批量重生成知识库（generatePlan）”流程中，若课时资源类型为 `VIDEO`，Go 会自动提交视频分析任务。
- 非视频资源仍走原有文档知识处理链路。
- 手动触发接口 `POST /edu/backend/v1/video/analyze` 保留，用于补偿重跑与运维排障。
- `generatePlan` 批量重生成采用受限并发后台调度（默认并发上限 8），避免大量章节/课时触发时产生无上限 goroutine。

## 后端管理接口（教师/管理员，需 JWT）

### POST /edu/backend/v1/video/analyze

提交视频分析任务。

**请求体：**

```json
{
  "courseId": 1,
  "chapterId": 1,
  "filePath": "course/1/video.mp4",
  "fileName": "video.mp4"
}
```

**响应：**

```json
{
  "code": 200,
  "msg": "OK",
  "data": {
    "taskId": "uuid-string",
    "tingwuTaskId": "tingwu-task-id",
    "status": "submitted",
    "message": "任务已提交"
  }
}
```

### GET /edu/backend/v1/video/analyze/status?taskId=xxx

查询单个任务状态和完整结果。

**响应：**

```json
{
  "code": 200,
  "msg": "OK",
  "data": {
    "taskId": "uuid-string",
    "tingwuTaskId": "tingwu-task-id",
    "status": "completed",
    "progress": 100,
    "message": "",
    "courseId": 1,
    "chapterId": 1,
    "fileName": "video.mp4",
    "transcriptionText": "全文转写...",
    "summary": "摘要...",
    "chaptersJson": "[{\"title\":\"...\",\"summary\":\"...\"}]",
    "qaJson": "[{\"question\":\"...\",\"answer\":\"...\"}]",
    "mindMapUrl": "video_analysis/1/xxx/mind_map.json",
    "pptJson": "[{\"page_index\":0,\"image_url\":\"...\",\"summary\":\"...\"}]",
    "rawResultUrl": "video_analysis/1/xxx/raw_result.json",
    "createdAt": "2026-02-13 10:00:00",
    "completedAt": "2026-02-13 10:30:00"
  }
}
```

### GET /edu/backend/v1/video/analyze/list?courseId=1&chapterId=1

查询课程/章节下的任务列表。`chapterId` 可选，不传则返回课程下所有任务。

**响应：**

```json
{
  "code": 200,
  "msg": "OK",
  "data": {
    "total": 2,
    "tasks": [
      {
        "taskId": "uuid-1",
        "tingwuTaskId": "tingwu-1",
        "status": "completed",
        "progress": 100,
        "message": "",
        "fileName": "video1.mp4",
        "courseId": 1,
        "chapterId": 1,
        "createdAt": "2026-02-13 10:00:00",
        "completedAt": "2026-02-13 10:30:00"
      }
    ]
  }
}
```

## 前端查看接口（学生可访问，需 JWT）

### GET /edu/frontend/v1/video/analyze/result?taskId=xxx

查看视频分析结果。与后端 status 接口类似，但不返回 `rawResultUrl` 等管理字段。

### GET /edu/frontend/v1/video/analyze/result/modules?taskId=xxx&modules=transcription,summary

按模块返回视频分析结果（结构化响应），用于前端按需加载，避免一次性拉取全部数据。

- `taskId`：任务 ID（必填）
- `modules`：可选，逗号分隔；支持：
  - `transcription`（语音转写）
  - `summary`（全文摘要）
  - `chapters`（章节速览）
  - `qa`（问答回顾）
  - `mindmap`（思维导图）
  - `ppt`（PPT 抽取及讲解摘要）
  - `meeting`（要点提炼：关键词、重点内容）

`modules` 的响应顺序与请求顺序保持一致（仅去重和过滤空白），便于前端按传入顺序渲染。

当 `modules` 为空时，默认返回：`transcription,summary,chapters,qa,mindmap,ppt`。

**响应示例（data）**：

```json
{
  "taskId": "uuid-string",
  "status": "completed",
  "courseId": 1,
  "chapterId": 1,
  "fileName": "video.mp4",
  "createdAt": "2026-02-13 10:00:00",
  "completedAt": "2026-02-13 10:30:00",
  "schemaVersion": "videoAnalysis.v2",
  "modules": ["chapters", "summary"],
  "moduleStatus": {
    "chapters": "ready",
    "summary": "ready"
  },
  "summary": {"text": "全文摘要..."},
  "chapters": [
    {"title": "章节1", "summary": "...", "startTime": 0, "endTime": 60000}
  ]
}
```

`moduleStatus` 取值说明：`ready` / `empty` / `parse_error` / `unsupported` / `unknown`。

注意：实际 HTTP 响应仍为统一外层结构：`{"code":200,"msg":"OK","data":{...}}`。

## 内部回调接口（无 JWT，Python → Go）

### POST /edu/v1/video/analyze/callback?token=xxx

Python AI-Agent 完成视频分析后回调此端点。

> 可靠性补充（2026-02-19）：回调请求体在 Go 侧限制为 1MB，超过将直接返回 `400`，用于降低异常大请求导致的资源消耗风险。

**安全验证：** URL 参数 `token` 与数据库中该任务的随机 `callback_token` 比对（每次提交任务时 Go 自动生成并传给 Python）。

**回调地址由 Python 端配置**（`tingwu.go_callback_url`），Go 只传随机 `callback_token`，Python 回调时自行拼接 `go_callback_url?token=xxx`。

**请求体：**

```json
{
  "task_id": "uuid-string",
  "status": "completed",
  "message": "分析完成",
  "result_url": "/api/v1/video/analyze/uuid-string"
}
```

**响应：**

```json
{"status": "ok"}
```

## 配置说明

在 `app/api/etc/aieduapi.yaml` 中添加：

```yaml
AIAgent:
  BaseURL: "http://10.2.0.10:8000/api/v1"

VideoAnalysis:
  BaseURL: "http://10.2.0.10:8000/api/v1/video"
  RequestTimeout: 30
  Poll:
    IntervalSec: 30
    MaxAttempts: 360
```

其中：

- `AIAgent.BaseURL` 用于知识点/习题/文档处理等通用接口地址（P1 去硬编码后统一从配置读取）。
- `VideoAnalysis.BaseURL` 用于视频分析专用接口（`/video/*`）。
- 内部鉴权 Key 需在两端配置并保持一致：Go 端 `InternalAuth.ApiKey`，Python 端 `model_config*.yaml` 的 `internal_auth.api_key`。

在 Python AI-Agent 的 `model_config.slim.yaml`（或 `model_config.yaml`）中配置 Go 回调地址：

```yaml
tingwu:
  # Go 后端回调地址（Python 完成分析后主动通知 Go）
  go_callback_url: "http://<go-host>:<go-port>/edu/v1/video/analyze/callback"
```

> **注意**：回调路径 `/edu/v1/video/analyze/callback` 是 Go 代码中硬编码的路由，不可更改。每次提交任务时 Go 会生成随机 `callback_token` 传给 Python，Python 回调时附带 `?token=xxx` 参数验证身份。

## 数据库

自动迁移创建并演进 `video_analysis_tasks` 表，当前相关迁移包括：

- `20260213_001`：建表
- `20260214_001`：新增 `callback_token`
- `20260222_001`：新增要点提炼字段 `meeting_keywords_json`、`meeting_key_info_json`

## 任务状态流转

```
pending → submitted → processing → completed
                                  → failed
                                  → cancelled
```

## 要点提炼能力现状（2026-02-22）

- 当前 Go 前端模块化接口已支持要点提炼中的“关键词、重点内容”两类数据。
- `meeting` 模块返回结构：
  - `meeting.keywords: string[]`
  - `meeting.keyInformation: string[]`
- 本期未接入“待办事项（Actions）”，后续按业务需要可继续扩展。
