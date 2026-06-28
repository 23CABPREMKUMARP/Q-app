import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.jeffben.app',
  appName: 'jeffben',
  webDir: 'public',
  server: {
    url: 'https://app-woad-beta.vercel.app?_vercel_share=xGhhMqD6mX0rHCmw2Yqvj3G608s6LC5M',
    cleartext: false,
    allowNavigation: [
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
  appendUserAgent: "JeffBenMobileApp",
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
      showSpinner: false
    },
    PrivacyScreen: {
      enable: false,
      preventScreenshots: true
    }
  }
};

export default config;

