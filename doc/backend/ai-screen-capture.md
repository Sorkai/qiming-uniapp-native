# AI 截图提问后端接口文档（单通用接口）

## 概述

截图提问助手统一采用一个通用模型接口。

约束：

- 仅接收 `image + question`。
- 不提供历史记录查询、会话详情、会话删除等接口。
- 前端窗口关闭后自行清空上下文，不做历史保留。

## 基础信息

- 接口地址：`POST /edu/v1/ai/screen/analyze`
- 认证方式：JWT（Bearer Token）
- Content-Type：`application/json`

## 请求参数

```json
{
  "image": "data:image/png;base64,iVBORw0KGgoAAA...",
  "question": "请解释这段内容"
}
```

字段说明：

- `image`: 必填，截图 Base64。
- `question`: 可选，用户问题。

## 响应参数

```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "answer": "这是该截图的分析结果...",
    "suggestions": ["可以继续问什么问题"]
  }
}
```

字段说明：

- `data.answer`: AI 回答内容。
- `data.suggestions`: 可选，建议追问。

## 错误码建议

- `0`: 成功
- `400`: 参数错误（图片缺失或格式不支持）
- `401`: 未授权（Token 无效或过期）
- `413`: 图片过大
- `429`: 请求频率过高
- `500`: AI 服务异常
