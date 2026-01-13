# HyperFit Unified Design System
## Neon-Brutalist Aesthetic Across All Screens

**Version 2.0** | Last Updated: November 2025

---

## Overview

The HyperFit app now has a completely unified neon-brutalist design system that creates a seamless visual experience from login through all post-login screens. Every interface element follows the same aesthetic DNA.

---

## Visual Philosophy

### One Continuous World

Every screen in HyperFit feels like part of the same futuristic fitness OS:
- **Pre-Login** (Login/Register) → **Post-Login** (Dashboard/Profile/Training/etc.)
- Same color palette
- Same typography
- Same neon glow effects
- Same component patterns
- Same animation language

### Core Visual Principles

1. **Dark Matte Base**: Rich Black (#000F0B) with subtle gradients
2. **Neon Highlights**: Mountain Meadow (#2CC295) for borders, accents, glows
3. **Brutalist Geometry**: Sharp rectangles, no rounded corners except MD radius
4. **Technical Typography**: All caps, wide letter-spacing, geometric fonts
5. **Minimal Icons**: Simple, line-based Ionicons
6. **Glow Effects**: Soft neon shadows on interactive elements

---

## Color System

### Primary Palette (Used Globally)

```typescript
Rich Black:        #000F0B  // Main background
Dark Green:        #022221  // Secondary dark
Bangladesh Green:  #03624C  // Card backgrounds

Mountain Meadow:   #2CC295  // Primary neon accent
Caribbean Green:   #00BF81  // Secondary neon accent

Anti-Flash White:  #F7F7F6  // Primary text
Pistachio:         #B8E6D5  // Secondary text
Stone:             #8E9E9D  // Muted text
```

### Semantic Colors

```typescript
Success:  #2CC295  // Mountain Meadow
Error:    #FF4757  // Red for logout, errors
Warning:  #FFA502  // Orange for alerts
Frog:     #4CAF50  // Bright green for positive trends
```

### Gradients

```typescript
// Background gradients (all screens)
background: ['#000F0B', '#022221', '#03624C']
backgroundSubtle: ['#000F0B', '#022221']

// Button gradients
buttonPrimary: ['#2CC295', '#00BF81']
neonPrimary: ['#2CC295', '#00BF81']
```

---

## Typography System

### Font Family
**AxiForma** (System fallback until custom font loaded)
- Regular (400)
- Medium (500)
- Semi Bold (600)
- Bold (700)

### Size Scale

```typescript
xs:   11px  // Labels, captions, timestamps
sm:   13px  // Secondary text, metadata
base: 15px  // Body text
md:   16px  // Card titles, buttons
lg:   18px  // Section titles, values
xl:   20px  // Large values
2xl:  24px  // Stats, measurements
3xl:  28px  // Modal titles
4xl:  32px  // Dashboard stat values
5xl:  40px  // Page titles ("DASHBOARD", "PROFILE")
```

### Letter Spacing

```typescript
tight:   -0.5px // Large numbers
normal:   0px   // Body text
wide:     0.5px // NOT USED
wider:    1px   // Labels
ultrawide: 2px  // Buttons, section titles
max:      4px   // Page titles
```

### Text Transform
ALL page titles, section headers, buttons, labels → `uppercase`

---

## Component Patterns

### 1. Screen Layout (All Screens)

```typescript
<View style={styles.container}>
  <LinearGradient colors={theme.gradients.background} style={styles.backgroundGradient} />

  <ScrollView contentContainerStyle={styles.scrollContent}>
    <Animated.View style={{ opacity: fadeAnim }}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>SCREEN NAME</Text>
        <Text style={styles.subtitle}>SUBTITLE OR CONTEXT</Text>
      </View>

      {/* Content */}
      {/* ... */}
    </Animated.View>
  </ScrollView>
</View>
```

**Common Styles**:
```typescript
container: {
  flex: 1,
  backgroundColor: theme.colors.richBlack,
},
backgroundGradient: {
  position: 'absolute',
  left: 0, right: 0, top: 0, bottom: 0,
},
scrollContent: {
  padding: theme.spacing.lg,
  paddingTop: theme.spacing['3xl'],
},
```

### 2. Page Titles

```typescript
<Text style={styles.title}>DASHBOARD</Text>

// Styles
title: {
  fontSize: theme.typography.fontSize['5xl'], // 40px
  fontWeight: '700',
  color: theme.colors.antiFlashWhite,
  letterSpacing: 4,
  textTransform: 'uppercase',
}
```

### 3. Stat Cards (2-column grid)

```typescript
<View style={styles.statsGrid}>
  <View style={styles.statCard}>
    <Ionicons name="trophy-outline" size={24} color={theme.colors.mountainMeadow} />
    <Text style={styles.statValue}>12</Text>
    <Text style={styles.statLabel}>ACTIVE GOALS</Text>
  </View>
</View>

// Styles
statsGrid: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: theme.spacing.md,
},
statCard: {
  width: '47%',
  backgroundColor: theme.colors.bangladeshGreen,
  borderWidth: 1,
  borderColor: theme.colors.mountainMeadow,
  borderRadius: theme.borderRadius.md,
  padding: theme.spacing.md,
  shadowColor: theme.colors.mountainMeadow,
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0.3,
  shadowRadius: 8,
},
```

### 4. Detail Cards

```typescript
<View style={styles.card}>
  <Text style={styles.cardTitle}>CARD TITLE</Text>
  {/* Content */}
</View>

// Styles
card: {
  backgroundColor: theme.colors.bangladeshGreen,
  borderWidth: 1,
  borderColor: theme.colors.mountainMeadow,
  borderRadius: theme.borderRadius.md,
  padding: theme.spacing.lg,
  marginBottom: theme.spacing.lg,
  shadowColor: theme.colors.mountainMeadow,
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0.2,
  shadowRadius: 8,
},
```

### 5. Primary Buttons (Gradient)

```typescript
<TouchableOpacity style={styles.button} onPress={handleAction} activeOpacity={0.8}>
  <LinearGradient
    colors={theme.gradients.buttonPrimary}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 0 }}
    style={styles.buttonGradient}
  >
    <Ionicons name="icon-name" size={20} color={theme.colors.richBlack} />
    <Text style={styles.buttonText}>BUTTON TEXT</Text>
  </LinearGradient>
</TouchableOpacity>

// Styles
button: {
  borderRadius: theme.borderRadius.md,
  overflow: 'hidden',
  shadowColor: theme.colors.mountainMeadow,
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0.4,
  shadowRadius: 12,
},
buttonGradient: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing.lg,
  gap: theme.spacing.sm,
},
buttonText: {
  color: theme.colors.richBlack,
  fontSize: theme.typography.fontSize.md,
  fontWeight: '700',
  letterSpacing: 2,
  textTransform: 'uppercase',
},
```

### 6. Loading States

```typescript
<View style={styles.loadingContainer}>
  <LinearGradient colors={theme.gradients.background} style={styles.backgroundGradient} />
  <ActivityIndicator size="large" color={theme.colors.mountainMeadow} />
  <Text style={styles.loadingText}>LOADING...</Text>
</View>
```

### 7. Tab Navigation

```typescript
tabBarStyle: {
  backgroundColor: theme.colors.richBlack,
  borderTopWidth: 1,
  borderTopColor: theme.colors.mountainMeadow,
  paddingBottom: 8,
  paddingTop: 8,
  height: 70,
  shadowColor: theme.colors.mountainMeadow,
  shadowOffset: { width: 0, height: -2 },
  shadowOpacity: 0.2,
  shadowRadius: 8,
},
tabBarActiveTintColor: theme.colors.mountainMeadow,
tabBarInactiveTintColor: theme.colors.stone,
```

### 8. Modals

```typescript
<Modal visible={isVisible} animationType="fade" transparent={true}>
  <View style={styles.modalOverlay}>
    <View style={styles.modalContainer}>
      <LinearGradient colors={theme.gradients.backgroundSubtle} style={styles.modalGradient}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>MODAL TITLE</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={28} color={theme.colors.antiFlashWhite} />
          </TouchableOpacity>
        </View>

        {/* Modal Content */}
      </LinearGradient>
    </View>
  </View>
</Modal>

// Styles
modalOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0, 15, 11, 0.95)',
  justifyContent: 'center',
  alignItems: 'center',
  padding: theme.spacing.lg,
},
modalContainer: {
  width: '100%',
  maxWidth: 400,
  borderRadius: theme.borderRadius.lg,
  borderWidth: 1,
  borderColor: theme.colors.mountainMeadow,
  overflow: 'hidden',
  shadowColor: theme.colors.mountainMeadow,
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0.5,
  shadowRadius: 20,
},
```

---

## Animations

### Fade-In (All Screens)

```typescript
const fadeAnim = useState(new Animated.Value(0))[0];

useEffect(() => {
  Animated.timing(fadeAnim, {
    toValue: 1,
    duration: 800,
    useNativeDriver: true,
  }).start();
}, []);

<Animated.View style={{ opacity: fadeAnim }}>
  {/* Content */}
</Animated.View>
```

### Pulse (Stat Cards)

```typescript
const pulseAnim = useRef(new Animated.Value(1)).current;

useEffect(() => {
  Animated.loop(
    Animated.sequence([
      Animated.timing(pulseAnim, { toValue: 1.02, duration: 1000, useNativeDriver: true }),
      Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
    ])
  ).start();
}, []);

<Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
  <StatCard {...props} />
</Animated.View>
```

---

## Screen-by-Screen Implementation

### Login Screen ✓
- HyperFitLogo with neon glow
- "LOGIN" title (40px, 4px letter-spacing)
- "TRAIN. TRACK. TRANSFORM." tagline
- NeonInput components
- Gradient button
- Dark gradient background

### Register Screen ✓
- Same as Login
- "REGISTER" title
- "BEGIN YOUR TRANSFORMATION" tagline

### Tab Navigation ✓
- Rich Black background
- Mountain Meadow top border
- Uppercase tab labels
- Neon active state

### Dashboard Screen ✓ (screens/DashboardScreen.tsx)
- "DASHBOARD" title
- 4-card stats grid (Active Goals, Measurements, Completed, Days Active)
- Latest Measurement card
- Active Goals with gradient progress bars
- Motivational quote card
- "EXPLORE WORKOUTS" CTA button
- Fade-in animation
- Pull-to-refresh with neon indicator

### Profile Screen ✓ (screens/PersonalScreen.tsx)
- "PROFILE" title
- User card with avatar, username, email
- Premium badge (if applicable)
- Detail cards (Full Name, Height, Weight, Fitness Level, Activity Level)
- "EDIT PROFILE" button (gradient)
- "LOGOUT" button (red border, red text)
- Neon modal for editing profile
- NeonInput components in modal

### Remaining Screens (Training, Chat, Discover)
- Follow same pattern as Dashboard/Profile
- Use same components, colors, typography
- Maintain brutalist aesthetic
- No emojis, all icons from Ionicons

---

## Before & After Examples

### Before (Old Design)
```typescript
// OLD - Generic dark theme
backgroundColor: "#0d0d0d"  // Generic dark gray
color: "#6C63FF"            // Purple accent (NOT HyperFit)
fontSize: 26                // Arbitrary sizes
emoji: "🏋️"                // Emoji icons

// OLD - Inconsistent styles
title: { fontSize: 26, color: "#fff" }
button: { backgroundColor: "#6C63FF" }  // Generic purple
```

### After (Unified Neon-Brutalist)
```typescript
// NEW - HyperFit system
backgroundColor: theme.colors.richBlack         // #000F0B
borderColor: theme.colors.mountainMeadow        // #2CC295
fontSize: theme.typography.fontSize['5xl']      // 40px
icon: <Ionicons name="barbell-outline" />       // Geometric icons

// NEW - Consistent system
title: {
  fontSize: theme.typography.fontSize['5xl'],
  fontWeight: '700',
  color: theme.colors.antiFlashWhite,
  letterSpacing: 4,
  textTransform: 'uppercase',
}
button: LinearGradient(theme.gradients.buttonPrimary)  // Neon gradient
```

---

## Implementation Checklist

### Completed ✓
- [x] Theme system (utils/theme.ts)
- [x] Login screen
- [x] Register screen
- [x] Tab navigation
- [x] Dashboard screen
- [x] Profile screen
- [x] NeonInput component
- [x] NeonButton component
- [x] HyperFitLogo component
- [x] StatCard component
- [x] WorkoutCard component

### Remaining
- [ ] Training screen
- [ ] Chat screen
- [ ] Discover screen
- [ ] ChartWidget component (with react-native-chart-kit)
- [ ] Additional screens as needed

---

## Usage Guidelines

### DO ✓
- Use `theme.colors.*` for all colors
- Use `theme.typography.fontSize.*` for all font sizes
- Use `theme.spacing.*` for all spacing
- Transform all titles/labels to uppercase
- Add neon glow shadows to interactive elements
- Use LinearGradient for backgrounds and buttons
- Use Ionicons for all icons
- Fade in screens on mount
- Use Mountain Meadow for primary actions

### DON'T ✗
- Use hardcoded color values
- Use hardcoded font sizes
- Use emojis anywhere
- Use lowercase for titles/labels
- Use flat colors for buttons
- Use generic dark grays (#1a1a1a, etc.)
- Use non-HyperFit colors (purple, blue, etc.)

---

## Testing the Unified System

### Visual Consistency Checklist

1. **Navigate through all screens** - Do they all feel like the same app?
2. **Check colors** - Only HyperFit palette colors visible?
3. **Check typography** - All titles uppercase with correct letter-spacing?
4. **Check animations** - Smooth fade-ins on all screens?
5. **Check buttons** - All use neon gradient?
6. **Check borders** - All use Mountain Meadow (#2CC295)?
7. **Check icons** - No emojis, only Ionicons?

### Expected Experience

From Login → Dashboard → Profile → any screen:
- Seamless visual flow
- Same dark gradient backgrounds
- Same neon accents
- Same brutalist geometry
- Same typography treatment
- **One continuous HyperFit universe**

---

## Resources

- **Theme File**: `utils/theme.ts`
- **Components**: `components/atoms/`
- **Screens**: `screens/`
- **Design Docs**: `DESIGN_SYSTEM.md`
- **Implementation Guide**: `IMPLEMENTATION_GUIDE.md`

---

**HyperFit Development Team**
Design System v2.0 - Unified Neon-Brutalist Aesthetic
