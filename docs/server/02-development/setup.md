# 本地开发环境搭建

本指南将帮助你从零开始搭建 Luotopia Server 的开发环境。

## 1. 前置要求
- **Go**: v1.22+
- **PostgreSQL**: v14+ （必需，用于数据存储和全文检索）
- **Redis**: v6+ （必需，用于缓存和任务队列）

## 2. 快速开始

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

## 4. 开发实战：新增一个接口

遵循以下步骤在 Luotopia Server 中增加一个新的业务接口：

1.  **定义模型**: 在对应模块的 `model/` 目录下定义 Request/Response 结构体，并添加 JSON 标签。
2.  **编写业务逻辑**: 在 `repo/` 或 `service/` 中实现具体逻辑。
3.  **注册路由**: 
    - 使用 Huma 的 `huma.Register` 方法。
    - 定义 `Method`, `Path`, `Summary` 及 `Security` 权限。
4.  **运行校验**: 启动服务后访问 `/docs` 确认 OpenAPI 文档已自动更新。

## 5. 常见问题
- **连接超时**: 检查防火墙是否允许访问 PostgreSQL (5432) 和 Redis (6379) 端口。
- **JWT 错误**: 确保 `config.json` 中的 `jwt_secret` 长度符合安全要求。
