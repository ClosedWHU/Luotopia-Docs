---
title: 认证与会话
sidebar_label: 认证与会话
description: 凭据存储、token 生命周期、登录方式类别与响应包络；端点链与请求参数细节存档于私有仓。
sidebar_position: 2
---

## 凭据存储（wx storage）

登录态经统一的 storage 封装读写（`uni.get/setStorageSync` 包装，`loginInfo` 写入时保留旧 openid）。

| storage key | 内容 | 写入点 |
|---|---|---|
| `loginInfo` | accessToken、refreshToken、openid 等（登录响应中除 pin/avatar 外全部字段） | 登录成功回调 |
| `userInfo` | pin、avatar、phone、ridingState、izAuth、serviceId、wxPayScoreType 等 | 登录成功回调/用户信息刷新 |
| `serviceId` | 当前服务区 ID（与 `userInfo.serviceId` 同步） | 用户信息刷新 |
| `openId` | wx.login code 换取的 openid（支付/人脸用） | App 启动时静默获取 |
| `configData` | 租户运行时配置 | App 启动时拉取 |
| 其他 | `scanCarId`、`bikeType`、`eBikePayAction`（防重复支付）、`hasWxPayScoreConfirmed`、`wechatPayScoreAppid`、`faceResultSuccessTime` 等（完整 key 表见[其他发现](./findings.md)） | 各处 |

## token 生命周期

- **携带方式**：所有业务请求 header `Authorization: Bearer <accessToken>`。
- **静默刷新**：响应码指示 token 过期/临期时，请求层将当前请求入队，用 refreshToken 走 OAuth2 刷新授权静默换取新 token（刷新请求走[请求签名](./signing.md)所述的 OAuth2 客户端认证），成功后合并新登录态并**自动重放**队列中的请求；失败则登出。
- **登出**：清空本地 storage（`userInfo`/`loginInfo`/`serviceId`），并按错误码分流为静默登出或弹「登录失效」跳登录页。设置页退出登录**仅清本地存储、不请求服务端登出接口**——服务端登出接口在全部已还原代码中无调用方（弱点类别：会话撤销完全依赖服务端过期策略）。
- **请求防重放窗口**：每个请求带唯一 requestId 与时间戳，发起前若已延迟 >60s 直接拦截失败（仅本地时钟校验，无服务端时钟对齐迹象）。

## 登录流程

真实登录页面在分包 `pagesSub2`（quickLogin/phoneLogin/smsVerification/phoneManager），主包同名页面仅做重定向。已还原代码中共存在以下登录路径（各路径的端点、grant_type 取值与请求参数存档于私有仓 `whu-ebike-re`）：

1. **App 启动静默取 openid**：`wx.login` code 换取 openid 存本地，只用于支付/人脸，不产生会话。
2. **微信一键登录**：`getPhoneNumber` 回调后提交登录。实现观察：仍走**旧版 encryptedData/iv 加密数据方案**而非新版 phone code；登录按钮形态配置项在包内**从未被赋值**，对应的回退分支实际不可达；js_code 每 4 分钟自动刷新保鲜。
3. **openid 快捷登录（老用户免验证码）**：拉取该微信下已绑定手机号列表后，直接以 openid + 已绑定手机号登录，**无需任何用户侧凭证**（弱点类别：身份证明仅依赖 openid 持有与服务端绑定关系）。
4. **短信验证码登录**：前置校验（含虚拟手机号拦截）→ 发送验证码（60s 倒计时，区分登录/换绑场景）→ 提交登录。代码保留了「security 加密开关」：开启时手机号与验证码经[加密模块](./crypto.md)的 AES 加密后提交；**知音 ext 该开关为 false，当前以明文提交**（弱点类别：敏感字段仅依赖 TLS）。换绑场景验证通过后走第三方绑定变更接口。
5. **多账号切换/删除**：按微信拉取已绑定账号列表，列表 ≥2 个号码才允许删除。
6. **第三方小程序免登**：仅当租户 ID 命中 `platformTenantId ∈ {1,2,5,2860}` 白名单且启动参数携带凭据时直接登录（知音 tenantId=1534，**此路径不生效**）。
7. **邀请页内嵌登录**：邀请落地页自带验证码登录，供被邀请人未登录时注册。
8. **H5 免登**：生成短时 token 拼入 AI 客服 H5 URL 经 webview 打开（弱点类别：凭据进入 URL，可能落入历史记录/日志）。

登录成功后统一拆分存储登录态、按来源参数回跳（扫码车/代付单/地图页），并上报协议同意；新用户命中奖励分组时走注册奖励流程。

## 响应包络

统一 `{success: bool, code: "00000"…, msg, data}`；请求层仅在 `success` 或特定 code 时 resolve。业务侧常见错误码：`21010` 支付需先实名、`24015` 押金重复缴纳、`24016/24017` 重复支付、开锁 `17012` 转蓝牙、`15047` 车辆未备案、`15030` 余额不足。
