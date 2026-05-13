# 环境搭建

本指南将帮助你搭建 Luotopia Flutter 客户端的开发环境。

## 1. 前置要求
- **Flutter SDK**: v3.19.x (Stable)
- **Dart**: v3.3+
- **IDE**: VS Code (推荐) 或 Android Studio
- **包管理器**: `flutter pub`

## 2. 快速开始

### 2.1 获取代码
```bash
git clone https://github.com/ClosedWHU/Luotopia-App.git
cd Luotopia-App
```

### 2.2 安装依赖
```bash
flutter pub get
```

### 2.3 运行生成脚本
项目使用 `build_runner` 生成 API 模型和序列化代码：
```bash
flutter pub run build_runner build --delete-conflicting-outputs
```

### 2.4 启动应用
确保已连接模拟器或真机：
```bash
flutter run
```

## 3. 常见问题
- **CocoaPods 报错**: 请运行 `cd ios && pod install && cd ..`。
- **Gradle 同步失败**: 请检查网络代理设置，确保能访问 Google 镜像。

---
[返回目录](./index.md)
