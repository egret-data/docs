import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Egret',
  tagline: 'One governed data platform and a Rust lakehouse engine',
  favicon: 'img/favicon.ico',

  future: {v4: true},

  url: 'https://egret-data.github.io',
  baseUrl: '/docs/',
  organizationName: 'egret-data',
  projectName: 'docs',
  trailingSlash: false,

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // English is canonical; Vietnamese is a reference translation (docusaurus write-translations -l vi).
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'vi'],
    localeConfigs: {en: {label: 'English'}, vi: {label: 'Tiếng Việt'}},
  },

  presets: [
    [
      'classic',
      {
        // Platform docs are the preset's default docs instance.
        docs: {
          path: 'platform',
          routeBasePath: 'platform',
          sidebarPath: './sidebars-platform.ts',
          editUrl: 'https://github.com/egret-data/docs/tree/main/',
        },
        blog: false,
        theme: {customCss: './src/css/custom.css'},
      } satisfies Preset.Options,
    ],
  ],

  plugins: [
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'engine',
        path: 'engine',
        routeBasePath: 'engine',
        sidebarPath: './sidebars-engine.ts',
        editUrl: 'https://github.com/egret-data/docs/tree/main/',
      },
    ],
  ],

  themeConfig: {
    navbar: {
      title: 'Egret',
      logo: {alt: 'Egret', src: 'img/logo.svg'},
      items: [
        {type: 'docSidebar', sidebarId: 'platformSidebar', position: 'left', label: 'Platform'},
        {type: 'docSidebar', sidebarId: 'engineSidebar', docsPluginId: 'engine', position: 'left', label: 'Engine'},
        {type: 'localeDropdown', position: 'right'},
        {href: 'https://github.com/egret-data', label: 'GitHub', position: 'right'},
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {label: 'Platform', to: '/platform/introduction/overview'},
            {label: 'Engine', to: '/engine/introduction'},
          ],
        },
        {
          title: 'Project',
          items: [
            {label: 'platform', href: 'https://github.com/egret-data/platform'},
            {label: 'engine', href: 'https://github.com/egret-data/engine'},
            {label: 'docs', href: 'https://github.com/egret-data/docs'},
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Egret contributors. Apache-2.0.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['rust', 'bash', 'toml', 'yaml', 'sql', 'json'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
