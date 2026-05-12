# 模块说明 (Module Specifications)

Luotopia Server 采用模块化单体架构，以下是各核心领域的详细说明：

## 1. 核心业务模块
- **[论坛模块 (`internal/forum`)](./forum/index.md)**: 
    包含完整的社区互动、匿名治理、AI 自动审核及热度搜索算法。
- **[身份认证模块 (`internal/identity`)](./identity/index.md)**: 
    基于 OIDC 协议的统一身份中心，支持多租户、社交登录及高强度安全策略。
- **[课程服务模块 (`internal/course`)](./review.md)**: 
    支持全量课程库检索、多维度课程评价及教务数据同步。
- **[课程给分模块 (`internal/course/http/grade_api.go`)](./course_grades.md)**: 
    匿名的真实给分提交与绩点分布聚合统计。
- **[课表模块 (`internal/timetable`)](./timetable.md)**: 
    支持个人课表管理、教务系统导入及多终端同步。
- **[日历模块 (`internal/calendar`)](./calendar.md)**: 
    支持 ICS 生成、个人日历事件及跨终端日历同步。
- **[学习资料共享 (`internal/material`)](./materials.md)**: 
    针对武大课程的资料库，支持多格式文件上传与审核下载。
- **[空闲教室 (`internal/classroom`)](./classroom.md)**: 
    多校区、多维度的实时教室可用性查询。
- **[校园代理 (`internal/campus`)](./campus_proxies.md)**: 
    图书馆、体育场馆及天气服务的统一桥接代理层。

## 2. 系统支撑模块
- **[基础设施 (`internal/platform`)](./platform/index.md)**: 
    包含数据库审计日志、缓存服务、Prometheus 指标监控等核心底座。
- **[系统管理 (`internal/system`)](./system.md)**: 
    App 版本管控、远程动态配置及推送设备管理。

---
[⬅️ 返回目录](../index.md)
