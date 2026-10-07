---
title: 云控（功能开关与参数下发）
slug: cloud-control
sidebar_label: 云控
description: 子应用开关、功能开关与定向参数下发
sidebar_position: 20
---

代码：`internal/domains/cloudcontrol`（OpenAPI Tag `CloudControl`）。**字段与完整路径以 OpenAPI 为准**。

云控负责「不发布客户端即可开关功能 / 下发参数」：子应用入口开关、功能开关与运行参数，按角色（role）或用户（user_id）定向下发。

## 能力

- 公开配置读取：客户端拉取自身可见的开关与参数（`GET /api/v1/cloud-control/config`）。
- 管理端：flags 与定向规则（targeting rules）的增删改查（`/api/v1/admin/cloud-control/*`）。

完整端点见[云控接口参考](../api/cloud-control.md)与[管理后台接口参考](../api/admin.md)。

Flag 以 key 标识，带 `value_type` 与默认值（`default_value`）；定向规则（`Rule`）可按 `role` 或 `user_id` 覆盖默认值，受目标约束校验（`chk_cloud_control_rules_target`）与唯一约束。

## 常见 key（示例）

| key 形态 | 含义 |
|----------|------|
| `subapp.*` | 校园子应用入口开关（如 `subapp.bus`、`subapp.dining`、`subapp.ebike`、`subapp.courseSharing`） |
| `courseSharing.*` | 课程信息共享的能力开关（`autoProjection`、`push`、`writes` 等） |

key 集合与默认值以迁移与运营配置为准，勿假设固定键名永远存在。

## 鉴权

- 公开读取无需登录（客户端按身份只取可见项）。
- 管理操作需 `cloud-control:manage` 权限码（见 [安全策略](../architecture/security_policy.md)）。

## 相关

- [课程信息共享](./course_space.md)
- [系统管理](./system.md)
- [安全策略](../architecture/security_policy.md)
- [模块详解](./index.md)
