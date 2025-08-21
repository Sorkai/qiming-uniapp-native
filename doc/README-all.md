# AI教育平台

## 项目简介

本项目是一个基于Go语言开发的AI教育平台，旨在提供智能化的在线教育服务。平台集成了课程管理、作业考试、AI互动等功能，为用户提供全方位的学习体验。

### 项目特点

- **智能化学习**：集成AI技术，提供智能问答和学习辅助
- **全面的课程管理**：支持多种课程资源类型，包括视频、PDF、PPT等
- **完善的考试系统**：支持多种题型，自动评分和统计分析
- **个性化学习体验**：根据学习进度和效率提供个性化学习建议
- **高性能架构**：基于go-zero微服务框架，保证系统高可用和可扩展性

## 技术栈

- **后端框架**：基于 [go-zero](https://github.com/zeromicro/go-zero) 微服务框架
- **数据库**：MySQL
- **缓存**：Redis
- **对象存储**：MinIO
- **容器化**：Docker
- **API文档**：自定义API文档

## 项目结构

```
├── app                 # 应用代码
│   ├── api             # API服务
│   │   ├── desc        # API描述文件
│   │   ├── etc         # 配置文件
│   │   └── internal    # 内部实现
│   └── model           # 数据模型
├── deploy              # 部署相关
│   └── script          # 脚本
│       ├── gencode     # 代码生成
│       └── mysql       # MySQL脚本
├── doc                 # 文档
│   ├── backend         # 后端接口文档
│   └── frontend        # 前端接口文档
├── docker              # Docker配置
│   ├── api             # API服务Docker配置
│   ├── minio           # MinIO Docker配置
│   ├── mysql           # MySQL Docker配置
│   └── redis           # Redis Docker配置
└── pkg                 # 公共包
    ├── constant        # 常量定义
    ├── cron            # 定时任务
    ├── ctxdata         # 上下文数据
    ├── globalkey       # 全局键
    ├── interceptor     # 拦截器
    ├── interface       # 接口定义
    ├── middleware      # 中间件
    ├── miniox          # MinIO客户端
    ├── result          # 结果处理
    ├── tool            # 工具函数
    ├── uniqueid        # 唯一ID生成
    └── xerr            # 错误处理
```

## 核心功能模块

### 1. 用户中心

- 用户注册、登录、信息管理
- 用户权限控制
- 用户学习记录管理

### 2. 课程管理

- 课程创建、编辑、删除
- 课程分类管理
- 课程章节和课时管理
- 课程资源管理（视频、PDF、PPT等）

### 3. 作业与考试

- 作业/考试创建与管理
- 题库管理（单选、多选、判断、填空、简答、论述）
- 作业/考试提交与评分
- 错题统计与分析

### 4. AI互动

- 基于课程内容的AI问答
- AI辅助学习
- 会话历史记录

### 5. 学习进度与统计

- 学习进度跟踪
- 学习效率分析
- 学习数据统计

### 6. 教师计划

- 教学计划创建与管理
- 教学进度跟踪
- 教学效果评估

## 部署说明

### 环境要求

- Go 1.23+
- MySQL 5.7+
- Redis 6.0+
- MinIO
- Docker & Docker Compose

### 安装依赖

```bash
go mod tidy
```

### 快速启动

1. 克隆代码库

```bash
git clone [仓库地址]
cd ai-edu
```

2. 配置环境

修改 `app/api/etc/aieduapi.yaml` 配置文件，设置数据库、Redis和MinIO连接信息。

3. 初始化数据库

```bash
# 使用deploy/script/mysql目录下的SQL脚本初始化数据库
mysql -u用户名 -p密码 < deploy/script/mysql/init.sql
```

4. 使用Docker Compose启动服务

```bash
docker-compose up -d
```

5. 访问服务

API服务默认运行在 http://localhost:1004

## API文档

详细的API文档请参考 `doc` 目录：

- [通用接口](./doc/common.md)
- [后端接口](./doc/backend/)
- [前端接口](./doc/frontend/)
    - 前端错题分析接口见：`doc/frontend/wrong-exercise.md`，提供错题分析与历史查询的调用示例（支持 PowerShell 示例）。

## 开发指南

### 代码生成

使用 `deploy/script/gencode` 目录下的脚本生成数据模型代码。

### 添加新API

1. 在 `app/api/desc` 目录下添加API描述文件
2. 使用go-zero工具生成API代码
3. 实现API逻辑

