/**
 * HyperFit Design System v5.0 - High-Tech Architecture Edition
 * Inspired by: Centre Pompidou, Lloyd's Building, Hong Kong HSBC
 *
 * Style: High-tech architecture with Futurism & Brutalist elements
 * Materials: Exposed concrete, industrial steel, technical glass
 * Mood: Monumental, structural, industrial precision
 */

export const theme = {
  // High-Tech Industrial Color Palette
  colors: {
    // Concrete & Structure (Brutalist foundation)
    concrete: '#3C3C3C',          // Raw concrete - primary background
    concreteLight: '#5A5A5A',     // Lighter concrete - cards
    concreteDark: '#2B2B2B',      // Dark concrete - deep backgrounds
    black: '#1A1A1A',             // Deep black - shadows

    // Industrial Metals (High-tech elements)
    steel: '#B0B8C1',             // Brushed steel - text
    steelDark: '#6B7280',         // Dark steel - secondary text
    chrome: '#E5E7EB',            // Chrome - highlights
    iron: '#4B5563',              // Iron - borders

    // Technical Accent Colors (Futurist energy)
    techBlue: '#0EA5E9',          // Technical blue - primary accent
    techCyan: '#06B6D4',          // Cyan - links, info
    techOrange: '#F97316',        // Warning orange - alerts
    techGreen: '#10B981',         // System green - success
    techRed: '#EF4444',           // Alert red - errors

    // Legacy compatibility aliases
    lightGreen: '#10B981',
    neonGreen: '#10B981',
    neonPink: '#EF4444',
    neonCyan: '#06B6D4',
    neonPurple: '#8B5CF6',
    neonOrange: '#F97316',
    neonBlue: '#0EA5E9',
    oliveBlack: '#3C3C3C',
    darkGreen: '#2B2B2B',

    // Neutral Palette
    white: '#F9FAFB',             // Off-white - primary text
    darkGray: '#6B7280',          // Gray - secondary text
    transparent: 'transparent',   // Transparent - outline variants

    // Semantic Colors
    success: '#10B981',           // Tech green
    error: '#EF4444',             // Tech red
    warning: '#F97316',           // Tech orange
    info: '#06B6D4',              // Tech cyan

    // Industrial Textures & Effects
    overlay: 'rgba(26, 26, 26, 0.92)',
    overlayLight: 'rgba(60, 60, 60, 0.8)',
    glassEffect: 'rgba(176, 184, 193, 0.08)',     // Frosted glass
    metalGradient: 'rgba(229, 231, 235, 0.15)',   // Metal sheen

    // Technical Glow Effects (subtle, industrial)
    lightGreenGlow: 'rgba(16, 185, 129, 0.25)',
    lightGreenBorder: 'rgba(16, 185, 129, 0.4)',
    neonPinkGlow: 'rgba(239, 68, 68, 0.3)',
    neonCyanGlow: 'rgba(6, 182, 212, 0.3)',
    neonPurpleGlow: 'rgba(139, 92, 246, 0.3)',
    neonOrangeGlow: 'rgba(249, 115, 22, 0.3)',
    techBlueGlow: 'rgba(14, 165, 233, 0.35)',
  },

  // Typography System - Urbanist Family
  typography: {
    // Font Families
    fontFamily: {
      regular: 'System',      // Will be Urbanist Regular when loaded
      medium: 'System',       // Will be Urbanist Medium
      semiBold: 'System',     // Will be Urbanist Semi-Bold
    },

    // Font Sizes - Based on Reference
    fontSize: {
      // Reference Sizes
      heading: 48,            // Heading 01 - 48px Semi-Bold
      body: 16,               // Body - 16px Regular
      caption: 12,            // Caption - 12px Regular

      // Extended Scale
      xs: 11,
      sm: 13,
      base: 16,
      md: 18,
      lg: 20,
      xl: 24,
      '2xl': 32,
      '3xl': 40,
      '4xl': 48,
      '5xl': 56,
    },

    // Font Weights
    fontWeight: {
      regular: '400',
      medium: '500',
      semiBold: '600',
      bold: '700',
    },

    // Line Heights
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75,
    },

    // Letter Spacing
    letterSpacing: {
      tight: -0.5,
      normal: 0,
      wide: 0.5,
      wider: 1,
      widest: 2,
    },
  },

  // Spacing System (8pt grid)
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    '2xl': 40,
    '3xl': 48,
    '4xl': 64,
    '5xl': 80,
  },

  // Border Radius - Angular & Geometric (High-tech/Brutalist)
  borderRadius: {
    none: 0,              // Sharp corners for structural elements
    sm: 2,                // Minimal rounding
    md: 4,                // Subtle industrial rounding
    lg: 6,                // Card corners
    xl: 8,                // Maximum rounding
    '2xl': 12,            // Rare soft elements
    full: 9999,           // Circles only
  },

  // Industrial Shadows & Technical Glows
  shadows: {
    // Technical Glows - Subtle & Precise (Futurist elements)
    techBlueGlow: {
      shadowColor: '#0EA5E9',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.45,
      shadowRadius: 12,
      elevation: 6,
    },
    techCyanGlow: {
      shadowColor: '#06B6D4',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.4,
      shadowRadius: 10,
      elevation: 5,
    },
    techGreenGlow: {
      shadowColor: '#10B981',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.4,
      shadowRadius: 10,
      elevation: 5,
    },
    techOrangeGlow: {
      shadowColor: '#F97316',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.4,
      shadowRadius: 10,
      elevation: 5,
    },

    // Structural Shadows (Brutalist depth)
    concrete: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.7,
      shadowRadius: 8,
      elevation: 4,
    },
    concreteDeep: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.8,
      shadowRadius: 12,
      elevation: 6,
    },

    // Metal Reflections (High-tech materials)
    steel: {
      shadowColor: '#B0B8C1',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 2,
    },

    // Legacy compatibility aliases
    neonGreenGlow: {
      shadowColor: '#10B981',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.4,
      shadowRadius: 10,
      elevation: 5,
    },
    neonPinkGlow: {
      shadowColor: '#EF4444',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.4,
      shadowRadius: 10,
      elevation: 5,
    },
    neonCyanGlow: {
      shadowColor: '#06B6D4',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.4,
      shadowRadius: 10,
      elevation: 5,
    },
    neonPurpleGlow: {
      shadowColor: '#8B5CF6',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.4,
      shadowRadius: 10,
      elevation: 5,
    },
    neonOrangeGlow: {
      shadowColor: '#F97316',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.4,
      shadowRadius: 10,
      elevation: 5,
    },
    neonPrimary: {
      shadowColor: '#0EA5E9',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.45,
      shadowRadius: 12,
      elevation: 6,
    },
    neonSubtle: {
      shadowColor: '#0EA5E9',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 3,
    },
    neonButton: {
      shadowColor: '#0EA5E9',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.35,
      shadowRadius: 10,
      elevation: 5,
    },
    oliveGlow: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.7,
      shadowRadius: 8,
      elevation: 4,
    },

    // Standard Shadows
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 6,
      elevation: 3,
    },
  },

  // Gradient Definitions - Industrial & Technical
  gradients: {
    // Concrete Backgrounds (Brutalist foundation)
    background: ['#1A1A1A', '#2B2B2B', '#3C3C3C'],          // Deep black to concrete
    backgroundSubtle: ['#2B2B2B', '#3C3C3C'],               // Dark to light concrete
    concreteTexture: ['#3C3C3C', '#5A5A5A', '#3C3C3C'],    // Concrete depth

    // Metal Gradients (High-tech elements)
    steel: ['#B0B8C1', '#9CA3AF', '#6B7280'],              // Brushed steel
    chrome: ['#E5E7EB', '#D1D5DB', '#9CA3AF'],             // Chrome polish
    iron: ['#6B7280', '#4B5563', '#374151'],               // Dark iron

    // Technical Accent Gradients (Futurist energy)
    techBlue: ['#0EA5E9', '#0284C7', '#0369A1'],           // Technical blue
    techCyan: ['#06B6D4', '#0891B2', '#0E7490'],           // System cyan
    techOrange: ['#F97316', '#EA580C', '#C2410C'],         // Alert orange
    techGreen: ['#10B981', '#059669', '#047857'],          // Success green

    // Legacy compatibility
    neonGreen: ['#10B981', '#059669'],
    neonPink: ['#EF4444', '#DC2626'],
    neonCyan: ['#06B6D4', '#0891B2'],
    neonPurple: ['#8B5CF6', '#7C3AED'],
    neonOrange: ['#F97316', '#EA580C'],
    neonPrimary: ['#0EA5E9', '#0284C7'],                   // Tech blue - primary gradient

    // Button Gradients - Technical & Precise
    buttonPrimary: ['#0EA5E9', '#0284C7'],                 // Tech blue
    buttonSecondary: ['#10B981', '#059669'],               // Tech green
    buttonInfo: ['#06B6D4', '#0891B2'],                    // Tech cyan
    buttonPremium: ['#8B5CF6', '#7C3AED'],                 // Tech purple
    buttonGlow: ['rgba(14, 165, 233, 0.3)', 'rgba(14, 165, 233, 0)'],

    // Card Gradients - Industrial materials
    cardSteel: ['rgba(176, 184, 193, 0.12)', 'rgba(107, 114, 128, 0.08)', 'rgba(60, 60, 60, 0)'],
    cardGlow: ['rgba(60, 60, 60, 0.9)', 'rgba(43, 43, 43, 0.6)'],
  },

  // Animation Timings - Smooth and Controlled
  animation: {
    fast: 150,
    normal: 250,         // 0.25s as specified
    slow: 400,
    slower: 600,
  },

  // Z-Index Scale
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modal: 1040,
    popover: 1050,
    tooltip: 1060,
  },
};

