---
title: 加密模块
sidebar_label: 加密模块
description: 微信支付分签名死代码、AES-CBC 通用加解密、蓝牙指令"加密"、日志脱敏与加密原语清单。
sidebar_position: 4
---

## 4.6 微信支付分客户端签名（模块 `b647`）——确认为死代码

```js
// common/vendor.js 模块 "b647"（全文）
createWechatSign(mch_id, service_id, out_request_no, timestamp, nonce_str, sign_type, key) {
  var s = "mch_id="+mch_id+"&nonce_str="+nonce_str+"&out_request_no="+out_request_no
        + "&service_id="+service_id+"&sign_type="+sign_type+"&timestamp="+timestamp+"&key="+key;
  return HmacSHA256(s, key).toString().toUpperCase();     // 模块 "ed53"=CryptoJS HmacSHA256
}
```

全库（含 `pagesSub`/`pagesSub2`）对 `createWechatSign` **零调用**；`b647` 的唯一引用是 `pagesSub/wechatCreditScore/wechatCreditScore.js` 中的副作用空导入 `c=(t("b647"), …t("88bc"))`（逗号表达式，返回值被丢弃，webpack 打包遗留）→ **确认死代码**。支付分相关真实页面：
- `pagesSub/wxPayScore/wxPayScore.js`（支付分授权开关页）：`wx.login` → `getScorePermissionRecord({code})`（`authorization_state==="AVAILABLE"` 判定已开通）、开关开启 → `scorePermission({code})` → `wx.navigateToMiniProgram({appId:"wxd8f3793ea3b935b8", path:"pages/use/enable", extraData:{apply_permissions_token:data}})`、关闭 → `closeScorePermission({code})`；
- `pagesSub/wechatCreditScore/wechatCreditScore.js`（支付分展示页，mixin `88bc`）；
- `pagesSub2/pay/wechatPayScoreOrder.js`、`pagesSub2/pay/payScoreOrder.js`（支付分订单结算页，mixins `90b5` payMoney/`1e5c`/`88bc`，onShow 起 **3s** `setInterval(refreshOrder)` 轮询订单）。

另有服务端签发的支付分确认参数：`wx.openBusinessView({businessType:"wxpayScoreUse", extraData:{mch_id, package, timestamp, nonce_str, sign_type:"HMAC-SHA256", sign}})`——sign 由后端 `createOrderConfirm` 返回（`signStr`），客户端不计算（模块 `7c9e` gotoWechatBussinessConfirm）。

## 4.7 AES-CBC 通用加解密（模块 `aef2`，有实际调用方）

```js
// common/vendor.js 模块 "aef2"（摘录）：密钥/盐用 XOR(0x5A) 字节数组混淆
password = [<字节数组，每字节 XOR 0x5A 还原>].map(b => b ^ 90) = "<已脱敏：AES 口令>"   // 16 字节 ASCII 口令
salt     = [<字节数组，每字节 XOR 0x5A 还原>].map(b => b ^ 90) = "<已脱敏：AES 盐>"     // 8 字节 ASCII 盐
key = CryptoJS.PBKDF2(password, salt, {keySize: 8 /*=256bit*/, iterations: 1, hasher: SHA256});
iv  = CryptoJS.enc.Utf8.parse(password);                    // AES 口令前 16 字节
encryptText: AES.encrypt(text, key, {iv, mode: CBC}).toString()   // 输出 OpenSSL base64 格式
decryptText: AES.decrypt(cipher, key, {iv, mode: CBC}).toString(Utf8)
```

**两处调用方（均在 pagesSub2，`n("aef2")`）**：

1. **实名信息解密（无条件生效）**：`pagesSub2/verified/verified.js` —— 服务端返回的实名字段为密文 `encryptionAuthName`/`encryptionAuthNo`，页面用 `(0,s.decryptText)(...)` 本地解出 `decryptName`/`decryptNo` 展示（数据来自 `getUserAuthInfoListByPhone`/`getIzSupportSingleAuth` 等，`s=n("aef2")`）。**含义**：用户姓名与身份证号在传输层仅由这把硬编码 AES 密钥"保护"，而密钥/盐就打包在客户端（XOR 0x5A 混淆），拿到包即可解密任意密文——等同明文下发。提交实名时又把 `encryptionAuthName`/`encryptionAuthNo` 原样回传（单次实名 `quotePin`/`quoteTenantId` 引用模式）。
2. **短信登录敏感字段加密（配置开关，知音未启用）**：`pagesSub2/smsVerification/smsVerification.js` —— `$getCfgFun("security")` 为真时 `encryptText("+86-"+phoneNum)`/`encryptText(code)` 并附 `security` 字段（`u=n("aef2")`）。知音 ext `security:false`（`app-config.json`，DEV/TEST 默认配置同为 `security:!1`），故当前走明文 `phone`/`messageCode`；该加密分支仅为其他租户/未来开关保留（见[登录流程](./auth.md)）。

硬编码口令 `<已脱敏：AES 口令>`/盐 `<已脱敏：AES 盐>` 已泄露，且被服务端用于实名信息加密——**属实际可利用的密钥暴露**。

