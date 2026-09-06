---
title: 车辆 / 骑行控制接口（蓝牙通道）
sidebar_label: 骑行控制(蓝牙)
description: 蓝牙 token、蓝牙开锁/还车/临停上报与道钉检测等 11 个接口的完整清单与调用方标注。
sidebar_position: 5
---

## 车辆 / 骑行控制——蓝牙通道（11）

调用方：模块 `7c9e`（bleRidePermission→ridePermission；reportOpenBikeByBLE→rideReport；reportReturnBikeByBLE→returnReport）、模块 `17bd`（getBlueToothToken）、模块 `67ed`（getBlueToothTokenByTBIT）。BLE 指令协议细节见[蓝牙（BLE）指令"加密"](../crypto.md)，开锁链路见[车辆控制流程](../flows/unlock-return.md)。

| 接口路径 | 方法 | 函数名 | 用途(推断) | 模块 |
|---|---|---|---|---|
| `/client/fence/part/getBluetoothCheckPart` | POST | getBluetoothCheckPart | 蓝牙检测部件(道钉)配置 | 46e1 |
| `/client/paas/device/getBlueToothToken` | POST | getBlueToothToken | 获取蓝牙 token（`{imei}`，小安锁） | 46e1 |
| `/client/rent/blue/endParking` | POST | tempRideReport | 蓝牙结束临停上报 | 46e1 |
| `/client/rent/blue/getReturnConfig` | POST | openConfig | 蓝牙还车配置(izBeacon 等) | 46e1 |
| `/client/rent/blue/getTbitBlueToken` | POST | getBlueToothTokenByTBIT | 获取 TBIT 蓝牙 token（`{carId}`） | 46e1 |
| `/client/rent/blue/return` | POST | returnReport | 蓝牙还车结果上报 | 46e1 |
| `/client/rent/blue/ride` | POST | rideReport | 蓝牙开锁结果上报 | 46e1 |
| `/client/rent/blue/ridePermission` | POST | ridePermission | 蓝牙开锁前权限校验（带 deviceToken） | 46e1 |
| `/client/rent/blue/tempParking` | POST | tempReturnReport | 蓝牙临时锁车上报 | 46e1 |
| `/client/rent/returnPermission` | POST | returnPermission | 还车前权限校验(是否可还/费用/人脸) | 46e1 |
| `/client/system/getbackCarConfigByCarId` | POST | returnConfig | 按车辆ID获取还车配置 | 46e1 |
