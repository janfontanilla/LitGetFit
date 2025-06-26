import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Calendar } from 'lucide-react-native';

import LiquidGlassCard from '@/components/LiquidGlassCard';
import GlassButton from '@/components/GlassButton';
import OnboardingHeader from '@/components/OnboardingHeader';
import { AppColors, Gradients } from '@/styles/colors';
import { useOnboardingStore } from '@/store/onboardingStore';

export default function AgeScreen() {
  const { formData, updateFormData } = useOnboardingStore();
  const [age, setAge] = useState(formData.age ? formData.age.toString() : '');

  const handleContinue = () => {
    const ageNumber = parseInt(age);
    if (isValid) {
      updateFormData({ age: ageNumber });
      router.push('/onboarding/measurements');
    }
  };

  const ageNumber = parseInt(age) || 0;
  const isValid = ageNumber >= 13 && ageNumber <= 120;

  return (
    <LinearGradient colors={Gradients.background} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView 
          style={styles.keyboardContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <OnboardingHeader 
            currentStep={2}
            totalSteps={6}
            onBack={() => router.back()}
          />
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.content}>
              <View style={styles.header}>
                <View style={styles.iconContainer}>
                  <Calendar size={32} color={AppColors.primary} />
                </View>
                <Text style={styles.title}>How old are you?</Text>
              </View>
              <View style={styles.inputSection}>
                <LiquidGlassCard style={styles.inputCard}>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.textInput}
                      value={age}
                      onChangeText={setAge}
                      placeholder="25"
                      placeholderTextColor={AppColors.textTertiary}
                      keyboardType="numeric"
                      autoFocus
                      maxLength={3}
                    />
                    <Text style={styles.unitText}>years old</Text>
                  </View>
                </LiquidGlassCard>
                {age && !isValid && (
                  <Text style={styles.errorText}>
                    {ageNumber < 13 ? 'You must be at least 13 years old' : 'Please enter a valid age'}
                  </Text>
                )}
              </View>
            </View>
          </ScrollView>
          <View style={styles.footer}>
            <GlassButton
              title="Continue"
              onPress={handleContinue}
              disabled={!isValid}
              variant="primary"
              size="large"
              style={styles.continueButton}
            />
          </View>
        </KeyboardAvoidingView>
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
  keyboardContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 60,
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
  inputSection: {
    flex: 1,
  },
  inputCard: {
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  textInput: {
    fontSize: 32,
    fontWeight: '600',
    color: AppColors.textPrimary,
    paddingVertical: 16,
    textAlign: 'center',
    minWidth: 80,
  },
  unitText: {
    fontSize: 18,
    color: AppColors.textSecondary,
  },
  errorText: {
    fontSize: 14,
    color: AppColors.accent,
    textAlign: 'center',
    marginTop: 8,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  continueButton: {
    width: '100%',
  },
});