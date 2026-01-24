# 课程讨论区 API 接口文档

## 概述

本文档描述课程讨论区（问答/留言板）功能的后端 API 接口设计，覆盖**学生端**、**教师端**和**管理员端**三个平台的功能需求。

### 功能概述

课程讨论区为学生和教师提供课程相关问题的交流平台，支持：
- 📝 发布讨论帖子（支持 Markdown）
- 💬 多级回复（支持楼中楼）
- 👍 点赞互动
- 🔖 标签分类
- 📌 教师/管理员置顶
- 🛡️ 内容审核与敏感词过滤
- 🚨 举报机制
- 📊 数据统计与分析（管理端）
- ⚙️ 敏感词管理（管理端）

---

## 平台角色与权限

### 角色定义

| 角色 | 标识 | 说明 |
|------|------|------|
| 学生 | `student` | 普通学生用户，可发帖、回复、点赞、举报 |
| 教师 | `teacher` | 课程教师，额外拥有置顶、审核本课程讨论的权限 |
| 管理员 | `admin` | 系统管理员，拥有全局管理权限 |

### 权限矩阵

| 功能 | 学生 | 教师 | 管理员 |
|------|:----:|:----:|:------:|
| 查看讨论列表 | ✅ | ✅ | ✅ |
| 发布讨论 | ✅ | ✅ | ✅ |
| 编辑自己的讨论 | ✅ | ✅ | ✅ |
| 删除自己的讨论 | ✅ | ✅ | ✅ |
| 发布/删除回复 | ✅ | ✅ | ✅ |
| 点赞/取消点赞 | ✅ | ✅ | ✅ |
| 举报内容 | ✅ | ✅ | ✅ |
| 置顶/取消置顶 | ❌ | ✅ | ✅ |
| 审核内容 | ❌ | ✅ | ✅ |
| 删除他人讨论/回复 | ❌ | ✅ | ✅ |
| 查看审核队列 | ❌ | ✅ | ✅ |
| 查看举报列表 | ❌ | ✅ | ✅ |
| 管理敏感词 | ❌ | ❌ | ✅ |
| 查看全局统计 | ❌ | ❌ | ✅ |
| 管理用户信誉 | ❌ | ❌ | ✅ |
| 批量操作 | ❌ | ❌ | ✅ |

---

## 前端页面规划

### 学生端页面

| 页面路径 | 文件位置 | 说明 | 状态 |
|---------|---------|------|------|
| 课程问答 | `src/views/account/course-detail/CourseQA.vue` | 课程问答主页面 | ✅ 已完成 |

### 教师端页面

| 页面路径 | 文件位置 | 说明 | 状态 |
|---------|-------------|------|------|
| 课程讨论管理 | `src/views/course/discussion/index.vue` | 教师管理所授课程的讨论，含统计卡片、搜索、批量操作、数据表格 | ✅ 已完成 |
| 内容审核队列 | `src/views/course/discussion/review.vue` | 审核待审核内容，显示风险等级、敏感词匹配，支持批量审核 | ✅ 已完成 |
| 举报处理 | `src/views/course/discussion/reports.vue` | 处理学生举报的内容，支持快速忽略/删除、详细处理 | ✅ 已完成 |

### 管理员端页面

| 页面路径 | 文件位置 | 说明 | 状态 |
|---------|-------------|------|------|
| 敏感词管理 | `src/views/system/discussion/sensitive-words.vue` | 敏感词库管理，支持添加、编辑、删除、批量导入导出 | ✅ 已完成 |
| 用户信誉管理 | `src/views/system/discussion/user-reputation.vue` | 用户信誉分管理，含信誉分调整、禁言/解禁功能 | ✅ 已完成 |
| 讨论统计 | `src/views/system/discussion/statistics.vue` | 全平台讨论数据统计仪表盘，含趋势图、排行榜 | ✅ 已完成 |
| 全局讨论管理 | `src/views/system/discussion/index.vue` | 全局讨论管理（可复用教师端） | 🔴 待开发 |
| 审计日志 | `src/views/system/discussion/audit-logs.vue` | 操作审计日志 | 🔴 待开发 |

### 前端 API 文件

| 文件路径 | 说明 | 状态 |
|---------|------|------|
| `src/api/discussion.ts` | 学生端讨论 API | ✅ 已完成 |
| `src/api/discussion-admin.ts` | 管理端讨论 API，含审核、举报、敏感词、用户信誉、统计等接口 | ✅ 已完成 |

---

## 目录

