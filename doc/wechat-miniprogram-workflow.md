# IntellEdu 微信小程序工作流

本仓库继续用 uni-app 作为微信小程序源码与构建入口。微信开发者工具不是替代 uni-app，
而是承接 mp-weixin 产物的模拟器调试、预览二维码、上传和自动化测试。

## 当前分支边界

- 分支从 `main` 拉出：`codex/wechat-miniprogram`。
- Android/iOS 仍走既有 `native-app` App-Plus 与 `ios-native` 线路。
- 微信端改动优先放在 `MP-WEIXIN` 条件编译分支、`mini:*` 脚本和小程序文档里。
- 共享业务层只在确认为三端共同问题时修改。

## 本地命令

```bash
pnpm --dir native-app install --frozen-lockfile
pnpm mini:doctor
pnpm mini:build
pnpm mini:smoke
pnpm mini:h5-smoke -- --dev-server http://localhost:8851
pnpm mini:preflight -- --dev-server https://your-h5-domain.example --role teacher --entry /welcome/index
```

`mini:build` 会执行 `native-app` 的 `uni build -p mp-weixin`，并给
`native-app/dist/build/mp-weixin/project.config.json` 写入学生端、教师端、管理端
的启动路径矩阵。

`mini:h5-smoke` 用本机 Chrome/Edge 通过 DevTools Protocol 跑 390x844 手机视口，
为路径矩阵生成截图和 `summary.json`：

```bash
pnpm mini:h5-smoke -- --dev-server http://localhost:8851
```

可选参数：

- `--browser /path/to/Chrome`：指定 Chromium 浏览器。
- `--out-dir artifacts/wechat-miniprogram/my-run`：指定截图输出目录。
- `--wait-ms 5000`：延长每条路径等待时间。
- `--headed`：打开可见浏览器窗口，方便人工旁看。

该命令验证的是微信 `<web-view>` 里承载的 H5 页面移动形态；真实小程序模拟器/真机预览仍需
真实 AppID 与业务域名配置。

## H5 配置来源

桌面副本 `/Users/fengrran/Desktop/vue-pure-admin-max/.env.production` 里可复用的公开构建参数是：

- `VITE_API_URL = https://aiedu-api.intelledu.cn`
- `VITE_ROUTER_HISTORY = "hash"`
- `VITE_PUBLIC_PATH = /`
- `VITE_CDN = false`
- `VITE_COMPRESSION = "none"`

该文件还包含 Docmee API Key，不能原样搬进 Git。本仓库提供了安全模板
`.env.wechat-h5.example`，只保留微信 web-view H5 部署需要的公开配置；真正部署时本机复制为
`.env.wechat-h5` 并按目标环境填入私密参数。

## 微信开发者工具

官方微信开发者工具提供 CLI，可用于打开项目、生成预览二维码、上传代码和开启自动化。
首次使用 CLI 前，需要在微信开发者工具的“设置 -> 安全设置”里开启服务端口。

默认脚本会按常见 macOS 路径查找 CLI：

- `/Applications/wechatwebdevtools.app/Contents/MacOS/cli`
- `/Applications/WeChatWebDevTools.app/Contents/MacOS/cli`
- `/Applications/微信开发者工具.app/Contents/MacOS/cli`

本机已验证路径：

- `/Applications/wechatwebdevtools.app/Contents/MacOS/cli`

若安装在其它位置：

```bash
export WECHAT_DEVTOOLS_CLI="/path/to/WeChat DevTools.app/Contents/MacOS/cli"
```

打开模拟器：

```bash
pnpm mini:open -- --pure-simulator --dev-server http://localhost:8851 --role teacher --entry /welcome/index
```

`--role` 支持 `student`、`teacher`、`admin`；`--entry` 对应 H5 内部路由。
裸跑 `mini:open` 时，脚本会保留上一次生成配置里的 `devServer`、角色和入口，避免模拟器
突然回到没有 web-view 的兜底状态页。

开启微信开发者工具自动化、生成预览二维码、上传体验版都需要真实微信小程序 AppID：

