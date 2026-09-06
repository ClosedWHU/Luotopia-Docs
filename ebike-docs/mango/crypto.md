---
title: 报文加密（mg-dvi 与 joker）
sidebar_label: 报文加密
description: 设备信息 mg-dvi 的 AES-256-CBC 加密、响应体 joker 解密机制与硬编码密钥汇总。
sidebar_position: 4
---

源文档 §4 的签名小节（4.1–4.4、4.6、4.9、4.10）与 §9.7、附录 B 见[请求签名](./signing.md)。

## 4.5 设备信息 `mg-dvi`（AES 加密）

| 项 | 值 |
|---|---|
| 算法 | `AES-256-CBC`，`PKCS7` 填充 |
| 密钥 | **硬编码 `<已脱敏：AES-256 key，32 位字符串>`**（32 ASCII 字符 → `enc.Utf8.parse` → 32 字节 → AES-256） |
| IV | **硬编码 `<已脱敏：AES IV，16 位字符串>`**（16 ASCII 字符 → 16 字节）。**固定 IV，不随请求变化** |
| 明文 | `JSON.stringify(M)`，`M` 见下 |
| 输出编码 | `ciphertext.toString()`（hex）→ `enc.Hex.parse` → `enc.Base64.stringify`，即 **Base64(原始密文字节)**。中间绕 hex 一圈是无意义但无害的等价变换 |
| 输出位置 | HTTP header `mg-dvi` |

`M` 的字段（全部按 `&&` 短路条件填充，falsy 字段直接缺席）：

```
固定： endpoint: "mini",  plat: "miniMango"
定位： lat, lng, accuracy, altitude, horizontalAccuracy, speed, verticalAccuracy   ← globalData.location（wx.getLocation type:"gcj02"）
系统： SDKVersion, batteryLevel, benchmarkLevel, brand, fontSizeSetting, language,
       model, pixelRatio, platform, screenHeight, screenWidth, statusBarHeight,
       system, version, windowHeight, windowWidth                                   ← wx.getSystemInfo
业务： regionId                                                                     ← globalData.regionId（运营区 ID）
```

**实现缺陷（可用于识别/绕过）**：`wx.getSystemInfo({success})` 是**异步**的，而 `S = JSON.stringify(M)` 在同一同步执行流里立刻求值。除首次调用后 `globalData` 已被回填的情况外，**本次请求的 `M` 里通常不含任何系统字段**（只有 `endpoint`/`plat` + 已缓存的定位/regionId）。由于 `s()` 每个请求都调一次，`globalData` 会被上一次请求的回调逐步填满，因此从第二个请求起系统字段才可能出现。也就是说 `mg-dvi` 的内容在同一会话内**不稳定**，服务端不可能强校验其完整性。

同时因为 **key 与 IV 都是常量**，`mg-dvi` 只是编码而非保密：任何人拿到这两个常量即可解密任意抓包里的设备信息，也可以自行构造合法 `mg-dvi`。

## 4.7 响应体解密（`joker`）

```js
// utils/util.js dataRequest → wx.request success
if (e.data.joker) {
  n = e.data.body;
  a = t.default.enc.Utf8.parse("<已脱敏：AES-256 key，32 位字符串>");   // 32B → AES-256
  r = t.default.enc.Utf8.parse("<已脱敏：AES IV，16 位字符串>");                   // 16B IV
  c = t.default.AES.decrypt(n, a, { iv: r, mode: t.default.mode.CBC,
                                    padding: t.default.pad.Pkcs7 })
        .toString(t.default.enc.Utf8);
  s = JSON.parse(c);              // 解密后的真实业务 JSON
  console.log(m, s);              // ← 明文 URL + 明文响应直接进 console
  l = e.statusCode;
} else { s = e.data; l = e.statusCode; }
```

