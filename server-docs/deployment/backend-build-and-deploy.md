---
id: backend-build-and-deploy
title: 后端构建与部署
sidebar_label: 后端构建与部署
sidebar_position: 5
description: 工作区 server/ 本地构建与 Docker 部署要点
---
# 后端构建与部署指南

针对 工作区中的 `server/`（Go）的构建与部署要点。更完整的 Compose 说明见 [Docker 部署](./docker.md)。

## 环境

- Go：**与 `server/go.mod` 一致**（当前为 1.26.x 量级）
- 生产镜像：见 `server/Dockerfile`（多阶段，**CGO 开启**）
- 配置：JSON/JSONC，路径 `CONFIG_PATH` 或 `--config`

## 本地构建

```bash
cd server
go build -o bin/luotopia-backend ./cmd
./bin/luotopia-backend serve --config config/config.json
```

入口命令只有：`serve` | `worker` | `cli`。

## Docker

```bash
cd server
docker build -t luotopia-backend:latest .
docker run -d \
  -p 6262:6262 \
  -v "$(pwd)/config:/app/config:ro" \
  -e CONFIG_PATH=config/config.json \
  luotopia-backend:latest serve
```

- 端口 = 配置 `server.port`
- 全栈：`docker compose up -d --build`（见 [Docker 部署](./docker.md)）
- Postgres 推荐 `Dockerfile.db`（pgvector + pg_jieba）

## 配置注意

- 未知字段启动失败
- 生产 `public_base` 用 HTTPS
- 勿把 metrics 无鉴权暴露公网

## 相关文档

- [配置手册](./config.md)
- [Docker](./docker.md)
- [监控](./monitoring.md)
- [CLI](../cli_reference.md)
