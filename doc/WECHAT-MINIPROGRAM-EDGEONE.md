# 微信小程序 H5 部署说明

小程序壳固定打开 `pages/index/index`，业务页由 web-view 加载 `https://aiedu-mp.intelledu.cn/#/home`。微信后台的“业务域名”保留 `https://aiedu-mp.intelledu.cn`，不要改成普通前端域名。

## 自动化链路

1. GitHub `wechat-miniprogram` 分支更新后，`.github/workflows/sync-to-cnb.yml` 自动把同名分支同步到 CNB。
2. CNB 仓库收到更新后，读取根目录 `.cnb.yml`。
3. CNB 运行 `pnpm --ignore-workspace edgeone:install` 和 `pnpm --ignore-workspace edgeone:build`，产出微信 H5 `dist/`。
4. CNB 调用 `edgeone pages deploy`，把 `dist/` 发布到目标 EdgeOne Pages 项目。

## 关键配置

| 配置项 | 值 |
| --- | --- |
| GitHub 源仓库 | `https://github.com/Sorkai/qiming-uniapp-native` |
| GitHub 同步工作流 | `.github/workflows/sync-to-cnb.yml` |
| CNB 镜像仓库 | `https://cnb.cool/sorkai/qiming-uniapp-native` |
| CNB 构建分支 | `wechat-miniprogram` |
| CNB 流水线文件 | `.cnb.yml` |
| 安装命令 | `pnpm --ignore-workspace edgeone:install` |
| 构建命令 | `pnpm --ignore-workspace edgeone:build` |
| 输出目录 | `dist` |
| Node.js | `22.x` |

CNB 侧至少需要准备：

- `EDGEONE_API_TOKEN`
- `EDGEONE_PAGES_NAME`
- `EDGEONE_DEPLOY_ENV` 可选，默认 `production`

GitHub 侧至少需要准备：

- `CNB_TOKEN`
- `CNB_REPO_URL` 可选，默认 `https://cnb.cool/sorkai/qiming-uniapp-native`

如果沿用和 `vue-pure-admin-max` 一样的 secret 仓库模式，`.cnb.yml` 默认导入：

```text
https://cnb.cool/sorkai/qiming-uniapp-native-secrets/-/blob/main/envs.yml
```

`pnpm --ignore-workspace edgeone:build` 会自动注入微信 H5 构建环境，产物里必须生成：

- `dist/index.html`
- `dist/version.json`
- `dist/hyWOiOCR1C.txt`
- `dist/static/js/*`
- `dist/homepage/bannerphoto.png`

## 部署后校验

部署完成后先打开：

```text
https://aiedu-mp.intelledu.cn/version.json
```

正确结果必须包含：

```json
{
  "mode": "wechat-h5-source-build",
  "source": "Sorkai/qiming-uniapp-native/wechat-miniprogram"
}
```

如果仍然看到 `wechat-h5-static-mirror`，说明线上还是旧镜像，不是当前源码构建，小程序继续白屏或旧 UI 都是预期结果。

微信体验版页面路径保持：

```text
pages/index/index
```
