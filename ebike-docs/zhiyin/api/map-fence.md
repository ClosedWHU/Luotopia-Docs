---
title: 地图 / 围栏 / 寻车 / 预约接口
sidebar_label: 地图/围栏/预约
description: 服务区、电子围栏、首页运营位、寻车、导航与预约用车等 30 个接口的完整清单与调用方标注。
sidebar_position: 3
---

## 地图 / 围栏 / 寻车 / 预约（30）

调用方：`pages/map/map.js`（getServiceByPoi、getNearBike 轮询、getBillingConfig）、模块 `7c9e`（预约/寻车/导航）。

| 接口路径 | 方法 | 函数名 | 用途(推断) | 模块 |
|---|---|---|---|---|
| `/client/fence/resource/management/appList` | POST | getAppList | 资源位小程序跳转列表 | 7661 |
| `/client/fence/resourceBit/addClick` | POST | resourceClickExposure | 资源位点击上报 | 7661 |
| `/client/fence/resourceBit/addExposure` | POST | resourceViewExposure | 资源位曝光上报 | 7661 |
| `/client/fence/serviceArea/getByLocation` | POST | getServiceByPoi | 按定位获取服务区 | 7661 |
| `/client/fence/serviceArea/getFenceByServiceId` | POST | getFenceByServiceId | 按服务区获取围栏 | 7661 |
| `/client/fence/serviceArea/getNearFence` | POST | getNearFenceByPoiAndService | 获取附近电子围栏（**禁止重试**） | 7661 |
| `/client/fence/serviceArea/getServiceAreaById` | POST | getServiceFenceByServiceId | 按服务区ID获取服务区详情 | 7661 |
| `/client/fence/parking/nearParkingNum` | POST | getNearParkingNum | 附近停车点数量 | 7661 |
| `/client/helpConfig/getHomeActivityById` | POST | getHomeActivityEntranceById | 首页活动入口详情 | 7661 |
| `/client/helpConfig/getHomeActivityEntranceByServiceId` | POST | getHomeActivityEntrance | 首页活动入口 | 7661 |
| `/client/helpConfig/getHomeNavByServiceId` | POST | getHomeNav | 首页导航配置 | 7661 |
| `/client/helpConfig/getHomeScrollerMsgById` | POST | getHomeScrollerMsgById | 首页滚动公告详情 | 7661 |
| `/client/helpConfig/getHomeScrollerMsgByServiceId` | POST | getHomeScrollerMsg | 首页滚动公告 | 7661 |
| `/client/helpConfig/rideTasks/finishedTips` | POST | getRideTasksFinishedTips | 骑行任务完成提示 | 7661 |
| `/client/helpConfig/rideTasks/show` | POST | getRideTasks | 骑行任务展示配置 | 7661 |
| `/client/management/dictData/query` | POST | getDictData | 数据字典查询 | 7661 |
| `/client/management/gaode/v3/navigate` | POST | navigateToCarOrP | 导航到车辆或停车点(高德v3) | 7661 |
| `/client/order/config/get` | POST | getBillingConfig | 获取计费规则配置（token 失效豁免名单） | 7661 |
| `/client/paas/device/carSearchVoice` | POST | playBikeVoice | 寻车喇叭/语音 | 7661 |
| `/client/paas/device/eBikeLocation` | POST | getNearBike | 获取附近车辆位置（地图打点轮询） | 7661 |
| `/client/paas/device/playVoice` | POST | playBikeBellByUnLock | 开锁后播放语音 | 7661 |
| `/client/pay/score/cancelOrder` | POST | cancelWeChatPaySocre | 取消微信支付分订单 | 7661 |
| `/client/rent/bookCar/cancel` | POST | cancleEBikeReserve | 取消预约 | 7661 |
| `/client/rent/bookCar/cancelV2` | POST | cancelEBikeReserveV2 | 取消预约 V2 | 7661 |
| `/client/rent/bookCar/detail` | POST | getEBikeReserveDetails | 预约单详情 | 7661 |
| `/client/rent/bookCar/start` | POST | startEBikeReserve | 发起预约用车 | 7661 |
| `/client/rent/navigation/begin` | POST | turnOnNavigation | 开始导航上报 | 7661 |
| `/client/rent/navigation/end` | POST | turnOffNavigation | 结束导航上报 | 7661 |
| `/client/tenant/config/list` | POST | getHyGeneralEnable | 氢能源车通用开关(租户配置) | 7661 |
| `/ebike_marketing/activity/client/tianman_markting_content_query` | POST | getCloudQuickPassConfig | 云闪付营销活动配置查询 | 7661 |

> 注：模块 `7661` 的 `getEBikeReserveBilling` 引用了不存在的 URL 常量（`a.getEBikeReserveBilling` 未定义），为死代码，未计入总数。
