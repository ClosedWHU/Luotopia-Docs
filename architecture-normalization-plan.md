# 前后端规范化改进计划

> 目标：在不大爆炸重构的前提下，统一包边界、分层纪律与目录约定，提升可维护性与可扩展性。  
> 状态：Phase 0–4 持续推进：CI 门禁、forum/course_review 迁址、system service 门面已落地。  
> 文档站：用户/客户端/服务端已按 Docusaurus 三分区维护；**安装包更新与热更新**属官网 homepage，勿写进业务服 `system` 主路径。

## 背景（审计结论摘要）

| 侧 | 主要问题 |
|----|----------|
| Backend | 文档与目录漂移；http 直连 repo；forum 胖 repo；共享 `internal/models`；空壳 domain |
| Frontend | features / pages / sub_apps 三套布局；presentation 巨石；Map 契约；生成客户端过重 |

## 原则（强制）

### 后端

1. **http 只依赖本域 service（或 application 用例）**，不直接依赖他域 `repo`。
2. **跨域**只依赖对方 **service 接口 / 公开 DTO**。
3. 新业务进 `internal/domains/<name>/{http,model,repo,service}`；禁止继续往 `internal/models` 堆业务实体。
4. `cmd/*` 只做 wiring（组合根）。
5. 文档与目录同 PR 更新。

### 前端

1. 业务在 `lib/features/<name>/{data,domain,presentation}`；`pages` 仅路由壳与页面组合。
2. 网络 I/O 只出现在 `data/*_repository.dart`。
3. `domain` 不依赖 Dio / OpenAPI / Flutter widget。
4. UI 不写 API 路径字符串。
5. 生成 OpenAPI 客户端按 tag 过滤，避免全量膨胀。

---

## 阶段划分

### Phase 0 — 约定与文档（低风险）✅ 进行中

| 项 | 说明 | 产出 |
|----|------|------|
| 0.1 | 后端 `internal/README` 对齐真实 domains | 文档 |
| 0.2 | 本计划文档入库 | `docs/architecture-normalization-plan.md` |
| 0.3 | 前端 feature 目录约定 | `docs/client-docs/feature-architecture.md` |

### Phase 1 — 分层门面（中风险，高收益）✅ 进行中

| 项 | 说明 | 产出 |
|----|------|------|
| 1.1 | Forum：引入 `service.Service` 门面，http 改依赖 service | 后端 |
| 1.2 | 组合根 / 测试 wiring 更新 | `cmd/server.go`、routes_test |
| 1.3 | Auth 领域模型移出 data 层 | `luotopia_auth/domain/models.dart` |
| 1.4 | Forum 前端 domain 类型（Board/Post 等） | 类型化 fromJson |

### Phase 2 — 规则下沉与拆分（持续）

| 项 | 说明 |
|----|------|
| 2.1 | Forum：审核/互动规则从 repo 抽到 service 方法（不再仅 embedding） |
| 2.2 | course_review：http 经 service，与 grade/review 用例对齐 |
| 2.3 | campus 子域统一 http/service/repo |
| 2.4 | 拆分 `internal/models` → platform 或各域 model |
| 2.5 | 前端：forum_page / campus_page 等巨石拆 widget + notifier |

### Phase 3 — 目录归一与清理

| 项 | 说明 |
|----|------|
| 3.1 | `features/pages/forum` → `features/forum`（路由别名过渡） |
| 3.2 | `course_hub` → `features/course_review` |
| 3.3 | 合并 weather 双路径；清理 `community` 空壳；server 校历 third_party 迁出 domains（✅ 数据卷 `/data/school-calendar` + 并列仓 WHU-sb-Calendar） |
| 3.4 | OpenAPI 生成按 tag 裁剪 |

### Phase 4 — 门禁

| 项 | 说明 |
|----|------|
| 4.1 | CI：禁止 domains/A/http import domains/B/repo（✅ server script + CI step） |
| 4.2 | CI：`dart analyze` + 关键路径字符串扫描（presentation 层） |
| 4.3 | 架构决策记录（ADR）模板 |

---

## Phase 1 执行清单（本迭代）

