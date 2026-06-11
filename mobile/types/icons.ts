/**
 * Icon Type Definitions
 *
 * Provides a properly typed alias for Ionicons icon names,
 * eliminating the need for `as any` casts throughout the codebase.
 */
import type { ComponentProps } from 'react';
import type { Ionicons } from '@expo/vector-icons';

/**
 * Union type of all valid Ionicons icon names.
 * Derived directly from the Ionicons glyph map.
 */
export type IoniconsName = ComponentProps<typeof Ionicons>['name'];

/**
 * Helper to assert a string is a valid Ionicons name at the type level.
 * Use this when icon names come from data (e.g., API responses, config objects)
 * where you trust the values but TypeScript can't verify them statically.
 */
export function asIconName(name: string): IoniconsName {
  return name as IoniconsName;
}
