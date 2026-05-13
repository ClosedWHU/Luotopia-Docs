# 模块说明

Luotopia Server 采用模块化单体架构，以下是各核心领域的详细说明：

## 1. 核心业务模块
- **[论坛模块 (`internal/forum`)](./forum/index.md)**: 
    包含完整的社区互动、匿名治理、AI 自动审核及热度搜索算法。
- **[身份认证模块 (`internal/identity`)](./identity/index.md)**: 
    基于 OIDC 协议的统一身份中心，支持多租户、社交登录及高强度安全策略。
- **[课程业务汇总 (`internal/course`)](./course/index.md)**: 
    包含课程检索、评价系统及给分统计等核心支撑能力。
- **[课程评价系统 (`internal/course`)](./course/review.md)**: 
    学生对课程质量的感性描述与量化评分。
- **[课程给分统计 (`internal/course`)](./course/course_grades.md)**: 
    匿名的真实给分提交与绩点分布聚合统计。
- **[即时通讯 (`internal/chat`)](./chat.md)**: 
    支持用户间的私聊、消息推送与在线状态管理。
- **[课表模块 (`internal/timetable`)](./timetable.md)**: 
    支持个人课表管理、教务系统导入及多终端同步。
- **[日历模块 (`internal/calendar`)](./calendar.md)**: 
    支持 ICS 生成、个人日历事件及跨终端日历同步。
- **[学习资料共享 (`internal/material`)](./materials.md)**: 
    针对武大课程的资料库，支持多格式文件上传与审核下载。

## 2. 校园与生活服务
- **[空闲教室 (`internal/classroom`)](./classroom.md)**: 
    多校区、多维度的实时教室可用性查询。
- **[校园代理层 (`internal/campus`)](./campus_proxies.md)**: 
    整合图书馆、体育场馆、天气服务及校车查询的统一桥接层。

## 3. 系统支撑模块
- **[消息通知 (`internal/notification`)](./notification.md)**: 
    支持系统公告、业务通知及第三方推送（如 FCM）。
- **[基础设施 (`internal/platform`)](./platform/index.md)**: 
    包含数据库审计日志、缓存服务、Prometheus 指标监控等核心底座。
- **[系统管理 (`internal/system`)](./system.md)**: 
    App 版本管控、远程动态配置及推送设备管理。

---
[返回目录](../index.md)
