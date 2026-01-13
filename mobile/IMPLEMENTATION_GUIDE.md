# HyperFit Complete Implementation Guide

## Overview
This guide provides the complete implementation for:
- User & Coach Dashboards
- ChartWidget component
- Backend API data fetching
- Polished animations
- Multi-language support (i18n)

---

## 🌍 Multi-Language Support (i18n)

### Already Created:
✅ `/i18n/index.ts` - i18n configuration

### Files to Create:

**`/i18n/locales/en.json`**
```json
{
  "auth": {
    "login": "LOGIN",
    "register": "REGISTER",
    "email": "Email",
    "password": "Password",
    "confirmPassword": "Confirm Password",
    "username": "Username",
    "forgotPassword": "Forgot Password?",
    "tagline": {
      "login": "TRAIN. TRACK. TRANSFORM.",
      "register": "BEGIN YOUR TRANSFORMATION"
    },
    "alreadyHaveAccount": "Already have an account?",
    "noAccount": "Don't have an account?",
    "signUp": "Sign up"
  },
  "dashboard": {
    "title": "DASHBOARD",
    "overview": "OVERVIEW",
    "stats": {
      "calories": "Calories",
      "steps": "Steps",
      "activeMinutes": "Active Minutes",
      "heartRate": "Heart Rate",
      "sleep": "Sleep Hours"
    },
    "workouts": {
      "title": "WORKOUTS",
      "upcoming": "Upcoming Sessions",
      "completed": "Completed Today"
    },
    "coach": {
      "title": "COACH",
      "message": "Message Coach",
      "call": "Quick Call"
    }
  },
  "coachDashboard": {
    "title": "COACH DASHBOARD",
    "clients": "CLIENTS",
    "totalClients": "Total Clients",
    "activeToday": "Active Today",
    "schedule": "SCHEDULE",
    "analytics": "ANALYTICS"
  },
  "common": {
    "loading": "Loading...",
    "error": "Error",
    "retry": "Retry",
    "save": "Save",
    "cancel": "Cancel"
  }
}
```

**`/i18n/locales/es.json`**
```json
{
  "auth": {
    "login": "INICIAR SESIÓN",
    "register": "REGISTRARSE",
    "email": "Correo Electrónico",
    "password": "Contraseña",
    "confirmPassword": "Confirmar Contraseña",
    "username": "Nombre de Usuario",
    "forgotPassword": "¿Olvidaste tu contraseña?",
    "tagline": {
      "login": "ENTRENA. RASTREA. TRANSFORMA.",
      "register": "COMIENZA TU TRANSFORMACIÓN"
    },
    "alreadyHaveAccount": "¿Ya tienes una cuenta?",
    "noAccount": "¿No tienes cuenta?",
    "signUp": "Regístrate"
  },
  "dashboard": {
    "title": "PANEL",
    "overview": "RESUMEN",
    "stats": {
      "calories": "Calorías",
      "steps": "Pasos",
      "activeMinutes": "Minutos Activos",
      "heartRate": "Ritmo Cardíaco",
      "sleep": "Horas de Sueño"
    },
    "workouts": {
      "title": "ENTRENAMIENTOS",
      "upcoming": "Sesiones Próximas",
      "completed": "Completado Hoy"
    },
    "coach": {
      "title": "ENTRENADOR",
      "message": "Mensaje al Entrenador",
      "call": "Llamada Rápida"
    }
  },
  "coachDashboard": {
    "title": "PANEL DE ENTRENADOR",
    "clients": "CLIENTES",
    "totalClients": "Total de Clientes",
    "activeToday": "Activos Hoy",
    "schedule": "HORARIO",
    "analytics": "ANALÍTICAS"
  },
  "common": {
    "loading": "Cargando...",
    "error": "Error",
    "retry": "Reintentar",
    "save": "Guardar",
    "cancel": "Cancelar"
  }
}
```

