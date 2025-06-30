import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { BlurView } from 'expo-blur';
import { AppColors, Gradients } from '@/styles/colors';
import { LinearGradient } from 'expo-linear-gradient';

interface LiquidGlassCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  intensity?: number;
  tint?: 'light' | 'dark' | 'default';
}

export default function LiquidGlassCard({ 
  children, 
  style, 
  intensity = 20,
  tint = 'dark'
}: LiquidGlassCardProps) {
  return (
    <View style={[styles.container, style]}>
      <BlurView intensity={intensity} tint={tint} style={styles.blurView}>
        <View style={styles.content}>
          {children}
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  blurView: {
    borderRadius: 20,
  },
  content: {
    backgroundColor: AppColors.glassBackground,
    padding: 20,
  },
});