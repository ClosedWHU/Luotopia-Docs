---
sidebar_position: 6
title: MFA 与 Passkey
slug: mfa-passkeys
sidebar_label: MFA 与 Passkey
description: SMTP、OTP、WebAuthn 域名关联
---

## SMTP

生产环境 MFA 需要在服务端配置 `identity.email`：

```json
"email": {
  "smtpHost": "smtp.example.edu",
  "smtpPort": 587,
  "username": "smtp-user",
  "password": "smtp-password",
  "from": "Luotopia <noreply@example.edu>"
}
```

未配置 SMTP 时，非生产环境可为本地开发返回 `debug_otp`；生产登录应 fail closed，不暴露 OTP。

该段从 identity 配置文件加载，不依赖环境变量。生产 SMTP 密码放在部署配置中，不要提交到版本库。

修改 2FA 策略需要当前密码，并吊销全部活跃会话。添加 Passkey 也需要当前密码。客户端在 2FA 策略变更后应回到登录页。

## TOTP 与步进验证（Step-up）

除 SMTP OTP 与 Passkey 外，还支持 TOTP 与步进验证：

- TOTP：`POST /api/v1/user/totp/enroll/begin`、`POST /api/v1/user/totp/enroll/confirm`、`DELETE /api/v1/user/totp`
- 步进验证：`POST /api/v1/user/verification/begin`、`/verification/email`、`/verification/complete`、`POST /api/v1/user/verification/passkey/begin`、`/verification/passkey/finish`

敏感操作（改 2FA 策略、吊销 API 凭证等）可要求步进验证（`ConsumeStepUpVerification`），以当前密码或步进挑战授权。

## Passkey 域名关联

配置的 `server.public_base` 主机名即 WebAuthn RP ID。须在 HTTPS 下无重定向地提供：

- `/.well-known/assetlinks.json`（Android）  
- `/.well-known/apple-app-site-association`（Apple）  

Android asset links 须包含 `delegate_permission/common.get_login_creds`、包名与发布证书 SHA-256。Apple 需在 Associated Domains 中配置 `webcredentials:<rp-id>`。

本应用 Android 包名默认 `sb.whu.luotopia`（`identity.webAuthn.androidPackage`），Apple App ID 默认 `ZW372988NV.sb.whu.luotopia`（`identity.webAuthn.appleAppIDs`），均可在 identity 配置中覆盖。发布关联文件前，将证书指纹与 Apple Team ID 占位符替换为发布值：

```json
[
  {
    "relation": ["delegate_permission/common.get_login_creds"],
    "target": {
      "namespace": "android_app",
      "package_name": "sb.whu.luotopia",
      "sha256_cert_fingerprints": ["<RELEASE_CERT_SHA256>"]
    }
  }
]
```

## 相关

- [身份认证模块](./index.md)
- [安全与防御策略](./security.md)
