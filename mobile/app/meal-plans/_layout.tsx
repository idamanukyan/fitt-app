import { Stack } from 'expo-router';
import theme from '../../utils/theme';

export default function MealPlansLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.black,
        },
        headerTintColor: theme.colors.lightGreen,
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 18,
          letterSpacing: 1,
        },
        contentStyle: {
          backgroundColor: theme.colors.black,
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'MEAL PLANS',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: 'PLAN DETAILS',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="grocery-list"
        options={{
          title: 'GROCERY LIST',
          headerShown: true,
        }}
      />
    </Stack>
  );
}
