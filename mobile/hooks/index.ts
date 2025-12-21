/**
 * Hooks Index
 * Central export for all custom hooks
 */

// Date/Time hooks
export {
  useDateTime,
  useGreeting,
  useFormattedDate,
  type UseDateTimeReturn,
  type TimeOfDay,
  type Greeting,
  type FormattedDate,
  type FormattedTime,
} from './useDateTime';

// Weather hooks
export {
  useWeather,
  type UseWeatherReturn,
  type UseWeatherState,
  type UseWeatherActions,
  type LocationPermissionStatus,
} from './useWeather';

// Color scheme hooks
export { useColorScheme } from './use-color-scheme';
export { useThemeColor } from './use-theme-color';
