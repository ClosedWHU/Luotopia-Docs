import {themes as prismThemes} from 'prism-react-renderer';
import {remarkAlert} from 'remark-github-blockquote-alert';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Luotopia 文档',
  tagline: '珞家：用户指南、客户端与服务端文档',
  // Keep docs visually aligned with the client and homepage branding.
  favicon: 'https://www.whu.sb/favicon.svg',

  future: {
    v4: true,
  },

  url: 'https://docs.whu.sb',
  baseUrl: '/',

  organizationName: 'ClosedWHU',
  projectName: 'luotopia',

  onBrokenLinks: 'throw',
  markdown: {
    mermaid: true,
    hooks: {
      onBrokenMarkdownLinks: 'throw',
    },
  },

  themes: ['@docusaurus/theme-mermaid'],

  i18n: {
    defaultLocale: 'zh-Hans',
    locales: ['zh-Hans'],
  },

  presets: [
    [
      'classic',
      {
        // Disable default docs; use four instances below for /user /client /server /ebike
        docs: false,
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  plugins: [
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'user',
        path: 'user-docs',
        routeBasePath: 'user',
        sidebarPath: require.resolve('./sidebarsUser.ts'),
        editUrl: 'https://github.com/ClosedWHU/Luotopia-Docs/tree/main/user-docs/',
        remarkPlugins: [remarkAlert],
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'client',
        path: 'client-docs',
        routeBasePath: 'client',
        sidebarPath: require.resolve('./sidebarsClient.ts'),
        editUrl: 'https://github.com/ClosedWHU/Luotopia-Docs/tree/main/client-docs/',
        remarkPlugins: [remarkAlert],
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'server',
        path: 'server-docs',
        routeBasePath: 'server',
        sidebarPath: require.resolve('./sidebarsServer.ts'),
        editUrl: 'https://github.com/ClosedWHU/Luotopia-Docs/tree/main/server-docs/',
        remarkPlugins: [remarkAlert],
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'ebike',
        path: 'ebike-docs',
        routeBasePath: 'ebike',
        sidebarPath: require.resolve('./sidebarsEbike.ts'),
        editUrl: 'https://github.com/ClosedWHU/Luotopia-Docs/tree/main/ebike-docs/',
        remarkPlugins: [remarkAlert],
      },
    ],
    [
      '@docusaurus/plugin-client-redirects',
      {
        redirects: [
          // Legacy numbered sections
          {from: '/server/01-architecture/database_design', to: '/server/architecture/database-design'},
          {from: '/server/01-architecture/security_policy', to: '/server/architecture/security-policy'},
          {from: '/server/03-api/detailed_reference', to: '/server/api/detailed-reference'},
          {from: '/server/deploy/backend-build-and-deploy', to: '/server/deployment/backend-build-and-deploy'},
          {from: '/server/meta/public_docs_policy', to: '/server/meta/public-docs-policy'},
          // Underscore URLs -> kebab slugs (2026-09 normalization)
          {from: '/server/cli_reference', to: '/server/cli-reference'},
          {from: '/server/api/error_codes', to: '/server/api/error-codes'},
          {from: '/server/api/full_reference', to: '/server/api/full-reference'},
          {from: '/server/api/detailed_reference', to: '/server/api/detailed-reference'},
          {from: '/server/api/httpapi', to: '/server/api/http-api'},
          {from: '/server/architecture/database_design', to: '/server/architecture/database-design'},
          {from: '/server/architecture/security_policy', to: '/server/architecture/security-policy'},
          {from: '/server/meta/style_guide', to: '/server/meta/style-guide'},
          {from: '/server/modules/campus_proxies', to: '/server/modules/campus-proxies'},
          {from: '/server/modules/external_surfaces', to: '/server/modules/external-surfaces'},
          {from: '/server/modules/course/course_grades', to: '/server/modules/course/course-grades'},
          {from: '/server/modules/identity/privacy_sync', to: '/server/modules/identity/privacy-sync'},
          {from: '/server/modules/identity/whu_auth', to: '/server/modules/identity/whu-auth'},
          {from: '/server/modules/services/content_moderation', to: '/server/modules/services/content-moderation'},
          {from: '/server/modules/services/integration_testing', to: '/server/modules/services/integration-testing'},
          {from: '/client/api_integration', to: '/client/api-integration'},
          {from: '/client/multi_platform', to: '/client/multi-platform'},
          {from: '/client/state_management', to: '/client/state-management'},
          // Moved / removed pages
          {from: '/server/advanced', to: '/server/development/performance-tuning'},
          {from: '/server/advanced/performance_tuning', to: '/server/development/performance-tuning'},
          {from: '/server/modules/services/search_engine', to: '/server/modules/search'},
          {from: '/server/05-modules/services/search_engine', to: '/server/modules/search'},
          // Old label-based category index URLs
          {from: '/server/category/身份认证', to: '/server/modules/identity'},
          {from: '/server/category/论坛服务', to: '/server/modules/forum'},
          {from: '/server/category/课程服务', to: '/server/modules/course'},
          {from: '/server/category/统一搜索', to: '/server/modules/search'},
          {from: '/server/category/基础设施', to: '/server/modules/platform'},
          {from: '/server/category/内部服务', to: '/server/modules/services'},
          {from: '/server/category/规范与社区', to: '/server/meta'},
          {from: '/server/category/高级功能', to: '/server/development/performance-tuning'},
          // Old double-prefixed ebike category URLs
          {from: '/ebike/ebike/zhiyin', to: '/ebike/zhiyin'},
          {from: '/ebike/ebike/mango', to: '/ebike/mango'},
          {from: '/ebike/ebike/zhiyin/api', to: '/ebike/zhiyin/api'},
          {from: '/ebike/ebike/zhiyin/flows', to: '/ebike/zhiyin/flows'},
          {from: '/ebike/ebike/mango/api', to: '/ebike/mango/api'},
          {from: '/ebike/ebike/mango/flows', to: '/ebike/mango/flows'},
        ],
        createRedirects(existingPath: string) {
          // Skip category/index routes that collide as both `/foo` and `/foo/` on Windows
          if (existingPath.endsWith('/') || existingPath.split('/').length <= 3) {
            return undefined;
          }
          const pairs: [string, string][] = [
            ['/server/architecture', '/server/01-architecture'],
            ['/server/development', '/server/02-development'],
            ['/server/api', '/server/03-api'],
            ['/server/deployment', '/server/04-deployment'],
            ['/server/modules', '/server/05-modules'],
          ];
          for (const [toPrefix, fromPrefix] of pairs) {
            if (existingPath.startsWith(`${toPrefix}/`)) {
              const legacy = existingPath.replace(toPrefix, fromPrefix);
              return [legacy, legacy.replace(/-/g, '_')];
            }
          }
          return undefined;
        },
      },
    ],
  ],

  themeConfig: {
    image: 'https://www.whu.sb/img/og-image.png',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'Luotopia 文档',
      logo: {
        alt: 'Luotopia',
        src: 'https://www.whu.sb/img/app-icon.png',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'userSidebar',
          docsPluginId: 'user',
          position: 'left',
          label: '用户指南',
        },
        {
          type: 'docSidebar',
          sidebarId: 'clientSidebar',
          docsPluginId: 'client',
          position: 'left',
          label: '客户端开发',
        },
        {
          type: 'docSidebar',
          sidebarId: 'serverSidebar',
          docsPluginId: 'server',
          position: 'left',
          label: '服务端开发',
        },
        {
          type: 'docSidebar',
          sidebarId: 'ebikeSidebar',
          docsPluginId: 'ebike',
          position: 'left',
          label: '电单车接口',
        },
        {
          href: 'https://github.com/ClosedWHU/luotopia',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: '文档分区',
          items: [
            {label: '用户指南', to: '/user/'},
            {label: '客户端开发', to: '/client/'},
            {label: '服务端开发', to: '/server/'},
            {label: '电单车接口', to: '/ebike/'},
          ],
        },
        {
          title: '社区',
          items: [
            {label: 'GitHub', href: 'https://github.com/ClosedWHU'},
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} ClosedWHU. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
