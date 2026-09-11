---
title: UI 与组件
sidebar_label: UI 与组件
sidebar_position: 6
description: Material 3、主题与组件约定
---

## 约定

- 使用 **`package:flutter/material.dart`**
- 主题：`flex_color_scheme` + `ThemeData`

## 原则

1. **语义色**：`Theme.of(context).colorScheme`，少硬编码颜色  
2. **可复用**：稳定 UI 抽到 `shared` 或 feature widgets  
3. **图标**：优先 `AppIcons`（若项目有统一入口），避免页面散落随意 `Icons.*`  

## 示例

```dart
import 'package:flutter/material.dart';

class ExampleCard extends StatelessWidget {
  const ExampleCard({super.key, required this.title});
  final String title;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return Card(
      child: ListTile(
        title: Text(title),
        subtitle: Text('副标题', style: TextStyle(color: scheme.onSurfaceVariant)),
      ),
    );
  }
}
```

## WebView

校园 H5 用统一 **`AppWebViewPage`**，见 [WebView 规范](./webview.md)。

## 反馈：SnackBar 与弹窗层级

弹窗 / BottomSheet 统一挂在 **root Navigator**（`showAppDialog` / `showAppModalBottomSheet`）。  
SnackBar 若只用页面 `ScaffoldMessenger.of(context)`，会出现在对话框 **下面**。

统一入口（root messenger，叠在 root 导航之上）：

```dart
import 'package:luotopia/shared/presentation/widgets/app_snackbar.dart';

showAppSnackBarText(context, '已复制');
// 或 showAppSnackBar(context, content: Text('…'));
```

- `MaterialApp.router(scaffoldMessengerKey: rootScaffoldMessengerKey)` 已在 `lib/app/app.dart` 接入。  
- 数据行长按复制（`showAppInfoRowCopyMenu`）已走 root messenger。  
- 新代码优先 `showAppSnackBar*`，避免在 dialog context 里直接 `ScaffoldMessenger.of`。

`AppLoadingIndicator`（M3E expressive）：适合整页/按钮内；**不要**塞进矮 SnackBar（会撑高）。短时操作用文案 SnackBar + 控件内小 spinner。

## 相关

- [多端适配](./multi-platform.md)
- [架构](./architecture.md)
