# 论坛模块
---
slug: /server/05-modules/forum/
---

[返回模块总览](./index.md)

---

论坛模块整合了原 Dugout 项目的核心功能，为 Luotopia 提供一个基于身份验证的高匿名、高互动的社区。

## 详细子文档
为了保持文档清晰，我们将论坛模块拆分为以下专题：

1.  **[治理与规则](governance.md)**: 用户角色、管理员白名单、禁言逻辑及审核体系。
2.  **[内容系统](content.md)**: 帖子/回复的存储结构、标签系统及基于热度的搜索算法。
3.  **[互动流](interaction.md)**: 点赞、踩、收藏及 Redis 缓存同步机制。
4.  **[内容安全](moderation.md)**: 举报流、申诉处理及启发式 AI 自动审核。
5.  **[运营工具](operations.md)**: 通知系统、邀请码配额及校友验证流程。

---

## 目录结构
```text
internal/forum/
├── http/      # Huma 路由与请求处理 (routes.go, http.go)
├── model/     # 数据模型与 API 定义 (forum.go, moderation.go 等)
└── repo/      # 核心逻辑实现 (repo.go, content.go, interaction.go 等)
```

## 设计哲学
*   **高匿名性**: 默认使用昵称显示，后端严格保护用户真实身份 ID。
*   **治理驱动**: 社区秩序由“管理员白名单”和“惩罚阈值”共同维护。
*   **性能优先**: 热门内容（如标签列表、热门贴）完全由 Redis 缓存加速。
