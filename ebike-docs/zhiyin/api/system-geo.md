---
title: 系统配置 / 文件 / 地理接口
sidebar_label: 系统配置/地理
description: 租户配置、协议文档、文件上传、逆地理编码等 9 个接口的完整清单与调用方标注。
sidebar_position: 2
---

## 系统配置 / 文件 / 地理（9）

调用方：`common/main.js`（getTenantConfig）、模块 `0177`（uploadFile→/client/file/upload，见[文件上传的签名](../signing.md)）、模块 `80db`（getTenantLoginConfig）、模块 `49c2`（getAddressByLatAndLngList 逆地理）。

| 接口路径 | 方法 | 函数名 | 用途(推断) | 模块 |
|---|---|---|---|---|
| `/client/fence/config/protocol/default` | POST | getProtocolsByType | 按类型获取默认协议文档 | 0782 |
| `/client/file/upload` | POST | uploadFile | 通用文件/图片上传（uni.uploadFile，见[文件上传的签名](../signing.md)） | 2934 |
| `/client/geometry/calcPointDistance` | POST | calcPointDistance | 两点距离计算（几何） | 2934 |
| `/client/management/gaode/getAddress` | POST | getAddressByLatAndLng | 逆地理编码（高德后端代理，单点） | 2934 |
| `/client/management/gaode/getAddressList` | POST | getAddressByLatAndLngList | 逆地理编码（高德后端代理，批量） | 2934 |
| `/client/management/menuClick/izShow` | POST | frequencyLimit | 菜单点击频率限制/是否展示 | 2934 |
| `/client/tenant/config` | POST | getTenantConfig | 获取租户运行时配置(App onShow) | 2934 |
| `/client/tenant/config/getTenantConfig` | POST | getTenantLoginConfig | 获取租户登录/实名相关配置 | 2934 |
| `/client/tenant/getFunConfig` | POST | getDynamiConfig | 动态功能配置 | da71 |
