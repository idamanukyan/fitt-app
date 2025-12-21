/**
 * Progress Photos Stack Navigator Layout
 */
import { Stack } from 'expo-router';

export default function ProgressPhotosLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: '#0D0F0D' },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="[id]" />
      <Stack.Screen name="compare" />
      <Stack.Screen
        name="take"
        options={{
          animation: 'slide_from_bottom',
          presentation: 'fullScreenModal',
        }}
      />
    </Stack>
  );
}
