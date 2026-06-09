# 启明智教 · 社交校园改造计划

> 将 `qiming-3d-classroom` 从 Three.js 3D 虚拟教室改造为 **导航式社交校园平台**，  
> 最外层以「学校」「班级」「同桌」「信箱」为入口，点击进入各自子系统。  
> 角色固定在座位上，不可走动，交互以点击为主。

**v3.0 四大核心修订：**

| # | 修订项 | 说明 |
|---|--------|------|
| 1 | **同桌 = 学生邀请制** | 同桌由学生自主发起邀请、对方确认后绑定，老师不参与指定 |
| 2 | **隐私保护** | 老师/管理员**不能查看**学生之间的纸条和信件内容，只能发布班级公告 |
| 3 | **班级 = 课程班级** | 班级基于已有的课程分配系统（选了同一门课的学生自动组成班级），不是学校行政年级班 |
| 4 | **卡通插画 UI** | 全平台采用卡通插画风格，入口卡片、按钮、图标均使用手绘艺术插画，而非系统默认 UI 组件 |

---

## 一、整体架构概览

### 页面层级结构

```
┌──────────────────────────────────────────────────────────┐
│  🏫 社交校园主界面（最外层）                                │
│                                                          │
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐         │
│  │ 🏫 学校 │  │ 🏠 班级 │  │ 👫 同桌 │  │ 📬 信箱 │         │
│  └────┬───┘  └────┬───┘  └────┬───┘  └────┬───┘         │
│       │           │           │           │              │
│       ▼           ▼           ▼           ▼              │
│   学校主页     课程班级主页  同桌互动     收发信件          │
│   ├ 校训/校徽  ├ 成员列表   ├ 同桌信息    ├ 收件箱         │
│   ├ 学校公告   ├ 座位表     ├ 传纸条🗒️   ├ 发件箱         │
│   ├ 校历      ├ 班级公告   ├ 共享笔记    ├ 草稿箱         │
│   ├ 课程列表   ├ 荣誉墙     ├ 默契值     ├ 班级公告(老师)   │
│   └ 校级活动   ├ 课程表     └ 小游戏     └ 系统通知        │
│               └ 邀请同桌                                  │
└──────────────────────────────────────────────────────────┘
```

### 核心交互流程

```
用户登录 → 进入社交校园主界面（四个大入口卡片）
                │
                ├── 点击「学校」→ 学校信息页（公告、校历、课程班级导航）
                ├── 点击「班级」→ 课程班级主页（成员、座位表、公告、荣誉墙）
                ├── 点击「同桌」→ 同桌互动面板（学生邀请制绑定 + 核心社交玩法）
                │       ├── 邀请/接受同桌
                │       ├── 传纸条（文字/涂鸦/贴纸）🔒老师不可见
                │       ├── 共享笔记
                │       └── 同桌小游戏
                └── 点击「信箱」→ 站内信系统（跨班级通信）🔒老师不可见个人信件
```

---

## 二、功能模块拆解

### 模块 1：社交校园主界面（最外层）

**四宫格入口 + 顶部状态栏**

```
┌─────────────────────────────────────────────┐
│  Hi, 张小明 👋    🔔 3条新消息    🗒️ 2张纸条  │  ← 顶部状态栏
├─────────────────────────────────────────────┤
│                                             │
│   ┌─────────────┐   ┌─────────────┐         │
│   │     🏫       │   │     🏠       │         │
│   │    学校      │   │    班级      │         │
│   │ 启明实验学校  │   │  Python入门班 │         │
│   └─────────────┘   └─────────────┘         │
│                                             │
│   ┌─────────────┐   ┌─────────────┐         │
│   │     👫       │   │     📬       │         │
│   │    同桌      │   │    信箱      │         │
│   │  李小红 💕    │   │  3封未读     │         │
│   └─────────────┘   └─────────────┘         │
│                                             │
└─────────────────────────────────────────────┘
```