## 4.8 蓝牙（BLE）指令"加密"

两套车锁协议，token 均由后端下发（真正的鉴权在 token 上，指令层只有校验和/替换表，无现代加密）：

**A. 小安自研锁（imei 通道）**——模块 `f417`（SDK）+ `17bd`（传输）+ `6c2f`（指令表）+ `5217`（应答解析）：
- token：`POST /client/paas/device/getBlueToothToken {imei}` → 数值 token，转 4 字节大端（失败兜底 `[10,10,5,5]`）；
- 帧格式（`17bd.buildCmd`）：`cmd(1B) + len(1B) + token(4B) + params + checksum(1B)`，`checksum = (cmd + Σpayload字节 + len) & 0xFF`，hex 串写入特征值；
- GATT（模块 `9861`）：Service `0783B03E-8535-B5A0-7140-A304D2495CB7`，写 RX `…CBA`，听 TX `…B8`；广播匹配：advertisData 第 3 段起含 12 位 imei；
- 指令表（`6c2f`）：`START=44`（开锁）、`LOCK=43`（关锁/还车）、`PLAY_VOICE=40`（寻车铃）、`GET_STATE_INFO=42`、`GET_DEVICE_INFO=65`、`GET_LAST_BEACON_INFO=66`（道钉检测）、`GET_RFID=84`、`SET_DASHBOARD=106`、`SET_CYCLING_BACK_WHEEL=37`。

**B. TBIT 锁（carId/ecuSn 通道）**——模块 `40c2`（封装）+ `67ed`（协议栈）+ `d2c0`（帧工具）+ `90ed`（应答解析）：
- token：优先车辆详情 `ecuToken`，否则 `POST /client/rent/blue/getTbitBlueToken {carId}`；
- 鉴权帧：payload `"02 00 01 " + keyLen(1B) + token(hex小写)`；应答含 `020101` 鉴权成功 / `020100` 失败；
- 操作指令（`67ed.J`）：开锁 `03 00 02 01 00`（应答 `0300820100` 成功）、关锁 `03 00 01 01 01`（应答 `0300810100`；运动中拒绝 `0300810102`）、寻车 `03 00 04 01 01`、临时锁车 `03 00 01 01 30`、透传 `04 00 fd <len> <hex(text)>`；
- 帧头（`d2c0.header`）：`"aa" + cmd + "2" + "00" + seq + payloadLen(2B) + CRC16`；CRC16 = Modbus 变体（init 0xFFFF、查表、按位取反）；40 hex 字符（20B）分包写 `FEF6` 服务；
- 设备号匹配：广播数据 hex 的 `slice(4,13)` 经 `d2c0.encrypt()` ——**字符替换表**（hex 字符 `5A2B3C6D9E8F7410` ↔ `*+,-./0123456789`，即 charCode 42+i）变换后与 `ecuSn` 比对。

BLE 开锁前后均有服务端校验/上报：`/client/rent/blue/ridePermission`（前置，携带道钉检测结果 `result[]`）与 `/client/rent/blue/ride`、`/client/rent/blue/return`、`/client/rent/blue/tempParking`、`/client/rent/blue/endParking`（结果上报），见[车辆控制流程](./flows/unlock-return.md)。

## 4.9 日志脱敏与域名打码

- 日志中手机号打码（保留前 3 后 4：`138****1234`）、姓名打码（首尾保留）（模块 `4250` 函数 `b`）；
- 日志内 URL 域名替换为短标识（模块 `1244` 函数 `T` + 映射表 `P`，如 `ebike-client-prod2.xiaoantech.com → prod2.com`），属日志脱敏而非通信加密；
- 但 BLE 日志会把 **TBIT `_key`（蓝牙 token）原文**随 `bleParams` 上报到日志服务器（模块 `67ed` 多处 `f.log({… _key:P})`）；请求层在 `logLevel:"debug"` 时会把完整 header（含 Authorization、_s）写入日志（模块 `1244` 行 767）。知音 ext 的 logLevel 为 `"info"`，header 不上报，但 BLE key 上报路径不受 logLevel 限制。

## 4.10 加密原语清单（CryptoJS 打包于 `common/vendor.js`）

| 模块 | 算法 | 实际用途 |
|---|---|---|
| `94f8` | SHA256 | `_s` 请求签名（见[请求与签名](./signing.md)）、juju 广告签名 |
| `72fe` | MD5 | 同盾 openid 摘要 |
| `ed53` | HmacSHA256 | 微信支付分 createWechatSign（b647，**死代码**，本页 §4.6） |
| `3452`+`21bf`+`38ba`+`81bf` | AES/核心/CBC/ECB | aef2 通用加解密（verified 实名解密 / smsVerification security 加密，本页 §4.7） |
| `1132`/`f8d5` | Base64/Utf8 | Basic 认证头 |
| PBKDF2（3452 内） | PBKDF2-SHA256 | aef2 密钥派生 |
| `d2c0` | CRC16 + 字符替换表 | TBIT 蓝牙帧 |
| 无 | RSA/SM2/SM4 | 全库未检出 |