1. [数据模型](#数据模型)
2. [API 接口清单](#api-接口清单)
3. [API 接口详情](#api-接口详情)
4. [敏感词检测](#敏感词检测)
5. [内容审核机制](#内容审核机制)
6. [安全防护](#安全防护)
7. [错误码定义](#错误码定义)
8. [数据库表设计](#数据库表设计参考)

---

## API 接口清单

### 学生端接口

| 序号 | 接口名称 | 方法 | 路径 | 权限 | 状态 |
|------|---------|------|------|------|------|
| 1 | [获取讨论列表](#1-获取讨论列表) | GET | `/api/v1/courses/{courseId}/discussions` | 登录用户 | 🔴 待开发 |
| 2 | [获取讨论详情](#2-获取讨论详情) | GET | `/api/v1/discussions/{postId}` | 登录用户 | 🔴 待开发 |
| 3 | [发布讨论](#3-发布讨论) | POST | `/api/v1/courses/{courseId}/discussions` | 登录用户 | 🔴 待开发 |
| 4 | [编辑讨论](#4-编辑讨论) | PUT | `/api/v1/discussions/{postId}` | 作者/管理员 | 🔴 待开发 |
| 5 | [删除讨论](#5-删除讨论) | DELETE | `/api/v1/discussions/{postId}` | 作者/管理员 | 🔴 待开发 |
| 6 | [获取回复列表](#6-获取回复列表) | GET | `/api/v1/discussions/{postId}/replies` | 登录用户 | 🔴 待开发 |
| 7 | [发布回复](#7-发布回复) | POST | `/api/v1/discussions/{postId}/replies` | 登录用户 | 🔴 待开发 |
| 8 | [删除回复](#8-删除回复) | DELETE | `/api/v1/discussions/{postId}/replies/{replyId}` | 作者/管理员 | 🔴 待开发 |
| 9 | [点赞帖子](#9-点赞帖子) | POST | `/api/v1/discussions/{postId}/like` | 登录用户 | 🔴 待开发 |
| 10 | [取消点赞帖子](#10-取消点赞帖子) | DELETE | `/api/v1/discussions/{postId}/like` | 登录用户 | 🔴 待开发 |
| 11 | [点赞回复](#11-点赞回复) | POST | `/api/v1/discussions/{postId}/replies/{replyId}/like` | 登录用户 | 🔴 待开发 |
| 12 | [取消点赞回复](#12-取消点赞回复) | DELETE | `/api/v1/discussions/{postId}/replies/{replyId}/like` | 登录用户 | 🔴 待开发 |
| 13 | [举报帖子](#13-举报帖子) | POST | `/api/v1/discussions/{postId}/report` | 登录用户 | 🔴 待开发 |
| 14 | [举报回复](#14-举报回复) | POST | `/api/v1/discussions/{postId}/replies/{replyId}/report` | 登录用户 | 🔴 待开发 |
| 18 | [获取统计数据](#18-获取统计数据) | GET | `/api/v1/courses/{courseId}/discussions/stats` | 登录用户 | 🔴 待开发 |
| 19 | [获取热门标签](#19-获取热门标签) | GET | `/api/v1/courses/{courseId}/discussions/tags` | 登录用户 | 🔴 待开发 |

### 教师端专属接口

| 序号 | 接口名称 | 方法 | 路径 | 权限 | 状态 |
|------|---------|------|------|------|------|
| T1 | [获取教师课程讨论列表](#t1-获取教师课程讨论列表) | GET | `/api/v1/teacher/discussions` | 教师 | 🔴 待开发 |
| T2 | [获取教师课程统计](#t2-获取教师课程统计) | GET | `/api/v1/teacher/discussions/stats` | 教师 | 🔴 待开发 |

### 教师/管理员端接口

| 序号 | 接口名称 | 方法 | 路径 | 权限 | 状态 |
|------|---------|------|------|------|------|
| 15 | [置顶帖子](#15-置顶帖子) | POST | `/api/v1/discussions/{postId}/pin` | 教师/管理员 | 🔴 待开发 |
| 16 | [取消置顶](#16-取消置顶) | DELETE | `/api/v1/discussions/{postId}/pin` | 教师/管理员 | 🔴 待开发 |
| 17 | [审核帖子](#17-审核帖子) | POST | `/api/v1/discussions/{postId}/review` | 教师/管理员 | 🔴 待开发 |
| 20 | [获取审核队列](#20-获取审核队列) | GET | `/api/v1/admin/discussions/review-queue` | 教师/管理员 | 🔴 待开发 |
| 21 | [获取举报列表](#21-获取举报列表) | GET | `/api/v1/admin/discussions/reports` | 教师/管理员 | 🔴 待开发 |
| 22 | [处理举报](#22-处理举报) | POST | `/api/v1/admin/discussions/reports/{reportId}/handle` | 教师/管理员 | 🔴 待开发 |
| 23 | [批量审核](#23-批量审核) | POST | `/api/v1/admin/discussions/batch-review` | 教师/管理员 | 🔴 待开发 |
| 24 | [批量删除](#24-批量删除) | POST | `/api/v1/admin/discussions/batch-delete` | 教师/管理员 | 🔴 待开发 |

### 管理员专属接口

| 序号 | 接口名称 | 方法 | 路径 | 权限 | 状态 |
|------|---------|------|------|------|------|
| 25 | [获取敏感词列表](#25-获取敏感词列表) | GET | `/api/v1/admin/sensitive-words` | 管理员 | 🔴 待开发 |
| 26 | [添加敏感词](#26-添加敏感词) | POST | `/api/v1/admin/sensitive-words` | 管理员 | 🔴 待开发 |
| 27 | [编辑敏感词](#27-编辑敏感词) | PUT | `/api/v1/admin/sensitive-words/{wordId}` | 管理员 | 🔴 待开发 |
| 28 | [删除敏感词](#28-删除敏感词) | DELETE | `/api/v1/admin/sensitive-words/{wordId}` | 管理员 | 🔴 待开发 |
| 29 | [批量导入敏感词](#29-批量导入敏感词) | POST | `/api/v1/admin/sensitive-words/import` | 管理员 | 🔴 待开发 |
| 30 | [获取用户信誉列表](#30-获取用户信誉列表) | GET | `/api/v1/admin/user-reputation` | 管理员 | 🔴 待开发 |
| 31 | [调整用户信誉](#31-调整用户信誉) | PUT | `/api/v1/admin/user-reputation/{userId}` | 管理员 | 🔴 待开发 |
| 32 | [获取审计日志](#32-获取审计日志) | GET | `/api/v1/admin/discussions/audit-logs` | 管理员 | 🔴 待开发 |
| 33 | [获取全局统计](#33-获取全局统计) | GET | `/api/v1/admin/discussions/statistics` | 管理员 | 🔴 待开发 |

> 图例：🟢 已完成 | 🟡 开发中 | 🔴 待开发

---

## 数据模型

### 讨论帖子 (Discussion Post)

```typescript
interface DiscussionPost {
  id: string;                    // 帖子唯一ID
  courseId: string;              // 所属课程ID
  authorId: string;              // 作者用户ID
  title?: string;                // 标题（可选）
  content: string;               // 内容（支持 Markdown）
  contentHtml: string;           // 渲染后的 HTML（后端处理 XSS）
  tags: string[];                // 标签列表
  status: PostStatus;            // 审核状态
  reviewNote?: string;           // 审核备注（拒绝原因）
  isPinned: boolean;             // 是否置顶
  likeCount: number;             // 点赞数
  replyCount: number;            // 回复数
  viewCount: number;             // 浏览数
  createdAt: string;             // 创建时间(ISO 8601)
  updatedAt: string;             // 更新时间
  editedAt?: string;             // 最后编辑时间
  deletedAt?: string;            // 软删除时间
}

enum PostStatus {
  PENDING = 'pending',           // 待审核
  APPROVED = 'approved',         // 已通过
  REJECTED = 'rejected',         // 已拒绝
  AUTO_APPROVED = 'auto_approved' // 自动通过（可信用户）
}
```

### 回复 (Reply)

```typescript
interface Reply {
  id: string;                    // 回复唯一ID
  postId: string;                // 所属帖子ID
  authorId: string;              // 作者用户ID
  parentReplyId?: string;        // 父回复ID（用于嵌套回复）
  replyToUserId?: string;        // 回复目标用户ID
  content: string;               // 内容
  contentHtml: string;           // 渲染后的 HTML
  status: PostStatus;            // 审核状态
  likeCount: number;             // 点赞数
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}
```

### 用户互动记录 (UserInteraction)

```typescript
interface UserInteraction {
  id: string;
  userId: string;
  targetType: 'post' | 'reply';
  targetId: string;
  interactionType: 'like' | 'report';
  reportReason?: string;         // 举报原因
  createdAt: string;
}
```

### 审核记录 (AuditLog)

```typescript
interface AuditLog {
  id: string;
  targetType: 'post' | 'reply';
  targetId: string;
  action: 'approve' | 'reject' | 'delete' | 'pin' | 'unpin';
  operatorId: string;            // 操作人ID
  operatorRole: 'system' | 'admin' | 'teacher';
  reason?: string;
  previousStatus?: PostStatus;
  newStatus?: PostStatus;
  createdAt: string;
}
```

---

## API 接口详情

### 1. 获取讨论列表

**GET** `/api/v1/courses/{courseId}/discussions`

**前端调用位置**: `src/api/discussion.ts` - `getDiscussions()`

**使用场景**: 进入课程问答页面时加载讨论列表，支持分页、搜索、筛选

#### 请求参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| courseId | string | ✅ 是 | - | 课程ID (路径参数) |
| page | number | 否 | 1 | 页码，从1开始 |
| pageSize | number | 否 | 20 | 每页数量，最大50 |
| sort | string | 否 | `latest` | 排序方式：`latest`(最新)/`hot`(热门)/`unanswered`(待回复) |
| keyword | string | 否 | - | 搜索关键词（搜索标题和内容） |
| tag | string | 否 | - | 标签筛选 |
| status | string | 否 | - | 状态筛选（仅管理员/教师可用）：`pending`/`approved`/`rejected` |
| authorId | string | 否 | - | 按作者筛选（用于"我的帖子"） |

#### 响应示例

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "id": "post_123",
        "title": "关于第三章的作业问题",
        "content": "老师您好，我在做第三章作业时遇到了一个问题...",
        "contentHtml": "<p>老师您好，我在做第三章作业时遇到了一个问题...</p>",
        "author": {
          "id": "user_456",
          "name": "张同学",
          "avatar": "https://example.com/avatar/user_456.jpg",
          "isTeacher": false,
          "isAdmin": false
        },
        "tags": ["作业问题", "技术讨论"],
        "status": "approved",
        "isPinned": true,
        "likeCount": 12,
        "replyCount": 3,
        "viewCount": 156,
        "isLiked": false,
        "createdAt": "2026-01-24T10:00:00Z",
        "editedAt": null
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 256,
      "totalPages": 13
    }
  }
}
```

#### 业务逻辑

1. **普通学生**：只能看到 `status = approved` 或 `status = auto_approved` 的帖子
2. **教师/管理员**：可以看到所有状态的帖子，支持 `status` 参数筛选
3. **排序规则**：
   - `latest`：按创建时间降序
   - `hot`：按 `(likeCount * 2 + replyCount * 3 + viewCount)` 降序
   - `unanswered`：仅显示 `replyCount = 0` 的帖子，按创建时间降序
4. **置顶帖子始终排在最前面**
5. `isLiked` 字段需要根据当前登录用户查询是否已点赞

---

### 2. 获取讨论详情

**GET** `/api/v1/discussions/{postId}`

**前端调用位置**: `src/api/discussion.ts` - `getDiscussionDetail()`

**使用场景**: 点击帖子查看详情（如果需要详情页展示）

#### 请求参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| postId | string | ✅ 是 | 帖子ID (路径参数) |

#### 响应示例

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": "post_123",
    "title": "关于第三章的作业问题",
    "content": "老师您好，我在做第三章的作业时遇到了一个问题...",
    "contentHtml": "<p>老师您好，我在做第三章的作业时遇到了一个问题...</p>",
    "author": {
      "id": "user_456",
      "name": "张同学",
      "avatar": "https://example.com/avatar/user_456.jpg",
      "isTeacher": false,
      "isAdmin": false
    },
    "tags": ["作业问题"],
    "status": "approved",
    "isPinned": false,
    "likeCount": 12,
    "replyCount": 3,
    "viewCount": 157,
    "isLiked": false,
    "createdAt": "2026-01-24T10:00:00Z",
    "editedAt": null,
    "replies": [
      {
        "id": "reply_789",
        "author": {
          "id": "teacher_001",
          "name": "李老师",
          "avatar": "https://example.com/avatar/teacher_001.jpg",
          "isTeacher": true
        },
        "content": "好问题！这个问题的关键在于...",
        "contentHtml": "<p>好问题！这个问题的关键在于...</p>",
        "likeCount": 8,
        "isLiked": false,
        "replyTo": null,
        "createdAt": "2026-01-24T11:00:00Z"
      }
    ],
    "hasMoreReplies": true
  }
}
```

#### 业务逻辑

1. 访问详情页时，`viewCount` 自增1
2. 默认返回前5条回复，如需更多调用 [获取回复列表](#6-获取回复列表) 接口
3. 非公开（未通过审核）的帖子只有作者本人、教师、管理员可查看

---

### 3. 发布讨论

**POST** `/api/v1/courses/{courseId}/discussions`

**前端调用位置**: `src/api/discussion.ts` - `createDiscussion()`

**使用场景**: 用户在问答区发布新的讨论帖子

#### 请求头

| 头部 | 必填 | 说明 |
|------|------|------|
| Authorization | ✅ 是 | Bearer {token} |
| Content-Type | ✅ 是 | application/json |
| X-Request-ID | 否 | 请求唯一ID（用于幂等性，防止重复提交） |
| X-Client-Fingerprint | 否 | 客户端指纹（用于风控） |

#### 请求体

```json
{
  "title": "关于第三章的作业问题",
  "content": "老师您好，我在做第三章的作业时遇到了一个问题...",
  "tags": ["作业问题", "技术讨论"]
}
```

| 字段 | 类型 | 必填 | 约束 | 说明 |
|------|------|------|------|------|
| title | string | 否 | 0-100字符 | 标题（可选） |
| content | string | ✅ 是 | 1-5000字符 | 内容，支持Markdown格式 |
| tags | string[] | 否 | 0-5个，每个≤20字符 | 标签列表 |

#### 响应示例

**成功（待审核）**:
```json
{
  "code": 0,
  "message": "发布成功，内容将在审核后显示",
  "data": {
    "id": "post_124",
    "status": "pending",
    "estimatedReviewTime": "24小时内"
  }
}
```

**成功（自动通过，教师/管理员/高信誉用户）**:
```json
{
  "code": 0,
  "message": "发布成功",
  "data": {
    "id": "post_124",
    "status": "auto_approved",
    "estimatedReviewTime": null
  }
}
```

**失败（内容违规）**:
```json
{
  "code": 4001,
  "message": "内容包含违规词汇，请修改后重新提交",
  "data": null
}
```

#### 业务逻辑

1. **内容校验**
   - 标题长度：0-100字符
   - 内容长度：1-5000字符
   - 标签数量：0-5个，每个标签≤20字符
   - 内容不能为空或纯空白

2. **Markdown 渲染**
   - 后端将 `content`（Markdown）渲染为 `contentHtml`（HTML）
   - 渲染时进行 XSS 过滤（详见安全防护章节）

3. **敏感词检测**（详见敏感词检测章节）
   - 低风险：自动通过
   - 中风险：进入人工审核队列
   - 高风险：直接拒绝并提示用户

4. **审核流程**
   - **可信用户**（教师/管理员/信誉分≥80的学生）：`status = auto_approved`，直接显示
   - **普通用户**：`status = pending`，进入待审核队列
   - **触发敏感词**：标记为高优先级人工审核

5. **幂等性处理**
   - 如果提供了 `X-Request-ID`，相同ID在5分钟内重复请求返回相同结果

---

### 4. 编辑讨论

**PUT** `/api/v1/discussions/{postId}`

**前端调用位置**: `src/api/discussion.ts` - `updateDiscussion()`

**使用场景**: 作者编辑自己的帖子内容

#### 请求体

```json
{
  "title": "更新后的标题",
  "content": "更新后的内容...",
  "tags": ["作业问题"]
}
```

| 字段 | 类型 | 必填 | 约束 | 说明 |
|------|------|------|------|------|
| title | string | 否 | 0-100字符 | 新标题 |
| content | string | 否 | 1-5000字符 | 新内容 |
| tags | string[] | 否 | 0-5个 | 新标签 |

#### 响应示例

```json
{
  "code": 0,
  "message": "已保存，审核通过后生效",
  "data": {
    "success": true
  }
}
```

#### 业务逻辑

1. **权限校验**：仅作者本人或管理员可编辑
2. **重新审核**：
   - 普通用户编辑后，`status` 改为 `pending`，需重新审核
   - 管理员/教师编辑后，保持 `auto_approved` 状态
3. **编辑记录**：更新 `editedAt` 字段，可选记录编辑历史
4. **敏感词检测**：编辑内容同样需要敏感词检测

---

### 5. 删除讨论

**DELETE** `/api/v1/discussions/{postId}`

**前端调用位置**: `src/api/discussion.ts` - `deleteDiscussion()`

**使用场景**: 作者或管理员删除帖子

#### 响应示例

```json
{
  "code": 0,
  "message": "删除成功",
  "data": {
    "success": true
  }
}
```

#### 业务逻辑

1. **权限校验**：仅作者本人或管理员/教师可删除
2. **软删除**：设置 `deletedAt` 字段，不物理删除数据
3. **级联处理**：帖子下的回复也标记为软删除
4. **审计日志**：记录删除操作及原因

---

### 6. 获取回复列表

**GET** `/api/v1/discussions/{postId}/replies`

**前端调用位置**: `src/api/discussion.ts` - `getReplies()`

**使用场景**: 展开帖子查看更多回复，或分页加载回复

#### 请求参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| postId | string | ✅ 是 | - | 帖子ID (路径参数) |
| page | number | 否 | 1 | 页码 |
| pageSize | number | 否 | 10 | 每页数量，最大50 |

#### 响应示例

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "id": "reply_789",
        "author": {
          "id": "teacher_001",
          "name": "李老师",
          "avatar": "https://example.com/avatar/teacher_001.jpg",
          "isTeacher": true,
          "isAdmin": false
        },
        "content": "好问题！这个问题的关键在于...",
        "contentHtml": "<p>好问题！这个问题的关键在于...</p>",
        "likeCount": 8,
        "isLiked": false,
        "replyTo": null,
        "parentReplyId": null,
        "createdAt": "2026-01-24T11:00:00Z"
      },
      {
        "id": "reply_790",
        "author": {
          "id": "user_456",
          "name": "张同学",
          "avatar": "https://example.com/avatar/user_456.jpg",
          "isTeacher": false,
          "isAdmin": false
        },
        "content": "谢谢老师！我明白了",
        "contentHtml": "<p>谢谢老师！我明白了</p>",
        "likeCount": 2,
        "isLiked": false,
        "replyTo": "李老师",
        "parentReplyId": "reply_789",
        "createdAt": "2026-01-24T11:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 10,
      "total": 15,
      "totalPages": 2
    }
  }
}
```

#### 业务逻辑

1. 按 `createdAt` 升序排列（最早的回复在前）
2. `replyTo` 字段显示被回复者的昵称（如果是楼中楼回复）
3. 仅返回 `status = approved` 或 `auto_approved` 的回复
4. `isLiked` 根据当前用户查询

---

### 7. 发布回复

**POST** `/api/v1/discussions/{postId}/replies`

**前端调用位置**: `src/api/discussion.ts` - `createReply()`

**使用场景**: 用户回复帖子或回复他人的回复（楼中楼）

#### 请求体

```json
{
  "content": "这是我的回复内容...",
  "parentReplyId": "reply_789",
  "replyToUserId": "user_456"
}
```

| 字段 | 类型 | 必填 | 约束 | 说明 |
|------|------|------|------|------|
| content | string | ✅ 是 | 1-2000字符 | 回复内容，支持Markdown |
| parentReplyId | string | 否 | - | 父回复ID（楼中楼回复时填写） |
| replyToUserId | string | 否 | - | 被回复用户ID（楼中楼回复时填写） |

#### 响应示例

```json
{
  "code": 0,
  "message": "回复已提交，等待审核",
  "data": {
    "id": "reply_791",
    "status": "pending"
  }
}
```

#### 业务逻辑

1. **内容校验**：1-2000字符
2. **敏感词检测**：同帖子发布
3. **审核流程**：同帖子发布
4. **计数更新**：帖子的 `replyCount` 自增（仅在审核通过后）
5. **通知触发**（可选）：
   - 通知帖子作者有新回复
   - 楼中楼回复时通知被回复者

---

### 8. 删除回复

**DELETE** `/api/v1/discussions/{postId}/replies/{replyId}`

**前端调用位置**: `src/api/discussion.ts` - `deleteReply()`

**使用场景**: 作者或管理员删除回复

#### 请求参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| postId | string | ✅ 是 | 帖子ID (路径参数) |
| replyId | string | ✅ 是 | 回复ID (路径参数) |

#### 响应示例

```json
{
  "code": 0,
  "message": "删除成功",
  "data": {
    "success": true
  }
}
```

#### 业务逻辑

1. 仅回复作者本人或管理员/教师可删除
2. 软删除，设置 `deletedAt`
3. 帖子的 `replyCount` 自减

---

### 9. 点赞帖子

**POST** `/api/v1/discussions/{postId}/like`

**前端调用位置**: `src/api/discussion.ts` - `likePost()`

**使用场景**: 用户点赞帖子

#### 响应示例

```json
{
  "code": 0,
  "message": "点赞成功",
  "data": {
    "success": true,
    "likeCount": 13
  }
}
```

#### 业务逻辑

1. 每个用户对同一帖子只能点赞一次
2. 重复点赞返回当前状态，不报错
3. 返回最新的 `likeCount` 用于前端实时更新

---

### 10. 取消点赞帖子

**DELETE** `/api/v1/discussions/{postId}/like`

**前端调用位置**: `src/api/discussion.ts` - `unlikePost()`

**使用场景**: 用户取消点赞

#### 响应示例

```json
{
  "code": 0,
  "message": "已取消点赞",
  "data": {
    "success": true,
    "likeCount": 12
  }
}
```

---

### 11. 点赞回复

**POST** `/api/v1/discussions/{postId}/replies/{replyId}/like`

**前端调用位置**: `src/api/discussion.ts` - `likeReply()`

**使用场景**: 用户点赞回复

#### 请求参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| postId | string | ✅ 是 | 帖子ID (路径参数) |
| replyId | string | ✅ 是 | 回复ID (路径参数) |

#### 响应示例

```json
{
  "code": 0,
  "message": "点赞成功",
  "data": {
    "success": true,
    "likeCount": 9
  }
}
```

---

### 12. 取消点赞回复

**DELETE** `/api/v1/discussions/{postId}/replies/{replyId}/like`

**前端调用位置**: `src/api/discussion.ts` - `unlikeReply()`

**使用场景**: 用户取消对回复的点赞

#### 响应示例

```json
{
  "code": 0,
  "message": "已取消点赞",
  "data": {
    "success": true,
    "likeCount": 8
  }
}
```

---

### 13. 举报帖子

**POST** `/api/v1/discussions/{postId}/report`

**前端调用位置**: `src/api/discussion.ts` - `reportPost()`

**使用场景**: 用户举报违规帖子

#### 请求体

```json
{
  "reason": "spam",
  "description": "这是广告内容，推销课外辅导"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| reason | string | ✅ 是 | 举报原因枚举值（见下表） |
| description | string | 否 | 详细说明，最大500字符 |

**举报原因枚举**

| 值 | 说明 |
|------|------|
| `spam` | 垃圾广告 |
| `inappropriate` | 不当内容 |
| `harassment` | 骚扰/攻击 |
| `misinformation` | 虚假信息 |
| `copyright` | 侵权内容 |
| `other` | 其他（需填写description） |

#### 响应示例

```json
{
  "code": 0,
  "message": "举报已提交，我们会尽快处理",
  "data": {
    "success": true
  }
}
```

#### 业务逻辑

1. 每个用户对同一内容只能举报一次
2. 举报记录存入 `user_interactions` 表
3. 当举报数达到阈值（如3次），自动将帖子标记为待审核
4. 通知管理员审核

---

### 14. 举报回复

**POST** `/api/v1/discussions/{postId}/replies/{replyId}/report`

**前端调用位置**: `src/api/discussion.ts` - `reportReply()`

**使用场景**: 用户举报违规回复

#### 请求体

同 [举报帖子](#13-举报帖子)

#### 响应示例

同 [举报帖子](#13-举报帖子)

---

### 15. 置顶帖子

**POST** `/api/v1/discussions/{postId}/pin`

**前端调用位置**: `src/api/discussion.ts` - `pinPost()`

**使用场景**: 教师/管理员将重要帖子置顶

**权限要求**: 教师或管理员

#### 响应示例

```json
{
  "code": 0,
  "message": "置顶成功",
  "data": {
    "success": true
  }
}
```

#### 业务逻辑

1. 设置 `isPinned = true`
2. 记录审计日志
3. 同一课程置顶帖子建议限制数量（如最多5个）

---

### 16. 取消置顶

**DELETE** `/api/v1/discussions/{postId}/pin`

**前端调用位置**: `src/api/discussion.ts` - `unpinPost()`

**使用场景**: 教师/管理员取消帖子置顶

**权限要求**: 教师或管理员

#### 响应示例

```json
{
  "code": 0,
  "message": "已取消置顶",
  "data": {
    "success": true
  }
}
```

---

### 17. 审核帖子

**POST** `/api/v1/discussions/{postId}/review`

**前端调用位置**: `src/api/discussion.ts` - `reviewPost()`

**使用场景**: 教师/管理员审核待审核的帖子

**权限要求**: 教师或管理员

#### 请求体

```json
{
  "action": "approve",
  "note": "内容符合规范"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| action | string | ✅ 是 | `approve`(通过) 或 `reject`(拒绝) |
| note | string | 否 | 审核备注（拒绝时建议填写原因） |

#### 响应示例

**通过**:
```json
{
  "code": 0,
  "message": "审核通过",
  "data": {
    "success": true
  }
}
```

**拒绝**:
```json
{
  "code": 0,
  "message": "已拒绝",
  "data": {
    "success": true
  }
}
```

#### 业务逻辑

1. **通过**：`status` 改为 `approved`，帖子对所有人可见
2. **拒绝**：`status` 改为 `rejected`，`reviewNote` 存储拒绝原因
3. 记录审计日志到 `audit_logs` 表
4. 可选：通知作者审核结果

---

### 18. 获取统计数据

**GET** `/api/v1/courses/{courseId}/discussions/stats`

**前端调用位置**: `src/api/discussion.ts` - `getDiscussionStats()`

**使用场景**: 在问答页面右侧展示统计面板

#### 响应示例

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "totalPosts": 256,
    "totalReplies": 1024,
    "activeUsers": 89,
    "resolvedRate": "78%",
    "pendingReviewCount": 5,
    "hotTags": [
      { "name": "课程内容", "count": 128 },
      { "name": "作业问题", "count": 89 },
      { "name": "考试相关", "count": 56 }
    ]
  }
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| totalPosts | number | 帖子总数（已通过审核） |
| totalReplies | number | 回复总数 |
| activeUsers | number | 活跃用户数（近30天发帖/回复的用户） |
| resolvedRate | string | 已回复帖子占比 |
| pendingReviewCount | number | 待审核数量（仅教师/管理员可见） |
| hotTags | array | 热门标签列表 |

---

### 19. 获取热门标签

**GET** `/api/v1/courses/{courseId}/discussions/tags`

**前端调用位置**: `src/api/discussion.ts` - `getHotTags()`

**使用场景**: 展示热门标签供用户筛选

#### 响应示例

```json
{
  "code": 0,
  "message": "success",
  "data": [
    { "name": "课程内容", "count": 128 },
    { "name": "作业问题", "count": 89 },
    { "name": "考试相关", "count": 56 },
    { "name": "技术讨论", "count": 34 },
    { "name": "学习方法", "count": 21 }
  ]
}
```

#### 业务逻辑

1. 按使用次数降序排列
2. 返回前10个热门标签
3. 仅统计已通过审核的帖子标签

---

### T1. 获取教师课程讨论列表

**GET** `/api/v1/teacher/discussions`

**前端调用位置**: `src/api/discussion-admin.ts` - `getTeacherDiscussions()`

**使用场景**: 教师端讨论管理页面，获取所教课程的所有讨论内容

**权限要求**: 教师

#### 请求参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| courseId | string | 否 | - | 课程ID，不传则获取所有所教课程的讨论 |
| status | string | 否 | - | 状态筛选：`pending`/`approved`/`rejected`/`auto_approved` |
| keyword | string | 否 | - | 搜索关键词（搜索标题和内容） |
| page | number | 否 | 1 | 页码，从1开始 |
| pageSize | number | 否 | 20 | 每页数量，最大50 |

#### 响应示例

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "id": "post_123",
        "title": "关于第三章的作业问题",
        "content": "老师您好，我在做第三章作业时遇到了一个问题...",
        "contentHtml": "<p>老师您好，我在做第三章作业时遇到了一个问题...</p>",
        "author": {
          "id": "user_456",
          "name": "张同学",
          "avatar": "https://example.com/avatar/user_456.jpg",
          "isTeacher": false,
          "isAdmin": false
        },
        "tags": ["作业问题", "技术讨论"],
        "status": "pending",
        "isPinned": false,
        "likeCount": 12,
        "replyCount": 3,
        "viewCount": 156,
        "isLiked": false,
        "createdAt": "2026-01-24T10:00:00Z",
        "editedAt": null,
        "riskLevel": "medium",
        "matchedWords": ["敏感词1"],
        "priority": "high",
        "courseName": "Python入门"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 256,
      "totalPages": 13
    }
  }
}
```

#### 响应字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| list | array | 讨论列表 |
| list[].riskLevel | string | 风险等级：`low`/`medium`/`high`/`critical` |
| list[].matchedWords | string[] | 匹配到的敏感词列表 |
| list[].priority | string | 审核优先级：`high`/`medium`/`low` |
| list[].courseName | string | 课程名称 |
| pagination | object | 分页信息 |

#### 业务逻辑

1. 仅返回当前教师所教授课程的讨论
2. 教师可以看到所有状态的帖子（包括待审核、已通过、已拒绝）
3. 支持按课程、状态、关键词筛选
4. 返回风险等级和匹配敏感词信息，便于教师审核
5. 结果按创建时间降序排列，待审核内容优先显示

---

### T2. 获取教师课程统计

**GET** `/api/v1/teacher/discussions/stats`

**前端调用位置**: `src/api/discussion-admin.ts` - `getTeacherCourseStats()`

**使用场景**: 教师端讨论管理页面顶部的统计卡片展示

**权限要求**: 教师

#### 请求参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| courseId | string | 否 | - | 课程ID，不传则获取所有所教课程的汇总统计 |

#### 响应示例

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "totalPosts": 256,
    "totalReplies": 1024,
    "pendingReview": 15,
    "pendingReports": 3,
    "todayPosts": 12,
    "weekPosts": 89,
    "courses": [
      {
        "courseId": "course_001",
        "courseName": "Python入门",
        "postCount": 120,
        "pendingCount": 8
      },
      {
        "courseId": "course_002",
        "courseName": "Java基础",
        "postCount": 136,
        "pendingCount": 7
      }
    ]
  }
}
```

#### 响应字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| totalPosts | number | 帖子总数（所有状态） |
| totalReplies | number | 回复总数 |
| pendingReview | number | 待审核帖子数 |
| pendingReports | number | 待处理举报数 |
| todayPosts | number | 今日新增帖子数 |
| weekPosts | number | 本周新增帖子数 |
| courses | array | 各课程统计明细 |
| courses[].courseId | string | 课程ID |
| courses[].courseName | string | 课程名称 |
| courses[].postCount | number | 该课程帖子总数 |
| courses[].pendingCount | number | 该课程待审核帖子数 |

#### 业务逻辑

1. 仅统计当前教师所教授课程的数据
2. `courses` 数组用于教师端筛选下拉框，显示各课程及待审核数量
3. `pendingCount > 0` 的课程在下拉框中显示角标提醒
4. 统计数据实时计算或使用缓存（建议缓存5分钟）

---

### 20. 获取审核队列

**GET** `/api/v1/admin/discussions/review-queue`

**前端调用位置**: `src/api/discussion.ts` - `getReviewQueue()`

**使用场景**: 管理员/教师查看待审核内容列表

**权限要求**: 教师或管理员

#### 请求参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| priority | string | 否 | - | 优先级筛选：`high`/`medium`/`low` |
| courseId | string | 否 | - | 按课程筛选 |
| page | number | 否 | 1 | 页码 |
| pageSize | number | 否 | 20 | 每页数量 |

#### 响应示例

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "id": "post_125",
        "title": "求助",
        "content": "待审核内容...",
        "contentHtml": "<p>待审核内容...</p>",
        "author": {
          "id": "user_789",
          "name": "王同学",
          "avatar": "https://example.com/avatar/user_789.jpg"
        },
        "tags": [],
        "status": "pending",
        "isPinned": false,
        "likeCount": 0,
        "replyCount": 0,
        "viewCount": 0,
        "riskLevel": "medium",
        "matchedWords": ["敏感词1"],
        "priority": "high",
        "createdAt": "2026-01-24T12:00:00Z"
      }
    ],
    "stats": {
      "pending": 15,
      "highPriority": 3,
      "avgWaitTime": "2小时"
    }
  }
}
```

| 额外字段 | 类型 | 说明 |
|---------|------|------|
| riskLevel | string | 风险等级：`low`/`medium`/`high`/`critical` |
| matchedWords | string[] | 匹配到的敏感词列表 |
| priority | string | 审核优先级：`high`/`medium`/`low` |

---

### 21. 获取举报列表

**GET** `/api/v1/admin/discussions/reports`

**前端调用位置**: `src/api/discussion-admin.ts` - `getReportList()`（待开发）

**使用场景**: 教师/管理员查看被举报的内容列表

**权限要求**: 教师或管理员

#### 请求参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| status | string | 否 | `pending` | 状态筛选：`pending`(待处理)/`resolved`(已处理)/`dismissed`(已忽略) |
| reason | string | 否 | - | 举报原因筛选 |
| courseId | string | 否 | - | 按课程筛选（教师只能看到自己课程的举报） |
| page | number | 否 | 1 | 页码 |
| pageSize | number | 否 | 20 | 每页数量 |

#### 响应示例

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "id": "report_001",
        "targetType": "post",
        "targetId": "post_123",
        "target": {
          "id": "post_123",
          "title": "被举报的帖子",
          "content": "帖子内容...",
          "author": {
            "id": "user_456",
            "name": "张同学"
          }
        },
        "reporter": {
          "id": "user_789",
          "name": "李同学"
        },
        "reason": "spam",
        "description": "这是广告内容",
        "status": "pending",
        "reportCount": 3,
        "createdAt": "2026-01-24T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 15,
      "totalPages": 1
    },
    "stats": {
      "pending": 15,
      "resolvedToday": 8,
      "totalReports": 156
    }
  }
}
```

---

### 22. 处理举报

**POST** `/api/v1/admin/discussions/reports/{reportId}/handle`

**前端调用位置**: `src/api/discussion-admin.ts` - `handleReport()`（待开发）

**使用场景**: 教师/管理员处理举报

**权限要求**: 教师或管理员

#### 请求体

```json
{
  "action": "delete",
  "note": "内容确实违规，已删除",
  "punishUser": true,
  "punishType": "warning"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| action | string | ✅ 是 | 处理方式：`delete`(删除内容)/`dismiss`(忽略举报)/`warn`(警告作者) |
| note | string | 否 | 处理备注 |
| punishUser | boolean | 否 | 是否处罚用户 |
| punishType | string | 否 | 处罚类型：`warning`(警告)/`restrict`(限制发帖)/`ban`(禁言) |

#### 响应示例

```json
{
  "code": 0,
  "message": "处理成功",
  "data": {
    "success": true
  }
}
```

---

### 23. 批量审核

**POST** `/api/v1/admin/discussions/batch-review`

**前端调用位置**: `src/api/discussion-admin.ts` - `batchReview()`（待开发）

**使用场景**: 管理员批量通过或拒绝内容

**权限要求**: 教师或管理员

#### 请求体

```json
{
  "postIds": ["post_123", "post_124", "post_125"],
  "action": "approve",
  "note": "批量审核通过"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| postIds | string[] | ✅ 是 | 帖子ID列表，最多50个 |
| action | string | ✅ 是 | `approve`(通过) / `reject`(拒绝) |
| note | string | 否 | 审核备注 |

#### 响应示例

```json
{
  "code": 0,
  "message": "批量审核完成",
  "data": {
    "success": 3,
    "failed": 0,
    "results": [
      { "postId": "post_123", "success": true },
      { "postId": "post_124", "success": true },
      { "postId": "post_125", "success": true }
    ]
  }
}
```

---

### 24. 批量删除

**POST** `/api/v1/admin/discussions/batch-delete`

**前端调用位置**: `src/api/discussion-admin.ts` - `batchDelete()`（待开发）

**使用场景**: 管理员批量删除违规内容

**权限要求**: 教师或管理员

#### 请求体

```json
{
  "postIds": ["post_123", "post_124"],
  "reason": "内容违规"
}
```

#### 响应示例

```json
{
  "code": 0,
  "message": "批量删除完成",
  "data": {
    "success": 2,
    "failed": 0
  }
}
```

---

### 25. 获取敏感词列表

**GET** `/api/v1/admin/sensitive-words`

**前端调用位置**: `src/api/discussion-admin.ts` - `getSensitiveWords()`（待开发）

**使用场景**: 管理员查看和管理敏感词库

**权限要求**: 管理员

#### 请求参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| category | string | 否 | - | 分类筛选：`blacklist`/`graylist`/`whitelist` |
| keyword | string | 否 | - | 搜索关键词 |
| isActive | boolean | 否 | - | 是否启用 |
| page | number | 否 | 1 | 页码 |
| pageSize | number | 否 | 50 | 每页数量 |

#### 响应示例

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "id": "word_001",
        "word": "敏感词示例",
        "category": "blacklist",
        "riskLevel": "high",
        "isActive": true,
        "hitCount": 156,
        "createdAt": "2026-01-01T00:00:00Z",
        "updatedAt": "2026-01-20T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 50,
      "total": 500,
      "totalPages": 10
    },
    "stats": {
      "blacklist": 200,
      "graylist": 250,
      "whitelist": 50
    }
  }
}
```

---

### 26. 添加敏感词

**POST** `/api/v1/admin/sensitive-words`

**前端调用位置**: `src/api/discussion-admin.ts` - `addSensitiveWord()`（待开发）

**使用场景**: 管理员添加新的敏感词

**权限要求**: 管理员

#### 请求体

```json
{
  "word": "新敏感词",
  "category": "graylist",
  "riskLevel": "medium"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| word | string | ✅ 是 | 敏感词内容，1-100字符 |
| category | string | ✅ 是 | 分类：`blacklist`/`graylist`/`whitelist` |
| riskLevel | string | 否 | 风险等级：`low`/`medium`/`high`/`critical`，默认`medium` |

#### 响应示例

```json
{
  "code": 0,
  "message": "添加成功",
  "data": {
    "id": "word_002",
    "word": "新敏感词",
    "category": "graylist",
    "riskLevel": "medium",
    "isActive": true
  }
}
```

---

### 27. 编辑敏感词

**PUT** `/api/v1/admin/sensitive-words/{wordId}`

**前端调用位置**: `src/api/discussion-admin.ts` - `updateSensitiveWord()`（待开发）

**使用场景**: 管理员修改敏感词配置

**权限要求**: 管理员

#### 请求体

```json
{
  "category": "blacklist",
  "riskLevel": "high",
  "isActive": true
}
```

#### 响应示例

```json
{
  "code": 0,
  "message": "更新成功",
  "data": {
    "success": true
  }
}
```

---

### 28. 删除敏感词

**DELETE** `/api/v1/admin/sensitive-words/{wordId}`

**前端调用位置**: `src/api/discussion-admin.ts` - `deleteSensitiveWord()`（待开发）

**使用场景**: 管理员删除敏感词

**权限要求**: 管理员

#### 响应示例

```json
{
  "code": 0,
  "message": "删除成功",
  "data": {
    "success": true
  }
}
```

---

### 29. 批量导入敏感词

**POST** `/api/v1/admin/sensitive-words/import`

**前端调用位置**: `src/api/discussion-admin.ts` - `importSensitiveWords()`（待开发）

**使用场景**: 管理员批量导入敏感词

**权限要求**: 管理员

#### 请求体

```json
{
  "words": [
    { "word": "敏感词1", "category": "blacklist", "riskLevel": "high" },
    { "word": "敏感词2", "category": "graylist", "riskLevel": "medium" }
  ],
  "overwrite": false
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| words | array | ✅ 是 | 敏感词列表，最多1000条 |
| overwrite | boolean | 否 | 遇到重复时是否覆盖，默认false |

#### 响应示例

```json
{
  "code": 0,
  "message": "导入完成",
  "data": {
    "imported": 98,
    "skipped": 2,
    "errors": []
  }
}
```

---

### 30. 获取用户信誉列表

**GET** `/api/v1/admin/user-reputation`

**前端调用位置**: `src/api/discussion-admin.ts` - `getUserReputationList()`（待开发）

**使用场景**: 管理员查看用户信誉情况

**权限要求**: 管理员

#### 请求参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| level | string | 否 | - | 信誉等级筛选：`trusted`/`normal`/`restricted` |
| keyword | string | 否 | - | 搜索用户名 |
| sortBy | string | 否 | `score` | 排序字段：`score`/`rejectedPosts`/`reportedCount` |
| sortOrder | string | 否 | `desc` | 排序方式：`asc`/`desc` |
| page | number | 否 | 1 | 页码 |
| pageSize | number | 否 | 20 | 每页数量 |

#### 响应示例

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "userId": "user_123",
        "userName": "张同学",
        "avatar": "https://example.com/avatar/user_123.jpg",
        "score": 35,
        "level": "restricted",
        "totalPosts": 50,
        "approvedPosts": 30,
        "rejectedPosts": 15,
        "reportedCount": 8,
        "warningCount": 2,
        "lastActiveAt": "2026-01-24T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 100,
      "totalPages": 5
    },
    "stats": {
      "trusted": 500,
      "normal": 8000,
      "restricted": 50
    }
  }
}
```

---

### 31. 调整用户信誉

**PUT** `/api/v1/admin/user-reputation/{userId}`

**前端调用位置**: `src/api/discussion-admin.ts` - `updateUserReputation()`（待开发）

**使用场景**: 管理员手动调整用户信誉分

**权限要求**: 管理员

#### 请求体

```json
{
  "scoreChange": -10,
  "reason": "发布违规内容",
  "newLevel": "restricted"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| scoreChange | number | 否 | 分数变化量（可为负数） |
| reason | string | ✅ 是 | 调整原因 |
| newLevel | string | 否 | 直接设置新等级：`trusted`/`normal`/`restricted` |

#### 响应示例

```json
{
  "code": 0,
  "message": "调整成功",
  "data": {
    "userId": "user_123",
    "previousScore": 45,
    "newScore": 35,
    "previousLevel": "normal",
    "newLevel": "restricted"
  }
}
```

---

### 32. 获取审计日志

**GET** `/api/v1/admin/discussions/audit-logs`

**前端调用位置**: `src/api/discussion-admin.ts` - `getAuditLogs()`（待开发）

**使用场景**: 管理员查看操作审计日志

**权限要求**: 管理员

#### 请求参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| targetType | string | 否 | - | 目标类型：`post`/`reply` |
| action | string | 否 | - | 操作类型：`approve`/`reject`/`delete`/`pin`/`unpin` |
| operatorId | string | 否 | - | 操作人ID |
| startDate | string | 否 | - | 开始日期（ISO 8601） |
| endDate | string | 否 | - | 结束日期（ISO 8601） |
| page | number | 否 | 1 | 页码 |
| pageSize | number | 否 | 50 | 每页数量 |

#### 响应示例

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "id": "log_001",
        "targetType": "post",
        "targetId": "post_123",
        "targetTitle": "帖子标题",
        "action": "reject",
        "operator": {
          "id": "admin_001",
          "name": "管理员小王",
          "role": "admin"
        },
        "reason": "内容违规",
        "previousStatus": "pending",
        "newStatus": "rejected",
        "createdAt": "2026-01-24T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 50,
      "total": 1000,
      "totalPages": 20
    }
  }
}
```

---

### 33. 获取全局统计

**GET** `/api/v1/admin/discussions/statistics`

**前端调用位置**: `src/api/discussion-admin.ts` - `getGlobalStatistics()`（待开发）

**使用场景**: 管理员查看全平台讨论统计数据

**权限要求**: 管理员

#### 请求参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| startDate | string | 否 | 30天前 | 统计开始日期 |
| endDate | string | 否 | 今天 | 统计结束日期 |
| groupBy | string | 否 | `day` | 分组方式：`day`/`week`/`month` |

#### 响应示例

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "overview": {
      "totalPosts": 15680,
      "totalReplies": 68420,
      "totalUsers": 5230,
      "activeUsersToday": 856,
      "pendingReview": 45,
      "pendingReports": 12
    },
    "trends": {
      "posts": [
        { "date": "2026-01-23", "count": 125 },
        { "date": "2026-01-24", "count": 156 }
      ],
      "replies": [
        { "date": "2026-01-23", "count": 580 },
        { "date": "2026-01-24", "count": 620 }
      ],
      "activeUsers": [
        { "date": "2026-01-23", "count": 800 },
        { "date": "2026-01-24", "count": 856 }
      ]
    },
    "topCourses": [
      { "courseId": "course_001", "courseName": "Python入门", "postCount": 520, "replyCount": 2300 },
      { "courseId": "course_002", "courseName": "Java基础", "postCount": 480, "replyCount": 2100 }
    ],
    "contentQuality": {
      "approvalRate": "92.5%",
      "rejectionRate": "5.2%",
      "pendingRate": "2.3%",
      "avgReviewTime": "1.5小时"
    },
    "userBehavior": {
      "avgPostsPerUser": 3.2,
      "avgRepliesPerPost": 4.5,
      "avgLikesPerPost": 2.8,
      "reportRate": "0.3%"
    }
  }
}
```

| 字段 | 说明 |
|------|------|
| overview | 总览数据 |
| trends | 趋势数据（按日期分组） |
| topCourses | 讨论最活跃的课程排行 |
| contentQuality | 内容质量统计 |
| userBehavior | 用户行为统计 |

---

### 检测策略

采用多层检测机制：

#### 第一层：关键词匹配

```typescript
interface SensitiveWordConfig {
  //黑名单词库（直接拒绝）
  blacklist: string[];
  
  //灰名单词库（需人工审核）
  graylist: string[];
  
  // 白名单词库（允许通过，用于排除误判）
  whitelist: string[];
}
```

#### 第二层：正则表达式匹配

检测变体形式：
- 拼音替代：`政治` → `zhengzhi`
- 谐音替代：`死` → `4`
- 符号分隔：`敏感词` → `敏*感*词`
- 繁简转换

#### 第三层：AI 语义分析（可选）

对于灰名单内容，使用 AI 模型进行语义分析，判断是否为违规内容。

### 检测 API（内部使用）

**POST** `/api/internal/content/check`

#### 请求体

```json
{
  "content": "待检测的内容",
  "contentType": "discussion",
  "userId": "user_123"
}
```

#### 响应示例

```json
{
  "code": 0,
  "data": {
    "passed": false,
    "riskLevel": "medium",
    "matchedWords": [
      {
        "word": "xxx",
        "type": "graylist",
        "position": [10, 13],
        "suggestion": "review"
      }
    ],
    "suggestion": "manual_review",
    "confidence": 0.75
  }
}
```

### 风险等级

| 等级 | 说明 | 处理方式 |
|------|------|----------|
| low | 低风险 | 自动通过 |
| medium | 中风险 | 人工审核 |
| high | 高风险 | 自动拒绝 |
| critical | 严重违规 | 自动拒绝 + 账号警告 |

---

## 内容审核机制

### 审核流程

```
用户提交内容↓
敏感词检测
    ↓
┌─────────────────────────────────────┐
│  风险等级判断                        │
├─────────────────────────────────────┤
│ low →自动通过                       │
│ medium → 进入人工审核队列            │
│ high → 自动拒绝，通知用户            │
│ critical → 自动拒绝 + 账号处罚       │
└─────────────────────────────────────┘↓
人工审核（24小时内）
    ↓
┌─────────────────────────────────────┐
│ 通过 → 发布内容                      │
│ 拒绝 → 通知用户，说明原因            │
└─────────────────────────────────────┘
```

### 审核队列 API

**GET** `/api/v1/admin/discussions/review-queue`

#### 请求参数

| 参数 | 类型 | 说明 |
|------|------|------|
| priority | string | 优先级筛选：`high`/`medium`/`low` |
| courseId | string | 课程筛选 |
| page | number | 页码 |

#### 响应示例

```json
{
  "code": 0,
  "data": {
    "list": [
      {
        "id": "post_125",
        "content": "待审核内容...",
        "author": { "id": "user_789", "name": "王同学" },
        "riskLevel": "medium",
        "matchedWords": ["xxx"],
        "submittedAt": "2026-01-24T12:00:00Z",
        "priority": "high"
      }
    ],
    "stats": {
      "pending": 15,
      "highPriority": 3,
      "avgWaitTime": "2小时"
    }
  }
}
```

### 用户信誉系统

```typescript
interface UserReputation {
  userId: string;
  score: number;              // 信誉分 0-100
  level: 'trusted' | 'normal' | 'restricted';
  totalPosts: number;
  approvedPosts: number;
  rejectedPosts: number;
  reportedCount: number;      // 被举报次数
  warningCount: number;       // 警告次数
}
```

#### 信誉等级

| 等级 | 分数范围 | 权限 |
|------|----------|------|
| trusted | 80-100 | 内容自动通过 |
| normal | 40-79 | 需要审核 |
| restricted | 0-39 | 限制发帖频率 |

---

## 安全防护

### 1. XSS 防护

#### 后端处理

```typescript
// 使用 DOMPurify 或类似库清理 HTML
import DOMPurify from 'isomorphic-dompurify';

function sanitizeContent(markdown: string): string {
  // 1. 将Markdown 转换为 HTML
  const html = markdownToHtml(markdown);
  
  // 2. 清理危险标签和属性
  const clean = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'code', 'pre', 'ul', 'ol', 'li', 'a', 'blockquote'],
    ALLOWED_ATTR: ['href', 'class'],
    ALLOW_DATA_ATTR: false,
    ADD_ATTR: ['target', 'rel'],
    FORBID_TAGS: ['script', 'style', 'iframe', 'form', 'input'],
    FORBID_ATTR: ['onerror', 'onclick', 'onload', 'style']
  });
  
  // 3. 链接安全处理
  return sanitizeLinks(clean);
}

function sanitizeLinks(html: string): string {
  // 所有外部链接添加 rel="noopener noreferrer" 和 target="_blank"
  // 检查链接是否在白名单域名内
}
```

#### 前端处理

```vue
<!-- 使用 v-html 时确保内容已经过后端清理 -->
<div class="content" v-html="post.contentHtml" />

<!-- 或使用安全的渲染组件 -->
<SafeHtml :content="post.content" />
```

### 2. CSRF 防护

```typescript
// 所有写操作需要 CSRF Token
headers: {
  'X-CSRF-Token': getCsrfToken()
}
```

### 3. 请求频率限制

```typescript
interface RateLimitConfig {
  // 发帖限制
  post: {
    maxPerMinute: 2,
    maxPerHour: 10,
    maxPerDay: 30
  },
  // 回复限制
  reply: {
    maxPerMinute: 5,
    maxPerHour: 30,
    maxPerDay: 100
  },
  // 点赞限制
  like: {
    maxPerMinute: 20,
    maxPerHour: 200
  }
}
```

#### 限流响应

```json
{
  "code": 429,
  "message": "请求过于频繁，请稍后再试",
  "data": {
    "retryAfter": 60,
    "limit": 10,
    "remaining": 0,
    "resetAt": "2026-01-24T12:01:00Z"
  }
}
```

### 4. SQL 注入防护

- 使用参数化查询
- ORM 框架自动转义
- 输入验证和类型检查

### 5. 内容长度限制

| 字段 | 最大长度 |
|------|----------|
| title | 100 字符 |
| content | 5000 字符 |
| tag | 20 字符 |
| tags数量 | 5 个 |
| reply content | 2000 字符 |

### 6. 文件上传安全（如支持图片）

```typescript
interface UploadConfig {
  allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  maxSize: 5 * 1024 * 1024,  // 5MB
  maxDimensions: { width: 4096, height: 4096 },
  scanForMalware: true,
  generateThumbnail: true
}
```

### 7. 日志记录

```typescript
interface SecurityLog {
  timestamp: string;
  userId: string;
  action: string;
  ip: string;
  userAgent: string;
  requestId: string;
  riskScore: number;
  details: object;
}
```

### 8. 异常行为检测

监控以下异常行为：
- 短时间内大量发帖
- 内容高度相似（复制粘贴）
- 频繁触发敏感词
- 异常登录地点
- 批量点赞/举报

---

## 错误码定义

| 错误码 | HTTP 状态码 | 说明 |
|--------|-------------|------|
| 0 | 200 | 成功 |
| 1001 | 400 | 参数错误 |
| 1002 | 400 | 内容为空 |
| 1003 | 400 | 内容过长 |
| 1004 | 400 | 标签数量超限 |
| 2001 | 401 | 未登录 |
| 2002 | 403 | 无权限 |
| 2003 | 403 | 账号被限制 |
| 3001 | 404 | 帖子不存在 |
| 3002 | 404 | 回复不存在 |
| 4001 | 422 | 内容包含违规词汇 |
| 4002 | 422 | 内容需要审核 |
| 4003 | 422 | 重复提交 |
| 5001 | 429 | 请求过于频繁 |
| 5002 | 429 | 今日发帖已达上限 |
| 9001 | 500 | 服务器内部错误 |
| 9002 | 503 | 服务暂时不可用 |

---

## 数据库表设计参考

### discussion_posts 表

```sql
CREATE TABLE discussion_posts (
  id VARCHAR(32) PRIMARY KEY COMMENT '帖子唯一ID',
  course_id VARCHAR(32) NOT NULL COMMENT '所属课程ID',
  author_id VARCHAR(32) NOT NULL COMMENT '作者用户ID',
  title VARCHAR(100) COMMENT '标题（可选）',
  content TEXT NOT NULL COMMENT '内容（Markdown格式）',
  content_html TEXT NOT NULL COMMENT '渲染后的HTML（已XSS过滤）',
  status ENUM('pending', 'approved', 'rejected', 'auto_approved') DEFAULT 'pending' COMMENT '审核状态',
  review_note VARCHAR(500) COMMENT '审核备注（拒绝原因）',
  is_pinned BOOLEAN DEFAULT FALSE COMMENT '是否置顶',
  like_count INT DEFAULT 0 COMMENT '点赞数',
  reply_count INT DEFAULT 0 COMMENT '回复数',
  view_count INT DEFAULT 0 COMMENT '浏览数',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  edited_at TIMESTAMP NULL COMMENT '最后编辑时间',
  deleted_at TIMESTAMP NULL COMMENT '软删除时间',
  
  INDEX idx_course_status (course_id, status),
  INDEX idx_author (author_id),
  INDEX idx_created_at (created_at),
  INDEX idx_is_pinned (is_pinned),
  FULLTEXT INDEX idx_content (title, content)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='讨论帖子表';
```

### discussion_replies 表

```sql
CREATE TABLE discussion_replies (
  id VARCHAR(32) PRIMARY KEY COMMENT '回复唯一ID',
  post_id VARCHAR(32) NOT NULL COMMENT '所属帖子ID',
  author_id VARCHAR(32) NOT NULL COMMENT '作者用户ID',
  parent_reply_id VARCHAR(32) COMMENT '父回复ID（楼中楼）',
  reply_to_user_id VARCHAR(32) COMMENT '被回复用户ID',
  content TEXT NOT NULL COMMENT '回复内容',
  content_html TEXT NOT NULL COMMENT '渲染后的HTML',
  status ENUM('pending', 'approved', 'rejected', 'auto_approved') DEFAULT 'pending' COMMENT '审核状态',
  like_count INT DEFAULT 0 COMMENT '点赞数',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  deleted_at TIMESTAMP NULL COMMENT '软删除时间',
  
  INDEX idx_post (post_id),
  INDEX idx_author (author_id),
  INDEX idx_parent_reply (parent_reply_id),
  INDEX idx_created_at (created_at),
  FOREIGN KEY (post_id) REFERENCES discussion_posts(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='讨论回复表';
```

### discussion_tags 表

```sql
CREATE TABLE discussion_tags (
  id VARCHAR(32) PRIMARY KEY COMMENT '标签关联ID',
  post_id VARCHAR(32) NOT NULL COMMENT '帖子ID',
  tag_name VARCHAR(20) NOT NULL COMMENT '标签名称',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  
  INDEX idx_post (post_id),
  INDEX idx_tag (tag_name),
  UNIQUE INDEX idx_post_tag (post_id, tag_name),
  FOREIGN KEY (post_id) REFERENCES discussion_posts(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='帖子标签关联表';
```

### user_interactions 表

```sql
CREATE TABLE user_interactions (
  id VARCHAR(32) PRIMARY KEY COMMENT '互动记录ID',
  user_id VARCHAR(32) NOT NULL COMMENT '用户ID',
  target_type ENUM('post', 'reply') NOT NULL COMMENT '目标类型',
  target_id VARCHAR(32) NOT NULL COMMENT '目标ID（帖子ID或回复ID）',
  interaction_type ENUM('like', 'report') NOT NULL COMMENT '互动类型',
  report_reason VARCHAR(50) COMMENT '举报原因',
  report_description VARCHAR(500) COMMENT '举报详细说明',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  
  UNIQUE INDEX idx_unique_interaction (user_id, target_type, target_id, interaction_type),
  INDEX idx_target (target_type, target_id),
  INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户互动记录表';
```

### audit_logs 表

```sql
CREATE TABLE audit_logs (
  id VARCHAR(32) PRIMARY KEY COMMENT '审计日志ID',
  target_type ENUM('post', 'reply') NOT NULL COMMENT '目标类型',
  target_id VARCHAR(32) NOT NULL COMMENT '目标ID',
  action ENUM('approve', 'reject', 'delete', 'pin', 'unpin') NOT NULL COMMENT '操作类型',
  operator_id VARCHAR(32) NOT NULL COMMENT '操作人ID',
  operator_role ENUM('system', 'admin', 'teacher') NOT NULL COMMENT '操作人角色',
  reason VARCHAR(500) COMMENT '操作原因',
  previous_status VARCHAR(20) COMMENT '操作前状态',
  new_status VARCHAR(20) COMMENT '操作后状态',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '操作时间',
  
  INDEX idx_target (target_type, target_id),
  INDEX idx_operator (operator_id),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='审计日志表';
```

### sensitive_words 表

```sql
CREATE TABLE sensitive_words (
  id VARCHAR(32) PRIMARY KEY COMMENT '敏感词ID',
  word VARCHAR(100) NOT NULL COMMENT '敏感词',
  category ENUM('blacklist', 'graylist', 'whitelist') NOT NULL COMMENT '分类',
  risk_level ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium' COMMENT '风险等级',
  is_active BOOLEAN DEFAULT TRUE COMMENT '是否启用',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  
  UNIQUE INDEX idx_word (word),
  INDEX idx_category (category),
  INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='敏感词表';
```

### user_reputation 表（可选，用于信誉系统）

```sql
CREATE TABLE user_reputation (
  user_id VARCHAR(32) PRIMARY KEY COMMENT '用户ID',
  score INT DEFAULT 50 COMMENT '信誉分（0-100）',
  level ENUM('trusted', 'normal', 'restricted') DEFAULT 'normal' COMMENT '信誉等级',
  total_posts INT DEFAULT 0 COMMENT '总发帖数',
  approved_posts INT DEFAULT 0 COMMENT '通过审核的帖子数',
  rejected_posts INT DEFAULT 0 COMMENT '被拒绝的帖子数',
  reported_count INT DEFAULT 0 COMMENT '被举报次数',
  warning_count INT DEFAULT 0 COMMENT '警告次数',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  
  INDEX idx_level (level),
  INDEX idx_score (score)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户信誉表';
```

---

## 实现优先级建议

根据功能使用频率和重要性，建议按以下优先级分阶段开发：

### 第一阶段：学生端核心功能（P0）

**目标**：完成学生端基本功能，支持上线使用

| 序号 | 接口 | 说明 |
|------|------|------|
| 1 | 获取讨论列表 | 页面主要数据来源 |
| 3 | 发布讨论 | 核心交互功能 |
| 7 | 发布回复 | 核心交互功能 |
| 6 | 获取回复列表 | 展示回复内容 |
| 18 | 获取统计数据 | 右侧统计面板 |
| 19 | 获取热门标签 | 标签筛选功能 |

**预计工时**：3-5 天

---

### 第二阶段：学生端互动功能（P1）

**目标**：完善学生端互动体验

| 序号 | 接口 | 说明 |
|------|------|------|
| 9 | 点赞帖子 | 互动功能 |
| 10 | 取消点赞帖子 | 互动功能 |
| 5 | 删除讨论 | 用户管理自己的内容 |
| 8 | 删除回复 | 用户管理自己的内容 |
| 4 | 编辑讨论 | 用户修改自己的内容 |
| 2 | 获取讨论详情 | 详情页（可选） |

**预计工时**：2-3 天

---

### 第三阶段：教师端管理功能（P2）

**目标**：教师可以管理本课程的讨论内容

| 序号 | 接口 | 说明 |
|------|------|------|
| 15 | 置顶帖子 | 教师管理功能 |
| 16 | 取消置顶 | 教师管理功能 |
| 17 | 审核帖子 | 内容审核 |
| 20 | 获取审核队列 | 待审核列表 |
| 21 | 获取举报列表 | 查看举报内容 |
| 22 | 处理举报 | 处理学生举报 |

**预计工时**：3-4 天

**前端页面**：
- `src/views/course/discussion/index.vue` - 讨论管理
- `src/views/course/discussion/review.vue` - 内容审核
- `src/views/course/discussion/reports.vue` - 举报处理

---

### 第四阶段：学生端增强功能（P2）

**目标**：完善互动和安全机制

| 序号 | 接口 | 说明 |
|------|------|------|
| 11 | 点赞回复 | 回复互动 |
| 12 | 取消点赞回复 | 回复互动 |
| 13 | 举报帖子 | 安全机制 |
| 14 | 举报回复 | 安全机制 |

**预计工时**：1-2 天

---

### 第五阶段：管理员后台（P3）

**目标**：管理员拥有全局管理能力

| 序号 | 接口 | 说明 |
|------|------|------|
| 23 | 批量审核 | 提高审核效率 |
| 24 | 批量删除 | 批量处理违规内容 |
| 25 | 获取敏感词列表 | 敏感词管理 |
| 26 | 添加敏感词 | 敏感词管理 |
| 27 | 编辑敏感词 | 敏感词管理 |
| 28 | 删除敏感词 | 敏感词管理 |
| 29 | 批量导入敏感词 | 敏感词管理 |

**预计工时**：3-4 天

**前端页面**：
- `src/views/system/discussion/index.vue` - 全局讨论管理
- `src/views/system/discussion/sensitive-words.vue` - 敏感词管理

---

### 第六阶段：高级管理功能（P4）

**目标**：数据分析和用户管理

| 序号 | 接口 | 说明 |
|------|------|------|
| 30 | 获取用户信誉列表 | 用户信誉管理 |
| 31 | 调整用户信誉 | 用户信誉管理 |
| 32 | 获取审计日志 | 操作追溯 |
| 33 | 获取全局统计 | 数据分析 |

**预计工时**：2-3 天

**前端页面**：
- `src/views/system/discussion/user-reputation.vue` - 用户信誉管理
- `src/views/system/discussion/audit-logs.vue` - 审计日志
- `src/views/system/discussion/statistics.vue` - 数据统计

---

### 总工时估算

| 阶段 | 内容 | 后端工时 | 前端工时 |
|------|------|---------|---------|
| 第一阶段 | 学生端核心 | 3-5 天 | 已完成 |
| 第二阶段 | 学生端互动 | 2-3 天 | 已完成 |
| 第三阶段 | 教师端管理 | 3-4 天 | 3-4 天 |
| 第四阶段 | 学生端增强 | 1-2 天 | 1 天 |
| 第五阶段 | 管理员后台 | 3-4 天 | 4-5 天 |
| 第六阶段 | 高级管理 | 2-3 天 | 3-4 天 |
| **总计** | | **14-21 天** | **11-14 天** |

---

## 版本历史

| 版本 | 日期 | 说明 |
|------|------|------|
| 1.0.0 | 2026-01-24 | 初始版本 |
| 1.1.0 | 2026-01-24 | 完善接口详情，添加接口清单和优先级建议 |
| 2.0.0 | 2026-01-24 | 新增管理员/教师端接口，完善全平台功能文档 |

---

## 联系方式

如有问题，请联系后端开发团队。