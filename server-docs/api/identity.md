---
title: 身份认证接口参考
sidebar_label: 身份认证
sidebar_position: 10
description: 身份认证相关端点索引（字段与完整路径以 OpenAPI 为准）
---

> [!NOTE]
> 端点索引（摘要）；**字段、参数、错误体与完整路径以运行中的 OpenAPI（/openapi.json）为准**。默认 /api/v1/* 需登录，公开接口以各操作 Security 声明为准。
>
> 业务行为与边界见 [身份认证模块](../modules/identity/index.md)。

| 方法 | 路径 | 说明 |
|------|------|------|
| `GET` | `/.well-known/apple-app-site-association` | Apple App Site Association for passkeys |
| `GET` | `/.well-known/assetlinks.json` | Android Digital Asset Links for passkeys |
| `GET` | `/.well-known/openid-configuration` | OpenID Connect discovery document |
| `POST` | `/api/v1/auth/whu/bind` | Bind WHU account to the current user |
| `POST` | `/api/v1/auth/whu/unbind` | Unbind WHU account from the current user |
| `GET` | `/api/v1/avatars/{id}` | Get a stored avatar |
| `GET` | `/api/v1/devices` | List registered push devices (no raw tokens) |
| `DELETE` | `/api/v1/devices/{id}` | Remove a push device registration |
| `POST` | `/api/v1/devices/register` | Register a device for push notifications |
| `POST` | `/api/v1/user/2fa` | Enable or disable two-factor authentication |
| `POST` | `/api/v1/user/2fa/recovery-codes/confirm` | Confirm saved recovery codes and enable two-factor authentication |
| `POST` | `/api/v1/user/2fa/recovery-codes/prepare` | Generate recovery codes before enabling two-factor authentication |
| `GET` | `/api/v1/user/api-credentials` | List API credentials |
| `POST` | `/api/v1/user/api-credentials` | Generate API credential |
| `PATCH` | `/api/v1/user/api-credentials/{id}` | Update API credential scope and limits |
| `DELETE` | `/api/v1/user/api-credentials/{key_id}` | Revoke API credential |
| `GET` | `/api/v1/user/api-limits` | Get effective API account limits |
| `POST` | `/api/v1/user/email/change/code` | Send an email change confirmation code |
| `POST` | `/api/v1/user/email/change/confirm` | Confirm an email change with a code |
| `POST` | `/api/v1/user/email/change/request` | Request a verified email change |
| `POST` | `/api/v1/user/email/verification` | Request an email verification code |
| `POST` | `/api/v1/user/email/verify` | Verify email using a one-time code |
| `POST` | `/api/v1/user/login` | Login with email and password (may require MFA) |
| `DELETE` | `/api/v1/user/me` | Delete current user account |
| `GET` | `/api/v1/user/me` | Get current user profile |
| `PATCH` | `/api/v1/user/me` | Update current user profile |
| `DELETE` | `/api/v1/user/me/avatar` | Remove current user avatar |
| `POST` | `/api/v1/user/me/avatar` | Upload current user avatar |
| `POST` | `/api/v1/user/me/delete/prepare` | Verify password and start MFA for account deletion |
| `POST` | `/api/v1/user/mfa/email` | Complete MFA with email OTP |
| `POST` | `/api/v1/user/mfa/resend` | Resend MFA email OTP |
| `POST` | `/api/v1/user/mfa/totp` | Complete MFA with an authenticator app code |
| `GET` | `/api/v1/user/passkeys` | List passkeys |
| `DELETE` | `/api/v1/user/passkeys/{passkey_id}` | Delete a passkey |
| `POST` | `/api/v1/user/passkeys/login-policy` | Require a passkey as the second factor after the password |
| `POST` | `/api/v1/user/passkeys/login/begin` | Begin passkey MFA assertion |
| `POST` | `/api/v1/user/passkeys/login/finish` | Finish passkey MFA assertion |
| `POST` | `/api/v1/user/passkeys/passwordless/begin` | Begin passwordless passkey sign-in |
| `POST` | `/api/v1/user/passkeys/passwordless/finish` | Finish passwordless passkey sign-in |
| `POST` | `/api/v1/user/passkeys/register/begin` | Begin passkey registration |
| `POST` | `/api/v1/user/passkeys/register/finish` | Finish passkey registration |
| `POST` | `/api/v1/user/password/change` | Change password |
| `POST` | `/api/v1/user/password/reset` | Reset password using a one-time code |
| `POST` | `/api/v1/user/password/reset/request` | Request a password reset code |
| `GET` | `/api/v1/user/privacy/consents` | List privacy purpose consents for cloud sync and push |
| `PUT` | `/api/v1/user/privacy/consents` | Update privacy purpose consents |
| `POST` | `/api/v1/user/register` | Register a new user |
| `POST` | `/api/v1/user/register/email-code` | Send a registration email verification code |
| `POST` | `/api/v1/user/register/email-code/verify` | Verify a registration email code |
| `POST` | `/api/v1/user/register/whu/authorize` | Verify a WHU CAS session for registration |
| `GET` | `/api/v1/user/review-eligibility` | List courses eligible for an anonymous review |
| `POST` | `/api/v1/user/review-eligibility/sync` | Import review eligibility from a server-verified WHU transcript |
| `GET` | `/api/v1/user/reviews` | Get current user's reviews |
| `DELETE` | `/api/v1/user/sessions` | Revoke all login sessions |
| `GET` | `/api/v1/user/sessions` | List login sessions (IP, device info, is_current) |
| `DELETE` | `/api/v1/user/sessions/{session_id}` | Revoke a login session (kick offline) |
| `PATCH` | `/api/v1/user/sessions/device` | Attach device name/model info to a login session |
| `GET` | `/api/v1/user/social-accounts` | List linked social accounts |
| `DELETE` | `/api/v1/user/social-accounts/{provider}` | Disconnect a linked social account |
| `GET` | `/api/v1/user/social-accounts/{provider}/connect` | Connect a social account to the current user |
| `POST` | `/api/v1/user/social-accounts/{provider}/refresh` | Refresh a linked social account |
| `POST` | `/api/v1/user/token/refresh` | Rotate a refresh token and issue a new access token |
| `DELETE` | `/api/v1/user/totp` | Remove the authenticator app factor |
| `POST` | `/api/v1/user/totp/enroll/begin` | Begin authenticator app enrollment |
| `POST` | `/api/v1/user/totp/enroll/confirm` | Confirm authenticator app enrollment |
| `POST` | `/api/v1/user/verification/begin` | Begin step-up verification for a sensitive action |
| `POST` | `/api/v1/user/verification/complete` | Complete step-up verification with a code factor |
| `POST` | `/api/v1/user/verification/email` | Send the step-up verification code by email |
| `POST` | `/api/v1/user/verification/passkey/begin` | Begin a passkey assertion for step-up verification |
| `POST` | `/api/v1/user/verification/passkey/finish` | Finish a passkey assertion for step-up verification |
| `GET` | `/api/v1/verification/altcha` | Get Altcha challenge for costly endpoints |
| `GET` | `/api/v1/verification/config` | Get verification config |
| `GET` | `/auth/callback/{provider}` | Social provider authentication callback |
| `GET` | `/auth/login/{provider}` | Initiate social provider login flow |
| `GET` | `/oidc/jwks` | OIDC JSON Web Key Set |
| `GET` | `/oidc/userinfo` | OIDC UserInfo (bearer access token) |

## 相关

- [API 使用指南](./overview.md)
- [错误码](./error_codes.md)
- [模块详解](../modules/index.md)
