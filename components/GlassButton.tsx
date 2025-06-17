import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { BlurView } from 'expo-blur';

interface GlassButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'tertiary';
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
  disabled?: boolean;
}

export default function GlassButton({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  style,
  disabled = false,
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
      <BlurView intensity={15} tint="light" style={styles.blurContainer}>
        <Text style={getTextStyles()}>{title}</Text>
      </BlurView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  blurContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  small: {
    height: 36,
    paddingHorizontal: 16,
  },
  medium: {
    height: 44,
    paddingHorizontal: 20,
  },
  large: {
    height: 52,
    paddingHorizontal: 24,
  },
  primary: {
    backgroundColor: 'rgba(0, 122, 255, 0.2)',
  },
  secondary: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  tertiary: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
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
    color: '#007AFF',
  },
  secondaryText: {
    color: '#FFFFFF',
  },
  disabledText: {
    color: 'rgba(255, 255, 255, 0.5)',
  },
});