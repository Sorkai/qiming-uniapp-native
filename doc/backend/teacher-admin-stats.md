#教师端/管理员端统计数据接口

## 接口概述

为个人信息档案界面提供教师端和管理员端的统计数据，包括入驻日期、资源总量、全站效率、平台教研活跃态势等。

---

## 一、教师端统计接口

### 接口信息

| 项目 | 说明 |
|------|------|
| **接口路径** | `/edu/backend/v1/teacher/stats` |
| **请求方式** | `GET` |
| **需要鉴权** | 是（需要携带 Token） |
| **接口描述** | 获取当前登录教师的教学统计数据 |

### 请求参数

无需请求参数，通过 Token 识别当前用户。

### 响应参数

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| code | number | 是 | 状态码，200 表示成功 |
| msg | string | 是 | 响应消息 |
| data | object | 是 | 响应数据 |
| data.joinDate | string | **是** | 入驻日期（用户注册/创建时间），格式：`YYYY-MM-DD` |
| data.totalStudents | number | 是 | 授课学生总数 |
| data.activeCourses | number | 是 | 活跃课程数 |
| data.avgEfficiency | number | 是 | 备课平均耗时（分钟） |
| data.courseProgress | array | 否 | 课程进度监控数据 |

#### courseProgress 数组元素

| 字段名 | 类型 | 说明 |
|--------|------|------|
| courseName | string | 课程名称 |
| avgProgress | number | 学生平均进度（0-100） |
| studentCount | number | 参与学生数 |

### 响应示例

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "joinDate": "2023-09-01",
    "totalStudents": 156,
    "activeCourses": 8,
    "avgEfficiency": 45,
    "courseProgress": [
      {
        "courseName": "Python入门",
        "avgProgress": 75,
        "studentCount": 42
      },
      {
        "courseName": "数据结构",
        "avgProgress": 60,
        "studentCount": 38
      }
    ]
  }
}
```

### 数据库参考

```sql
-- 入驻日期
SELECT DATE_FORMAT(create_time, '%Y-%m-%d') as joinDate 
FROM user
WHERE id = ? AND role_type = 2;

-- 授课学生数
SELECT COUNT(DISTINCT uc.user_id) as totalStudents
FROM course c
JOIN user_course uc ON c.id = uc.course_id
WHERE c.teacher_id = ?;

-- 活跃课程数
SELECT COUNT(*) as activeCourses
FROM course
WHERE teacher_id = ? AND status = 1;
```

---

## 二、管理员端统计接口

### 接口信息

| 项目 | 说明 |
|------|------|
| **接口路径** | `/edu/backend/v1/admin/stats` |
| **请求方式** | `GET` |
| **需要鉴权** | 是（需要携带 Token，且为管理员角色） |
| **接口描述** | 获取平台整体统计数据 |

### 请求参数

无需请求参数，通过 Token 识别当前用户。

### 响应参数

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| code | number | 是 | 状态码，200 表示成功 |
| msg | string | 是 | 响应消息 |
| data | object | 是 | 响应数据 |
| data.joinDate | string | **是** | 系统入驻日期（管理员创建时间），格式：`YYYY-MM-DD` |
| data.totalActivity | number | 是 | 本周活跃用户数 |
| data.platformEfficiency | number | 是 | 全站效率指数（0-100） |
| data.totalResources | number | 是 | 资源总量（课程、课件等） |
| data.teacherActivity | array | 是 | 平台教研活跃态势 |

#### teacherActivity 数组元素

| 字段名 | 类型 | 说明 |
|--------|------|------|
| name | string | 指标名称 |
| value | number | 指标值 |
| unit | string | 单位 |

### 响应示例

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "joinDate": "2022-01-15",
    "totalActivity": 1280,
    "platformEfficiency": 94,
    "totalResources": 568,
    "teacherActivity": [
      {
        "name": "教师周活跃总次",
        "value": 2450,
        "unit": "次"
      },
      {
        "name": "日均教研频率",
        "value": 350,
        "unit": "次/日"
      },
      {
        "name": "入驻教师总数",
        "value": 42,
        "unit": "人"
      },
      {
        "name": "教学资源覆盖率",
        "value": 88,
        "unit": "%"
      }
    ]
  }
}
```

### 字段说明

#### joinDate（入驻日期）

