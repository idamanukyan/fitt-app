import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function Index() {
  const { isAuthenticated, isLoading, isCoach, user } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inCoachTabs = segments[0] === '(coach-tabs)';
    const inUserTabs = segments[0] === '(tabs)';

    // Determine the correct home route based on role
    const getHomeRoute = () => {
      if (isCoach) {
        return '/(coach-tabs)/clients';
      }
      return '/(tabs)/dashboard';
    };

    if (!isAuthenticated && !inAuthGroup) {
      // Redirect to login if not authenticated
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      // Redirect to appropriate dashboard after successful login
      router.replace(getHomeRoute());
    } else if (isAuthenticated && (!segments || (segments as string[]).length === 0)) {
      // Initial load with auth - route based on role
      router.replace(getHomeRoute());
    } else if (!isAuthenticated && (!segments || (segments as string[]).length === 0)) {
      // Initial load without auth
      router.replace('/(auth)/login');
    } else if (isAuthenticated) {
      // Check if user is in wrong tab group for their role
      if (isCoach && inUserTabs) {
        router.replace('/(coach-tabs)/clients');
      } else if (!isCoach && inCoachTabs) {
        router.replace('/(tabs)/dashboard');
      }
    }
  }, [isAuthenticated, isLoading, segments, isCoach]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#6C63FF" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d0d0d',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