- [x] 计划文档（`docs/architecture-normalization-plan.md`）
- [x] 后端 internal README 对齐真实 domains
- [x] Forum `service.Service` 门面；http 依赖 service；错误码经 service 再导出
- [x] `cmd/server` / `export_openapi` / routes_test wiring
- [x] 前端 `docs/client-docs/feature-architecture.md`
- [x] Auth domain models 抽取（`domain/models.dart`；domain 不依赖 data）
- [x] Forum domain 基础类型 + repository 类型化读路径（Map 兼容层保留）

**验证：** `go test ./internal/domains/forum/http` OK；相关 `dart analyze` 无 issue。

## 验收标准

1. `forum/http` 不再 import `forum/repo`。
2. `go test ./internal/domains/forum/...` 通过（或至少编译通过）。
3. Auth：`domain` 不 import `data`；`data` 可依赖 `domain`。
4. 相关 Flutter 路径 `dart analyze` 无 error。
5. 新贡献者阅读 `internal/README` + `docs/client-docs/feature-architecture.md` 能找到模块。

## 风险与回滚

| 风险 | 缓解 |
|------|------|
| Forum embedding 仍胖 | Phase 1 只改依赖方向，行为不变；Phase 2 再搬逻辑 |
| 前端模型字段不全 | fromJson 宽松 + 保留 Map 扩展字段 |
| 大挪目录破坏 import | Phase 3 用 re-export 过渡，不一次 move 全仓 |

## 非目标（本计划不做）

- 微服务拆分
- 重写论坛产品 UI
- 全量替换 OpenAPI 生成器
- 一次迁完所有 http→service 域

## Phase 1+ 本轮追加

- [x] course_review: ReviewHandler 注入共享 ReviewService；Create/UpdateByUID/DeleteByUID 用户路径走 service
- [x] ReviewService.DeleteMyReview
- [x] 前端 eatures/forum、eatures/course_review barrel 过渡导出

## Phase 2 本轮追加

- [x] forum service 写路径方法：CreatePost/UpdatePost/DeletePost/AddComment/React/Favorite/Report/Moderate/SearchPosts（校验 + 委托 repo）
- [x] agent ForumSearchTool 改为 ForumSearchProvider 接口；组合根注入 forumSvc
- [x] agent 发帖/评论工具改用 forumSvc（ForumWriteProvider）

## Phase 2 业务预检（续）

- [x] service 写路径：敏感词预检（CreatePost/UpdatePost/AddComment）
- [x] service 写路径：EnsureUserCanWrite 预检（发帖/评论/反应/收藏/举报）
- [x] repo.EnsureUserCanWrite / DB() 导出供 service 与测试
- [x] service 单测：敏感词、禁言/封禁、空字段

## Phase 2/4 全面推进（本轮）

- [x] forum service 补全评论删除/反应/收藏写路径预检
- [x] 后端架构脚本 server/scripts/check_architecture.ps1（跨域 http→repo 扫描）
- [x] 前端架构脚本 pp/tool/check_architecture.ps1（presentation 网络泄漏 / domain 纯净）
- [x] 路由改为 eatures/forum、eatures/course_review barrel
- [x] community / pages/weather 占位说明 README

## Phase 3/4 本轮

- [x] server CI: scripts/check_architecture.ps1 接入 .github/workflows/ci.yml
- [x] app CI: 	ool/check_architecture.ps1 接入 pr-ci.yml + lutter-ci.yml
- [x] forum 实现从 eatures/pages/forum 物理迁至 eatures/forum
- [x] pages/forum 保留 re-export 兼容层 + README
- [x] 路由/Shell 使用 eatures/forum barrel

- [x] course_review data 物理迁至 eatures/course_review/data；course_hub/data 仅 re-export

## 审计续：本轮优化

- [x] course_hub presentation 物理迁至 eatures/course_review/presentation
- [x] course_hub 旧路径 re-export 兼容
- [x] system domain：service.Service + http 不再依赖 repo
- [x] 架构脚本增加 same-domain http→repo INFO 列表（forum/system 已清生产路径）

## 按序推进（本轮）

1. **course_review Catalog 门面**  
   - 新增 service.Catalog；Course/Teacher/Random/Embedding/Review/Admin handler 依赖 Catalog  
   - 生产 http **不再 import** course_review/repo（仅测试仍可）  
   - 类型 UnmappedTranscriptCode 经 service 再导出  

