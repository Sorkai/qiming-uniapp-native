# 前端 AI 助手开发文档（含全屏与学生端）

基础前缀：`/edu/frontend/v1`

## 1. 文档目标

本文件用于统一以下能力的开发与联调规范。

- 课程内 AI 助手流式问答。
- AI 助手面板的全屏/退出全屏交互。
- 学生端接入同款 AI 助手并保持视觉特效一致。

当前统一组件：`src/views/account/course-detail/CourseAIHelper.vue`

## 2. 接口清单

### 2.1 截图提问通用接口

- 地址：`POST /edu/v1/ai/screen/analyze`
- Content-Type：`application/json`
- 鉴权：JWT（按当前后端配置）

请求参数：

```json
{
  "image": "base64",
  "question": "string"
}
```

响应参数：

```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "answer": "string",
    "suggestions": ["string"]
  }
}
```

说明：

- 前端当前按“单通用接口”模式实现。
- 不在文档中维护历史记录接口。

## 3. 全屏 AI 助手交互规范

统一在 `CourseAIHelper.vue` 实现，规则如下。

- 默认态：右上角悬浮入口卡片，点击后展开对话面板。
- 全屏态：点击头部“全屏显示”按钮后，占满视口（`100vw x 100vh`）。
- 退出全屏：再次点击按钮，或按 `Esc`。

`Esc` 键行为：

1. 若当前为全屏，先退出全屏。
2. 若当前非全屏，关闭对话面板。

动画与特效保持：

- 边框跑马灯渐变特效。
- 对话面板滑入/滑出过渡。
- AI 打字点动画。
- 毛玻璃背景与明暗主题适配。

## 4. 学生端对齐方案（仅课程页面）

说明：学生端除了课程内 AI 助教对话外，额外接入了“截图提问 AI 小球”（与教师/管理端同款能力）。

截图提问约定：

- 前端只走一个通用 AI 接口，直接上传图片并附带问题。
- 不接入错题分析历史、截图历史会话等额外流程。

### 4.1 接入页面

- 文件：`src/views/account/course-detail.vue`
- 方式：学生端仅在课程学习页面使用 AI 助手，其他学生页面不接入。

### 4.2 传参策略

- `course-id`：传当前课程 `courseId`。
- `chapter-id`：按当前学习章节传入，可为空。
- `current-theme`：跟随课程页面主题（`dark/light`）。

### 4.3 一致性要求

- 与课程学习页使用同一组件、同一交互、同一特效。
- 不允许学生端单独改动画节奏或色彩参数。
- 如需改视觉效果，只在共享组件统一改动。

### 4.4 显示与屏蔽规则

- 显示：仅在学生端课程页面的 `course-learn` 菜单显示截图提问小球。
- 屏蔽：`homework-exam`、`grades`、`html-animations`、`mastery`、`course-qa` 菜单全部不显示。
- 角色限制：教师端和管理端课程页不显示学生端这颗小球。

## 5. 代码位置

- AI 接口封装：`src/api/frontend/chat.ts`
- AI 助手组件：`src/views/account/course-detail/CourseAIHelper.vue`
- 截图提问小球组件：`src/components/AiScreenCapture/index.vue`
- 课程页接入：`src/views/account/course-detail.vue`

## 6. 联调与验收清单

1. 打开课程页 AI 助手，发送消息，确认流式回复正常。
2. 点击全屏按钮，确认面板铺满视口，`Esc` 可退出全屏。
3. 学生角色进入课程页 `course-learn`，确认截图提问小球可见且可截图发问。
4. 切换到作业考试、成绩等菜单，确认截图提问小球被隐藏。
5. 切换明暗主题，确认对话面板背景与文本对比度正常。
6. 断网或接口失败时，确认前端有兜底提示且不阻塞页面主流程。
