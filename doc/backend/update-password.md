#学生端修改密码接口

## 接口信息

- **请求地址**: `POST /api/edu/frontend/v1/user/update/password`
- **请求方式**: POST
- **Content-Type**: application/json

## 请求参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| oldPassword | string | 是 | 原密码 |
| newPassword | string | 是 | 新密码 |

### 请求示例

```json
{
  "oldPassword": "oldPass123",
  "newPassword": "newPass456"
}
```

## 后端需要实现的验证逻辑

### ✅ 必须实现

| 序号 | 验证项 | 错误码 | 错误信息 | 说明 |
|------|--------|--------|----------|------|
| 1 | 用户登录状态验证 | 401 | 用户未登录或登录已过期 | 验证Token有效性 |
| 2 | 原密码是否正确 | 400 | 原密码错误 | 对比数据库中的加密密码 |
| 3 | 新密码与原密码不能相同 | 400 | 新密码不能与原密码相同 | 确保密码有变化 |
| 4 | 新密码长度验证 | 400 | 密码长度需在6-70位之间 | 前端已验证，后端需再次验证 |
| 5 | 新密码不能为空 | 400 | 新密码不能为空 | 基础验证 |

### ⚠️ 建议实现

| 序号 | 验证项 | 错误码 | 错误信息 | 说明 |
|------|--------|--------|----------|------|
| 1 | 密码复杂度验证 | 400 | 密码需包含字母和数字 | 可选，提升安全性 |
| 2 | 密码修改频率限制 | 429 | 密码修改过于频繁，请稍后再试 | 防止暴力破解 |
| 3 | 密码历史记录检查 | 400 | 新密码不能与最近N次密码相同 | 高安全性场景 |

## 响应格式

### 成功响应

```json
{
  "code": 200,
  "msg": "密码修改成功",
  "data": null
}
```

### 失败响应示例

#### 原密码错误
```json
{
  "code": 400,
  "msg": "原密码错误",
  "data": null
}
```

#### 新旧密码相同
```json
{
  "code": 400,
  "msg": "新密码不能与原密码相同",
  "data": null
}
```

#### 用户未登录
```json
{
  "code": 401,
  "msg": "用户未登录或登录已过期",
  "data": null
}
```

#### 系统错误
```json
{
  "code": 500,
  "msg": "系统错误，请稍后重试",
  "data": null
}
```

## 后端实现参考（伪代码）

```go
func UpdatePassword(ctx *gin.Context) {
    // 1. 获取当前登录用户
    userId := GetCurrentUserId(ctx)
    if userId == 0 {
        ctx.JSON(401, Response{Code: 401, Msg: "用户未登录或登录已过期"})
        return
    }

    // 2. 解析请求参数
    var req UpdatePasswordRequest
    if err := ctx.ShouldBindJSON(&req); err != nil {
        ctx.JSON(400, Response{Code: 400, Msg: "参数错误"})
        return
    }

    // 3. 验证参数
    if req.NewPassword == "" {
        ctx.JSON(400, Response{Code: 400, Msg: "新密码不能为空"})
        return
    }
    if len(req.NewPassword) < 6 || len(req.NewPassword) > 70 {
        ctx.JSON(400, Response{Code: 400, Msg: "密码长度需在6-70位之间"})
        return
    }

    // 4. 获取用户信息
    user, err := GetUserById(userId)
    if err != nil {
        ctx.JSON(500, Response{Code: 500, Msg: "系统错误"})
        return
    }

    // 5. 验证原密码是否正确
    if !VerifyPassword(req.OldPassword, user.Password) {
        ctx.JSON(400, Response{Code: 400, Msg: "原密码错误"})
        return
    }

    // 6. 验证新密码与原密码不能相同
    if VerifyPassword(req.NewPassword, user.Password) {
        ctx.JSON(400, Response{Code: 400, Msg: "新密码不能与原密码相同"})
        return
    }

    // 7. 更新密码
    hashedPassword := HashPassword(req.NewPassword)
    if err := UpdateUserPassword(userId, hashedPassword); err != nil {
        ctx.JSON(500, Response{Code: 500, Msg: "密码修改失败"})
        return
    }

    // 8. 成功响应
    ctx.JSON(200, Response{Code: 200, Msg: "密码修改成功"})
}
```

## 前端已实现的验证

前端组件 `src/components/ReAccountSettings/index.vue` 已实现以下验证：

| 验证项 | 状态 |
|--------|------|
| 原密码必填 | ✅ |
| 新密码必填 | ✅ |
| 新密码最小长度6位 | ✅ |
| 新密码最大长度70位 | ✅ |
| 两次新密码一致性| ✅ |
| 新密码与原密码不能相同 | ✅ |
| 密码强度显示 | ✅ |

## 当前问题

用户反馈调用接口时返回"系统错误"，请后端排查：

1. 检查接口是否正确部署
2. 检查数据库连接是否正常
3. 检查日志中的具体错误信息
4. 确认用户Token验证逻辑是否正确
5. 确认密码加密/验证逻辑是否正确

## 更新日期

2026-01-21
