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
import { ChevronLeft, Calendar, Star, Target } from 'lucide-react-native';

import LiquidGlassCard from '@/components/LiquidGlassCard';
import GlassButton from '@/components/GlassButton';
import { AppColors, Gradients } from '@/styles/colors';

const daysOptions = [2, 3, 4, 5, 6];
const experienceLevels = [
  { value: 'beginner', title: 'Beginner', description: 'New to fitness or returning' },
  { value: 'intermediate', title: 'Intermediate', description: '6+ months experience' },
  { value: 'advanced', title: 'Advanced', description: '2+ years experience' },
];
const goals = [
  { id: 'strength', title: 'Strength', emoji: '💪' },
  { id: 'muscle', title: 'Muscle Gain', emoji: '🏗️' },
  { id: 'fat_loss', title: 'Fat Loss', emoji: '🔥' },
  { id: 'endurance', title: 'Endurance', emoji: '🏃' },
];

export default function AIRoutineScreen() {
  const [selectedDays, setSelectedDays] = useState<number>(4);
  const [selectedExperience, setSelectedExperience] = useState<string>('');
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const toggleGoal = (goalId: string) => {
    setSelectedGoals(prev => 
      prev.includes(goalId) 
        ? prev.filter(id => id !== goalId)
        : [...prev, goalId]
    );
  };

  const handleGenerate = async () => {
    if (!selectedExperience) {
      Alert.alert('Missing Information', 'Please select your experience level.');
      return;
    }

    if (selectedGoals.length === 0) {
      Alert.alert('Missing Information', 'Please select at least one goal.');
      return;
    }

    setIsGenerating(true);

    // Simulate AI generation
    setTimeout(() => {
      setIsGenerating(false);
      
      // Navigate to preview screen with generated routine
      router.push({
        pathname: '/create-workout/preview',
        params: {
          type: 'routine',
          days: selectedDays.toString(),
          experience: selectedExperience,
          goals: selectedGoals.join(','),
        },
      });
    }, 3000);
  };

  const isValid = selectedExperience && selectedGoals.length > 0;

  return (
    <LinearGradient colors={Gradients.background} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ChevronLeft size={24} color={AppColors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Weekly Routine Setup</Text>
          <View style={styles.progressIndicator}>
            <Text style={styles.progressText}>Step 1 of 2</Text>
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Training Days */}
          <LiquidGlassCard style={styles.card}>
            <View style={styles.sectionHeader}>
              <Calendar size={24} color={AppColors.primary} />
              <Text style={styles.sectionTitle}>How many days per week can you train?</Text>
            </View>
            
            <View style={styles.daysContainer}>
              {daysOptions.map((days) => (
                <TouchableOpacity
                  key={days}
                  style={[
                    styles.dayButton,
                    selectedDays === days && styles.selectedDayButton,
                  ]}
                  onPress={() => setSelectedDays(days)}
                >
                  <Text style={[
                    styles.dayButtonText,
                    selectedDays === days && styles.selectedDayButtonText,
                  ]}>
                    {days}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <Text style={styles.selectedDaysText}>
              {selectedDays} days per week selected
            </Text>
          </LiquidGlassCard>

          {/* Experience Level */}
          <LiquidGlassCard style={styles.card}>
            <View style={styles.sectionHeader}>
              <Star size={24} color={AppColors.warning} />
              <Text style={styles.sectionTitle}>What's your experience level?</Text>
            </View>
            
            <View style={styles.experienceContainer}>
              {experienceLevels.map((level) => (
                <TouchableOpacity
                  key={level.value}
                  style={[
                    styles.experienceButton,
                    selectedExperience === level.value && styles.selectedExperienceButton,
                  ]}
                  onPress={() => setSelectedExperience(level.value)}
                >
                  <Text style={[
                    styles.experienceTitle,
                    selectedExperience === level.value && styles.selectedExperienceTitle,
                  ]}>
                    {level.title}
                  </Text>
                  <Text style={styles.experienceDescription}>
                    {level.description}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </LiquidGlassCard>

          {/* Goals */}
          <LiquidGlassCard style={styles.card}>
            <View style={styles.sectionHeader}>
              <Target size={24} color={AppColors.success} />
              <Text style={styles.sectionTitle}>Primary goals?</Text>
            </View>
            
            <View style={styles.goalsContainer}>
              {goals.map((goal) => (
                <TouchableOpacity
                  key={goal.id}
                  style={[
                    styles.goalChip,
                    selectedGoals.includes(goal.id) && styles.selectedGoalChip,
                  ]}
                  onPress={() => toggleGoal(goal.id)}
                >
                  <Text style={styles.goalEmoji}>{goal.emoji}</Text>
                  <Text style={[
                    styles.goalText,
                    selectedGoals.includes(goal.id) && styles.selectedGoalText,
                  ]}>
                    {goal.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </LiquidGlassCard>

          {/* Generate Button */}
          <View style={styles.actionContainer}>
            <GlassButton
              title={isGenerating ? 'Generating Routine...' : 'Generate Routine'}
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
  daysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dayButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: AppColors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedDayButton: {
    backgroundColor: AppColors.primary,
    borderColor: AppColors.primary,
  },
  dayButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: AppColors.textSecondary,
  },
  selectedDayButtonText: {
    color: AppColors.textPrimary,
  },
  selectedDaysText: {
    fontSize: 14,
    color: AppColors.textSecondary,
    textAlign: 'center',
  },
  experienceContainer: {
    gap: 12,
  },
  experienceButton: {
    padding: 16,
    backgroundColor: AppColors.backgroundSecondary,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedExperienceButton: {
    borderColor: AppColors.primary,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  experienceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.textPrimary,
    marginBottom: 4,
  },
  selectedExperienceTitle: {
    color: AppColors.primary,
  },
  experienceDescription: {
    fontSize: 14,
    color: AppColors.textSecondary,
  },
  goalsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  goalChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: AppColors.backgroundSecondary,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'transparent',
    gap: 8,
  },
  selectedGoalChip: {
    borderColor: AppColors.primary,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  goalEmoji: {
    fontSize: 16,
  },
  goalText: {
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.textSecondary,
  },
  selectedGoalText: {
    color: AppColors.primary,
  },
  actionContainer: {
    paddingHorizontal: 20,
  },
  generateButton: {
    width: '100%',
  },
});