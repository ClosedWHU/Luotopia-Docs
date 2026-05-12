# 本地开发环境搭建 (Local Development Setup)

本指南将帮助你从零开始搭建 Luotopia Server 的开发环境。

## 1. 前置要求 (Prerequisites)
- **Go**: v1.22+
- **PostgreSQL**: v14+
- **Redis**: v6+
- **Meilisearch**: (可选，用于全文检索)

## 2. 快速开始 (Quick Start)

### 2.1 克隆仓库
```bash
git clone https://github.com/ClosedWHU/Luotopia-Server.git
cd Luotopia-Server/server
```

### 2.2 配置环境变量
复制模板配置文件并根据本地环境修改：
```bash
cp config/config.example.json config/config.json
```
> [!IMPORTANT]
> 请务必修改 `database` 和 `redis` 的连接信息，以及 `security.jwt_secret`。

### 2.3 初始化数据库
确保 PostgreSQL 已启动并创建了对应的数据库，然后运行：
```bash
go run cmd/main.go migrate
```

### 2.4 启动服务器
```bash
go run cmd/main.go serve
```
服务器默认运行在 `http://localhost:8080`。

## 3. 开发工具
- **API 文档**: 访问 `http://localhost:8080/docs` 查看交互式 Huma/OpenAPI UI。
- **热重载**: 推荐使用 [air](https://github.com/cosmtrek/air) 进行自动编译。
  ```bash
  air
  ```

## 4. 常见问题 (Troubleshooting)
- **连接超时**: 检查防火墙是否允许访问 PostgreSQL (5432) 和 Redis (6379) 端口。
- **JWT 错误**: 确保 `config.json` 中的 `jwt_secret` 长度符合安全要求。
