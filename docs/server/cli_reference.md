# CLI 命令参考

Luotopia Server 提供了一套强大的命令行工具，用于开发、部署和维护。本章节汇总所有可用的 CLI 命令。

## 基础用法

```bash
go run cmd/main.go <command> [options]

# 或者编译后运行
./luotopia-server <command> [options]
```

## 服务命令

### serve - 启动服务器

启动 Luotopia 应用服务器。

```bash
go run cmd/main.go serve [options]

选项:
  --addr string              监听地址 (默认: ":8080")
  --env string              环境标识 (development/staging/production，默认: development)
  --config string           配置文件路径 (默认: config/config.json)
  --log-level string        日志级别 (debug/info/warn/error，默认: info)
```

**示例**:
```bash
# 使用开发配置启动服务器
go run cmd/main.go serve --config config/config.dev.json

# 启动并监听 0.0.0.0:3000
go run cmd/main.go serve --addr "0.0.0.0:3000"

# 生产环境启动，仅记录重要信息
go run cmd/main.go serve --env production --log-level warn
```

## 数据库命令

### migrate - 数据库迁移

执行未应用的数据库迁移脚本。

```bash
go run cmd/main.go migrate [options]

选项:
  --step int                应用指定数量的迁移步数 (默认: 全部)
  --version string          迁移到指定版本
  --direction string        迁移方向 (up/down，默认: up)
  --force                   跳过确认直接执行
```

**示例**:
```bash
# 应用所有待迁移的脚本
go run cmd/main.go migrate

# 仅应用最新的 3 个迁移
go run cmd/main.go migrate --step 3

# 回滚最近的迁移
go run cmd/main.go migrate --direction down --step 1

# 迁移到特定版本
go run cmd/main.go migrate --version 20260501120000
```

### seed - 数据库初始化

插入初始数据到数据库（仅用于开发环境）。

```bash
go run cmd/main.go seed [options]

选项:
  --sample              插入示例数据
  --admin-email string  管理员邮箱 (默认: admin@whu.sb)
  --admin-pwd string    管理员密码 (默认: 生成随机密码)
```

**示例**:
```bash
# 插入示例数据（包含测试用户、帖子等）
go run cmd/main.go seed --sample

# 创建管理员账户
go run cmd/main.go seed --admin-email "newadmin@whu.sb" --admin-pwd "SecurePassword123"
```

> [!NOTE]
> 全文搜索索引由 PostgreSQL 自动管理，无需额外的索引管理命令。搜索性能通过数据库迁移中定义的 GIN 索引自动优化。

## 用户管理命令

### user - 用户操作

```bash
go run cmd/main.go user <subcommand> [options]

子命令:
  create                创建用户
  delete                删除用户
  reset-password        重置密码
  grant-role            赋予角色
```

#### user create - 创建用户

```bash
go run cmd/main.go user create [options]

选项:
  --email string       用户邮箱 (必需)
  --name string        用户名称 (默认: 从邮箱提取)
  --password string    密码 (默认: 生成随机密码)
  --role string        角色: user|moderator|admin (默认: user)
  --verified bool      是否已验证邮箱 (默认: false)
```

**示例**:
```bash
# 创建普通用户，自动生成密码
go run cmd/main.go user create --email "user@whu.sb"

# 创建管理员账户
go run cmd/main.go user create \
  --email "admin@whu.sb" \
  --password "InitialPassword123" \
  --role admin \
  --verified

# 创建内容审核员
go run cmd/main.go user create \
  --email "moderator@whu.sb" \
  --role moderator
```

#### user reset-password - 重置密码

```bash
go run cmd/main.go user reset-password [options]

选项:
  --email string       用户邮箱 (必需)
  --password string    新密码 (默认: 生成随机密码)
```

**示例**:
```bash
# 重置用户密码
go run cmd/main.go user reset-password --email "user@whu.sb"

# 设置特定密码
go run cmd/main.go user reset-password \
  --email "user@whu.sb" \
  --password "NewPassword123"
```

## 配置命令

### config - 配置管理

```bash
go run cmd/main.go config <subcommand> [options]

子命令:
  init                  生成默认配置文件
  validate              验证配置文件格式
  encrypt               加密敏感配置项
```

#### config init - 初始化配置

```bash
go run cmd/main.go config init [options]

选项:
  --output string      输出文件路径 (默认: config.json)
  --template string    配置模板 (dev|staging|prod，默认: dev)
```

