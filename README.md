# Hi👋 hello the next generation juiced up Android / iOS / WeChat mini program in the edu area presented by ycxj Jilin

## ccut 108 全新 启明智教 (Qimingedu) - Android / iOS 原生客户端与微信小程序

### Checkout from the pics first Stu Teacher and Admin

## License / Usage Restriction

This repository is public for collaboration, review, and build verification only.
All product names, source code, UI designs, teaching materials, digital-human assets,
build scripts, certificates, generated APKs, and related resources remain proprietary
to the project owner unless a separate written license is granted.

Without prior written permission from the project owner, no individual or organization
may copy, reuse, redistribute, sublicense, commercialize, publish a derivative product
from, deploy, re-sign, or store-distribute this project or any substantial part of it.

The public visibility of this repository does not grant an open-source license.

Android/iOS signing certificates, generated beta APKs, simulator packages, IPA packages,
and installation packages are provided only for authorized testing. They must not be
reused, re-signed, redistributed, or deployed to any store, device fleet, school,
organization, or commercial environment without the project owner's prior written consent.

本仓库公开仅用于协作、评审与构建验证。项目名称、源代码、UI 设计、教学资料、数字人资产、
构建脚本、签名证书、安装包及相关资源，除非另行取得项目所有者书面授权，否则均保留全部权利。

未经项目所有者事先书面同意，任何个人或组织不得复制、复用、二次分发、转授权、商业化、
发布衍生产品、部署、重签名或上架本项目及其任何实质性部分。本仓库公开可见不代表授予开源许可。

<p align="center">
<img width="400" height="833" alt="image" src="https://github.com/user-attachments/assets/1e7b4d23-2014-42de-b5da-1b194b4cf4c8" />
<img width="397" height="829" alt="image" src="https://github.com/user-attachments/assets/c85d7aab-e49d-494c-8164-2b88d071fe74" />
<img width="392" height="804" alt="image" src="https://github.com/user-attachments/assets/9878a4fd-1d0d-42e0-8f81-4e1c7493d36c" />
<img width="394" height="828" alt="image" src="https://github.com/user-attachments/assets/4b27c936-a290-4e26-8a25-cee2c16d861a" />
</p>

<p align="center">
<img width="396" height="830" alt="image" src="https://github.com/user-attachments/assets/18137d8e-bd39-42d1-8d21-2b532c8584f5" />
<img width="403" height="830" alt="image" src="https://github.com/user-attachments/assets/64c7b42d-6a13-4d25-a23a-0aa05e30a8dd" />
<img width="398" height="831" alt="image" src="https://github.com/user-attachments/assets/29ed07d3-17c8-4046-8834-6d84c6dee125" />
<img width="395" height="836" alt="image" src="https://github.com/user-attachments/assets/9fd5810d-91e4-4360-9986-f2a13cbf91c0" />
</p>

<p align="center">
<img width="389" height="817" alt="image" src="https://github.com/user-attachments/assets/1b7edce3-3e92-4076-be37-d1ff6b2d6e9d" />
<img width="401" height="834" alt="image" src="https://github.com/user-attachments/assets/1d3918cc-837d-49ca-a812-5b2a32762ed6" />
</p>

## 项目简介

**启明智教** 是一款由 AI 驱动的智能化教育与课堂监控平台，已覆盖 Android 原生客户端、iOS 原生客户端与微信小程序端。本项目致力于通过先进的人工智能技术优化教学流程，为师生提供高效、个性化的教育互动体验。客户端采用 UniApp 框架与多端容器线并行开发，分别优化 Android、iOS 与微信 `web-view` 小程序的渲染、打包和真机验证体验，保障复杂的交互与数据流依然丝滑流畅。

