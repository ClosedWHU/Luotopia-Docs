# 学习资料共享 (Learning Materials)

## 模块概述
本模块提供了一个针对武汉大学课程的学习资料共享平台。用户可以搜索、下载和上传相关课程的复习资料、往年试卷或课件。

## 核心逻辑
### 1. 存储策略
目前采用本地文件系统存储（`server/uploads/materials`）。未来计划扩展至 S3 兼容的对象存储（MinIO/阿里云 OSS）。

### 2. 审核机制
所有新上传的资料初始状态均为 `is_approved = false`。
- 用户可在客户端看到“审核中”状态。
- 管理员可通过 Admin 接口进行审批。
- 未审批资料不会出现在全局搜索结果中。

### 3. 匿名化
资料记录了 `UploaderID` 用于合规溯源，但在前端接口中默认以匿名形式展示。

## 接口说明
- `GET /api/v1/materials`: 联想搜索资料。支持按 `course_uid` 或 `teacher_uid` 过滤。
- `GET /api/v1/materials/{uid}/download`: 获取资料。服务端通过 `Content-Disposition` 引导浏览器下载。
- `POST /api/v1/materials/upload`: 使用 `multipart/form-data` 上传文件。

## 安全提示
资料下载接口目前支持公开访问，但大流量下载可能触发速率限制。
