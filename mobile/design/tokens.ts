/**
 * HyperFit Design System v6.0 - Premium Wellness Tech Edition
 *
 * A unified design system matching the Login/Register aesthetic
 * - Minimalistic, clean, confident design
 * - Modern wellness-tech vibe
 * - Soft shadows and glassmorphism
 * - Friendly rounded shapes (12-20px)
 */

import { Dimensions, Platform } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ============================================================================
// COLOR PALETTE
// ============================================================================
export const colors = {
  // Background Gradients (deep purple-blue)
  gradientStart: '#0F0F23',
  gradientMid: '#1A1A3E',
  gradientEnd: '#0D0D1A',

  // Alternative lighter backgrounds
  bgLight: '#141428',
  bgCard: '#1E1E3A',
  bgElevated: '#252550',

  // Glass/Card effects
  glass: 'rgba(255, 255, 255, 0.03)',
  glassBorder: 'rgba(255, 255, 255, 0.08)',
  glassLight: 'rgba(255, 255, 255, 0.05)',
  glassMedium: 'rgba(255, 255, 255, 0.07)',

  // Primary Accent (Electric Green - fitness energy)
  primary: '#4ADE80',
  primaryDark: '#22C55E',
  primaryLight: '#86EFAC',
  primaryGlow: 'rgba(74, 222, 128, 0.3)',
  primarySubtle: 'rgba(74, 222, 128, 0.15)',
  primaryBorder: 'rgba(74, 222, 128, 0.4)',

  // Secondary Accent (Purple - tech premium)
  secondary: '#A78BFA',
  secondaryDark: '#7C3AED',
  secondaryLight: '#C4B5FD',
  secondaryGlow: 'rgba(167, 139, 250, 0.3)',
  secondarySubtle: 'rgba(167, 139, 250, 0.15)',

  // Tertiary Accents
  accent: {
    blue: '#60A5FA',
    blueGlow: 'rgba(96, 165, 250, 0.3)',
    cyan: '#22D3EE',
    cyanGlow: 'rgba(34, 211, 238, 0.3)',
    orange: '#FB923C',
    orangeGlow: 'rgba(251, 146, 60, 0.3)',
    pink: '#F472B6',
    pinkGlow: 'rgba(244, 114, 182, 0.3)',
    yellow: '#FBBF24',
    yellowGlow: 'rgba(251, 191, 36, 0.3)',
  },

  // Text Hierarchy
  textPrimary: '#FFFFFF',
  textSecondary: 'rgba(255, 255, 255, 0.7)',
  textMuted: 'rgba(255, 255, 255, 0.5)',
  textDisabled: 'rgba(255, 255, 255, 0.3)',
  textInverse: '#0F0F23',

  // Input/Form States
  inputBg: 'rgba(255, 255, 255, 0.05)',
  inputBorder: 'rgba(255, 255, 255, 0.1)',
  inputBorderFocus: '#4ADE80',
  inputPlaceholder: 'rgba(255, 255, 255, 0.4)',

  // Semantic Colors
  success: '#4ADE80',
  successBg: 'rgba(74, 222, 128, 0.15)',
  error: '#F87171',
  errorBg: 'rgba(248, 113, 113, 0.15)',
  warning: '#FBBF24',
  warningBg: 'rgba(251, 191, 36, 0.15)',
  info: '#60A5FA',
  infoBg: 'rgba(96, 165, 250, 0.15)',

  // Misc
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
  overlay: 'rgba(0, 0, 0, 0.6)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
  divider: 'rgba(255, 255, 255, 0.08)',
};

