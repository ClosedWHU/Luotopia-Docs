# 天气预报模块 (Weather)

Weather 模块负责集成第三方天气 API，为 Luotopia 提供实时校园天气数据，并实现高效的缓存机制。

## 1. 核心功能

系统目前集成了 **QWeather (和风天气)** API，主要提供以下功能：
- **实时天气查询**: 获取当前温度、天气状况、风力等信息。
- **智能缓存**: 采用 Redis 缓存策略，默认缓存时间为 10 分钟，避免频繁调用第三方 API 导致额度耗尽。

## 2. 接口定义

### 2.1 获取当前天气 `GET /api/v1/weather/current`

该接口返回配置坐标（默认武汉大学）的实时天气数据。

**响应示例**:
```json
{
  "body": {
    "code": "200",
    "updateTime": "2024-05-13T22:10+08:00",
    "now": {
      "temp": "22",
      "feelsLike": "21",
      "icon": "101",
      "text": "多云",
      "windDir": "东北风",
      "humidity": "56"
    }
  }
}
```

## 3. 配置指南

在 `config.json` 中配置 `weather` 字段：

```json
{
  "weather": {
    "enabled": true,
    "key": "YOUR_QWEATHER_API_KEY",
    "latitude": "30.53",
    "longitude": "114.36"
  }
}
```

- `enabled`: 是否开启天气服务。
- `key`: 和风天气 API Key。
- `latitude` / `longitude`: 查询地点的经纬度（默认为武大中心区域）。

## 4. 实现细节

- **HttpClient**: 封装了 10s 超时控制。
- **缓存层**: 每次请求优先查询 Redis (`weather:current`)。若缓存失效，则请求第三方接口并同步更新 Redis。

---
[返回模块总览](./index.md)
