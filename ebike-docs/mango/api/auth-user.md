---
title: 登录 / 用户 / 实名 / 信用接口
sidebar_label: 登录与用户
description: 接口清单统计口径，以及登录、用户信息、实名认证、信用分、钱包押金、卡券与地址接口。
sidebar_position: 1
---

## 5.0 统计口径

`utils/util.js` 的 URL 表共 **100 个 key**，其中 2 个是外部占位（`payfor` → `api.mch.weixin.qq.com`、`access_token` → `api.weixin.qq.com`），**98 个指向 `api.mangoebike.com`**，去重后对应 **76 条固定路径 + 16 条带路径参数（`{id}`）的模板 = 92 个业务路径模板**。叠加多方法复用（`reservation` 的 POST/GET/DELETE、`coupon/exchange` 与 `shopping/collecting` 的 GET/POST、`order/order` 的 POST/GET、`workOrder` 的 POST/GET），**实际 (方法, 路径) 操作约 101 个**。

其中 **6 个 key 在已还原代码中从未被调用**（`nearStock`、`errorInfo`、`isFreeDeposit`、`wxPay`、`payfor`、`access_token`）；另有 9 个 mall/address 明细 key 只在 `packages/shopping` 分包中使用，而**该分包的 `app-service.js` 未被还原**（详见 [5.7](./uncalled.md) 与[第 8 章](../flows/unlock-return.md)）。

调用处一栏使用**已还原的页面/组件源文件**路径；`pages/index/index.js` 等主包页面在 `app-service.js` 中有等价副本，不重复列出。

约定：
- 「query」= `dataRequest({ data: {...} })`，GET 时进 URL query，非 GET 时进 body；
- 「body」= `dataRequest({ bodyParam: {...} })`；
- 「path」= `dataRequest({ params: { id } })`，仅用于函数型 key 拼路径；
- `wx.request` 的 `data` 在 GET 下序列化为 query string，在 POST/PUT/DELETE 下作为 body（默认 `application/json`）。业务代码从不显式设置 `Content-Type`。

## 5.1 登录 / 用户 / 实名 / 信用

