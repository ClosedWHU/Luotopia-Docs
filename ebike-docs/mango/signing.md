---
title: 请求签名（mg-sig）
sidebar_label: 请求签名
description: HMAC-SHA256 签名串构造、path 段推导、mg-sk/values 规则、未签名上传请求、可复现签名示例与 dataRequest 调用契约。
sidebar_position: 3
---

源文档 §4 的加密小节（4.5 设备信息 mg-dvi、4.7 响应体解密 joker、4.8 硬编码密钥汇总）见[报文加密](./crypto.md)。

## 4. 请求签名与加密逻辑

全部签名逻辑集中在 `utils/util.js` 的**单个函数 `s`**（美化后约 164–214 行），由 `dataRequest` 的 `header: s(a, m, r, l)` 调用。仓库内**没有第二处签名实现**。

### 4.1 原始代码（美化 + 变量重命名注释）

```js
// utils/util.js
var t = require("./crypto-js.js");           // CryptoJS
var r = "https://api.mangoebike.com";
var c = { /* 100 个接口 key → 路径，见第 5 章 */ };

// s(method, url, queryObj, bodyObj) → 请求 header
var s = function (e, i, a, r) {
  // e = method, i = 完整 url, a = query(data), r = body(bodyParam)

  var c = i.split("miniMango"),
      d = 2 === c.length ? "/miniMango" + c[1] : "./",        // ← 参与签名的“路径”
      s = JSON.parse(JSON.stringify(a || {})),                // query 深拷贝
      g = JSON.parse(JSON.stringify(r || {})),                // body  深拷贝
      u = (getApp() || {}).globalData || {};

  wx.getSystemInfo({                                          // ← 异步！见 4.5 缺陷
    success: function (e) {
      e.SDKVersion      && (u.SDKVersion      = e.SDKVersion);
      e.batteryLevel    && (u.batteryLevel    = e.batteryLevel);
      e.benchmarkLevel  && (u.benchmarkLevel  = e.benchmarkLevel);
      e.brand           && (u.brand           = e.brand);
      e.fontSizeSetting && (u.fontSizeSetting = e.fontSizeSetting);
      e.language        && (u.language        = e.language);
      e.model           && (u.model           = e.model);
      e.pixelRatio      && (u.pixelRatio      = e.pixelRatio);
      e.platform        && (u.platform        = e.platform);
      e.screenHeight    && (u.screenHeight    = e.screenHeight);
      e.screenWidth     && (u.screenWidth     = e.screenWidth);
      e.statusBarHeight && (u.statusBarHeight = e.statusBarHeight);
      e.system          && (u.system          = e.system);
      e.version         && (u.version         = e.version);
      e.windowHeight    && (u.windowHeight    = e.windowHeight);
      e.windowWidth     && (u.windowWidth     = e.windowWidth);
    }
  });

  // ── 1) mg-sk：被签名的“字段名清单” ──────────────────────────
  var l = [].concat(
        Object.keys(s).map(function (e) { return "query:".concat(e); }),
        Object.keys(g).map(function (e) { return "body:".concat(e);  })
      ).join(","),                                            // "query:a,query:b,body:c"
      m = "";

  // ── 2) 值串：按同一顺序取值 → 对象 JSON 化 → encodeURIComponent ──
  l && (m = l.split(",").map(function (e) {
    var o = e.split(":"),
        t = { query: s, body: g }[o[0]][o[1]];                // 取原始值
    "object" === typeof t && (t = JSON.stringify(t));         // 数组/对象 → JSON 字符串
    var i = encodeURIComponent(t);
    decodeURIComponent(i);                                    // ← 结果被丢弃（死代码）
    return t && encodeURIComponent(t);                        // ← falsy 值原样返回
  }).join(","));

  // ── 3) 待签名串 ──────────────────────────────────────────
  var p = e.toUpperCase(),                                    // METHOD 大写
      v = Date.now(),                                         // 毫秒时间戳
      f = [v, p, d, m].join("\n");                            // ts \n METHOD \n path \n values

  // ── 4) 设备信息明文对象 M ────────────────────────────────
  var M = { endpoint: "mini", plat: "miniMango" };
  u.location && u.location.latitude           && (M.lat                = u.location.latitude);
  u.location && u.location.longitude          && (M.lng                = u.location.longitude);
  u.location && u.location.accuracy           && (M.accuracy           = u.location.accuracy);
  u.location && u.location.altitude           && (M.altitude           = u.location.altitude);
  u.location && u.location.horizontalAccuracy && (M.horizontalAccuracy = u.location.horizontalAccuracy);
  u.location && u.location.speed              && (M.speed              = u.location.speed);
  u.location && u.location.verticalAccuracy   && (M.verticalAccuracy   = u.location.verticalAccuracy);
  u.SDKVersion      && (M.SDKVersion      = u.SDKVersion);
  u.batteryLevel    && (M.batteryLevel    = u.batteryLevel);
  u.benchmarkLevel  && (M.benchmarkLevel  = u.benchmarkLevel);
  u.brand           && (M.brand           = u.brand);
  u.fontSizeSetting && (M.fontSizeSetting = u.fontSizeSetting);
  u.language        && (M.language        = u.language);
  u.model           && (M.model           = u.model);
  u.pixelRatio      && (M.pixelRatio      = u.pixelRatio);
  u.platform        && (M.platform        = u.platform);
  u.screenHeight    && (M.screenHeight    = u.screenHeight);
  u.screenWidth     && (M.screenWidth     = u.screenWidth);
  u.statusBarHeight && (M.statusBarHeight = u.statusBarHeight);
  u.system          && (M.system          = u.system);
  u.version         && (M.version         = u.version);
  u.windowHeight    && (M.windowHeight    = u.windowHeight);
  u.windowWidth     && (M.windowWidth     = u.windowWidth);
  u.regionId        && (M.regionId        = u.regionId);

  var h, k, y, b, w, C,
      S = JSON.stringify(M),

      // ── 5) mg-sig：HMAC-SHA256 → Base64 ──────────────────
      D = t.default.enc.Base64.stringify(
            t.default.HmacSHA256(f, "<已脱敏：HMAC-SHA256 密钥，32 位字符串>"));

  return {
    Authorization: getApp().globalData.token && "Bearer " + getApp().globalData.token,
    "mg-sig": D,
    "mg-ts":  v,
    "mg-sk":  l,
    "mg-eyt": 1,
    // ── 6) mg-dvi：AES-256-CBC/PKCS7(JSON(M)) → hex → Base64 ──
    "mg-dvi": (h = S,
               k = t.default.enc.Utf8.parse("<已脱敏：AES-256 key，32 位字符串>"),  // 32B → AES-256
               y = t.default.enc.Utf8.parse("<已脱敏：AES IV，16 位字符串>"),                  // 16B IV
               b = t.default.AES.encrypt(h, k, {
                     iv: y, mode: t.default.mode.CBC, padding: t.default.pad.Pkcs7 }),
               w = b.ciphertext.toString(),          // WordArray.toString() 默认 → hex
               C = t.default.enc.Hex.parse(w),       // hex → WordArray（还原原始字节）
               t.default.enc.Base64.stringify(C))    // → Base64(密文字节)
  };
};
```

