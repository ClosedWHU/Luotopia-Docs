---
title: 已定义但无法定位调用点的接口
sidebar_label: 未定位调用点
description: shopping 分包源码缺失导致无法确认调用参数的商城/地址接口，及主包跳转入口线索。
sidebar_position: 7
---

## 5.7 已定义但无法定位调用点的接口

`packages/shopping` 分包（实物商城）**无源码**：该分包的 wxapkg 不在微信包缓存中（微信仅在进入分包页面时按需下载该分包），也没有自己的 `app-service.js`（`packages/shopping/` 目录下无该文件，主包 `app-service.js` 里也只有 `$gwx` 模板注册、没有 JS 逻辑）。因此以下接口的**调用参数无法确认**，只能从 `utils/util.js` 的定义与主包跳转入口反推：

> PC 与 Android 端的微信小程序包缓存中，芒果 v235 均只有三个 wxapkg：主包 `_-1409222177_235`（139 项，含 `__plugin__`）、主包的无插件变体 `_118906466_235`（115 项）、business 分包 `_1652330330_235`（14 项），无 shopping 分包。`pagesidx/wxbd322b1a1127faee_235.idx` 中的 shopping 页面路径来自服务端下发的页面索引，不含代码。商城/地址类接口的参数需进入商城页面抓包确认。

`mallGoodsDetail`、`mallOrder`、`mallOrderDetail`、`mallOrderPay`、`mallOrderCancel`、`mallOrderRefund`、`mallOrderConfirm`、`addressDetail`、`addressDefault`。

主包进入该分包的入口（可作为参数线索）：
- `pages/account/account.js:50,56` → `/packages/shopping/pages/addressList/addressList`、`/packages/shopping/pages/mallOrderList/mallOrderList`
- `pages/deposit/deposit.js:222,248,297,325` 与 `pages/cardProduct/cardProduct.js:434` → `shopDetail?goodsId=<id>[&mode=view]`、`mallOrderDetail?id=<orderId>`、`addressEdit[?first=1]`
- `app-config.json` 页面标题：收货地址 / 新建收货地址 / 商品详情 / 确认订单 / 商城订单 / 订单详情
