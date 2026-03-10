# AI截屏提问助手（前端输入/输出）

## 1. 接口

- Method: `POST`
- URL: `/edu/v1/ai/screen/analyze`
- Auth: `Bearer Token (JWT)`
- Content-Type: `application/json`

## 2. 请求体（前端发送）

```json
{
  "image": "data:image/png;base64,iVBORw0KGgoAAA...",
  "question": "请解释这段内容"
}
```

字段说明：

- `image`: `string`，必填，Base64图片
- `question`: `string`，可选，用户问题

## 3. 成功响应体（前端期望）

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

- `code`: `number`
- `msg`: `string`
- `data.answer`: `string`
- `data.suggestions`: `string[]`（可选）

## 4. 失败响应体（前端兜底）

```json
{
  "code": 400,
  "msg": "参数错误",
  "data": null
}
```

常见错误码：`400`、`401`、`413`、`429`、`500`