### 4.2 签名算法逐项拆解

| 项 | 值 |
|---|---|
| 算法 | `HMAC-SHA256`，输出 `Base64`（不是 hex） |
| 密钥 | **硬编码常量 `<已脱敏：HMAC-SHA256 密钥，32 位字符串>`**（32 字符 ASCII，直接作为 UTF-8 口令传入 `HmacSHA256(msg, key)`，未做 `enc.Utf8.parse`；CryptoJS 对字符串 key 内部按 UTF-8 处理，等价于 32 字节密钥） |
| 待签名串 | `f = ts + "\n" + METHOD + "\n" + path + "\n" + values`（4 段，`\n` 分隔，共 3 个换行） |
| 段 1 `ts` | `Date.now()`，毫秒级整数，**以数字形式参与字符串拼接**（无补零、无秒级截断） |
| 段 2 `METHOD` | `e.toUpperCase()`。业务代码里 method 大小写混用（`"get"` / `"GET"` / `"put"` / `"PUT"` / `"post"` / `"POST"` / `"delete"`），统一大写后签名 |
| 段 3 `path` | 见 4.3 |
| 段 4 `values` | 见 4.4；**注意：只签值，不签字段名**（字段名单独走 `mg-sk` header） |
| 输出位置 | HTTP header `mg-sig` |