// Type Exports
export type Theme = typeof theme;
export type ThemeColors = typeof theme.colors;
export type ThemeSpacing = typeof theme.spacing;

// Design Tokens - Component Styling
export const tokens = {
  // Button Tokens
  button: {
    primary: {
      bg: theme.colors.lightGreen,
      text: theme.colors.black,
      radius: theme.borderRadius.md,
      padding: `${theme.spacing.md}px ${theme.spacing.xl}px`,
      shadow: theme.shadows.neonButton,
    },
    secondary: {
      bg: 'transparent',
      border: `1px solid ${theme.colors.lightGreen}`,
      text: theme.colors.lightGreen,
      radius: theme.borderRadius.md,
    },
  },

  // Input Tokens
  input: {
    bg: theme.colors.oliveBlack,
    text: theme.colors.white,
    placeholder: theme.colors.darkGray,
    focusBorder: theme.colors.lightGreen,
    radius: theme.borderRadius.md,
    padding: theme.spacing.md,
  },

  // Card Tokens
  card: {
    bg: theme.colors.oliveBlack,
    border: `1px solid ${theme.colors.lightGreenBorder}`,
    radius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    shadow: theme.shadows.oliveGlow,
  },

  // Typography Tokens
  text: {
    heading: {
      size: theme.typography.fontSize.heading,
      weight: theme.typography.fontWeight.semiBold,
      color: theme.colors.white,
    },
    body: {
      size: theme.typography.fontSize.body,
      weight: theme.typography.fontWeight.regular,
      color: theme.colors.white,
    },
    caption: {
      size: theme.typography.fontSize.caption,
      weight: theme.typography.fontWeight.regular,
      color: theme.colors.darkGray,
    },
  },
};

// Helper Functions
export const getGradientColors = (gradientName: keyof typeof theme.gradients) => {
  return theme.gradients[gradientName];
};

export const getNeonGlow = (intensity: 'subtle' | 'normal' | 'strong' = 'normal') => {
  switch (intensity) {
    case 'subtle':
      return theme.shadows.neonSubtle;
    case 'strong':
      return theme.shadows.neonPrimary;
    default:
      return theme.shadows.neonButton;
  }
};

export default theme;
