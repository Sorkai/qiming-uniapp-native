# 学生端课程成绩详情接口开发 Issue

## 📋 Issue 概述

**类型**：后端接口开发  
**优先级**：高  
**影响页面**：学生端 - 课程详情 - 成绩页面  
**前端组件**：`src/views/account/course-detail/CourseGrades.vue`

---

## 🔍 问题描述

学生端成绩页面以下数据字段显示为空或 0，前端已完成接口定义和 Mock 数据，**需要后端实现真实接口**：

| 数据项       | 当前状态  | 说明                                      |
| ------------ | --------- | ----------------------------------------- |
| 总作业数     | ❌ 无数据 | 需要统计该课程的作业+考试总数             |
| 已完成       | ❌ 无数据 | 需要统计学生已提交的数量                  |
| 平均分       | ❌ 无数据 | 需要计算学生在该课程所有作业/考试的平均分 |
| 最高分       | ❌ 无数据 | 需要获取学生在该课程的最高得分            |
| 完成率       | ❌ 无数据 | 已完成数 / 总数 × 100%                    |
| 学习成绩趋势 | ❌ 无数据 | 需要返回每项作业/考试的得分列表           |
| 班级成绩对比 | ❌ 无数据 | 需要返回个人得分与班级平均分对比          |
| 成绩详情列表 | ❌ 无数据 | 需要返回每项作业/考试的详细信息           |

---

## 🔧 需要开发的接口

### 接口 1：获取课程成绩统计概览

**用途**：用于展示顶部统计卡片（总作业数、已完成、平均分、最高分、完成率）

- **接口路径**：`GET /edu/frontend/v1/course/grades/statistics`- **请求参数**：

| 参数名   | 类型   | 必填 | 说明   |
| -------- | ------ | ---- | ------ |
| courseId | number | 是   | 课程ID |

> 通过 Token 识别当前登录学生

- **响应参数**：

````json
{
  "code": 200,
  "msg": "成功",
  "data": {
    "totalAssignments": 12,
    "completedAssignments": 8,
    "averageScore": 87.2,
    "highestScore": 98,
    "completionRate": 66.7
  }
}

```text
| 字段                 | 类型   | 说明                                              |
| -------------------- | ------ | ------------------------------------------------- |
| totalAssignments     | number | 该课程的作业+考试总数                             |
| completedAssignments | number | 学生已提交的数量                                  |
| averageScore         | number | 学生在该课程所有已批改项目的平均分（保留1位小数） |
| highestScore         | number | 学生在该课程的最高得分                            |
| completionRate       | number | 完成率百分比（保留1位小数）                       |

**计算逻辑**：

```sql
-- 总作业数 = 课程关联的作业数 + 考试数
SELECT
  (SELECT COUNT(*) FROM homework WHERE course_id = ?) +
  (SELECT COUNT(*) FROM exam WHERE course_id = ?) as totalAssignments

-- 已完成数 = 学生已提交的作业数 + 已提交的考试数
SELECT
  (SELECT COUNT(*) FROM homework_submission WHERE user_id = ? AND homework_id IN (SELECT id FROM homework WHERE course_id = ?)) +
  (SELECT COUNT(*) FROM exam_submission WHERE user_id = ? AND exam_id IN (SELECT id FROM exam WHERE course_id = ?)) as completedAssignments

-- 平均分、最高分
SELECT
  ROUND(AVG(score), 1) as averageScore,
  MAX(score) as highestScore
FROM (
  SELECT score FROM homework_submission WHERE user_id = ? AND status = 'graded' AND homework_id IN (...)
  UNION ALL
  SELECT score FROM exam_submission WHERE user_id = ? AND exam_id IN (...)
) as all_scores

