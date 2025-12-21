import { Stack } from 'expo-router';

export default function SupplementsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#0F0F23' },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="library" />
      <Stack.Screen name="my-stack" />
      <Stack.Screen name="add-new" />
      <Stack.Screen name="configure-new" options={{ presentation: 'modal' }} />
      <Stack.Screen name="tracker" />
      <Stack.Screen name="add" />
      <Stack.Screen name="configure" options={{ presentation: 'modal' }} />
    </Stack>
  );
}
