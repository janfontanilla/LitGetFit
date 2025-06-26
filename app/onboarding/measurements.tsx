import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ruler } from 'lucide-react-native';

import LiquidGlassCard from '@/components/LiquidGlassCard';
import GlassButton from '@/components/GlassButton';
import OnboardingHeader from '@/components/OnboardingHeader';
import { AppColors, Gradients } from '@/styles/colors';
import { useOnboardingStore } from '@/store/onboardingStore';

type UnitSystem = 'metric' | 'imperial';

export default function MeasurementsScreen() {
  const { formData, updateFormData } = useOnboardingStore();
  const [unitSystem, setUnitSystem] = useState<UnitSystem>('metric');
  
  // Height states
  const [heightCm, setHeightCm] = useState(formData.height ? formData.height.toString() : '');
  const [heightFeet, setHeightFeet] = useState('');
  const [heightInches, setHeightInches] = useState('');
  
  // Weight states
  const [weightKg, setWeightKg] = useState(formData.weight ? formData.weight.toString() : '');
  const [weightLbs, setWeightLbs] = useState('');

  const handleContinue = () => {
    let finalHeight = 0;
    let finalWeight = 0;

    if (unitSystem === 'metric') {
      finalHeight = parseInt(heightCm) || 0;
      finalWeight = parseInt(weightKg) || 0;
    } else {
      const feet = parseInt(heightFeet) || 0;
      const inches = parseInt(heightInches) || 0;
      finalHeight = Math.round((feet * 12 + inches) * 2.54); // Convert to cm
      finalWeight = Math.round((parseInt(weightLbs) || 0) * 0.453592); // Convert to kg
    }

    if (isValid) {
      updateFormData({ 
        height: finalHeight,
        weight: finalWeight > 0 ? finalWeight : undefined
      });
      router.push('/onboarding/experience');
    }
  };

  const getHeightValidation = () => {
    if (unitSystem === 'metric') {
      const height = parseInt(heightCm) || 0;
      return height >= 100 && height <= 250;
    } else {
      const feet = parseInt(heightFeet) || 0;
      const inches = parseInt(heightInches) || 0;
      return feet >= 3 && feet <= 8 && inches >= 0 && inches <= 11;
    }
  };

  const getWeightValidation = () => {
    if (unitSystem === 'metric') {
      const weight = parseInt(weightKg) || 0;
      return weight === 0 || (weight >= 30 && weight <= 300);
    } else {
      const weight = parseInt(weightLbs) || 0;
      return weight === 0 || (weight >= 66 && weight <= 660);
    }
  };

  const isValid = getHeightValidation() && getWeightValidation();

  return (
    <LinearGradient colors={Gradients.background} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView 
          style={styles.keyboardContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <OnboardingHeader 
            currentStep={3}
            totalSteps={6}
            onBack={() => router.back()}
          />

          <View style={styles.content}>
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <Ruler size={32} color={AppColors.primary} />
              </View>
              <Text style={styles.title}>Your measurements</Text>
              <Text style={styles.subtitle}>
                Help us personalize your fitness plan
              </Text>
            </View>

            <View style={styles.inputSection}>
              {/* Unit System Toggle */}
              <View style={styles.unitToggle}>
                <TouchableOpacity
                  style={[
                    styles.unitButton,
                    unitSystem === 'metric' && styles.unitButtonActive,
                  ]}
                  onPress={() => setUnitSystem('metric')}
                >
                  <Text style={[
                    styles.unitButtonText,
                    unitSystem === 'metric' && styles.unitButtonTextActive,
                  ]}>
                    Metric
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.unitButton,
                    unitSystem === 'imperial' && styles.unitButtonActive,
                  ]}
                  onPress={() => setUnitSystem('imperial')}
                >
                  <Text style={[
                    styles.unitButtonText,
                    unitSystem === 'imperial' && styles.unitButtonTextActive,
                  ]}>
                    Imperial
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Height Input */}
              <View style={styles.measurementGroup}>
                <Text style={styles.measurementLabel}>Height *</Text>
                <LiquidGlassCard style={styles.inputCard}>
                  {unitSystem === 'metric' ? (
                    <View style={styles.inputContainer}>
                      <TextInput
                        style={styles.textInput}
                        value={heightCm}
                        onChangeText={setHeightCm}
                        placeholder="170"
                        placeholderTextColor={AppColors.textTertiary}
                        keyboardType="numeric"
                        maxLength={3}
                      />
                      <Text style={styles.unitText}>cm</Text>
                    </View>
                  ) : (
                    <View style={styles.inputContainer}>
                      <TextInput
                        style={styles.textInput}
                        value={heightFeet}
                        onChangeText={setHeightFeet}
                        placeholder="5"
                        placeholderTextColor={AppColors.textTertiary}
                        keyboardType="numeric"
                        maxLength={1}
                      />
                      <Text style={styles.unitText}>ft</Text>
                      <TextInput
                        style={styles.textInput}
                        value={heightInches}
                        onChangeText={setHeightInches}
                        placeholder="8"
                        placeholderTextColor={AppColors.textTertiary}
                        keyboardType="numeric"
                        maxLength={2}
                      />
                      <Text style={styles.unitText}>in</Text>
                    </View>
                  )}
                </LiquidGlassCard>
              </View>

              {/* Weight Input */}
              <View style={styles.measurementGroup}>
                <Text style={styles.measurementLabel}>Weight (optional)</Text>
                <LiquidGlassCard style={styles.inputCard}>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.textInput}
                      value={unitSystem === 'metric' ? weightKg : weightLbs}
                      onChangeText={unitSystem === 'metric' ? setWeightKg : setWeightLbs}
                      placeholder={unitSystem === 'metric' ? '70' : '154'}
                      placeholderTextColor={AppColors.textTertiary}
                      keyboardType="numeric"
                      maxLength={3}
                    />
                    <Text style={styles.unitText}>
                      {unitSystem === 'metric' ? 'kg' : 'lbs'}
                    </Text>
                  </View>
                </LiquidGlassCard>
              </View>

              {!getHeightValidation() && (
                <Text style={styles.errorText}>
                  Please enter a valid height
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
  inputSection: {
    flex: 1,
  },
  unitToggle: {
    flexDirection: 'row',
    backgroundColor: AppColors.backgroundSecondary,
    borderRadius: 12,
    padding: 4,
    marginBottom: 32,
  },
  unitButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  unitButtonActive: {
    backgroundColor: AppColors.primary,
  },
  unitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.textSecondary,
  },
  unitButtonTextActive: {
    color: AppColors.textPrimary,
  },
  measurementGroup: {
    marginBottom: 24,
  },
  measurementLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.textPrimary,
    marginBottom: 12,
  },
  inputCard: {
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  textInput: {
    fontSize: 24,
    fontWeight: '600',
    color: AppColors.textPrimary,
    paddingVertical: 16,
    textAlign: 'center',
    minWidth: 60,
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
    paddingBottom: 20,
  },
  continueButton: {
    width: '100%',
  },
});