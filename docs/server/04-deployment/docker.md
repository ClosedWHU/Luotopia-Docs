# Docker 部署指南

Luotopia Server 提供了完整的 Docker 化方案，支持快速搭建开发环境以及生产环境的容器化部署。

## 1. 开发环境启动

开发环境通过 `docker-compose.yml` 结合 `docker-compose.dev.yml` 实现，内置了代码热重载 (Air) 和数据库自愈功能。

### 快速开始 (Windows/Unix)
项目根目录提供了辅助脚本：
- **Windows**: `server/scripts/docker-dev.bat start`
- **Linux/Mac**: `server/scripts/docker-dev.sh start`

### 常用命令
| 命令 | 说明 |
| :--- | :--- |
| `start` | 启动所有服务（端口 8080） |
| `logs` | 查看实时日志（支持代码热重载监控） |
| `clean` | 清理容器及挂载的数据卷 |
| `shell` | 进入 API 容器内部进行调试 |

---

## 2. 生产环境部署

在生产环境中，我们建议使用多阶段构建的 `Dockerfile` 以减小镜像体积。

### 构建镜像
```bash
docker build -t luotopia-server:latest ./server
```

### 运行容器
```bash
docker run -d \
  --name luotopia-api \
  -p 8080:8080 \
  -v ./config:/app/config \
  luotopia-server:latest
```

## 3. 环境变量参考
Docker 容器通过 `.env` 文件或 Compose 环境变量注入配置。关键变量包括：
- `DB_HOST`: 数据库地址（Compose 内部通常为 `postgres`）。
- `REDIS_HOST`: Redis 地址（Compose 内部通常为 `redis`）。

---

## 4. 常见问题排查
- **数据库连接失败**: 确保 `postgres` 容器已进入 `healthy` 状态。
- **热重载失效**: 检查 `.air.toml` 配置文件中的 `include_ext` 是否包含您的文件类型。

[返回目录](../index.md)
