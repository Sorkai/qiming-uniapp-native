# 学生端试卷试题管理中心功能文档

## 概述

学生端试卷试题管理中心是基于教师端/管理端接口设计的学生专用试卷管理系统，提供试卷浏览、详情查看、在线答题等功能。

## 功能特性

### 1. 试卷列表页面 (`/student-exam-center/list`)

**文件位置**: `src/views/exam-paper/student-center/index.vue`

#### 主要功能

- **统计卡片展示**
  - 待完成试卷数量
  - 已完成试卷数量
  - 已过期试卷数量
  - 平均分

- **试卷筛选**
  - 按状态筛选：可答题、已完成、已过期
  - 按课程筛选
  - 关键词搜索

- **试卷卡片展示**
  - 试卷基本信息（标题、描述、课程）
  - 考试时间信息（开始时间、截止时间、剩余时间）
  - 试卷元数据（题目数量、总分、时长）
  - 状态标签和操作按钮

- **操作功能**
  - 开始答题（可答题状态）
  - 查看成绩（已完成状态）
  - 查看详情（所有状态）

- **分页功能**
  - 支持每页 12/24/36/48 条数据
  - 总数统计

### 2. 试卷详情页面 (`/student-exam-center/detail/:id`)

**文件位置**: `src/views/exam-paper/student-center/detail.vue`

#### 主要功能

- **试卷基本信息展示**
  - 试卷标题和描述
  - 课程名称
  - 考试时长、总分、题目数量
  - 开始时间、截止时间
  - 创建者信息

- **试卷结构预览**
  - 按题型分组展示
  - 每组显示题目数量和总分
  - 题目详细内容预览
    - 题干内容
    - 选项内容（单选/多选/判断题）
    - 题型提示（填空题、主观题）

- **操作功能**
  - 返回列表
  - 开始答题

## API 接口

### 学生端接口

基于教师端/管理端接口设计，学生端使用以下接口：

#### 1. 获取学生试卷列表

```typescript
GET /edu/frontend/v1/paper/list

参数:
{
  pageNum: number;          // 页码
  pageSize?: number;        // 每页数量，默认12
  status?: string;          // 状态筛选: available | completed | expired
  courseId?: number;        // 课程ID
  keyword?: string;         // 关键词搜索
}

响应:
{
  total: number;
  list: StudentPaperItem[];
  statistics: {
    available: number;      // 待完成数量
    completed: number;      // 已完成数量
    expired: number;        // 已过期数量
    avgScore: number;       // 平均分
  };
}
```

#### 2. 获取试卷详情

```typescript
GET /edu/backend/v1/paper/detail/:paperId

响应:
{
  paperId: number;
  title: string;
  description?: string;
  courseId: number;
  courseName?: string;
  creatorId: number;
  creatorName?: string;
  status: number;
  timeLimit: number;
  totalPoints: number;
  totalQuestions: number;
  startTime?: string;
  endTime?: string;
  createTime: string;
  updateTime: string;
  questionGroups: QuestionGroup[];
}
```

## 数据类型定义

### StudentPaperItem

```typescript
interface StudentPaperItem {
  id: number;
  title: string;
  description?: string;
  courseId: number;
  courseName: string;
  timeLimit: number;
  totalPoints: number;
  totalQuestions: number;
  startTime: string;
  endTime: string;
  status: "available" | "completed" | "expired";
  submissionId?: number;
  score?: number;
  allowRetake?: boolean;
  remainingRetakeCount?: number;
}
```

### QuestionGroup

```typescript
interface QuestionGroup {
  groupId: number;
  groupName: string;
  questionType: number;
  questions: Question[];
  sortOrder: number;
}
```

## 路由配置

