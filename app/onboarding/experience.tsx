import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Award, CircleCheck as CheckCircle } from 'lucide-react-native';

import LiquidGlassCard from '@/components/LiquidGlassCard';
import GlassButton from '@/components/GlassButton';
import OnboardingHeader from '@/components/OnboardingHeader';
import { AppColors, Gradients } from '@/styles/colors';
import { useOnboardingStore } from '@/store/onboardingStore';

const experienceOptions = [
  {
    value: 'beginner',
    title: 'Beginner',
    description: 'New to fitness or returning after a break',
    emoji: '🌱',
  },
  {
    value: 'intermediate',
    title: 'Intermediate',
    description: '6+ months of regular exercise',
    emoji: '💪',
  },
  {
    value: 'advanced',
    title: 'Advanced',
    description: '2+ years of consistent training',
    emoji: '🏆',
  },
];

export default function ExperienceScreen() {
  const { formData, updateFormData } = useOnboardingStore();
  const [selectedExperience, setSelectedExperience] = useState(formData.fitness_experience || '');

  const handleContinue = () => {
    if (selectedExperience) {
      updateFormData({ fitness_experience: selectedExperience });
      router.push('/onboarding/goals');
    }
  };

  return (
    <LinearGradient colors={Gradients.background} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <OnboardingHeader 
          currentStep={4}
          totalSteps={6}
          onBack={() => router.back()}
        />
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <Award size={32} color={AppColors.primary} />
              </View>
              <Text style={styles.title}>Your fitness experience</Text>
              <Text style={styles.subtitle}>
                This helps us create the right intensity for you
              </Text>
            </View>
            <View style={styles.optionsSection}>
              {experienceOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={styles.optionButton}
                  onPress={() => setSelectedExperience(option.value)}
                  activeOpacity={0.7}
                >
                  <LiquidGlassCard
                    style={[
                      styles.optionCard,
                      selectedExperience === option.value && styles.selectedCard,
                    ]}
                  >
                    <View style={styles.optionContent}>
                      <View style={styles.optionLeft}>
                        <Text style={styles.optionEmoji}>{option.emoji}</Text>
                        <View style={styles.optionText}>
                          <Text style={[
                            styles.optionTitle,
                            selectedExperience === option.value && styles.selectedText,
                          ]}>
                            {option.title}
                          </Text>
                          <Text style={styles.optionDescription}>
                            {option.description}
                          </Text>
                        </View>
                      </View>
                      {selectedExperience === option.value && (
                        <CheckCircle size={24} color={AppColors.primary} />
                      )}
                    </View>
                  </LiquidGlassCard>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
        <View style={styles.footer}>
          <GlassButton
            title="Continue"
            onPress={handleContinue}
            disabled={!selectedExperience}
            variant="primary"
            size="large"
            style={styles.continueButton}
          />
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
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
    gap: 16,
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
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  continueButton: {
    width: '100%',
  },
});