// ============================================================================
// GRADIENTS
// ============================================================================
export const gradients = {
  // Main backgrounds
  background: ['#0F0F23', '#1A1A3E', '#0D0D1A'] as const,
  backgroundSubtle: ['#0F0F23', '#151530'] as const,
  backgroundReverse: ['#0D0D1A', '#1A1A3E', '#0F0F23'] as const,

  // Card gradients
  card: ['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.02)'] as const,
  cardGlow: ['rgba(74, 222, 128, 0.1)', 'rgba(167, 139, 250, 0.05)'] as const,
  cardPremium: ['rgba(167, 139, 250, 0.1)', 'rgba(74, 222, 128, 0.05)'] as const,

  // Button gradients
  buttonPrimary: ['#4ADE80', '#22C55E'] as const,
  buttonSecondary: ['#A78BFA', '#7C3AED'] as const,
  buttonBlue: ['#60A5FA', '#3B82F6'] as const,
  buttonOrange: ['#FB923C', '#F97316'] as const,

  // Accent gradients
  primaryGlow: ['rgba(74, 222, 128, 0.3)', 'rgba(74, 222, 128, 0)'] as const,
  secondaryGlow: ['rgba(167, 139, 250, 0.3)', 'rgba(167, 139, 250, 0)'] as const,

  // Progress/chart gradients
  progressGreen: ['#4ADE80', '#22C55E', '#16A34A'] as const,
  progressPurple: ['#A78BFA', '#7C3AED', '#6D28D9'] as const,
  progressBlue: ['#60A5FA', '#3B82F6', '#2563EB'] as const,
};

// ============================================================================
// TYPOGRAPHY
// ============================================================================
export const typography = {
  // Font Family (system fonts with fallbacks)
  fontFamily: {
    regular: Platform.select({
      ios: 'System',
      android: 'Roboto',
      default: 'System',
    }),
    medium: Platform.select({
      ios: 'System',
      android: 'Roboto-Medium',
      default: 'System',
    }),
    semiBold: Platform.select({
      ios: 'System',
      android: 'Roboto-Bold',
      default: 'System',
    }),
    bold: Platform.select({
      ios: 'System',
      android: 'Roboto-Bold',
      default: 'System',
    }),
  },

  // Font Sizes
  size: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 17,
    lg: 20,
    xl: 24,
    '2xl': 28,
    '3xl': 32,
    '4xl': 40,
    '5xl': 48,
    '6xl': 56,
  },

  // Font Weights
  weight: {
    regular: '400' as const,
    medium: '500' as const,
    semiBold: '600' as const,
    bold: '700' as const,
  },

  // Line Heights
  lineHeight: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
  },

  // Letter Spacing
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
    wider: 1,
    widest: 2,
  },
};

// ============================================================================
// SPACING (8pt grid system)
// ============================================================================
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
  '6xl': 64,
  '7xl': 80,
};

// ============================================================================
// BORDER RADIUS (Friendly rounded shapes)
// ============================================================================
export const radius = {
  none: 0,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  full: 9999,
};

