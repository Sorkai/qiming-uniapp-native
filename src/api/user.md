# 用户中心接口文档

## 目录

- [用户注册](#用户注册)
- [用户登录](#用户登录)
- [获取用户信息](#获取用户信息)
- [文件上传](#文件上传)
- [获取文件列表](#获取文件列表)
- [获取用户列表](#获取用户列表)

## 接口详情

### 用户注册

- **接口地址**：`/usercenter/v1/user/register`
- **请求方式**：POST
- **请求参数**：

| 参数名 | 类型 | 必填 | 描述 |
| ------ | ---- | ---- | ---- |
| mobile | string | 是 | 手机号 |
| password | string | 是 | 密码 |

- **响应参数**：

| 参数名 | 类型 | 描述 |
| ------ | ---- | ---- |
| accessToken | string | 访问token |
| accessExpire | int64 | 过期时间 |
| refreshAfter | int64 | 刷新时间 |

### 用户登录

- **接口地址**：`/usercenter/v1/user/login`
- **请求方式**：POST
- **请求参数**：

| 参数名 | 类型 | 必填 | 描述 |
| ------ | ---- | ---- | ---- |
| mobile | string | 是 | 手机号 |
| password | string | 是 | 密码 |

- **响应参数**：

| 参数名 | 类型 | 描述 |
| ------ | ---- | ---- |
| accessToken | string | 访问token |
| accessExpire | int64 | 过期时间 |
| refreshAfter | int64 | 刷新时间 |

### 获取用户信息

- **接口地址**：`/usercenter/v1/user/detail`
- **请求方式**：POST
- **请求参数**：无
- **响应参数**：

| 参数名 | 类型 | 描述 |
| ------ | ---- | ---- |
| userInfo | object | 用户信息 |
| userInfo.id | int64 | 用户id |
| userInfo.mobile | string | 手机号 |
| userInfo.nickname | string | 昵称 |
| userInfo.sex | int64 | 性别 |
| userInfo.avatar | string | 头像 |
| userInfo.info | string | 个性签名 |
| userInfo.roleType | int64 | 角色类型 |

### 文件上传

- **接口地址**：`/usercenter/v1/user/upload`
- **请求方式**：POST
- **请求参数**：

| 参数名 | 类型 | 必填 | 描述 |
| ------ | ---- | ---- | ---- |
| fileField | string | 否 | 文件字段名，默认是file |

- **响应参数**：

| 参数名 | 类型 | 描述 |
| ------ | ---- | ---- |
| url | string | 文件地址 |
| fileId | int64 | 文件id |

### 获取文件列表

- **接口地址**：`/usercenter/v1/user/file/list`
- **请求方式**：GET
- **请求参数**：

| 参数名 | 类型 | 必填 | 描述 |
| ------ | ---- | ---- | ---- |
| pageNum | int64 | 是 | 页码 |
| pageSize | int64 | 否 | 每页数量，默认20 |

- **响应参数**：

| 参数名 | 类型 | 描述 |
| ------ | ---- | ---- |
| total | int64 | 总数 |
| fileList | array | 文件列表 |
| fileList[].fileId | int64 | 文件id |
| fileList[].fileUrl | string | 文件地址 |
| fileList[].fileName | string | 文件名 |
| fileList[].extension | string | 文件后缀 |
| fileList[].size | int64 | 文件大小 |
| fileList[].resourceType | string | 资源类型 |

### 获取用户列表

- **接口地址**：`/usercenter/v1/user/list`
- **请求方式**：GET
- **请求参数**：

| 参数名 | 类型 | 必填 | 描述 |
| ------ | ---- | ---- | ---- |
| pageNum | int64 | 是 | 页码 |
| pageSize | int64 | 否 | 每页数量，默认20 |

- **响应参数**：

| 参数名 | 类型 | 描述 |
| ------ | ---- | ---- |
| total | int64 | 总数 |
| userList | array | 用户列表 |
| userList[].id | int64 | 用户id |
| userList[].mobile | string | 手机号 |
| userList[].nickname | string | 昵称 |
| userList[].sex | int64 | 性别 |
| userList[].avatar | string | 头像 |
| userList[].info | string | 个性签名 |
| userList[].roleType | int64 | 角色类型 |