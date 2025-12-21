import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../utils/theme';

export default function TabsLayout() {
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
        name="dashboard"
        options={{
          title: 'HOME',
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              color={focused ? theme.colors.neonCyan : theme.colors.darkGray}
              size={24}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="training"
        options={{
          title: 'TRAIN',
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name={focused ? "barbell" : "barbell-outline"}
              color={focused ? theme.colors.neonPink : theme.colors.darkGray}
              size={24}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="supplements"
        options={{
          title: 'SUPPS',
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name={focused ? "flask" : "flask-outline"}
              color={focused ? theme.colors.neonGreen : theme.colors.darkGray}
              size={24}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="chat"
        options={{
          title: 'CHAT',
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name={focused ? "chatbubbles" : "chatbubbles-outline"}
              color={focused ? theme.colors.neonOrange : theme.colors.darkGray}
              size={24}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'PROFILE',
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              color={focused ? theme.colors.neonPurple : theme.colors.darkGray}
              size={24}
            />
          ),
        }}
      />

      {/* Hide other tabs that aren't part of the main 5 */}
      <Tabs.Screen
        name="index"
        options={{
          href: null, // Hides from tab bar
        }}
      />
      <Tabs.Screen
        name="measurements"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="goals"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="personal"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="log-meal"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="shop"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
