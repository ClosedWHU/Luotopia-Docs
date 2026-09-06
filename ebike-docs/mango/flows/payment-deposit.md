---
title: 支付与押金流程
sidebar_label: 支付与押金
description: 微信支付参数来源、押金状态机与免押（信用/付费）三条路径。
sidebar_position: 1
---

## 7. 支付与押金流程

### 7.1 微信支付参数来源

**小程序端从不接触商户密钥，也不自行签名。** 统一模式：

```
客户端 → POST /miniMango/v1/finance/ticket/<某业务>  { amount(分), channel:"miniMango", openid }
       ← { charge: { timeStamp, nonceStr, package, signType, sign }, ticket: { _id } }
客户端 → wx.requestPayment({
            timeStamp: charge.timeStamp,
            nonceStr : charge.nonceStr,
            package  : charge.package,        // 形如 prepay_id=wx...
            signType : charge.signType,       // 由服务端决定（MD5/HMAC-SHA256/RSA）
            paySign  : charge.sign            // 服务端用商户密钥算好的支付签名
         })
       → success / fail 都延时后 GET /miniMango/v1/finance/ticket/{ticket._id}/check
       ← { paid: bool }   // 以服务端为准
```

- `charge` 五元组原样透传，**字段名与 `wx.requestPayment` 一一对应**，客户端零加工。
- `openid` 由客户端从 `globalData.openid` 带上（后端本可凭 JWT 反查，此处冗余；也意味着 openid 是客户端可控输入）。
- `channel` 恒为字符串 `"miniMango"`，用于服务端区分小程序渠道与 APP 渠道（APP 走 `mangoebike.com` 自有支付）。
- `amount` 单位为**分**；充值档位来自 `getRegion` 的 `rechargeDiscount.rechargeAmount[]`（`{amount, rechargePresent, cornerMark, enableInMiniMango}`），`enableInMiniMango === false` 的档位在小程序内不可选（引导下载 APP）。`pages/recharge/recharge.js` 内置兜底档位 500/1000/2000/5000 分（赠 1/2/4/10 元）。
- 支付结果**双分支都查 `check`**：`success` 延时 1–2s 查，`fail` 也延时查（用户可能在收银台完成但 JS 回调判失败）。`pages/cardProduct` 与 `utils/promoRideCard` 还带重试（分别最多 4 次 ×1.5s、1 次）。
- `utils/util.js` 里的 `payfor`（`api.mch.weixin.qq.com/pay/unifiedorder`）与 `wxPay`（`/finance/ticket/wxPay`）两个 key **从未被调用**，是历史残留；`access_token` key 里还留着 `appid=APPID&secret=APPSECRET` 占位符，说明早期版本曾考虑客户端直连微信 API，现已放弃。

调用 `charge` 的业务入口共 8 个：`balance`(充值/补付)、`deposit`(押金)、`freeDeposit`(免押卡)、`freeDepositAndCommutingCard`(免押+通勤套餐)、`commutingCard`(通勤卡)、`commutingCard/seasonCard`(季卡)、`cardProduct`(骑行卡)、`charteredEbikeCard`(包车卡)。`pages/deposit/deposit.js` 与 `pages/commutingCard/commutingCard.js` 各自实现了 `successCallback`，`utils/promoRideCard.js` `payPromoRideCard` 是最新的统一封装（Promise 化，错误码 `not_login` / `invalid_card` / `order_fail` / `unpaid` / `cancel`）。

商城订单支付（`/mall/order/{id}/pay`）在缺失的 shopping 分包里，无法确认是否复用同一 `charge` 结构。

### 7.2 押金状态机

`utils/dataBase.js` 的 `depositState` 枚举（服务端 `clientShowState` / `wallet.deposit.paid` 的取值）：

| 值 | 含义 | 前端行为 |
|---|---|---|
| 0 | 未交纳 | 扫码时跳 `pages/deposit/deposit`；`checkIndexStatus` 里若 `!enableRegionDeposit && !enableFreeDepositAndCommuting` 则提示「交纳押金，开始用车」 |
| 1 | 可自动退款 | `pages/refund/refund.js` 走 `depositRefund` 自动退 |
| 2 | 需手动退款 | 弹窗「由于支付商原因，您的押金不能自动退款，请联系客服进行退款」→ 客服 `400-023-8906` |
| 3 | 退款中可撤销 | 显示 `deposit.ticket.refund.amount` 与 `willProcessAt`；可调 `cancelDepositRefund` |
| 4 | 退款中不可撤销 | 同上但无撤销按钮 |
| 5 | 退款失败 | — |
| 6 | 冻结中 | `showRefundTipView` 里 toast「骑行中不能申请退押金」 |
| 7 | 免押卡免押 | 账户页显示「已免押」；`showRenewal` 检查 `freeDeposit.isFreeDepositWarning` → 弹续费提示（`remainDays`） |
| 8 | 交押金且充值免押 | — |
| 9 | 只充值免押 | 账户页显示「已充值免押」 |

