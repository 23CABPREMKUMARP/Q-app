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
  },
  overrideUserAgent: "Mozilla/5.0 (Linux; Android 13; SM-G991U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36",
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
      showSpinner: false
    }
  }
};

export default config;