### 4.3 `path` 段（变量 `d`）的推导

```js
var c = i.split("miniMango"),
    d = 2 === c.length ? "/miniMango" + c[1] : "./";
```

- `i` 是**完整 URL**（含 scheme + host）。按子串 `"miniMango"` 切分。
- 对 `https://api.mangoebike.com/miniMango/v1/order/order/finish`：切分得 `["https://api.mangoebike.com/", "/v1/order/order/finish"]`，长度 2 → `d = "/miniMango/v1/order/order/finish"`。即**去掉 origin 的纯 path**。
- 对不含 `miniMango` 的 URL（`https://api.mangoebike.com/oss/dispatchWorkOrder`）：切分长度 1 → `d = "./"`（字面量两点一斜杠）。
- 隐患：主机名或 query 里若再出现 `miniMango`（例如 body 值不影响，但 URL 上带 `?x=miniMango`）会让 `split` 长度 ≠ 2，`d` 退化成 `"./"`，签名仍可算出但与服务端约定不一致。业务 URL 由 `utils/util.js` 的 `c` 表生成，实际不会触发。
- 路径参数（`{id}`）在 `c` 表的函数型 key 里已拼进 URL，因此**参与签名**：`checkRecharge` 的 `d` 会是 `/miniMango/v1/finance/ticket/<ticketId>/check`。

### 4.4 `mg-sk` 与 values 的构造规则

```js
l = ["query:k1","query:k2", ..., "body:b1","body:b2", ...].join(",")   // → header mg-sk
m = l.split(",").map(取对应值 → 对象JSON化 → encodeURIComponent).join(",")  // → 参与 HMAC
```

规则细节：
1. **顺序**：先全部 query 字段（`data` 参数），后全部 body 字段（`bodyParam` 参数），各自按 `Object.keys()` 的插入顺序（即源码里对象字面量的书写顺序）。服务端必须按 `mg-sk` 给出的顺序复算，**不能自己排序**。
2. **前缀**：`query:` / `body:` 用于消歧（同名字段可同时出现在两处）。
3. **值序列化**：`typeof v === "object"`（含数组、`null`）→ `JSON.stringify(v)`，再 `encodeURIComponent`。例如 `center: [108.36, 22.81]` → `"%5B108.36%2C22.81%5D"`；`regionIds: ["a","b"]` → `"%5B%22a%22%2C%22b%22%5D"`。
4. **falsy 值 BUG**：`return t && encodeURIComponent(t)`。当值为 `""` / `0` / `false` / `null` / `undefined` 时，返回的是**原始 falsy 值本身**，随后被 `Array.join(",")` 转成字符串：`0` → `"0"`、`false` → `"false"`、`undefined` → `"undefined"`、`null` → `"null"`、`""` → `""`。也就是说 `zoom: 0` 与 `zoom: "0"` 签名结果相同，而 `x: undefined` 会签成字面量 `"undefined"`。
5. **死代码**：`var i = encodeURIComponent(t); decodeURIComponent(i);` —— 计算后结果未被使用，疑似混淆残留或调试遗留。
6. **空参数**：`query` 与 `body` 都为空时 `l === ""`，`m === ""`，`mg-sk` 发送空串，签名串为 `ts\nMETHOD\npath\n`（末尾仍有一个换行）。例如 `unlock`（`PUT /order/order/unLock`）、`getCurrentOrder`、`getUserInfo`、`getWallet`、`cardProducts` 等无参接口都属此类。
7. `mg-sk` 只暴露**字段名**，不暴露值；但值串 `m` 已完整进入 HMAC 输入，服务端凭 `mg-sk` + 实际收到的 query/body 即可复算校验。

