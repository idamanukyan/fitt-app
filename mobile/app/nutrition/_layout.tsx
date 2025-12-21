/**
 * Nutrition Stack Navigator Layout
 */
import { Stack } from 'expo-router';

export default function NutritionLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: '#0D0F0D' },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="add-meal" />
      <Stack.Screen name="food/[id]" />
    </Stack>
  );
}