`pages/index/index.js` `linkToDepositPage` 的跳转映射：`0 → deposit?needBuyType=deposit`，`3/4 → refund`，`[0,7,9,3,4,5]` 之外一律按 `3` 处理（→ `refund`），兜底 `deposit`。

退款前置校验（`pages/refund/refund.js` `showRefundTipView`）：`balance < 0` → 「您的车费余额不足，请下载芒果电单车APP进行充值后再退款」（小程序内不给退，导流 APP）。退款金额显示：状态 3/4 用 `deposit.ticket.refund.amount`，否则用 `deposit.amount`；到账时间 `backtimeValue + backtimeUnit`，兜底 `backtime + "个工作日"`。

### 7.3 免押（信用/付费）三条路径

`pages/loginPre/loginPre.js` `checkCityPermissions` 与 `pages/index/index.js` 同名方法根据 `GET /operation/city` 的返回决定押金形态：

```js
globalData.freeDepositWay       = n[0].freeDepositWay;
globalData.showText             = n[0].showText;
globalData.enableMiniDepositCard= n[0].enableMiniDepositCard;   // 小程序内可买免押卡
globalData.enableMiniDeposit    = n[0].enableMiniDeposit;       // 小程序内可交押金
globalData.depositWay = (enableMiniDepositCard && enableMiniDeposit) ? n[0].miniDepositOption
                      :  enableMiniDepositCard ? false            // 只能买卡
                      :  true;                                   // 只能交押金
```

`pages/deposit/deposit.js` 的分支（`_goToPayDeposit`）：

```
needBuyType === "deposit"（从扫码/首页强制进入）
├─ depositWay === true  → POST /finance/deposit            { channel, openid, depositAmount: regionDepositAmount }
├─ freeDepositAndCommutingCard.enable === true
│                        → stillBuyCard()
│                            ├─ activeClass === "freeDepositAndCommutingCard"
│                            │     → POST /finance/ticket/freeDepositAndCommutingCard { amount, channel, openid, regionId }
│                            └─ 否则（选中某张通勤卡）
│                                  → POST /finance/ticket/commutingCard { amount: card.actualAmount, channel, openid }
│                                    （若 validDuration ∈ {30,31} 即月卡，支付成功后轮询 /mall/gift 领赠品）
└─ 否则                  → POST /finance/ticket/freeDeposit { channel, openid, amount: freeCardPrice }
needBuyType !== "deposit"（从账户页进入）→ 直接 stillBuyCard()
```

免押卡价格来源：`GET /account/wallet` → `freeDeposit.{actualAmount, originalAmount, validDuration}`；若 `freeDeposit` 为空对象则用兜底 `freeCardPrice: 990`（9.9 元）、`originPrice: 59990`、`freeCardDuration: 7`（7 天）。页面上还硬编码了 `regionDepositAmount: 29900`（299 元）作为兜底。

扫码时的免押判定（`pages/readyUnlock/readyUnlock.js` `getStock`）：服务端在 `GET /ebike/stock/number` 里返回 `needPayDeposit: true` + `message` 时，toast 后 `navigateTo ../deposit/deposit?needBuyType=deposit`，并通过 `eventChannel.on("depositPaySuccess")` 在支付成功后**自动重放 `getStock(number)`**（`pages/deposit/deposit.js` `successCallback` 里 `getOpenerEventChannel().emit("depositPaySuccess")`，兜底调 `prevPage.payDepositEnd()`）。

`pages/index/index.js` `scannerCheckoutAccount` 的前置门禁顺序：
```
loginStatus? → (deposit !== 0 || isFreeDeposit)? → !hasUnpayOrder? → 武大授权协议弹窗? → readyUnlock
```
注意其中有一行 `g.globalData.deposit = 1`（在判断前**强行把押金态改成 1**），使 `0 !== deposit` 恒真 —— 押金门禁在首页扫码链路里实际被这行代码短路了，真正的押金校验落在服务端 `getStock` 的 `needPayDeposit`。同样的写法出现在 `checkIndexStatus()`（`t.globalData.deposit = 1`）。这看起来是运营侧临时放开小程序押金门槛的改动，属于**前端校验形同虚设**的典型例子（服务端仍是最终裁决者）。

信用相关：`pages/credits/credits.js` 展示 `user.credit` 与 `GET /account/credit` 流水；`cancelMustNeedHelmet` 的弹窗文案明确「若发现多次恶意申请行为，将影响您的信用评分」；`illegalParkValid` 的违停停用三天也是信用体系的一部分。**未发现基于微信支付分/芝麻信用的免押接口**（`freeDepositWay` 由运营区配置决定，免押是付费卡模式而非信用免押）。
