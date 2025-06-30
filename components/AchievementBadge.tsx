import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AppColors } from '@/styles/colors';
import LiquidGlassCard from './LiquidGlassCard';

interface AchievementBadgeProps {
  achievement: {
    achievement_name: string;
    description?: string;
    icon?: string;
    earned_at: string;
  };
  size?: 'small' | 'medium' | 'large';
}

export default function AchievementBadge({ achievement, size = 'medium' }: AchievementBadgeProps) {
  const sizeStyles = {
    small: styles.small,
    medium: styles.medium,
    large: styles.large,
  };

  const textSizeStyles = {
    small: styles.smallText,
    medium: styles.mediumText,
    large: styles.largeText,
  };

  return (
    <LiquidGlassCard style={[styles.container, sizeStyles[size]]}>
      <View style={styles.content}>
        {achievement.icon && (
          <Text style={[styles.icon, textSizeStyles[size]]}>{achievement.icon}</Text>
        )}
        <Text style={[styles.name, textSizeStyles[size]]}>{achievement.achievement_name}</Text>
        {achievement.description && size !== 'small' && (
          <Text style={styles.description}>{achievement.description}</Text>
        )}
        <Text style={styles.date}>
          {new Date(achievement.earned_at).toLocaleDateString()}
        </Text>
      </View>
    </LiquidGlassCard>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  content: {
    alignItems: 'center',
  },
  small: {
    padding: 8,
    minWidth: 80,
  },
  medium: {
    padding: 12,
    minWidth: 120,
  },
  large: {
    padding: 16,
    minWidth: 160,
  },
  icon: {
    marginBottom: 4,
  },
  name: {
    fontWeight: '600',
    color: AppColors.textPrimary,
    textAlign: 'center',
    marginBottom: 2,
  },
  description: {
    fontSize: 12,
    color: AppColors.textSecondary,
    textAlign: 'center',
    marginBottom: 4,
  },
  date: {
    fontSize: 10,
    color: AppColors.textTertiary,
  },
  smallText: {
    fontSize: 12,
  },
  mediumText: {
    fontSize: 14,
  },
  largeText: {
    fontSize: 16,
  },
});