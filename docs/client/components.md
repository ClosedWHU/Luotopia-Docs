# UI 组件库

Luotopia 客户端采用 **Material 3** 设计语言，并在 `lib/shared/presentation/widgets` 中封装了一系列通用组件，以保证全站视觉的一致性。

## 1. 基础布局组件

### `AppBarBuilder`
统一的顶栏构建器，支持透明度渐变、沉浸式状态栏及多端适配。
- **参数**: `title`, `actions`, `isSliver`。

## 2. 交互与选择器

### `AppDateTimePickers`
针对武大教务系统风格定制的时间选择器。
- **功能**: 支持周次选择、节次选择（1-13 节）以及常规的日期时间选择。

### `AppDurationPicker`
用于设定“提醒时间”或“倒计时”的持续时间选择器，支持自定义刻度与步长。

## 3. 组件开发规范 (Component Development Specifications)
 
Luotopia 深度集成 `shadcn_flutter` 体系。在开发新业务组件时，应遵循以下设计原子规范。
 
### 3.1 核心设计原则
- **响应式适配**: 组件需支持流式布局，确保在移动端与桌面端均具备良好的可读性。
- **主题解耦**: 严禁硬编码颜色值。必须通过 `Theme.of(context)` 访问语义化颜色（如 `colorScheme.primary`），以支持动态主题与深色模式。
- **原子化解耦**: 复杂的表现层逻辑应拆分为原子（Atoms）与分子（Molecules），提高组件的可复用性。
 
### 3.2 实现示例：自定义卡片组件
 
```dart
import 'package:flutter/material.dart';
import 'package:shadcn_flutter/shadcn_flutter.dart' as ui;

class LuotopiaPostCard extends StatelessWidget {
  final String title;
  final String author;

  const LuotopiaPostCard({super.key, required this.title, required this.author});

  @override
  Widget build(BuildContext context) {
    // 获取当前上下文的语义化主题
    final theme = ui.Theme.of(context);
    
    return ui.Card(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              title,
              style: theme.typography.h4,
            ),
            const SizedBox(height: 8),
            ui.Badge(
              color: theme.colorScheme.muted,
              child: Text(author),
            ),
          ],
        ),
      ),
    );
  }
}
```

## 4. UI 常见问题 (FAQ)

**Q: 为什么我的组件在深色模式下颜色显示异常？**
A: 请确认是否使用了 `Colors.white` 等绝对颜色。应替换为 `theme.colorScheme.background` 或对应的语义化颜色，以确保颜色随主题自动翻转。

**Q: 间距规范是多少？**
A: 项目推荐使用 **4px 基准间距**。常用的 padding 序列为 4, 8, 16, 24, 32。这有助于在不同屏幕密度下维持视觉节奏的统一性。

---
[返回目录](./index.md)
