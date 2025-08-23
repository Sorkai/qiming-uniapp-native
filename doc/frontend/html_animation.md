# AI动画 页面说明

该页面用于教师/管理员生成并管理课程章节的 HTML 动画版本，并设置章节对学生展示的版本。

## 功能概览
- 课程 + 章节选择（进入章节后展示动画任务列表）
- 生成动画：触发后端生成任务；若已有进行中任务将返回已有任务（后端幂等）
- 轮询刷新：存在 processing 任务时自动每 5s 刷新，可手动“停止轮询”
- 动画任务列表：展示版本号、状态、文件名、大小、时间、展示标记、错误信息
- 过滤/搜索：按状态筛选（全部/成功/进行中/失败）与文件名关键字过滤
- 设为展示：将某版本设为当前章节展示版本
- 一键设展示=最新：取当前章节最新成功版本号设为展示
- 强制同步：全局同步所有章节远端成功版本，完成后刷新当前列表
- 预览：iframe 弹窗预览已完成版本；支持新窗口打开、复制 URL
- 统计信息：顶部展示当前章节成功/进行中/失败数量、展示版本、最近成功时间

## 接口调用
| 操作 | 接口 | 说明 |
|------|------|------|
| 生成动画 | POST /edu/backend/v1/html-animation/generate | 提交后端任务，返回 taskId |
| 动画列表 | GET /edu/backend/v1/html-animation/list | 获取章节所有任务与展示版本 |
| 设置展示版本 | POST /edu/backend/v1/html-animation/display/set | 传入 version(数字或latest) |
| 强制同步 | POST /edu/backend/v1/html-animation/sync | 同步所有章节成功版本 |

## 轮询策略
- 进入列表或生成后发现存在 `processing` 任务启动轮询
- 间隔：5 秒
- 条件：无 processing 任务或手动停止时结束

## 扩展点（后续可选）
- 添加“删除失败任务”接口支持（待后端提供）
- 失败任务重试按钮：重新生成
- 版本差异/版本标签（可为版本加备注）
- 域名配置：若需拼接 objectName -> 统一由配置注入

## 代码位置
- 页面：`src/views/course/animation/index.vue`
- API：`src/api/htmlAnimation.ts`
- 路由：`src/router/modules/course.ts` (子路由 `/course/animation`)

## 多语言
当前仅添加了中文 keys，后续可在其它语言文件补充对应翻译。
