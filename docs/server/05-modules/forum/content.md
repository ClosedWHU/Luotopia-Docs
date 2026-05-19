# 论坛内容与搜索

本模块负责处理论坛的核心数据：板块（Boards）、标签（Tags）、帖子（Posts）以及搜索逻辑。

## 1. 数据模型 (`model/forum.go`)
- **BoardRecord**: 板块定义。包含 `slug`（URL 标识）、`title`、`description` 等。
- **PostRecord**: 帖子核心。使用 `jsonb` 存储 `tag_slugs`，支持多标签。
- **Visibility**: 
    - `Visible`: 正常显示。
    - `Hidden`: 违规隐藏。
    - `Degraded`: 质量分较低，搜索权重下降。

## 2. 搜索算法与排序 (`content.go`)
搜索功能支持关键词、板块过滤及复杂的排序逻辑。

### 2.1 热门（Hottest）排序
系统使用一种衰减算法来计算帖子的“热度分”：
- **公式**: `Score = (Upvotes - Downvotes + Comments*2) / (HoursSinceCreation + 2)^1.8`。
- **预取机制**: 为了优化分页性能，系统会预取一定数量的候选贴（`hottestPrefetchBuffer`），在内存中计算得分并重新排序。

### 2.2 关键词过滤
- 支持多关键词检索，内部通过 PostgreSQL 的 `LOWER(title) LIKE` 实现。
- 标签检索通过 GORM 的 `@>` (jsonb 包含) 操作符优化。

## 3. 缓存策略
为了应对高并发，内容检索主要依赖 Redis 缓存：
- **Tags 缓存**: 每个板块的标签列表会被缓存。
- **Key 命名**: `forum:tags:board:{boardID}`。
- **失效机制**: 当有新标签创建或删除时，调用 `cache.DeletePattern("forum:tags:*")` 全局清理。

## 4. 开发注意事项
- **Slugify**: 所有手动创建的标签和板块，其 `slug` 必须经过 `slugify` 函数处理（转小写、去空格、非法字符转连字符）。
- **字段长度限制**: 标题（Title）不得超过 100 字符，内容（Content）不得超过 20,000 字符。
