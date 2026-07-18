// @ts-check
import {themes as prismThemes} from 'prism-react-renderer';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Glance Developer Network',
  tagline: 'Build apps for your GLANCE.',
  favicon: 'img/favicon.png',

  future: {v4: true},

  url: 'https://glance-led.dev',
  baseUrl: '/',

  organizationName: 'glance-led-dev',
  projectName: 'glance-docs',

  onBrokenLinks: 'warn',

  i18n: {defaultLocale: 'en', locales: ['en']},
  markdown: {hooks: {onBrokenMarkdownLinks: 'warn'}},

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
          routeBasePath: 'docs',
        },
        blog: false,
        theme: {customCss: './src/css/custom.css'},
      }),
    ],
  ],

  themes: [
    ['@easyops-cn/docusaurus-search-local',
     {hashed: true, indexBlog: false, docsRouteBasePath: '/docs', highlightSearchTermsOnTargetPage: true}],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      image: 'img/social-card.png',
      colorMode: {
        defaultMode: 'dark',
        disableSwitch: false,
        respectPrefersColorScheme: false,
      },
      navbar: {
        title: 'Glance Developer Network',
        logo: {alt: 'Glance Dev', src: 'img/logo.png'},
        items: [
          {type: 'docSidebar', sidebarId: 'docsSidebar', position: 'left', label: 'Docs'},
          {to: '/docs/getting-started/quickstart', label: 'Get started', position: 'left'},
          {to: '/docs/reference/drawing-api', label: 'Reference', position: 'left'},
          {to: '/docs/publish/submit', label: 'Publish', position: 'left'},
          {to: '/docs/private-apps/', label: 'Private Apps', position: 'left'},
          {href: 'https://github.com/glance-led-dev/glance-dev-network', label: 'GitHub', position: 'right'},
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Learn',
            items: [
              {label: 'Introduction', to: '/docs/overview/introduction'},
              {label: 'Getting started', to: '/docs/getting-started/quickstart'},
              {label: 'Your first app', to: '/docs/guides/your-first-app'},
            ],
          },
          {
            title: 'Reference',
            items: [
              {label: 'Drawing API', to: '/docs/reference/drawing-api'},
              {label: 'manifest.yaml', to: '/docs/reference/manifest'},
              {label: 'User input types', to: '/docs/reference/input-types'},
              {label: 'CLI commands', to: '/docs/guides/cli'},
            ],
          },
          {
            title: 'More',
            items: [
              {label: 'Publish an app', to: '/docs/publish/submit'},
              {label: 'Private apps', to: '/docs/private-apps/'},
              {label: 'GitHub', href: 'https://github.com/glance-led-dev/glance-dev-network'},
            ],
          },
        ],
        copyright: `Glance LED · Glance Developer Network`,
      },
      prism: {
        theme: prismThemes.vsDark,
        darkTheme: prismThemes.vsDark,
        additionalLanguages: ['python', 'bash', 'yaml', 'json'],
      },
    }),
};

export default config;
