---
title: 管理后台
sidebar_label: 管理后台
sidebar_position: 6
---

代码：`internal/domains/admin`。路径前缀：`/api/v1/admin/*`。

## 鉴权

- 需要管理员 JWT（`is_admin` / `role=admin|superadmin`）  
- 部分子路径要求 **superadmin**（用户、队列、缓存、embedding、映射等，见 `huma_auth.go` 中 `adminOperationRequiresSuperadmin`）  
- 用户级 API Key **不能**访问 admin

## 常见能力（以 OpenAPI 为准）

- 用户与 API 凭证管理  
- 队列 / worker / 缓存 / embedding 运维  
- 内容与资料审核相关入口  
- 课程外部映射等  
- 存储元数据巡检与清理：`GET /api/v1/admin/storage/invalid`、`DELETE /api/v1/admin/storage/invalid/{object_id}`、`POST /api/v1/admin/storage/invalid/purge`，权限 `storage:manage`

## 实现注意

- Handler 在 `admin/http`  
- 跨域数据访问应遵守模块边界；管理操作建议记审计日志  

## 相关

- [模块详解](./index.md)
- [安全策略](../architecture/security_policy.md)
- [日志与审计](./platform/logging.md)