// ============================================================================
// SHADOWS (Soft, premium elevation)
// ============================================================================
export const shadows = {
  // Soft card shadows
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 12,
  },

  // Colored glow shadows
  primaryGlow: {
    shadowColor: '#4ADE80',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  primaryGlowSubtle: {
    shadowColor: '#4ADE80',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  secondaryGlow: {
    shadowColor: '#A78BFA',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  blueGlow: {
    shadowColor: '#60A5FA',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
  },
  orangeGlow: {
    shadowColor: '#FB923C',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
  },

  // Button shadows
  button: {
    shadowColor: '#4ADE80',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  buttonSecondary: {
    shadowColor: '#A78BFA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },

  // Card elevation
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  cardElevated: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 8,
  },
};

// ============================================================================
// ANIMATION
// ============================================================================
export const animation = {
  duration: {
    fast: 150,
    normal: 250,
    slow: 400,
    slower: 600,
  },
  easing: {
    // Spring configs
    spring: {
      friction: 8,
      tension: 40,
    },
    springBouncy: {
      friction: 6,
      tension: 50,
    },
  },
};

// ============================================================================
// LAYOUT
// ============================================================================
export const layout = {
  screenWidth: SCREEN_WIDTH,
  screenHeight: SCREEN_HEIGHT,
  containerPadding: spacing.xl,
  cardPadding: spacing.lg,
  sectionGap: spacing['3xl'],
  itemGap: spacing.md,
};

// ============================================================================
// Z-INDEX
// ============================================================================
export const zIndex = {
  base: 0,
  card: 1,
  sticky: 10,
  header: 100,
  modal: 1000,
  toast: 1100,
  tooltip: 1200,
};

// ============================================================================
// COMPONENT TOKENS
// ============================================================================
export const componentTokens = {
  // Card component
  card: {
    background: colors.glass,
    border: colors.glassBorder,
    borderRadius: radius.xl,
    padding: spacing.lg,
    shadow: shadows.card,
  },

  // Elevated Card
  cardElevated: {
    background: colors.glassMedium,
    border: colors.glassBorder,
    borderRadius: radius.xl,
    padding: spacing.xl,
    shadow: shadows.cardElevated,
  },

  // Button Primary
  buttonPrimary: {
    background: colors.primary,
    backgroundGradient: gradients.buttonPrimary,
    text: colors.textInverse,
    borderRadius: radius.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing['2xl'],
    shadow: shadows.button,
  },

  // Button Secondary (outline)
  buttonSecondary: {
    background: 'transparent',
    borderColor: colors.primary,
    borderWidth: 1.5,
    text: colors.primary,
    borderRadius: radius.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing['2xl'],
  },

  // Button Ghost
  buttonGhost: {
    background: colors.glassLight,
    text: colors.textSecondary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },

  // Input field
  input: {
    background: colors.inputBg,
    border: colors.inputBorder,
    borderFocus: colors.inputBorderFocus,
    text: colors.textPrimary,
    placeholder: colors.inputPlaceholder,
    borderRadius: radius.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
  },

  // Section header
  sectionHeader: {
    titleSize: typography.size.lg,
    titleWeight: typography.weight.semiBold,
    titleColor: colors.textPrimary,
    subtitleSize: typography.size.sm,
    subtitleColor: colors.textMuted,
  },

  // Navigation bar
  navbar: {
    background: 'rgba(15, 15, 35, 0.95)',
    height: 64,
    borderTopColor: colors.divider,
    iconSize: 24,
    iconInactiveColor: colors.textMuted,
    iconActiveColor: colors.primary,
  },

  // Progress/Metric display
  metric: {
    valueSize: typography.size['3xl'],
    valueWeight: typography.weight.bold,
    valueColor: colors.textPrimary,
    labelSize: typography.size.sm,
    labelColor: colors.textMuted,
    unitSize: typography.size.base,
    unitColor: colors.textSecondary,
  },

  // Badge/Chip
  badge: {
    background: colors.primarySubtle,
    text: colors.primary,
    borderRadius: radius.full,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    fontSize: typography.size.xs,
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

// Get rgba color with custom opacity
export const withOpacity = (color: string, opacity: number): string => {
  // Handle hex colors
  if (color.startsWith('#')) {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  // Handle rgba - replace opacity
  if (color.startsWith('rgba')) {
    return color.replace(/[\d.]+\)$/, `${opacity})`);
  }
  return color;
};

// Responsive size based on screen width
export const responsive = (size: number, scale: number = 0.5): number => {
  const baseWidth = 375; // iPhone SE width
  const scaleFactor = 1 + ((SCREEN_WIDTH - baseWidth) / baseWidth) * scale;
  return Math.round(size * Math.max(0.85, Math.min(1.3, scaleFactor)));
};

// ============================================================================
// DEFAULT EXPORT
// ============================================================================
export const designTokens = {
  colors,
  gradients,
  typography,
  spacing,
  radius,
  shadows,
  animation,
  layout,
  zIndex,
  componentTokens,
  withOpacity,
  responsive,
};

export default designTokens;
