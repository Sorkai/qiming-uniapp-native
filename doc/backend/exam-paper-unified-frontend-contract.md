# 组卷器与学生试卷中心统一后端契约

## 1. 目的

本契约用于统一以下前端模块的后端接口与数据结构：

- 教师端/管理端题目组卷器（编辑、发布、阅卷）
- 学生端试卷中心（列表、详情、答题、交卷、查分）

目标是保证两端在题型、状态、答卷结构上完全自洽，并可并行开发。

## 2. 统一基线

- 教师端基础路径: /edu/backend/v1
- 学生端基础路径: /edu/frontend/v1
- 通用响应: { code: number, msg: string, data: T }
- code = 0 表示成功

## 3. 题型统一规则（关键）

前端已兼容两种题型表示：

- 数字枚举: 1-14
- 字符串ID: radio/checkbox/judge/input/textarea/textarea-essay/matrix-single/matrix-multiple/matching/ordering/slider/nps-rating/star-rating/composite

建议后端统一输出数字枚举，同时允许兼容字符串输入。

### 3.1 数字与字符串映射

- 1 = radio（单选）
- 2 = checkbox（多选）
- 3 = judge（判断）
- 4 = input（填空）
- 5 = textarea（简答）
- 6 = textarea-essay（论述）
- 7 = matrix-single（矩阵单选）
- 8 = matrix-multiple（矩阵多选）
- 9 = matching（连线）
- 10 = ordering（排序）
- 11 = slider（滑动评分）
- 12 = nps-rating（NPS评分）
- 13 = star-rating（星级评分）
- 14 = composite（组合材料题）

### 3.2 题目结构统一字段

通用字段：

- questionId: number
- questionType: number | string
- stem: string
- points: number

按题型扩展字段：

- 1/2/3: options
- 4: blanks 或可替代答案结构
- 5/6: referenceAnswer
- 7/8: matrixRows + matrixCols
- 9: matchingPairs（或 leftItems/rightItems）
- 10: orderingItems（或 items）
- 11: sliderMin/sliderMax/sliderStep/sliderDefaultValue/sliderLabels
- 12: npsMin/npsMax/npsLabels
- 13: starCount/starLabels
- 14: material + subQuestions

## 4. 教师端到学生端状态统一

教师端试卷状态：

- 0 草稿
- 1 已发布
- 2 考试中
- 3 已结束
- 4 批改中
- 5 已批改
- 6 已发布成绩

学生端列表状态：

- available: 可答题
- retake: 可补考
- submitted: 已提交待批改
- graded: 已批改待发布
- completed: 成绩已发布
- expired: 过期未提交

要求：后端在学生列表接口内完成状态映射，不让前端二次推导。

## 5. 教师端核心接口（已对齐）

- GET /paper/detail/:paperId
- POST /paper/create
- POST /paper/update
- POST /paper/publish
- POST /paper/publish-advanced
- POST /paper/score/release

说明：

- 教师端可返回完整题目信息（含答案/解析）
- 编辑器支持14题型

## 6. 学生端核心接口（统一后）

### 6.1 试卷中心

- GET /paper/list
- GET /paper/detail/:paperId（学生脱敏版）

### 6.2 答题流程

- POST /exam/start（幂等恢复）
- POST /exam/save
- POST /exam/save-batch（建议）
- POST /exam/save-duration
- GET /exam/session/:submissionId（建议）
- POST /exam/submit
- GET /exam/result/:submissionId

### 6.3 在线状态与风控（建议）

- POST /exam/heartbeat
- POST /exam/anti-cheat/event

## 7. 脱敏边界（必须）

学生端详情与答题接口不得返回：

- correctAnswer
- correctAnswers
- referenceAnswer（未允许前）
- analysis（未允许前）

建议在成绩发布后按发布配置决定是否返回答案与解析。

## 8. 前端当前落地情况（供后端联调）

教师端：

- 编辑器已支持14题型建题与展示

学生端：

- 试卷中心列表、详情、答题、结果页已打通
- 学生答题页已支持14题型作答输入
- 学生详情页已改为调用前端学生脱敏详情接口

## 9. 后端开发优先级建议

P0（先打通）：

- /paper/list
- /paper/detail/:paperId（学生版）
- /exam/start
- /exam/save
- /exam/save-duration
- /exam/submit
- /exam/result/:submissionId

P1（稳定性）：

- /exam/session/:submissionId
- /exam/save-batch
- /exam/heartbeat

P2（治理）：

- /exam/anti-cheat/event

## 10. 联调验收清单

- 同一份试卷在教师端可编辑、学生端可作答
- 14题型都可在学生端提交有效答案
- 提交后状态从 available/retake 进入 submitted
- 成绩发布后进入 completed 并可查看结果页
- 学生端接口未泄露标准答案字段
