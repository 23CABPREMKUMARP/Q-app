import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.jeffben.app',
  appName: 'jeffben',
  webDir: 'public',
  backgroundColor: '#FF5F1F',
  server: {
    url: 'https://jeffben.org',
    cleartext: false,
    allowNavigation: [
      'app-woad-beta.vercel.app',
      '*.vercel.app',
      '*.clerk.accounts.dev',
      'keen-mustang-26.clerk.accounts.dev',
      '*.clerk.com',
      '*.supabase.co',
      '*.razorpay.com',
      '*.phonepe.com',
      'jeffben.org',
      '*.jeffben.org'
    ]
  },
  android: {
    allowMixedContent: false
  },
  overrideUserAgent: "Mozilla/5.0 (Linux; Android 13; SM-G991U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36 JeffBenMobileApp",
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
      backgroundColor: '#FF5F1F',
      showSpinner: false
    },
    PrivacyScreen: {
      enable: false,
      preventScreenshots: true
    }
  }
};

export default config;

