# A3 赛题后端需求文档

## 1. 文档目标

本文档用于指导后端 AI 开发同学完成 `A3-基于大模型的个性化资源生成与学习多智能体系统开发` 的后端建设。

本文件不是泛泛的赛题理解，而是基于当前仓库真实前端结构整理出的可执行需求，重点回答以下问题：

- A3 功能在本项目里到底归属到哪里
- 后端应该给哪些页面供数
- 提问时是否必须带课程
- 是否需要挂 `Agent / Skill / Model / ThinkingMode`
- 会话历史如何按课程组织
- 教师模式下如何指定学生
- 3D 数字人如何和后端返回结果联动
- 学习助手如何与课程、作业、考试、错题、资源、讨论等模块联动，而不是成为孤岛

## 2. 赛题信息

- 赛题名称：`A3-基于大模型的个性化资源生成与学习多智能体系统开发`
- 发布时间：`2026-04-01 15:32:46`
- 出题企业：`科大讯飞股份有限公司`
- 赛题页面：<https://www.cnsoftbei.com/content-3-1286-1.html>

## 3. 本项目中的 A3 功能边界

### 3.1 A3 主体功能归属

A3 主体功能在本项目中**统一归属到 `Ai App / 学习助手` 路由**。

对应路由文件：

- `src/router/modules/ai-app.ts`
- `src/router/modules/remaining.ts`

对应主要入口：

- `/ai-app/*`
- `/account/ai-app`

### 3.2 A3 主体菜单与后端映射

学习助手当前已有 7 个一级业务菜单，后端需要围绕这 7 个菜单提供真实数据与真实能力：

| 菜单 key | 前端文案 | 后端职责 |
| --- | --- | --- |
| `chat` | 互动答疑 | 会话、流式回答、课程上下文、Agent/Skill、数字人参数 |
| `generation` | 教学资源 | 资源生成任务中心、产物管理、进度状态 |
| `agentpdf` | 资料研读 | 文档解析、资料问答、知识抽取、引用能力 |
| `path` | 学习计划 | 个性化学习路径、重规划、节点推进 |
| `profile` | 学情分析 | 学习画像、知识掌握图谱、标签系统 |
| `assessment` | 测验评估 | 评估报告、强弱项、建议、是否重规划 |
| `automation` | 常规任务 | 定时推荐、周报、预习推送、提醒任务 |

### 3.3 A3 主体页面

后端应该直接对接以下页面/组件：

- `src/views/account/ai-app/index.vue`
- `src/views/account/ai-app/components/AiChatModule.vue`
- `src/views/account/ai-app/components/AiSidebar.vue`
- `src/views/account/ai-app/components/AiInspector.vue`
- `src/views/account/ai-app/components/AiResourceGeneration.vue`
- `src/views/account/ai-app/components/AiLearningPath.vue`
- `src/views/account/ai-app/components/AiLearningProfile.vue`
- `src/views/account/ai-app/components/AiAssessment.vue`
- `src/views/account/ai-app/components/VirtualHumanPanel.vue`

### 3.4 不属于 A3 主体的 AI 页面

以下页面虽然也有 AI，但**不作为 A3 主体后端范围**：

- 课程详情页中的课程内 AI 助教
- 课程问答页
- 课程截图提问
- 独立 `chat-ai` 页面

这些能力最多作为可复用底层能力存在，但不能反向定义 A3 的接口设计。

## 4. 当前前端真实结构结论

基于仓库代码，当前前端已经体现出以下真实业务约束，后端必须正视，而不是只做一个“message -> answer”接口。

### 4.1 会话按课程组织

`AiSidebar.vue` 当前已经按课程组织会话，并有“最近历史”区域。

这意味着后端必须支持：

- 用户可用课程列表
- 按课程分组会话
- 查询某课程下的会话历史
- 查询最近会话

### 4.2 提问界面已有这些上下文选择器

`AiChatModule.vue` 当前已经有以下选择器：

- 当前课程
- 模式：学生模式 / 教师模式
- 智能体：`selectedAgent`
- 思考模式：`thinkingMode`
- 模型：`selectedModel`