| 入口卡片 | 显示内容 | 点击跳转 |
|---------|---------|----------|
| 🏫 学校 | 学校名称、校徽 | 学校主页（公告/校历/课程班级导航） |
| 🏠 班级 | 课程班级名称、授课老师 | 课程班级主页（成员/座位表/公告/荣誉） |
| 👫 同桌 | 同桌姓名、头像、默契值 | **同桌互动面板**（传纸条/收信/小游戏） |
| 📬 信箱 | 未读数 badge | 站内信系统（收件箱/发件箱/草稿） |

**技术选型：**

> 整体是 **Vue 组件 + 卡通插画 UI** 的导航式页面，不需要 2D 游戏引擎。  
> 所有入口卡片、按钮、图标均使用**手绘卡通插画风格**素材，不使用 Element Plus 默认按钮样式。  
> 座位表在「班级」子页面中用 CSS Grid + 卡通头像展示。  
> 传纸条动画用 CSS Animation 即可。

```json
{
  "新增依赖": {
    "socket.io-client": "^4.x"   // 实时通信（传纸条、在线状态）
  },
  "移除依赖（qiming-3d-classroom 模块）": {
    "three": "移除",
    "@pixiv/three-vrm": "移除"
  }
}
```

---

### 模块 2：同桌系统（核心玩法入口）

**点击主界面的「👫 同桌」进入 → 这是最核心的社交互动区**  
**学生自主邀请绑定同桌后，两人之间可以：传纸条、共享笔记、玩小游戏、积累默契值**  
**⚠️ 同桌绑定完全由学生发起邀请 → 对方确认 → 绑定成功，老师不参与指定**

#### 数据模型

```typescript
// 座位
interface Seat {
  id: number;
  row: number;           // 排号 (1-6)
  col: number;           // 列号 (1-8)
  classroomId: number;
  studentId?: number;     // 分配的学生（空座为 null）
  seatmateId?: number;   // 同桌座位的 id
}

// 同桌关系（学生邀请制）
interface SeatmateBinding {
  id: number;
  inviterId: number;      // 发起邀请的学生
  inviteeId: number;      // 被邀请的学生
  courseClassId: number;  // 课程班级 ID
  invitedAt: string;      // 邀请时间
  acceptedAt?: string;    // 接受时间
  status: 'pending' | 'active' | 'rejected' | 'dissolved';
}
```

#### 同桌互动面板（点击「同桌」后的界面）

```
┌─────────────────────────────────────────────┐
│  👫 我的同桌：李小红                          │
│  默契值：⭐⭐⭐☆☆ (65/100)                    │
├─────────────────────────────────────────────┤
│                                             │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐    │
│  │ 🗒️    │  │ 📝    │  │ 🎮    │  │ 📊    │    │
│  │传纸条 │  │共享   │  │小游戏 │  │默契   │    │
│  │      │  │笔记   │  │      │  │记录   │    │
│  └──────┘  └──────┘  └──────┘  └──────┘    │
│                                             │
│  📋 最近互动：                               │
│  · 李小红 给你传了一张纸条     3分钟前        │
│  · 你们一起完成了五子棋对局    1小时前        │
│  · 你分享了数学笔记           昨天           │
└─────────────────────────────────────────────┘
```

#### 功能清单

| 功能 | 描述 | 权限 |
|------|------|------|
| 邀请同桌 | **学生**向同班同学发起同桌邀请 | 学生 |
| 接受/拒绝邀请 | 被邀请的学生确认或拒绝同桌请求 | 学生 |
| 解除同桌 | 任意一方可解除同桌关系 | 同桌双方 |
| 查看同桌 | 主界面卡片直接显示同桌信息 | 学生 |
| 传纸条 | 同桌之间发送文字/涂鸦/贴纸纸条 🔒**老师不可查看** | 同桌双方 |
| 共享笔记 | 同桌共享课堂笔记 | 同桌双方 |
| 同桌小游戏 | 猜拳、五子棋等课间小游戏 | 同桌双方 |
| 默契值 | 互动积累默契值，解锁专属表情/勋章 | 同桌双方 |

#### 后端 API 设计

