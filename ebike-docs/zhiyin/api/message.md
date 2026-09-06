---
title: 消息 / 客服 / 帮助 / 评价接口
sidebar_label: 消息/客服/评价
description: 消息中心、FAQ、客服、订阅消息、站点申请与行程评价等 19 个接口的能力类别摘要（完整清单存档于私有仓）。
sidebar_position: 11
---

## 消息 / 客服 / 帮助 / 评价能力类别

本组约 19 个接口，存在以下能力类别：

- **消息中心**：分页列表、详情、未读判断、违规上报（暗哨）详情；
- **帮助与客服**：按服务区 FAQ 与详情、客服信息、客服电话拨打记录、AI 客服短时 token（H5 免登，见[认证与会话](../auth.md)）；
- **订阅消息**：按行为获取微信订阅消息模板；
- **配置与提示**：引导页配置、一键开关（还车弹窗等）、特殊提示、回归用户提示、无效区域弹窗判断；
- **评价**：行程评价提交、评价浮层配置——评价提交页 `pagesSub3/review/submit` 源码缺失；
- **其他**：站点（还车点）申请、全部服务区列表、观看视频广告得奖励。

调用方：`pagesSub/msgList|msgDetail|help|customerService|quesDetail|applyStation|getUserLocation|invitePolite`、主包评价浮层与订阅弹窗组件。完整接口清单存档于私有仓 `whu-ebike-re`。