这意味着后端不能忽略这些参数。即使某些值当前是前端演示值，协议层也必须预留。

### 4.3 教师模式支持指定学生

`account/ai-app/index.vue` 中已经存在：

- `selectedStudentId`
- 教师模式与学生模式切换

这意味着后端必须支持：

- 教师指定学生进行分析
- 校验教师与学生/课程之间的关系
- 使用目标学生的画像、路径、评估、学习记录进行推理

### 4.4 3D 数字人不是装饰

`VirtualHumanPanel.vue` 当前已经具备：

- `speak(text)`
- `pauseRender()`
- `resumeRender()`
- 基于 iframe + `postMessage` 的控制方式

这说明前端已经有数字人容器，后端现在缺的不是“能不能显示 3D 人”，而是：

- 回答时返回数字人表现参数
- 让文本回答、语气、动作、情绪一致

## 5. 本期后端建设总目标

后端本期应完成六类核心服务：

1. 学习画像服务
2. 资源生成任务中心
3. 个性化学习路径服务
4. 学习助手对话服务
5. 3D 数字人驱动服务
6. 学习效果评估服务

此外，后端必须保证学习助手与整个平台的数据联动，而不是孤立系统。

## 6. 关键设计结论

这一节直接写死建议，避免后端拿到文档后还要猜。

### 6.1 提问时是否必须带课程

结论：**在 `scene = learning_assistant` 场景下，默认必须带 `course_id`。**

原因：

- 当前前端会话按课程分组
- 画像、路径、评估、资源推荐都与课程强绑定
- 不带课程就无法按课程追踪会话和效果

例外：

- 仅当用户明确发起“通用会话”时，才允许 `course_id = null`
- 通用会话必须单独归类，不得混入课程会话组

### 6.2 是否需要挂 `Agent / Skill`

结论：**需要，而且应明确区分两者。**

建议定义：

- `selected_agent`
  - 表示当前主执行智能体
- `skill_keys`
  - 表示当前挂载的能力标签/工具标签

建议原则：

- 一个会话有 1 个主 `Agent`
- 一个会话可带多个 `Skill`
- 若前端未传，后端可按场景自动补默认值

### 6.3 是否需要挂模型与思考模式

结论：**需要。**

建议支持：

- `selected_model`
- `thinking_mode`

原因：

- 前端已经有模型与思考模式选择器
- 后端需要在日志、实验、效果分析、AB 对比中保留这些上下文

### 6.4 是否单独建设 `/assistant/*` 接口族

结论：**建议建设。**

原因：

- 现有 `/edu/frontend/v1/ai/conversations` 可作为通用会话底座
- 但学习助手还需要额外语义：
  - 课程分组
  - Agent/Skill
  - 目标学生
  - 模型与思考模式
  - 数字人参数
  - 场景固定为学习助手

因此建议：

- 继续保留现有通用会话能力
- 为 A3 学习助手单独暴露 `/edu/frontend/v1/assistant/*`
- 内部是否复用同一张会话表，由后端自行决定

## 7. 后端功能需求详述

## 7.1 学习画像服务

### 7.1.1 目标

通过对话、学习行为、作业成绩、考试成绩、错题数据、资源使用记录，构建动态学生画像，作为资源生成、路径规划和评估的输入。

### 7.1.2 画像维度要求

画像至少包含以下维度：

- 知识基础
- 学习进度
- 认知风格
- 易错点偏好
- 资源偏好
- 自主学习能力

建议进一步扩展：

- 学习目标清晰度
- 时间偏好
- 探索欲
- 抗挫折能力

### 7.1.3 输入来源

- 学生主动对话内容
- 课程学习进度
- 作业成绩
- 考试成绩
- 错题频次与错题类型
- 资源点击、停留时长、完成率
- 讨论区/问答区提问主题

### 7.1.4 建议接口

#### 初始化画像

- `POST /edu/frontend/v1/learner-profile/init-by-chat`

#### 增量更新画像

- `POST /edu/frontend/v1/learner-profile/update`