### 4.6 `mg-eyt`

```js
"mg-eyt": 1
```

常量 `1`，字面推测为 “encrypt type / encoding type”，用于告诉服务端 `mg-dvi` 采用 AES-256-CBC+Base64 这一版本。全仓库无其他取值、无分支逻辑。

### 4.9 未签名的请求

`uploadFile`（`utils/util.js`）**完全不走 `s()`**：

```js
uploadFile: function (e) {
  var n = e.url, o = e.filePath, t = e.params, i = e.callback,
      a = "function" == typeof c[n] ? c[n](t) : c[n];
  wx.uploadFile({
    url: a,
    filePath: o,
    name: "file",                                   // ← 调用方传的 e.name 被忽略
    header: {
      Authorization: getApp().globalData.token && "Bearer " + getApp().globalData.token,
      "content-Type": "mutipart/form-data"          // ← 拼写错误 mutipart；且 wx.uploadFile 会自行覆盖 boundary
    },
    ...
  })
}
```

后果：
- `POST /oss/dispatchWorkOrder` 与 `POST /oss/reportedAbuse` **只有 Bearer token，没有 `mg-sig`/`mg-ts`/`mg-sk`/`mg-dvi`** → 上传通道无签名、无时间戳、无设备指纹，重放与伪造成本最低。
- 调用方普遍传了 `name: "parkingAppeal.png"` / `"dispatch.png"` / `"p0.png"`，但 `wx.uploadFile` 的表单字段名恒为 `file`，`name` 参数是**无效装饰**（服务端只能靠 `filename` 区分）。
- 上传响应是**字符串**，调用方一律 `JSON.parse(o).cdnUrl` 取 CDN 地址（`pages/index/index.js` `startPhotoAppeal`、`pages/lockBike/lockBike.js` `takePhoto`、`pages/stockHelpJob/stockHelpJob.js` `takePhoto`、`packages/business/components/mg-photo-grid/mg-photo-grid.js`）。

### 4.10 一个可直接复现的签名示例（推导）

以 `PUT /miniMango/v1/order/order/lockWithExpires`（临时锁车，`pages/index/index.js` `onLock`）为例：

```text
调用：dataRequest({ url:"temporaryLock", method:"put", bodyParam:{ expires: 40 } })
→ url    = "https://api.mangoebike.com/miniMango/v1/order/order/lockWithExpires"
→ query  = {}                     → 无 "query:*"
→ body   = { expires: 40 }        → mg-sk = "body:expires"
→ d      = "/miniMango/v1/order/order/lockWithExpires"
→ m      = encodeURIComponent(40) = "40"
→ p      = "PUT"
→ v      = 1757000000000（示例）
→ f      = "1757000000000\nPUT\n/miniMango/v1/order/order/lockWithExpires\n40"
→ mg-sig = Base64(HMAC_SHA256(f, "<已脱敏：HMAC-SHA256 密钥，32 位字符串>"))

最终 header：
  Authorization: Bearer <jwt>
  mg-sig: <base64>
  mg-ts:  1757000000000
  mg-sk:  body:expires
  mg-eyt: 1
  mg-dvi: <Base64(AES-256-CBC(JSON(M)))>
body（wx.request 对 PUT 会把 data 放 body）：{"expires":40}
```

