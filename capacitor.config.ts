import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.jeffben.app',
  appName: 'jeffben',
  webDir: 'public',
  server: {
    url: 'https://app-woad-beta.vercel.app?_vercel_share=xGhhMqD6mX0rHCmw2Yqvj3G608s6LC5M',
    cleartext: true,
    allowNavigation: ['app-woad-beta.vercel.app', '*.vercel.app']
  }
};

export default config;
