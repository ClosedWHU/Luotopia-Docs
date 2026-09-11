---
title: 功能模块地图
sidebar_label: 功能模块
sidebar_position: 14
description: 已实现与开发中能力一览（对照 app/README）
---

以仓库 `app/README.md` 为准；下表方便导航。

## 已可用（客户端）

| 能力 | 大致位置 |
|------|----------|
| 课表（教务 / WakeUp / 编辑） | `pages/campus/sub_apps/timetable`、主页网格 |
| 成绩 | `sub_apps/score` |
| 学业状态 | `sub_apps/study_status` |
| 空闲教室 | `sub_apps/empty_classroom` |
| 座位预约 | `sub_apps/seat_reservation` |
| 运动场馆 | `sub_apps/sports_reservation` |
| E 卡 / 付款码 | `luojia_ecard`、`ecard_paycode` |
| 校园巴士 | `campus_bus` + `sub_apps/bus`；校园页卡片 vs 网格见 `campus_page` |
| 校医院报告 | `sub_apps/medical_service` + 热更新 medical 解析脚本 |
| 校园网 | `sub_apps/school_net` |
| 取水码 | `sub_apps/water_control` |
| 邮箱 / 消息 | `sub_apps/email`、`messages` |
| 智慧珞珈 | `sub_apps/zhihui_luojia` |
| 校历 | `sub_apps/calendar` |
| 天气 | `features/weather` |
| 列表 / 事项 / 提醒 | `pages/list`、`item_editor`、`item_detail` |
| AI 会话 | `pages/ai` + 设置 AI；含实时语音输入（ASR） |
| AI Agent 代付（水电 / 校园网） | `pages/ai` + `lib/toolkit` + 收银台 handoff |
| VPN（aTrust） | `sub_apps/vpn`（`flutter_sangfor`） |
| 壁纸 / 主题 | 设置相关 pages |
| 检查更新（安装包） | `features/app_update` → 官网 `GET /api/releases/latest` |
| 热更新（JS 解析脚本） | `features/hot_update` → 官网 `/hot-update/manifest.json` |

## 进行中 / 占位

| 能力 | 说明 |
|------|------|
| 图书借阅 | 与座位预约不同；可能仅占位 |
| 蹭课 | 占位已移除；依赖全校课表与本地空闲时段 |
| 学习资料共享 | 入口可能存在，完整能力随版本 |

### 论坛

服务端 `forum` 域已有；客户端 `features/forum/` 含列表、帖子、通知、个人帖、管理等页面。默认 **导航隐藏** 论坛 Tab，用户可在导航设置中打开。以当前构建与后端可达性为准。

做新校园子应用时：完整闭环（入口、路由、页面、data、错误态），不要只挂空入口。

## 相关

- [校园功能开发](./campus.md)
- [更新与热更新](./updates.md)
- [目录结构](./project-structure.md)
- [用户指南](pathname:///user/)
