---
title: 论坛治理
sidebar_label: 治理与规则
sidebar_position: 1
---

# 论坛治理与规则

代码：`internal/domains/forum`。下列阈值/白名单逻辑以实现与配置为准。

## 1. 权力结构与白名单
论坛采用“管理员白名单”制度。

### 1.1 管理员同步 (`governance.go`)
- **逻辑**: 在用户登录时，系统会检查其 Email 是否在 `adminWhitelist`（由配置文件注入）中。
- **操作**: 调用 `syncUserAdminRoleTx`。如果用户在白名单中且当前非 Admin，则自动提权；如果已移出白名单，则自动降权。
- **Managed 模式**: 通过 `adminWhitelistManaged` 标记，控制是否由 Repository 自动接管角色同步。

### 1.2 角色分层
- **SuperAdmin**: 拥有最高权限，可修改全局配置。
- **Admin**: 可访问审核队列、执行禁言、处理申诉。
- **User**: 常规发帖与互动。

## 2. 自动化惩罚机制
为了减少人工干预，系统实现了基于反馈的自动化治理。

### 2.1 踩（Downvote）阈值 (`moderation.go`)
根据 `Settings` 中的配置，帖子会根据“踩”的数量自动变换状态：
- **降级**：达到 `DownvoteNumDegrade`，流中排序权重降低。
- **审核**：达到 `DownvoteNumReview`，进入 `PendingReview` 待审。
- **隐藏**：达到 `DownvoteNumHide`，普通用户不可见，需管理员恢复。

### 2.2 联合惩罚
- **阈值**: `JointPunishThreshold`。
- **逻辑**: 如果一个用户在短时间内有多篇帖子被自动隐藏，系统会自动将其账号设为“限制”状态或清空其邀请码配额。

## 3. 开发说明
- **事务性**: 所有角色变更必须在数据库事务内完成。
- **数据一致性**: 角色变更后需清除对应的 Redis Auth 缓存。
