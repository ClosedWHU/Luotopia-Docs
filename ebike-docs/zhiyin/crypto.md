---
title: 加密模块
sidebar_label: 加密模块
description: 微信支付分签名死代码、AES-CBC 通用加解密、蓝牙指令层「加密」（自研校验和）、日志脱敏与加密原语清单。
sidebar_position: 4
---

## 微信支付分客户端签名——确认为死代码

包内存在一个微信支付分客户端签名函数（mch_id/nonce_str 等字段拼接后 HmacSHA256），但全库（含两个分包）**零调用**；其所在模块的唯一引用是一处副作用空导入（逗号表达式丢弃返回值，webpack 打包遗留）→ **确认死代码**。

支付分相关的真实链路中，确认订单参数（`wx.openBusinessView` 所需的 mch_id、package、timestamp、nonce_str、sign 等）**全部由服务端签发给客户端**，客户端不参与支付分签名（正面观察）。真实页面：`pagesSub/wxPayScore/wxPayScore.js`（授权开关）、`pagesSub/wechatCreditScore/wechatCreditScore.js`（展示）、`pagesSub2/pay/wechatPayScoreOrder.js` 与 `payScoreOrder.js`（支付分订单结算，3s 轮询订单状态）。

## AES-CBC 通用加解密（有实际调用方）

通用加解密模块以字节数组混淆方式在包内硬编码 16 字节 ASCII 口令与 8 字节盐（值已脱敏；混淆还原配方存档于私有仓 `whu-ebike-re`），经**单轮 PBKDF2-SHA256** 派生 256 位密钥，IV 直接复用口令前 16 字节（弱点：非规范密钥派生、IV 与口令同源），提供 AES-256-CBC 的 encryptText/decryptText。

**两处调用方（均在 pagesSub2）**：

1. **实名信息解密（无条件生效）**：`pagesSub2/verified/verified.js` —— 服务端返回的实名字段为密文（encryptionAuthName/encryptionAuthNo），页面用该模块本地解密后展示姓名/身份证号。**含义**：用户姓名与身份证号在传输层仅由这把硬编码于客户端的 AES 密钥「保护」（弱点类别：密钥分发边界失守，加密等同明文下发）。提交实名时又把密文字段原样回传（单次实名引用模式）。
2. **短信登录敏感字段加密（配置开关，知音未启用）**：`pagesSub2/smsVerification/smsVerification.js` —— ext `security:true` 时对登录手机号/验证码加密后提交；知音 ext 为 `security:false`，当前走明文（见[登录流程](./auth.md)），该分支仅为其他租户/未来开关保留。

硬编码口令/盐已随包泄露，且被服务端用于实名信息加密——**属实际可利用的密钥暴露**（值与定位信息存档于私有仓 `whu-ebike-re`）。

## 蓝牙（BLE）指令层「加密」（自研校验和）

存在两类锁协议（TBIT / 小安自研），命令层为**自研校验和 + 字符替换表**而非现代加密；操作 token 均由服务端下发（真正的鉴权在 token 上）。帧格式、指令码表、GATT 服务/特征 UUID、校验和构造、设备号匹配规则与 token 端点等协议细节已移入私有仓 `whu-ebike-re`。

弱点评估：

- 指令层无加密与防重放设计，安全性完全依赖 token 保密性；
- BLE 日志会把**蓝牙 token 原文**上报到厂商日志服务器（见下节日志脱敏），token 保密性在日志通道失守；
- 存在取 token 失败时的**兜底占位 token**（值已脱敏），属实现质量缺陷；
- BLE 开锁前后均有服务端权限校验与结果上报兜底（前置校验 + 开锁/还车/临停结果上报，见[车辆控制流程](./flows/unlock-return.md)），纯蓝牙重放不能绕过服务端订单闭环。

## 日志脱敏与域名打码

- 日志中手机号打码（保留前 3 后 4）、姓名打码（首尾保留）；
- 日志内 URL 域名替换为短标识，属日志脱敏而非通信加密；
- 但 BLE 日志会把**蓝牙 token 原文**随日志参数上报到日志服务器（弱点：凭据泄露至日志通道，且该路径不受日志级别开关限制）；请求层在调试日志级别下会把完整请求头（含 Authorization 与签名头）写入日志（弱点：凭据日志开关，知音生产配置为 info、发布版默认不触发，见[其他发现](./findings.md)）。

## 加密原语清单（CryptoJS 打包于 `common/vendor.js`）

| 算法 | 实际用途 |
|---|---|
| SHA256 | 请求头签名（见[请求与签名](./signing.md)）、第三方广告独立签名 |
| MD5 | 设备指纹 openid 摘要 |
| HmacSHA256 | 微信支付分客户端签名（**死代码**，见本页首节） |
| AES（CBC/ECB 核心） | 通用加解密（实名解密 / 登录加密开关，见上文） |
| Base64 / Utf8 | 认证头编码 |
| PBKDF2-SHA256 | AES 密钥派生（单轮） |
| CRC16 + 字符替换表 | 蓝牙帧校验（协议细节存档于私有仓） |
| RSA / SM2 / SM4 | 全库未检出 |
