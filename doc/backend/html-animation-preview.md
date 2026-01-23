# 需求：HTML 动画“快照封面”与“动态悬停预览”功能增强

## 1. 核心目标

提升学生端 HTML 动画内容的直观性，解决目前封面固定、死板的问题。实现“所见即所得”的静态封面，以及“滑过即预览”的动态交互。

---

## 2. 功能详述

### A. 静态快照封面 (Static Snapshot)

* **现状**：目前封面使用 Unsplash 随机图，与章节内容无关。
* **优化**：封面应为该 HTML 动画运行时的真实截图。
* **后端实现**：
    * **自动生产**：在 HTML 动画生成的 Worker 任务完成后，自动通过 Headless Browser (Puppeteer/Playwright) 打开该页面。
    * **截屏采样**：建议在页面 `load` 后 2-3 秒进行截屏（避开初始加载空白）。
    * **接口存储**：存储截图至 OSS/OBS 并在 `display` 接口的 `previewUrl` 字段返回。
* **前端展示**：直接展示 `previewUrl`。

### B. 动态悬停预览 (Hover Preview)

* **现状**：用户必须点击进入弹窗才能看到动画。
* **优化**：鼠标悬停在卡片上 0.5s 后，自动切换为动态画面（视频或缩小的 iframe）。
* **技术方案（二选一）**：
    1. **视频方案（推荐）**：后端在截图的同时，录制 3s 的短视频，存入 `previewVideoUrl`。前端使用 `<video>` 播放。此方案性能最好。
    2. **Iframe 方案**：前端直接在悬浮时通过 `<iframe>` 加载原始 `url`。此方案后端零成本，但由于 iframe 较重，大量卡片同时悬停可能导致浏览器卡顿。

### C. 预览管理工具 (Admin Tools)

* **背景**：自动截图有时会截到白屏或动画未开始的状态。
* **优化**：在前端预览页面增加“设为封面”按钮。
* **链路**：
    1. 管理员/教师在预览动画。
    2. 当动画运行到理想状态，点击“采集快照”。
    3. 前端通过 `postMessage` 或 `Canvas` 截取当前 `iframe` 画面。
    4. 通过接口回传给后端，更新该章节的 `previewUrl`。

---

## 3. 后端接口变更建议

### 3.1 修改现有接口：`GET /edu/frontend/v1/html-animation/display`

在返回中增加两个字段：

```json
{
  "code": 200,
  "data": {
    "chapterId": 101,
    "url": "https://storage.com/anim_v1.html",
    "previewUrl": "https://storage.com/snapshot_101.png",      // 真实截图 URL
    "previewVideoUrl": "https://storage.com/preview_101.mp4"  // (方案 B 增加) 3s 预览视频
  }
}
```

### 3.2 新增接口：`PATCH /edu/backend/v1/html-animation/update-cover`

用于手动修正封面。

* **方法**：PATCH / POST
* **参数**：

    ```json
    {
      "courseId": 1,
      "chapterId": 101,
      "customCover": "Base64_String_or_File_Stream"
    }
    ```

---

## 4. 前端进度指引

1. **API定义**：已在 `src/api/htmlAnimation.ts` 中完成字段适配。
2. **组件改造**：`HtmlAnimations.vue` 已预留 `video` 标签及 `hover` 监听逻辑。
3. **UI效果**：
    * 默认状态：展示静态快照图。
    * 悬停状态：平滑缩放、通过 CSS cross-fade 渐显视频。
    * 管理状态：点击弹窗内的“设为封面”触发手动更新逻辑。