再以带数组 query 的 `GET /miniMango/v1/operation/parkingLot/near`（`pages/index/index.js` `getParkingLots`）为例：

```text
data = { parkingPattern: 2, center: [108.36, 22.81], zoom: 16,
         regionIds: ["1905231014892"], stockSearchRadius: 200 }
mg-sk = "query:parkingPattern,query:center,query:zoom,query:regionIds,query:stockSearchRadius"
m     = "2,%5B108.36%2C22.81%5D,16,%5B%221905231014892%22%5D,200"
f     = "<ts>\nGET\n/miniMango/v1/operation/parkingLot/near\n" + m
```

## 复现请求的最小要素（源文档 §9.7）

要对 `api.mangoebike.com` 发出一个被接受的请求，需要：

1. 一个有效 JWT（`POST /miniMango/v1/account/token`，需先 `GET /account/user/openId` 拿 openid，而后者需真实 `wx.login` code）；匿名接口（`getRegion` / `checkOperationCity` / `getStock`）可带空 `Authorization`。
2. 四个 `mg-*` header 按第 4 章规则计算，其中三个常量密钥/IV 已全部在 [4.8 硬编码密钥汇总](./crypto.md) 列出。
3. `mg-ts` 与服务端时钟的容差未知（客户端无任何对齐逻辑，纯 `Date.now()`）；是否有有效期窗口需实测。
4. `mg-dvi` 因 `getSystemInfo` 竞态，最小可用形态就是 `{"endpoint":"mini","plat":"miniMango"}` 的 AES 密文（其余字段全部缺席也能通过前端逻辑，服务端是否强校验未知）。

## 附录 B：`dataRequest` / `uploadFile` 调用契约

```js
dataRequest({
  url:       "<URL表 key>",        // 必填；也接受函数型 key
  method:    "GET|get|POST|post|PUT|put|DELETE|delete",   // 缺省时 wx.request 默认 GET
  params:    { id },               // 可选；仅供函数型 key 拼路径，不参与 query/body，但参与签名？→ 不参与（见下）
  data:      { ... },              // 可选；GET 进 query，非 GET 进 body；参与签名，前缀 "query:"
  bodyParam: { ... },              // 可选；进 body；参与签名，前缀 "body:"
  other:     { silent: true, orderId },  // 整个 other 在 dataRequest 中只对应一条空表达式 `g && g.orderId;`，silent/orderId 都被丢弃
  callback:  ({ success, result: "success"|"fail", data, response }) => {}
})
```

关键点：
- `wx.request({ url, data: r || l, header: s(a, m, r, l), method: a, dataType: "json" })` —— **`data` 与 `bodyParam` 二选一**（`r || l`），同时传时 `data` 优先，`bodyParam` 会被丢弃但仍参与签名（潜在不一致）。
- `params` 只用于 `c[o](n)` 生成 URL，**不进入签名值串**；但拼进 URL 后成为 `path` 的一部分，因此间接被签名覆盖。
- `other` 在 `dataRequest` 里只对应一条空表达式 `g && g.orderId;`（求值后即丢弃），`silent` 与 `orderId` 均无效，属历史残留；真正消费 `silent` 的是企业微信插件的 `lib/request/request.js`。但多个调用点仍照传 `other:{silent:true}` / `other:{orderId}`（`pages/index/index.js` 的 `nearPark`、`refreshSettleOrder`，`components/MGTripSettlePanel` 的 `getCommentTags`），**所以这些请求失败时依然会弹 toast，`silent` 并未生效**。
- 成功回调的 `data` 是**已解密（若 `joker`）的业务 JSON**；失败回调额外带 `response`（同样已解密），供 `finish` 的 `allowForcedReturn` 等开关判断。
- `uploadFile({ url, filePath, params, name(被忽略), callback })`，回调 `data` 是**字符串**，需自行 `JSON.parse`。
