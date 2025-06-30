import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { 
  ChevronLeft, 
  Play, 
  Pause, 
  Square, 
  Clock, 
  Dumbbell, 
  Settings,
  RotateCcw,
  Check,
  X
} from 'lucide-react-native';
import { BlurView } from 'expo-blur';

import LiquidGlassCard from '@/components/LiquidGlassCard';
import GlassButton from '@/components/GlassButton';
import WorkoutTrackingOverlay from '@/components/WorkoutTrackingOverlay';
import { AppColors, Gradients } from '@/styles/colors';
import { workoutService, Workout } from '@/lib/supabase';
import { workoutProgressService } from '@/lib/workoutProgressService';

interface WorkoutExercise {
  name: string;
  sets: string;
  reps: string;
  weight: string;
  restTime: string;
  order: number;
  notes?: string;
}

interface WorkoutData {
  id?: string;
  name: string;
  description: string;
  exercises: WorkoutExercise[];
  estimatedDuration: number;
  targetedMuscles?: string[];
}

interface WorkoutStats {
  workoutId?: string;
  workoutName: string;
  duration: number;
  exercisesCompleted: number;
  totalExercises: number;
  setsCompleted: number;
  totalSets: number;
  completedAt: Date;
  targetedMuscles: string[];
  caloriesBurned: number;
  heartRate?: number;
}

export default function WorkoutStartScreen() {
  const params = useLocalSearchParams();
  const [workout, setWorkout] = useState<WorkoutData | null>(null);
  const [showTrackingOverlay, setShowTrackingOverlay] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadWorkout();
  }, []);

  const loadWorkout = async () => {
    try {
      setIsLoading(true);
      
      if (params.workoutData) {
        // Load from passed data (most common case)
        const workoutData = JSON.parse(params.workoutData as string) as WorkoutData;
        setWorkout(workoutData);
      } else if (params.workoutId) {
        // Load from database
        const workouts = await workoutService.getWorkouts();
        const foundWorkout = workouts.find(w => w.id === params.workoutId);
        
        if (foundWorkout) {
          const workoutData: WorkoutData = {
            id: foundWorkout.id,
            name: foundWorkout.name,
            description: foundWorkout.description || '',
            exercises: foundWorkout.exercises as WorkoutExercise[],
            estimatedDuration: 45, // Default duration
            targetedMuscles: [],
          };
          setWorkout(workoutData);
        } else {
          throw new Error('Workout not found');
        }
      } else {
        throw new Error('No workout data provided');
      }
    } catch (error) {
      console.error('Error loading workout:', error);
      Alert.alert('Error', 'Failed to load workout', [
        {
          text: 'Go Back',
          onPress: () => router.back(),
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartWorkout = () => {
    setShowTrackingOverlay(true);
  };

  const handleWorkoutComplete = async (workoutStats: WorkoutStats) => {
    try {
      // Save workout session
      await workoutProgressService.createWorkoutSession({
        workout_id: workoutStats.workoutId,
        workout_name: workoutStats.workoutName,
        duration: workoutStats.duration,
        exercises_completed: workoutStats.exercisesCompleted,
        total_exercises: workoutStats.totalExercises,
        sets_completed: workoutStats.setsCompleted,
        total_sets: workoutStats.totalSets,
        targeted_muscles: workoutStats.targetedMuscles,
        completed_at: workoutStats.completedAt.toISOString(),
      });

      // Close overlay
      setShowTrackingOverlay(false);
      
      // Show completion message
      Alert.alert(
        'Workout Complete!',
        `Amazing work! You completed "${workoutStats.workoutName}" in ${Math.floor(workoutStats.duration / 60)} minutes and burned ${workoutStats.caloriesBurned} calories.`,
        [
          {
            text: 'View Progress',
            onPress: () => router.replace('/(tabs)/routines'),
          },
          {
            text: 'Go Home',
            onPress: () => router.replace('/(tabs)'),
          },
        ]
      );
    } catch (error) {
      console.error('Error saving workout session:', error);
      setShowTrackingOverlay(false);
      Alert.alert('Error', 'Failed to save workout progress');
    }
  };

  if (isLoading) {
    return (
      <LinearGradient colors={Gradients.background} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading workout...</Text>
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
            <Text style={styles.errorText}>Workout not found</Text>
            <GlassButton
              title="Go Back"
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
                  <Text style={styles.exerciseDetail}>{exercise.weight}</Text>
                  <Text style={styles.exerciseDetail}>{exercise.restTime} rest</Text>
                </View>
              </View>
            ))}
          </LiquidGlassCard>

          {/* Start Button */}
          <View style={styles.actionContainer}>
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

        {/* Workout Tracking Overlay */}
        {workout && (
          <WorkoutTrackingOverlay
            visible={showTrackingOverlay}
            workout={workout}
            onClose={() => setShowTrackingOverlay(false)}
            onComplete={handleWorkoutComplete}
          />
        )}
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
  actionContainer: {
    paddingHorizontal: 20,
  },
  startButton: {
    width: '100%',
  },
});