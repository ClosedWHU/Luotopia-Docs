# 项目架构

Luotopia 客户端遵循 **Clean Architecture (领域驱动设计 DDD 思想)** 结合 **Riverpod** 响应式编程范式。这种架构将业务逻辑与 UI、底层实现完全解耦，确保了代码的可维护性与可测试性。

## 1. 目录结构说明 (`lib/`)

项目采用了高度模块化的分层结构：

```text
lib/
├── app/                  # 应用顶层配置
│   ├── router/           # 基于 go_router 的路由定义
│   ├── shell/            # 主界面框架（NavigationBar/Drawer）
│   └── app_bootstrap.dart # 启动引导与全局初始化逻辑
├── core/                 # 核心基础设施（与业务无关）
│   ├── theme/            # 主题配置与动态切换
│   ├── localization/     # 多语言 L10n 支持
│   ├── storage/          # 持久化存储封装 (SharedPreferences)
│   └── time/             # 时间处理工具
├── features/             # 功能模块（按 UI 页面划分）
│   ├── pages/            # 具体业务页面
│   │   ├── forum/        # 论坛模块
│   │   ├── course/       # 课程模块
│   │   └── home/         # 校园主页
│   └── components/       # 跨页面复用的业务组件
├── shared/               # 共享领域层 (Clean Architecture)
│   ├── domain/           # 领域层：实体 (Entities)、接口 (Repositories)、值对象
│   ├── data/             # 数据层：Repo 实现、数据映射 (Mappers)、DTO
│   └── presentation/     # 表现层：跨模块共享的 UI 组件与基类
└── main.dart             # 应用入口
```

## 2. 核心分层逻辑

### 领域层 (Shared Domain)
位于 `lib/shared/domain`，是应用的核心，**不依赖于任何框架或外部库**（除了一些基础工具）。
- **Entities**: 纯 Dart 对象，代表核心业务模型（如 `AgendaItem`）。
- **Repositories**: 定义数据操作接口（如 `IAgendaItemRepository`），不关心数据来自网络还是本地。

### 数据层 (Shared Data)
位于 `lib/shared/data`，负责实现领域层定义的接口。
- **Repositories Impl**: 具体实现数据抓取逻辑（如 `InMemoryAgendaItemRepository`）。
- **Mappers**: 负责将原始数据（如 JSON/DTO）转换为领域实体。

### 表现层与功能模块 (Features & Presentation)
位于 `lib/features/pages`，负责 UI 展示与用户交互。
- **Controller/Notifier**: 使用 Riverpod 管理页面状态，并调用共享领域层。

## 3. 状态管理 (Riverpod)

Riverpod 充当了架构中的“粘合剂”和“依赖注入容器”：

- **Provider**: 全局访问点，用于获取 Repository 实现或 Service。
- **FutureProvider / StreamProvider**: 自动处理异步数据流的加载与缓存。
- **StateNotifierProvider**: 管理复杂的 UI 状态逻辑。

## 4. 数据持久化与领域映射 (Data Persistence & Domain Mapping)
 
在移动端开发中，处理领域模型与持久化模型之间的转换及版本迁移是确保数据一致性的关键。Luotopia 采用 Mapper 模式实现层级解耦。
 
### 4.1 模型映射机制 (Mapper Pattern)
 
在 `lib/shared/data/mappers/` 中，系统将复杂的领域实体（Entity）转换为适合持久化存储（如 `SharedPreferences`）的扁平化 DTO 格式。
 
- **结构隔离**: 领域实体可包含深层嵌套的对象（如 `ItemCourseDetails`），而 Mapper 负责将其序列化为稳定的 JSON 结构。
- **显式转换**: 采用显式的 `toJson` 和 `fromJson` 逻辑而非黑盒自动化插件，确保在模型字段变更时具备精准的手动控制能力。
 
### 4.2 运行时数据迁移策略 (Runtime Migration)
 
针对版本迭代产生的模型不一致，Luotopia 采用“读时归一化 (Normalization on Read)”策略，确保旧版本数据的平滑过渡：
 
```dart
// 在数据层恢复模型时的归一化逻辑
final normalizedCourseDetails = type == ItemType.course &&
        courseDetails.instructor.trim().isEmpty &&
        _extractLegacyInstructor(details).isNotEmpty
    ? courseDetails.copyWith(instructor: _extractLegacyInstructor(details))
    : courseDetails;
```
 
**设计考量：**
- **兼容性**: 针对历史版本中存储在原始文本字段（如 `details`）中的属性，通过正则解析实时补全到新字段。
- **低成本**: 避免了在移动端运行复杂的全局数据库迁移脚本，降低了数据丢失风险并保障了应用启动性能。

## 5. 常见问题 (FAQ)

**Q: 为什么不使用 Get_it 进行依赖注入，而是选择 Riverpod？**
A: Riverpod 天然支持响应式状态绑定，且其 Provider 机制在编译期即可保证依赖关系的安全性。相比 Get_it，Riverpod 减少了单例模式带来的全局状态污染。

**Q: 领域层 (Domain) 是否允许引用 data 层的模型？**
A: **严禁**。根据 Clean Architecture 原则，依赖方向必须由外向内。Domain 层仅定义接口，具体实现由 Data 层通过继承或组合方式提供。

---
[返回目录](./index.md)
