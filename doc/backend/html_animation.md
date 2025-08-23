# HTML 动画接口

## 说明
封装远端 `html_api` (BaseURL: 配置 `HtmlAnimation.BaseURL`) 提供的动画生成 / 查询 / 版本展示能力，并持久化本地数据库。

## 权限
- 生成、列表、设置展示版本、强制同步：教师(2)、管理员(3)
- 获取展示：学生/教师/管理员 (1/2/3)

## 接口列表
| 接口 | 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|------|
| 生成动画 | POST | /edu/backend/v1/html-animation/generate | 教师/管理员 | 触发生成任务，异步轮询更新状态 |
| 动画列表 | GET | /edu/backend/v1/html-animation/list | 教师/管理员 | 章节全部任务(成功/进行中/失败) + 展示版本 |
| 设置展示版本 | POST | /edu/backend/v1/html-animation/display/set | 教师/管理员 | 设置章节展示版本(具体数字或 latest) |
| 强制同步 | POST | /edu/backend/v1/html-animation/sync | 教师/管理员 | 遍历所有章节同步远端成功版本 |
| 获取展示动画 | GET | /edu/frontend/v1/html-animation/display | 学生/教师/管理员 | 返回当前展示版本文件URL |

## 数据字段
- 展示版本 displayVersionRaw：数据库保存值（可能为 latest）
- displayVersionResolved：若为 latest 且存在版本，解析为最大版本号
- 文件访问 URL = `MiniDomain + BucketName + "/" + object_name`

## 生成动画
### Request
```json
POST /edu/backend/v1/html-animation/generate
{
  "courseId": 3,
  "chapterId": 11
}
```
### Response
```json
{
  "courseId":3,
  "chapterId":11,
  "taskId":"10ef1887-...",
  "status":"processing",
  "message":"HTML动画生成任务已启动"
}
```

## 动画列表
### Request
`GET /edu/backend/v1/html-animation/list?courseId=3&chapterId=11`
### Response 示例
```json
{
  "courseId":3,
  "chapterId":11,
  "tasks":[
    {"taskId":"10ef...","status":"completed","version":3,"fileName":"v3_....html","objectName":"html_animations/3/11/v3_....html","fileUrl":"https://aiedu-file.lehinet.com/ai-edu-bucket/html_animations/3/11/v3_....html","fileSize":14001,"errorMessage":"","createdAt":"2025-08-22T22:57:37","updatedAt":"2025-08-22T22:58:21","completedAt":"2025-08-22T22:58:21"},
    {"taskId":"10ef...","status":"processing","version":0,"fileName":"","objectName":"","fileUrl":"","fileSize":0,"errorMessage":"","createdAt":"2025-08-23T10:00:00","updatedAt":"2025-08-23T10:00:00","completedAt":""}
  ],
  "displayVersionRaw":"latest",
  "displayVersionResolved":"3"
}
```

## 设置展示版本
```json
POST /edu/backend/v1/html-animation/display/set
{
  "courseId":3,
  "chapterId":11,
  "version":"latest"   // 或 "3"
}
```

## 强制同步
```json
POST /edu/backend/v1/html-animation/sync
{}
```
Response: `{"totalChapters":120,"successChapters":115}`

## 获取展示动画
`GET /edu/frontend/v1/html-animation/display?courseId=3&chapterId=11`
```json
{
  "courseId":3,
  "chapterId":11,
  "version":"3",
  "url":"https://aiedu-file.lehinet.com/ai-edu-bucket/html_animations/3/11/v3_xxxx.html"
}
```

### 无配置或无版本时的响应示例

- 未配置展示版本（HTTP 404）
```json
HTTP/1.1 404 Not Found
{
  "code": 404,
  "message": "尚未配置展示版本",
  "suggest": "请联系教师或触发生成"
}
```

- 已配置为 latest 但无可用版本（HTTP 200，available=false）
```json
HTTP/1.1 200 OK
{
  "available": false,
  "message": "无可用HTML动画版本"
}
```

- 目标版本元数据存在但对象缺失（HTTP 404）
```json
HTTP/1.1 404 Not Found
{
  "code": 404,
  "message": "版本对象不存在"
}
```

## Curl 示例 (PowerShell)
```powershell
$TOKEN = "<登录获得的token>"
# 生成
curl -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" `
  -d '{"courseId":3,"chapterId":11}' `
  http://localhost:1004/edu/backend/v1/html-animation/generate

# 列表
curl -H "Authorization: Bearer $TOKEN" `
  "http://localhost:1004/edu/backend/v1/html-animation/list?courseId=3&chapterId=11"

# 设置展示版本
curl -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" `
  -d '{"courseId":3,"chapterId":11,"version":"latest"}' `
  http://localhost:1004/edu/backend/v1/html-animation/display/set

# 获取展示
curl -H "Authorization: Bearer $TOKEN" `
  "http://localhost:1004/edu/frontend/v1/html-animation/display?courseId=3&chapterId=11"
```

## 注意
1. 第一次章节出现成功版本且展示表无记录时（生成轮询或同步）会自动写入 `latest`。
2. 生成接口具有去重：若已有 `pending/processing` 任务会直接返回现有任务信息不再触发远端。
3. 强制同步会跳过已存在的版本记录（按版本号去重）。
4. 轮询采用：启动任务后按配置 (`HtmlAnimation.Poll.IntervalSec/MaxAttempts`) 进行；兜底 cron 每分钟扫描未完成任务。
5. 失败任务会在任务表中记录 `status=failed` 与 `error_message`。
