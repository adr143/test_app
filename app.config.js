export default ({ config }) => ({
  ...config,
  name: 'test_app',
  slug: 'test_app',
  owner: 'adr143',
  version: '1.0.0',
  android: {
    package: 'com.adr143.test_app',
    adaptiveIcon: {
      foregroundImage: './assets/images/icon.png',
      backgroundColor: '#FFFFFF',
    },
  },
  ios: {
    bundleIdentifier: 'com.adr143.testapp',
  },
  extra: {
    eas: { projectId: '266775c2-04d2-42ea-8337-9322162685b9' },
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  },
});
