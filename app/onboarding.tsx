import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ChevronLeft, ChevronRight, User, Target, Activity } from 'lucide-react-native';

import LiquidGlassCard from '@/components/LiquidGlassCard';
import GlassButton from '@/components/GlassButton';
import { AppColors, Gradients } from '@/styles/colors';
import { supabase, OnboardingData } from '@/lib/supabase';

interface OnboardingStep {
  id: number;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
}

const steps: OnboardingStep[] = [
  {
    id: 1,
    title: "Let's get to know you",
    subtitle: "Tell us about yourself to personalize your experience",
    icon: <User size={32} color={AppColors.primary} />,
  },
  {
    id: 2,
    title: "Your fitness journey",
    subtitle: "Help us understand your experience and goals",
    icon: <Target size={32} color={AppColors.primary} />,
  },
  {
    id: 3,
    title: "Activity & lifestyle",
    subtitle: "Let's tailor your program to your lifestyle",
    icon: <Activity size={32} color={AppColors.primary} />,
  },
];

export default function OnboardingScreen() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<OnboardingData>({
    name: '',
    age: 0,
    height: 0,
    weight: 0,
    fitness_experience: '',
    primary_goal: '',
    activity_level: '',
  });

  const updateFormData = (field: keyof OnboardingData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    
    try {
      // Validate required fields
      if (!formData.name || !formData.age || !formData.height || !formData.fitness_experience || !formData.primary_goal || !formData.activity_level) {
        Alert.alert('Missing Information', 'Please fill in all required fields.');
        setIsLoading(false);
        return;
      }

      // Save to Supabase
      const { data, error } = await supabase
        .from('user_profiles')
        .insert([
          {
            name: formData.name,
            age: formData.age,
            height: formData.height,
            weight: formData.weight || null,
            fitness_experience: formData.fitness_experience,
            primary_goal: formData.primary_goal,
            activity_level: formData.activity_level,
          }
        ])
        .select();

      if (error) {
        console.error('Error saving user profile:', error);
        Alert.alert('Error', 'Failed to save your profile. Please try again.');
        setIsLoading(false);
        return;
      }

      console.log('User profile saved:', data);
      
      // Navigate to main app
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Unexpected error:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.name.trim() !== '' && formData.age > 0 && formData.height > 0;
      case 2:
        return formData.fitness_experience !== '' && formData.primary_goal !== '';
      case 3:
        return formData.activity_level !== '';
      default:
        return false;
    }
  };

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <LiquidGlassCard style={styles.inputCard}>
        <Text style={styles.inputLabel}>What's your name?</Text>
        <TextInput
          style={styles.textInput}
          value={formData.name}
          onChangeText={(text) => updateFormData('name', text)}
          placeholder="Enter your name"
          placeholderTextColor={AppColors.textTertiary}
        />
      </LiquidGlassCard>

      <LiquidGlassCard style={styles.inputCard}>
        <Text style={styles.inputLabel}>How old are you?</Text>
        <TextInput
          style={styles.textInput}
          value={formData.age ? formData.age.toString() : ''}
          onChangeText={(text) => updateFormData('age', parseInt(text) || 0)}
          placeholder="Enter your age"
          placeholderTextColor={AppColors.textTertiary}
          keyboardType="numeric"
        />
      </LiquidGlassCard>

      <LiquidGlassCard style={styles.inputCard}>
        <Text style={styles.inputLabel}>What's your height? (cm)</Text>
        <TextInput
          style={styles.textInput}
          value={formData.height ? formData.height.toString() : ''}
          onChangeText={(text) => updateFormData('height', parseInt(text) || 0)}
          placeholder="Enter your height in cm"
          placeholderTextColor={AppColors.textTertiary}
          keyboardType="numeric"
        />
      </LiquidGlassCard>

      <LiquidGlassCard style={styles.inputCard}>
        <Text style={styles.inputLabel}>What's your weight? (kg) - Optional</Text>
        <TextInput
          style={styles.textInput}
          value={formData.weight ? formData.weight.toString() : ''}
          onChangeText={(text) => updateFormData('weight', parseInt(text) || 0)}
          placeholder="Enter your weight in kg"
          placeholderTextColor={AppColors.textTertiary}
          keyboardType="numeric"
        />
      </LiquidGlassCard>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <LiquidGlassCard style={styles.inputCard}>
        <Text style={styles.inputLabel}>What's your fitness experience?</Text>
        <View style={styles.optionsContainer}>
          {[
            { value: 'beginner', label: 'Beginner', subtitle: 'New to fitness' },
            { value: 'intermediate', label: 'Intermediate', subtitle: '6+ months experience' },
            { value: 'advanced', label: 'Advanced', subtitle: '2+ years experience' },
          ].map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.optionButton,
                formData.fitness_experience === option.value && styles.selectedOption,
              ]}
              onPress={() => updateFormData('fitness_experience', option.value)}
            >
              <Text style={[
                styles.optionText,
                formData.fitness_experience === option.value && styles.selectedOptionText,
              ]}>
                {option.label}
              </Text>
              <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </LiquidGlassCard>

      <LiquidGlassCard style={styles.inputCard}>
        <Text style={styles.inputLabel}>What's your primary goal?</Text>
        <View style={styles.optionsContainer}>
          {[
            { value: 'lose_weight', label: 'Lose Weight', subtitle: 'Burn fat and get lean' },
            { value: 'gain_weight', label: 'Gain Weight', subtitle: 'Build mass and size' },
            { value: 'build_muscle', label: 'Build Muscle', subtitle: 'Increase strength and muscle' },
            { value: 'improve_endurance', label: 'Improve Endurance', subtitle: 'Boost cardiovascular fitness' },
            { value: 'general_fitness', label: 'General Fitness', subtitle: 'Stay healthy and active' },
          ].map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.optionButton,
                formData.primary_goal === option.value && styles.selectedOption,
              ]}
              onPress={() => updateFormData('primary_goal', option.value)}
            >
              <Text style={[
                styles.optionText,
                formData.primary_goal === option.value && styles.selectedOptionText,
              ]}>
                {option.label}
              </Text>
              <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </LiquidGlassCard>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <LiquidGlassCard style={styles.inputCard}>
        <Text style={styles.inputLabel}>How active are you currently?</Text>
        <View style={styles.optionsContainer}>
          {[
            { value: 'sedentary', label: 'Sedentary', subtitle: 'Little to no exercise' },
            { value: 'lightly_active', label: 'Lightly Active', subtitle: 'Light exercise 1-3 days/week' },
            { value: 'moderately_active', label: 'Moderately Active', subtitle: 'Moderate exercise 3-5 days/week' },
            { value: 'very_active', label: 'Very Active', subtitle: 'Hard exercise 6-7 days/week' },
            { value: 'extremely_active', label: 'Extremely Active', subtitle: 'Very hard exercise, physical job' },
          ].map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.optionButton,
                formData.activity_level === option.value && styles.selectedOption,
              ]}
              onPress={() => updateFormData('activity_level', option.value)}
            >
              <Text style={[
                styles.optionText,
                formData.activity_level === option.value && styles.selectedOptionText,
              ]}>
                {option.label}
              </Text>
              <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </LiquidGlassCard>
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      default:
        return renderStep1();
    }
  };

  return (
    <LinearGradient colors={Gradients.background} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView 
          style={styles.keyboardContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={prevStep}
              disabled={currentStep === 1}
            >
              <ChevronLeft 
                size={24} 
                color={currentStep === 1 ? AppColors.textTertiary : AppColors.textPrimary} 
              />
            </TouchableOpacity>
            
            <View style={styles.progressContainer}>
              {steps.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.progressDot,
                    index + 1 <= currentStep && styles.progressDotActive,
                  ]}
                />
              ))}
            </View>
            
            <View style={styles.stepCounter}>
              <Text style={styles.stepText}>{currentStep}/3</Text>
            </View>
          </View>

          {/* Step Content */}
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.stepHeader}>
              {steps[currentStep - 1].icon}
              <Text style={styles.stepTitle}>{steps[currentStep - 1].title}</Text>
              <Text style={styles.stepSubtitle}>{steps[currentStep - 1].subtitle}</Text>
            </View>

            {renderCurrentStep()}
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <GlassButton
              title={currentStep === 3 ? (isLoading ? 'Creating Profile...' : 'Complete Setup') : 'Continue'}
              onPress={nextStep}
              disabled={!isStepValid() || isLoading}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  progressDotActive: {
    backgroundColor: AppColors.primary,
  },
  stepCounter: {
    width: 40,
    alignItems: 'center',
  },
  stepText: {
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  stepHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: AppColors.textPrimary,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    color: AppColors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  stepContent: {
    gap: 20,
  },
  inputCard: {
    marginBottom: 4,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.textPrimary,
    marginBottom: 12,
  },
  textInput: {
    fontSize: 16,
    color: AppColors.textPrimary,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  selectedOption: {
    backgroundColor: 'rgba(0, 122, 255, 0.2)',
    borderColor: AppColors.primary,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.textPrimary,
    marginBottom: 4,
  },
  selectedOptionText: {
    color: AppColors.primary,
  },
  optionSubtitle: {
    fontSize: 14,
    color: AppColors.textSecondary,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  continueButton: {
    width: '100%',
  },
});