2. **identity CredentialService**  
   - service/credential.go；UserHandler 用 credentialSvc  
   - 生产 identity/http **不再 import** identity/repo  

3. **forum AI 配置入口**  
   - Service.SetAIModeration；cmd 经 service 配置  

4. **same-domain http→repo**  
   - 架构脚本 INFO：当前 **0** 个生产文件  

5. **FE 巨石 page**  
   - campus_page 拆分列入下一刀（文件 ~2500 行，需分批抽 widget）

## 续：campus 拆分 + forum AI 方法化

- [x] campus_page 用 part 拆出 campus_weather_section.dart + campus_glass_card.dart（主文件 ~2550→~2090 行）
- [x] forum repo：pplyPostCreationModeration 从 CreatePost 内联块抽出；service 文档标明 AI 配置入口

## campus_page 拆分完成

| 文件 | 职责 |
|------|------|
| campus_page.dart | 页面壳 + 布局状态（~476 行） |
| campus_weather_section.dart | 天气卡 / AQI |
| campus_glass_card.dart | 玻璃卡片容器 |
| campus_reminder_tile.dart | 提醒条 |
| campus_app_grid.dart | App 网格 / 编辑 / 文件夹（~1485 行，仍可再拆） |
| campus_app_models.dart | _CampusApp / _AppBadge |

## campus_app_grid 再拆

| 文件 | 约行数 |
|------|--------|
| campus_app_grid.dart | ~650（网格/编辑壳） |
| campus_app_tile.dart | ~250（App 磁贴） |
| campus_folder_section.dart | ~500（文件夹 UI） |

## 续：清理兼容层 + forum_page 拆分

- [x] 删除 pages/forum、course_hub 兼容 re-export 目录（无业务引用）
- [x] orum_page 拆为：
  - orum_page.dart（列表壳 ~330 行）
  - orum_post_list_widgets.dart（空态/卡片）
  - orum_post_detail.dart（详情/防空洞/操作）

## item_editor_page 拆分

原 ~1665 行 / 60KB →

| 文件 | 内容 | 约 |
|------|------|-----|
| item_editor_page.dart | 页面壳、生命周期、build、submit | ~520 行 |
| item_editor_pickers.dart | 日期/时间/颜色/类型等选择器 | ~580 行 |
| item_editor_labels.dart | 标题/标签格式化 | ~120 行 |
| item_editor_form_widgets.dart | 表单 UI 小组件 | ~440 行 |

pickers/labels 以 xtension on _ItemEditorPageState 承接（Dart 不允许跨 part 拆 class 方法体）。

## 过渡手段 → 规范边界

### item_editor
- [x] xtension on State → **mixin _ItemEditorPickers**（真实例方法 + mounted）
- [x] labels → **ItemEditorLabels 纯 static 助手**（无 State）
- [x] form controls → **widgets/item_editor_form_controls.dart 公开组件**

### campus
- [x] models → **CampusAppItem / CampusAppType 公开模型**
- [x] glass / reminder → **公开 widget**（非 part 碎片）
- [x] weather 仍 part of（依赖页内 _handleLocationPermission，避免假提升 public）
- [x] grid/tile/folder 仍 part（强耦合编辑态；下一步可再提）

### 原则
- 不为行数拆文件；有概念再成独立 library
- part 仅保留强共享私有状态的块
- 禁止再用 xtension on State 拆方法

### campus 模型统一
- [x] 删除重复 CampusAppItem，页面侧统一为 CampusGridApp
- [x] 角标组件独立为 campus_app_count_badge.dart
- [ ] 页面仍用 part _AppGrid；widgets/CampusAppGrid 为并行实现，待一次性替换后删除 part 网格

## Campus 单轨 cutover（完成）

- [x] **删除 B 轨**未使用实现：widgets/campus_app_grid|tile|folder_*|grid_jiggle
- [x] **A 轨 part 升格**为独立 library：
  - CampusAppsGrid / CampusAppIconTile / CampusFolderIconTile / CampusWeatherCard
  - layout helpers → models/campus_grid_layout.dart（normalize + folderById）
  - size/density 保留在 campus_grid_app.dart（单一来源）
  - location permission → campus_location_permission.dart
  - jiggle/slide → campus_jiggle.dart
- [x] campus_page.dart **无 part**，只做壳组装
- [x] dart analyze clean