```
POST   /edu/seatmate/invite                # 发起同桌邀请（学生操作）
PUT    /edu/seatmate/invite/{id}/accept     # 接受同桌邀请
PUT    /edu/seatmate/invite/{id}/reject     # 拒绝同桌邀请
GET    /edu/seatmate/invite/pending         # 待处理的邀请列表
DELETE /edu/seatmate/dissolve              # 解除同桌关系（任意一方）
GET    /edu/seatmate/my                    # 获取我的同桌信息
GET    /edu/seatmate/score                 # 获取默契值
GET    /edu/seatmate/interactions          # 最近互动记录

POST   /edu/classroom/seat/assign          # 分配座位
PUT    /edu/classroom/seat/swap            # 换座
GET    /edu/classroom/{id}/seats           # 获取教室座位表
```

---

### 模块 3：课程班级 & 学校层级

**组织层级：学校 → 课程 → 课程班级 → 教室**  
**⚠️ 此处「班级」= 课程班级，即选了同一门课的学生自动组成的群体，基于已有的课程分配系统，不是学校行政年级班**

#### 数据模型

```typescript
interface School {
  id: number;
  name: string;          // "启明实验学校"
  code: string;          // 学校编码
  motto: string;         // 校训
  badge?: string;        // 校徽图片
}

// 课程班级（基于课程分配系统，选了同一门课的学生自动组成班级）
interface CourseClass {
  id: number;
  courseId: number;       // 关联的课程 ID（来自已有课程系统）
  courseName: string;     // "Python入门" / "高等数学"
  name: string;           // "Python入门-A班"
  teacherId: number;      // 授课老师
  classroomId: number;    // 关联教室
  motto?: string;         // 班级口号
  honor?: string[];       // 班级荣誉
  semester: string;       // "2025-2026-2" 学期
}

interface ClassMember {
  id: number;
  courseClassId: number;  // 课程班级 ID
  userId: number;
  role: 'student' | 'class_leader' | 'committee'; // 学生/班长/班委
  seatId?: number;
  joinedAt: string;       // 基于课程选课时间自动加入
}
```

#### 功能清单

#### 「学校」页面布局

```
┌─────────────────────────────────────────────┐
│  🏫 启明实验学校                              │
│  校训：博学笃行，知行合一                      │
├─────────────────────────────────────────────┤
│  📢 学校公告                                 │
│  · 春季运动会报名通知          2026-03-10     │
│  · 期中考试安排               2026-03-15     │
├─────────────────────────────────────────────┤
│  📅 校历  │  🏆 校级活动  │  📋 课程班级导航    │
│           │             │  └ Python入门      │
│           │             │    ├ A班           │
│           │             │    ├ B班           │
│           │             │    └ C班 ← 我      │
└─────────────────────────────────────────────┘
```

#### 「班级」页面布局

```
┌─────────────────────────────────────────────┐
│  🏠 Python入门-A班    授课老师：王老师          │
├──────┬──────┬──────┬──────┬──────────────────┤
│ 成员 │ 座位表│ 公告 │ 荣誉墙│ 课程表           │
├──────┴──────┴──────┴──────┴──────────────────┤
│  [当前 Tab 的内容区域]                        │
│                                             │
│  成员列表示例：                               │
│  👤 张小明 (班长)    👤 李小红 (学委)          │
│  👤 王大力           👤 赵小花               │
│  ...                                        │
│                                             │
│  座位表示例（CSS Grid 可视化）：               │
│  ┌──┐ ┌──┐   ┌──┐ ┌──┐   ┌──┐ ┌──┐         │
│  │张│ │李│   │王│ │赵│   │刘│ │陈│         │
│  └──┘ └──┘   └──┘ └──┘   └──┘ └──┘         │
│  ┌──┐ ┌──┐   ┌──┐ ┌──┐   ┌──┐ ┌──┐         │
│  │..│ │..│   │..│ │..│   │..│ │..│         │
│  └──┘ └──┘   └──┘ └──┘   └──┘ └──┘         │
│       [黑板]                                 │
└─────────────────────────────────────────────┘
```