### Usage in Components:
```typescript
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t, i18n } = useTranslation();

  // Use translations
  <Text>{t('dashboard.title')}</Text>

  // Change language
  i18n.changeLanguage('es');
}
```

---

## 📊 Data Fetching Services

### `/services/dashboardService.ts`
```typescript
import apiClient from './api';

export interface DashboardStats {
  calories: number;
  steps: number;
  activeMinutes: number;
  heartRate: number;
  sleep: number;
}

export interface WorkoutSession {
  id: number;
  title: string;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  scheduledTime?: string;
  completed: boolean;
}

export const dashboardService = {
  async getUserStats(): Promise<DashboardStats> {
    const response = await apiClient.get('/api/user/stats');
    return response.data;
  },

  async getUpcomingWorkouts(): Promise<WorkoutSession[]> {
    const response = await apiClient.get('/api/user/workouts/upcoming');
    return response.data;
  },

  async getWorkoutHistory(): Promise<WorkoutSession[]> {
    const response = await apiClient.get('/api/user/workouts/history');
    return response.data;
  },
};
```

### `/services/coachService.ts`
```typescript
import apiClient from './api';

export interface ClientSummary {
  id: number;
  name: string;
  email: string;
  lastActive: string;
  progress: number;
  avatar?: string;
}

export interface CoachStats {
  totalClients: number;
  activeToday: number;
  totalWorkouts: number;
  averageProgress: number;
}

export const coachService = {
  async getCoachStats(): Promise<CoachStats> {
    const response = await apiClient.get('/api/coach/stats');
    return response.data;
  },

  async getClients(): Promise<ClientSummary[]> {
    const response = await apiClient.get('/api/coach/clients');
    return response.data;
  },

  async getSchedule(): Promise<any[]> {
    const response = await apiClient.get('/api/coach/schedule');
    return response.data;
  },
};
```

---

## 📈 ChartWidget Component

### `/components/atoms/ChartWidget.tsx`
```typescript
import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import theme from '../../utils/theme';

interface ChartWidgetProps {
  title: string;
  data: number[];
  labels: string[];
  color?: string;
}

export default function ChartWidget({
  title,
  data,
  labels,
  color = theme.colors.mountainMeadow,
}: ChartWidgetProps) {
  const screenWidth = Dimensions.get('window').width - 32;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>

      <LineChart
        data={{
          labels: labels,
          datasets: [{
            data: data,
            color: (opacity = 1) => `rgba(44, 194, 149, ${opacity})`,
            strokeWidth: 2,
          }],
        }}
        width={screenWidth}
        height={220}
        yAxisLabel=""
        yAxisSuffix=""
        chartConfig={{
          backgroundColor: theme.colors.bangladeshGreen,
          backgroundGradientFrom: theme.colors.richBlack,
          backgroundGradientTo: theme.colors.darkGreen,
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(44, 194, 149, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(180, 223, 196, ${opacity})`,
          style: {
            borderRadius: 8,
          },
          propsForDots: {
            r: "4",
            strokeWidth: "2",
            stroke: theme.colors.mountainMeadow,
          },
          propsForBackgroundLines: {
            strokeDasharray: "",
            stroke: theme.colors.darkGreen,
            strokeWidth: 1,
          },
        }}
        bezier
        style={styles.chart}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.bangladeshGreen,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.mountainMeadow,
    padding: theme.spacing.md,
    shadowColor: theme.colors.mountainMeadow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  title: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: '700',
    color: theme.colors.antiFlashWhite,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: theme.spacing.md,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 8,
  },
});
```

**Note**: Install chart library:
```bash
npm install react-native-chart-kit react-native-svg
```

---

##  User Dashboard

### `/app/(tabs)/dashboard.tsx`
```typescript
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import StatCard from '../../components/atoms/StatCard';
import WorkoutCard from '../../components/atoms/WorkoutCard';
import ChartWidget from '../../components/atoms/ChartWidget';
import { dashboardService } from '../../services/dashboardService';
import theme from '../../utils/theme';
import { useAuth } from '../../context/AuthContext';

