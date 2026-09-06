---
title: 学习资料
sidebar_label: 学习资料
sidebar_position: 11
---

代码：`internal/domains/material`。学习资料模块提供武汉大学课程资料的搜索、上传、下载与审核能力。

## 存储策略

新上传资料统一进入平台 Storage 服务，不再直接写入 `server/uploads/materials`。

- **物理后端**：业务层只依赖 `storage.Backend`；当前部署使用 `storage.root_dir` 下的共享文件系统 adapter。
- **对象元数据**：`materials.storage_object_id` 关联 `storage_objects`，对象记录保存 owner、purpose、MIME、大小与相对 key；物理路径不暴露给 HTTP handler。
- **上传与下载**：上传受大小上限和扩展名 allowlist 约束（以 OpenAPI / 服务端校验为准）；下载流式输出，可由另一 API 实例读取同一共享 backend 中的对象。
- **删除**：新对象复用统一 deletion-intent 生命周期，由 worker 幂等执行物理删除；共享 Blob 只在最后引用解除后删除。账号注销时（`storage.RequestOwnerDeletionTx`）对象元数据在注销事务内即时删除，blob 经 deletion intent 异步清理。
- **旧数据兼容**：历史 `StoragePath` 仅由 local backend 在受限的 `uploads/materials` 根目录内兼容读取/删除，新写入不得继续生成该字段。
- **多实例要求**：所有 API 与 worker 必须看到同一可读写 namespace；详见 [Docker 部署](../deployment/docker.md#多实例存储要求)。

## 审核机制

所有新上传的资料初始状态均为未审核（`is_approved = false`）。

- **可见性**：未审批的资料不会出现在普通用户的全局搜索结果或课程详情中。
- **管理员操作**：管理员可通过审批接口进行审批或拒绝。

## 下载与统计

- **下载计数**：每当用户成功调用下载接口时，系统会自动增加该资料的 `download_count`。
- **匿名化**：虽然系统记录了 `UploaderID`（用于合规溯源），但在前端展示时默认不暴露上传者的个人信息。

## 接口与搜索能力

### 搜索功能

支持多维度筛选：

- **按课程筛选**：通过 `course_uid` 精确匹配。
- **按教师筛选**：通过 `teacher_uid` 查找特定老师的资料。
- **模糊搜索**：对资料标题（`title`）进行模糊匹配。
- **分页支持**：支持标准的分页查询。

### 核心 API

- `GET /api/v1/materials`：资料列表与搜索。
- `GET /api/v1/materials/{material_uid}/download`：触发文件下载并增加下载计数。
- `POST /api/v1/materials/upload`：资料上传。

## 安全与维护

- **速率限制**：下载接口受全局限流保护（配额以实现为准）。
- **类型限制**：上传时会校验文件扩展名，防止上传可执行文件等危险附件。
- **路径隔离**：HTTP 和业务 service 不接触绝对文件路径；local backend 拒绝越出 storage root 或旧 Materials root 的 key/path。
- **就绪检查**：实例间通过共享存储哨兵校验挂载一致性；机制细节以实现为准（见 [Docker 部署](../deployment/docker.md#多实例存储要求)）。

## 相关

- [模块详解](./index.md)
- [Docker 部署](../deployment/docker.md)
- [统一搜索](./search/index.md)
