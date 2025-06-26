import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { User } from 'lucide-react-native';

import LiquidGlassCard from '@/components/LiquidGlassCard';
import GlassButton from '@/components/GlassButton';
import OnboardingHeader from '@/components/OnboardingHeader';
import { AppColors, Gradients } from '@/styles/colors';
import { useOnboardingStore } from '@/store/onboardingStore';

export default function NameScreen() {
  const { formData, updateFormData } = useOnboardingStore();
  const [name, setName] = useState(formData.name || '');

  const handleContinue = () => {
    if (name.trim()) {
      updateFormData({ name: name.trim() });
      router.push('/onboarding/age');
    }
  };

  const isValid = name.trim().length >= 2;

  return (
    <LinearGradient colors={Gradients.background} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView 
          style={styles.keyboardContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <OnboardingHeader 
            currentStep={1}
            totalSteps={6}
            onBack={() => router.back()}
          />

          <View style={styles.content}>
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <User size={32} color={AppColors.primary} />
              </View>
              <Text style={styles.title}>What's your name?</Text>
              <Text style={styles.subtitle}>
                We'll use this to personalize your experience
              </Text>
            </View>

            <View style={styles.inputSection}>
              <LiquidGlassCard style={styles.inputCard}>
                <TextInput
                  style={styles.textInput}
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter your first name"
                  placeholderTextColor={AppColors.textTertiary}
                  autoCapitalize="words"
                  autoCorrect={false}
                  autoFocus
                  maxLength={50}
                />
              </LiquidGlassCard>
              
              {name.length > 0 && name.length < 2 && (
                <Text style={styles.errorText}>
                  Name must be at least 2 characters
                </Text>
              )}
            </View>

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
  subtitle: {
    fontSize: 16,
    color: AppColors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  inputSection: {
    flex: 1,
  },
  inputCard: {
    marginBottom: 12,
  },
  textInput: {
    fontSize: 18,
    color: AppColors.textPrimary,
    paddingVertical: 16,
    paddingHorizontal: 0,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    color: AppColors.accent,
    textAlign: 'center',
    marginTop: 8,
  },
  footer: {
    paddingBottom: 20,
  },
  continueButton: {
    width: '100%',
  },
});