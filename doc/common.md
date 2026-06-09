# 通用接口

## 系统登录

- **接口地址**：`/login`- **请求方式**：POST
- **请求参数**：

````json
{
  "username": "admin",
  "password": "password"
}

```text


- **响应参数**：

```json
{
  "success": true,
  "data": {
    "avatar": "string",
    "username": "string",
    "nickname": "string",
    "roles": ["string"],
    "permissions": ["string"],
    "accessToken": "string",
    "refreshToken": "string",
    "expires": "string"
  }
}

```text
## 刷新 Token

- **接口地址**：`/refresh-token`- **请求方式**：POST
- **请求参数**：

```json
{
  "refreshToken": "string"
}

```text


- **响应参数**：

```json
{
  "success": true,
  "data": {
    "accessToken": "string",
    "refreshToken": "string",
    "expires": "string"
  }
}

```text
## 获取 PPT Token

- **接口地址**：`/edu/v1/user/get/ppt/token`- **请求方式**：POST
- **请求参数**：无
- **响应参数**：

```json
{
  "code": 200,
  "msg": "成功",
  "data": {
    "token": "string", // PPT生成token
    "expire": 1734870000 // 过期时间戳
  }
}

```text
## 用户注册

- **接口地址**：`/edu/v1/user/register`- **请求方式**：POST
- **请求参数**：

```json
{
  "mobile": "string", // 手机号
  "password": "string" // 密码
}

```text


- **响应参数**：

```json
{
  "accessToken": "string", // 访问token
  "accessExpire": "int64", // 过期时间
  "refreshAfter": "int64" // 刷新时间
}

```text
## 用户登录

- **接口地址**：`/edu/v1/user/login`- **请求方式**：POST
- **请求参数**：

```json
{
  "mobile": "string", // 手机号
  "password": "string" // 密码
}

```text


- **响应参数**：

```json
{
  "accessToken": "string", // 访问token
  "accessExpire": "int64", // 过期时间
  "refreshAfter": "int64" // 刷新时间
}

```text
## 获取用户详情

- **接口地址**：`/edu/v1/user/detail`- **请求方式**：POST
- **请求参数**：无
- **响应参数**：

```json
{
  "userInfo": {
    "id": "int64", // 用户id
    "mobile": "string", // 手机号
    "nickname": "string", // 昵称
    "sex": "int64", // 性别
    "avatar": "string", // 头像
    "info": "string", // 个性签名
    "roleType": "int64" // 角色类型 1:学生 2:教师 3:管理员
  }
}

```text
## 文件上传

- **接口地址**：`/edu/v1/user/upload`- **请求方式**：POST
- **请求参数**：

```text
fileField: string  // 文件字段名，默认是file

```text


- **响应参数**：

```json
{
  "url": "string", // 文件地址
  "fileId": "int64" // 文件id
}

````
