# 教师端/管理员端统计数据接口

## 接口概述

为个人信息档案界面提供教师端和管理员端的统计数据。

> **简化说明**：本文档基于后端可行性分析进行了简化，移除了数据不完整或定义不清的指标，确保所有字段都有可靠的数据来源。

---

## 一、教师端统计接口

### 接口信息

| 项目         | 说明                |
| ------------ | ------------------------------- |
| **接口路径** | `/edu/backend/v1/teacher/stats` |
| **请求方式** | `GET`                           |
| **需要鉴权** | 是（需要携带 Token）|
| **接口描述** | 获取当前登录教师的教学统计数据  |

### 请求参数

无需请求参数，通过 Token 识别当前用户。

### 响应参数

| 字段名              | 类型   | 必填 | 说明                                              |
| ------------------- | ------ | ---- | ------------------------------------------------- |
| code                | number | 是   | 状态码，200 表示成功                              |
| msg                 | string | 是   | 响应消息                                          |
| data                | object | 是   | 响应数据                                          |
| data.joinDate       | string | 是   | 入驻日期（用户注册时间），格式：`YYYY-MM-DD`      |
| data.totalStudents  | number | 是   | 授课学生总数（去重）                              |
| data.activeCourses  | number | 是   | 活跃课程数（未删除的课程）                        |
| data.avgEfficiency  | number | 否   | 备课平均耗时（分钟），无数据时返回 `null`         |
| data.courseProgress | array  | 否   | 课程进度监控数据（最多返回10条）                  |

#### courseProgress 数组元素

| 字段名       | 类型   | 说明                  |
| ------------ | ------ | --------------------- |
| courseId     | number | 课程ID                |
| courseName   | string | 课程名称              |
| avgProgress  | number | 学生平均进度（0-100） |
| studentCount | number | 参与学生数            |

> **注意**：`avgEfficiency` 字段依赖 `course_efficient_index` 表，并非所有课程都有效率记录，无数据时返回 `null`。

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
        "courseId": 1,
        "courseName": "Python入门",
        "avgProgress": 75,
        "studentCount": 42
      },
      {
        "courseId": 2,
        "courseName": "数据结构",
        "avgProgress": 60,
        "studentCount": 38
      }
    ]
  }
}
```

### 数据来源说明

| 字段           | 数据表| 查询逻辑                                           |
| -------------- | ------------------------ | -------------------------------------------------- |
| joinDate       | `user`                   | `create_time` 字段                |
| totalStudents  | `user_course_records`    | 通过 `courses.admin_id` 关联，去重统计 `user_id`|
| activeCourses  | `courses`                | `admin_id =当前用户` 且 `del_state = 0`           |
| avgEfficiency  | `course_efficient_index` | 关联教师课程，计算 `plan_time` 平均值|
| courseProgress | `user_course_records`    | 按课程分组统计平均进度和学生数                     |

### SQL 参考

```sql
-- 入驻日期
SELECT DATE_FORMAT(create_time, '%Y-%m-%d') as joinDate
FROM user WHERE id = ?;

-- 授课学生数（去重）
SELECT COUNT(DISTINCT ucr.user_id) as totalStudents
FROM user_course_records ucr
JOIN courses c ON ucr.course_id = c.id
WHERE c.admin_id = ? AND c.del_state = 0;

-- 活跃课程数
SELECT COUNT(*) as activeCourses
FROM courses
WHERE admin_id = ? AND del_state = 0;

