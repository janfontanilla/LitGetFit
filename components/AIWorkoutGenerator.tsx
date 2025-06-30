import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Zap, Dumbbell, Clock, Target, Loader2 } from 'lucide-react-native';
import { AppColors } from '@/styles/colors';
import LiquidGlassCard from './LiquidGlassCard';
import GlassButton from './GlassButton';
import openAIService from '@/lib/openaiService';

interface AIWorkoutGeneratorProps {
  onWorkoutGenerated: (workout: any) => void;
  userProfile?: any;
}

const fitnessLevels = [
  { value: 'beginner', title: 'Beginner', emoji: '🌱' },
  { value: 'intermediate', title: 'Intermediate', emoji: '💪' },
  { value: 'advanced', title: 'Advanced', emoji: '🏆' },
];

const workoutTypes = [
  { value: 'strength', title: 'Strength Training', emoji: '🏋️' },
  { value: 'cardio', title: 'Cardio', emoji: '🏃' },
  { value: 'hiit', title: 'HIIT', emoji: '🔥' },
  { value: 'flexibility', title: 'Flexibility', emoji: '🧘' },
  { value: 'full_body', title: 'Full Body', emoji: '💯' },
];

const timeOptions = [
  { value: 15, title: '15 min', subtitle: 'Quick' },
  { value: 30, title: '30 min', subtitle: 'Standard' },
  { value: 45, title: '45 min', subtitle: 'Extended' },
  { value: 60, title: '60 min', subtitle: 'Full Session' },
];

const equipmentOptions = [
  'Dumbbells', 'Barbell', 'Resistance Bands', 'Pull-up Bar', 
  'Kettlebells', 'Medicine Ball', 'Yoga Mat', 'None (Bodyweight)'
];

const goalOptions = [
  'Build Muscle', 'Lose Weight', 'Improve Endurance', 
  'Increase Strength', 'Better Flexibility', 'General Fitness'
];