```typescript
{
  path: "/student-exam-center",
  name: "StudentExamCenter",
  redirect: "/student-exam-center/list",
  meta: {
    icon: "ri:file-list-2-line",
    title: "试题试卷中心",
    rank: 5,
    roles: ["student"]
  },
  children: [
    {
      path: "/student-exam-center/list",
      name: "StudentExamCenterList",
      component: () => import("@/views/exam-paper/student-center/index.vue"),
      meta: {
        title: "试卷列表",
        showLink: false
      }
    },
    {
      path: "/student-exam-center/detail/:id",
      name: "StudentPaperDetail",
      component: () => import("@/views/exam-paper/student-center/detail.vue"),
      meta: {
        title: "试卷详情",
        showLink: false,
        activePath: "/student-exam-center"
      }
    }
  ]
}
```

## Mock 数据

Mock 数据已在 `mock/examPaper.ts` 中配置，包括：

- 学生试卷列表数据（5份试卷，包含不同状态）
- 试卷详情数据（包含完整的题目分组和题目内容）
- 统计数据（待完成、已完成、已过期、平均分）

## 样式设计

### 设计特点

- **响应式布局**: 使用 Grid 布局，自动适应不同屏幕尺寸
- **卡片式设计**: 试卷以卡片形式展示，清晰直观
- **状态区分**: 不同状态的试卷使用不同的边框颜色和样式
- **暗色模式支持**: 完整支持暗色主题切换
- **交互反馈**: 悬停效果、点击反馈等

### 主题色

- 主色调: `#00bfa5` (青绿色)
- 成功色: `#10b981` (绿色)
- 警告色: `#f59e0b` (橙色)
- 危险色: `#ef4444` (红色)
- 信息色: `#6b7280` (灰色)

## 使用流程

### 学生使用流程

1. **进入试卷中心**
   - 访问 `/student-exam-center`
   - 查看统计卡片了解整体情况

2. **浏览试卷列表**
   - 切换标签页查看不同状态的试卷
   - 使用搜索和筛选功能定位目标试卷
   - 查看试卷卡片上的基本信息

3. **查看试卷详情**
   - 点击试卷标题或"查看详情"按钮
   - 浏览试卷结构和题目内容
   - 了解考试要求和时间安排

4. **开始答题**
   - 在列表页或详情页点击"开始答题"
   - 跳转到答题页面进行作答

5. **查看成绩**
   - 已完成的试卷可以查看成绩
   - 点击"查看成绩"按钮查看详细结果

## 技术实现

### 核心技术栈

- **Vue 3**: Composition API
- **TypeScript**: 类型安全
- **Element Plus**: UI 组件库
- **Vue Router**: 路由管理
- **Pinia**: 状态管理（如需要）

### 关键实现

1. **状态管理**
   - 使用 `ref` 和 `computed` 管理组件状态
   - 响应式数据更新

2. **路由导航**
   - 使用 `useRouter` 进行页面跳转
   - 动态路由参数传递

3. **API 调用**
   - 统一的 API 接口封装
   - 错误处理和加载状态管理

4. **样式处理**
   - SCSS 预处理器
   - 变量化主题色
   - 响应式布局

## 后续优化建议

1. **功能增强**
   - 添加试卷收藏功能
   - 添加错题回顾功能
   - 添加学习进度追踪
   - 添加成绩分析图表

2. **性能优化**
   - 虚拟滚动优化长列表
   - 图片懒加载
   - 组件按需加载

3. **用户体验**
   - 添加骨架屏加载效果
   - 优化移动端适配
   - 添加操作引导提示

4. **数据可视化**
   - 添加成绩趋势图
   - 添加知识点掌握度雷达图
   - 添加答题时间分布图

## 相关文件

- 页面组件:
  - `src/views/exam-paper/student-center/index.vue` - 试卷列表
  - `src/views/exam-paper/student-center/detail.vue` - 试卷详情

- API 定义:
  - `src/api/examPaper.ts` - API 接口定义

- 路由配置:
  - `src/router/modules/studentExamCenter.ts` - 路由配置

- Mock 数据:
  - `mock/examPaper.ts` - Mock 数据配置

- 图标资源:
  - `src/assets/papercentreicons/` - 自定义图标

## 总结

学生端试卷试题管理中心基于教师端/管理端的接口设计，提供了完整的试卷浏览、详情查看和答题入口功能。通过清晰的界面设计和流畅的交互体验，帮助学生高效地管理和完成试卷任务。