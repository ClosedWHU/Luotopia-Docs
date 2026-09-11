---
title: 认证与会话
sidebar_label: 认证与会话
description: 凭据存储、JWT 会话模型与三种登录方式类别、实名认证、会话失效自动重登与凭据携带方式（端点链与参数细节存档于私有仓）。
sidebar_position: 2
---

## 凭据存储

业务侧**完全不使用** `lib/storage/storage.js`（那是企业微信插件的 `WEWORK_STORAGE_CACHE` 命名空间存储），而是直接用 `wx.setStorageSync` / `getApp().globalData`：

| storage key | 内容 |
|---|---|
| `token` | 后端签发的 **JWT**，即 `Authorization: Bearer <jwt>` 的值 |
| `openid` | 微信小程序 openid（由**芒果后端**返回，不是本地解密得到） |
| `sessionKey` | 微信 `session_key`，**由后端下发到客户端并落盘**（弱点，见[隐私与合规观察](./findings.md#隐私与合规观察)） |
| `doubleBraceNoPrompt` / `announceNoPrompt` / `rejectedOrdersPop` | UI 提示「不再提醒」标记 |
| `WHShowDialogNotFirst` / `WHTourViewedRuleVideo` | 武汉大学信息授权协议、骑行规则视频已看标记 |
| `sp_notice_<noticeId>` | 视频号直播预约状态 |
| `WEWORK_STORAGE_CACHE` / `WEWORK_NS_KEY` | 企业微信插件会话（插件专用，与业务 JWT 完全独立） |

`globalData`（`app.js`）中与会话/风控相关的字段：`token, openid, sessionKey, userId, tel, userTel, loginStatus, hasVerified, deposit, balance, mangoBalance, regionId, center, location, scene, isNanning, isWuHan, isDongxihu, operationPattern, parkingPattern, dispatchCost, outRegionDispatchCost, enableDispatchCost, enableWxPay, enableMangoBalance, enableRecharge, rechargeAmount, enableRegionDeposit, enableDepositRefund, enableFreeDepositAndCommuting, freeOrderTimeLimited, regionKfType, stockSearchRadius, hasUnpayOrder, hasUnPayAmount, isFreeDeposit, freeDepositWay, depositWay, scanCode`。

## 会话模型

整体为 **JWT 会话模型 + 静默续期**：启动时从 storage 回填 token；会话失效时由请求层触发一次自动重登（见下文）。登录/续登共用**同一个 token 端点**，靠 body 字段区分三种登录方式；登录请求**必须携带经纬度**（业务上用于归属运营区），定位失败则登录失败。端点链、grant 参数与返回体结构存档于私有仓 `whu-ebike-re`。

## 三种登录方式

1. **静默登录（openid → JWT）**：App 启动即触发、用户无感——`wx.login` code 交服务端换取 openid 与 session_key 落盘，再以 openid（附定位）换 JWT。**弱点：服务端向客户端下发 `session_key` 并持久化**（session_key 本应仅存服务端）；另有仅探测账号是否已注册的只查不换分支。
2. **微信手机号一键登录**：`getPhoneNumber` 回调的 encryptedData/iv 连同**客户端落盘的 sessionKey** 提交服务端解密出手机号，再换 JWT。安全观察：客户端把 `session_key` 回传后端属冗余/设计遗留（后端本自持有）；手机号经 `wx.reportEvent` 上报微信自定义分析（逆序 + `_` 拼接，弱去标识化）。登录成功后未实名 → 强制跳实名页。
3. **短信验证码登录**：发送短信/语音验证码（60 秒倒计时限制重发）→ 提交 **4 位数字**验证码（第 4 位输满自动提交，节流 1s；弱点类别：验证码空间小）。

## 实名认证

`pages/auth/auth.js`：姓名 + 身份证号以**明文 JSON body** 提交（依赖 HTTPS 与请求签名，body 本身不加密），证件类型固定为身份证。

- **弱点**：认证失败时，姓名 + 完整身份证号会作为前端异常回捞数据**二次上报**到反馈记录端点，失败凭证二次落库，个人信息处理面扩大（见[隐私与合规观察](./findings.md#隐私与合规观察)）。
- 实名门禁：已登录未实名时全局弹窗拦截并引导至实名页；扫码开锁链路（首页与开锁页）都先过此门禁。

## 登录校验页 `pages/loginPre/loginPre.js`

历史上是启动页（`app.json` pages 数组第 2 项），现 `onShow` 无条件 `reLaunch` 到首页，实现已退化为**跳板**：仅保留扫码进入时把车牌号写入全局状态的逻辑；页内遗留的 token 校验、定位、城市权限、运营区数据等方法不再被调用（同名逻辑已搬到首页）。它仍是**登出/注销后的落地页**。

真正的「登录校验」发生在首页：按 登录态 → 押金 → 实名 → 余额 顺序决定顶部提示条并引导跳转；扫码门禁依次检查登录态、押金/免押、未付订单，通过后才进入开锁页（其中押金门禁存在客户端短路问题，见[押金与免押路径](./flows/payment-deposit.md#押金与免押路径)）。

## 会话失效与自动重登

请求层统一错误处理：仅**用户信息接口**的 401/400 会触发自动重登（清登录缓存后重新走静默登录），且**整个进程生命周期只重试 1 次**；当前订单轮询 401、异常回捞端点与车辆报失状态会抑制错误 toast；服务端可用 `suppressToast` 字段要求前端静默。失败回调统一延迟 500ms。清缓存不清 `openid`/`sessionKey`，因此重登只需一次 `wx.login`。

## 后续请求如何携带凭据

每次请求现算 header，`Authorization` 取全局 token 拼 `Bearer`：

- 未登录时该表达式求值为空串，header 仍存在但为空——**匿名可访问的接口也会带一个空 `Authorization`**（弱点类别：接口鉴权面不齐；匿名接口清单存档于私有仓 `whu-ebike-re`）。
- token 只从 `globalData` 取，冷启动由 `onLaunch` 回填。
- **弱点**：部分 WebView 跳转把 **JWT 直接拼进 H5 URL query**（会员中心、押金购卡活动等），JWT 进入浏览器历史/Referer/日志，属凭据泄露面（见[隐私与合规观察](./findings.md#隐私与合规观察)）。

## 注销与登出

登出：清空全部本地 storage + 清登录缓存 → 重定向登录校验落地页（纯本地操作）。账号注销：调用服务端注销端点后跳转落地页。端点细节存档于私有仓 `whu-ebike-re`。
