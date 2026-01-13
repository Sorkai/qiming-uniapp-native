# 前端赛事场接口文档

## 📋 模块结构

赛事管理模块已重构为以下页面结构：

| 路由路径 | 页面名称 | 说明 |
|---------|---------|------|
| `/competition/overview` | 大屏概览 | 赛事模块总览，展示四大模块统计数据、近期赛事、积分排行榜 |
| `/competition/oj` | 编程竞赛(OJ) | OJ题目管理，在线编程判题系统 |
| `/competition/question-bank` | 知识竞赛题库 | 知识竞赛题库管理，支持多种题型 |
| `/competition/essay` | 作文比赛 | AI辅助作文批改系统 |
| `/competition/event-manage` | 综合赛事管理 | 综合赛事CRUD、报名管理、排行榜 |

---

基础前缀：`/edu/frontend/v1`

## 1. 获取赛事场统计与排名

- **接口地址**：`/competition/stats`
- **请求方式**：GET
- **请求参数**：无
- **响应参数**：

```json
{
  "code": 200,
  "msg": "成功",
  "data": {
    "userRank": 128,      // 当前排名
    "userPoints": 2580,    // 积分
    "ojStats": {
      "total": 500,       // 总题目
      "solved": 45        // 已解决
    },
    "trainingStats": {
      "categories": 12,  // 分类数
      "questions": 3000   // 题目总数
    },
    "securityStats": {
      "participants": 1580 // 参与人数
    }
  }
}
```

## 2. 获取热门赛事列表

- **接口地址**：`/competition/events`
- **请求方式**：GET
- **请求参数**：无
- **响应参数**：

```json
{
  "code": 200,
  "msg": "成功",
  "data": {
    "list": [
      {
        "id": 1,
        "title": "2024 春季算法挑战赛",
        "description": "参与编程挑战，赢取丰厚奖品",
        "time": "2024-03-15 14:00",
        "participants": 256,
        "status": "upcoming" // upcoming | ongoing | ended
      }
    ]
  }
}
```

## 3. 获取积分排行榜

- **接口地址**：`/competition/leaderboard`
- **请求方式**：GET
- **请求参数**：
  - `type`: string (weekly | monthly | total)
- **响应参数**：

```json
{
  "code": 200,
  "msg": "成功",
  "data": {
    "list": [
      {
        "id": 1,
        "username": "算法大神",
        "avatar": "string",
        "solved": 320,
        "points": 9800
      }
    ]
  }
}
```

## 4. 获取 OJ 题目列表

- **接口地址**：`/competition/oj/list`
- **请求方式**：GET
- **请求参数**：
  - `difficulty`: string (可选, easy | medium | hard)
  - `category`: string (可选)
  - `keyword`: string (可选)
  - `pageNum`: number (默认1)
  - `pageSize`: number (默认10)
- **响应参数**：

```json
{
  "code": 200,
  "msg": "成功",
  "data": {
    "total": 100,
    "list": [
      {
        "id": 1,
        "title": "两数之和",
        "difficulty": "easy",
        "acceptance": "45.2%",
        "status": "solved" // solved | attempted | ""
      }
    ]
  }
}
```

## 5. 获取训练分类

- **接口地址**：`/competition/training/categories`
- **请求方式**：GET
- **请求参数**：无
- **响应参数**：

```json
{
  "code": 200,
  "msg": "成功",
  "data": {
    "list": [
      {
        "id": 1,
        "name": "数据结构",
        "icon": "📊",
        "count": 150,
        "progress": 35
      }
    ]
  }
}
```

## 6. 获取国家安全竞赛题目

- **接口地址**：`/competition/security/quiz`
- **请求方式**：GET
- **请求参数**：无
- **响应参数**：

```json
{
  "code": 200,
  "msg": "成功",
  "data": {
    "questions": [
      {
        "question": "《中华人民共和国国家安全法》是哪一年颁布实施的？",
        "options": ["2014年", "2015年", "2016年", "2017年"],
        "answer": 1
      }
    ]
  }
}
```
