import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { CheckCircle, Sparkles } from 'lucide-react-native';

import LiquidGlassCard from '@/components/LiquidGlassCard';
import GlassButton from '@/components/GlassButton';
import { AppColors, Gradients } from '@/styles/colors';
import { useOnboardingStore } from '@/store/onboardingStore';
import { userProfileService } from '@/lib/supabase';

export default function CompleteScreen() {
  const { formData, clearFormData } = useOnboardingStore();
  const [isLoading, setIsLoading] = useState(false);

  const handleComplete = async () => {
    setIsLoading(true);
    
    try {
      // Validate all required fields
      if (!formData.name || !formData.age || !formData.height || !formData.fitness_experience || !formData.primary_goal || !formData.activity_level) {
        Alert.alert('Missing Information', 'Please complete all required fields.');
        setIsLoading(false);
        return;
      }

      // Additional validation for constraints
      if (formData.age <= 0 || formData.age >= 150) {
        Alert.alert('Invalid Age', 'Please enter a valid age between 1 and 149.');
        setIsLoading(false);
        return;
      }

      if (formData.height <= 0 || formData.height >= 300) {
        Alert.alert('Invalid Height', 'Please enter a valid height between 1 and 299 cm.');
        setIsLoading(false);
        return;
      }

      if (formData.weight && (formData.weight <= 0 || formData.weight >= 500)) {
        Alert.alert('Invalid Weight', 'Please enter a valid weight between 1 and 499 kg.');
        setIsLoading(false);
        return;
      }

      // Save to Supabase
      const profile = await userProfileService.createProfile(formData);

      if (!profile) {
        Alert.alert('Error', 'Failed to save your profile. Please try again.');
        setIsLoading(false);
        return;
      }

      console.log('User profile saved:', profile);
      
      // Clear form data and navigate to main app
      clearFormData();
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient colors={Gradients.background} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {/* Success Animation */}
          <View style={styles.successSection}>
            <View style={styles.successIcon}>
              <CheckCircle size={64} color={AppColors.success} />
            </View>
            <Text style={styles.title}>You're all set!</Text>
            <Text style={styles.subtitle}>
              Your personalized fitness journey is ready to begin
            </Text>
          </View>

          {/* Summary Card */}
          <LiquidGlassCard style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <Sparkles size={24} color={AppColors.primary} />
              <Text style={styles.summaryTitle}>Your Profile</Text>
            </View>
            
            <View style={styles.summaryContent}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Name:</Text>
                <Text style={styles.summaryValue}>{formData.name}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Age:</Text>
                <Text style={styles.summaryValue}>{formData.age} years</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Height:</Text>
                <Text style={styles.summaryValue}>{formData.height} cm</Text>
              </View>
              {formData.weight && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Weight:</Text>
                  <Text style={styles.summaryValue}>{formData.weight} kg</Text>
                </View>
              )}
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Experience:</Text>
                <Text style={styles.summaryValue}>
                  {formData.fitness_experience?.charAt(0).toUpperCase() + formData.fitness_experience?.slice(1)}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Goal:</Text>
                <Text style={styles.summaryValue}>
                  {formData.primary_goal?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Activity:</Text>
                <Text style={styles.summaryValue}>
                  {formData.activity_level?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Text>
              </View>
            </View>
          </LiquidGlassCard>

          {/* CTA Section */}
          <View style={styles.ctaSection}>
            <GlassButton
              title={isLoading ? 'Creating Your Profile...' : 'Start Your Journey'}
              onPress={handleComplete}
              disabled={isLoading}
              variant="primary"
              size="large"
              style={styles.completeButton}
            />
            <Text style={styles.disclaimer}>
              You can always update your profile later in settings
            </Text>
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
    justifyContent: 'space-between',
  },
  successSection: {
    alignItems: 'center',
    paddingTop: 80,
  },
  successIcon: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: AppColors.textPrimary,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: AppColors.textSecondary,
    textAlign: 'center',
    lineHeight: 26,
    maxWidth: 300,
  },
  summaryCard: {
    marginVertical: 40,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: AppColors.textPrimary,
  },
  summaryContent: {
    gap: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 16,
    color: AppColors.textSecondary,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.textPrimary,
  },
  ctaSection: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  completeButton: {
    width: '100%',
    marginBottom: 16,
  },
  disclaimer: {
    fontSize: 14,
    color: AppColors.textTertiary,
    textAlign: 'center',
    lineHeight: 20,
  },
});