#### 功能清单

| 功能 | 描述 |
|------|------|
| 学校总览 | 学校基本信息、校训、校徽、公告、校历 |
| 课程班级导航 | 从学校页面按课程分类 → 查看课程下的所有班级 |
| 课程班级主页 | Tab 切换：成员列表 / 座位表 / 班级公告 / 荣誉墙 / 课程表 |
| 座位表 | CSS Grid 可视化座位排列，显示同桌配对关系（高亮）—— 同桌由学生自主邀请 |
| 班级管理 | 老师发布班级公告、设定班委；**老师不能查看学生纸条/信件** |
| 跨班互动 | 从学校→课程→其他课程班级，可查看公开信息 |

#### 后端 API 设计

```
GET    /edu/school/{id}                    # 学校信息
GET    /edu/school/{id}/courses             # 课程列表（替代年级列表）
GET    /edu/course/{id}/classes             # 课程下的班级列表
GET    /edu/course-class/{id}              # 课程班级详情
GET    /edu/course-class/{id}/members      # 课程班级成员（基于选课自动生成）
PUT    /edu/course-class/{id}/member/{mid}/role  # 设置角色
GET    /edu/course-class/{id}/classroom    # 关联教室
```

---

### 模块 4：传纸条系统 📝

**从同桌互动面板进入 → 同桌之间最核心的轻量沟通方式**  
**随手写个小纸条，有课堂偷偷传纸条的感觉**  
**🔒 隐私保护：纸条内容仅同桌双方可见，老师/管理员无权查看**

#### 数据模型

```typescript
interface Note {
  id: number;
  senderId: number;
  receiverId: number;
  classroomId: number;
  content: string;         // 纸条内容（最多 200 字）
  type: 'text' | 'doodle' | 'sticker'; // 文字/涂鸦/贴纸
  doodleData?: string;     // 涂鸦的 canvas 数据（base64）
  status: 'sending' | 'delivered' | 'read';
  createdAt: string;
  readAt?: string;
  isAnonymous: boolean;    // 匿名纸条
}
```

#### 功能清单

| 功能 | 描述 |
|------|------|
| 写纸条 | 输入文字 / 手绘涂鸦 / 选择贴纸表情 |
| 一键发送 | 同桌互动面板内直接发，不需要选人 |
| 纸条飞入动画 | 发送/收到时有一个纸条折叠飞入的 CSS 动画 |
| 纸条箱 | 我收到的纸条 / 我发出的纸条，可收藏 |
| 匿名纸条 | 可选择匿名发送（非同桌，在班级信箱中使用） |
| 实时推送 | 同桌在线时纸条实时到达，离线时下次登录提醒 |

#### 后端 API 设计

```
POST   /edu/note/send                     # 发送纸条
GET    /edu/note/inbox                     # 收件箱
GET    /edu/note/outbox                    # 发件箱
PUT    /edu/note/{id}/read                 # 标记已读
DELETE /edu/note/{id}                      # 删除纸条
GET    /edu/note/seatmate                  # 同桌纸条快捷列表
```

#### WebSocket 事件

```typescript
// 实时推送
socket.on('note:incoming', (note) => { /* 新纸条到达 */ });
socket.on('note:read',     (noteId) => { /* 对方已读 */ });
```

---

### 模块 5：信箱 / 站内信系统 ✉️

**与纸条不同，信箱是正式的站内信，跨课程班级可用**  
**🔒 隐私保护：学生之间的个人信件仅收发双方可见，老师/管理员无权查看；老师只能通过「班级公告」功能群发通知**

#### 数据模型

```typescript
interface Letter {
  id: number;
  senderId: number;
  receiverId: number;
  subject: string;          // 信件主题
  content: string;          // 信件正文（支持富文本）
  attachments?: string[];   // 附件（图片/文档链接）
  type: 'personal' | 'class_announcement' | 'school_notice' | 'teacher_feedback';
  priority: 'normal' | 'urgent';
  status: 'unread' | 'read' | 'replied' | 'archived';
  createdAt: string;
  readAt?: string;
  replyTo?: number;         // 回复某封信
}

interface Mailbox {
  inbox: Letter[];
  outbox: Letter[];
  drafts: Letter[];
  archived: Letter[];
  unreadCount: number;
}
```

