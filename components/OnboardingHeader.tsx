import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { AppColors } from '@/styles/colors';

interface OnboardingHeaderProps {
  currentStep: number;
  totalSteps: number;
  onBack: () => void;
}

export default function OnboardingHeader({ currentStep, totalSteps, onBack }: OnboardingHeaderProps) {
  const progress = currentStep / totalSteps;

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <ChevronLeft size={24} color={AppColors.textPrimary} />
      </TouchableOpacity>
      
      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <View 
            style={[
              styles.progressFill,
              { width: `${progress * 100}%` }
            ]} 
          />
        </View>
        <Text style={styles.stepText}>{currentStep} of {totalSteps}</Text>
      </View>
      
      <View style={styles.placeholder} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: AppColors.backgroundSecondary,
  },
  progressContainer: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 20,
  },
  progressTrack: {
    width: '100%',
    height: 4,
    backgroundColor: AppColors.backgroundSecondary,
    borderRadius: 2,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: AppColors.primary,
    borderRadius: 2,
  },
  stepText: {
    fontSize: 12,
    fontWeight: '600',
    color: AppColors.textSecondary,
  },
  placeholder: {
    width: 40,
  },
});