-- 备课平均耗时
SELECT AVG(CASEWHEN correct_plan_time > 0 THEN correct_plan_time 
  ELSE plan_time 
END) as avgEfficiency
FROM course_efficient_index cei
JOIN courses c ON cei.course_id = c.id
WHERE c.admin_id = ? AND c.del_state = 0;
```

---

## 二、管理员端统计接口

### 接口信息

| 项目         | 说明                                 |
| ------------ | ------------------------------------ |
| **接口路径** | `/edu/backend/v1/admin/stats`        |
| **请求方式** | `GET`                                |
| **需要鉴权** | 是（需要携带 Token，且为管理员角色） |
| **接口描述** | 获取平台整体统计数据                 |

### 请求参数

无需请求参数，通过 Token 识别当前用户。

### 响应参数

| 字段名| 类型   | 必填 | 说明                                |
| ----------------------- | ------ | ---- | -------------------------------------------- |
| code                    | number | 是   | 状态码，200 表示成功                         |
| msg                     | string | 是   | 响应消息                                     |
| data                    | object | 是   | 响应数据                                     |
| data.joinDate           | string | 是   | 管理员入驻日期，格式：`YYYY-MM-DD`           |
| data.totalActivity      | number | 是   | 本周活跃用户数（学生+教师）                  |
| data.platformEfficiency | number | 是   | 全站学习进度指数（0-100）                    |
| data.totalResources     | number | 是   | 资源总量（课程数+ 题库数）                  |
| data.teacherActivity    | array  | 是   | 平台教研活跃态势（4项指标）                  |

#### teacherActivity 数组元素（简化版）

| 字段名 | 类型   | 说明     |
| ------ | ------ | -------- |
| name   | string | 指标名称 |
| value  | number | 指标值   |
| unit   | string | 单位     |

### 响应示例

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "joinDate": "2022-01-15",
    "totalActivity": 1280,
    "platformEfficiency": 68,
    "totalResources": 568,
    "teacherActivity": [
      {
        "name": "本周活跃教师数",
        "value": 35,
        "unit": "人"
      },
      {
        "name": "入驻教师总数",
        "value": 42,
        "unit": "人"
      },
      {
        "name": "教师活跃率",
        "value": 83,
        "unit": "%"
      },
      {
        "name": "人均课程数",
        "value": 5,
        "unit": "门"
      }
    ]
  }
}
```

### 字段说明（简化版）

#### joinDate（入驻日期）

- **来源**：`user.create_time`
- **格式**：`YYYY-MM-DD`
- **实现**：✅ 直接查询

#### totalActivity（本周活跃）

- **来源**：现有接口 `/edu/backend/v1/statistics/week/usage`
- **计算**：`studentTotalNum + teacherTotalNum`
- **实现**：✅ 复用现有逻辑

#### platformEfficiency（全站效率指数）- 简化版

> **原需求**：`(课程完成率 * 0.3+ 作业提交率 * 0.3 + 平均成绩/100 * 0.4) * 100`
> 
> **问题**：作业提交率和平均成绩数据不存在

**简化方案**：使用课程平均学习进度作为效率指数

```sql
SELECT ROUND(AVG(progress), 0) as platformEfficiency
FROM user_course_records;
```

- **范围**：0-100
- **含义**：全站学生的平均学习进度
- **实现**：✅ 数据完整可靠

#### totalResources（资源总量）- 简化版

**简化方案**：课程数 + 题库数量

```sql
SELECT (SELECT COUNT(*) FROM courses WHERE del_state = 0) +
  (SELECT COUNT(*) FROM question_bank WHERE del_state = 0) as totalResources;
```

- **实现**：✅ 数据明确

#### teacherActivity（教研活跃态势）- 简化版

> **原需求**：教师周活跃总次、日均教研频率、入驻教师总数、教学资源覆盖率
> 
> **问题**：「活跃总次」和「日均频率」缺乏数据支持，「资源覆盖率」定义不清

**简化方案**：基于现有数据的4项指标

| 指标名称| 计算方式| 可行性 |
| -------------- | --------------------------------------------- | ------ |
| 本周活跃教师数 | Redis缓存，复用现有统计                      | ✅     |
| 入驻教师总数   | `COUNT(*) FROM user WHERE role_type = 2`      | ✅     |
| 教师活跃率     | `本周活跃教师数 / 入驻教师总数 * 100`         | ✅     |
| 人均课程数     | `课程总数 / 入驻教师总数`| ✅     |

### SQL 参考

```sql
-- 入驻日期
SELECT DATE_FORMAT(create_time, '%Y-%m-%d') as joinDate
FROM user WHERE id = ? AND role_type = 3;

-- 全站效率指数（简化版：平均学习进度）
SELECT ROUND(AVG(progress), 0) as platformEfficiency
FROM user_course_records;

-- 资源总量
SELECT 
  (SELECT COUNT(*) FROM courses WHERE del_state = 0) +
  (SELECT COUNT(*) FROM question_bank WHERE del_state = 0) as totalResources;

-- 入驻教师总数
SELECT COUNT(*) as teacherCount 
FROM user 
WHERE role_type = 2 AND del_state = 0;

-- 人均课程数
SELECT ROUND(
  (SELECT COUNT(*) FROM courses WHERE del_state = 0) * 1.0 / NULLIF((SELECT COUNT(*) FROM user WHERE role_type = 2 AND del_state = 0), 0)
, 1) as avgCoursesPerTeacher;
```

