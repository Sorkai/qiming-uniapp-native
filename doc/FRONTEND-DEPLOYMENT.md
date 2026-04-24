# 前端部署文档 — 启明智教（vue-pure-admin-max）

## 项目概述

| 项目       | 说明                                                           |
| ---------- | -------------------------------------------------------------- |
| 框架       | Vue 3 + Vite + TypeScript                                     |
| UI 库      | Element Plus + TailwindCSS                                     |
| 包管理器   | **pnpm**（强制，项目已配置 `only-allow pnpm`）                 |
| Node 版本  | **≥ 20**（Dockerfile 使用 `node:20-alpine`）                   |
| 产物目录   | `dist/`                                                        |
| 默认端口   | 开发 `8848` / 生产 Nginx `80`                                  |

---

## 1. 环境准备

### 1.1 安装 Node.js

推荐使用 [nvm](https://github.com/nvm-sh/nvm) 管理 Node 版本：

```bash
nvm install 20
nvm use 20
node -v  # 确认 >= v20
```

### 1.2 安装 pnpm

```bash
corepack enable
corepack prepare pnpm@latest --activate
pnpm -v
```

---

## 2. 环境变量说明

项目通过 Vite 多模式文件管理环境变量：

| 文件               | 对应环境     | 说明                                         |
| ------------------ | ------------ | -------------------------------------------- |
| `.env`             | 所有环境共享 | 端口、代理目标等公共配置                     |
| `.env.development` | 开发环境     | API 走 `/api` 前缀，由 Vite 代理到后端       |
| `.env.staging`     | 预发布环境   | 开启 CDN，Hash 路由                          |
| `.env.production`  | 生产环境     | API 直连后端，Hash 路由                      |

### 关键变量

| 变量                | 开发环境默认值                          | 生产环境默认值                          | 说明                                |
| ------------------- | --------------------------------------- | --------------------------------------- | ----------------------------------- |
| `VITE_PORT`         | `8848`                                  | —                                       | 本地开发端口                        |
| `VITE_PUBLIC_PATH`  | `/`                                     | `/`                                     | 静态资源前缀                        |
| `VITE_API_URL`      | `/api`                                  | `https://aiedu-api.intelledu.cn`        | 后端接口地址                        |
| `VITE_PROXY_TARGET` | `https://aiedu-api.intelledu.cn`        | —                                       | 开发代理目标                        |
| `VITE_ROUTER_HISTORY` | `"hash"`                              | `"hash"`                                | 路由模式：`hash` / `h5`            |
| `VITE_CDN`          | `false`                                 | `false`                                 | 打包时是否用 CDN 替换本地库         |
| `VITE_COMPRESSION`  | —                                       | `"none"`                                | 压缩方式：`gzip` / `brotli` / `both` / `none` |
| `VITE_MOCK_SCOPE`   | `exam-paper-only`                       | —                                       | Mock 数据范围                       |

> **注意**：如果生产环境需要修改 API 地址，请编辑 `.env.production` 中的 `VITE_API_URL`。

---

## 3. 本地开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器（默认 http://localhost:8848）
pnpm dev
```

开发环境下 Vite 会将 `/api` 请求代理到 `VITE_PROXY_TARGET`。

---

## 4. 构建

### 4.1 生产构建

```bash
pnpm build
```

- 自动清除旧 `dist/` 目录
- 分配 8GB 内存（`NODE_OPTIONS=--max-old-space-size=8192`）
- 产物输出到 `dist/`
- 构建完成后自动生成版本文件（`generate-version-file`）

### 4.2 预发布构建

```bash
pnpm build:staging
```

使用 `.env.staging` 配置，默认开启 CDN。

### 4.3 构建产物分析

```bash
pnpm report
```

会在项目根目录生成 `report.html`，自动打开浏览器展示 bundle 体积分析。

### 4.4 本地预览构建产物

```bash
pnpm preview
# 或一键构建 + 预览
pnpm preview:build
```

---

## 5. 部署方式

### 5.1 方式一：Nginx 静态部署（推荐）

将 `dist/` 目录内容部署到 Nginx。

#### Nginx 配置示例

```nginx
server {
    listen       80;
    server_name  your-domain.com;

    root /usr/share/nginx/html;
    index index.html;

    # gzip 压缩（如构建时已开启 brotli/gzip，nginx 可直接使用预压缩文件）
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript image/svg+xml;

    location / {
        # Hash 路由模式下直接 try_files 即可
        try_files $uri $uri/ /index.html;
    }

    # 静态资源长缓存（文件名含 hash）
    location /static {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API 反向代理（如前端直连后端则无需此段）
    location /api/ {
        proxy_pass https://aiedu-api.intelledu.cn/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

> **HTML5 History 模式**（`VITE_ROUTER_HISTORY = "h5"`）下，`try_files $uri $uri/ /index.html` 是必须的，否则刷新页面会 404。Hash 模式下同样建议保留此配置。

#### 部署步骤

```bash
# 1. 构建
pnpm build

# 2. 上传 dist 到服务器
scp -r dist/* user@your-server:/usr/share/nginx/html/

# 3. 重载 Nginx
ssh user@your-server "sudo nginx -s reload"
```

---

### 5.2 方式二：Docker 部署

项目根目录已包含 `Dockerfile`，使用多阶段构建：

1. **构建阶段**：`node:20-alpine` 环境，`pnpm install` + `pnpm build`
2. **运行阶段**：`nginx:stable-alpine`，仅包含 `dist/` 静态文件

#### 构建镜像

```bash
docker build -t qiming-frontend:latest .
```

#### 运行容器

```bash
docker run -d \
  --name qiming-frontend \
  -p 80:80 \
  --restart always \
  qiming-frontend:latest
```

#### 自定义 Nginx 配置

如需自定义 Nginx 配置（如反向代理），可挂载配置文件：

```bash
docker run -d \
  --name qiming-frontend \
  -p 80:80 \
  -v /path/to/nginx.conf:/etc/nginx/conf.d/default.conf:ro \
  --restart always \
  qiming-frontend:latest
```

---

### 5.3 方式三：Docker Compose

```yaml
version: "3.8"
services:
  frontend:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: qiming-frontend
    ports:
      - "80:80"
    environment:
      TZ: Asia/Shanghai
    restart: always
```

```bash
docker compose up -d --build
```

---

### 5.4 方式四：CNB 流水线自动化（CI/CD）

项目已配置 CNB 流水线，详见 [CI-CD-CNB.md](CI-CD-CNB.md)。

- 推送代码后自动触发构建
- 镜像自动推送到 CNB 制品库
- Tag 触发 `vX.Y.Z` + `latest`；`main` 分支触发 `edge`

---

## 6. 运行时配置

`public/platform-config.json` 为运行时配置，**不经过 Vite 编译**，可在部署后直接修改而无需重新构建。

关键字段：

| 字段           | 说明                  | 默认值     |
| -------------- | --------------------- | ---------- |
| `Title`        | 页面标题              | `启明智教` |
| `Layout`       | 布局模式              | `vertical` |
| `Theme`        | 主题                  | `light`    |
| `DarkMode`     | 暗黑模式              | `false`    |
| `Locale`       | 默认语言              | `zh`       |
| `EpThemeColor` | Element Plus 主题色   | `#97b4f7`  |

修改方式：

```bash
# 直接编辑部署目录下的 platform-config.json（无需重新构建）
vim /usr/share/nginx/html/platform-config.json
```

---

## 7. 常用命令速查

| 命令                   | 说明                     |
| ---------------------- | ------------------------ |
| `pnpm install`         | 安装依赖                 |
| `pnpm dev`             | 启动开发服务器           |
| `pnpm build`           | 生产构建                 |
| `pnpm build:staging`   | 预发布构建               |
| `pnpm preview`         | 预览构建产物             |
| `pnpm report`          | 构建体积分析             |
| `pnpm lint`            | ESLint + Prettier + Stylelint 全量检查 |
| `pnpm typecheck`       | TypeScript 类型检查      |
| `pnpm clean:cache`     | 清空缓存并重装依赖       |

---

## 8. 常见问题

### Q: 构建时内存不足（JavaScript heap out of memory）

构建脚本已设置 `NODE_OPTIONS=--max-old-space-size=8192`。如仍不足，可手动增大：

```bash
NODE_OPTIONS=--max-old-space-size=16384 pnpm build
```

### Q: 部署后刷新页面 404

- 确认 Nginx 配置了 `try_files $uri $uri/ /index.html`
- 或使用 Hash 路由模式（`VITE_ROUTER_HISTORY = "hash"`，默认已配置）

### Q: 部署后 API 请求失败

- **生产环境**默认直连 `https://aiedu-api.intelledu.cn`，确认服务器可访问该地址
- 如需通过 Nginx 代理 API，在 Nginx 配置中添加 `/api/` 的 `proxy_pass` 规则，并将 `.env.production` 的 `VITE_API_URL` 改为 `/api`

### Q: 如何开启 gzip/brotli 压缩？

修改 `.env.production`：

```env
# 可选值：gzip / brotli / both / gzip-clear / brotli-clear / both-clear / none
VITE_COMPRESSION = "gzip"
```

然后重新构建。Nginx 侧也需开启对应支持（`gzip_static on;` / `brotli_static on;`）。

### Q: Docker 构建很慢

- 确保 `.dockerignore` 排除了 `node_modules`、`dist` 等目录
- 利用 Docker 构建缓存，`COPY package.json pnpm-lock.yaml` 放在 `COPY . .` 之前（Dockerfile 中已如此配置）

### Q: 如何修改页面标题 / 主题色而不重新构建？

直接编辑部署目录下的 `platform-config.json`，刷新浏览器即可生效。
