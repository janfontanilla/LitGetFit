import React from 'react';
import { View, StyleSheet } from 'react-native';
import SmartNutritionChat from '@/components/SmartNutritionChat';
import { AppColors } from '@/styles/colors';

export default function NutritionScreen() {
  return (
    <View style={styles.container}>
      <SmartNutritionChat />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
});