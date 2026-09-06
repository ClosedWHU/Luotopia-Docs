---
title: 消息 / 客服 / 帮助 / 评价接口
sidebar_label: 消息/客服/评价
description: 消息中心、FAQ、客服、订阅消息、站点申请与行程评价等 19 个接口的完整清单与调用方标注。
sidebar_position: 11
---

## 消息 / 客服 / 帮助 / 评价（19）

调用方：`pagesSub/msgList/msgList.js`（getMsgList）、`pagesSub/msgDetail/msgDetail.js`（getMsgDetail、getSneakDetail）、`pagesSub/help/help.js`（getFaqByServiceId、getCustomerService、createCallRecord、getShortToken→AI 客服）、`pagesSub/customerService/customerService.js`（getShortToken→gotoAi webview）、`pagesSub/quesDetail/quesDetail.js`（getFaqById）、`pagesSub/applyStation/applyStation.js`（SiteApplication 还车点申请）、`pagesSub/getUserLocation/getUserLocation.js`、`pagesSub/invitePolite/inviteRules.js`（getAllService，模块 `22ce`）；主包 `components/x-review-float`（submitReview/getReviewList）、`components/x-subscribe-popup`（getSubscribeMsg）。**评价提交页 `pagesSub3/review/submit` 仍缺失。**

| 接口路径 | 方法 | 函数名 | 用途(推断) | 模块 |
|---|---|---|---|---|
| `/client/SiteApplication/SiteApplication` | POST | SiteApplication | 站点(还车点)申请 | 22ce |
| `/client/fence/serviceArea/getAll` | POST | getAllService | 获取全部服务区列表 | 22ce |
| `/client/helpConfig/evaluate/float/getEvaluateFloatConfig` | POST | getReviewList | 评价浮层配置 | 96b6 |
| `/client/helpConfig/getCustomerServiceByServiceId` | POST | getCustomerService | 按服务区获取客服信息 | 22ce |
| `/client/helpConfig/getFaqById` | POST | getFaqById | FAQ 详情 | 22ce |
| `/client/helpConfig/getFaqByServiceId` | POST | getFaqByServiceId | 按服务区获取 FAQ | 22ce |
| `/client/helpConfig/getGuidePageConfigByServiceId` | POST | getGuidePage | 引导页配置 | db47 |
| `/client/helpConfig/getOneClickSwitch` | POST | getOneClickSwitch | 一键开关配置(还车弹窗等) | db47 |
| `/client/helpConfig/getSpecialTipsByServiceIdV3` | POST | getSpecialTips | 特殊提示 V3 | db47 |
| `/client/management/wechatTemplate/listByBehavior` | POST | getSubscribeMsg | 按行为获取微信订阅消息模板 | c443 |
| `/client/messageCenter/getById` | POST | getMsgDetail | 消息中心详情 | c443 |
| `/client/messageCenter/judgeIsHaveNoReadMsg` | POST | getUnreadCount | 是否有未读消息 | c443 |
| `/client/messageCenter/page/list` | POST | getMsgList | 消息中心分页列表 | c443 |
| `/client/order/popup/invalidArea` | POST | getIsShowPopupCommon | 无效区域弹窗判断 | db47 |
| `/client/reward/rewardByWatch` | POST | rewardByWatch | 观看视频广告得奖励 | db47 |
| `/client/user/evaluate/submit` | POST | submitReview | 提交行程评价 | 96b6 |
| `/client/user/returningUser/izShowSpecialTips` | POST | getShowSpecialTips | 回归用户特殊提示 | db47 |
| `/client/userTicket/createCallRecord` | POST | createCallRecord | 客服电话拨打记录 | 22ce |
| `/ebike_operation/sneak/client/sneak_detail` | POST | getSneakDetail | 违规上报(暗哨)详情 | c443 |
