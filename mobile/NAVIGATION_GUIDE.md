# 🚀 HyperFit Mobile Navigation Guide

## 📁 Folder Structure

```
mobile/
├── app/
│   ├── (auth)/
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── (tabs)/
│   │   ├── _layout.tsx       ← Bottom Tab Navigator Setup
│   │   ├── dashboard.tsx     → screens/DashboardScreen.tsx
│   │   ├── chat.tsx          → screens/ChatScreen.tsx
│   │   ├── discover.tsx      → screens/DiscoverScreen.tsx
│   │   ├── training.tsx      → screens/TrainingScreen.tsx
│   │   └── profile.tsx       → screens/PersonalScreen.tsx
│   ├── index.tsx             ← Auth routing & landing page
│   └── _layout.tsx           ← Root layout
├── screens/
│   ├── DashboardScreen.tsx   ✅
│   ├── ChatScreen.tsx        ✅
│   ├── DiscoverScreen.tsx    ✅
│   ├── TrainingScreen.tsx    ✅ (NEW)
│   └── PersonalScreen.tsx    ✅
├── context/
│   └── AuthContext.tsx
├── components/               (Ready for custom components)
├── utils/
└── package.json
```

---

## 🎯 5 Main Tabs

| Tab | Icon | Screen | Description |
|-----|------|--------|-------------|
| 🏠 **Dashboard** | `home-outline` | `DashboardScreen.tsx` | Main landing page after login |
| 💬 **Chat** | `chatbubbles-outline` | `ChatScreen.tsx` | Messaging and conversations |
| 🔍 **Discover** | `search-outline` | `DiscoverScreen.tsx` | Explore content and features |
| 🏋️ **Training** | `barbell-outline` | `TrainingScreen.tsx` | Workout programs and exercises |
| 👤 **Profile** | `person-outline` | `PersonalScreen.tsx` | User profile and settings |

---

## 🔄 Navigation Flow

### 1. **Initial App Load**
```
app/index.tsx checks authentication
  │
  ├─ Not Authenticated → /(auth)/login
  │
  └─ Authenticated → /(tabs)/dashboard
```

### 2. **After Login**
```
User logs in → app/index.tsx detects auth → Redirects to /(tabs)/dashboard
```

### 3. **Tab Navigation**
```
User clicks any tab → Expo Router navigates to corresponding screen
  - Dashboard → screens/DashboardScreen.tsx
  - Chat → screens/ChatScreen.tsx
  - Discover → screens/DiscoverScreen.tsx
  - Training → screens/TrainingScreen.tsx
  - Profile → screens/PersonalScreen.tsx
```

---

## 📝 Key Files

### 1. `app/(tabs)/_layout.tsx` - Bottom Tab Navigator

```tsx
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0d0d0d',
          borderTopColor: '#222',
          paddingBottom: 5,
          height: 65,
        },
        tabBarActiveTintColor: '#00D4FF',
        tabBarInactiveTintColor: '#666',
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" color={color} size={size} />
          ),
        }}
      />
      {/* ... other tabs ... */}
    </Tabs>
  );
}
```

### 2. Tab Files (Pattern)

Each tab file imports and re-exports its screen:

```tsx
// app/(tabs)/dashboard.tsx
import DashboardScreen from '../../screens/DashboardScreen.tsx';
export default DashboardScreen;
```

### 3. `app/index.tsx` - Auth Router

Handles authentication routing and redirects users to appropriate screens.

---

## 🎨 Customization Options

### 1. **Change Tab Bar Colors**

Edit `app/(tabs)/_layout.tsx`:

```tsx
tabBarStyle: {
  backgroundColor: '#YOUR_COLOR',  // Tab bar background
  borderTopColor: '#YOUR_COLOR',   // Top border
}
tabBarActiveTintColor: '#YOUR_COLOR',    // Active tab
tabBarInactiveTintColor: '#YOUR_COLOR',  // Inactive tab
```

### 2. **Change Icons**

Replace icon names in `_layout.tsx`:

```tsx
<Ionicons name="YOUR_ICON_NAME" color={color} size={size} />
```

See all icons at: https://icons.expo.fyi/Index

### 3. **Add Dark Mode Support**