依托平台强大的微服务后端架构（基于 Go-Zero 与 Python FastAPI），客户端无缝接入了核心的 **EduClaw 智能体**。同时，结合底层的高效 **SAHR (Semantic Adaptive Hybrid Retrieval) 语义自适应混合检索框架**（精确调优的融合权重：稀疏检索 0.7，稠密检索 0.3），客户端能够在海量教学知识库中实现极高精度的检索、问答与辅助决策。

## 核心功能

- **伴学答疑 (EduClaw 智能体):** 深度集成定制化智能体，提供全天候的自适应教学引导与精准解答。
- **高精度知识检索引擎:** 借助 SAHR 混合检索算法，打破传统检索的语义壁垒，极速定位教学资源与文献。
- **课堂状态监控与分析:** 接入 AI 视觉与多维数据分析，实时反馈课堂教学状态，助力教育数字化转型（核心算法及应用已布局多项软著与专利）。
- **原生级流畅体验:** 充分利用 App-Plus、UIKit/WKWebView 与平台隔离样式，分别适配 Android 与 iOS 的设备交互、网络并发、状态栏安全区和离线包加载。

## 其他功能

- **其余教育平台所拥有的基础功能之上，我们融合全新的完整数据链路**
- **教师端、管理员端更高效的 AI 融合备课组件**
- **教师端、管理员端更精准的提效建议与工作效率分析**
- **教师端、管理员端更个性化的个人画像分析**
- **学生端 AI 导学组卷**
- **学生端 AI 当节课程知识问答**
- **学生端 AI 思维导图**
- **融合了多模态资源的 AI 助手回答与生成**
- **响应迅速的截图提问功能**
- **启明智教精调的垂直领域大模型**
- **----还有更多----**

## 分支职责

本仓库的移动端开发线按平台拆分。`main` 只作为三端共用的集成基线，不再把
Android、iOS 或微信小程序的专属改动混在一个临时分支里。

| 分支                 | 对应客户端   | 主要职责                                                                  |
| -------------------- | ------------ | ------------------------------------------------------------------------- |
| `main`               | 三端共用基线 | 同步 Web 业务、公共组件、接口、路由和跨平台修复；不承载单个平台的临时补丁 |
| `android-native`     | Android APK  | HBuilderX / App-Plus Android、三星真机调试、Android 离线包和 APK 验收     |
| `ios-native`         | iOS App      | Xcode / UIKit / WKWebView、Simulator、真机签名、IPA / TestFlight 验收     |
| `wechat-miniprogram` | 微信小程序   | `mp-weixin`、微信开发者工具、`web-view` H5、预览、上传和 EdgeOne 发布     |

两个远端使用完全相同的分支名：

- `origin`: `Sorkai/qiming-uniapp-native`
- `farrran`: `Farrran69311/qiming-uniapp-native`

切换平台开发线：

```bash
git switch android-native
git switch ios-native
git switch wechat-miniprogram
```

共享业务先在 `main` 完成同步和验证，再按需合入三个平台分支。Android、iOS、
微信小程序的专属提交不得反向合入 `main`；需要三端共同生效的修改应先提炼为
平台无关改动，再进入 `main`。

## Android / iOS / 微信小程序多端工程设计

本仓库不是 Android 工程旁边临时补一个 iOS 工程，也不是另起炉灶做小程序，
而是一个共享业务层、多端容器线并行维护的移动端仓库。Android、iOS 与微信小程序
可以在同一仓库内各自演进、各自验证、各自打包，同时复用同一套业务页面、接口和设计语言。

- **共享业务层:** 仓库根目录的 Vue/Vite/UniApp 业务源码、公共组件、接口、
  主题和路由是三端角色（学生端、教师端、管理端）共同依赖的产品层。
- **Android App-Plus 混合线:** `native-app/` 承载 HBuilderX/App-Plus Android 容器、
  Android 打包配置、Android 设备调试和 Android 专属原生能力。