#### 功能清单

| 功能 | 描述 |
|------|------|
| 写信 | 选收件人 + 主题 + 正文 + 附件（🔒仅收发双方可见） |
| 收信箱 | 按时间/类型筛选，未读标记，紧急信件置顶 |
| 发信箱 | 已发出的信件，可查看已读状态 |
| 草稿箱 | 自动保存 + 手动保存草稿 |
| 回信 | 引用原文回复 |
| 班级公告 | **仅老师**可发布班级公告（公告≠私信，老师不能查看学生私信） |
| 系统通知融合 | 将现有 `system-notification` 接入信箱体系 |

#### 后端 API 设计

```
POST   /edu/letter/send                   # 发送信件
GET    /edu/letter/inbox                   # 收件箱
GET    /edu/letter/outbox                  # 发件箱
GET    /edu/letter/drafts                  # 草稿箱
PUT    /edu/letter/{id}/read               # 标记已读
PUT    /edu/letter/{id}/archive            # 归档
POST   /edu/letter/draft/save              # 保存草稿
POST   /edu/letter/class-announcement      # 班级公告（仅老师可发，不能查看学生私信）
GET    /edu/letter/unread-count            # 未读数
```

---

### 模块 6：社交互动扩展

| 功能 | 优先级 | 描述 |
|------|--------|------|
| 好友系统 | P1 | 添加好友、好友列表、在线状态 |
| 同桌默契值 | P2 | 同桌互动积累"默契值"，解锁特殊互动（如同桌专属表情） |
| 班级荣誉墙 | P2 | 班级集体荣誉展示、流动红旗 |
| 课间小游戏 | P3 | 同桌/好友之间的小游戏（猜拳、五子棋等） |
| 心愿墙 | P3 | 匿名/实名发布心愿，他人可帮忙实现 |
| 时间胶囊 | P3 | 写给未来自己/同学的信，定时投递 |

---

## 三、前端文件结构规划

```
src/views/social-campus/              # 社交校园模块（替代 qiming-3d-classroom）
├── index.vue                         # 主界面（四宫格入口：学校/班级/同桌/信箱）
│
├── school/                           # 🏫 学校子模块
│   ├── index.vue                     # 学校主页（校训/公告/校历）
│   ├── CourseClassNav.vue            # 课程班级导航
│   └── SchoolNotice.vue              # 学校公告详情
│
├── classroom/                        # 🏠 班级子模块
│   ├── index.vue                     # 班级主页（Tab 容器）
│   ├── MemberList.vue                # 成员列表 Tab
│   ├── SeatGrid.vue                  # 座位表 Tab（CSS Grid 可视化）
│   ├── SeatItem.vue                  # 单个座位组件
│   ├── ClassNotice.vue               # 班级公告 Tab
│   ├── HonorWall.vue                 # 荣誉墙 Tab
│   └── Schedule.vue                  # 课程表 Tab
│
├── seatmate/                         # 👫 同桌子模块（核心互动）
│   ├── index.vue                     # 同桌互动面板
│   ├── NoteComposer.vue              # 写纸条（文字/涂鸦/贴纸）
│   ├── NoteBox.vue                   # 纸条箱（收到的/发出的）
│   ├── SharedNotes.vue               # 共享笔记
│   ├── MiniGame.vue                  # 同桌小游戏（猜拳/五子棋）
│   └── AffinityScore.vue             # 默契值展示
│
├── mailbox/                          # 📬 信箱子模块
│   ├── index.vue                     # 信箱主页（收件箱/发件箱/草稿）
│   ├── LetterComposer.vue            # 写信
│   ├── LetterDetail.vue              # 信件详情
│   └── LetterList.vue                # 信件列表
│
├── components/                       # 公共组件
│   ├── CampusCard.vue                # 主界面入口卡片
│   ├── StudentAvatar.vue             # 学生头像组件
│   ├── NoteFlyAnimation.vue          # 纸条飞入动画（CSS）
│   ├── UnreadBadge.vue               # 未读数角标
│   └── OnlineIndicator.vue           # 在线状态指示灯
│
├── composables/
│   ├── useSeatmate.ts                # 同桌关系逻辑
│   ├── useNotes.ts                   # 纸条收发逻辑
│   ├── useMailbox.ts                 # 信箱逻辑
│   └── useWebSocket.ts              # WebSocket 连接管理
│
└── types/
    └── campus.ts                     # TypeScript 类型定义

src/api/
├── school.ts                         # 学校/课程班级 API
├── seatmate.ts                       # 同桌 API
├── note.ts                           # 纸条 API
├── letter.ts                         # 信箱 API
└── social.ts                         # 社交互动 API（默契值等）

src/store/modules/
├── campus.ts                         # 校园状态（当前学校/班级/同桌信息）
└── mailbox.ts                        # 信箱状态（未读数等）

src/router/modules/
└── social-campus.ts                  # 路由配置
```

