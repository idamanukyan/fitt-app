/**
 * Coach Tabs Layout - Navigation for coach users
 */
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../utils/theme';

export default function CoachTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.black,
          borderTopWidth: 1,
          borderTopColor: theme.colors.lightGreen,
          paddingBottom: 8,
          paddingTop: 8,
          height: 70,
          shadowColor: theme.colors.lightGreen,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.2,
          shadowRadius: 8,
        },
        tabBarActiveTintColor: theme.colors.neonCyan,
        tabBarInactiveTintColor: theme.colors.darkGray,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
          letterSpacing: 1,
          textTransform: 'uppercase',
        },
      }}
    >
      <Tabs.Screen
        name="clients"
        options={{
          title: 'CLIENTS',
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name={focused ? 'people' : 'people-outline'}
              color={focused ? theme.colors.neonCyan : theme.colors.darkGray}
              size={24}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="programs"
        options={{
          title: 'PROGRAMS',
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name={focused ? 'clipboard' : 'clipboard-outline'}
              color={focused ? theme.colors.neonPink : theme.colors.darkGray}
              size={24}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="messages"
        options={{
          title: 'MESSAGES',
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name={focused ? 'chatbubbles' : 'chatbubbles-outline'}
              color={focused ? theme.colors.neonOrange : theme.colors.darkGray}
              size={24}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="analytics"
        options={{
          title: 'ANALYTICS',
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name={focused ? 'stats-chart' : 'stats-chart-outline'}
              color={focused ? theme.colors.neonGreen : theme.colors.darkGray}
              size={24}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: 'SETTINGS',
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name={focused ? 'settings' : 'settings-outline'}
              color={focused ? theme.colors.neonPurple : theme.colors.darkGray}
              size={24}
            />
          ),
        }}
      />
    </Tabs>
  );
}
