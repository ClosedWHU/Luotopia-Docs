---
title: 车辆 / 骑行控制接口（网络通道）
sidebar_label: 骑行控制(网络)
description: 网络开锁、还车、临时停车、头盔锁、拍照审核等 36 个接口的完整清单与调用方标注。
sidebar_position: 4
---

## 车辆 / 骑行控制——网络通道（36）

调用方：模块 `7c9e` useBikeMixins（openBikeV2→ridePermissionByNet→openBikeByNetwork；returnPermission→returnByNet；tempPark/endTempPark/tempUnlock；helmet lock/unlock；colorCheck；createAuditAndReturn 等），流程详见[车辆控制流程](../flows/unlock-return.md)。开锁四接口带同盾 `deviceToken` 头（见[请求与签名](../signing.md)）。

| 接口路径 | 方法 | 函数名 | 用途(推断) | 模块 |
|---|---|---|---|---|
| `/client/helmet/lock` | POST | lockHelmet | 关头盔锁 | ed4c |
| `/client/helmet/unlock` | POST | unlockHelmet | 开头盔锁 | ed4c |
| `/client/rent/bike/network/return` | POST | returnBikeByNet | 网络还车（普通单车） | ed4c |
| `/client/rent/bike/network/ride` | POST | openCyclingByNetwork | 网络开锁（普通单车，carType=1；带 deviceToken） | 83d6 |
| `/client/rent/bookCar/bookLast` | POST | getReserveLastDetail | 最近预约单详情 | 40c7 |
| `/client/rent/bookCar/deductWallet` | POST | reserveDeductWallet | 预约费钱包抵扣 | 40c7 |
| `/client/rent/endParking` | POST | endTempPark | 结束临时停车 | ed4c |
| `/client/rent/getCarInfoData` | POST | getPreCyclingByEBikeId | 扫码后按车辆ID获取用车页数据 | 83d6 |
| `/client/rent/getRideCarInfo` | POST | getRideCarInfo | 获取骑行车辆信息 | 83d6 |
| `/client/rent/getRideInfo` | POST | getRideInfo | 获取骑行中订单/车辆状态（行程页轮询） | ed4c |
| `/client/rent/getTempUnlockConfig` | POST | getTempUnlockConfig | 临时解锁配置 | ed4c |
| `/client/rent/network/createAuditAndReturn` | POST | createAuditAndReturn | 创建审核并还车（拍照还车） | 51f8 |
| `/client/rent/network/return` | POST | returnByNet | **网络还车（核心还车指令）** | ed4c |
| `/client/rent/network/ride` | POST | openBikeByNetwork | **网络开锁（核心用车指令；带 deviceToken）** | 83d6 |
| `/client/rent/part/fourColor/check` | POST | colorCheck | 四色车/部件拍照校验 | ed4c |
| `/client/rent/part/partMatch` | POST | partMatch | 部件匹配校验 | 51f8 |
| `/client/rent/part/partMatchByTempParking` | POST | partMatchByTempParking | 临时停车部件匹配(头盔等) | ed4c |
| `/client/rent/ridePermission` | POST | ridePermissionByNet | **开锁前权限校验（带 deviceToken）** | 83d6 |
| `/client/rent/ridePermissionBuild` | POST | ridePermissionBuild | 开锁权限预构建 | 83d6 |
| `/client/rent/scan` | POST | submitScanData | 扫码数据上报 | 83d6 |
| `/client/rent/tempParking` | POST | tempPark | 临时锁车(临时停车) | ed4c |
| `/client/rent/tempParkingTimesCheck` | POST | getTempParkingTimesLimit | 临时停车次数限制检查 | ed4c |
| `/client/rent/tempUnlock` | POST | tempUnlock | 临时停车后解锁 | ed4c |
| `/client/rent/unFrozenOrder` | POST | unFrozenOrder | 解冻订单 | ed4c |
| `/client/returnBikeAudit/createReturnBikeAudit` | POST | createReturnEbike | 创建拍照还车审核 | 51f8 |
| `/client/returnBikeAudit/izCanCameraAudit` | POST | isCanCameraAudit | 是否可拍照审核还车 | ed4c |
| `/client/returnBikeAudit/izCapable` | POST | queryReturnBikeAudit | 查询拍照还车资格 | 51f8 |
| `/client/returnBikeAudit/izInParking` | POST | izInParking | 是否在停车点内 | 51f8 |
| `/client/safeRide/abandonPopup` | POST | abandonPopup | 安全骑行放弃弹窗上报 | 83d6 |
| `/client/system/getbackCarConfig` | POST | getReturnCarConfig | 还车配置 | ed4c |
| `/client/user/getWillUseRidingCard` | POST | getRidingCardInfo | 获取即将使用的骑行卡 | 83d6 |
| `/client/user/useCarFailed` | POST | useCarFailed | 用车失败上报 | 83d6 |
| `/client/vlm/return_car/generate` | POST | getReturnCarAiResult | AI(VLM)还车照片识别 | 51f8 |
| `/diy/orders/images/bind` | POST | uploadHelmetImage | 头盔照片绑定订单 | ed4c |
| `/ebike_marketing/activity/client/app/sent_ride_fail_recall_activity` | POST | getRideFailRecallActivity | 开锁失败召回活动 | ed4c |
| `/ebike_operation/tools/business/car_searching` | POST | carSearching | 寻车(运营工具通道) | 83d6 |