### 路由设计

```typescript
// src/router/modules/social-campus.ts
export default {
  path: "/social-campus",
  name: "SocialCampus",
  redirect: "/social-campus/home",
  children: [
    { path: "home",     component: () => import("@/views/social-campus/index.vue") },       // 四宫格主页
    { path: "school",   component: () => import("@/views/social-campus/school/index.vue") }, // 学校
    { path: "class",    component: () => import("@/views/social-campus/classroom/index.vue") }, // 班级
    { path: "seatmate", component: () => import("@/views/social-campus/seatmate/index.vue") }, // 同桌
    { path: "mailbox",  component: () => import("@/views/social-campus/mailbox/index.vue") },  // 信箱
  ]
};
```

---

## 四、后端需要准备的内容

### 数据库表设计

| 表名 | 用途 |
|------|------|
| `school` | 学校信息 |
| `course_class` | 课程班级（基于课程分配，替代传统年级班） |
| `course_class_member` | 课程班级成员关系（基于选课自动生成） |
| `classroom` | 教室信息 |
| `seat` | 座位表 |
| `seatmate_binding` | 同桌邀请/绑定关系（学生发起） |
| `note` | 纸条 |
| `letter` | 信件 |
| `letter_attachment` | 信件附件 |
| `friend_relation` | 好友关系 |
| `seatmate_score` | 同桌默契值 |

### WebSocket 服务

```
需新增 WebSocket 网关，用于：
- 纸条实时投递
- 信件实时通知
- 在线状态广播（座位上显示绿点/灰点）
```

### 权限控制

```
school:manage        → 学校管理员
class:manage         → 授课老师（发布班级公告、设定班委）
seat:assign          → 分配座位（老师）
seatmate:invite      → 发起同桌邀请（学生，老师不参与）
note:send            → 发送纸条（学生，🔒老师不可查看内容）
letter:send          → 发送信件（学生，🔒老师不可查看内容）
letter:announcement  → 发布班级公告（仅老师）
```

> **隐私边界**：老师可以看到纸条/信件的「发送数量统计」，但**不能查看具体内容**。  
> 老师唯一的通信方式是「班级公告」，公告对全班可见。

---

## 五、实施路线图

### Phase 1：四宫格主页 + 课程班级 + 同桌邀请
- [ ] 社交校园主界面（四宫格卡通插画入口卡片）
- [ ] 学校信息页（静态展示：校训/公告/校历）
- [ ] 课程班级主页（基于课程分配的成员列表 + 座位表 CSS Grid）
- [ ] 同桌邀请制（学生发邀请 → 对方确认 → 绑定）
- [ ] 对应后端 API + 数据库表

### Phase 2：同桌互动（传纸条）
- [ ] 同桌互动面板 UI
- [ ] 传纸条（文字/贴纸 + 飞入动画）
- [ ] 纸条箱（收到的/发出的）
- [ ] WebSocket 实时推送纸条

