---
title: 请求构造与签名
sidebar_label: 请求与签名
description: 请求封装层、公共参数与 _s 签名推导、文件上传签名、同盾 deviceToken 与 juju 广告独立签名。
sidebar_position: 3
---

## 4.1 请求封装层（模块 `1244`，`common/vendor.js`）

```js
// common/vendor.js 模块 "1244"（格式化摘录）
var U = function (config) {                       // config = {url, method, data}
  config.method = config.method || "GET";
  config.REQUEST_PAGE = config.REQUEST_PAGE || getCurrentPage().route;
  config.REQUEST_ID = config.REQUEST_ID || "requestId_" + (1e15*Math.random()).toFixed(0) + "_" + Date.now();
  return new Promise(async (resolve, reject) => {
    var p = generateAjaxParams(config.data, config.url);   // ← 公共参数 + 签名（模块 0177）
    var d = getTDDeviceToken(config.url);                  // ← 同盾 deviceToken（仅 4 个开锁接口）
    if (d) p.header.deviceToken = d;
    var h = domainPool.getCurrentDomain();                 // ← 模块 1d0c 域名池
    uni.request({
      url: h + config.url,
      method: config.method,
      data: p.data || {},
      useHighPerformanceMode: true,
      header: p.header,
      enableHttp2: SDKVersion >= "2.10.4",
      success(res) { /* 日志上报 + M(config,res,resolve) 统一处理 00005/00006/00013/00015 */ },
      fail(err)    { /* 域名剔除 + 60s 窗口内最多重试 requestRetryTimes(3) 次；
                        /client/fence/serviceArea/getNearFence 禁止重试 */ }
    });
  });
};
```

## 4.2 公共参数与 `_s` 签名（模块 `0177` 函数 `F` = `generateAjaxParams`）

这是**全站唯一的请求签名机制**，格式化后的完整逻辑：

```js
// common/vendor.js 模块 "0177"（格式化摘录；SHA256=CryptoJS 模块 "94f8"，Base64="1132"，Utf8="f8d5"）
function generateAjaxParams(data = {}, url = "") {
  var _t = Date.now();                                   // 时间戳
  var cfg = S();                                         // S()=模块 "4666" = wx.getExtConfigSync() 合并默认配置
  var a = {
    tenantId: cfg.platformTenantId,                      // 知音 = "1534"
    secret:   cfg.platformSecret,                        // "<已脱敏：platformSecret>"
    sign:     cfg.platformSign                           // "<已脱敏：platformSign，64 位十六进制>"
  };
  var common = {                                         // 公共 body 参数（先置入，可被业务 data 覆盖）
    platform: "wechat",                                  // 编译期常量 "mp-weixin" 映射
    traceId:  String(_t) + String((1e11 * Math.random()).toFixed(0)),
    deviceId: uni.getSystemInfoSync().deviceId || 0,
    tenantId: a.tenantId,                                // "1534"
    version:  "5.23.0"                                   // 模块 "79b9"
  };
  var body = Object.assign(common, data);                // 最终 JSON body
  var header = {
    _t:   _t,                                            // 明文时间戳
    _s:   SHA256(JSON.stringify(body) + "_t=" + _t + a.sign).toString(),   // ★ 签名（hex 小写）
    _ssv: "2.0",                                         // 签名方案版本
    "Content-Type": "application/json",
    "accept-language": "zh-CN"
  };
  var accessToken = storageData("loginInfo").accessToken;
  if (url === "/oauth/token") {                          // 登录/刷新走 OAuth2 Basic
    header.Authorization = "Basic " + Base64.stringify(Utf8.parse(a.tenantId + ":" + a.secret));
    // 知音 = Basic base64("<tenantId>:<platformSecret>")（值已脱敏）
  } else if (accessToken) {
    header.Authorization = "Bearer " + accessToken;
  }
  var appid = cfg.platform["mp-weixin"].appid;           // "wx8df7475fde0271c6"
  if (appid) header["X-App-Id"] = appid;
  return { data: body, header };
}
```

**签名推导（逐步）**：
1. 组装 body：公共参数 `{platform, traceId, deviceId, tenantId, version}` 在前，业务参数 `Object.assign` 覆盖合并 → `JSON.stringify`（键序 = 插入序，服务端可按同规则复算）；
2. 拼接待签名串：`JSON.stringify(body) + "_t=" + 毫秒时间戳 + platformSign`（platformSign 为 64 位 hex 硬编码盐，即服务端下发的租户密钥，**同时硬编码在客户端**，值已脱敏）；
3. `SHA256(...)` → hex 小写，放入 header `_s`；header `_t` 携带同一时间戳，`_ssv:"2.0"` 标识方案版本。
4. 安全性评注：盐值 `platformSign` 完全暴露在包内（且 DEV/TEST/UAT/PROD 三套盐全部泄露，见模块 `b158`，环境表见[概述](./overview.md)），签名可离线伪造；`_t` 无服务端时钟校验迹象（客户端仅有 60s 重放拦截，且只对本地延迟生效）。

## 4.3 文件上传的签名（模块 `0177` 函数 `M` = `uploadFile`）

`uni.uploadFile` 到 `{domain}/client/file/upload`，`name:"file"`；签名同上，但 **formData 为公共参数逐字段 String 化**（`{_t,_s,_ssv,accept-language,Authorization}` 放 header），即 `_s` 覆盖的是 formData 的 JSON 串（模块 `0177` 行 1346-1380）。另有 `/business/ebike-management/file/upload`（c24f.upload）走普通 JSON 请求层。

## 4.4 同盾设备指纹 `deviceToken`（模块 `df11` + 插件 `tdfp-plugin`）

```js
// common/vendor.js 模块 "df11"（摘录）
var TD_APIS = ["/client/rent/ridePermission", "/client/rent/network/ride",
               "/client/rent/bike/network/ride", "/client/rent/blue/ridePermission"]; // 仅开锁链路
function openidHash() { return MD5(storageData("loginInfo").openid || storageData("openId") || ""); } // 模块 "72fe"=CryptoJS MD5
// requirePlugin("tdfp-plugin").FMAgent({partnerCode:"xiaoantech", appName:"xiaoantech_wxxcx"}).init()
// getInfoSync({openid: MD5(openid)}) → blackBox/deviceToken
```
请求层 `F(url)`（模块 `1244`）：命中 `TD_APIS` 时取同步 token，取不到则 `warmupBlackBox()` 预热，token 放 **header `deviceToken`**。App onLaunch 即初始化并预热（`common/main.js` `initTDFingerprintSDK`）。

## 4.5 juju 第三方广告签名（模块 `1244` `jujuAdRequest` + 模块 `415e`）

```js
// common/vendor.js 模块 "1244" jujuAdRequest（摘录），调用方模块 "415e"：
// juJuAdBaseRequest(url, "/open-api/ad/v1/deliver", data)
//   → appId:"xiaoan_miniprogram", appSecret:"<已脱敏：juju 广告 appSecret>", baseUrl:"https://ad.jujufun.net"
var timestamp = String(Date.now());
var nonce = (Math.random().toString(36).slice(2) + Date.now().toString(36)).slice(0, 16);
var bodyStr = JSON.stringify(data);
var kv = "appId=" + appId + "&nonce=" + nonce + "&timestamp=" + timestamp;   // 键排序后 & 连接
var sign = SHA256(bodyStr + kv + appSecret).toString();                      // 模块 "94f8"
// header: { appId, timestamp, nonce, sign, "Content-Type":"application/json" }；body 为原始 JSON 串
```
appId/appSecret **硬编码**于 `common/vendor.js` 模块 `415e`。