#### 查询画像详情

- `GET /edu/frontend/v1/learner-profile/detail?course_id=101`

#### 查询知识掌握图谱

- `GET /edu/frontend/v1/learner-profile/knowledge-map?course_id=101`

## 7.2 资源生成任务中心

### 7.2.1 目标

根据课程内容、学生画像、短板和目标，生成个性化学习资源。

### 7.2.2 至少支持的资源类型

- 讲解文档
- PPT/讲义
- 思维导图
- 练习题/题组
- 拓展阅读
- 视频/动画
- 代码实操案例

### 7.2.3 多智能体建议分工

- 画像分析智能体
- 课程理解智能体
- 资源规划智能体
- 文档生成智能体
- 题目生成智能体
- 视频/动画脚本智能体
- 代码案例生成智能体
- 质量审校智能体
- 安全过滤智能体

### 7.2.4 建议接口

#### 创建任务

- `POST /edu/frontend/v1/resource-task/create`

#### 查询任务列表

- `GET /edu/frontend/v1/resource-task/list`

#### 查询任务详情

- `GET /edu/frontend/v1/resource-task/detail/{task_id}`

#### 查询任务进度

- `GET /edu/frontend/v1/resource-task/progress/{task_id}`

#### 重试任务

- `POST /edu/frontend/v1/resource-task/retry`

#### 查询资源列表

- `GET /edu/frontend/v1/resource/list`

#### 查询资源详情

- `GET /edu/frontend/v1/resource/detail/{resource_id}`

## 7.3 个性化学习路径服务

### 7.3.1 目标

根据画像、课程目标、学习进度和知识短板生成动态学习路径。

### 7.3.2 路径结构建议

建议采用三层结构：

- Path
- Phase
- Node

节点类型建议：

- `video`
- `doc`
- `quiz`
- `code`
- `task`
- `review`

### 7.3.3 建议接口

#### 生成初始路径

- `POST /edu/frontend/v1/learning-path/generate`

#### 路径重规划

- `POST /edu/frontend/v1/learning-path/replan`

#### 获取路径详情

- `GET /edu/frontend/v1/learning-path/detail?course_id=101`

#### 节点完成

- `POST /edu/frontend/v1/learning-path/node/complete`

#### 获取当前推荐资源

- `GET /edu/frontend/v1/learning-path/recommendations?course_id=101`

## 7.4 学习助手对话服务

### 7.4.1 目标

将学习助手中的对话模块建设为带课程、画像、路径、资源、目标学生上下文的个性化学习助手，而不是普通聊天窗口。

### 7.4.2 请求协议要求

学习助手对话请求建议支持以下字段：

- `scene`
- `course_id`
- `chapter_id`
- `conversation_id`
- `message`
- `selected_agent`
- `skill_keys`
- `selected_model`
- `thinking_mode`
- `mode`
- `target_student_id`
- `attachment_ids`
- `metadata`

### 7.4.3 推荐请求结构

```json
{
  "scene": "learning_assistant",
  "course_id": 101,
  "chapter_id": 3,
  "conversation_id": "conv_001",
  "message": "这道题我不会，能结合我之前的错题给我解释一下吗？",
  "selected_agent": "study_diagnosis_agent",
  "skill_keys": [
    "course_knowledge_lookup",
    "wrong_exercise_repair",
    "digital_human_expression"
  ],
  "selected_model": "intelledu-4.0-pro",
  "thinking_mode": "deep",
  "mode": "student",
  "target_student_id": null,
  "attachment_ids": [],
  "metadata": {
    "ui_entry": "ai_app_chat",
    "conversation_group": "course"
  }
}
```

### 7.4.4 会话管理要求

后端必须支持以下会话相关能力：

#### 获取用户课程列表

- `GET /edu/frontend/v1/assistant/courses`

#### 获取按课程分组的会话列表

- `GET /edu/frontend/v1/assistant/conversations/grouped`

#### 获取某课程下的会话列表

- `GET /edu/frontend/v1/assistant/conversations/by-course?course_id=101`

#### 新建课程会话