- **来源**：用户表的 `create_time` 字段
- **格式**：`YYYY-MM-DD`（只需要日期部分）
- **示例**：`"2022-01-15"`

#### totalActivity（本周活跃）

- **来源**：统计本周活跃的学生和教师总数
- **计算逻辑**：`studentTotalNum + teacherTotalNum`
- **说明**：可复用现有接口 `/edu/backend/v1/statistics/week/usage`

#### platformEfficiency（全站效率）

- **来源**：平台整体教学效率指数
- **计算逻辑**：
  - 可基于课程完成率、作业提交率、平均成绩等综合计算
  - 建议公式：`(课程完成率 * 0.3 + 作业提交率 * 0.3 + 平均成绩/100 * 0.4) * 100`
- **范围**：0-100

#### totalResources（资源总量）

- **来源**：平台所有教学资源数量
- **计算逻辑**：课程数+ 课件数 + 题库数量等
- **说明**：可复用现有接口 `/edu/backend/v1/statistics/platform/overview`

#### teacherActivity（平台教研活跃态势）

- **来源**：教师使用平台的统计数据
- **说明**：可复用现有接口 `/edu/backend/v1/statistics/teacher/usage` 进行计算

### 数据库参考

```sql
-- 入驻日期
SELECT DATE_FORMAT(create_time, '%Y-%m-%d') as joinDate 
FROM user 
WHERE id = ? AND role_type = 3;

-- 全站效率计算
SELECT 
  ROUND(
    (
      (SELECT AVG(progress) FROM user_course) * 0.3 +
      (SELECT COUNT(*) * 100.0 / NULLIF((SELECT COUNT(*) FROM homework), 0) FROM homework_submission) * 0.3 +
      (SELECT AVG(score) FROM homework_submission WHERE status = 'graded') * 0.4
    ), 0
  ) as platformEfficiency;

-- 资源总量
SELECT 
  (SELECT COUNT(*) FROM course WHERE status = 1) +
  (SELECT COUNT(*) FROM courseware WHERE status = 1) +
  (SELECT COUNT(*) FROM question WHERE status = 1)as totalResources;

-- 入驻教师总数
SELECT COUNT(*) as teacherCount FROM user WHERE role_type = 2AND status = 1;
```

---

## 三、现有接口复用说明

以下数据可从现有接口获取，无需新增：

| 数据 | 现有接口 | 说明 |
|------|----------|------|
| 本周活跃 | `/edu/backend/v1/statistics/week/usage` | 返回 `studentTotalNum` + `teacherTotalNum` |
| 资源总量 | `/edu/backend/v1/statistics/platform/overview` | 从 `stats` 数组中查找资源相关项 |
| 教师使用数据 | `/edu/backend/v1/statistics/teacher/usage` | 返回 `usageInfoList` 可计算周活跃总次 |
| 课程进度 | `/edu/backend/v1/statistics/course/users/progress` | 返回 `courseUsersProgress` |
| 备课效率 | `/edu/backend/v1/statistics/efficient/index` | 返回 `efficientIndexList` |

### 需要新增的接口/字段

| 数据 | 说明 | 优先级 |
|------|------|--------|
| **入驻日期** | 教师/管理员的`create_time`，需在用户信息接口返回 | 高 |
| **全站效率** | 需要后端计算综合效率指数 | 中 |
| **入驻教师总数** | 统计教师角色用户数量 | 中 |
| **教学资源覆盖率** | 需定义计算规则后实现 | 低 |

---

## 四、前端调用位置

- **组件**：`src/components/ReAccountSettings/index.vue`
- **函数**：
  - 教师端：`fetchTeacherStats()`
  - 管理员端：`fetchAdminStats()`
- **触发时机**：用户打开"个人信息档案"弹窗时

---

## 五、临时方案

在后端接口完成前，前端已采用以下临时方案：

1. **入驻日期**：从用户信息的 `createdAt` 字段获取
2. **全站效率**：硬编码为 94%
3. **入驻教师总数**：硬编码为 42 人
4. **教学资源覆盖率**：硬编码为 88%

待后端接口完成后，前端将切换为接口数据。

---

## 六、备注

- 接口需要验证用户登录状态和角色权限
- 教师端接口只允许教师角色访问
- 管理员端接口只允许管理员角色访问
- 入驻日期必须返回，其他统计数据如无法计算可返回默认值
