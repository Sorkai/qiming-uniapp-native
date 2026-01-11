# 前端 HTML 动画接口

基础前缀：`/edu/frontend/v1`

## 1. 获取展示版本

- **接口地址**：`/html-animation/display`
- **请求方式**：GET
- **请求参数**：
  - `courseId`: number (课程ID)
  - `chapterId`: number (章节ID)

- **响应参数**：
```json
{
  "code": 200,
  "msg": "成功",
  "data": {
    "courseId": 1,
    "chapterId": 1,
    "version": "1",
    "url": "https://example.com/animations/course_1_chapter_1.html"
  }
}
```
