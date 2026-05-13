# API 使用指南

Luotopia Server 提供基于 RESTful 风格的 API 接口，并使用 [Huma v2](https://huma.rocks/) 进行自动化文档生成和类型安全验证。

## 1. 基础信息
- **Base URL**: `/api/v1`
- **内容类型**: `application/json`
- **版本控制**: 通过 URL 路径进行版本控制（当前为 `v1`）。
- **详细参考**: [业务接口调用指南](./detailed_reference.md)

## 2. 认证方式

系统支持以下三种认证方式：

### 2.1 JWT 认证
- **获取**: 通过 `/api/v1/user/login` 接口。
- **使用**: 在 Header 中添加 `Authorization: Bearer <your_jwt_token>`。

### 2.2 API Key 认证
- **获取**: 在个人中心 -> 开发者设置中生成。
- **使用**: 
  - `X-Api-Key`: 您的 API Key。
  - `X-Api-Sign`: 使用 API Secret 计算的签名。
  - `X-Api-Ts`: 当前时间戳（用于防御重放攻击）。

### 2.3 SSO 会话
- 仅限于支持 OIDC 的客户端跳转。

## 3. 交互式文档

Luotopia Server 内置了交互式 API 文档，您可以在本地启动服务后访问：

- **OpenAPI UI**: [http://localhost:8080/docs](http://localhost:8080/docs)
- **Scalar UI**: [http://localhost:8080/scalar](http://localhost:8080/scalar)

在这些页面上，您可以直接在线测试接口并查看详细的 Request/Response 结构。

## 4. 速率限制
- 默认限制: 100 次请求 / 分钟 (按 IP)。
- 开发者限制: 取决于 API Key 的 RPM 配额。

---
[返回目录](../index.md)
