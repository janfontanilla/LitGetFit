import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Activity, CircleCheck as CheckCircle } from 'lucide-react-native';

import LiquidGlassCard from '@/components/LiquidGlassCard';
import GlassButton from '@/components/GlassButton';
import OnboardingHeader from '@/components/OnboardingHeader';
import { AppColors, Gradients } from '@/styles/colors';
import { useOnboardingStore } from '@/store/onboardingStore';

const activityOptions = [
  {
    value: 'sedentary',
    title: 'Sedentary',
    description: 'Little to no exercise, desk job',
    emoji: '🪑',
  },
  {
    value: 'lightly_active',
    title: 'Lightly Active',
    description: 'Light exercise 1-3 days/week',
    emoji: '🚶',
  },
  {
    value: 'moderately_active',
    title: 'Moderately Active',
    description: 'Moderate exercise 3-5 days/week',
    emoji: '🏃',
  },
  {
    value: 'very_active',
    title: 'Very Active',
    description: 'Hard exercise 6-7 days/week',
    emoji: '🏋️',
  },
  {
    value: 'extremely_active',
    title: 'Extremely Active',
    description: 'Very hard exercise, physical job',
    emoji: '🔥',
  },
];

export default function ActivityScreen() {
  const { formData, updateFormData } = useOnboardingStore();
  const [selectedActivity, setSelectedActivity] = useState(formData.activity_level || '');

  const handleContinue = () => {
    if (selectedActivity) {
      updateFormData({ activity_level: selectedActivity });
      router.push('/onboarding/complete');
    }
  };

  return (
    <LinearGradient colors={Gradients.background} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <OnboardingHeader 
          currentStep={6}
          totalSteps={6}
          onBack={() => router.back()}
        />

        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Activity size={32} color={AppColors.primary} />
            </View>
            <Text style={styles.title}>How active are you?</Text>
            <Text style={styles.subtitle}>
              This helps us create the right workout intensity
            </Text>
          </View>

          <ScrollView 
            style={styles.optionsSection}
            contentContainerStyle={styles.optionsContent}
            showsVerticalScrollIndicator={false}
          >
            {activityOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={styles.optionButton}
                onPress={() => setSelectedActivity(option.value)}
                activeOpacity={0.7}
              >
                <LiquidGlassCard
                  style={[
                    styles.optionCard,
                    selectedActivity === option.value && styles.selectedCard,
                  ]}
                >
                  <View style={styles.optionContent}>
                    <View style={styles.optionLeft}>
                      <Text style={styles.optionEmoji}>{option.emoji}</Text>
                      <View style={styles.optionText}>
                        <Text style={[
                          styles.optionTitle,
                          selectedActivity === option.value && styles.selectedText,
                        ]}>
                          {option.title}
                        </Text>
                        <Text style={styles.optionDescription}>
                          {option.description}
                        </Text>
                      </View>
                    </View>
                    {selectedActivity === option.value && (
                      <CheckCircle size={24} color={AppColors.primary} />
                    )}
                  </View>
                </LiquidGlassCard>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.footer}>
            <GlassButton
              title="Complete Setup"
              onPress={handleContinue}
              disabled={!selectedActivity}
              variant="primary"
              size="large"
              style={styles.continueButton}
            />
          </View>
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 40,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: AppColors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: AppColors.textPrimary,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: AppColors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  optionsSection: {
    flex: 1,
  },
  optionsContent: {
    gap: 16,
    paddingBottom: 20,
  },
  optionButton: {
    width: '100%',
  },
  optionCard: {
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedCard: {
    borderColor: AppColors.primary,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionEmoji: {
    fontSize: 32,
    marginRight: 16,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: AppColors.textPrimary,
    marginBottom: 4,
  },
  selectedText: {
    color: AppColors.primary,
  },
  optionDescription: {
    fontSize: 14,
    color: AppColors.textSecondary,
    lineHeight: 20,
  },
  footer: {
    paddingBottom: 20,
  },
  continueButton: {
    width: '100%',
  },
});