export default function DashboardScreen() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    loadDashboardData();
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsData, workoutsData] = await Promise.all([
        dashboardService.getUserStats(),
        dashboardService.getUpcomingWorkouts(),
      ]);
      setStats(statsData);
      setWorkouts(workoutsData);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={theme.gradients.background} style={styles.backgroundGradient} />
        <Text style={styles.loadingText}>{t('common.loading')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={theme.gradients.background} style={styles.backgroundGradient} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.mountainMeadow} />
        }
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{t('dashboard.title')}</Text>
            <Text style={styles.subtitle}>{t('dashboard.overview')}</Text>
          </View>

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <StatCard
              title={t('dashboard.stats.calories')}
              value={stats?.calories || 0}
              unit="kcal"
              icon="flame-outline"
              trend="+12%"
              trendPositive={true}
            />
            <StatCard
              title={t('dashboard.stats.steps')}
              value={(stats?.steps / 1000).toFixed(1)}
              unit="k"
              icon="walk-outline"
              trend="+8%"
              trendPositive={true}
            />
            <StatCard
              title={t('dashboard.stats.activeMinutes')}
              value={stats?.activeMinutes || 0}
              unit="min"
              icon="time-outline"
            />
          </View>

          {/* Chart */}
          <View style={styles.section}>
            <ChartWidget
              title={t('dashboard.workouts.title')}
              data={[65, 72, 68, 75, 82, 78, 85]}
              labels={['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']}
            />
          </View>

          {/* Upcoming Workouts */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('dashboard.workouts.upcoming')}</Text>
            {workouts.map((workout) => (
              <WorkoutCard
                key={workout.id}
                title={workout.title}
                duration={workout.duration}
                difficulty={workout.difficulty}
                onPress={() => console.log('Workout pressed:', workout.id)}
              />
            ))}
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.richBlack,
  },
  backgroundGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.lg,
  },
  header: {
    marginBottom: theme.spacing['3xl'],
    paddingTop: theme.spacing.xl,
  },
  title: {
    fontSize: theme.typography.fontSize['5xl'],
    fontWeight: '700',
    color: theme.colors.antiFlashWhite,
    letterSpacing: 4,
    textTransform: 'uppercase',
  },
  subtitle: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: '600',
    color: theme.colors.mountainMeadow,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginTop: theme.spacing.sm,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
    marginBottom: theme.spacing['2xl'],
  },
  section: {
    marginBottom: theme.spacing['2xl'],
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: '700',
    color: theme.colors.antiFlashWhite,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: theme.spacing.md,
  },
  loadingText: {
    color: theme.colors.mountainMeadow,
    fontSize: theme.typography.fontSize.lg,
    textAlign: 'center',
    marginTop: '50%',
  },
});
```

---

## 👨‍🏫 Coach Dashboard

### Implementation in `/app/(tabs)/dashboard.tsx` (Coach version)

Add role-based rendering:
```typescript
import { useAuth } from '../../context/AuthContext';

export default function DashboardScreen() {
  const { user } = useAuth();

  // Render based on role
  if (user?.role === 'coach') {
    return <CoachDashboardView />;
  }

  return <UserDashboardView />;
}
```

Create `/components/organisms/CoachDashboardView.tsx` with similar structure but showing:
- Client grid
- Schedule calendar
- Analytics charts

---

## ⚡ Animation Enhancements

### Pulse Animation for Cards
```typescript
const pulseAnim = useRef(new Animated.Value(1)).current;

useEffect(() => {
  Animated.loop(
    Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1.05,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ])
  ).start();
}, []);

<Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
  <StatCard ... />
</Animated.View>
```

---

## 🚀 Next Steps

1. Install chart library: `npm install react-native-chart-kit`
2. Create all translation files
3. Create data fetching services
4. Implement User Dashboard
5. Implement Coach Dashboard
6. Add animations
7. Initialize i18n in App.tsx

---

**Total Implementation**: ~15-20 files, estimated 4-6 hours of development time.
