export const Colors = {
  // Primary palette
  primary: '#5254E1',
  primaryLight: '#7B7EFF',
  primaryDark: '#3A3CB8',
  primaryGhost: '#EEEEFF',
  primaryGlow: 'rgba(82, 84, 225, 0.15)',

  // Accent palette
  accent: '#F39C12',
  accentLight: '#F8C471',

  // Status colors
  success: '#10B981',
  successLight: '#D1FAE5',
  danger: '#EF4444',
  dangerLight: '#FEE2E2',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  info: '#3B82F6',
  infoLight: '#DBEAFE',

  // Surfaces
  background: '#FFFFFF',
  backgroundSecondary: '#F8FAFF',
  surface: '#F8F9FF',
  surfaceCard: '#FFFFFF',
  surfaceElevated: '#FFFFFF',

  // Text
  text: '#1A1A2E',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  textLight: '#D1D5DB',

  // Borders
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  borderFocus: '#5254E1',

  // Core
  white: '#FFFFFF',
  black: '#000000',

  // Special
  gold: '#D97706',
  saffron: '#EA580C',
  overlay: 'rgba(82, 84, 225, 0.08)',
  overlayDark: 'rgba(0, 0, 0, 0.5)',

  // Gradient stops
  gradientStart: '#5254E1',
  gradientEnd: '#7B7EFF',
  gradientAccent: '#9B59B6',
};

export const Spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

export const Radius = {
  xs: 4,
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  xxl: 28,
  full: 999,
};

export const Shadow = {
  sm: {
    shadowColor: '#5254E1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  md: {
    shadowColor: '#5254E1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 4,
  },
  lg: {
    shadowColor: '#5254E1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 20,
    elevation: 8,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  glow: {
    shadowColor: '#5254E1',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 6,
  },
};

// Typography helpers
export const Typography = {
  h1: { fontSize: 28, fontWeight: '800' as const, letterSpacing: -0.5 },
  h2: { fontSize: 22, fontWeight: '700' as const, letterSpacing: -0.3 },
  h3: { fontSize: 18, fontWeight: '700' as const },
  body: { fontSize: 14, fontWeight: '400' as const, lineHeight: 20 },
  bodyBold: { fontSize: 14, fontWeight: '600' as const, lineHeight: 20 },
  caption: { fontSize: 12, fontWeight: '500' as const },
  captionBold: { fontSize: 12, fontWeight: '700' as const },
  tiny: { fontSize: 10, fontWeight: '600' as const },
};

// Animation timing presets (for use with Animated/Reanimated)
export const AnimConfig = {
  spring: { damping: 18, stiffness: 250, mass: 0.8 },
  springBouncy: { damping: 12, stiffness: 200, mass: 0.6 },
  duration: {
    fast: 200,
    normal: 350,
    slow: 500,
    entrance: 400,
  },
};