```tsx
import { useColorScheme } from 'react-native';

const colorScheme = useColorScheme();
const isDark = colorScheme === 'dark';

tabBarStyle: {
  backgroundColor: isDark ? '#0d0d0d' : '#ffffff',
  borderTopColor: isDark ? '#222' : '#e0e0e0',
}
```

### 4. **Customize Tab Bar Height & Padding**

```tsx
tabBarStyle: {
  height: 70,           // Increase tab bar height
  paddingBottom: 10,    // Adjust bottom padding
  paddingTop: 5,        // Add top padding
}
```

### 5. **Add Badge to Tabs**

```tsx
<Tabs.Screen
  name="chat"
  options={{
    title: 'Chat',
    tabBarBadge: 3,  // Show unread count
    tabBarIcon: ({ color, size }) => (
      <Ionicons name="chatbubbles-outline" color={color} size={size} />
    ),
  }}
/>
```

---

## 🧩 Adding New Tabs

To add a new tab (e.g., "Nutrition"):

1. **Create Screen**
   ```tsx
   // screens/NutritionScreen.tsx
   import React from 'react';
   import { View, Text, ScrollView, StyleSheet } from 'react-native';

   export default function NutritionScreen() {
     return (
       <ScrollView style={styles.container}>
         <Text style={styles.title}>Nutrition</Text>
       </ScrollView>
     );
   }

   const styles = StyleSheet.create({
     container: { flex: 1, backgroundColor: '#0d0d0d' },
     title: { fontSize: 28, color: '#fff', padding: 20 },
   });
   ```

2. **Create Tab File**
   ```tsx
   // app/(tabs)/nutrition.tsx
   import NutritionScreen from '../../screens/NutritionScreen';
   export default NutritionScreen;
   ```

3. **Add to _layout.tsx**
   ```tsx
   <Tabs.Screen
     name="nutrition"
     options={{
       title: 'Nutrition',
       tabBarIcon: ({ color, size }) => (
         <Ionicons name="restaurant-outline" color={color} size={size} />
       ),
     }}
   />
   ```

---

## 🔧 TypeScript Type Safety

All screens should follow this pattern for type safety:

```tsx
import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

interface Props {
  // Add props if needed
}

export default function ScreenName(props: Props) {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Screen Title</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d0d0d',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
});
```

---

## 🎭 Screen Components

All screens are located in `/screens/`:

- **DashboardScreen.tsx** - Main landing page with overview
- **ChatScreen.tsx** - Messaging interface
- **DiscoverScreen.tsx** - Content discovery
- **TrainingScreen.tsx** - Workout programs
- **PersonalScreen.tsx** - User profile & settings

---

## 🚦 Navigation Best Practices

1. **Keep tab files simple** - Just import and re-export screens
2. **All logic in screens/** - Keep business logic in screen components
3. **Use components/** - Extract reusable UI into components
4. **Type safety** - Always use TypeScript for better DX
5. **Consistent styling** - Use a shared theme/constants file

---

## 📱 Testing Navigation

1. **Run the app**
   ```bash
   cd mobile
   npm start
   ```

2. **Login** → Should land on **Dashboard** tab

3. **Switch tabs** → All 5 tabs should work

4. **Logout** → Should return to login screen

---

## 🎨 Theme Customization

Create `utils/theme.ts`:

```tsx
export const theme = {
  colors: {
    primary: '#00D4FF',
    background: '#0d0d0d',
    card: '#1a1a1a',
    text: '#ffffff',
    border: '#222',
    tabBar: '#0d0d0d',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
};
```

Then use in `_layout.tsx`:

```tsx
import { theme } from '../../utils/theme';

tabBarStyle: {
  backgroundColor: theme.colors.tabBar,
  borderTopColor: theme.colors.border,
}
```

---

## ✅ Checklist

- [x] 5 main tabs created (Dashboard, Chat, Discover, Training, Profile)
- [x] Each tab imports from screens/
- [x] Bottom tab navigator configured
- [x] Icons assigned to each tab
- [x] Auth routing implemented
- [x] Landing on Dashboard after login
- [x] Type safety maintained
- [x] Clean folder structure

---

## 🔗 Useful Links

- **Expo Router Docs**: https://docs.expo.dev/router/introduction/
- **Expo Icons**: https://icons.expo.fyi/Index
- **React Navigation**: https://reactnavigation.org/

---

**Built with ❤️ for HyperFit**
