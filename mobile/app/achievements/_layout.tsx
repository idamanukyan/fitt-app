/**
 * Achievements Stack Navigator Layout
 */
import { Stack } from 'expo-router';

export default function AchievementsLayout() {
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
      <Stack.Screen name="leaderboard" />
    </Stack>
  );
}
