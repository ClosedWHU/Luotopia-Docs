---
title: 多端适配
sidebar_label: 多端适配
sidebar_position: 7
description: 手机与宽屏布局约定
---
# 多端适配

## 原则

- 移动端优先流式布局  
- 宽屏可换导航形态（如 NavigationRail / 侧栏，以实现为准）  
- Desktop / Web：提供 hover / focus 反馈（Material `InkWell` 等）  

## 平台分支

```dart
if (kIsWeb) {
  // Web
} else if (!kIsWeb && Platform.isAndroid) {
  // 注意：直接用 dart:io 时勿在 Web 编译路径引用
}
```

条件导入 / `foundation` 优先，避免 Web 引用 `dart:io` 炸编译。

## 与能力相关的平台差异（摘要）

| 能力 | 备注 |
|------|------|
| 校园巴士预览卡片 | Web 不显示卡片（`!kIsWeb`）；桌面宽屏可双列天气+校巴 |
| 热更新 / fjs | 依赖原生 / FFI；Web 有独立 stub |
| 安装包检查 | 各平台下载资源由官网 release assets 区分 |
| 桌面小组件 | 仅部分平台 |
| 鸿蒙 `ohos/` | 独立工程目录，能力以代码 `*Safe` 标记为准 |

## 相关

- [UI 与组件](./components.md)
- [更新与热更新](./updates.md)
- [校园功能](./campus.md)
