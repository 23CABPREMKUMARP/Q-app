import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.jeffben.app',
  appName: 'jeffben',
  webDir: 'public',
  server: {
    url: 'http://10.155.254.210:3000',
    cleartext: true
  }
};

export default config;
