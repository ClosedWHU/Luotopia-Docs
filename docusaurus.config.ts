import {themes as prismThemes} from 'prism-react-renderer';
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
        // Disable default docs; use three instances below for /user /client /server
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
        editUrl: 'https://github.com/ClosedWHU/luotopia/tree/main/docs/',
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'client',
        path: 'client-docs',
        routeBasePath: 'client',
        sidebarPath: require.resolve('./sidebarsClient.ts'),
        editUrl: 'https://github.com/ClosedWHU/luotopia/tree/main/docs/',
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'server',
        path: 'server-docs',
        routeBasePath: 'server',
        sidebarPath: require.resolve('./sidebarsServer.ts'),
        editUrl: 'https://github.com/ClosedWHU/luotopia/tree/main/docs/',
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'ebike',
        path: 'ebike-docs',
        routeBasePath: 'ebike',
        sidebarPath: require.resolve('./sidebarsEbike.ts'),
        editUrl: 'https://github.com/ClosedWHU/luotopia/tree/main/docs/',
      },
    ],
    [
      '@docusaurus/plugin-client-redirects',
      {
        redirects: [
          // Old underscore pathnames (new pages use kebab slugs)
          {from: '/server/01-architecture/database_design', to: '/server/architecture/database-design'},
          {from: '/server/01-architecture/security_policy', to: '/server/architecture/security-policy'},
          {from: '/server/03-api/detailed_reference', to: '/server/api/detailed-reference'},
          {from: '/server/deploy/backend-build-and-deploy', to: '/server/deployment/backend-build-and-deploy'},
          {from: '/server/advanced', to: '/server/advanced/performance_tuning'},
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
              return [existingPath.replace(toPrefix, fromPrefix)];
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
