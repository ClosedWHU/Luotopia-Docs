# 内容审核服务

内容审核服务负责对用户生成的内容（如论坛帖子、评论等）进行实时审核，确保平台安全和合规。该服务集成了敏感词过滤、垃圾内容检测等功能。

## 核心功能

### 1. 敏感词过滤

使用多种算法实现高效的敏感词检测和处理：

```go
package moderation

// SensitiveWordFilter 定义了敏感词过滤的接口
type SensitiveWordFilter interface {
	// Check 检查内容中是否包含敏感词
	Check(content string) ([]SensitiveMatch, error)
	
	// Replace 将敏感词替换为指定字符
	Replace(content string, replacement string) (string, error)
	
	// ReloadDict 重新加载敏感词字典
	ReloadDict() error
}

// SensitiveMatch 敏感词匹配结果
type SensitiveMatch struct {
	Word      string // 敏感词
	Category  string // 分类 (政治, 色情, 广告, 辱骂 等)
	Position  int    // 位置
	Severity  int    // 严重程度 (1-5)
	Action    string // 推荐处理 (warn, mask, reject)
}
```

#### 支持的敏感词分类

| 分类 | 示例 | 处理方式 |
|------|------|--------|
| 政治 | 涉及政治人物、政治事件 | 标记为待审核，通知管理员 |
| 色情 | 涉及不良内容 | 屏蔽、删除、封禁用户 |
| 广告 | 包含推广信息 | 隐藏、删除 |
| 辱骂 | 骂人、贬低他人 | 警告、扣分 |
| 违法 | 涉及违法犯罪 | 立即删除、举报执法部门 |

#### 敏感词字典管理

```yaml
# config/sensitive_words.yaml
sensitive_words:
  categories:
    political:
      dict_file: /data/dicts/political.txt
      severity: 5
      action: REJECT
      
    adult:
      dict_file: /data/dicts/adult.txt
      severity: 4
      action: MASK
      
    advertising:
      dict_file: /data/dicts/ads.txt
      severity: 2
      action: HIDE
      
    abuse:
      dict_file: /data/dicts/abuse.txt
      severity: 3
      action: WARN

  # 定期自动更新
  auto_update: true
  update_interval: 86400  # 每天
  update_source: "https://sensitive-words-api.example.com/dict"
```

#### 使用示例

```go
// 在创建帖子时检查内容
func (s *PostService) CreatePost(ctx context.Context, req *CreatePostRequest) (*PostResponse, error) {
	// 内容审核
	matches, err := s.moderationService.CheckSensitiveWords(ctx, req.Content)
	if err != nil {
		return nil, fmt.Errorf("审核失败: %w", err)
	}
	
	// 处理检测结果
	if len(matches) > 0 {
		// 找最严重的违规
		maxSeverity := 0
		for _, m := range matches {
			if m.Severity > maxSeverity {
				maxSeverity = m.Severity
			}
		}
		
		if maxSeverity >= 4 { // 严重违规
			return nil, fmt.Errorf("内容包含违禁词汇，已被拒绝")
		}
		
		// 中等违规：自动屏蔽敏感词
		cleanContent := req.Content
		for _, m := range matches {
			if m.Severity <= 3 {
				cleanContent = strings.ReplaceAll(
					cleanContent, 
					m.Word, 
					strings.Repeat("*", len([]rune(m.Word)))
				)
			}
		}
		req.Content = cleanContent
		
		// 标记为待审核
		req.NeedReview = true
	}
	
	// 创建帖子
	post := &model.Post{
		Title:      req.Title,
		Content:    req.Content,
		AuthorID:   req.AuthorID,
		NeedReview: req.NeedReview,
		CreatedAt:  time.Now(),
	}
	
	return s.postRepo.Create(ctx, post)
}
```

### 2. 垃圾内容检测

基于多维度特征分析检测垃圾内容和刷屏行为：

```go
// SpamDetector 垃圾内容检测
type SpamDetector interface {
	// Analyze 分析内容是否为垃圾
	Analyze(ctx context.Context, content string, metadata *ContentMetadata) (*SpamScore, error)
}

type SpamScore struct {
	IsSpam      bool    // 是否判定为垃圾
	Score       float32 // 得分 0-1，越高越可能是垃圾
	Reasons     []string
	Confidence  float32
}

type ContentMetadata struct {
	AuthorID   uint64
	CreatedAt  time.Time
	PrevPostsCount int       // 该用户 1 小时内的发帖数
	IPAddress  string
	UserLevel  int           // 用户等级
}
```