**示例**:
```bash
# 生成开发环境配置
go run cmd/main.go config init --template dev

# 生成生产环境配置模板
go run cmd/main.go config init --template prod --output config.prod.json
```

#### config validate - 验证配置

```bash
go run cmd/main.go config validate [options]

选项:
  --file string   配置文件路径 (默认: config.json)
```

**示例**:
```bash
# 验证当前配置
go run cmd/main.go config validate

# 验证特定文件
go run cmd/main.go config validate --file config.prod.json

输出:
✓ 配置格式正确
✓ 必需字段完整
✓ 数据库连接字符串有效
⚠️  警告: 生产环境未启用 HTTPS
```

## 开发工具命令

### version - 显示版本信息

```bash
go run cmd/main.go version

输出:
Luotopia Server v1.2.3
Build: 2026-05-13
Commit: abc123def456
Go Version: 1.22.1
```

### health - 健康检查

```bash
go run cmd/main.go health [options]

选项:
  --timeout int   超时时间（秒，默认: 5）
```

**示例**:
```bash
# 快速健康检查
go run cmd/main.go health

输出:
✓ 数据库: 连接正常
✓ Redis: 连接正常
✓ 所有检查通过
```

## 通用选项

所有命令都支持以下全局选项：

```bash
go run cmd/main.go [global-options] <command> [command-options]

全局选项:
  -h, --help           显示帮助信息
  -v, --verbose        详细输出
  --config string      配置文件路径 (覆盖 LUOTOPIA_CONFIG 环境变量)
  --log-level string   日志级别 (debug/info/warn/error)
```

## 环境变量

```bash
# 数据库连接
DATABASE_URL=postgres://user:password@localhost:5432/luotopia

# 缓存
REDIS_URL=redis://localhost:6379

# 配置文件
LUOTOPIA_CONFIG=./config/config.json

# 运行环境
LUOTOPIA_ENV=development
```

## 常用场景脚本

### 场景 1: 本地开发环境初始化

```bash
#!/bin/bash
# scripts/init-dev.sh

set -e

echo "初始化 Luotopia 开发环境..."

# 1. 生成配置文件
go run cmd/main.go config init --template dev

# 2. 运行数据库迁移
go run cmd/main.go migrate

# 3. 插入示例数据
go run cmd/main.go seed --sample

# 4. 验证索引配置
go run cmd/main.go search stats

echo "✓ 初始化完成！"
echo "使用 'go run cmd/main.go serve' 启动服务器"
```

### 场景 2: 生产环境部署前检查

```bash
#!/bin/bash
# scripts/pre-deploy-check.sh

set -e

echo "部署前检查..."

# 1. 验证配置文件
go run cmd/main.go config validate --file config.prod.json

# 2. 检查数据库连接
go run cmd/main.go health --timeout 10

# 3. 验证搜索引擎
go run cmd/main.go search stats

# 4. 检查未应用的迁移
PENDING=$(go run cmd/main.go migrate --dry-run 2>&1 | grep -c "pending" || echo "0")
if [ "$PENDING" -gt 0 ]; then
    echo "⚠️  存在未应用的数据库迁移，请先执行"
    exit 1
fi

echo "✓ 所有检查通过，可以部署"
```

### 场景 3: 生产环境维护 - 数据库迁移

```bash
#!/bin/bash
# scripts/migrate-prod.sh

set -e

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="logs/migrate_${TIMESTAMP}.log"

echo "开始生产环境数据库迁移..."
echo "日志: $LOG_FILE"

# 1. 备份数据库
echo "备份数据库..." | tee -a "$LOG_FILE"
pg_dump -Fc $DATABASE_URL > "backups/db_${TIMESTAMP}.dump" 2>&1 | tee -a "$LOG_FILE"

# 2. 执行迁移
echo "执行迁移..." | tee -a "$LOG_FILE"
go run cmd/main.go migrate \
    --step all \
    2>&1 | tee -a "$LOG_FILE"

# 3. 验证结果
echo "验证迁移..." | tee -a "$LOG_FILE"
go run cmd/main.go check 2>&1 | tee -a "$LOG_FILE"

echo "✓ 迁移完成！日志已保存到 $LOG_FILE"
```

---

[返回开发指南](./02-development/index.md)
