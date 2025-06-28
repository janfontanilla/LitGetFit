import React, { useState, useEffect } from 'react';
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
import { router, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, Play, Save, Clock, Dumbbell } from 'lucide-react-native';

import LiquidGlassCard from '@/components/LiquidGlassCard';
import GlassButton from '@/components/GlassButton';
import MuscleGroupVisualization from '@/components/MuscleGroupVisualization';
import { AppColors, Gradients } from '@/styles/colors';
import { workoutService, WorkoutData } from '@/lib/supabase';

interface GeneratedExercise {
  name: string;
  sets: string;
  reps: string;
  weight: string;
  restTime: string;
  order: number;
}

interface GeneratedWorkout {
  name: string;
  description: string;
  exercises: GeneratedExercise[];
  estimatedDuration: number;
  targetedMuscles: string[];
}

export default function PreviewScreen() {
  const params = useLocalSearchParams();
  const [workout, setWorkout] = useState<GeneratedWorkout | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    generateWorkout();
  }, []);

  const generateWorkout = () => {
    setIsLoading(true);
    
    // Simulate AI generation based on parameters
    setTimeout(() => {
      const generatedWorkout = createMockWorkout();
      setWorkout(generatedWorkout);
      setIsLoading(false);
    }, 1500);
  };

  const createMockWorkout = (): GeneratedWorkout => {
    const { type, muscles, experience, goals, days, intensity, time } = params;

    if (type === 'routine') {
      return {
        name: `${experience} ${goals} Routine`,
        description: `A comprehensive ${days}-day routine targeting ${goals}`,
        exercises: [
          { name: 'Squats', sets: '4', reps: '12', weight: '60', restTime: '90 seconds', order: 0 },
          { name: 'Bench Press', sets: '4', reps: '10', weight: '70', restTime: '2 minutes', order: 1 },
          { name: 'Deadlifts', sets: '3', reps: '8', weight: '80', restTime: '3 minutes', order: 2 },
          { name: 'Pull-ups', sets: '3', reps: '8', weight: 'Bodyweight', restTime: '90 seconds', order: 3 },
          { name: 'Overhead Press', sets: '3', reps: '10', weight: '45', restTime: '90 seconds', order: 4 },
          { name: 'Barbell Rows', sets: '3', reps: '10', weight: '60', restTime: '90 seconds', order: 5 },
        ],
        estimatedDuration: 60,
        targetedMuscles: ['chest', 'back', 'legs', 'shoulders', 'arms'],
      };
    } else {
      const muscleList = typeof muscles === 'string' ? muscles.split(',') : [];
      return {
        name: `${muscleList.join(' & ')} Workout`,
        description: `Targeted workout focusing on ${muscleList.join(', ')}`,
        exercises: generateExercisesForMuscles(muscleList),
        estimatedDuration: time === 'quick' ? 25 : time === 'standard' ? 40 : 55,
        targetedMuscles: muscleList,
      };
    }
  };

  const generateExercisesForMuscles = (muscles: string[]): GeneratedExercise[] => {
    const exerciseDatabase: { [key: string]: GeneratedExercise[] } = {
      chest: [
        { name: 'Push-ups', sets: '3', reps: '12', weight: 'Bodyweight', restTime: '60 seconds', order: 0 },
        { name: 'Bench Press', sets: '4', reps: '10', weight: '70', restTime: '2 minutes', order: 1 },
        { name: 'Incline Dumbbell Press', sets: '3', reps: '12', weight: '25', restTime: '90 seconds', order: 2 },
      ],
      back: [
        { name: 'Pull-ups', sets: '3', reps: '8', weight: 'Bodyweight', restTime: '90 seconds', order: 0 },
        { name: 'Barbell Rows', sets: '4', reps: '10', weight: '60', restTime: '90 seconds', order: 1 },
        { name: 'Lat Pulldowns', sets: '3', reps: '12', weight: '50', restTime: '75 seconds', order: 2 },
      ],
      legs: [
        { name: 'Squats', sets: '4', reps: '12', weight: '60', restTime: '2 minutes', order: 0 },
        { name: 'Lunges', sets: '3', reps: '10 each leg', weight: '20', restTime: '90 seconds', order: 1 },
        { name: 'Calf Raises', sets: '4', reps: '15', weight: '30', restTime: '60 seconds', order: 2 },
      ],
      shoulders: [
        { name: 'Overhead Press', sets: '4', reps: '10', weight: '45', restTime: '90 seconds', order: 0 },
        { name: 'Lateral Raises', sets: '3', reps: '12', weight: '10', restTime: '60 seconds', order: 1 },
        { name: 'Rear Delt Flyes', sets: '3', reps: '12', weight: '8', restTime: '60 seconds', order: 2 },
      ],
      arms: [
        { name: 'Bicep Curls', sets: '3', reps: '12', weight: '15', restTime: '60 seconds', order: 0 },
        { name: 'Tricep Dips', sets: '3', reps: '10', weight: 'Bodyweight', restTime: '75 seconds', order: 1 },
        { name: 'Hammer Curls', sets: '3', reps: '10', weight: '12', restTime: '60 seconds', order: 2 },
      ],
      abs: [
        { name: 'Plank', sets: '3', reps: '45 seconds', weight: 'Bodyweight', restTime: '60 seconds', order: 0 },
        { name: 'Crunches', sets: '3', reps: '20', weight: 'Bodyweight', restTime: '45 seconds', order: 1 },
        { name: 'Russian Twists', sets: '3', reps: '15 each side', weight: '5', restTime: '60 seconds', order: 2 },
      ],
    };

    const selectedExercises: GeneratedExercise[] = [];
    let order = 0;

    muscles.forEach(muscle => {
      const muscleExercises = exerciseDatabase[muscle.toLowerCase()] || [];
      muscleExercises.forEach(exercise => {
        selectedExercises.push({ ...exercise, order: order++ });
      });
    });

    return selectedExercises.slice(0, 8); // Limit to 8 exercises
  };

  const handleSaveWorkout = async () => {
    if (!workout) return;

    setIsSaving(true);

    try {
      const workoutData: WorkoutData = {
        name: workout.name,
        description: workout.description,
        exercises: workout.exercises.map(({ order, ...exercise }) => exercise),
      };

      const savedWorkout = await workoutService.createWorkout(workoutData);

      if (savedWorkout) {
        Alert.alert(
          'Workout Saved!',
          `"${workout.name}" has been saved to your routines.`,
          [
            {
              text: 'View Routines',
              onPress: () => router.replace('/(tabs)/routines'),
            },
            {
              text: 'Start Workout',
              onPress: () => router.push({
                pathname: '/workout/start',
                params: { 
                  workoutId: savedWorkout.id,
                  workoutData: JSON.stringify({
                    id: savedWorkout.id,
                    name: savedWorkout.name,
                    description: savedWorkout.description,
                    exercises: savedWorkout.exercises,
                    estimatedDuration: workout.estimatedDuration,
                    targetedMuscles: workout.targetedMuscles,
                  })
                }
              }),
            },
          ]
        );
      } else {
        Alert.alert('Error', 'Failed to save workout. Please try again.');
      }
    } catch (error) {
      console.error('Error saving workout:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleStartWorkout = () => {
    if (!workout) return;

    router.push({
      pathname: '/workout/start',
      params: {
        workoutData: JSON.stringify({
          id: 'preview-workout',
          name: workout.name,
          description: workout.description,
          exercises: workout.exercises,
          estimatedDuration: workout.estimatedDuration,
          targetedMuscles: workout.targetedMuscles,
        }),
      },
    });
  };

  if (isLoading) {
    return (
      <LinearGradient colors={Gradients.background} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Generating your perfect workout...</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  if (!workout) {
    return (
      <LinearGradient colors={Gradients.background} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Failed to generate workout</Text>
            <GlassButton
              title="Try Again"
              onPress={() => router.back()}
              variant="primary"
              size="medium"
            />
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={Gradients.background} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ChevronLeft size={24} color={AppColors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Workout Preview</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Workout Overview */}
          <LiquidGlassCard style={styles.overviewCard}>
            <Text style={styles.workoutName}>{workout.name}</Text>
            <Text style={styles.workoutDescription}>{workout.description}</Text>
            
            <View style={styles.workoutStats}>
              <View style={styles.statItem}>
                <Clock size={20} color={AppColors.primary} />
                <Text style={styles.statValue}>{workout.estimatedDuration} min</Text>
                <Text style={styles.statLabel}>Duration</Text>
              </View>
              <View style={styles.statItem}>
                <Dumbbell size={20} color={AppColors.success} />
                <Text style={styles.statValue}>{workout.exercises.length}</Text>
                <Text style={styles.statLabel}>Exercises</Text>
              </View>
            </View>
          </LiquidGlassCard>

          {/* Muscle Group Visualization */}
          <LiquidGlassCard style={styles.muscleCard}>
            <MuscleGroupVisualization targetedMuscles={workout.targetedMuscles} />
          </LiquidGlassCard>

          {/* Exercise List */}
          <LiquidGlassCard style={styles.exercisesCard}>
            <Text style={styles.sectionTitle}>Exercises</Text>
            
            {workout.exercises.map((exercise, index) => (
              <View key={index} style={styles.exerciseItem}>
                <View style={styles.exerciseHeader}>
                  <Text style={styles.exerciseNumber}>{index + 1}</Text>
                  <Text style={styles.exerciseName}>{exercise.name}</Text>
                </View>
                <View style={styles.exerciseDetails}>
                  <Text style={styles.exerciseDetail}>{exercise.sets} sets</Text>
                  <Text style={styles.exerciseDetail}>{exercise.reps} reps</Text>
                  <Text style={styles.exerciseDetail}>{exercise.weight} kg</Text>
                  <Text style={styles.exerciseDetail}>{exercise.restTime} rest</Text>
                </View>
              </View>
            ))}
          </LiquidGlassCard>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <GlassButton
              title={isSaving ? 'Saving...' : 'Save Workout'}
              onPress={handleSaveWorkout}
              disabled={isSaving}
              variant="secondary"
              size="large"
              style={styles.saveButton}
              icon={<Save size={20} color={AppColors.textPrimary} />}
            />
            <GlassButton
              title="Start Workout"
              onPress={handleStartWorkout}
              variant="primary"
              size="large"
              style={styles.startButton}
              icon={<Play size={20} color={AppColors.textPrimary} />}
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
  },
  placeholder: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 150,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: AppColors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  errorText: {
    fontSize: 16,
    color: AppColors.accent,
  },
  overviewCard: {
    margin: 20,
    marginBottom: 16,
  },
  workoutName: {
    fontSize: 24,
    fontWeight: '700',
    color: AppColors.textPrimary,
    marginBottom: 8,
  },
  workoutDescription: {
    fontSize: 16,
    color: AppColors.textSecondary,
    lineHeight: 22,
    marginBottom: 20,
  },
  workoutStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    gap: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: AppColors.textPrimary,
  },
  statLabel: {
    fontSize: 12,
    color: AppColors.textSecondary,
    fontWeight: '600',
  },
  muscleCard: {
    marginHorizontal: 20,
    marginBottom: 16,
  },
  exercisesCard: {
    marginHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: AppColors.textPrimary,
    marginBottom: 16,
  },
  exerciseItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border,
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  exerciseNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: AppColors.primary,
    width: 30,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.textPrimary,
    flex: 1,
  },
  exerciseDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 30,
  },
  exerciseDetail: {
    fontSize: 12,
    color: AppColors.textSecondary,
    fontWeight: '500',
  },
  actionButtons: {
    paddingHorizontal: 20,
    gap: 12,
  },
  saveButton: {
    width: '100%',
  },
  startButton: {
    width: '100%',
  },
});