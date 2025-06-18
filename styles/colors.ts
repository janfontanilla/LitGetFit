export const AppColors = {
  primary: '#007AFF',
  secondary: '#5856D6',
  accent: '#FF3B30',
  success: '#34C759',
  warning: '#FF9500',
  
  // Glass effect colors
  glassBackground: 'rgba(255, 255, 255, 0.1)',
  glassBorder: 'rgba(255, 255, 255, 0.2)',
  
  // Text colors
  textPrimary: '#FFFFFF',
  textSecondary: 'rgba(255, 255, 255, 0.8)',
  textTertiary: 'rgba(255, 255, 255, 0.6)',
  
  // Background gradients
  backgroundStart: '#1a1a2e',
  backgroundEnd: '#16213e',
};

export const Gradients = {
  primary: ['#007AFF', '#5856D6'] as const,
  secondary: ['#FF3B30', '#FF9500'] as const,
  background: ['#1a1a2e', '#16213e', '#0f3460'] as const,
  card: ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)'] as const,
};