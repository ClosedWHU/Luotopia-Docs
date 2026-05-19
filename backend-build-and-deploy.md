# 后端构建与部署指南

此文档针对 new-whu-sb 后端（Go 服务）提供常见平台的构建、打包与部署步骤，帮助开发者快速生成可发布产物并在目标环境中运行。

前提与环境
- 已安装 Go（建议 >= 1.20），并配置 `GOPATH` / `GOROOT`（如适用）。
- 推荐使用 `goreleaser` 或 Docker 来做跨平台发布与持续交付。
- 如果在 CI 中构建，请确保使用干净的环境（Ubuntu/macOS/Windows runner）。

本地快速构建（Linux / macOS / Windows）

1. 在开发机上（默认会生成当前主机平台的可执行文件）：

```bash
cd server
go build -v -o bin/new-whu-sb ./cmd/...
```

生成的 `bin/new-whu-sb`（Windows 为 `bin\new-whu-sb.exe`）即可作为可执行文件直接运行：

```bash
./bin/new-whu-sb --config ./configs/config.prod.yaml
```

交叉编译（生成其它平台二进制）

示例：为 Linux amd64 + arm64 交叉编译：

```bash
cd server
# linux/amd64
GOOS=linux GOARCH=amd64 CGO_ENABLED=0 go build -v -o dist/new-whu-sb-linux-amd64 ./cmd/...
# linux/arm64
GOOS=linux GOARCH=arm64 CGO_ENABLED=0 go build -v -o dist/new-whu-sb-linux-arm64 ./cmd/...
# windows/amd64
GOOS=windows GOARCH=amd64 CGO_ENABLED=0 go build -v -o dist/new-whu-sb-windows-amd64.exe ./cmd/...
```

注意：如果项目使用 CGO（例如使用某些数据库驱动或本地库），交叉编译会更复杂，可能需要在目标平台上构建或使用 Docker 构建器。

使用 Docker 构建与发布

1. 本地构建镜像（多阶段构建）示例：

Dockerfile 示例（项目根或 `server/`）：

```dockerfile
FROM golang:1.20-alpine AS build
WORKDIR /src
COPY . .
RUN apk add --no-cache git
RUN go build -ldflags='-s -w' -o /app/new-whu-sb ./server/cmd/...

FROM gcr.io/distroless/base-debian11
COPY --from=build /app/new-whu-sb /usr/local/bin/new-whu-sb
EXPOSE 8080
ENTRYPOINT ["/usr/local/bin/new-whu-sb"]
```

构建并运行：

```bash
docker build -t new-whu-sb:latest .
docker run -p 8080:8080 --env-file ./server/.env new-whu-sb:latest
```

在 CI 中使用 `goreleaser` 做多平台发布

1. 安装并配置 `goreleaser`：在项目根添加 `.goreleaser.yml`，声明构建目标（linux/amd64, linux/arm64, windows/amd64 等）。
2. 在 GitHub Actions 中使用官方 `goreleaser/goreleaser-action`，在打 tag 时自动发布 GitHub Releases 与构建产物。

部署到生产（常见选项）

- Systemd 服务（Linux）

  1. 将二进制或 Docker 容器放到服务器。
  2. Systemd 单元示例：

  ```ini
  [Unit]
  Description=new-whu-sb service
  After=network.target

  [Service]
  User=www-data
  Group=www-data
  ExecStart=/usr/local/bin/new-whu-sb --config /etc/new-whu-sb/config.yaml
  Restart=on-failure
  Environment=ENV=production

  [Install]
  WantedBy=multi-user.target
  ```

- Docker Compose

  在 `docker-compose.yml` 中定义 service、配置卷与环境变量，使用 `docker-compose up -d` 启动。

- Kubernetes

  1. 构建并推送镜像到镜像仓库（Docker Hub / GCR / ECR / ACR）。
  2. 准备 `Deployment`、`Service` 与 `Ingress`，并将配置与密钥放入 `ConfigMap`/`Secret`。

常见云平台部署示例

- Google Cloud Run / Cloud Run for Anthos：构建镜像并直接部署到 Cloud Run（自动伸缩，适合无状态服务）。
- AWS ECS / EKS：使用 ECS/Fargate 或 EKS/K8s 部署容器化服务。
- Heroku：推送 Docker 镜像或使用 Heroku buildpack（适合快速原型）。

日志与监控
- 建议输出结构化日志（JSON），并配置采集：Filebeat/FluentBit -> Elasticsearch/Cloud logging。
- 添加健康检查端点（`/healthz`）以便负载均衡器或容器平台判断服务存活。

安全性与配置
- 不要把敏感配置（API Key、DB 密码）写入源码或镜像；在部署时使用环境变量或 secrets 管理（K8s Secret、Cloud Secret Manager）。
- 仅在必要时开启 CORS，并通过反向代理（Nginx / Cloud Load Balancer）做 TLS 终止。

附：快速命令清单

```bash
# 构建本地二进制
cd server
go build -o bin/new-whu-sb ./cmd/...

# 交叉编译
GOOS=linux GOARCH=amd64 CGO_ENABLED=0 go build -o dist/new-whu-sb-linux-amd64 ./cmd/...

# Docker 构建
docker build -t myrepo/new-whu-sb:latest .

# 在服务器上运行（示例）
docker run -d --name new-whu-sb -p 8080:8080 --env-file ./server/.env myrepo/new-whu-sb:latest
```

如需更详细的 CI/CD 模板（GitHub Actions、GitLab CI、Jenkinsfile）或针对特定云平台的部署示例，我可以为你生成针对性的 workflow/manifest。
