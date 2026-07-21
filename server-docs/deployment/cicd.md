---
title: CI/CD 与发布
sidebar_label: CI/CD
sidebar_position: 3
---
# CI/CD 流程说明

Luotopia 采用 GitHub Actions 作为持续集成工具，确保代码提交的质量与稳定性。

## 1. 持续集成 (CI)
每当有代码推送到 `main` 分支或提交 Pull Request 时，都会触发 `QA` 任务。

### 检查项清单
- **格式校验**: 运行 `gofmt` 检查，确保代码风格符合 Go 官方规范。
- **单元测试**: 运行 `go test ./...` 执行全量测试用例。
- **构建校验**: 确保所有 submodules 已正确拉取并可成功编译。

## 2. 部署流程 (CD)

### 工作流程概览
```
Main 分支推送
    ↓
格式检查 & 单元测试 (CI)
    ↓ (通过)
Docker 镜像构建
    ↓
镜像推送到 GHCR
    ↓
更新 Staging 环境 (自动)
    ↓
通知团队进行验证
    ↓
Production Rollout (手动触发)
    ↓ 
Watchtower 自动更新容器
```

### 2.1 Docker 镜像构建与推送

触发条件：CI 通过且提交到 `main` 分支。

**镜像构建阶段**：
```bash
# 使用官方 Go 构建镜像
docker build \
  -t ghcr.io/<org>/luotopia-server:latest \
  -t ghcr.io/<org>/luotopia-server:v$(git describe --tags) \
  -f Dockerfile \
  .
```

**推送到 GHCR**：
```bash
docker push ghcr.io/<org>/luotopia-server:latest
docker push ghcr.io/<org>/luotopia-server:v$(git describe --tags)
```

> [!NOTE]
> 需在 GitHub Settings > Developer settings 生成 Personal Access Token，具有 `write:packages` 权限。

### 2.2 环境配置

#### Staging 环境
- **自动更新**: 每次 CI 通过即更新
- **用途**: 功能验证、集成测试
- **访问**: `https://staging-api.example.com  # 以实际部署为准`
- **数据**: 测试数据库（独立实例）

#### Production 环境
- **手动触发**: 需发布 GitHub Release 或手动触发工作流
- **更新策略**: 蓝绿部署（Blue-Green Deployment）
  1. 启动新版本容器作为"绿"环境
  2. 健康检查通过后切换流量
  3. 旧容器作为回滚点保留 5 分钟
- **滚动发布**: 支持金丝雀发布，逐步切换流量百分比（0% → 10% → 50% → 100%）
- **数据**: 生产数据库（主从复制 + 备份）

### 2.3 使用 Watchtower 进行自动更新

Watchtower 监听 Docker Hub/GHCR 镜像变化，自动拉取最新镜像并重启容器。

**docker-compose.yml 配置示例**：
```yaml
version: '3.8'
services:
  luotopia-server:
    image: ghcr.io/<org>/luotopia-server:latest
    restart: always
    ports:
      - "6262:6262"
    environment:
      - DATABASE_URL=postgres://user:pwd@db:5432/luotopia
      - REDIS_URL=redis://cache:6379
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:6262/health"]
      interval: 30s
      timeout: 10s
      retries: 3
  
  watchtower:
    image: containrrr/watchtower
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    command: --interval 300 --debug  # 每 5 分钟检查一次
    environment:
      - WATCHTOWER_NOTIFICATIONS=email
      - WATCHTOWER_NOTIFICATION_EMAIL_FROM=deploy@whu.sb
```

### 2.4 回滚与故障恢复

#### 快速回滚（自动）
```bash
# 如果新版本容器启动失败，Watchtower 会保留前一个健康的版本
# 自动回滚到上一个标签版本
docker service update --image ghcr.io/<org>/luotopia-server:v1.2.3 luotopia-server
```

#### 手动回滚（紧急情况）
```bash
# 1. 查看镜像历史
docker images | grep luotopia-server

# 2. 切换到特定版本
docker pull ghcr.io/<org>/luotopia-server:v1.2.2
docker service update --image ghcr.io/<org>/luotopia-server:v1.2.2 luotopia-server

# 3. 验证服务健康
curl http://localhost:6262/health
```

#### 数据库回滚（特殊场景）
```bash
# 1. 检查备份时间戳
ls -la /backups/postgres/

# 2. 从特定时间点恢复（PITR）
pg_restore -d luotopia /backups/postgres/backup_2026-05-13_10-30-00.sql

# 3. 验证数据完整性
SELECT COUNT(*) FROM posts;  # 检查关键表行数
```

### 2.5 部署监控与通知

**关键指标**：
- **部署耗时**: 从 push 到生产更新完成
- **成功率**: 部署失败重试次数
- **容器启动时间**: 新版本首次就绪时间
- **回滚频率**: 每月回滚次数

**通知设置**：
```yaml
# .github/workflows/deploy.yml
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build and push
        run: |
          docker build -t ghcr.io/<org>/luotopia-server:latest .
          docker push ghcr.io/<org>/luotopia-server:latest
      
      - name: Notify Slack
        if: always()
        uses: slackapi/slack-github-action@v1
        with:
          payload: |
            {
              "text": "部署 ${{ job.status }}",
              "blocks": [
                {
                  "type": "section",
                  "text": {
                    "type": "mrkdwn",
                    "text": "*Luotopia 部署通知*\n状态: ${{ job.status }}\nCommit: ${{ github.sha }}"
                  }
                }
              ]
            }
```

---

## 3. 本地模拟 CI
在提交 PR 前，建议开发者在本地运行以下命令模拟 CI 检查：
```bash
# 格式化
go fmt ./...

# 运行测试
go test -v ./internal/...

# 构建检查
go build -o server cmd/main.go
```

---

## 4. 常见问题

**Q: 如何在不触发 CI/CD 的情况下提交？**  
A: 在 commit message 中添加 `[skip ci]` 标记：
```bash
git commit -m "[skip ci] 文档更新"
```

**Q: 镜像推送失败怎么办？**  
A: 检查 GHCR token 权限和网络连接。如必须重新推送，删除远程标签：
```bash
git push origin --delete v1.2.3
```

**Q: 如何进行灰度发布？**  
A: 使用 Istio/Nginx Ingress 进行流量分割：
```yaml
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: luotopia-server
spec:
  hosts:
  - api.whu.sb
  http:
  - match:
    - uri:
        prefix: /api
    route:
    - destination:
        host: luotopia-server-v1.0.0
      weight: 90
    - destination:
        host: luotopia-server-v1.1.0
      weight: 10
```

[返回目录](../index.md)
