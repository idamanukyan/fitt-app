import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useEffect, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import { View, ActivityIndicator } from 'react-native';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider } from '../context/AuthContext';
import { SupplementsProvider } from '../contexts/SupplementsContext';
import { AnalyticsProvider } from '../contexts/AnalyticsContext';
import i18n, { initI18n } from '../src/i18n';

export const unstable_settings = {
  initialRouteName: 'index',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [i18nReady, setI18nReady] = useState(false);

  useEffect(() => {
    initI18n().then(() => setI18nReady(true));
  }, []);

  if (!i18nReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F0F23' }}>
        <ActivityIndicator size="large" color="#4ADE80" />
      </View>
    );
  }

  return (
    <I18nextProvider i18n={i18n}>
      <AuthProvider>
        <AnalyticsProvider>
          <SupplementsProvider>
            <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="(auth)/login" />
                <Stack.Screen name="(auth)/register" />
                <Stack.Screen name="(onboarding)" />
                <Stack.Screen name="(coach-onboarding)" />
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="(coach-tabs)" />
                <Stack.Screen name="supplements" />
                <Stack.Screen name="workout" />
                <Stack.Screen name="nutrition" />
                <Stack.Screen name="achievements" />
                <Stack.Screen name="progress-photos" />
                <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal', headerShown: true }} />
              </Stack>
              <StatusBar style="auto" />
            </ThemeProvider>
          </SupplementsProvider>
        </AnalyticsProvider>
      </AuthProvider>
    </I18nextProvider>
  );
}
