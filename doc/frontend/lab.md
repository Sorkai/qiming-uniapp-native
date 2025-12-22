# 前端虚拟实验室接口文档

基础前缀：`/edu/frontend/v1`

## 1. 获取实验室统计数据

- **接口地址**：`/lab/stats`
- **请求方式**：GET
- **请求参数**：无
- **响应参数**：

```json
{
  "code": 200,
  "msg": "成功",
  "data": {
    "animations": 12,  // 动画数量
    "games": 8,       // 游戏数量
    "completed": 5   // 已完成数量
  }
}
```

## 2. 获取实验项目列表

- **接口地址**：`/lab/list`
- **请求方式**：GET
- **请求参数**：
  - `category`: string (可选, animation | game | simulation | all)
- **响应参数**：

```json
{
  "code": 200,
  "msg": "成功",
  "data": {
    "list": [
      {
        "id": 1,
        "title": "CSS 粒子动画",
        "description": "学习使用纯 CSS 创建炫酷的粒子效果动画",
        "icon": "✨",
        "category": "animation",
        "difficulty": "medium",
        "duration": "15分钟",
        "gradient": "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        "featured": true,
        "url": "/demos/particle-animation.html"
      }
    ]
  }
}
```
