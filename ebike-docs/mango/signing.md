---
title: 请求签名（mg-sig）
sidebar_label: 请求签名
description: 客户端硬编码密钥的 HMAC-SHA256 请求头签名机制概述与弱点评估；构造细节、可复现示例与复现最小要素存档于私有仓。
sidebar_position: 3
---

> [!NOTE]
> 两家均采用客户端硬编码盐值的 HMAC/SHA256 请求头签名；盐值随小程序包分发，可被离线提取（弱点类别：客户端信任边界失守）。本页仅保留机制概述与弱点评估，构造细节与复现步骤已移入私有仓 `whu-ebike-re`。设备信息 `mg-dvi` 加密、响应体 `joker` 解密与硬编码密钥类别汇总见[报文加密](./crypto.md)。

## 机制概述

全部签名逻辑集中在 `utils/util.js` 的**单个函数**内，由请求封装 `dataRequest` 逐请求调用；仓库内**没有第二处签名实现**。每个业务请求附加以下 header：

| header | 角色 |
|---|---|
| `mg-sig` | HMAC-SHA256 签名（Base64 输出），密钥为包内硬编码常量（已脱敏） |
| `mg-ts` | 毫秒时间戳（`Date.now()`，无任何服务端时钟对齐逻辑） |
| `mg-sk` | 被签名的字段名清单（query/body 前缀区分；只暴露字段名，不暴露值） |
| `mg-eyt` | 常量编码版本号（全仓库无其他取值、无分支逻辑） |
| `mg-dvi` | AES-256-CBC 加密的设备信息（见[报文加密](./crypto.md)） |

待签名串由时间戳、方法、路径段与参数值串拼接而成；路径段推导、值串构造规则与字段顺序约定存档于私有仓 `whu-ebike-re`。

## 弱点评估

- **密钥硬编码**：HMAC 密钥为 32 字符 ASCII 常量随包分发，可离线提取后伪造任意合法签名（弱点类别：客户端信任边界失守）；
- **无重放防护迹象**：时间戳纯客户端 `Date.now()`，与服务端时钟容差/有效期窗口在客户端无任何对齐逻辑；
- **falsy 值签名缺陷**：值串构造对空串/0/false/null/undefined 的处理不一致，可致不同取值产生相同签名、`undefined` 被签成字面量字符串（弱点；复现细节存档于私有仓）；
- **路径段推导缺陷**：按子串切分推导参与签名的路径，特殊 URL 形态下会退化为占位值（业务 URL 由 URL 表生成，实际不触发）；
- **死代码**：值串构造中存在计算后即丢弃的编码调用，疑为混淆/调试残留。

## 未签名的上传通道

`uploadFile` **完全不走签名函数**：上传请求只带 Bearer token，无 `mg-sig`/`mg-ts`/`mg-sk`/`mg-dvi`（弱点：上传端点无签名、无时间戳、无设备指纹，重放与伪造成本最低；端点清单见[车辆与开锁还车接口](./api/ride.md)）。另两处实现质量问题：表单字段名恒为 `file`（调用方传的 name 参数是无效装饰）；content-type 值拼写错误（`mutipart`，且会被 `wx.uploadFile` 自行覆盖）。上传响应为字符串 JSON，调用方需自行解析取 CDN 地址。

## dataRequest 调用契约

```js
dataRequest({
  url:       "<URL表 key>",        // 必填；也接受函数型 key（拼路径参数）
  method:    "GET|POST|PUT|DELETE", // 大小写混用，签名侧统一大写
  params:    { id },               // 可选；仅供函数型 key 拼路径（间接被签名覆盖）
  data:      { ... },              // 可选；GET 进 query，非 GET 进 body
  bodyParam: { ... },              // 可选；进 body
  other:     { silent, orderId },  // 历史残留：实现中被丢弃，silent 永不生效
  callback:  ({ success, result, data, response }) => {}
})
```

关键点：

- `data` 与 `bodyParam` **二选一**，同时传时 `data` 优先、`bodyParam` 被丢弃但仍参与签名（潜在不一致）；
- `other.silent` 在业务请求层被空表达式丢弃，多个调用点仍照传——**这些请求失败时依然会弹 toast**（真正消费 `silent` 的是企业微信插件的请求层）；
- 成功回调的 `data` 是已解密（若 `joker`）的业务 JSON；失败回调额外带 `response` 供还车开关等判断；
- `uploadFile({ url, filePath, params, callback })` 回调 `data` 为字符串，需自行 `JSON.parse`。

复现请求的最小要素（JWT 获取链、header 计算、密钥清单、时钟容差）已移入私有仓 `whu-ebike-re`。
