import { defineConfig } from 'wxt';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'Matrx',
    version: '2.0.0',
    description: 'Matrx platform extension for web content extraction, analysis, AI chat, and browser automation',
    permissions: [
      'activeTab',
      'storage',
      'contextMenus',
      'identity',
      'tabs',
      'scripting',
      'sidePanel',
    ],
    host_permissions: ['https://*/*', 'http://*/*'],
    action: {
      default_title: 'Matrx',
      default_icon: {
        '16': 'icon16.png',
        '32': 'icon32.png',
        '48': 'icon48.png',
        '128': 'icon128.png',
      },
    },
    icons: {
      '16': 'icon16.png',
      '32': 'icon32.png',
      '48': 'icon48.png',
      '128': 'icon128.png',
    },
    side_panel: {
      default_path: 'sidepanel.html',
    },
  },
  vite: () => ({
    plugins: [tailwindcss()],
  }),
});
