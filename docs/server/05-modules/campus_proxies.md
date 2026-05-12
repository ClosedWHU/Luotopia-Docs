# 校园服务代理 (Campus Proxies)

## 模块概述
为了解决移动端直接访问校内老旧系统时遇到的跨域 (CORS)、Cookie 管理复杂以及数据格式不标准等问题，Luotopia Server 提供了统一的校园服务代理层。

## 目前支持的代理
### 1. 图书馆服务 (Library)
- **馆藏检索**: 代理 `opac.lib.whu.edu.cn`，将 HTML 结果解析（或直接透传）为结构化数据。
- **座位查询**: 代理 `seat.lib.whu.edu.cn` 接口。

### 2. 体育场馆 (Venues)
- **可用性查询**: 代理 `sports.whu.edu.cn`。支持查询羽毛球、篮球等场馆的实时预约情况。

### 3. 天气服务 (Weather)
- **实时天气**: 聚合和风天气 (QWeather) API，固定位置为武汉大学（珞珈山）。客户端无需持有第三方 API Key。

## 认证透传
对于需要登录的校园代理（如座位预约），客户端应先通过 `whu_auth` 模块获取武大 CAS Cookie，并在请求代理接口时携带该 Cookie。服务端会将认证信息透传至校内系统。

## 接口说明
- `/api/v1/campus/library/search`
- `/api/v1/campus/library/seats`
- `/api/v1/campus/venues`
- `/api/v1/weather/current`