### Phase 3：信箱 + 增强
- [ ] 站内信系统（收件箱/发件箱/草稿/班级群发）
- [ ] 班级公告 + 荣誉墙
- [ ] 同桌默契值系统
- [ ] 通知栏集成（顶部 badge 未读数）

### Phase 4：社交扩展
- [ ] 同桌小游戏（猜拳/五子棋）
- [ ] 共享笔记
- [ ] 涂鸦纸条（canvas 手绘）
- [ ] 心愿墙 + 时间胶囊（写给未来的信）

---

## 六、你现在需要准备的事项清单

### 🎨 设计 & 素材

1. **确定视觉风格 — 卡通插画风（核心要求）**
   - **必须**：全平台采用 **卡通手绘插画风格**，温暖可爱，面向学生群体
   - 四宫格入口 = **四张精美卡通插画卡片**（不是死板的按钮或纯色块）
   - 每个入口卡片是一幅完整的场景插画（学校建筑/教室/同桌互动/信箱场景）
   - 所有按钮、图标、装饰元素均使用手绘卡通风格，不使用 Element Plus 默认组件样式
   - 配色：**暖色调 + 柔和渐变**，像儿童绘本一样温馨
   - 座位表用卡通风格的 CSS Grid + Q版圆润小头像

2. **准备核心素材（卡通插画为主）**
   - 🎨 四宫格入口的**场景插画**（学校/班级/同桌/信箱 各一张完整插画）
   - 🎨 卡通风格的按钮/卡片背景（圆角、手绘边框、柔和阴影）
   - 学生 Q 版头像（可用系统默认卡通头像 + 支持上传自定义头像）
   - 卡通手绘图标集（纸条✉️、信封📬、铃铛🔔、星星⭐、爱心❤️等）
   - 纸条相关的贴纸/表情包素材（手绘风格）
   - 音效素材（翻纸声、铃铛声、成功提示音）

3. **原型 / 交互设计**
   - 四宫格主页布局
   - 同桌互动面板的交互流程
   - 传纸条的写/发/收流程
   - 班级座位表的可视化布局

### 💻 技术准备

4. **前端**
   - 安装 socket.io-client：`pnpm add socket.io-client`
   - 在 `src/views/social-campus/` 下创建模块目录
   - 在路由中注册新模块
   - 不需要额外渲染引擎，用 Vue + 卡通插画素材 + CSS 即可（Element Plus 仅用于表单/表格等基础布局，不用其按钮样式）

5. **后端**
   - 设计并创建数据库表（见上面的表设计）
   - 实现座位/同桌/班级 RESTful API
   - 搭建 WebSocket 网关服务（推荐 Netty / Spring WebSocket / Node.js Socket.IO）
   - 纸条/信件的存储与投递逻辑

6. **基础设施**
   - WebSocket 服务部署方案（Nginx 转发 ws://）
   - 文件存储（信件附件、涂鸦图片）
   - Redis 缓存在线状态

> **架构简化说明**：因为采用导航式 UI + 角色固定在座位，前端不需要：
> - 2D/3D 渲染引擎（PixiJS/Three.js 均不需要）
> - 角色行走动画 / 路径寻找 / 碰撞检测
> - 帧同步 / 位置广播
>
> 用 **Vue + 卡通插画素材 + CSS** 就能实现全部功能，Element Plus 仅做基础布局辅助。

### 📋 产品决策

7. **确认关键决策**（已确认 ✅ / 待确认 ❓）
   - ✅ 角色固定在座位上，不可走动
   - ✅ 最外层是导航式入口（学校/班级/同桌/信箱），不是教室地图
   - ✅ 点击「同桌」进入两人互动面板
   - ✅ **同桌 = 学生邀请制**（学生发邀请，对方确认绑定，老师不指定）
   - ✅ **隐私保护**（老师不能看纸条/信件内容，只能发班级公告）
   - ✅ **班级 = 课程班级**（基于课程分配系统，不是学校年级班）
   - ✅ **UI = 卡通插画风格**（入口卡片/按钮/图标全部使用手绘插画）
   - ❓ 纸条是否只限同桌之间？还是可以发给班级任何人？
   - ❓ 匿名纸条是否有限制（每天限量/需消耗积分）？
   - ❓ 信箱是否与现有通知系统合并？

