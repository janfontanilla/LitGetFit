import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ChevronLeft, Dumbbell, Zap, Clock } from 'lucide-react-native';

import LiquidGlassCard from '@/components/LiquidGlassCard';
import GlassButton from '@/components/GlassButton';
import { AppColors, Gradients } from '@/styles/colors';

const muscleGroups = [
  { id: 'chest', title: 'Chest', emoji: '💪' },
  { id: 'back', title: 'Back', emoji: '🔙' },
  { id: 'legs', title: 'Legs', emoji: '🦵' },
  { id: 'glutes', title: 'Glutes', emoji: '🍑' },
  { id: 'shoulders', title: 'Shoulders', emoji: '🤷' },
  { id: 'arms', title: 'Arms', emoji: '💪' },
  { id: 'abs', title: 'Abs', emoji: '🔥' },
  { id: 'full_body', title: 'Full Body', emoji: '🏋️' },
];

const timeOptions = [
  { value: 'quick', title: 'Quick Session', subtitle: '15-30 min', duration: '15-30' },
  { value: 'standard', title: 'Standard Workout', subtitle: '30-45 min', duration: '30-45' },
  { value: 'extended', title: 'Extended Session', subtitle: '45-60+ min', duration: '45-60+' },
];

export default function AISingleWorkoutScreen() {
  const [selectedMuscles, setSelectedMuscles] = useState<string[]>([]);
  const [intensity, setIntensity] = useState<number>(5);
  const [selectedTime, setSelectedTime] = useState<string>('standard');
  const [isGenerating, setIsGenerating] = useState(false);

  const toggleMuscleGroup = (muscleId: string) => {
    if (muscleId === 'full_body') {
      // If full body is selected, clear other selections
      setSelectedMuscles(prev => 
        prev.includes('full_body') ? [] : ['full_body']
      );
    } else {
      // If other muscle group is selected, remove full body
      setSelectedMuscles(prev => {
        const filtered = prev.filter(id => id !== 'full_body');
        return filtered.includes(muscleId) 
          ? filtered.filter(id => id !== muscleId)
          : [...filtered, muscleId];
      });
    }
  };

  const handleGenerate = async () => {
    if (selectedMuscles.length === 0) {
      Alert.alert('Missing Information', 'Please select at least one muscle group.');
      return;
    }

    setIsGenerating(true);

    // Simulate AI generation
    setTimeout(() => {
      setIsGenerating(false);
      
      // Navigate to preview screen with generated workout
      router.push({
        pathname: '/create-workout/preview',
        params: {
          type: 'single',
          muscles: selectedMuscles.join(','),
          intensity: intensity.toString(),
          time: selectedTime,
        },
      });
    }, 2500);
  };

  const getIntensityLabel = (value: number) => {
    if (value <= 3) return 'Light';
    if (value <= 7) return 'Moderate';
    return 'Intense';
  };

  const isValid = selectedMuscles.length > 0;

  return (
    <LinearGradient colors={Gradients.background} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ChevronLeft size={24} color={AppColors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Single Workout Setup</Text>
          <View style={styles.progressIndicator}>
            <Text style={styles.progressText}>Step 1 of 2</Text>
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Muscle Groups */}
          <LiquidGlassCard style={styles.card}>
            <View style={styles.sectionHeader}>
              <Dumbbell size={24} color={AppColors.primary} />
              <Text style={styles.sectionTitle}>Which muscle groups do you want to train?</Text>
            </View>
            
            <View style={styles.muscleGrid}>
              {muscleGroups.map((muscle) => (
                <TouchableOpacity
                  key={muscle.id}
                  style={[
                    styles.muscleButton,
                    selectedMuscles.includes(muscle.id) && styles.selectedMuscleButton,
                  ]}
                  onPress={() => toggleMuscleGroup(muscle.id)}
                >
                  <Text style={styles.muscleEmoji}>{muscle.emoji}</Text>
                  <Text style={[
                    styles.muscleText,
                    selectedMuscles.includes(muscle.id) && styles.selectedMuscleText,
                  ]}>
                    {muscle.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            {selectedMuscles.length > 0 && (
              <Text style={styles.selectedMusclesText}>
                Selected: {selectedMuscles.map(id => 
                  muscleGroups.find(m => m.id === id)?.title
                ).join(', ')}
              </Text>
            )}
          </LiquidGlassCard>

          {/* Intensity */}
          <LiquidGlassCard style={styles.card}>
            <View style={styles.sectionHeader}>
              <Zap size={24} color={AppColors.accent} />
              <Text style={styles.sectionTitle}>Workout intensity?</Text>
            </View>
            
            <View style={styles.intensityContainer}>
              <View style={styles.intensityLabels}>
                <Text style={styles.intensityLabel}>Light</Text>
                <Text style={styles.intensityLabel}>Intense</Text>
              </View>
              
              <View style={styles.sliderContainer}>
                <View style={styles.sliderTrack}>
                  <View 
                    style={[
                      styles.sliderFill,
                      { width: `${(intensity / 10) * 100}%` }
                    ]} 
                  />
                  <TouchableOpacity
                    style={[
                      styles.sliderThumb,
                      { left: `${(intensity / 10) * 100 - 2}%` }
                    ]}
                    onPressIn={() => {
                      // Simple intensity adjustment on tap
                      setIntensity(prev => prev < 10 ? prev + 1 : 1);
                    }}
                  />
                </View>
              </View>
              
              <Text style={styles.intensityValue}>
                {getIntensityLabel(intensity)} ({intensity}/10)
              </Text>
            </View>
          </LiquidGlassCard>

          {/* Time Constraint */}
          <LiquidGlassCard style={styles.card}>
            <View style={styles.sectionHeader}>
              <Clock size={24} color={AppColors.success} />
              <Text style={styles.sectionTitle}>How much time do you have?</Text>
            </View>
            
            <View style={styles.timeContainer}>
              {timeOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.timeButton,
                    selectedTime === option.value && styles.selectedTimeButton,
                  ]}
                  onPress={() => setSelectedTime(option.value)}
                >
                  <Text style={[
                    styles.timeTitle,
                    selectedTime === option.value && styles.selectedTimeTitle,
                  ]}>
                    {option.title}
                  </Text>
                  <Text style={styles.timeSubtitle}>
                    {option.subtitle}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </LiquidGlassCard>

          {/* Generate Button */}
          <View style={styles.actionContainer}>
            <GlassButton
              title={isGenerating ? 'Generating Workout...' : 'Generate Workout'}
              onPress={handleGenerate}
              disabled={!isValid || isGenerating}
              variant="primary"
              size="large"
              style={styles.generateButton}
            />
          </View>
        </ScrollView>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border,
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: AppColors.textPrimary,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  progressIndicator: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: AppColors.backgroundSecondary,
    borderRadius: 12,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: AppColors.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 150,
  },
  card: {
    margin: 20,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: AppColors.textPrimary,
    flex: 1,
  },
  muscleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  muscleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: AppColors.backgroundSecondary,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'transparent',
    gap: 8,
    minWidth: '45%',
  },
  selectedMuscleButton: {
    borderColor: AppColors.primary,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  muscleEmoji: {
    fontSize: 16,
  },
  muscleText: {
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.textSecondary,
  },
  selectedMuscleText: {
    color: AppColors.primary,
  },
  selectedMusclesText: {
    fontSize: 14,
    color: AppColors.textSecondary,
    fontStyle: 'italic',
  },
  intensityContainer: {
    gap: 16,
  },
  intensityLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  intensityLabel: {
    fontSize: 14,
    color: AppColors.textSecondary,
  },
  sliderContainer: {
    paddingHorizontal: 4,
  },
  sliderTrack: {
    height: 6,
    backgroundColor: AppColors.backgroundSecondary,
    borderRadius: 3,
    position: 'relative',
  },
  sliderFill: {
    height: '100%',
    backgroundColor: AppColors.accent,
    borderRadius: 3,
  },
  sliderThumb: {
    position: 'absolute',
    top: -6,
    width: 18,
    height: 18,
    backgroundColor: AppColors.accent,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: AppColors.textPrimary,
  },
  intensityValue: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.textPrimary,
    textAlign: 'center',
  },
  timeContainer: {
    gap: 12,
  },
  timeButton: {
    padding: 16,
    backgroundColor: AppColors.backgroundSecondary,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedTimeButton: {
    borderColor: AppColors.primary,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  timeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.textPrimary,
    marginBottom: 4,
  },
  selectedTimeTitle: {
    color: AppColors.primary,
  },
  timeSubtitle: {
    fontSize: 14,
    color: AppColors.textSecondary,
  },
  actionContainer: {
    paddingHorizontal: 20,
  },
  generateButton: {
    width: '100%',
  },
});