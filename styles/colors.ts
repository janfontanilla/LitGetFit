export const AppColors = {
  primary: '#3B82F6',
  secondary: '#8B5CF6',
  accent: '#EF4444',
  success: '#10B981',
  warning: '#F59E0B',
  
  // Dark theme colors
  background: '#0A0A0A',
  backgroundSecondary: '#1A1A1A',
  backgroundTertiary: '#2A2A2A',
  
  // Glass effect colors
  glassBackground: 'rgba(255, 255, 255, 0.05)',
  glassBorder: 'rgba(255, 255, 255, 0.1)',
  
  // Text colors
  textPrimary: '#FFFFFF',
  textSecondary: '#A1A1AA',
  textTertiary: '#71717A',
  textMuted: '#52525B',
  
  // Surface colors
  surface: '#18181B',
  surfaceSecondary: '#27272A',
  border: '#3F3F46',
  borderLight: '#52525B',
};

export const Gradients = {
  primary: ['#3B82F6', '#8B5CF6'] as const,
  secondary: ['#EF4444', '#F59E0B'] as const,
  background: ['#0A0A0A', '#1A1A1A', '#0F0F0F'] as const,
  card: ['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.02)'] as const,
  surface: ['#18181B', '#27272A'] as const,
};