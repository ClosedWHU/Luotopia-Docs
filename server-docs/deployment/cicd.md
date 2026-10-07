---
title: CI/CD 与发布
sidebar_label: CI/CD
sidebar_position: 3
---

仓库：`server/.github/workflows/`（`ci.yml`、`cd.yml`）。在 GitHub Actions（自托管 `self-hosted, Linux, X64` runner）上运行。

## 持续集成（CI）

`ci.yml` 在 `push` / `pull_request` 到 `main` 时触发（忽略 `*.md`、`docs/`、`monitoring/`、`.gitleaks.toml`），也可 `workflow_dispatch`。

### QA（主任务）

| 步骤 | 说明 |
|------|------|
| 启动服务容器 | 起临时 `pgvector/pgvector:pg18`（库 `test_db`）与 `redis:alpine`，测后清理 |
| Gitleaks | 密钥扫描（`gitleaks detect --config=.gitleaks.toml`） |
| Go | `actions/setup-go@v7`，版本 `1.27.0` |
| 格式检查 | `gofmt -l .`（不通过仅告警，不阻断） |
| golangci-lint | `golangci-lint-action@v9`，版本 `v2.13.2` |
| 架构边界检查 | `go run ./cmd/archcheck` |
| OpenAPI 导出冒烟 | `go run ./scripts/export_openapi.go` |
| 测试 | `push` 跑 `go test -p 1 -timeout 15m ./...`。PR 追加 `-coverprofile`，设 20% 覆盖率门槛，并上传覆盖率产物 |

### 其他任务

| 任务 | 说明 |
|------|------|
| Monitoring lint | `promtool` / `amtool` 校验告警规则与 `prometheus.yml`、`alertmanager.yml` |
| Semgrep | `semgrep scan --config=p/default --metrics=off --error` |
| Race | PR 时对选定包跑 `go test -race -p 1` |

Race 的选定包：worker、monitoring、identity/service、database、authz、admin/http、course_review/repo、forum/repo 等。

## 持续交付（CD）

`cd.yml` 在推送 `v*` 标签、发布 Release 或手动触发时构建镜像并推送到 GHCR，随后触发 Watchtower 更新容器。

| 步骤 | 说明 |
|------|------|
| 质量门禁（快速） | `go vet ./...`、`go run ./cmd/archcheck`、`go run ./scripts/export_openapi.go` |
| Buildx + GHCR 登录 | `docker/login-action`（`secrets.GITHUB_TOKEN`） |
| 打标签 | push tag → `unstable`/`latest`/`<tag>`；Release → `stable`/`latest`/`<tag>`；手动 → `latest`/`manual` |
| 构建推送 | `docker/build-push-action@v7`（`./Dockerfile`，GHA cache） |
| 部署触发 | 有 `WATCHTOWER_WEBHOOK_URL` 时 POST 该 webhook（可选 `WATCHTOWER_TOKEN`） |

## 相关

- [Docker 部署](./docker.md)
- [监控与 Metrics](./monitoring.md)
- [服务端开发规范](../development/contributing.md)
- [服务端概览](../index.md)
