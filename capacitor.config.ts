import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.jeffben.app',
  appName: 'jeffben',
  webDir: 'public',
  server: {
    url: 'https://app-woad-beta.vercel.app',
    cleartext: false,
    allowNavigation: [
      '*',
      'app-woad-beta.vercel.app',
      '*.vercel.app',
      '*.clerk.accounts.dev',
      'keen-mustang-26.clerk.accounts.dev',
      '*.clerk.com',
      '*.supabase.co',
      '*.razorpay.com',
      '*.phonepe.com'
    ]
  },
  android: {
    allowMixedContent: false
  }
};

export default config;