- `POST /edu/frontend/v1/assistant/conversations`

#### 获取单会话详情

- `GET /edu/frontend/v1/assistant/conversations/{conversation_id}`

#### 获取单会话消息列表

- `GET /edu/frontend/v1/assistant/conversations/{conversation_id}/messages`

### 7.4.5 教师模式要求

若 `mode = teacher`：

- 当发起的是“面向某学生的分析型会话”时，`target_student_id` 必须传
- 后端必须校验该教师是否有权限查看该学生在该课程下的数据
- 后端回答应基于目标学生而不是教师本人画像

## 7.5 3D 数字人驱动服务

### 7.5.1 目标

后端在返回学习助手回答时，同时返回数字人的情绪、动作、姿态和朗读建议，由前端驱动 3D 数字人。

### 7.5.2 关键要求

- 数字人不是装饰层
- 回答时必须允许带数字人参数
- 数字人参数应尽量在回答开始阶段就返回

### 7.5.3 建议字段

- `speak`
- `emotion`
- `expressionIntensity`
- `gesture`
- `gestureDurationMs`
- `posture`
- `speechRate`
- `priority`

### 7.5.4 建议返回结构

```json
{
  "reply": {
    "text": "你这次对梯度下降的理解已经有明显进步。",
    "markdown": "你这次对 **梯度下降** 的理解已经有明显进步。"
  },
  "digitalHuman": {
    "speak": true,
    "emotion": "encouraging",
    "expressionIntensity": 0.72,
    "gesture": "thumb_up",
    "gestureDurationMs": 2400,
    "posture": "engaged",
    "speechRate": 1.02,
    "priority": "normal"
  }
}
```

### 7.5.5 建议场景枚举

- `neutral`
- `encouraging`
- `calm_explaining`
- `comforting`
- `serious_alert`
- `celebrating`

## 7.6 错题分析与补救闭环

说明：此能力可作为 A3 增强能力挂接到学习助手，不要求其页面必须属于 A3 主体，但数据应可接入 A3。

### 7.6.1 当前基础

已有接口：

- `POST /edu/frontend/v1/ai/wrong-exercise/analyze`
- `GET /edu/frontend/v1/ai/wrong-exercise/history`

### 7.6.2 后续要求

- 错误归因
- 知识点归因
- 推荐补救资源
- 生成同类变式题
- 回写画像
- 触发路径重规划

## 7.7 学习效果评估服务

### 7.7.1 目标

输出阶段性学习评估，并用于驱动资源与路径优化。

### 7.7.2 评估输入

- 课程完成进度
- 作业成绩
- 考试成绩
- 错题率与重复错误率
- 资源使用次数与完成率
- 路径节点完成情况
- 问答主题与频次

### 7.7.3 建议接口

#### 获取评估总览

- `GET /edu/frontend/v1/learning-assessment/overview?course_id=101`

#### 获取强弱项

- `GET /edu/frontend/v1/learning-assessment/strength-weakness?course_id=101`

#### 获取时间线

- `GET /edu/frontend/v1/learning-assessment/timeline?course_id=101`

#### 刷新评估

- `POST /edu/frontend/v1/learning-assessment/refresh`

#### 提交反馈

- `POST /edu/frontend/v1/learning-assessment/feedback`

## 8. 学习助手与全平台的数据联动要求

学习助手不能作为孤岛系统存在，后端必须与平台其他模块打通。

### 8.1 必须读取的数据来源

#### 课程模块

- 课程列表
- 章节结构
- 学习进度
- 课时完成记录

#### 作业与考试模块

- 作业成绩
- 考试成绩
- 题型表现
- 用时分布

#### 错题模块

- 错题列表
- 错误频次
- 错误类型
- 错题分析结果

#### 资源使用模块

- 资源点击
- 资源完成率
- 资源停留时长
- 下载记录

#### 讨论/问答模块

- 高频提问主题
- 提问情绪倾向
- 提问难度分布

#### 用户课程关系模块

- 学生已加入课程
- 教师授课课程
- 课程访问权限

#### 用户身份关系模块

