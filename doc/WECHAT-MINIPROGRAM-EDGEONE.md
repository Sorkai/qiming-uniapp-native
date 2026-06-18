# 微信小程序 H5 部署说明

小程序壳固定打开 `pages/index/index`，业务页由 web-view 加载 `https://aiedu-mp.intelledu.cn/#/home`。微信后台的“业务域名”保留 `https://aiedu-mp.intelledu.cn`，不要改成普通前端域名。

## EdgeOne 构建配置

| 配置项 | 值 |
| --- | --- |
| 仓库 | `git@github.com:Sorkai/qiming-uniapp-native.git` |
| 分支 | `wechat-miniprogramm` |
| 根目录 | 留空或 `/` |
| 安装命令 | `pnpm edgeone:install` |
| 构建命令 | `pnpm edgeone:build` |
| 输出目录 | `dist` |
| Node.js | `22.11.0` 或 Node 22 LTS |

`pnpm edgeone:build` 会自动注入微信 H5 构建环境，产物里必须生成：

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
  "source": "Sorkai/qiming-uniapp-native/wechat-miniprogramm"
}
```

如果仍然看到 `wechat-h5-static-mirror`，说明线上还是旧镜像，不是当前源码构建，小程序继续白屏或旧 UI 都是预期结果。

微信体验版页面路径保持：

```text
pages/index/index
```