---

## 七、快速原型示例代码

### 主界面四宫格

```vue
<template>
  <div class="campus-home">
    <div class="status-bar">
      <span>Hi, {{ userName }} 👋</span>
      <span>🔔 {{ unreadNotes }}条纸条</span>
      <span>📬 {{ unreadLetters }}封未读</span>
    </div>
    <div class="entry-grid">
      <div class="entry-card school" @click="$router.push('/social-campus/school')">
        <div class="icon">🏫</div>
        <div class="label">学校</div>
        <div class="desc">{{ schoolName }}</div>
      </div>
      <div class="entry-card class" @click="$router.push('/social-campus/class')">
        <div class="icon">🏠</div>
        <div class="label">班级</div>
        <div class="desc">{{ className }}</div>
      </div>
      <div class="entry-card seatmate" @click="$router.push('/social-campus/seatmate')">
        <div class="icon">👫</div>
        <div class="label">同桌</div>
        <div class="desc">{{ seatmateName }}</div>
      </div>
      <div class="entry-card mailbox" @click="$router.push('/social-campus/mailbox')">
        <div class="icon">📬</div>
        <div class="label">信箱</div>
        <div class="desc">{{ unreadLetters }}封未读</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.entry-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  padding: 20px;
  max-width: 500px;
  margin: 0 auto;
}
.entry-card {
  border-radius: 16px;
  padding: 24px;
  text-align: center;
  cursor: pointer;
  transition: transform 0.2s;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}
.entry-card:hover { transform: translateY(-4px); }
.entry-card .icon { font-size: 48px; }
.entry-card .label { font-size: 18px; font-weight: bold; margin: 8px 0 4px; }
.entry-card .desc { font-size: 13px; color: #888; }
.entry-card.school { background: linear-gradient(135deg, #e8f5e9, #c8e6c9); }
.entry-card.class { background: linear-gradient(135deg, #e3f2fd, #bbdefb); }
.entry-card.seatmate { background: linear-gradient(135deg, #fce4ec, #f8bbd0); }
.entry-card.mailbox { background: linear-gradient(135deg, #fff3e0, #ffe0b2); }
</style>
```

### 同桌互动面板

```vue
<template>
  <div class="seatmate-panel">
    <div class="seatmate-header">
      <img :src="seatmate.avatar" class="avatar" />
      <div>
        <h2>👫 我的同桌：{{ seatmate.name }}</h2>
        <div class="affinity">默契值：⭐ {{ affinityScore }}/100</div>
      </div>
    </div>
    <div class="action-grid">
      <div class="action-btn" @click="showNoteComposer = true">🗒️<br>传纸条</div>
      <div class="action-btn" @click="goSharedNotes">📝<br>共享笔记</div>
      <div class="action-btn" @click="goMiniGame">🎮<br>小游戏</div>
      <div class="action-btn" @click="goAffinityLog">📊<br>默契记录</div>
    </div>
    <div class="recent-interactions">
      <h3>📋 最近互动</h3>
      <div v-for="item in recentLogs" :key="item.id" class="log-item">
        {{ item.description }} <span class="time">{{ item.timeAgo }}</span>
      </div>
    </div>
  </div>
</template>
```

这就是纯 Vue + CSS 的方案，整个核心可以快速搭起来。

---

*文档版本: v3.0 | 更新时间: 2026-03-08*  
*v2.0 变更：确认导航式 UI 架构（非教室地图），角色固定在座位，同桌面板为核心互动入口*  
*v3.0 变更：① 同桌改为学生邀请制 ② 隐私保护（老师不可查看纸条/信件） ③ 班级改为课程班级 ④ UI 改为卡通插画风格*
