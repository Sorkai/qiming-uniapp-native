# 学生端 vs 教师/管理端 UI/UX 割裂原因总结

- 日期：2026-04-13（中国）
- 时间：凌晨 02:00
- 目的：解释“学生端风格喜欢，但教师端管理端题目组卷器/赛事场看起来怪、与学生端割裂”的根因

## 一句话结论
当前项目里“学生端”与“教师/管理端”不是同一套产品壳层与设计系统在演进，而是多个页面各自独立设计、局部复用、局部复制，最终导致视觉语言、交互节奏、信息结构都不统一。

## 1) 信息架构和入口壳层不同
学生端在账号页内部走“单页式工作台”模型；教师/管理端走“后台路由分模块”模型。两者天然会产生体验割裂。

证据：
- 学生端在账号页内通过 menu 切换模块，赛事场是内嵌组件：
  - src/views/account/index.vue:145
  - src/views/account/index.vue:174
- 学生端试卷中心也在账号页内嵌：
  - src/views/account/index.vue:149
  - src/views/account/index.vue:177
- 教师/管理端赛事场是独立后台路由，且限定 admin/teacher：
  - src/router/modules/competition.ts:4
  - src/router/modules/competition.ts:10
- 学生端试卷中心是另一套路由（student 角色）：
  - src/router/modules/studentExamCenter.ts:2
  - src/router/modules/studentExamCenter.ts:9

影响：
- 学生感觉是在“同一个连续空间”中学习；教师/管理端像在“后台功能集合”中切页面。
- 同样叫“赛事场/组卷”，但认知模型不一致（工作台 vs 管理台）。

## 2) 视觉语言没有统一 Token 源
不同页面各自定义颜色、渐变、圆角、阴影，缺少跨端统一的设计 token 层。

证据：
- 学生账号大页有自己的一套渐变与暗色处理：
  - src/views/account/index.vue:1094
  - src/views/account/index.vue:1111
  - src/views/account/index.vue:1603
- 学生赛事场也有独立渐变体系和大量 .dark 适配：
  - src/views/account/components/Competition.vue:2
  - src/views/account/components/Competition.vue:685
  - src/views/account/components/Competition.vue:689
- 组卷器总览单独再定义一套 SCSS 变量（$light-bg/$dark-bg/$primary-gradient）：
  - src/views/exam-paper/index.vue:512
  - src/views/exam-paper/index.vue:540
- 组卷编辑器又单独定义另一套变量与风格：
  - src/views/exam-paper/editor/index.vue:4311
  - src/views/exam-paper/editor/index.vue:4317

影响：
- 颜色和材质语义不稳定，同一个“主功能”在不同端看起来像不同产品。
- 视觉连续性主要靠“巧合相似”，不是系统约束。

## 3) 赛事场交互模型不同步
学生端是“模块卡片 + 在页弹层（dialog）”的连续体验；教师/管理端是“列表检索 + CRUD 表格 + 分页”的后台体验。

证据：
- 学生赛事场点击模块后打开对话框（而非跳新路由）：
  - src/views/account/components/Competition.vue:611
  - src/views/account/components/Competition.vue:614
  - src/views/account/components/Competition.vue:270
  - src/views/account/components/Competition.vue:295
- 教师赛事概览点击模块直接跳路由：
  - src/views/competition/overview/index.vue:342
  - src/views/competition/overview/index.vue:343
- 教师赛事管理页主结构是检索表单 + 表格 + 分页 + 弹窗：
  - src/views/competition/event-manage/index.vue:36
  - src/views/competition/event-manage/index.vue:73
  - src/views/competition/event-manage/index.vue:149
  - src/views/competition/event-manage/index.vue:161

影响：
- 学生端偏“沉浸式任务流”，教师端偏“运营管理流”，视觉再像也会产生体验割裂。

## 4) 图标与语义风格不统一
学生端赛事场使用专用 SVG 资产，教师端赛事核心信息却大量用 emoji 作为业务图标。

证据：
- 学生端导入专用赛事图标资源：
  - src/views/account/components/Competition.vue:427
  - src/views/account/components/Competition.vue:428
  - src/views/account/components/Competition.vue:431