- 教师与学生关系
- 班级归属关系

### 8.2 必须回写的数据

#### 回写画像

- 新标签
- 维度变化
- 知识掌握度变化

#### 回写推荐中心

- 推荐过的资源
- 推荐原因
- 采纳结果

#### 回写路径中心

- 路径重规划记录
- 节点插入记录

#### 回写评估中心

- 辅导事件
- 建议事件

#### 回写数字人日志

- 情绪
- 动作
- 是否朗读

#### 回写会话元数据

- 会话所属课程
- 选用 Agent
- Skills
- 使用模型
- 思考模式

## 9. 数据模型建议

## 9.1 学习画像表 `learner_profile`

建议字段：

- `id`
- `user_id`
- `course_id`
- `version`
- `summary`
- `dimensions_json`
- `tags_json`
- `knowledge_map_json`
- `source_summary_json`
- `created_at`
- `updated_at`

## 9.2 资源生成任务表 `resource_task`

建议字段：

- `id`
- `task_no`
- `user_id`
- `course_id`
- `chapter_id`
- `scene`
- `resource_types_json`
- `input_payload_json`
- `status`
- `progress`
- `current_stage`
- `current_agent`
- `error_message`
- `created_at`
- `updated_at`
- `finished_at`

## 9.3 任务执行日志表 `resource_task_log`

建议字段：

- `id`
- `task_id`
- `stage`
- `agent_name`
- `message`
- `raw_payload_json`
- `created_at`

## 9.4 资源表 `learning_resource`

建议字段：

- `id`
- `resource_no`
- `task_id`
- `course_id`
- `chapter_id`
- `user_id`
- `title`
- `resource_type`
- `summary`
- `knowledge_points_json`
- `storage_key`
- `preview_url`
- `download_url`
- `meta_json`
- `version`
- `audit_status`
- `created_at`

资源列表接口需要支持可选的 `task_id` 查询参数，并在每个资源摘要中返回
`task_id`。前端任务中心据此展示某次生成任务对应的多模态资源，避免将同一课程
下的历史资源混入当前任务结果。

## 9.5 学习路径表 `learning_path`

建议字段：

- `id`
- `user_id`
- `course_id`
- `version`
- `status`
- `summary`
- `generated_by`
- `trigger_source`
- `created_at`
- `updated_at`

## 9.6 学习路径节点表 `learning_path_node`

建议字段：

- `id`
- `path_id`
- `phase_no`
- `node_no`
- `title`
- `node_type`
- `status`
- `estimated_minutes`
- `knowledge_points_json`
- `resource_ids_json`
- `reason`
- `sort_order`
- `completed_at`

## 9.7 学习评估表 `learning_assessment`

建议字段：

- `id`
- `user_id`
- `course_id`
- `assessment_version`
- `overall_level`
- `predicted_score`
- `strengths_json`
- `weak_points_json`
- `timeline_json`
- `suggestions_json`
- `need_replan`
- `created_at`

## 9.8 数字人交互日志表 `digital_human_interaction_log`

建议字段：

- `id`
- `conversation_id`
- `user_id`
- `course_id`
- `message_id`
- `emotion`
- `expression_intensity`
- `gesture`
- `gesture_duration_ms`
- `posture`
- `speech_rate`
- `speak`
- `created_at`

## 9.9 学习助手会话表 `assistant_conversation`

建议字段：

- `id`
- `conversation_id`
- `user_id`
- `course_id`
- `target_student_id`
- `scene`
- `title`
- `group_type`
- `selected_agent`
- `skill_keys_json`
- `selected_model`
- `thinking_mode`
- `mode`
- `status`
- `last_message_at`
- `created_at`
- `updated_at`

## 9.10 学习助手消息表 `assistant_message`

建议字段：

- `id`
- `conversation_id`
- `role`
- `content_text`
- `content_markdown`
- `resource_cards_json`
- `digital_human_json`
- `used_agent`
- `used_skills_json`
- `token_usage_json`
- `created_at`

## 10. 与现有接口的衔接策略

### 10.1 可直接复用的接口

