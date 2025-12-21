/**
 * Workout Index Route - Redirects to training tab
 */
import { Redirect } from 'expo-router';

export default function WorkoutIndex() {
  return <Redirect href="/(tabs)/training" />;
}
