import type { CapacitorConfig } from '@capacitor/cli';

// The app wrapper (TECH_DECISIONS.md, D-057). The bundle id is fixed once the app record exists in App Store Connect.
const config: CapacitorConfig = {
  appId: 'com.dniachini.rpg',
  appName: 'Lamp Hall',
  webDir: 'dist',
  backgroundColor: '#05050c',
  ios: {
    contentInset: 'never',
    scrollEnabled: false,
    backgroundColor: '#05050c',
    limitsNavigationsToAppBoundDomains: true,
  },
  plugins: {
    LocalNotifications: { iconColor: '#8f86ff' },
  },
};

export default config;
