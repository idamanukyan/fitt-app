/**
 * Invite Layout
 */
import { Stack } from 'expo-router';

export default function InviteLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_bottom',
        presentation: 'modal',
      }}
    />
  );
}