---

## 三、简化对照表

### 教师端接口

| 原需求字段     | 简化后       | 变更说明                           |
| -------------- | ------------ | ---------------------------------- |
| joinDate       | ✅ 保留| 无变更                             |
| totalStudents  | ✅ 保留      | 无变更                             |
| activeCourses  | ✅ 保留      | 明确定义为「未删除的课程」         |
| avgEfficiency  |⚠️ 改为可选 | 无数据时返回 null|
| courseProgress | ✅ 保留      | 新增 courseId 字段，限制最多10条   |

### 管理员端接口

| 原需求字段         | 简化后       | 变更说明                                |
| ------------------ | ------------ | ------------------------------------------ |
| joinDate           | ✅ 保留      | 无变更                                     |
| totalActivity      | ✅ 保留      | 无变更                                     |
| platformEfficiency | ⚠️ 简化计算 | 改为「全站平均学习进度」                   |
| totalResources     | ⚠️ 简化定义 | 改为「课程数 + 题库数」                    |
| teacherActivity    |⚠️ 简化指标 | 4项指标全部改为可实现的版本                |

---

## 四、现有接口复用

| 数据           | 现有接口                | 复用方式|
| -------------- | ------------------------------------------------ | ---------------------------- |
| 本周活跃用户   | `/edu/backend/v1/statistics/week/usage`          | 直接使用返回值               |
| 本周活跃教师   | `/edu/backend/v1/statistics/teacher/usage`       | 统计 usageInfoList 长度      |
| 课程进度       | `/edu/backend/v1/statistics/course/users/progress` | 提取公共逻辑                 |
| 备课效率       | `/edu/backend/v1/statistics/efficient/index`     | 计算平均值                   |

---

## 五、前端调用位置

### 组件位置
- **主组件**：`src/components/ReAccountSettings/index.vue`
- **功能**：个人信息档案弹窗，包含资料修改、密码修改、统计数据展示

### 触发入口
| 位置 | 文件 | 触发方式 |
|------|------|----------|
| 顶部导航栏 | `src/layout/components/lay-navbar/index.vue` | 点击用户头像下拉菜单 |
| 账户页面 | `src/views/account/index.vue` | 点击「编辑资料」按钮 |

### 数据获取函数
| 角色 | 函数 | 当前实现 |
|------|------|----------|
| 学生 | `fetchStudentStats()` | ✅ 已有接口 `getStudentStats()` |
| 教师 | `fetchTeacherStats()` | ⚠️ 拼凑现有接口数据 |
| 管理员 | `fetchAdminStats()` | ⚠️ 拼凑现有接口 + 硬编码 |

### 当前临时实现（待替换）

**教师端** - 使用现有接口拼凑：
```typescript
// 课程进度和学生数
const res = await getCourseUsersProgress();
// 备课效率
const effRes = await getEfficientIndex();
// 入驻日期从用户信息获取
teacherStats.joinDate = profileForm.createdAt;
```

**管理员端** - 部分硬编码：
```typescript
// 本周活跃
const weekRes = await getWeekUsage();
// 资源总量
const platRes = await getPlatformStats();
// 教师使用数据
const teacherUsageRes = await getTeacherUsage();

// ⚠️ 硬编码数据（待后端接口替换）
adminStats.teacherActivity = [
  { name: "入驻教师总数", value: 42, unit: "人" },  // 硬编码
  { name: "教学资源覆盖率", value: 88, unit: "%" } // 硬编码
];
adminStats.platformEfficiency = 94; // 硬编码
```

### 触发时机
用户点击顶部导航栏头像 → 下拉菜单「个人信息」→ 打开弹窗 → 根据角色调用对应统计函数

---

## 六、实现优先级

### 高优先级（第一阶段）

1. ✅ 教师端接口完整实现
2. ✅ 管理员端：joinDate、totalActivity、入驻教师总数

### 中优先级（第二阶段）

3. ⚠️ 管理员端：platformEfficiency（简化版）
4. ⚠️ 管理员端：totalResources（简化版）
5. ⚠️ 管理员端：teacherActivity（简化版4项指标）

---

## 七、备注

- 接口需要验证用户登录状态和角色权限
- 教师端接口只允许教师角色（role_type = 2）访问
- 管理员端接口只允许管理员角色（role_type = 3）访问
- 入驻日期必须返回，其他统计数据如无法计算可返回默认值或null
- 建议添加接口缓存（1小时过期），避免频繁查询数据库