| 项 | 值 |
|---|---|
| 触发条件 | 响应 JSON 顶层存在真值字段 `joker`；密文在 `body` 字段 |
| 算法 | `AES-256-CBC` / `PKCS7` |
| 密钥 | **硬编码 `<已脱敏：AES-256 key，32 位字符串>`** |
| IV | **硬编码 `<已脱敏：AES IV，16 位字符串>`**（固定） |
| 密文编码 | 直接把 `body` 字符串交给 `AES.decrypt` → CryptoJS 按 **Base64** 解析（非 OpenSSL `Salted__` 格式） |
| 方向 | 服务端 → 客户端（**下行**）。上行 body 从不加密 |

要点：
- 客户端**没有任何开关**去请求加密响应；`joker` 完全由服务端决定（可能对特定接口/特定灰度用户开启）。已还原代码中找不到哪些接口会被加密。
- 解密结果会 `console.log(完整URL, 明文响应)`，配合 `app.json` 的 `"debug": true`，真机 vConsole 里可直接读到全部明文业务数据。
- 与 `mg-dvi` 用的是**两组不同的 key/IV**：上行设备信息一组、下行响应体一组。

## 4.8 硬编码密钥汇总

| 常量 | 长度 | 算法角色 | 位置（`utils/util.js`） |
|---|---|---|---|
| `<已脱敏：HMAC-SHA256 密钥，32 位字符串>` | 32 | HMAC-SHA256 签名密钥 → `mg-sig` | `s()` 内，`HmacSHA256(f, ...)` |
| `<已脱敏：AES-256 key，32 位字符串>` | 32 | AES-256 密钥（上行设备信息） | `s()` 内，`mg-dvi` |
| `<已脱敏：AES IV，16 位字符串>` | 16 | AES CBC IV（上行设备信息，固定） | `s()` 内，`mg-dvi` |
| `<已脱敏：AES-256 key，32 位字符串>` | 32 | AES-256 密钥（下行响应体） | `dataRequest()` 内，`joker` 分支 |
| `<已脱敏：AES IV，16 位字符串>` | 16 | AES CBC IV（下行响应体，固定） | `dataRequest()` 内，`joker` 分支 |
| `<已脱敏：第三方地图 token，32 位十六进制>` | 32(hex) | 第三方 geovisearth API token（**明文放 query**） | `packages/business/pages/recommendedParkingLot/recommendedParkingLot.js` |
| `<已脱敏：IM channel-no>` | 32 | 承满点在线客服 `channel-no` | `utils/dataBase.js` `webUrl["联系客服"]` |
| `5a13efac0981ade231fa6fad1f95d9e4` | 24(hex) | 「武汉大学信息对外提供授权」licenseId（硬编码业务 ID） | `pages/index/index.js`、`pages/readyUnlock/readyUnlock.js`、`pages/previewVideo/previewVideo.js` |
| `a9abdf3174c0af1037ffba3b2dd6581a` | 32 | 「骑行规则视频已观看」licenseId | `pages/index/index.js` `getUserInfo` |
| `ffffffffffffffffffffffff` | 24 | 占位 ID（工单列表页默认值） | `packages/business/pages/workOrderList/workOrderList.js` |
| `79505334` | — | 企业微信插件埋点 kv（非业务） | `lib/util/index.js`、`components/cell/cell.js` |

**未发现**：RSA / SM2 / SM4、MD5 / SHA1 业务用法、动态密钥协商、密钥白盒、`wx.getRandomValues`、时间戳对齐/nonce、一机一密。`utils/crypto-js.js` 打包了 `MD5, SHA1, SHA256, SHA512, HmacMD5, HmacSHA1, HmacSHA256, AES, DES, TripleDES, Rabbit, RC4, PBKDF2, EvpKDF` 全套，但业务只引用 `HmacSHA256` + `AES` + `enc.Base64/Hex/Utf8` + `mode.CBC` + `pad.Pkcs7`（其余为 tree-shaking 缺失导致的体积浪费）。
