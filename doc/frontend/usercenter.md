# 前端用户中心接口

## 修改用户信息

- **接口地址**：`/edu/frontend/v1/user/update`- **请求方式**：POST
- **请求参数**：

````json
{
  "nickname": "string", // 昵称（可选）
  "sex": "int64", // 性别（可选）
  "avatar": "string", // 头像地址（可选）
  "info": "string" // 个性签名（可选）
}

```text


- **响应参数**：无

## 获取学习总结(AI)

- **接口地址**：`/edu/frontend/v1/user/learning/summary`- **请求方式**：GET
- **请求参数**：无
- **响应参数**：

```json
{
  "code": 200,
  "msg": "成功",
  "data": {
    "title": "string", // 总结标题
    "items": ["string"] // 总结条目列表
  }
}

```text
## 修改密码

- **接口地址**：`/edu/frontend/v1/user/update/password`- **请求方式**：POST
- **请求参数**：

```json
{
  "oldPassword": "string", // 原密码
  "newPassword": "string" // 新密码
}

````

- **响应参数**：无