| 接口路径 | 方法 | 关键参数 | 用途 | 调用处 |
|---|---|---|---|---|
| `/miniMango/v1/account/user/openId` | GET | query: `js_code`(wx.login code) | 用 code 换 `openid` + `session_key`（服务端调微信 jscode2session 后**把 session_key 回传客户端**） | `utils/features/user.js:85`；`app.js:37`；`pages/index/index.js:2157` |
| `/miniMango/v1/account/token` | POST | body: `miniProgramsOpenId`, `center:[lng,lat]` | 静默登录/续登，返回 `{jwt, userInfo}`（key `phoneCreateToken`） | `utils/features/user.js:114`；`pages/index/index.js:2188` |
| `/miniMango/v1/account/token` | POST | body: `miniProgramsOpenId`, `tel`, `center` | 微信手机号一键登录换 JWT（key `phoneWXCreateToken`，同路径） | `pages/login/login.js:332` |
| `/miniMango/v1/account/token` | POST | body: `tel`, `code`(4位), `miniProgramsOpenId`, `center` | 短信验证码登录换 JWT | `pages/enterCode/enterCode.js:57` |
| `/miniMango/v1/account/verify` | POST | body: `tel`；语音验证码追加 `type:1` | 下发短信/语音验证码 | `pages/enterPhone/enterPhone.js:22`；`pages/enterCode/enterCode.js:111` |
| `/miniMango/v1/account/user/decryptTel` | PUT | body: `encryptedTel`, `iv`, `sessionKey` | 服务端解密微信 `getPhoneNumber` 密文，返回 `{phoneNumber}` | `pages/login/login.js:299` |
| `/miniMango/v1/account/user` | GET | 无（签名串末段为空） | 用户全量信息：`user._id`、`user.auth.tel`、`user.cert.hasVerified`、`user.credit`、`user.licenseAllow[]`、`wallet.balance/mangoBalance`、`clientShowState`(押金态)、`freeDeposit`、`unPaidOrder`、`unPaidAmount`、`rejectedOrders[]`、`depositUpgrade`、`rechargeAmount` | `app.js:23`；`pages/loginPre/loginPre.js:75`；`pages/index/index.js:2071,2288`；`pages/account/account.js:236`；`pages/credits/credits.js:81`；`pages/recharge/recharge.js:88` |
| `/miniMango/v1/account/user/cert` | POST | body: `name`, `certNo`(身份证号), `certType:0` | 实名认证（明文提交姓名+身份证） | `pages/auth/auth.js:35` |
| `/miniMango/v1/account/user/license` | PUT | body: `id`(licenseId), `state`(bool) | 协议授权开关：武大信息对外提供授权(`5a13efac…`)、骑行规则视频已看(`a9abdf31…`) | `pages/index/index.js:847`；`pages/readyUnlock/readyUnlock.js:463`；`pages/previewVideo/previewVideo.js:78` |
| `/miniMango/v1/account/user/share` | GET | 无 | 邀请好友统计：`shareUsers`(已邀人数)、`couponCount`、`user`(shareId) | `pages/inviteFriend/inviteFriend.js:115` |
| `/miniMango/v1/account/qrcode` | POST | body: `scene`(=userId), `auto_color:true`, `is_hyaline:true` | 生成小程序码，返回 `{cdnUrl}` 供 canvas 合成分享图（key `getQRCode`） | `pages/inviteFriend/inviteFriend.js:62` |
| `/miniMango/v1/account/qrcode` | GET(默认) | `data:{}` | 同一路径的第二个 key `wxqrcode`，`onCreateQRCode` 里调用但**未传 method、未写回调**（疑似废弃/半成品） | `pages/inviteFriend/inviteFriend.js:164` |
| `/miniMango/v1/account/destroy` | PUT | body: `{}` | 账号注销 | `pages/login/login.js:205` |
| `/miniMango/v1/account/credit` | GET | query: `lastId` | 信用分变动流水（游标分页），元素 `{_id, type(0加/1减), point, name, order, createdAt}` | `pages/credits/credits.js:53` |
| `/miniMango/v1/account/credit/byOrderId` | GET | query: `orderId` | 单笔订单的信用分变动 | `pages/journeyDetail/journeyDetail.js:56` |
| `/miniMango/v1/account/wallet` | GET | 无 | 钱包与押金：`regionDepositAmount`、`backtime`/`backtimeValue`+`backtimeUnit`、`refundDepositText`、`freeDeposit{actualAmount,originalAmount,validDuration,isFreeDeposit,isFreeDepositWarning,remainDays}`、`deposit{amount,ticket.refund{amount,willProcessAt}}`、`clientShowState`（key `getWallet`） | `pages/deposit/deposit.js:342`；`pages/refund/refund.js:60,170` |
| `/miniMango/v1/account/wallet` | GET | 无 | 同路径第二个 key `freeDepositAndCommutingCard`，取 `freeDepositAndCommutingCard{enable,amount,validDuration,freeOrderNumber,freeOrderMinutes}` | `pages/deposit/deposit.js:358`；`pages/index/index.js:2056`；`pages/loginPre/loginPre.js:206`；`utils/promoRideCard.js:85` |
| `/miniMango/v1/account/wallet/depositRefund` | PUT | body: `refundReason`(原因ID), `refundReasonExtra`(其他原因文本) | 申请自动退押金 | `pages/refund/refund.js:160` |
| `/miniMango/v1/account/wallet/cancelDepositRefund` | PUT | 无 | 撤销退款申请（状态 3「退款中可撤销」） | `pages/refund/refund.js:214` |
| `/miniMango/v1/account/wallet/depositRefund/apply` | GET | 无 | 人工退款申请历史（`[{_id,state,bankName,bankCardNo,rejectReason,createdAt}]`） | `packages/business/pages/depositRefundApply/depositRefundApply.js:47` |
| `/miniMango/v1/account/wallet/depositRefund/apply` | POST | body: `name`, `tel`, `bankCardNo`(16–19位+Luhn校验), `bankName`, `alipayAccount` | 提交人工退款（银行卡/支付宝），前端做 Luhn 与手机号/邮箱正则校验 | `packages/business/pages/depositRefundApply/depositRefundApply.js:105` |
| `/miniMango/v1/account/wallet/depositRefund/WHUTour` | GET | 无 | 武汉大学游客押金状态 `{state}` | `pages/index/index.js:320` |
| `/miniMango/v1/account/coupon/couponInfo` | GET | query: `limit:100`, `skip:0` | 我的卡券列表 `{coupon:[{name,state,amount,expires}]}` | `pages/coupon/coupon.js:22` |
| `/miniMango/v1/account/coupon/exchange` | GET | 无 | 拉取兑换页配置（`onReady` 里只 `console.log` 结果） | `pages/couponExchange/couponExchange.js:24` |
| `/miniMango/v1/account/coupon/exchange` | POST | body: `code` | 兑换券码 | `pages/couponExchange/couponExchange.js:54` |
| `/miniMango/v1/account/address` | GET | 无 | 收货地址列表（赠品/商城） | `pages/deposit/deposit.js:265`；`pages/cardProduct/cardProduct.js:377` |
| `/miniMango/v1/account/address/{id}` | (未定) | path: `id` | 地址详情/编辑/删除 —— **仅定义，调用在 shopping 分包（源码缺失）** | `utils/util.js` key `addressDetail` |
| `/miniMango/v1/account/address/{id}/default` | (未定) | path: `id` | 设为默认地址 —— **仅定义，同上** | `utils/util.js` key `addressDefault` |
