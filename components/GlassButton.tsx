import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { AppColors } from '@/styles/colors';

interface GlassButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'tertiary';
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export default function GlassButton({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  style,
  disabled = false,
  icon,
}: GlassButtonProps) {
  const getButtonStyles = () => {
    const baseStyle = [styles.button, styles[size]];
    
    if (disabled) {
      baseStyle.push(styles.disabled);
    }
    
    if (variant === 'primary') {
      baseStyle.push(styles.primary);
    } else if (variant === 'secondary') {
      baseStyle.push(styles.secondary);
    } else {
      baseStyle.push(styles.tertiary);
    }
    
    return baseStyle;
  };

  const getTextStyles = (): TextStyle => {
    const baseTextStyle = [styles.text, styles[`${size}Text` as keyof typeof styles]];
    
    if (disabled) {
      baseTextStyle.push(styles.disabledText);
    } else if (variant === 'primary') {
      baseTextStyle.push(styles.primaryText);
    } else {
      baseTextStyle.push(styles.secondaryText);
    }
    
    return StyleSheet.flatten(baseTextStyle);
  };

  return (
    <TouchableOpacity
      style={[getButtonStyles(), style]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <BlurView intensity={10} tint="dark" style={styles.blurContainer}>
        <View style={styles.contentContainer}>
          <Text style={getTextStyles()}>{title}</Text>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
        </View>
      </BlurView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  blurContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconContainer: {
    marginLeft: 4,
  },
  small: {
    height: 40,
    paddingHorizontal: 16,
  },
  medium: {
    height: 48,
    paddingHorizontal: 24,
  },
  large: {
    height: 56,
    paddingHorizontal: 32,
  },
  primary: {
    backgroundColor: AppColors.primary,
    borderColor: AppColors.primary,
  },
  secondary: {
    backgroundColor: AppColors.backgroundSecondary,
    borderColor: AppColors.border,
  },
  tertiary: {
    backgroundColor: 'transparent',
    borderColor: AppColors.border,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  smallText: {
    fontSize: 14,
  },
  mediumText: {
    fontSize: 16,
  },
  largeText: {
    fontSize: 18,
  },
  primaryText: {
    color: AppColors.textPrimary,
  },
  secondaryText: {
    color: AppColors.textPrimary,
  },
  disabledText: {
    color: AppColors.textTertiary,
  },
});