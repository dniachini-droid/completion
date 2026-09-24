import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.dniachini.rlrpg',
  appName: 'Real Life RPG',
  webDir: 'dist',
  backgroundColor: '#05050c',
  ios: {
    contentInset: 'never',        /* the page reaches under the notch; safe areas are handled in CSS */
    scrollEnabled: false,         /* no rubber-band bounce: it's an app, not a web page */
    backgroundColor: '#05050c',
    limitsNavigationsToAppBoundDomains: true,
  },
  plugins: {
    LocalNotifications: { iconColor: '#8f86ff' },
  },
};

export default config;
