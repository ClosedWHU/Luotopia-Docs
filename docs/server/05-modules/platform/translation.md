# 国际化与翻译服务

Luotopia Server 支持多语言环境，主要通过 `internal/platform/translation` 提供服务。

## 1. 核心原理
翻译服务采用 **基于字典 (Dictionary-based)** 的方案，翻译文件存储为 JSON 格式。

### 1.1 文件结构
```text
internal/platform/translation/dicts/
├── zh-CN.json
└── en-US.json
```

### 1.2 字典示例
```json
{
  "errors": {
    "user_not_found": "用户未找到",
    "invalid_password": "密码不正确"
  },
  "labels": {
    "welcome": "欢迎使用 Luotopia"
  }
}
```

## 2. 使用方法

### 2.1 获取翻译
在代码中注入 `TranslationService`，通过 Key 获取对应语言的内容：
```go
msg := t.T("zh-CN", "errors.user_not_found")
```

### 2.2 多语言协商
系统会根据以下优先级决定返回的语言：
1. 请求参数 `?lang=en-US`
2. 请求头 `Accept-Language`
3. 配置文件中的 `default_language`

## 3. 翻译 Fallback 逻辑
如果请求的 Key 在目标语言中不存在，系统会：
1. 尝试从 `default_language` (通常是 `zh-CN`) 中查找。
2. 如果依然不存在，则直接返回原始 Key。

## 4. 扩展指南
1. 在 `dicts/` 目录下创建或修改 JSON 文件。
2. 确保所有翻译文件的层级结构保持一致。
3. 如果涉及到动态参数（如 "用户 %s 不存在"），请在翻译字符串中使用 `%s` 并配合 `fmt.Sprintf` 使用。

## 5. 实战：新增一种语言

1.  **创建文件**: 在 `internal/platform/translation/dicts/` 下创建新的 JSON 文件（如 `ja-JP.json`）。
2.  **填充内容**: 复制 `zh-CN.json` 的结构并翻译所有 Value。
3.  **注册语言**: 在 `translation.go` 的 `SupportedLanguages` 列表中添加 `ja-JP`。
4.  **测试校验**: 调用接口时带上 `?lang=ja-JP` 查看返回的错误信息是否已翻译。

---
[返回目录](../../index.md)

