import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lassatyres.app',
  appName: 'Lassa Tyres',
  webDir: 'dist',
  server: {
    url: 'https://business-orders-management-1-1-zip.replit.app/staff',
    cleartext: false,
    androidScheme: 'https',
    iosScheme: 'https',
    allowNavigation: [
      'business-orders-management-1-1-zip.replit.app',
      '*.replit.app',
      'lassaks.online',
      '*.lassaks.online',
    ],
  },
  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#1a1a2e',
      showSpinner: false,
    },
  },
};

export default config;
