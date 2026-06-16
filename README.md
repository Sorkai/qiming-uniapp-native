# Hi👋 hello the next generation juiced up native Android / iOS app in the edu area presented by ycxj Jilin

## ccut 108 全新 启明智教 (Qimingedu) - Android / iOS 原生客户端

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

**启明智教** 是一款由 AI 驱动的智能化教育与课堂监控平台 Android / iOS 原生客户端。本项目致力于通过先进的人工智能技术优化教学流程，为师生提供高效、个性化的教育互动体验。客户端采用 UniApp 框架与双原生容器线并行开发，分别优化 Android 与 iOS 的原生渲染、打包和真机验证体验，保障复杂的交互与数据流依然丝滑流畅。

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

## Android / iOS 双线工程设计

本仓库不是 Android 工程旁边临时补一个 iOS 工程，而是一个共享业务层、
双原生容器线并行维护的移动端仓库。Android 与 iOS 可以在同一仓库内各自
演进、各自验证、各自打包，同时复用同一套业务页面、接口和设计语言。

- **共享业务层:** 仓库根目录的 Vue/Vite/UniApp 业务源码、公共组件、接口、
  主题和路由是三端角色（学生端、教师端、管理端）共同依赖的产品层。
- **Android 原生线:** `native-app/` 承载 HBuilderX/App-Plus Android 容器、
  Android 打包配置、Android 设备调试和 Android 专属原生能力。
- **iOS 原生线:** `ios-native/` 承载 Xcode/UIKit/WKWebView iOS Simulator
  验证壳；iOS 打包与 HBuilderX iOS 能力在 `native-app/` 的 iOS 配置中衔接。
  若当前分支尚未包含 `ios-native/`，请切到或合并 iOS 工具分支
  `codex/ios-native-tooling`。
- **微信小程序线:** `native-app/` 继续作为 uni-app 小程序源码入口，通过
  `build:mp-weixin` 生成 `dist/build/mp-weixin`，微信开发者工具负责模拟器、
  预览、上传和自动化验证。详见 `doc/wechat-miniprogram-workflow.md`。
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

## 技术栈与依赖

- **前端框架:** UniApp (Vue 3 语法 / 组合式 API)
- **构建与编译:** Vite / HBuilderX / Xcode command line tools
- **网络通信:** 封装 `uni.request`，支持 RESTful API 与长链接 WebSocket 交互
- **核心关联后端:** 业务逻辑层 Go-Zero；模型服务层 Python FastAPI
- **前端技术:** Element Plus, Tailwind CSS, Sass, Three.js, ECharts, LogicFlow/Vue-Flow, WangEditor/Vditor 等

## 快速开始

### 1. 环境准备

- 安装 [Node.js](https://nodejs.org/)（推荐使用仓库 `.nvmrc` 中的版本）
- 安装 [HBuilderX](https://www.dcloud.io/hbuilderx.html) 开发者工具
- 微信小程序开发需安装微信开发者工具，并在“设置 -> 安全设置”中开启服务端口
- 准备 Android Studio 模拟器或真实 Android 物理测试设备（需开启“开发者模式”和“USB 调试”）
- iOS 开发需在 macOS 上安装 Xcode；Simulator 包可使用 Xcode 命令行工具验证，真机/TestFlight 还需要 Apple Distribution 证书和 `cn.intelledu.qiming` provisioning profile

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
pnpm mini:open -- --pure-simulator --dev-server http://localhost:8851 --role teacher --entry /welcome/index
```

微信端从 `main` 单独拉分支推进，继续复用 `native-app/` 的 uni-app 工程。
`mini:build` 会生成 `native-app/dist/build/mp-weixin` 并写入三端启动路径矩阵；
`mini:open` 通过微信开发者工具 CLI 打开模拟器。调试 web-view 时传入
`--dev-server`、`--role` 和 `--entry`；未传时脚本会沿用上一次生成配置里的启动条件。
`mini:h5-smoke` 会用本机 Chrome/Edge 以 390x844 手机视口为学生端、教师端、管理端路径矩阵
生成截图和 `summary.json` 到 `artifacts/wechat-miniprogram/`，用于微信 web-view 正式 AppID
可用前的自动化界面加载验收。
没有真实 AppID 时会使用空 AppID 导入模拟器，避免触发 `tourist appid` 切换错误；
自动化、真机预览和上传需要配置 `WECHAT_MINIPROGRAM_APPID`，并在微信管理后台配置业务域名。完整流程见
`doc/wechat-miniprogram-workflow.md`。
注意：扫码预览/上传面向手机环境，`--dev-server` 必须是手机可访问且已配置为微信 `web-view`
业务域名的 HTTPS 前端 H5 地址；`http://localhost:8851` 只适合微信开发者工具模拟器和本机截图验证。
`https://aiedu-api.intelledu.cn` 是后端 API 地址，不能作为 `web-view` 页面入口。

## 当前 iOS 验收状态

- iOS Simulator 版已完成学生端、教师端、管理端三端 smoke 验收：`36 OK / 0 FAIL`。
- 最新已验证 Simulator 包 tag: `v1.0.1-ios-simulator.101+tooling.1`。
- 最新已验证 Simulator 包: `QimingIntellEdu-iOS-simulator-v1.0.1-101-56444d6.zip`。
- 真机/TestFlight 仍依赖 Apple Distribution 证书与 `cn.intelledu.qiming` provisioning profile。
