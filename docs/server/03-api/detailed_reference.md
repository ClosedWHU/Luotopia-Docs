# 详细接口调用指南

本文档旨在为前端开发者和集成方提供 Luotopia Server 的业务接口调用逻辑说明。相比 Huma 自动生成的 OpenAPI 文档，本文档更侧重于**业务流程**和**接口选择建议**。

## 1. 账号与认证

### 1.1 登录流程
- **常规登录**: `POST /api/v1/user/login` (使用用户名/密码)。
- **SSO 登录**: `GET /api/v1/user/sso/start?provider=whu` (引导用户跳转到武大认证)。
- **设备注册**: `POST /api/v1/user/device/register` (登录后务必调用，用于推送通知)。

### 1.2 认证状态选择
- 大部分接口需要 `Bearer` Token。
- 部分校园功能（如课表爬虫）需要用户在 SSO 登录后，通过后端桥接到武大系统获取数据。

---

## 2. 课程评价系统

### 2.1 搜索课程
- **场景**: 用户在首页搜索框输入关键词。
- **推荐接口**: `GET /api/v1/courses/search?q=...` (支持模糊匹配和拼音)。
- **联想建议**: `GET /api/v1/suggest?q=...` (用户输入时实时联想)。

### 2.2 提交评价与评分
- **场景**: 用户完成一门课后，想要分享心得。
- **评价提交**: `POST /api/v1/reviews` (需包含 `course_uid`)。
- **仅评分**: `POST /api/v1/courses/grade` (不需要写评论，仅提交星级)。
- **匿名逻辑**: 接口支持 `is_anonymous` 字段，保护用户隐私。

### 2.3 互动
- **点赞/踩**: `POST /api/v1/reviews/{uid}/interact` (Type: 1-赞, -1-踩, 0-取消)。
- **举报**: `POST /api/v1/reviews/{uid}/report`。

---

## 3. 校园助手

### 3.1 教室与课表
- **查空闲教室**: `GET /api/v1/classrooms/empty?campus=Main&building=B1&day_of_week=1&section=1`。
- **我的课表**: `GET /api/v1/timetable/me` (从数据库获取已同步的课表)。
- **同步课表**: `POST /api/v1/timetable/sync` (触发爬虫从教务系统更新)。

### 3.2 代理服务
- **图书馆搜索**: `GET /api/v1/campus/library/search?keyword=...`。
- **场馆预约查询**: `GET /api/v1/campus/venue/status`。

---

## 4. 学习资料

### 4.1 资料流转
- **查看资料**: `GET /api/v1/materials/search?course_uid=...` (获取某门课的所有资料)。
- **上传资料**: `POST /api/v1/materials/upload` (支持 multipart/form-data)。
- **下载计数**: `GET /api/v1/materials/{uid}/download` (获取下载地址并增加统计)。

---

## 5. 系统与维护

### 5.1 启动自检 (App 必调)
- **版本更新**: `GET /api/v1/system/update?platform=android` (检查是否有新版本及强制更新标志)。
- **远程配置**: `GET /api/v1/system/config` (获取当前可用的公告、维护状态、动态开关等)。

---

## 开发建议
1. **防抖与节流**: 搜索联想建议接口请务必在客户端做 300ms 以上的防抖。
2. **错误处理**: 统一查看 [错误码文档](./error_codes.md)，重点处理 `1002` (认证失效) 和 `1003` (权限不足)。
3. **缓存策略**: `/api/v1/system/config` 建议在 App 启动时调用一次并本地持久化，不要频繁调用。

---

## 前端实战：统一错误处理

建议在客户端使用 Axios 或 Dio 拦截器统一处理以下逻辑：

### 1. 会话失效 (401 / 1002)
当接口返回 `1002` 错误码时，表示 Access Token 已过期。
- **策略**: 尝试调用 `/api/v1/user/refresh_token`。
- **成功**: 重新发起失败的原始请求。
- **失败**: 清除本地存储，引导用户重新登录。

### 2. 权限不足 (403 / 1003)
- **策略**: 提示用户“无权访问该功能”，不要自动登出。

### 3. 频率限制 (429)
- **策略**: 提示用户“操作太快，请稍后再试”，并在客户端开启 5-10 秒的倒计时锁定按钮。

---
[返回目录](../index.md)
