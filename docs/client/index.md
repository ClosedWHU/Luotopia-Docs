---
slug: /client/
---

# 客户端开发文档

Luotopia 客户端是基于 **Flutter** 构建的跨平台移动端应用，致力于为武大学生提供流畅、美观且功能丰富的校园服务体验。

## 核心技术栈
- **框架**: Flutter 3.x
- **状态管理**: Riverpod
- **网络层**: http 包 + 自定义序列化
- **UI 框架**: shadcn_flutter + Material Design 3
- **路由**: go_router
- **持久化**: shared_preferences

## 导航指南

1.  **[环境搭建](./setup.md)**: 如何配置 Flutter SDK、Android/iOS 环境并运行项目。
2.  **[架构说明](./architecture.md)**: 项目的分层结构与模块划分。
3.  **[状态管理](./state_management.md)**: 详细解释 Riverpod 在项目中的实践。
4.  **[UI 组件库](./components.md)**: 基于 Material Design 3 和 shadcn_flutter 的定制化 UI 组件说明。
5.  **[API 对接指南](./api_integration.md)**: 详细介绍如何配置 HTTP 客户端、生成 API 模型、处理认证和错误。

---

[返回主页](/)