export default function AIWorkoutGenerator({ onWorkoutGenerated, userProfile }: AIWorkoutGeneratorProps) {
  const [selectedLevel, setSelectedLevel] = useState<string>(userProfile?.fitness_experience || '');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<number>(30);
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const toggleEquipment = (equipment: string) => {
    setSelectedEquipment(prev => 
      prev.includes(equipment) 
        ? prev.filter(e => e !== equipment)
        : [...prev, equipment]
    );
  };

  const toggleGoal = (goal: string) => {
    setSelectedGoals(prev => 
      prev.includes(goal) 
        ? prev.filter(g => g !== goal)
        : [...prev, goal]
    );
  };

  const handleGenerate = async () => {
    if (!selectedLevel || !selectedType || selectedGoals.length === 0) {
      Alert.alert('Missing Information', 'Please select fitness level, workout type, and at least one goal.');
      return;
    }

    if (selectedEquipment.length === 0) {
      Alert.alert('Missing Information', 'Please select available equipment.');
      return;
    }

    setIsGenerating(true);

    try {
      const workout = await openAIService.generateWorkout({
        fitnessLevel: selectedLevel as 'beginner' | 'intermediate' | 'advanced',
        goals: selectedGoals,
        timeAvailable: selectedTime,
        equipment: selectedEquipment,
        workoutType: selectedType as any,
      });

      if (workout) {
        onWorkoutGenerated(workout);
      } else {
        Alert.alert('Generation Failed', 'Unable to generate workout. Please try again.');
      }
    } catch (error) {
      console.error('Error generating workout:', error);
      Alert.alert('Error', 'An error occurred while generating your workout.');
    } finally {
      setIsGenerating(false);
    }
  };

  const isValid = selectedLevel && selectedType && selectedGoals.length > 0 && selectedEquipment.length > 0;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <LiquidGlassCard style={styles.headerCard}>
        <View style={styles.header}>
          <Zap size={32} color={AppColors.primary} />
          <Text style={styles.title}>AI Workout Generator</Text>
          <Text style={styles.subtitle}>
            Get a personalized workout designed just for you
          </Text>
        </View>
      </LiquidGlassCard>

      {/* Fitness Level */}
      <LiquidGlassCard style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Fitness Level</Text>
        <View style={styles.optionsGrid}>
          {fitnessLevels.map((level) => (
            <TouchableOpacity
              key={level.value}
              style={[
                styles.optionButton,
                selectedLevel === level.value && styles.selectedOption,
              ]}
              onPress={() => setSelectedLevel(level.value)}
            >
              <Text style={styles.optionEmoji}>{level.emoji}</Text>
              <Text style={[
                styles.optionText,
                selectedLevel === level.value && styles.selectedOptionText,
              ]}>
                {level.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </LiquidGlassCard>

      {/* Workout Type */}
      <LiquidGlassCard style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Workout Type</Text>
        <View style={styles.optionsGrid}>
          {workoutTypes.map((type) => (
            <TouchableOpacity
              key={type.value}
              style={[
                styles.optionButton,
                selectedType === type.value && styles.selectedOption,
              ]}
              onPress={() => setSelectedType(type.value)}
            >
              <Text style={styles.optionEmoji}>{type.emoji}</Text>
              <Text style={[
                styles.optionText,
                selectedType === type.value && styles.selectedOptionText,
              ]}>
                {type.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </LiquidGlassCard>

      {/* Time Available */}
      <LiquidGlassCard style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Time Available</Text>
        <View style={styles.timeOptions}>
          {timeOptions.map((time) => (
            <TouchableOpacity
              key={time.value}
              style={[
                styles.timeButton,
                selectedTime === time.value && styles.selectedTimeButton,
              ]}
              onPress={() => setSelectedTime(time.value)}
            >
              <Clock size={16} color={selectedTime === time.value ? AppColors.textPrimary : AppColors.textSecondary} />
              <Text style={[
                styles.timeText,
                selectedTime === time.value && styles.selectedTimeText,
              ]}>
                {time.title}
              </Text>
              <Text style={styles.timeSubtitle}>{time.subtitle}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </LiquidGlassCard>

      {/* Equipment */}
      <LiquidGlassCard style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Available Equipment</Text>
        <View style={styles.equipmentGrid}>
          {equipmentOptions.map((equipment) => (
            <TouchableOpacity
              key={equipment}
              style={[
                styles.equipmentChip,
                selectedEquipment.includes(equipment) && styles.selectedEquipmentChip,
              ]}
              onPress={() => toggleEquipment(equipment)}
            >
              <Dumbbell size={14} color={selectedEquipment.includes(equipment) ? AppColors.textPrimary : AppColors.textSecondary} />
              <Text style={[
                styles.equipmentText,
                selectedEquipment.includes(equipment) && styles.selectedEquipmentText,
              ]}>
                {equipment}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </LiquidGlassCard>

      {/* Goals */}
      <LiquidGlassCard style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Fitness Goals</Text>
        <View style={styles.goalsGrid}>
          {goalOptions.map((goal) => (
            <TouchableOpacity
              key={goal}
              style={[
                styles.goalChip,
                selectedGoals.includes(goal) && styles.selectedGoalChip,
              ]}
              onPress={() => toggleGoal(goal)}
            >
              <Target size={14} color={selectedGoals.includes(goal) ? AppColors.textPrimary : AppColors.textSecondary} />
              <Text style={[
                styles.goalText,
                selectedGoals.includes(goal) && styles.selectedGoalText,
              ]}>
                {goal}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </LiquidGlassCard>

      {/* Generate Button */}
      <View style={styles.generateSection}>
        <GlassButton
          title={isGenerating ? 'Generating Your Workout...' : 'Generate AI Workout'}
          onPress={handleGenerate}
          disabled={!isValid || isGenerating}
          variant="primary"
          size="large"
          style={styles.generateButton}
          icon={isGenerating ? <Loader2 size={20} color={AppColors.textPrimary} /> : <Zap size={20} color={AppColors.textPrimary} />}
        />
        
        {!isValid && (
          <Text style={styles.validationText}>
            Please complete all sections to generate your workout
          </Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerCard: {
    marginBottom: 20,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: AppColors.textPrimary,
    marginTop: 12,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: AppColors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  sectionCard: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: AppColors.textPrimary,
    marginBottom: 16,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  optionButton: {
    flex: 1,
    minWidth: '30%',
    alignItems: 'center',
    padding: 16,
    backgroundColor: AppColors.backgroundSecondary,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedOption: {
    borderColor: AppColors.primary,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  optionEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.textSecondary,
    textAlign: 'center',
  },
  selectedOptionText: {
    color: AppColors.primary,
  },
  timeOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  timeButton: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    backgroundColor: AppColors.backgroundSecondary,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedTimeButton: {
    borderColor: AppColors.primary,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  timeText: {
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.textSecondary,
    marginTop: 4,
  },
  selectedTimeText: {
    color: AppColors.primary,
  },
  timeSubtitle: {
    fontSize: 12,
    color: AppColors.textTertiary,
    marginTop: 2,
  },
  equipmentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  equipmentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: AppColors.backgroundSecondary,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'transparent',
    gap: 6,
  },
  selectedEquipmentChip: {
    borderColor: AppColors.primary,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  equipmentText: {
    fontSize: 12,
    fontWeight: '600',
    color: AppColors.textSecondary,
  },
  selectedEquipmentText: {
    color: AppColors.primary,
  },
  goalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  goalChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: AppColors.backgroundSecondary,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'transparent',
    gap: 6,
  },
  selectedGoalChip: {
    borderColor: AppColors.primary,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  goalText: {
    fontSize: 12,
    fontWeight: '600',
    color: AppColors.textSecondary,
  },
  selectedGoalText: {
    color: AppColors.primary,
  },
  generateSection: {
    marginBottom: 40,
    alignItems: 'center',
  },
  generateButton: {
    width: '100%',
    marginBottom: 12,
  },
  validationText: {
    fontSize: 14,
    color: AppColors.textTertiary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});