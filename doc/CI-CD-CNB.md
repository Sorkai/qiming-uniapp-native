# GitHub 到 CNB 再到 EdgeOne Pages

当前仓库的小程序 H5 自动发布链路分成两段：

1. GitHub Actions 负责把指定分支镜像到 CNB。
2. CNB 负责安装依赖、执行 `pnpm --ignore-workspace edgeone:build`，再调用 EdgeOne CLI 部署。

## 对应文件

- GitHub 同步工作流：`.github/workflows/sync-to-cnb.yml`
- CNB 流水线：`.cnb.yml`
- EdgeOne 构建脚本：`scripts/build-edgeone-wechat-h5.mjs`
- 备用直连 EdgeOne 配置：`edgeone.json`

## 触发策略

- GitHub `push` 到 `main` 或 `wechat-miniprogram` 时，自动同步同名分支到 CNB。
- GitHub `workflow_dispatch` 可手动重放 `main` 或 `wechat-miniprogram`。
- CNB 只在 `wechat-miniprogram` 分支收到更新时执行部署流水线。

## GitHub 侧配置

- 必需 secret：`CNB_TOKEN`
  说明：CNB 的 HTTPS Token，供 `tencentcom/git-sync` 推送镜像仓库。
- 可选 variable：`CNB_REPO_URL`
  默认值：`https://cnb.cool/sorkai/qiming-uniapp-native`
  说明：如果 CNB 仓库地址不是默认命名，再在 GitHub 仓库变量里覆盖。

## CNB 侧配置

- 镜像仓库：`https://cnb.cool/sorkai/qiming-uniapp-native`
- 流水线分支：`wechat-miniprogram`
- Docker 运行时：`node:22`
- 安装命令：`pnpm --ignore-workspace edgeone:install`
- 构建命令：`pnpm --ignore-workspace edgeone:build`
- 输出目录：`dist`

当前 `.cnb.yml` 默认会导入：

```text
https://cnb.cool/sorkai/qiming-uniapp-native-secrets/-/blob/main/envs.yml
```

该 secret 仓库或 CNB 项目环境里至少需要提供：

- `EDGEONE_API_TOKEN`
- `EDGEONE_PAGES_NAME`
- `EDGEONE_DEPLOY_ENV` 可选，默认 `production`

如果你不打算用 secret 仓库，也可以直接在 CNB 项目环境变量里配置这些值。

## 为什么不用 `edgeone.json` 直接发

`edgeone.json` 仍然保留，方便手工把仓库直接接到 EdgeOne Pages 时复用同一套安装/构建命令。
但当前自动化主链路以 GitHub Actions + CNB `.cnb.yml` 为准，不依赖 EdgeOne 自己拉 GitHub 仓库构建。
之所以显式带 `--ignore-workspace`，是因为当前仓库根目录的 `pnpm-workspace.yaml` 只承载 pnpm 配置，
不包含 workspace `packages` 列表；直接运行 `pnpm install` / `pnpm exec` 会被 pnpm 当成错误 workspace。

## 发布后验收

优先检查：

```text
https://aiedu-mp.intelledu.cn/version.json
```

正确结果应至少包含：

```json
{
  "mode": "wechat-h5-source-build",
  "source": "Sorkai/qiming-uniapp-native/wechat-miniprogram"
}
```

如果仍然看到旧的 `wechat-h5-static-mirror`，说明线上跑的不是当前源码构建。

## 常见问题

- GitHub workflow 在 `Push branch to CNB` 失败：
  先检查 GitHub 仓库是否已配置 `CNB_TOKEN`，以及 `CNB_REPO_URL` 是否指向正确 CNB 仓库。
- CNB 流水线在导入阶段失败：
  说明 `qiming-uniapp-native-secrets` 不存在，或者 `envs.yml` 路径不对。
- CNB 部署阶段失败：
  先检查 `EDGEONE_API_TOKEN` 和 `EDGEONE_PAGES_NAME` 是否已经在 CNB 侧可见。
- 部署成功但小程序仍然白屏或旧 UI：
  先核对 `version.json` 的 `source`，确认不是旧镜像、旧分支或错误环境。

## 参考

- [CNB 流水线文档](https://docs.cnb.cool/zh/build/intro.html)
- [从 GitHub Actions 迁移到 CNB](https://docs.cnb.cool/zh/build/migrate-to-cnb/migrate-from-github-actions.html)
