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

- **`-w -s`**: 移除调试信息（DWARF）与符号表，进一步减小体积并增加反向工程难度。
- **`-trimpath`**: 移除编译时本地文件路径信息，确保日志输出中的路径是整洁且一致的。

### 5.3 运行安全：非 Root 用户
```dockerfile
RUN addgroup -g 1001 -S appuser && \
    adduser -u 1001 -S appuser -G appuser
USER appuser
```
- **加固建议**: 容器进程以 `appuser` (UID 1001) 运行。这意味着即使容器被攻破，攻击者也无法通过该进程获得宿主机的 root 权限或修改系统级配置文件。

---
[返回目录](../index.md)