```text
---

### 接口 2：获取课程成绩详情列表

**用途**：用于展示"成绩详情"列表和"学习成绩趋势"折线图

- **接口路径**：`GET /edu/frontend/v1/course/grades/list`- **请求参数**：

| 参数名   | 类型   | 必填 | 说明   |
| -------- | ------ | ---- | ------ |
| courseId | number | 是   | 课程ID |

- **响应参数**：

```json
{
  "code": 200,
  "msg": "成功",
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

```text
| 字段       | 类型   | 说明                                            |
| ---------- | ------ | ----------------------------------------------- |
| name       | string | 作业/考试/实验名称                              |
| type       | string | 类型：`作业`/`考试`/`实验`                  |
| score      | number | 得分                                            |
| submitTime | string | 提交时间（`YYYY-MM-DD HH:mm:ss`）               |
| gradedTime | string | 批改时间（`YYYY-MM-DD HH:mm:ss`），未批改可为空 |
| comment    | string | 教师评语，无评语可为空字符串                    |

**数据来源**：

- 作业成绩：`homework`+`homework_submission` 表
- 考试成绩：`exam`+`exam_submission` 表

**排序规则**：按提交时间正序排列（用于趋势图）

---

### 接口 3：获取成绩班级对比数据

**用途**：用于展示"班级成绩对比"柱状图

- **接口路径**：`GET /edu/frontend/v1/course/grades/class-comparison`- **请求参数**：

| 参数名   | 类型   | 必填 | 说明   |
| -------- | ------ | ---- | ------ |
| courseId | number | 是   | 课程ID |

- **响应参数**：

```json
{
  "code": 200,
  "msg": "成功",
  "data": {
    "categories": [
      "第一章作业",
      "环境搭建实验",
      "第二章作业",
      "单元测验",
      "期中考试"
    ],
    "personalScores": [85, 95, 92, 78, 82],
    "classAverages": [80, 88, 85, 75, 78]
  }
}

```text
| 字段           | 类型     | 说明                                                  |
| -------------- | -------- | ----------------------------------------------------- |
| categories     | string[] | 作业/考试名称列表（X轴）                              |
| personalScores | number[] | 学生个人得分列表（与 categories 一一对应）            |
| classAverages  | number[] | 班级平均分列表（与 categories 一一对应，保留1位小数） |

**计算逻辑**：

```sql
-- 获取班级平均分（以某个作业为例）
SELECT ROUND(AVG(score), 1) as classAverage
FROM homework_submission
WHERE homework_id = ? AND status = 'graded'

-- 需要遍历该课程所有作业/考试，分别计算：
-- 1. 当前学生的得分
-- 2. 全班的平均分

```**班级范围确定**：

- 方案 A：同一课程的所有学生作为"班级"
- 方案 B：根据学生所属班级表关联（推荐，如果有班级表）

---

## 📁 前端已完成工作

| 项目                | 文件位置                                           | 状态      |
| ------------------- | -------------------------------------------------- | --------- |
| API 接口函数定义    |`src/api/frontend/course.ts`| ✅ 已完成 |
| TypeScript 类型定义 |`src/api/frontend/course.ts`| ✅ 已完成 |
| 页面组件调用        |`src/views/account/course-detail/CourseGrades.vue`| ✅ 已完成 |
| Mock 数据           |`mock/frontend.ts`| ✅ 已完成 |
| 前端接口文档        |`doc/frontend/course.md`                           | ✅ 已完成 |

---

## 🔗 相关数据表（参考）

| 表名                | 用途                                |
| ------------------- | ----------------------------------- |
| homework            | 作业定义表                          |
| homework_submission | 作业提交记录表                      |
| exam                | 考试定义表                          |
| exam_submission     | 考试提交记录表                      |
| user                | 用户表（获取当前学生）              |
| course              | 课程表                              |
| user_course         | 用户-课程关联表（用于确定班级范围） |

---

## ⚠️ 注意事项

1. **鉴权**：所有接口需要通过 Token 识别当前登录学生，只返回该学生自己的成绩数据
2. **空数据处理**：
   - 如果学生没有任何提交记录，`averageScore`可返回`0`或`null`-`list`为空时返回空数组`[]`
3. **性能优化**：班级对比接口可能涉及较多聚合计算，建议考虑缓存或异步计算
4. **数据一致性**：接口 1 和接口 2 的数据应保持一致（如总数、完成数）

---

## 🧪 测试用例

### 场景 1：正常数据

- 学生已完成部分作业和考试
- 预期：返回正确的统计数据和详情列表

### 场景 2：新学生（无提交记录）

- 学生刚加入课程，没有任何提交
- 预期：`totalAssignments` > 0，`completedAssignments` = 0，`list` = []

### 场景 3：全部完成

- 学生完成了所有作业和考试
- 预期：`completionRate` = 100.0

### 场景 4：课程无作业/考试

- 课程尚未布置任何作业或考试
- 预期：`totalAssignments` = 0，其他字段为 0 或空

---

## 📝 验收标准

- [ ] 接口 1 返回正确的统计数据
- [ ] 接口 2 返回正确的成绩详情列表
- [ ] 接口 3 返回正确的班级对比数据
- [ ] 所有接口正确处理无数据情况
- [ ] 所有接口支持 Token 鉴权
- [ ] 前端成绩页面正确显示所有数据

---

## 📌 相关链接

- 前端接口文档：`doc/frontend/course.md` (第 6、7、8 节)
- Mock 数据参考：`mock/frontend.ts` (第 529-690 行)
- 前端组件：`src/views/account/course-detail/CourseGrades.vue`
````
