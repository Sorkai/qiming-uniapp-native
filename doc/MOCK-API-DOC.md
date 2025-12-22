# AI教学服务 Mock接口文档

## 简介

本文档提供了AI教学服务的完整API接口说明，用于 Mock 数据实现。包括接口地址、请求方式、请求参数和响应参数。

## 目录

- [1. 用户认证模块](#1-用户认证模块)
- [2. 前端课程模块](#2-前端课程模块)
- [3. 前端用户模块](#3-前端用户模块)
- [4. 前端作业考试模块](#4-前端作业考试模块)
- [5. 前端AI模块](#5-前端ai模块)
- [6. 后端课程管理模块](#6-后端课程管理模块)
- [7. 后端考试管理模块](#7-后端考试管理模块)
- [8. 后端作业管理模块](#8-后端作业管理模块)
- [9. 后端分类管理模块](#9-后端分类管理模块)
- [10. 后端统计模块](#10-后端统计模块)
- [11. 后端HTML动画模块](#11-后端html动画模块)
- [12. 后端习题管理模块](#12-后端习题管理模块)
- [13. 后端用户管理模块](#13-后端用户管理模块)
- [14. PPT模块](#14-ppt模块)
- [15. 虚拟实验室模块](#15-虚拟实验室模块)
- [16. 赛事场模块](#16-赛事场模块)

---

## 通用响应格式

```typescript
interface ApiResponse<T = any> {
  code: number;      // 状态码，0或200表示成功
  msg: string;       // 响应消息
  data: T;           // 响应数据
}
```

---

## 1. 用户认证模块

### 1.1 系统登录

**接口地址**: `POST /login`

**请求参数**:
```typescript
{
  username: string;  // 用户名
  password: string;  // 密码
}
```

**响应参数**:
```typescript
{
  success: boolean;
  data: {
    avatar: string;           // 头像
    username: string;         // 用户名
    nickname: string;         // 昵称
    roles: string[];          // 角色列表
    permissions: string[];    // 权限列表
    accessToken: string;      // 访问令牌
    refreshToken: string;     // 刷新令牌
    expires: string;          // 过期时间}
}
```

### 1.2 刷新Token

**接口地址**: `POST /refresh-token`

**请求参数**:
```typescript
{
  refreshToken: string;  // 刷新令牌
}
```

**响应参数**:
```typescript
{
  success: boolean;
  data: {
    accessToken: string;   // 新访问令牌
    refreshToken: string;  // 新刷新令牌
    expires: string;       // 过期时间
  }
}
```

### 1.3 用户中心登录

**接口地址**: `POST /edu/v1/user/login`

**请求参数**:
```typescript
{
  mobile: string;    // 手机号
  password: string;  // 密码
}
```

**响应参数**:
```typescript
{
  code: number;
  msg: string;
  data: {
    accessToken: string;    // 访问令牌
    accessExpire: number;   // 过期时间戳
    refreshAfter: number;   // 刷新时间戳
  }
}
```

### 1.4 用户注册

**接口地址**: `POST /edu/v1/user/register`

**请求参数**:
```typescript
{
  mobile: string;    // 手机号
  password: string;  // 密码
}
```

**响应参数**:
```typescript
{
  code: number;
  msg: string;
  data: {
    accessToken: string;
    accessExpire: number;
    refreshAfter: number;
  }
}
```

### 1.5 获取用户详情

**接口地址**: `POST /edu/v1/user/detail`

**请求参数**: 无

**响应参数**:
```typescript
{
  code: number;
  msg: string;
  data: {
    userInfo: {
      id: number;        // 用户ID
      mobile: string;    // 手机号
      nickname: string;  // 昵称
      sex: number;       // 性别1:男 2:女
      avatar: string;    // 头像
      info: string;      // 个性签名
      roleType: number;  // 角色类型 1:学生 2:教师 3:管理员}
  }
}
```

### 1.6 获取学习总结(AI)

**接口地址**: `GET /edu/frontend/v1/user/learning/summary`

**请求参数**: 无

**响应参数**:
```typescript
{
  code: number;
  msg: string;
  data: {
    title: string;       // 总结标题
    items: string[];     // 总结条目列表
  }
}
```

---

## 2. 前端课程模块

### 2.1 获取课程列表

**接口地址**: `GET /edu/frontend/v1/course/list`

**请求参数**:
```typescript
{
  pageNum: number;     // 页码
  pageSize?: number;   // 每页数量，默认10
  queryType?: number;  // 查询类型
  status?: string;     // 状态筛选
}
```

**响应参数**:
```typescript
{
  code: number;
  msg: string;
  data: {
    list: Array<{
      courseId: number;       // 课程ID
      courseName: string;     // 课程名称
      thumbUrl: string;       // 封面图
      isRequired: number;     // 是否必修1:必修 0:选修
      totalHours: number;     // 总课时
      finishedHours: number;  // 已完成课时}>;
    total: number;  // 总数
  }
}
```

### 2.2 获取课程详情

**接口地址**: `GET /edu/frontend/v1/course/detail`

**请求参数**:
```typescript
{
  courseId: number;  // 课程ID
}
```

**响应参数**:
```typescript
{
  code: number;
  msg: string;
  data: {
    courseId: number;
    courseName: string;
    thumbUrl: string;
    isRequired: number;
    totalHours: number;
    finishedHours: number;
    courseDesc: string;       // 课程描述
    courseChapterList: Array<{
      chapterId: number;      // 章节ID
      name: string;           // 章节名称
      hourList: Array<{
        hourId: number;       // 课时ID
        duration: number;     // 时长(秒)
        title: string;        // 课时标题
        rType: string;        // 资源类型
        fileUrl: string;      // 文件地址
        finished: number;     // 是否完成 1:完成 0:未完成
      }>;
    }>;
    courseAttrList: Array<{
      resourceId: number;     // 资源ID
      title: string;          // 附件标题
      rType: string;          // 资源类型
      attrId: number;         // 附件ID
      fileUrl: string;        // 文件地址
    }>;
  }
}
```

### 2.3 课时完成上报

**接口地址**: `POST /edu/frontend/v1/course/report/lesson`

**请求参数**:
```typescript
{
  courseId: number;  // 课程ID
  hourId: number;    // 课时ID
}
```

**响应参数**:
```typescript
{
  code: number;
  msg: string;
  data: null
}
```

### 2.4 获取课程学习效果

**接口地址**: `GET /edu/frontend/v1/course/study/effect`

**请求参数**:
```typescript
{
  courseId: number;  // 课程ID
}
```

**响应参数**:
```typescript
{
  code: number;
  msg: string;
  data: {
    courseId: number;
    keyPointNum: number;        // 重点数量
    difficultPointNum: number;  // 难点数量
    knowledgePointNum: number;  // 知识点数量
    conceptNum: number;         // 概念数量
    chapterList: Array<{
      chapterId: number;
      chapterName: string;
      keyPointArray: Array<{
        title: string;
        content: string;
      }>;
      difficultPointArray: Array<{
        title: string;
        content: string;
      }>;
      knowledgeArray: Array<{
        title: string;
        content: string;
      }>;
      ConceptArray: Array<{
        title: string;
        content: string;
      }>;
    }>;
  }
}
```

### 2.5 获取课程成绩概览

**接口地址**: `GET /edu/frontend/v1/course/score`

**请求参数**:
```typescript
{
  courseId: number;  // 课程ID
}
```

**响应参数**:
```typescript
{
  code: number;
  msg: string;
  data: {
    courseId: number;
    courseScore: number;  // 课时成绩
    workScore: number;    // 作业成绩
    examScore: number;    // 考试成绩}
}
```

### 2.6 获取课程成绩详情列表

**接口地址**: `GET /edu/frontend/v1/course/grades/list`

**请求参数**:
```typescript
{
  courseId: number;
}
```

**响应参数**:
```typescript
{
  code: number;
  msg: string;
  data: {
    list: Array<{
      name: string;        // 项目名称
      type: string;        // 类型：作业/考试/实验
      score: number;       // 得分
      submitTime: string;  // 提交时间
      gradedTime: string;  // 评分时间
      comment: string;     // 教师评语
    }>;
  }
}
```

**示例响应**:
```json
{
  "code": 200,
  "msg": "获取成功",
  "data": {
    "list": [
      {
        "name": "第一章基础练习",
        "type": "作业",
        "score": 85,
        "submitTime": "2024-03-15 14:30:00",
        "gradedTime": "2024-03-16 10:00:00",
        "comment": "完成度较好，但部分细节需要注意"
      },
      {
        "name": "Python环境搭建实验",
        "type": "实验",
        "score": 95,
        "submitTime": "2024-03-18 11:20:00",
        "gradedTime": "2024-03-19 14:00:00",
        "comment": "实验报告详尽，操作规范"
      },
      {
        "name": "期中综合考试",
        "type": "考试",
        "score": 82,
        "submitTime": "2024-04-10 16:00:00",
        "gradedTime": "2024-04-12 09:00:00",
        "comment": "整体表现不错，继续保持"
      }
    ]
  }
}
```

### 2.7 获取课程成绩统计指标

**接口地址**: `GET /edu/frontend/v1/course/grades/statistics`

**请求参数**:
```typescript
{
  courseId: number;
}
```

**响应参数**:
```typescript
{
  code: number;
  msg: string;
  data: {
    totalAssignments: number;      // 总作业数
    completedAssignments: number;  // 已完成数
    averageScore: number;          // 平均分
    highestScore: number;          // 最高分
    completionRate: number;        // 完成率(百分比)
  }
}
```

**示例响应**:
```json
{
  "code": 200,
  "msg": "获取成功",
  "data": {
    "totalAssignments": 12,
    "completedAssignments": 8,
    "averageScore": 87.2,
    "highestScore": 98,
    "completionRate": 66.7
  }
}
```

### 2.8 获取成绩班级对比数据

**接口地址**: `GET /edu/frontend/v1/course/grades/class-comparison`

**请求参数**:
```typescript
{
  courseId: number;
}
```

**响应参数**:
```typescript
{
  code: number;
  msg: string;
  data: {
    categories: string[];      // 比较项名称列表
    personalScores: number[];  // 个人得分列表
    classAverages: number[];   // 班级平均分列表
  }
}
```

**示例响应**:
```json
{
  "code": 200,
  "msg": "获取成功",
  "data": {
    "categories": [
      "第一章作业",
      "环境搭建实验",
      "第二章作业",
      "单元测验",
      "综合实验",
      "期中考试",
      "第三章作业",
      "面向对象实验"
    ],
    "personalScores": [85, 95, 92, 78, 88, 82, 88, 90],
    "classAverages": [80, 88, 85, 75, 82, 78, 82, 85]
  }
}
```

---

## 3. 前端用户模块

### 3.1 更新用户信息

**接口地址**: `POST /edu/frontend/v1/user/update`

**请求参数**:
```typescript
{
  nickname?: string;  // 昵称
  sex?: number;       // 性别
  avatar?: string;    // 头像地址
  info?: string;      // 个性签名
}
```

**响应参数**:
```typescript
{
  code: number;
  msg: string;
  data: null
}
```

### 3.2 修改用户密码

**接口地址**: `POST /edu/frontend/v1/user/update/password`

**请求参数**:
```typescript
{
  oldPassword: string;  // 原密码
  newPassword: string;  // 新密码
}
```

**响应参数**:
```typescript
{
  code: number;
  msg: string;
  data: null
}
```

---

## 4. 前端作业考试模块

### 4.1 获取用户课程考试列表

**接口地址**: `GET /edu/frontend/v1/course/exam/list`

**请求参数**:
```typescript
{
  courseId: number;  // 课程ID
}
```

**响应参数**:
```typescript
{
  code: number;
  msg: string;
  data: Array<{
    examId: number;          // 考试ID
    title: string;           // 考试标题
    description: string;     // 考试描述
    questionNum: number;     // 题目数量
    totalPoints: number;     // 总分
    timeLimit: number;       // 时间限制(分钟)
    availableFrom: string;   // 开始时间
    availableTo: string;     // 结束时间
    status: number;          // 状态 1:未开始 2:进行中 3:已完成 4:已过期
    score: number;           // 得分}>
}
```

### 4.2 获取考试详情

**接口地址**: `GET /edu/frontend/v1/exam/detail`

**请求参数**:
```typescript
{
  examId: number;    // 考试ID
  courseId: number;  // 课程ID
}
```

**响应参数**:
```typescript
{
  code: number;
  msg: string;
  data: {
    examId: number;
    title: string;
    description: string;
    questionCount: number;
    totalScore: number;
    timeLimit: number;
    startTime: string;
    endTime: string;
    questions: Array<{
      questionId: number;
      title: string;
      content: string;
      type: number;       // 1:单选 2:多选 3:判断 4:填空 5:简答
      score: number;
      options?: Array<{
        optionId: string;
        content: string;
      }>;
    }>;
  }
}
```

### 4.3 提交考试答案

**接口地址**: `POST /edu/frontend/v1/exam/submit`

**请求参数**:
```typescript
{
  examId: number;
  courseId: number;
  answers: Array<{
    questionId: number;
    answer: string;
  }>;
}
```

**响应参数**:
```typescript
{
  code: number;
  msg: string;
  data: {
    score: number;       // 得分
    totalScore: number;  // 总分}
}
```

### 4.4 获取用户课程作业列表

**接口地址**: `GET /edu/frontend/v1/course/homework/list`

**请求参数**:
```typescript
{
  courseId: number;  // 课程ID
}
```

**响应参数**:
```typescript
{
  code: number;
  msg: string;
  data: Array<{
    homeworkId: number;    // 作业ID
    title: string;         // 作业标题
    description: string;   // 作业描述
    questionNum: number;   // 题目数量
    totalPoints: number;   // 总分dueDate: string;       // 截止日期
    status: number;        // 状态 1:未开始 2:进行中 3:已完成 4:已过期
    score: number;         // 得分
  }>
}
```

### 4.5 获取作业详情

**接口地址**: `GET /edu/frontend/v1/homework/detail`

**请求参数**:
```typescript
{
  homeworkId: number;  // 作业ID
  courseId: number;    // 课程ID
}
```

**响应参数**:
```typescript
{
  code: number;
  msg: string;
  data: {
    homeworkId: number;
    title: string;
    description: string;
    questionCount: number;
    totalScore: number;
    deadline: string;
    questions: Array<{
      questionId: number;
      title: string;
      content: string;
      type: number;       // 1:单选 2:多选 3:判断 4:填空 5:简答
      score: number;
      options?: Array<{
        optionId: string;
        content: string;
      }>;
    }>;
  }
}
```

### 4.6 提交作业答案

**接口地址**: `POST /edu/frontend/v1/homework/submit`

**请求参数**:
```typescript
{
  homeworkId: number;
  courseId: number;
  answers: Array<{
    questionId: number;
    answer: string;
  }>;
}
```

**响应参数**:
```typescript
{
  code: number;
  msg: string;
  data: {
    score: number;
    totalScore: number;
  }
}
```

### 4.7 获取用户错题列表

**接口地址**: `GET /edu/frontend/v1/wrong/question/list`

**请求参数**:
```typescript
{
  pageNum?: number;     // 页码
  pageSize?: number;    // 每页数量
  sourceType?: number;  // 来源类型 1:作业 2:考试 3:自测题
  courseId?: number;    // 课程ID筛选
}
```

**响应参数**:
```typescript
{
  code: number;
  msg: string;
  data: {
    total: number;
    list: Array<{
      id: number;              // 错题ID
      sourceType: number;      // 来源类型
      sourceId: number;        // 来源ID
      sourceName: string;      // 来源名称
      questionId: number;      // 题目ID
      questionType: number;    // 题型 1-单选/2-多选/3-判断/4-填空/5-简答/6-论述
      title: string;           // 题目标题
      stem: string;            // 题目题干
      options: string | null;  // 选项(JSON字符串)
      analysis: string | null; // 解析
      answer: string;          // 正确答案
      userAnswer: string;      // 用户答案
      wrongNum: number;        // 错误次数
      lastWrongTime: string;   // 最近错误时间
    }>;
  }
}
```

---

## 5. 前端AI模块

### 5.1 AI聊天流式接口

**接口地址**: `POST /edu/frontend/v1/ai/chat/stream`

**请求参数**:
```typescript
{
  course_id?: number;         // 课程ID
  conversation_id?: string;   // 会话ID
  message: string;            // 消息内容
  chapter_id?: number | null; // 章节ID
}
```

**响应参数** (SSE流式):
```typescript
{
  conversation_id: string;  // 会话ID
  delta: string;            // 增量内容
  finished: boolean;        // 是否完成
}
```

### 5.2 获取会话历史

**接口地址**: `GET /edu/frontend/v1/ai/get/conversations`

**请求参数**:
```typescript
{
  conversation_id: string;  // 会话ID
}
```

**响应参数**:
```typescript
{
  code: number;
  msg: string;
  data: {
    messages: Array<{
      role: string;     // 角色 user/assistant
      content: string;  // 消息内容}>;
  }
}
```

### 5.3 错题分析

**接口地址**: `POST /edu/frontend/v1/ai/wrong-exercise/analyze`

**请求参数**:
```typescript
{
  course_id: number | string;
  original_exercise_id: string;
  original_exercise_content: string;
  student_answer: string;
  correct_answer: string;
}
```

**响应参数**:
```typescript
{
  code: number;
  msg: string;
  data: {
    analysis: {
      error_type: string;           // 错误类型
      error_reason: string;         // 错误原因
      knowledge_points: string[];   // 相关知识点
      learning_suggestions: string; // 学习建议
    };
    generated_exercises: Array<{
      exercise_id: string;
      question: string;
      options?: string[];
      correct_answer?: string;
      explanation?: string;
      difficulty_level?: string;
      knowledge_points?: string[];
    }>;
  }
}
```

### 5.4 获取错题分析历史

**接口地址**: `GET /edu/frontend/v1/ai/wrong-exercise/history`

**请求参数**:
```typescript
{
  course_id?: number | string;
  page?: number;
  page_size?: number;
}
```

**响应参数**:
```typescript
{
  code: number;
  msg: string;
  data: {
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
    records: Array<{
      id: string;
      course_id: string | number;
      original_exercise_id: string;
      original_exercise_content: string;
      student_answer: string;
      correct_answer: string;
      analysis: object;
      generated_exercises: Array<object>;
      created_at: string;
      updated_at: string;
    }>;
  }
}
```

### 5.5 作文批改分析

**接口地址**: `POST /edu/frontend/v1/ai/essay/analyze`

**请求参数**:
```typescript
{
  essayType: "chinese" | "english";
  content: string;
}
```

**响应参数**:
```typescript
{
  code: number;
  msg: string;
  data: {
    score: number;       // 总分
    content: string;     // 内容评价
    structure: string;   // 结构评价
    language: string;    // 语言评价
    suggestions: string; // 改进建议
  }
}
```

---

## 6. 后端课程管理模块

### 6.1 创建课程

**接口地址**: `POST /edu/backend/v1/course/create`

**请求参数**:
```typescript
{
  title: string;           // 课程标题
  thumb_url: string;       // 课程封面地址
  shortDesc: string;       // 课程简介
  isRequired: number;      // 是否必修 1:必修 0:选修
  categoryIds: number[];   // 课程分类ID列表
  isChapter: number;       // 是否章节 1:是 0:否
  endingTime: string;      // 课程结束时间
  chapterList?: Array<{
    chapterId?: number;
    name: string;
    hourList: Array<{
      resourceId: number;
      duration: number;
      title?: string;
      rType?: string;
      hourId?: number;
      fileUrl?: string;
    }>;
  }>;
  hourList?: Array<{
    resourceId: number;
    duration: number;
    title?: string;
    rType?: string;
    hourId?: number;
    fileUrl?: string;
  }>;
  attrList?: Array<{
    resourceId: number;
    title?: string;
    rType?: string;
    attrId?: number;
    fileUrl?: string;
  }>;
}
```

**响应参数**:
```typescript
{
  code: number;
  msg: string;
  data: {
    courseId: number;  // 新建课程ID
  }
}
```

### 6.2 更新课程

**接口地址**: `POST /edu/backend/v1/course/update`

**请求参数**:
```typescript
{
  courseId: number;
  title?: string;
  thumbUrl?: string;
  shortDesc?: string;
  isRequired?: number;
  categoryIds?: number[];
  endingTime?: string;
}
```

**响应参数**:
```typescript
{
  code: number;
  msg: string;
  data: null
}
```

### 6.3 获取课程列表

**接口地址**: `GET /edu/backend/v1/course/list`

**请求参数**:
```typescript
{
  pageNum: number;
  pageSize?: number;
  courseName?: string;
}
```

**响应参数**:
```typescript
{
  code: number;
  msg: string;
  data: {
    total: number;
    courseList: Array<{
      courseId: number;
      title: string;
      thumbUrl: string;
      shortDesc: string;
      categoryDesc: string;
      isRequired: number;
      userName: string;
      startTime: string;
      endTime: string;
      categoryList: Array<{
        categoryId: number;
        name: string;
      }>;
    }>;
  }
}
```

### 6.4 获取课时列表

**接口地址**: `GET /edu/backend/v1/course/hours/list`

**请求参数**:
```typescript
{
  courseId: number;
}
```

**响应参数**:
```typescript
{
  code: number;
  msg: string;
  data: {
    courseChapters: Array<{
      chapterId: number;
      name: string;
      hourList: Array<{
        resourceId: number;
        duration: number;
        title: string;
        rType: string;
        hourId: number;
        fileUrl: string;
      }>;
    }>;
  }
}
```

### 6.5 获取课程附件列表

**接口地址**: `GET /edu/backend/v1/course/attr/list`

**请求参数**:
```typescript
{
  courseId: number;
}
```

**响应参数**:
```typescript
{
  code: number;
  msg: string;
  data: {
    courseWares: Array<{
      resourceId: number;
      title: string;
      rType: string;
      attrId: number;
      fileUrl: string;
    }>;
  }
}
```

### 6.6 获取课程详情

**接口地址**: `GET /edu/backend/v1/course/detail`

**请求参数**:
```typescript
{
  courseId: number;
}
```

**响应参数**:
```typescript
{
  code: number;
  msg: string;
  data: {
    courseId: number;
    title: string;
    thumbUrl: string;
    shortDesc: string;
    isRequired: number;
    categoryIds: number[];
    endingTime: string;
  }
}
```

### 6.7 课程分配

**接口地址**: `POST /edu/backend/v1/course/allocation`

**请求参数**:
```typescript
{
  courseId: number;
  userIdList: number[];
}
```

**响应参数**:
```typescript
{
  code: number;
  msg: string;
  data: null
}
```

### 6.8 获取可分配学员列表

**接口地址**: `GET /edu/backend/v1/course/allocation/user/list`

**请求参数**:
```typescript
{
  courseId: number;
  userName?: string;
  pageNum: number;
  pageSize?: number;
}
```

**响应参数**:
```typescript
{
  code: number;
  msg: string;
  data: {
    total: number;
    list: Array<{
      userId: number;
      userName: string;
      avatar: string;
    }>;
  }
}
```

### 6.9 获取学员学习情况

**接口地址**: `GET /edu/backend/v1/course/study/user/list`

**请求参数**:
```typescript
{
  courseId: number;
  userName?: string;
  pageNum: number;
  pageSize?: number;
}
```

**响应参数**:
```typescript
{
  code: number;
  msg: string;
  data: {
    total: number;
    list: Array<{
      userId: number;
      userName: string;
      avatar: string;
      totalHours: number;
      finishedHours: number;
      startStudyTime: string;
      finishedStudyTime?: string;
    }>;
  }
}
```

### 6.10 删除课程

**接口地址**: `POST /edu/backend/v1/course/delete`

**请求参数**:
```typescript
{
  courseId: number;
}
```

**响应参数**:
```typescript
{
  code: number;
  msg: string;
  data: null
}
```

### 6.11 新增章节

**接口地址**: `POST /edu/backend/v1/course/create/chapter`

**请求参数**:
```typescript
{
  courseId: number;
  chapter: {
    chapterId?: number;
    name: string;
    hourList: Array<{
      resourceId: number;
      duration: number;
      title?: string;
      rType?: string;
      hourId?: number;
      fileUrl?: string;
    }>;
  };
}
```

**响应参数**:
```typescript
{
  code: number;
  msg: string;
  data: null
}
```

### 6.12 删除章节

**接口地址**: `POST /edu/backend/v1/course/delete/chapter`

**请求参数**:
```typescript
{
  courseId: number;
  chapterId: number;
}
```

**响应参数**:
```typescript
{
  code: number;
  msg: string;
  data: null
}
```

### 6.13 删除课时

**接口地址**: `POST /edu/backend/v1/course/delete/hour`

**请求参数**:
```typescript
{
  courseId: number;
  chapterId: number;
  hourId: number;
}
```

**响应参数**:
```typescript
{
  code: number;
  msg: string;
  data: null
}
```

### 6.14 生成教案

**接口地址**: `POST /edu/backend/v1/course/generate/teacher/plan`

**请求参数**:
```typescript
{
  course_id: number;
  chapter_id: number;
}
```

**响应参数**:
```typescript
{
  code: number;
  msg: string;
  data: {
    teacherPlanId: number;
  }
}
```

### 6.15 获取教案列表

**接口地址**: `GET /edu/backend/v1/course/teacher/plan/list`

**请求参数**:
```typescript
{
  pageNum: number;
  pageSize?: number;
}
```

**响应参数**:
```typescript
{
  code: number;
  msg: string;
  data: {
    total: number;
    teacherPlanList: Array<{
      teacherPlanId: number;
      courseId: number;
      chapterId: number;
      courseName: string;
      chapterName: string;
    }>;
  }
}
```

### 6.16 查看教案进度

**接口地址**: `GET /edu/backend/v1/course/teacher/plan/progress`

**请求参数**:
```typescript
{
  teacherPlanId: number;
}
```

**响应参数**:
```typescript
{
  code: number;
  msg: string;
  data: {
    progress: number;       // 进度百分比
    downloadUrl?: string;   // 下载地址
  }
}
```

---

## 7. 后端考试管理模块

### 7.1 获取考试列表

**接口地址**: `GET /edu/backend/v1/course/exam/list`

**请求参数**:
```typescript
{
  pageNum: number;
  pageSize?: number;
  courseName?: string;
}
```

**响应参数**:
```typescript
{
  code: number;
  msg: string;
  data: {
    total: number;
    examList: Array<{
      examId: number;
      courseId: number;
      courseName: string;
      title: string;
      description: string;
      questionNum: number;
      totalPoints: number;
      timeLimit: number;
      availableFrom: string;
      availableTo: string;
    }>;
  }
}
```

### 7.2 获取考试试题列表

**接口地址**: `GET /edu/backend/v1/exam/question/list`

**请求参数**:
```typescript
{
  pageNum: number;
  pageSize?: number;
  examId: number;
}
```

**响应参数**:
```typescript
{
  code: number;
  msg: string;
  data: {
    total: number;
    questionList: Array<{
      questionType: number;    // 题型:1-单选/2-多选/3-判断/4-填空/5-简答/6-论述
      title: string;
      stem: string;
      options: string;// JSON格式
      correctAnswer: string;
      analysis: string;
      points: number;
      difficulty: number;      // 难度等级(1-5)
      sortOrder: number;}>;
  }
}
```

### 7.3 创建考试

**接口地址**: `POST /edu/backend/v1/course/exam/create`

**请求参数**:
```typescript
{
  courseId: number;
  title: string;
  description: string;
  timeLimit: number;       // 分钟
  availableFrom: string;   // yyyy-MM-dd HH:mm:ss
  availableTo: string;     // yyyy-MM-dd HH:mm:ss
}
```

**响应参数**:
```typescript
{
  code: number;
  msg: string;
  data: {
    examId: number;}
}
```

### 7.4 更新考试

**接口地址**: `POST /edu/backend/v1/course/exam/update`

**请求参数**:
```typescript
{
  examId: number;
  title?: string;
  description?: string;
  timeLimit?: number;
  availableFrom?: string;
  availableTo?: string;
}
```

**响应参数**:
```typescript
{
  code: number;
  msg: string;
  data: null
}
```

### 7.5 删除考试

**接口地址**: `POST /edu/backend/v1/course/exam/delete`

**请求参数**:
```typescript
{
  examId: number;
}
```

**响应参数**:
```typescript
{
  code: number;
  msg: string;
  data: null
}
```

### 7.6 批量添加考试试题

**接口地址**: `POST /edu/backend/v1/exam/question/batch/add`

**请求参数**:
```typescript
{
  examId: number;
  questions: Array<{
    questionType: number;
    title: string;
    stem: string;
    options: string;
    correctAnswer: string;
    analysis: string;
    points: number;
    difficulty: number;
    sortOrder: number;
  }>;
}
```

**响应参数**:
```typescript
{
  code: number;
  msg: string;
  data: null
}
```

---

## 8. 后端作业管理模块

### 8.1 获取作业列表

**接口地址**: `GET /edu/backend/v1/course/homework/list`

**请求参数**:
```typescript
{
  pageNum: number;
  pageSize?: number;
  homeworkName?: string;
  courseId?: number;
}
```

**响应参数**:
```typescript
{
  code: number;
  msg: string;
  data: {
    total: number;
    homeworkList: Array<{
      homeworkId: number;
      courseId: number;
      courseName: string;
      chapterId: number;
      chapterName: string;
      hourId: number;
      hourName: string;
      title: string;
      description: string;
      questionNum: number;
      totalPoints: number;
      dueDate: string;
    }>;
  }
}
```

### 8.2 获取作业试题列表

**接口地址**: `GET /edu/backend/v1/homework/question/list`

**请求参数**:
```typescript
{
  pageNum: number;
  pageSize?: number;
  homeworkId: number;
}
```

**响应参数**:
```typescript
{
  code: number;
  msg: string;
  data: {
    total: number;
    questionList: Array<{
      questionType: number;
      title: string;
      stem: string;
      options: string;
      correctAnswer: string;
      analysis: string;
      points: number;
      difficulty: number;
      sortOrder: number;
    }>;
  }
}
```

### 8.3 创建作业

**接口地址**: `POST /edu/backend/v1/course/homework/create`

**请求参数**:
```typescript
{
  courseId: number;
  chapterId: number;
  hourId: number;
  title: string;
  description: string;dueDate: string;   // yyyy-MM-dd HH:mm:ss
}
```

**响应参数**:
```typescript
{
  code: number;
  msg: string;
  data: {
    homeworkId: number;
  }
}
```

### 8.4 更新作业

**接口地址**: `POST /edu/backend/v1/course/homework/update`

**请求参数**:
```typescript
{
  homeworkId: number;
  title?: string;
  description?: string;
  dueDate?: string;
}
```

**响应参数**:
```typescript
{
  code: number;
  msg: string;
  data: null
}
```

### 8.5 删除作业

**接口地址**: `POST /edu/backend/v1/course/homework/delete`

**请求参数**:
```typescript
{
  homeworkId: number;
}
```

**响应参数**:
```typescript
{
  code: number;
  msg: string;
  data: null
}
```

### 8.6 批量添加作业试题

**接口地址**: `POST /edu/backend/v1/homework/question/batch/add`

**请求参数**:
```typescript
{
  homeworkId: number;
  questions: Array<{
    questionType: number;
    title: string;
    stem: string;
    options: string;
    correctAnswer: string;
    analysis: string;
    points: number;
    difficulty: number;
    sortOrder: number;
  }>;
}
```

**响应参数**:
```typescript
{
  code: number;
  msg: string;
  data: null
}
```

---

## 9. 后端分类管理模块

### 9.1 获取分类列表

**接口地址**: `GET /edu/backend/v1/course/category/list`

**请求参数**:
```typescript
{
  pageNum: number;
  pageSize?: number;
}
```

**响应参数**:
```typescript
{
  code: number;
  msg: string;
  data: {
    total: number;
    categoryList: Array<{
      categoryId: number;
      name: string;
    }>;
  }
}
```

### 9.2 添加/更新分类

**接口地址**: `POST /edu/backend/v1/course/category/upsert`

**请求参数**:
```typescript
{
  categoryId?: number;    // 有则更新，无则新增
  categoryName: string;
}
```

**响应参数**:
```typescript
{
  code: number;
  msg: string;
  data: null
}
```

### 9.3 删除分类

**接口地址**: `POST /edu/backend/v1/course/category/delete`

**请求参数**:
```typescript
{
  categoryId: number;
}
```

**响应参数**:
```typescript
{
  code: number;
  msg: string;
  data: null
}
```

---

## 10. 后端统计模块

### 10.1 获取老师使用情况

**接口地址**: `GET /edu/backend/v1/statistics/teacher/usage`

**请求参数**: 无

**响应参数**:
```typescript
{
  code: number;
  msg: string;
  data: {
    usageInfoList: Array<{
      date: string;      // 日期 yyyy-MM-dd
      usageNum: number;  // 使用次数
    }>;
  }
}
```

### 10.2 获取学生使用情况

**接口地址**: `GET /edu/backend/v1/statistics/student/usage`

**请求参数**: 无

**响应参数**:
```typescript
{
  code: number;
  msg: string;
  data: {
    usageInfoList: Array<{
      date: string;
      usageNum: number;
    }>;
  }
}
```

### 10.3 获取一周使用情况

**接口地址**: `GET /edu/backend/v1/statistics/week/usage`

**请求参数**: 无

**响应参数**:
```typescript
{
  code: number;
  msg: string;
  data: {
    studentTotalNum: number;  // 学生总次数
    teacherTotalNum: number;  // 老师总次数}
}
```

### 10.4 获取课程学生进度

**接口地址**: `GET /edu/backend/v1/statistics/course/users/progress`

**请求参数**: 无

**响应参数**:
```typescript
{
  code: number;
  msg: string;
  data: {
    courseUsersProgress: Array<{
      courseId: number;
      courseName: string;
      usersProgress: Array<{
        userId: number;
        userName: string;
        progress: number;  // 进度百分比
      }>;
    }>;
  }
}
```

### 10.5 获取课程考试成绩

**接口地址**: `GET /edu/backend/v1/statistics/course/users/exam/info`

**请求参数**: 无

**响应参数**:
```typescript
{
  code: number;
  msg: string;
  data: {
    courseUsersExamInfoList: Array<{
      courseId: number;
      courseName: string;
      examId: number;
      examName: string;
      examInfo: Array<{
        level: number;        // 成绩等级 1:差 2:中等 3:良好 4:优秀
        levelNum: number;     // 等级对应的学生人数
        levelUserList: Array<{
          userId: number;
          userName: string;}>;
      }>;
    }>;
  }
}
```

### 10.6 获取教学效率指数

**接口地址**: `GET /edu/backend/v1/statistics/efficient/index`

**请求参数**: 无

**响应参数**:
```typescript
{
  code: number;
  msg: string;
  data: {
    efficientIndexList: Array<{
      courseName: string;
      planTime: number;            // 备课耗时(分钟)
      correctPlanTime: number;     // 备课修正耗时(分钟)
      planWorkTime: number;        // 作业设计耗时(分钟)
      correctPlanWorkTime: number; // 作业设计修正耗时(分钟)
      optimizeDirection?: string;  // 优化方向建议
    }>;
  }
}
```

---

## 11. 后端HTML动画模块

### 11.1 生成动画

**接口地址**: `POST /edu/backend/v1/html-animation/generate`

**请求参数**:
```typescript
{
  courseId: number;
  chapterId: number;
}
```

**响应参数**:
```typescript
{
  code: number;
  msg: string;
  data: {
    courseId: number;
    chapterId: number;
    taskId: string;
    status: string;
    message: string;
  }
}
```

### 11.2 获取动画任务列表

**接口地址**: `GET /edu/backend/v1/html-animation/list`

**请求参数**:
```typescript
{
  courseId: number;
  chapterId: number;
}
```

**响应参数**:
```typescript
{
  code: number;
  msg: string;
  data: {
    courseId: number;
    chapterId: number;
    tasks: Array<{
      taskId: string;
      status: "pending" | "processing" | "completed" | "failed";
      version: number;
      fileName: string;
      objectName: string;
      fileUrl?: string;
      fileSize: number;
      errorMessage: string;
      createdAt: string;
      updatedAt: string;
      completedAt: string;
    }>;
    displayVersionRaw: string;
    displayVersionResolved: string;
  }
}
```

### 11.3 设置展示版本

**接口地址**: `POST /edu/backend/v1/html-animation/display/set`

**请求参数**:
```typescript
{
  courseId: number;
  chapterId: number;
}
```

**响应参数**:
```typescript
{
  code: number;
  msg: string;
  data: null
}
```

### 11.4 强制同步

**接口地址**: `POST /edu/backend/v1/html-animation/sync`

**请求参数**: 无

**响应参数**:
```typescript
{
  code: number;
  msg: string;
  data: {
    totalChapters: number;
    successChapters: number;
  }
}
```

### 11.5 获取展示版本(前台)

**接口地址**: `GET /edu/frontend/v1/html-animation/display`

**请求参数**:
```typescript
{
  courseId: number;
  chapterId: number;
}
```

**响应参数**:
```typescript
{
  code: number;
  msg: string;
  data: {
    courseId: number;
    chapterId: number;
    version: string;
    url: string;
  }
}
```

---

## 12. 后端习题管理模块

### 12.1 删除习题

**接口地址**: `POST /edu/backend/v1/work/delete/question`

**请求参数**:
```typescript
{
  deleteType: number;   // 删除类型 1:试卷 2:作业
  sourceId: number;     // 试卷、作业的ID
  questionId: number;   // 习题的ID
}
```

**响应参数**:
```typescript
{
  code: number;
  msg: string;
  data: null
}
```

### 12.2 随机添加习题

**接口地址**: `POST /edu/backend/v1/work/round/add/question`

**请求参数**:
```typescript
{
  addType: number;   // 新增的类型 1:试卷 2:作业
  sourceId: number;  // 试卷、作业的ID
}
```

**响应参数**:
```typescript
{
  code: number;
  msg: string;
  data: null
}
```

---

## 13. 后端用户管理模块

### 13.1 文件上传

**接口地址**: `POST /edu/v1/user/upload`

**请求参数**: FormData
```typescript
{
  file: File;  // 文件
}
```

**响应参数**:
```typescript
{
  code: number;
  msg: string;
  data: {
    url: string;     // 文件URL
    fileId: number;  // 文件ID}
}
```

### 13.2 获取文件列表

**接口地址**: `GET /edu/backend/v1/user/file/list`

**请求参数**:
```typescript
{
  pageNum: number;
  pageSize?: number;
}
```

**响应参数**:
```typescript
{
  code: number;
  msg: string;
  data: {
    total: number;
    fileList: Array<{
      fileId: number;
      fileUrl: string;
      fileName: string;
      extension: string;
      size: number;
      resourceType: string;
    }>;
  }
}
```

### 13.3 获取用户列表

**接口地址**: `GET /edu/backend/v1/user/list`

**请求参数**:
```typescript
{
  pageNum: number;
  pageSize?: number;
  mobile?: string;
}
```

**响应参数**:
```typescript
{
  code: number;
  msg: string;
  data: {
    total: number;
    userList: Array<{
      id: number;
      mobile: string;
      nickname: string;
      sex: number;
      avatar: string;
      info: string;
      roleType: number;
    }>;
  }
}
```

### 13.4 修改用户角色

**接口地址**: `POST /edu/backend/v1/user/update/role`

**请求参数**:
```typescript
{
  targetUserId: number;
  roleType: number;      // 1:学生 2:教师 3:管理员
}
```

**响应参数**:
```typescript
{
  code: number;
  msg: string;
  data: null
}
```

---

## 14. PPT模块

### 14.1 获取PPT Token

**接口地址**: `POST /edu/v1/user/get/ppt/token`

**请求参数**: 无

**响应参数**:
```typescript
{
  code: number;
  msg: string;
  data: {
    token: string;    // PPT生成token
    expire: number;   // 过期时间戳
  }
}
```

---

## 15. 虚拟实验室模块

### 15.1 获取实验室统计数据

**接口地址**: `GET /edu/frontend/v1/lab/stats`

**请求参数**: 无

**响应参数**:
```typescript
{
  code: number;
  msg: string;
  data: {
    animations: number;  // 动画数量
    games: number;       // 游戏数量
    completed: number;   // 已完成数量
  }
}
```

### 15.2 获取实验项目列表

**接口地址**: `GET /edu/frontend/v1/lab/list`

**请求参数**:
```typescript
{
  category?: "animation" | "game" | "simulation" | "all";
}
```

**响应参数**:
```typescript
{
  code: number;
  msg: string;
  data: {
    list: Array<{
      id: number;
      title: string;
      description: string;
      icon: string;
      category: string;
      difficulty: "easy" | "medium" | "hard";
      duration: string;
      gradient: string;
      featured?: boolean;
      url: string;
    }>;
  }
}
```

---

## 16. 赛事场模块

### 16.1 获取赛事场统计与排名

**接口地址**: `GET /edu/frontend/v1/competition/stats`

**请求参数**: 无

**响应参数**:
```typescript
{
  code: number;
  msg: string;
  data: {
    userRank: number;      // 当前排名
    userPoints: number;    // 积分
    ojStats: {
      total: number;       // 总题目
      solved: number;      // 已解决
    };
    trainingStats: {
      categories: number;  // 分类数
      questions: number;   // 题目总数
    };
    securityStats: {
      participants: number; // 参与人数
    };
  }
}
```

### 16.2 获取热门赛事列表

**接口地址**: `GET /edu/frontend/v1/competition/events`

**请求参数**: 无

**响应参数**:
```typescript
{
  code: number;
  msg: string;
  data: {
    list: Array<{
      id: number;
      title: string;
      description: string;
      time: string;
      participants: number;
      status: "upcoming" | "ongoing" | "ended";
    }>;
  }
}
```

### 16.3 获取积分排行榜

**接口地址**: `GET /edu/frontend/v1/competition/leaderboard`

**请求参数**:
```typescript
{
  type: "weekly" | "monthly" | "total";
}
```

**响应参数**:
```typescript
{
  code: number;
  msg: string;
  data: {
    list: Array<{
      id: number;
      username: string;
      avatar: string;
      solved: number;
      points: number;
    }>;
  }
}
```

### 16.4 获取 OJ 题目列表

**接口地址**: `GET /edu/frontend/v1/competition/oj/list`

**请求参数**:
```typescript
{
  difficulty?: string;
  category?: string;
  keyword?: string;
  pageNum?: number;
  pageSize?: number;
}
```

**响应参数**:
```typescript
{
  code: number;
  msg: string;
  data: {
    total: number;
    list: Array<{
      id: number;
      title: string;
      difficulty: "easy" | "medium" | "hard";
      acceptance: string;
      status: "solved" | "attempted" | "";
    }>;
  }
}
```

### 16.5 获取训练分类

**接口地址**: `GET /edu/frontend/v1/competition/training/categories`

**请求参数**: 无

**响应参数**:
```typescript
{
  code: number;
  msg: string;
  data: {
    list: Array<{
      id: number;
      name: string;
      icon: string;
      count: number;
      progress: number;
    }>;
  }
}
```

### 16.6 获取国家安全竞赛题目

**接口地址**: `GET /edu/frontend/v1/competition/security/quiz`

**请求参数**: 无

**响应参数**:
```typescript
{
  code: number;
  msg: string;
  data: {
    questions: Array<{
      question: string;
      options: string[];
      answer: number; // 正确选项索引
    }>;
  }
}
```

---

## 附录：Mock数据状态码说明

| 状态码 | 说明 |
|--------|------|
| 0| 成功（用户中心接口）|
| 200 | 成功（通用接口）|
| 400 | 请求参数错误 |
| 401 | 未授权/登录过期 |
| 403 | 无权限 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

## 附录：题型说明

| 题型值 | 说明 |
|--------|------|
| 1 | 单选题 |
| 2 | 多选题 |
| 3 | 判断题 |
| 4 | 填空题 |
| 5 | 简答题 |
| 6 | 论述题 |

## 附录：角色类型说明

| 角色值 | 说明 |
|--------|------|
| 1 | 学生 |
| 2 | 教师 |
| 3 | 管理员 |

## 附录：作业/考试状态说明

| 状态值 | 说明 |
|--------|------|
| 1 | 未开始 |
| 2 | 进行中 |
| 3 | 已完成 |
| 4 | 已过期 |