```bash
export WECHAT_MINIPROGRAM_APPID="wx..."
pnpm mini:auto
```

生成预览二维码：

```bash
pnpm mini:preflight -- --dev-server https://your-h5-domain.example --role teacher --entry /welcome/index
pnpm mini:preview -- --dev-server https://your-h5-domain.example --role teacher --entry /welcome/index
```

上传版本：

```bash
pnpm mini:upload -- --dev-server https://your-h5-domain.example --version 0.1.0 --desc "IntellEdu WeChat mini program smoke build"
```

## AppID 与业务域名

本地没有真实微信小程序 AppID 时，构建产物会保留空 AppID，方便导入微信开发者工具模拟器，
并避免登录后触发 `tourist appid` 的 AppID 切换错误。拿到真实 AppID 后：

```bash
export WECHAT_MINIPROGRAM_APPID="wx..."
pnpm mini:build
```

小程序 `<web-view>` 承载网页时，真机环境要求网页域名已经在小程序管理后台配置为
业务域名；个人类型小程序也不支持 `web-view`。`devServer` 指向的是前端 H5 页面地址，
不是后端 API 地址：`https://aiedu-api.intelledu.cn` 只能用于业务请求，不能作为
`web-view` 页面入口。因此本仓库当前微信线采用两段验证：

1. 编译期与 DevTools 阶段：用 `devServer` 打开现有 H5 业务页，逐个走学生端、教师端、
   管理端路径矩阵。
2. H5 自动化阶段：用 `pnpm mini:h5-smoke -- --dev-server http://localhost:8851`
   生成 390x844 手机视口截图和加载摘要。
3. 真机/发布阶段：确认真实 AppID 与业务域名后，再生成预览二维码和上传体验版。

配置 H5 调试域名：

```bash
export QIMING_MINIPROGRAM_WEBVIEW_ORIGIN="http://localhost:8851"
pnpm mini:build -- --role teacher --entry /welcome/index
pnpm mini:open -- --pure-simulator
```

`mini:build` 会把 `devServer` 写入启动条件，便于在微信开发者工具里逐个切换路径。
也可以不用环境变量，直接传：

```bash
pnpm mini:build -- --dev-server http://localhost:8851 --role student --entry /account?menu=course
pnpm mini:open -- --pure-simulator
```

`mini:preview` 和 `mini:upload` 会重新构建当前启动入口，并要求 `--dev-server` 是手机可访问的
HTTPS H5 地址；如果传入 `http://localhost:8851`，脚本会拒绝生成二维码，避免手机扫码后只看到
小程序兜底页。确实只想做 DevTools 侧调试时，可以加 `--allow-localhost-preview`，但该二维码不适合
真机扫码验收。

`mini:preview`、`mini:auto`、`mini:upload` 会拒绝空 AppID，防止误把游客态当成可发布版本。

## 路径矩阵

当前 smoke 覆盖这些微信启动条件：

- `student-home`: `/account?menu=home`
- `student-courses`: `/account?menu=course`
- `student-exams`: `/account?menu=exam-center`
- `student-ai-app`: `/account/ai-app?mode=student`
- `teacher-dashboard`: `/welcome/index`
- `teacher-courses`: `/course/list`
- `teacher-ai-app`: `/ai-app/workspace`
- `admin-dashboard`: `/welcome/index`
- `admin-users`: `/user/list`

后续页面适配遵守既有研发准则：先看现有 Android/iOS 已验证体验和 web 端响应式设计；
只有小程序环境出现布局或能力矛盾时，才做小范围端专属适配。

## 官方依据

- [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/devtools.html)
  负责小程序代码模拟器、调试、预览、上传和自动化能力。
- [命令行调用](https://developers.weixin.qq.com/miniprogram/dev/devtools/cli.html)
  支持 `open --project`、`preview --project`、`upload --project` 和 `auto --project`。
- [web-view 组件](https://developers.weixin.qq.com/miniprogram/dev/component/web-view.html)
  用于承载网页，并要求非公众号文章网页配置业务域名。
