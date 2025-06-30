import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bot } from 'lucide-react-native';

import { AppColors, Gradients } from '@/styles/colors';

export default function AICoachScreen() {
  return (
    <LinearGradient colors={Gradients.background} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Bot size={28} color={AppColors.primary} />
          <Text style={styles.title}>AI Coach</Text>
        </View>
        <View style={styles.content}>
          <Text style={styles.placeholderText}>
            The AI Coach is being upgraded. Please check back soon!
          </Text>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border,
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: AppColors.textPrimary,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  placeholderText: {
    color: AppColors.textSecondary,
    fontSize: 16,
    textAlign: 'center',
  },
});