- **iOS 原生线:** `ios-native/` 承载 Xcode/UIKit/WKWebView iOS Simulator
  验证壳；iOS 打包与 HBuilderX iOS 能力在 `native-app/` 的 iOS 配置中衔接。
  iOS 开发、验收和发版统一在 `ios-native` 分支推进。
- **微信小程序线:** `native-app/` 继续作为 uni-app 小程序源码入口，通过
  `build:mp-weixin` 生成 `dist/build/mp-weixin`，微信开发者工具负责模拟器、
  预览、上传和自动化验证；小程序 H5 业务域名为 `https://aiedu-mp.intelledu.cn`。
  详见 `doc/wechat-miniprogram-workflow.md`。
- **端专属边界:** 平台问题优先落在对应原生线、平台 class、平台脚本或平台
  测试中。Android 专属改动不应要求 iOS 迁就，iOS 专属改动也不应隐式改变
  Android 行为，微信小程序专属改动也不应隐式改变 Android/iOS 行为。
- **共享层变更规则:** 只有确实属于共同产品体验、共同业务逻辑或共同设计系统
  的改动才进入共享层；进入共享层的改动需要同时考虑 Android 与 iOS 验收。
- **CSS/运行时隔离:** 平台差异使用明确选择器或运行时标记隔离，例如
  `html.qiming-native-webview.qiming-native-ios` 与
  `html.qiming-native-webview.qiming-native-android`，避免用宽泛的移动端选择器
  解决单平台问题。
- **验证节奏:** 每个小问题单独提交；端专属改动至少跑对应端模拟器/真机或自动化
  截图脚本，共享层改动需要补充双端风险说明和必要的双端验证。

## 三角色业务源与双远端同步

学生端、教师端、管理端的业务源固定为
`Sorkai/vue-pure-admin-max` 的 `agent` 分支。移动仓库保留 Android/App-Plus、
微信小程序、iOS 容器与平台适配，不再手工复制业务页面。

本地移动仓库使用三个 remote：

```bash
git remote add web-upstream ssh://git@ssh.github.com:443/Sorkai/vue-pure-admin-max.git
git remote add farrran git@github.com:Farrran69311/qiming-uniapp-native.git
```

其中 `origin` 指向 `Sorkai/qiming-uniapp-native`，`farrran` 指向
`Farrran69311/qiming-uniapp-native`。日常同步命令：

```bash
pnpm sync:web:check
pnpm sync:web
pnpm sync:web:push
```

`sync:web` 会拉取 `web-upstream/agent`、执行增量合并，并默认验证类型检查、
Android App-Plus H5/容器资源和微信小程序产物。发生冲突、工作树不干净或目标远端
无法快进时会停止，不会强制覆盖。共享业务同步应在 `main` 分支执行并推送到两个
远端：

```bash
git switch main
pnpm sync:web:check
pnpm sync:web:push
```

`main` 验收后，再分别合入 `android-native`、`ios-native` 和
`wechat-miniprogram`。不要用 `--publish-branches` 把同一个平台提交直接覆盖到三条
发布线。

Android 真机运行 HBuilder 调试基座后，可直接从 WebView 读取正文、图表和横向
溢出数据，不需要安装额外浏览器驱动：

```bash
pnpm native:audit:android
node scripts/android-webview-audit.mjs --strict \
  --out artifacts/android/webview-audit.json
node scripts/android-webview-audit.mjs --strict \
  --role teacher --entry /welcome/index --expect-text 教师 \
  --out artifacts/android/teacher-welcome.json
pnpm native:audit:android:all
pnpm native:audit:android:self-test
```

