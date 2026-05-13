# 即时通讯

`internal/chat` 模块负责处理用户之间的实时消息传递、在线状态感知以及聊天历史存储。

## 1. 核心功能
- **实时消息**: 基于 WebSocket 的低延迟消息推送。
- **消息持久化**: 所有的对话内容均存储在 PostgreSQL 中，支持分页拉取历史记录。
- **在线状态**: 实时更新用户“最后在线时间”和“当前在线”状态。
- **未读计数**: 自动维护每个会话的未读消息数，并同步至客户端 Tab。

## 2. 技术实现
- **协议**: WebSocket (由 `gorilla/websocket` 支持)。
- **同步机制**: 
    - 消息发送时，优先写入数据库。
    - 通过内部广播机制发送给当前在线的接收者。
    - 如果接收者不在线，则触发 `internal/notification` 发送推送。

## 3. API 接口
- `GET /api/v1/chat/rooms`: 获取当前用户的所有聊天会话。
- `GET /api/v1/chat/rooms/{uid}/messages`: 拉取历史消息。
- `POST /api/v1/chat/rooms/{uid}/read`: 标记消息已读。

---
[返回模块总览](./index.md)
