# 后端开发Issue：课程统计概览接口

## 📋 Issue 概述

### 需求背景

当前课程列表页面的统计概览组件（`CourseStats.vue`）中的以下数据为前端模拟数据，需要后端提供真实接口：

| 指标 | 当前状态 | 说明 |
|------|----------|------|
| 在学人数 | ❌ 模拟数据 | `courseList.reduce((acc, curr) => acc + (curr.studentCount \|\| 10), 0)` |
| 累计课时 | ❌ 模拟数据 | `courseList.length * 15` |
| 平均完成率 | ❌ 模拟数据 | 固定值 `"78%"` |

### 前端代码位置

- 统计组件：`src/views/course/list/components/CourseStats.vue`
- 数据使用：`src/views/course/list/index.vue`（第711-716行、第924-927行）

---

## 🔧 接口设计方案

### 方案一：独立统计接口（推荐）

#### 接口地址

`/edu/backend/v1/course/stats/overview`

#### 请求方式

`GET`

#### 请求头

```
Authorization: Bearer {token}
Content-Type: application/json
```

#### 请求参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| teacherId | int64 | 否 | 教师ID，不传则统计当前登录教师的数据；管理员可传指定教师ID |
| startDate | string | 否 | 统计开始日期，格式：yyyy-MM-dd |
| endDate | string | 否 | 统计结束日期，格式：yyyy-MM-dd |

#### 请求示例

```http
GET /edu/backend/v1/course/stats/overview?startDate=2025-01-01&endDate=2026-01-13
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

#### 响应参数

```json
{
  "code": 200,
  "msg": "成功",
  "data": {
    "totalCourses": 25,              // 课程总数
    "totalStudents": 1280,           // 在学人数（去重后的总学习人数）
    "totalHours": 486,               // 累计课时（所有课程的课时总和，单位：分钟或小时，建议分钟）
    "totalHoursUnit": "分钟",        // 课时单位
    "avgCompletionRate": 78.5,       // 平均完成率（百分比数值，如78.5代表78.5%）
    "activeStudents": 856,           // 活跃学习人数（近7天有学习记录的人数）
    "completedStudents": 432,        // 已完成全部课程的学生人数
    "inProgressStudents": 848,       // 学习中的学生人数
    "lastUpdatedAt": "2026-01-13 10:30:00"  // 数据最后更新时间
  }
}
```

#### 响应参数说明

| 字段名 | 类型 | 说明 |
|--------|------|------|
| totalCourses | int64 | 教师创建的课程总数 |
| totalStudents | int64 | 去重后的在学人数，即所有课程的学习学生总人数（同一学生学习多门课程只计算一次） |
| totalHours | int64 | 累计课时，所有课程的课时总和 |
| totalHoursUnit | string | 课时单位（"分钟" 或 "小时"） |
| avgCompletionRate | float64 | 平均完成率，所有课程完成率的加权平均值（按学生人数加权） |
| activeStudents | int64 | 活跃学习人数（可选字段，近7天内有学习记录的学生数） |
| completedStudents | int64 | 已完成全部课程的学生人数（可选字段） |
| inProgressStudents | int64 | 学习中的学生人数（可选字段） |
| lastUpdatedAt | string | 数据最后更新时间，格式：yyyy-MM-dd HH:mm:ss |

---

### 方案二：扩展现有课程列表接口

在现有 `/edu/backend/v1/course/list` 接口响应中增加统计数据字段。

#### 扩展后的响应参数

```json
{
  "code": 200,
  "msg": "成功",
  "data": {
    "total": 25,
    "courseList": [...],
    "statsOverview": {                    // 新增统计概览字段
      "totalStudents": 1280,              // 在学人数
      "totalHours": 486,                  // 累计课时
      "totalHoursUnit": "分钟",           // 课时单位
      "avgCompletionRate": 78.5           // 平均完成率
    }
  }
}
```

---

## 📊 字段计算逻辑详解

### 1. 在学人数（totalStudents）

#### 计算规则

```sql
-- 统计当前教师所有课程的学习学生，去重计数
SELECT COUNT(DISTINCT user_id) as totalStudents
FROM course_user_relation cur
INNER JOIN course c ON cur.course_id = c.course_id
WHERE c.teacher_id = #{teacherId}
  AND cur.study_status IN (1, 2)  -- 1:学习中 2:已完成
  AND cur.deleted = 0
```

#### 业务说明

- 同一学生学习多门课程只计算一次
- 只统计有效的学习关系（未删除）
- 可选：区分"活跃学习"和"已分配但未开始学习"

### 2. 累计课时（totalHours）

#### 计算规则

```sql
-- 统计当前教师所有课程的总课时
SELECT SUM(h.duration) as totalMinutes
FROM course_hour h
INNER JOIN course c ON h.course_id = c.course_id
WHERE c.teacher_id = #{teacherId}
  AND h.deleted = 0
  AND c.deleted = 0
```

#### 业务说明

- 单位建议使用**分钟**，前端根据数值自动转换显示
- 若数据库中 `duration` 为秒，需要除以60转换
- 包含所有类型的课时资源（视频、文档等）

#### 前端显示转换建议

```javascript
// 前端显示转换
function formatHours(minutes) {
  if (minutes < 60) return `${minutes}分钟`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}小时${mins}分钟` : `${hours}小时`;
}
```

### 3. 平均完成率（avgCompletionRate）

#### 计算规则