- `POST /edu/frontend/v1/ai/chat/stream`
- `POST /edu/frontend/v1/ai/chat/multimodal/stream`

### 10.2 新增的学习助手接口族

建议新增：

- `/edu/frontend/v1/assistant/*`

### 10.3 统一响应格式

建议新增 A3 接口统一：

```json
{
  "code": 0,
  "msg": "success",
  "data": {}
}
```

## 11. 状态流与业务流程

### 11.1 首次进入学习助手系统

1. 学生进入学习助手
2. 选择课程
3. 发起首轮对话
4. 后端初始化画像
5. 后端生成初始路径
6. 后端返回推荐资源

### 11.2 学生发起专项资源生成

1. 学生选择课程/章节/目标
2. 后端创建资源任务
3. 多智能体执行
4. 通过进度接口或 SSE 回传状态
5. 结果入库并展示

### 11.3 学生在学习助手中提问

1. 学生提问
2. 后端加载课程、画像、路径、资源上下文
3. 按 Agent / Skill 装配执行链
4. 生成回答
5. 生成数字人参数
6. 返回文本、资源卡片、数字人参数
7. 记录会话并可更新画像

### 11.4 错题驱动补救

1. 学生提交错题分析
2. 返回归因与补救建议
3. 回写画像
4. 必要时重规划路径

### 11.5 学习评估与闭环优化

1. 后端按事件或定时刷新评估
2. 输出强项、弱项、建议
3. 必要时重规划路径
4. 必要时追加资源推荐或专项任务

## 12. 非功能需求

### 12.1 内容安全

- 敏感内容过滤
- 不当输出拦截
- 资源内容审核
- 违规文本识别

### 12.2 防幻觉

- 课程资料引用约束
- 生成内容事实校验
- 关键知识点模板校验
- 高风险回答降级

### 12.3 长任务体验

- 任务排队
- 进度条
- 阶段说明
- 超时处理
- 重试
- 中断标记

### 12.4 可观测性

- token/模型使用量
- 阶段耗时
- 失败原因
- 重试次数
- 用户使用频率
- 资源成功率
- 数字人策略使用频率

### 12.5 可扩展性

- 更多资源类型
- 更多智能体角色
- 更多课程
- 班级级推荐
- 资源审核流

## 13. 开发优先级建议

### 13.1 P0 必须完成

- 画像初始化与查询
- 画像增量更新
- 资源任务创建与进度查询
- 至少 5 类资源生成
- 学习路径生成与查询
- 学习助手对话上下文增强
- 数字人参数协议
- 学习助手与课程/作业/考试/错题/资源联动
- 按课程分组的会话列表
- 课程上下文校验
- Agent / Skill / 模型 / 思考模式协议

### 13.2 P1 建议完成

- 学习评估服务
- 路径重规划
- 教师查看学生画像/路径/评估
- 资源推荐策略

### 13.3 P2 扩展完成

- 班级共性薄弱点分析
- 完整资源版本管理
- 更复杂的多模态生产流水线
- 与考试中心、OJ、赛事场整合

## 14. 验收标准

### 14.1 功能验收

- 能通过对话初始化画像
- 画像维度不少于 6 个
- 能生成至少 5 类个性化资源
- 能生成学习路径并展示阶段与节点
- 能返回结构化资源建议
- 能返回数字人情感与动作参数
- 能输出学习评估结果
- 能按课程查看会话列表
- 新建会话时可挂课程、Agent、Skill、模型、思考模式
- 教师模式下可对指定学生发起分析型会话

### 14.2 联调验收

- 学习助手核心模块不再依赖本地静态演示数据
- 学习画像页面显示真实画像
- 资源生成页面显示真实任务和资源
- 学习路径页面显示真实路径
- 学习评估页面显示真实评估
- 数字人可按后端参数呈现不同状态
- 侧边栏显示真实课程分组会话
- 课程切换器读取真实课程列表

### 14.3 稳定性验收

- 任务失败时有明确信息
- 长任务有可见进度
- 学生无法越权查看他人资源和画像
- 高风险内容有过滤和拦截