脚本默认审计当前 `hybrid/html/index.html` 页面，并在文档横向溢出、正文可用宽度
低于视口 88% 或可见图表画布为空时失败。可用 `--url-pattern`、`--serial` 和
`--min-content-ratio` 针对多设备或特殊页面调整验收条件。`--role` 会使用真实
三角色账号登录并重新灌入 HBuilder WebView 会话；配合 `--entry`、
`--expect-text` 可以对指定业务路由做真实权限与页面校验。
`native:audit:android:all` 复用微信真实会话审计的同一套路由矩阵，按学生、教师、
管理员顺序在已连接三星真机上逐页检查角色、正文宽度、横向溢出、可见图表和关键
文案，并把每页报告与汇总写入 `artifacts/android/real-device-audit-*`。
`native:audit:android:self-test` 不连接设备，会校验共享路由矩阵、动态课程 ID 替换、
账户菜单场景、三角色云盘接口证据和必需接口业务码解析。
微信端可运行 `pnpm mini:real-audit:self-test` 做同样的离线矩阵与业务码检查。

## 技术栈与依赖

- **前端框架:** UniApp (Vue 3 语法 / 组合式 API)
- **构建与编译:** Vite / HBuilderX / Xcode command line tools
- **网络通信:** 共享 H5 业务层使用 Axios/Fetch/WebSocket，平台容器使用 UniApp API
- **核心关联后端:** 业务逻辑层 Go-Zero；模型服务层 Python FastAPI
- **前端技术:** Element Plus, Tailwind CSS, Sass, Three.js, ECharts, LogicFlow/Vue-Flow, WangEditor/Vditor 等

## 快速开始

### 1. 环境准备

