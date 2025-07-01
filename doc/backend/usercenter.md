# 后端用户中心接口

## 获取文件列表

- **接口地址**：`/edu/backend/v1/user/file/list`
- **请求方式**：GET
- **请求参数**：

```
pageNum: int64    // 页码
pageSize: int64   // 每页数量，默认20
```

- **响应参数**：

```json
{
  "total": "int64",      // 总数
  "fileList": [         // 文件列表
    {
      "fileId": "int64",      // 文件id
      "fileUrl": "string",    // 文件地址
      "fileName": "string",   // 文件名
      "extension": "string",  // 文件后缀
      "size": "int64",        // 文件大小
      "resourceType": "string" // 资源类型
    }
  ]
}
```

## 获取用户列表

- **接口地址**：`/edu/backend/v1/user/list`
- **请求方式**：GET
- **请求参数**：

```
pageNum: int64    // 页码
pageSize: int64   // 每页数量，默认20
```

- **响应参数**：

```json
{
  "total": "int64",      // 总数
  "userList": [         // 用户列表
    {
      "id": "int64",          // 用户id
      "mobile": "string",     // 手机号
      "nickname": "string",   // 昵称
      "sex": "int64",         // 性别
      "avatar": "string",     // 头像
      "info": "string",       // 个性签名
      "roleType": "int64"     // 角色类型
    }
  ]
}
```

## 修改用户角色

- **接口地址**：`/edu/backend/v1/user/update/role`
- **请求方式**: POST
- **请求参数**：

```json
{
  "targetUserId": "int64",         // 目标用户ID
  "roleType": "strint64ing"           // 角色类型 1:学生 2:教师 3:管理员
}
```

- **响应参数**：无