```sql
-- 方案A：简单平均
SELECT AVG(completion_rate) as avgCompletionRate
FROM (
  SELECT 
    c.course_id,
    COALESCE(
      SUM(CASE WHEN cur.study_status = 2 THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(cur.user_id), 0),
      0
    ) as completion_rate
  FROM course c
  LEFT JOIN course_user_relation cur ON c.course_id = cur.course_id AND cur.deleted = 0
  WHERE c.teacher_id = #{teacherId}
    AND c.deleted = 0
  GROUP BY c.course_id
) course_rates

-- 方案B：加权平均（推荐，按学生人数加权）
SELECT 
  SUM(completed_count) * 100.0 / NULLIF(SUM(total_count), 0) as avgCompletionRate
FROM (
  SELECT 
    c.course_id,
    COUNT(CASE WHEN cur.study_status = 2 THEN 1 END) as completed_count,
    COUNT(cur.user_id) as total_count
  FROM course c
  LEFT JOIN course_user_relation cur ON c.course_id = cur.course_id AND cur.deleted = 0
  WHERE c.teacher_id = #{teacherId}
    AND c.deleted = 0
  GROUP BY c.course_id
) course_stats
```

#### 业务说明

- 完成率 = 已完成学习的学生数 / 总分配学生数 × 100%
- 推荐使用**加权平均**，避免学生少的课程过度影响整体数据
- 保留一位小数，如 `78.5`
- 若课程无学生，该课程不参与平均计算

---

## 🗄️ 数据库表结构参考

### 相关表

```sql
-- 课程表
CREATE TABLE course (
  course_id BIGINT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL COMMENT '课程标题',
  teacher_id BIGINT NOT NULL COMMENT '教师ID',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  deleted TINYINT DEFAULT 0
);

-- 课程课时表
CREATE TABLE course_hour (
  hour_id BIGINT PRIMARY KEY AUTO_INCREMENT,
  course_id BIGINT NOT NULL COMMENT '课程ID',
  title VARCHAR(255) COMMENT '课时标题',
  duration INT NOT NULL COMMENT '时长(秒)',
  deleted TINYINT DEFAULT 0
);

-- 课程用户关系表
CREATE TABLE course_user_relation (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  course_id BIGINT NOT NULL COMMENT '课程ID',
  user_id BIGINT NOT NULL COMMENT '用户ID',
  study_status TINYINT DEFAULT 0 COMMENT '学习状态: 0-未开始 1-学习中 2-已完成',
  progress INT DEFAULT 0 COMMENT '学习进度(0-100)',
  start_time DATETIME COMMENT '开始学习时间',
  finish_time DATETIME COMMENT '完成时间',
  deleted TINYINT DEFAULT 0
);
```

---

## 🔐 权限控制

| 角色 | 权限说明 |
|------|----------|
| 管理员 | 可查看全平台统计数据，可指定teacherId查看特定教师数据 |
| 教师 | 只能查看自己创建课程的统计数据 |
| 学生 | 无权访问此接口 |

---

## ❌ 错误码定义

| 错误码 | HTTP状态码 | 说明 |
|--------|------------|------|
| 200 | 200 | 成功 |
| 401 | 401 | 未授权，Token无效或过期 |
| 403 | 403 | 无权限访问 |
| 500 | 500 | 服务器内部错误 |

#### 错误响应示例

```json
{
  "code": 401,
  "msg": "Token已过期，请重新登录",
  "data": null
}
```

---

## 📝 前端对接说明

### API 调用示例

```typescript
// src/api/course.ts

export interface CourseStatsOverview {
  totalCourses: number;
  totalStudents: number;
  totalHours: number;
  totalHoursUnit: string;
  avgCompletionRate: number;
  activeStudents?: number;
  completedStudents?: number;
  inProgressStudents?: number;
  lastUpdatedAt?: string;
}

/**
 * 获取课程统计概览数据
 */
export const getCourseStatsOverview = (params?: {
  teacherId?: number;
  startDate?: string;
  endDate?: string;
}) => {
  return http.request<ApiResponse<CourseStatsOverview>>(
    "get",
    "/edu/backend/v1/course/stats/overview",
    { params }
  );
};
```

### 前端使用示例

```typescript
// src/views/course/list/index.vue

const courseStats = reactive({
  totalCourses: 0,
  totalStudents: 0,
  totalHours: 0,
  completionRate: "0%"
});

// 获取统计数据
const fetchCourseStats = async () => {
  try {
    const res = await getCourseStatsOverview();
    if (res.code === 200 && res.data) {
      courseStats.totalCourses = res.data.totalCourses;
      courseStats.totalStudents = res.data.totalStudents;
      courseStats.totalHours = res.data.totalHours;
      courseStats.completionRate = `${res.data.avgCompletionRate}%`;
    }
  } catch (error) {
    console.error("获取课程统计数据失败:", error);
  }
};
```

---

## ✅ 验收标准

1. [ ] 接口返回数据格式符合规范
2. [ ] 在学人数统计准确（去重）
3. [ ] 累计课时计算正确
4. [ ] 平均完成率使用加权平均计算
5. [ ] 权限控制正确（教师只能看自己的数据）
6. [ ] 接口响应时间 < 500ms
7. [ ] 支持日期范围筛选
8. [ ] 错误码返回规范

---

## 📅 优先级与排期建议

- **优先级**：P1（高）
- **预估工时**：2-3人天
- **建议排期**：
    - 数据库索引优化：0.5天
    - 接口开发：1天
    - 单元测试：0.5天
    - 联调测试：0.5天

---

## 📎 相关文档

- [课程管理接口文档](./course.md)
- [统计接口文档](./statistics.md)
- [API文档规范](../API-DOC.md)

---

## 💬 备注

1. 如果统计数据量大，建议考虑**定时任务预计算**，存入统计汇总表
2. 可增加**Redis缓存**，缓存时间建议5-10分钟
3. 后续可扩展更多维度的统计指标（如：近7天新增学生数、课程完成趋势等）