#### 垃圾检测规则

| 规则 | 说明 | 阈值 |
|------|------|------|
| 高频发帖 | 用户短时间内发布大量内容 | > 10 帖/小时 → 标记 |
| URL 密集 | 内容中包含过多链接 | > 3 个链接/100 字 → 标记 |
| 重复内容 | 频繁发布相同或相似内容 | 相似度 > 80% → 标记 |
| 关键词堆砌 | 重复使用特定词汇 | 同一词重复 > 5 次 → 标记 |
| 新号行为 | 新注册账户异常行为 | 注册 < 1 天 + 高频 → 标记 |

### 3. 用户行为审计

记录内容审核的每个环节，用于后续分析和申诉：

```go
type ModerationLog struct {
	ID            uint64    `gorm:"primaryKey"`
	ContentID     uint64    // 被审核内容 ID
	ContentType   string    // 帖子、评论等
	ContentOwner  uint64    // 内容所有者
	Violations    []string  `gorm:"type:json"` // 违规类别列表
	Severity      int       // 严重程度
	Action        string    // 采取的行动 (warn, hide, delete, ban)
	ActionBy      uint64    // 采取行动的人 ID
	Reason        string    // 详细原因
	AppealStatus  string    // 申诉状态 (none, pending, approved, rejected)
	CreatedAt     time.Time
	UpdatedAt     time.Time
}
```

#### 申诉流程

```go
// 用户对审核决定进行申诉
func (s *ModerationService) CreateAppeal(
	ctx context.Context,
	logID uint64,
	reason string,
) error {
	log, err := s.logRepo.FindByID(ctx, logID)
	if err != nil {
		return err
	}
	
	// 检查申诉有效期（7 天内）
	if time.Since(log.CreatedAt) > 7*24*time.Hour {
		return fmt.Errorf("申诉期已过期")
	}
	
	// 更新申诉状态
	log.AppealStatus = "pending"
	log.AppealReason = reason
	log.UpdatedAt = time.Now()
	
	if err := s.logRepo.Update(ctx, log); err != nil {
		return err
	}
	
	// 通知审核员
	s.notificationService.NotifyModerators(ctx, &Notification{
		Type:    "appeal",
		Title:   "内容审核申诉",
		Message: fmt.Sprintf("用户 %d 对审核决定进行申诉", log.ContentOwner),
		Data:    map[string]interface{}{"log_id": logID},
	})
	
	return nil
}
```

## 配置与部署

### 敏感词库更新

```bash
# 手动更新
curl -X POST "http://localhost:8080/api/admin/moderation/reload-dict" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# 自动更新脚本
#!/bin/bash
# /scripts/update_sensitive_dict.sh
BACKUP_DATE=$(date +%Y%m%d)
cp /data/dicts/sensitive.txt /data/dicts/sensitive.txt.bak.$BACKUP_DATE

# 从远程源下载最新字典
curl -s https://sensitive-words-api.example.com/dict \
  | gunzip > /data/dicts/sensitive.txt.new

# 验证新字典格式
go run cmd/verify_dict.go /data/dicts/sensitive.txt.new

# 更新到运行环境
mv /data/dicts/sensitive.txt.new /data/dicts/sensitive.txt

# 通知服务重新加载
curl -X POST "http://localhost:8080/api/admin/moderation/reload-dict"

# 记录更新日志
echo "Updated at $(date)" >> /var/log/dict_update.log
```

### 监控告警

```prometheus
# 待审核内容数量
moderation_pending_count{type="post"}
moderation_pending_count{type="comment"}

# 审核通过率
moderation_approval_rate

# 申诉成功率
moderation_appeal_success_rate

# 敏感词命中率
moderation_sensitive_word_hit_rate

# 平均审核时间（分钟）
moderation_avg_review_time_minutes
```

---

## 常见问题

**Q: 如何处理誤判情况？**  
A: 建立人工复核机制，对高置信度的自动拒绝进行二次审核。支持用户申诉，申诉通过后自动解除限制。

**Q: 敏感词库有多大？**  
A: 约 50,000+ 词条，包括简繁体、谐音、变形等。定期更新，年增幅 10-20%。

**Q: 如何防止绕过检测？**  
A: 
- 使用 NLP 技术检测同义表达
- 对常见变形进行预处理（数字、符号替换等）
- 结合向量化相似度匹配

---

[返回服务列表](./index.md)
