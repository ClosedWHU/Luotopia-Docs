---
title: 设置 / 消息 / 客服 / 埋点接口
sidebar_label: 设置与埋点
description: 区域说明、使用说明、评价标签、广告位、企业微信客服、前端异常回捞与自建埋点上报接口。
sidebar_position: 6
---

## 5.6 设置 / 消息 / 客服 / 埋点

| 接口路径 | 方法 | 关键参数 | 用途 | 调用处 |
|---|---|---|---|---|
| `/miniMango/v1/setting/polygonIntro` | GET | 无 | 首页「区域说明」弹窗图例（服务区/禁行区/停车区）。`getUseRule(isNanning)` 按是否南宁决定展示 | `pages/index/index.js:2356` |
| `/miniMango/v1/setting/useInstruction` | GET | query: `regionId` | 开锁页「使用说明」条目，覆盖前端默认的 3 条 | `pages/readyUnlock/readyUnlock.js:510` |
| `/miniMango/v1/setting/userComment` | GET | 无（`MGTripSettlePanel` 带 `other:{silent:true}`） | 评价标签 `{positive:[], negative:[]}`；≥5 星用 positive，否则 negative | `components/MGTripSettlePanel/MGTripSettlePanel.js:105`；`orderComponents/comment/comment.js:29` |
| `/miniMango/v1/setting/shopping` | GET | 无 | 首页广告位（视频号/直播）：`[{_id,type(1视频/2直播),sphId,videoNo,...}]`，配合 `wx.getChannelsLiveInfo`/`getChannelsLiveNoticeInfo` 决定按钮文案 | `components/ShoppingAd/ShoppingAd.js:93` |
| `/miniMango/v1/setting/wxkfAccount/getOne` | GET | query: `region`(=regionId) | 取微信客服（企业微信客服）账号 → `{data: thirdId}` → 传给插件组件 `<cell plugid="{{wxkfId}}">`。仅当 `globalData.regionKfType === "qywx"` 时启用；首页有 1s 轮询直到拿到 | `pages/index/index.js:304`；`pages/account/account.js:295` |
| `/miniMango/v1/setting/wxkfAccount/usedIncre` | GET | query: `thirdId` | 客服会话结束后使用计数 +1（插件 `bind:completemessage` 回调里触发） | `pages/index/index.js:2601`；`pages/account/account.js:338` |
| `/miniMango/v1/record/feedBack` | POST | body: `source:"miniMango"`，`path`(失败接口路径)，`frontData:{method, body}` | **前端异常/失败请求回捞**。目前唯一调用点是实名认证失败，会把姓名+身份证号一并上报。该接口在错误处理里被显式豁免 toast | `pages/auth/auth.js:60` |
| `/miniMango/v1/record/shopping/collecting` | GET | 无 | 我的收藏列表（视频号/直播收藏项，含 `showMsg` 状态） | `pages/shoppingList/ShoppingList.js:13` |
| `/miniMango/v1/record/shopping/collecting` | POST | body: `goodsId` | 收藏广告位商品 → 成功后跳「我的收藏」 | `components/ShoppingAd/ShoppingAd.js:21` |
| `/miniMango/v1/systemReport/collection` | POST | body: `records:[{event_type,event_code,clientTime(ISO),page(route),content(任意对象),region(regionId)}]` | **自建埋点批量上报**。`track()` 入队，满 10 条或页面 `onHide`/`onUnload` 时 `flush()`；`flush` 每次 `splice(0,50)` 分批。回调为空（fire-and-forget）。已见 `event_code` 前缀 `mini:package:business:recommendParkingLot:*`（`planNav`/`setDiscountParking`/`setNearParking`/`setTargetFailed`/`hadDiscount`/`searchTarget`/`cancelAfterPlan`）与 `custom` 类型 | `utils/monitor/systemMonitor.js:5` |
