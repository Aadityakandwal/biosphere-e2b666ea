import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.biosphere.app',
  appName: 'Biosphere',
  webDir: 'dist',
  server: {
    url: 'https://aadityakandwal-biosphere-e2b666ea.aadityakandwal2007.workers.dev',
    cleartext: false
  }
};

export default config;