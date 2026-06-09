# CI/CD 迁移至 cnb.cool（CNB）

- 流水线文件：`.cnb.yml`（仓库根目录）
- 覆盖范围：Go 依赖整理、构建、测试；Docker Buildx 多架构构建并推送至 CNB 制品库
- Dockerfile：`docker/api/Dockerfile`## 触发策略

- Tag 以`v*`开头：构建并推送`vX.Y.Z`与`latest`-`main` 分支：`edge`、`sha-<shortsha>`-`dev` 分支：`dev`、`sha-<shortsha>`
- 其他分支：`branch-<name>-<shortsha>`（`name` 小写、非字母数字→`-`、最长 20）
- PR：`pr-<number>-<shortsha>`

## 镜像命名

- 基础路径：`${CNB_DOCKER_REGISTRY}/${CNB_REPO_SLUG_LOWERCASE}/aiedu-api`- 可通过环境变量`IMAGE_COMPONENT_NAME`覆盖组件名（如需，修改`.cnb.yml`的 Compute Image Meta 阶段）

## OCI 元数据标签

-`org.opencontainers.image.source`：Git 源地址

- `org.opencontainers.image.revision`：短 SHA
- `org.opencontainers.image.version`：版本/通道
- `org.opencontainers.image.created`：UTC 时间

## 多架构

- 默认 `linux/amd64, linux/arm64`，可在 `.cnb.yml`中调整`DOCKER_PLATFORMS`## 常见问题

- 首次构建失败可尝试在仓库设置中开启 CNB，或在下一次提交触发
- 如镜像仓库命名需变更，请同步修改`.cnb.yml`中`IMAGE_COMPONENT_NAME`

## 参考

- 平台文档：<https://docs.cnb.cool/zh/build/intro.html>
- 从 GitHub Actions 迁移：<https://docs.cnb.cool/zh/build/migrate-to-cnb/migrate-from-github-actions.html>
