/**
 * Coach Onboarding layout - handles navigation within coach onboarding flow
 */
import { Stack } from 'expo-router';

export default function CoachOnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
    </Stack>
  );
}
