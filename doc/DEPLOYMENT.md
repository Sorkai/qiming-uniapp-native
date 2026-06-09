# 部署说明（API 服务）

本服务镜像由 CNB 流水线自动构建并推送到制品库。以下给出常用部署方式。

## 镜像命名与标签

- 镜像路径：`${CNB_DOCKER_REGISTRY}/${CNB_REPO_SLUG_LOWERCASE}/aiedu-api:<tag>`- 常见标签：-`edge`（main）、`dev`（dev）、`pr-<num>-<sha>`（PR）、`branch-<name>-<sha>`（其他分支）
    - `vX.Y.Z`与`latest`（发布 Tag）

## 直接 Docker 运行

- 默认端口：`1004`- 默认配置：镜像内置`/app/etc/aieduapi.yaml`，来源仓库 `app/api/etc/aieduapi-docker.yaml`

````powershell
# 登录（CNB 制品库默认内置凭据于流水线侧，部署机按需配置）
# docker login <your-registry>

# 拉取镜像（示例：main 通道）
docker pull <registry>/<repo-slug>/aiedu-api:edge

# 运行（映射宿主端口，必要时挂配置与数据卷）
docker run -d --name aiedu-api -p 1004:1004 \
  <registry>/<repo-slug>/aiedu-api:edge

```text
## Docker Compose（示例片段）

```yaml
services:
  aiedu-api:
    image: <registry>/<repo-slug>/aiedu-api:edge
    container_name: aiedu-api
    ports:
      - "1004:1004"
    environment:
      TZ: Asia/Shanghai
    restart: always

```text
## 配置

- 如需修改配置，可将运行时配置文件挂载至 `/app/etc/aieduapi.yaml`：

```powershell
docker run -d --name aiedu-api -p 1004:1004 \
    -v ${PWD}/aieduapi.yaml:/app/etc/aieduapi.yaml \
  <registry>/<repo-slug>/aiedu-api:edge

````

- 参考仓库中的：`app/api/etc/aieduapi.yaml`、`app/api/etc/aieduapi-dev.yaml`、`app/api/etc/aieduapi-docker.yaml`

## 健康检查

- 端口：`1004`（根据你的路由/健康接口自定义）
- 建议在 Compose 或编排平台中加上健康检查规则。

## 常见问题

- 端口冲突：检查宿主 `1004`是否被占用。
- 镜像拉取失败：确认镜像仓库地址与权限；如切换到 ghcr 请同步更新镜像路径与登录。
- 依赖服务：若本地起 Redis/MySQL/MinIO，可复用仓库`docker/docker-compose.yml` 的服务编排。