- 安装 [Node.js](https://nodejs.org/)（推荐使用仓库 `.nvmrc` 中的版本）
- 安装 [HBuilderX](https://www.dcloud.io/hbuilderx.html) 开发者工具
- 微信小程序开发需安装微信开发者工具，并在“设置 -> 安全设置”中开启服务端口
- 准备真实 Android 物理测试设备或 Android 模拟器（需开启“开发者模式”和“USB 调试”）；当前仓库不是 Gradle/Kotlin 工程，初期不要求安装完整 Android Studio
- iOS Simulator 与真机构建都必须在 macOS 上安装并选择完整 Xcode；单独的
  Command Line Tools 只能做 Swift 语法等静态检查，不能提供 iPhone SDK 或
  `simctl`。真机/TestFlight 还需要 Apple Distribution 证书和
  `cn.intelledu.qiming` provisioning profile

### 2. 克隆项目代码

```bash
git clone git@github.com:Farrran69311/qiming-uniapp-native.git
cd qiming-uniapp-native
```

### 3. 安装依赖与同步离线包

```bash
pnpm install
pnpm native:prepare
```

### 4. Android 调试与打包

```bash
pnpm native:devices
pnpm native:run:android
pnpm native:build:android
```

Android 容器、HBuilderX/App-Plus 配置和 Android 专属原生能力集中在 `native-app/`。

### 5. iOS Simulator 调试、验收与发版包

```bash
pnpm native:run:ios -- --device-id <SIMULATOR_UDID> --demo-role teacher --entry /welcome/index
pnpm native:ios:smoke -- --device-id <SIMULATOR_UDID> --roles student,teacher,admin
pnpm native:ios:package -- --output-dir artifacts/ios-release
```

iOS Simulator 原生壳集中在 `ios-native/`，用于在 Apple Silicon iOS Simulator 上加载同一套 UniApp/H5 离线业务包并验证学生端、教师端、管理端页面。Simulator zip 只能安装到 iOS Simulator，不能上传 TestFlight。

### 6. iOS 真机 / TestFlight 打包

```bash
pnpm native:ios:ipa profiles
pnpm native:ios:ipa -- --output-dir artifacts/ios-release
```

真机 IPA 需要本机 Keychain 中存在 Apple Distribution 签名身份，并安装匹配 `cn.intelledu.qiming` 的 App Store 或 Ad Hoc provisioning profile。也可以显式指定 profile：

```bash
pnpm native:ios:ipa -- --profile /path/to/AppStore_cn.intelledu.qiming.mobileprovision --output-dir artifacts/ios-release
```

### 7. 微信小程序构建与 DevTools

```bash
pnpm mini:doctor
pnpm mini:build
pnpm mini:smoke
pnpm mini:h5-smoke -- --dev-server http://localhost:8851
pnpm build:wechat-h5
pnpm mini:preflight -- --dev-server https://aiedu-mp.intelledu.cn --role teacher --entry /welcome/index
pnpm mini:open -- --pure-simulator --dev-server http://localhost:8851 --role teacher --entry /welcome/index
WECHAT_MINIPROGRAM_APPID=wx5a9db47d4dcce103 pnpm mini:upload -- --dev-server https://aiedu-mp.intelledu.cn --entry /home --version <version> --desc "<release note>"
```

微信端固定在 `wechat-miniprogram` 分支推进，继续复用 `native-app/` 的 uni-app 工程。
`mini:build` 会生成 `native-app/dist/build/mp-weixin` 并写入三端启动路径矩阵；
`mini:open` 通过微信开发者工具 CLI 打开模拟器。调试 web-view 时传入
`--dev-server`、`--role` 和 `--entry`；未传时脚本会沿用上一次生成配置里的启动条件。
正式体验版默认入口使用 `/home`，进入启明智教首页后通过业务登录弹窗进入三端系统，避免落到 vue-pure-admin 模板登录页。
`mini:h5-smoke` 会用本机 Chrome/Edge 以 390x844 手机视口为学生端、教师端、管理端路径矩阵
生成截图和 `summary.json` 到 `artifacts/wechat-miniprogram/`，用于微信 web-view 正式 AppID
可用前的自动化界面加载验收。
`mini:preflight` 用于生成真机二维码前的发布检查，会验证真实 AppID、微信开发者工具 CLI、
HTTPS H5 地址可访问性、小程序构建产物和三端启动矩阵。
没有真实 AppID 时会使用空 AppID 导入模拟器，避免触发 `tourist appid` 切换错误；
自动化、真机预览和上传需要配置 `WECHAT_MINIPROGRAM_APPID`，并在微信管理后台配置业务域名。完整流程见
`doc/wechat-miniprogram-workflow.md`。
注意：扫码预览/上传面向手机环境，`--dev-server` 必须是手机可访问且已配置为微信 `web-view`
业务域名的 HTTPS 前端 H5 地址；`http://localhost:8851` 只适合微信开发者工具模拟器和本机截图验证。
当前小程序专用 H5 域名为 `https://aiedu-mp.intelledu.cn`，EdgeOne Pages 构建命令应使用
安装命令 `pnpm --ignore-workspace edgeone:install`、构建命令 `pnpm --ignore-workspace edgeone:build`，输出目录为 `dist`。
当前自动化发布链路为 GitHub Actions 同步 `wechat-miniprogram` 到 CNB，再由 CNB 执行 `.cnb.yml`
完成构建并通过 EdgeOne CLI 发布；详情见 `doc/CI-CD-CNB.md`。
`https://aiedu-api.intelledu.cn` 是后端 API 地址，不能作为 `web-view` 页面入口。
首页页脚备案链接需保持可点击：ICP备案跳转 `https://beian.miit.gov.cn/`，
公网安备跳转 `https://beian.mps.gov.cn/#/query/webSearch?code=22017302000511`，
对应备案图标位于 `public/icons/beian-icp.webp` 与 `public/icons/beian-mps.webp`。

## 当前 iOS 验收状态

- iOS Simulator 版已完成学生端、教师端、管理端三端 smoke 验收：`36 OK / 0 FAIL`。
- 最新已验证 Simulator 包 tag: `v1.0.1-ios-simulator.101+tooling.1`。
- 最新已验证 Simulator 包: `QimingIntellEdu-iOS-simulator-v1.0.1-101-56444d6.zip`。
- 真机/TestFlight 仍依赖 Apple Distribution 证书与 `cn.intelledu.qiming` provisioning profile。