- 教师端赛事页以 emoji 作为卡片主图标：
  - src/views/competition/index.vue:30
  - src/views/competition/index.vue:54
  - src/views/competition/index.vue:102
- 教师端赛事概览页同样使用 emoji：
  - src/views/competition/overview/index.vue:35
  - src/views/competition/overview/index.vue:63
  - src/views/competition/overview/index.vue:119

影响：
- 学生端“品牌化图标语言”与教师端“快速拼装符号”并存，观感不在同一质感层级。

## 5) 教师赛事模块存在较高复制式实现
多个页面结构和样式骨架高度相似（header-card/overview-cards/box-card/rankings-list），但各自维护，容易产生“像但不一致”的漂移。

证据：
- 赛事管理：
  - src/views/competition/event-manage/index.vue:3
  - src/views/competition/event-manage/index.vue:568
- 赛事首页：
  - src/views/competition/index.vue:3
  - src/views/competition/index.vue:776
- 赛事概览：
  - src/views/competition/overview/index.vue:4
  - src/views/competition/overview/index.vue:463

影响：
- 改一个地方不会自动同步到其它页，长期演进后“越来越不像一套系统”。

## 6) 题目组卷器“怪”的核心来源（不是功能少，而是认知负担重）
组卷编辑器是超大单文件，承载了导航、工具栏、题型拖拽、题目编辑、预览、发布、AI 分析、模板管理等多任务场景，信息密度高且视觉层级竞争强。

证据：
- 文件体量非常大：
  - src/views/exam-paper/editor/index.vue（约 6000+ 行）
- 在同一页面同时出现固定顶栏、题型工具栏、左右分栏、大纲、画布、多弹窗：
  - src/views/exam-paper/editor/index.vue:2113
  - src/views/exam-paper/editor/index.vue:2168
  - src/views/exam-paper/editor/index.vue:2556
- 题型图标大量以内联 SVG 常量定义在页面脚本内：
  - src/views/exam-paper/editor/index.vue:45
  - src/views/exam-paper/editor/index.vue:187
- 自动保存、离开拦截、发布配置等复杂状态并存：
  - src/views/exam-paper/editor/index.vue:276
  - src/views/exam-paper/editor/index.vue:1650

影响：
- 用户会感到“功能很强但很重”，第一眼不够清晰，容易出现“看起来怪/压迫感强”。

## 7) 暗色模式支持策略也不一致
学生端赛事与组卷器有明确 dark 适配路径；赛事管理多个页面基本未显式接入 is-dark/useDark 机制。

证据：
- 学生赛事组件显式接收 currentTheme 并大量 .dark 规则：
  - src/views/account/components/Competition.vue:2
  - src/views/account/components/Competition.vue:433
  - src/views/account/components/Competition.vue:689
- 组卷总览与编辑器显式 useDark + is-dark class：
  - src/views/exam-paper/index.vue:4
  - src/views/exam-paper/index.vue:233
  - src/views/exam-paper/editor/index.vue:14
  - src/views/exam-paper/editor/index.vue:2113
- 赛事管理页面顶层仅为 .main，未见对应 is-dark/useDark 接入：
  - src/views/competition/index.vue:2
  - src/views/competition/overview/index.vue:2
  - src/views/competition/event-manage/index.vue:2

影响：
- 同一产品在不同模块的昼夜主题质感和对比度体验不一致。

## 最终归因（优先级排序）
1. 架构层：学生端与教师端是两种壳层和导航体系，先天割裂。
2. 设计系统层：缺少全局 token 与组件规范，页面各自定义风格。
3. 交互层：同业务对象（赛事/试卷）在不同端采用完全不同任务模型。
4. 工程层：复制式页面和超大单文件并存，导致风格长期漂移。

## 明后天可继续的讨论起点
1. 先统一“赛事场”在三端（学生/教师/管理）的信息架构词典和任务流，再统一视觉。
2. 抽一层 shared design tokens（颜色/圆角/阴影/间距/状态色）到全局，不在页面内私有定义。
3. 把组卷编辑器拆成壳层 + 面板子组件，先降认知负担，再做美化。
4. 赛事管理页从 emoji 业务图标迁移到统一 SVG 图标集，建立一致语义。
