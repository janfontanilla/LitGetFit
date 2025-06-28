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

type WeightUnit = 'kg' | 'lbs';
type WorkoutState = 'ready' | 'active' | 'paused' | 'completed';

export default function WorkoutStartScreen() {
  const params = useLocalSearchParams();
  const [workout, setWorkout] = useState<WorkoutData | null>(null);
  const [workoutState, setWorkoutState] = useState<WorkoutState>('ready');
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [restTimer, setRestTimer] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [weightUnit, setWeightUnit] = useState<WeightUnit>('kg');
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [exerciseWeights, setExerciseWeights] = useState<{ [key: string]: string }>({});
  const [completedSets, setCompletedSets] = useState<{ [key: string]: boolean[] }>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadWorkout();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (workoutState === 'active') {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [workoutState]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isResting && restTimer > 0) {
      interval = setInterval(() => {
        setRestTimer(prev => {
          if (prev <= 1) {
            setIsResting(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isResting, restTimer]);

  const loadWorkout = async () => {
    try {
      setIsLoading(true);
      
      if (params.workoutData) {
        // Load from passed data (most common case)
        const workoutData = JSON.parse(params.workoutData as string) as WorkoutData;
        setWorkout(workoutData);
        initializeWorkoutState(workoutData);
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
          initializeWorkoutState(workoutData);
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

  const initializeWorkoutState = (workoutData: WorkoutData) => {
    const weights: { [key: string]: string } = {};
    const sets: { [key: string]: boolean[] } = {};
    
    workoutData.exercises.forEach((exercise, index) => {
      weights[index.toString()] = exercise.weight;
      sets[index.toString()] = new Array(parseInt(exercise.sets) || 3).fill(false);
    });
    
    setExerciseWeights(weights);
    setCompletedSets(sets);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const convertWeight = (weight: string, fromUnit: WeightUnit, toUnit: WeightUnit): string => {
    if (!weight || fromUnit === toUnit) return weight;
    
    const numWeight = parseFloat(weight);
    if (isNaN(numWeight)) return weight;
    
    if (fromUnit === 'kg' && toUnit === 'lbs') {
      return (numWeight * 2.20462).toFixed(1);
    } else if (fromUnit === 'lbs' && toUnit === 'kg') {
      return (numWeight / 2.20462).toFixed(1);
    }
    
    return weight;
  };

  const toggleWeightUnit = () => {
    const newUnit: WeightUnit = weightUnit === 'kg' ? 'lbs' : 'kg';
    
    // Convert all weights
    const convertedWeights: { [key: string]: string } = {};
    Object.entries(exerciseWeights).forEach(([key, weight]) => {
      convertedWeights[key] = convertWeight(weight, weightUnit, newUnit);
    });
    
    setExerciseWeights(convertedWeights);
    setWeightUnit(newUnit);
  };

  const startWorkout = () => {
    setWorkoutState('active');
  };

  const pauseWorkout = () => {
    setWorkoutState('paused');
    setIsResting(false);
    setRestTimer(0);
  };

  const resumeWorkout = () => {
    setWorkoutState('active');
  };

  const endWorkout = async () => {
    Alert.alert(
      'End Workout',
      'Are you sure you want to end this workout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End Workout',
          style: 'destructive',
          onPress: async () => {
            setWorkoutState('completed');
            
            // Save workout session
            try {
              const completedSetsCount = getCompletedSetsCount();
              const totalSets = getTotalSets();
              const completedExercises = getCompletedExercisesCount();
              
              await workoutProgressService.createWorkoutSession({
                workout_id: workout?.id,
                workout_name: workout?.name || 'Unknown Workout',
                duration: elapsedTime,
                exercises_completed: completedExercises,
                total_exercises: workout?.exercises.length || 0,
                sets_completed: completedSetsCount,
                total_sets: totalSets,
                targeted_muscles: workout?.targetedMuscles || [],
                completed_at: new Date().toISOString(),
              });
            } catch (error) {
              console.error('Error saving workout session:', error);
            }
            
            // Navigate back with success message
            setTimeout(() => {
              Alert.alert(
                'Workout Complete!',
                `Great job! You completed "${workout?.name}" in ${formatTime(elapsedTime)}.`,
                [
                  {
                    text: 'View Routines',
                    onPress: () => router.replace('/(tabs)/routines'),
                  },
                  {
                    text: 'Go Home',
                    onPress: () => router.replace('/(tabs)'),
                  },
                ]
              );
            }, 500);
          },
        },
      ]
    );
  };

  const completeSet = (exerciseIndex: number, setIndex: number) => {
    const newCompletedSets = { ...completedSets };
    newCompletedSets[exerciseIndex.toString()][setIndex] = true;
    setCompletedSets(newCompletedSets);

    // Start rest timer if not the last set
    const exercise = workout?.exercises[exerciseIndex];
    if (exercise && setIndex < parseInt(exercise.sets) - 1) {
      const restTime = parseInt(exercise.restTime) || 60;
      setRestTimer(restTime);
      setIsResting(true);
    }

    // Check if workout is complete
    const allExercisesComplete = workout?.exercises.every((_, index) => {
      const exerciseSets = newCompletedSets[index.toString()] || [];
      return exerciseSets.every(Boolean);
    });

    if (allExercisesComplete) {
      setTimeout(() => {
        endWorkout();
      }, 1000);
    }
  };

  const updateExerciseWeight = (exerciseIndex: number, weight: string) => {
    const newWeights = { ...exerciseWeights };
    newWeights[exerciseIndex.toString()] = weight;
    setExerciseWeights(newWeights);
  };

  const getTotalSets = () => {
    return workout?.exercises.reduce((total, exercise) => {
      return total + (parseInt(exercise.sets) || 0);
    }, 0) || 0;
  };

  const getCompletedSetsCount = () => {
    return Object.values(completedSets).reduce((total, sets) => {
      return total + sets.filter(Boolean).length;
    }, 0);
  };

  const getCompletedExercisesCount = () => {
    return workout?.exercises.filter((_, index) => {
      const sets = completedSets[index.toString()] || [];
      return sets.every(Boolean);
    }).length || 0;
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
          <View style={styles.headerCenter}>
            <Text style={styles.workoutTitle}>{workout.name}</Text>
            <Text style={styles.workoutTime}>{formatTime(elapsedTime)}</Text>
          </View>
          <TouchableOpacity style={styles.settingsButton} onPress={() => setShowWeightModal(true)}>
            <Settings size={24} color={AppColors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Workout Stats */}
        <LiquidGlassCard style={styles.statsCard}>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Clock size={20} color={AppColors.primary} />
              <Text style={styles.statValue}>{workout.estimatedDuration} min</Text>
              <Text style={styles.statLabel}>Planned</Text>
            </View>
            <View style={styles.statItem}>
              <Dumbbell size={20} color={AppColors.success} />
              <Text style={styles.statValue}>{workout.exercises.length}</Text>
              <Text style={styles.statLabel}>Exercises</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.weightUnit}>{weightUnit.toUpperCase()}</Text>
              <TouchableOpacity onPress={toggleWeightUnit}>
                <RotateCcw size={16} color={AppColors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>
        </LiquidGlassCard>

        {/* Rest Timer */}
        {isResting && (
          <LiquidGlassCard style={styles.restCard}>
            <Text style={styles.restTitle}>Rest Time</Text>
            <Text style={styles.restTimer}>{formatTime(restTimer)}</Text>
            <Text style={styles.restSubtitle}>Get ready for your next set</Text>
          </LiquidGlassCard>
        )}

        {/* Exercise List */}
        <ScrollView
          style={styles.exercisesList}
          contentContainerStyle={styles.exercisesContent}
          showsVerticalScrollIndicator={false}
        >
          {workout.exercises.map((exercise, exerciseIndex) => (
            <LiquidGlassCard key={exerciseIndex} style={styles.exerciseCard}>
              <View style={styles.exerciseHeader}>
                <Text style={styles.exerciseNumber}>{exerciseIndex + 1}</Text>
                <View style={styles.exerciseInfo}>
                  <Text style={styles.exerciseName}>{exercise.name}</Text>
                  <View style={styles.exerciseMeta}>
                    <Text style={styles.exerciseDetail}>{exercise.sets} sets</Text>
                    <Text style={styles.exerciseDetail}>{exercise.reps} reps</Text>
                    <TouchableOpacity
                      style={styles.weightContainer}
                      onPress={() => setShowWeightModal(true)}
                    >
                      <Text style={styles.exerciseWeight}>
                        {exerciseWeights[exerciseIndex.toString()] || exercise.weight} {weightUnit}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* Sets */}
              <View style={styles.setsContainer}>
                {Array.from({ length: parseInt(exercise.sets) || 3 }).map((_, setIndex) => {
                  const isCompleted = completedSets[exerciseIndex.toString()]?.[setIndex] || false;
                  return (
                    <TouchableOpacity
                      key={setIndex}
                      style={[
                        styles.setButton,
                        isCompleted && styles.setButtonCompleted,
                      ]}
                      onPress={() => completeSet(exerciseIndex, setIndex)}
                      disabled={workoutState !== 'active'}
                    >
                      {isCompleted ? (
                        <Check size={16} color={AppColors.textPrimary} />
                      ) : (
                        <Text style={styles.setNumber}>{setIndex + 1}</Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </LiquidGlassCard>
          ))}
        </ScrollView>

        {/* Control Buttons */}
        <View style={styles.controlsContainer}>
          {workoutState === 'ready' && (
            <GlassButton
              title="Start Workout"
              onPress={startWorkout}
              variant="primary"
              size="large"
              style={styles.controlButton}
              icon={<Play size={20} color={AppColors.textPrimary} />}
            />
          )}
          
          {workoutState === 'active' && (
            <>
              <GlassButton
                title="Pause"
                onPress={pauseWorkout}
                variant="secondary"
                size="large"
                style={styles.halfButton}
                icon={<Pause size={20} color={AppColors.textPrimary} />}
              />
              <GlassButton
                title="End Workout"
                onPress={endWorkout}
                variant="tertiary"
                size="large"
                style={styles.halfButton}
                icon={<Square size={20} color={AppColors.accent} />}
              />
            </>
          )}
          
          {workoutState === 'paused' && (
            <>
              <GlassButton
                title="Resume"
                onPress={resumeWorkout}
                variant="primary"
                size="large"
                style={styles.halfButton}
                icon={<Play size={20} color={AppColors.textPrimary} />}
              />
              <GlassButton
                title="End Workout"
                onPress={endWorkout}
                variant="tertiary"
                size="large"
                style={styles.halfButton}
                icon={<Square size={20} color={AppColors.accent} />}
              />
            </>
          )}
        </View>

        {/* Weight Settings Modal */}
        <Modal
          visible={showWeightModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowWeightModal(false)}
        >
          <BlurView intensity={40} tint="dark" style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <LiquidGlassCard style={styles.modal}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Weight Settings</Text>
                  <TouchableOpacity onPress={() => setShowWeightModal(false)}>
                    <X size={24} color={AppColors.textSecondary} />
                  </TouchableOpacity>
                </View>

                <View style={styles.unitToggle}>
                  <TouchableOpacity
                    style={[
                      styles.unitButton,
                      weightUnit === 'kg' && styles.unitButtonActive,
                    ]}
                    onPress={() => {
                      if (weightUnit !== 'kg') toggleWeightUnit();
                    }}
                  >
                    <Text style={[
                      styles.unitButtonText,
                      weightUnit === 'kg' && styles.unitButtonTextActive,
                    ]}>
                      Kilograms (kg)
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.unitButton,
                      weightUnit === 'lbs' && styles.unitButtonActive,
                    ]}
                    onPress={() => {
                      if (weightUnit !== 'lbs') toggleWeightUnit();
                    }}
                  >
                    <Text style={[
                      styles.unitButtonText,
                      weightUnit === 'lbs' && styles.unitButtonTextActive,
                    ]}>
                      Pounds (lbs)
                    </Text>
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.exerciseWeights}>
                  {workout.exercises.map((exercise, index) => (
                    <View key={index} style={styles.weightRow}>
                      <Text style={styles.weightExerciseName}>{exercise.name}</Text>
                      <View style={styles.weightInputContainer}>
                        <TextInput
                          style={styles.weightInput}
                          value={exerciseWeights[index.toString()] || exercise.weight}
                          onChangeText={(value) => updateExerciseWeight(index, value)}
                          keyboardType="numeric"
                          placeholder="0"
                          placeholderTextColor={AppColors.textTertiary}
                        />
                        <Text style={styles.weightInputUnit}>{weightUnit}</Text>
                      </View>
                    </View>
                  ))}
                </ScrollView>

                <GlassButton
                  title="Done"
                  onPress={() => setShowWeightModal(false)}
                  variant="primary"
                  size="large"
                  style={styles.modalButton}
                />
              </LiquidGlassCard>
            </View>
          </BlurView>
        </Modal>
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
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  workoutTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: AppColors.textPrimary,
  },
  workoutTime: {
    fontSize: 14,
    color: AppColors.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  settingsButton: {
    padding: 4,
  },
  statsCard: {
    marginHorizontal: 20,
    marginVertical: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: AppColors.textPrimary,
  },
  statLabel: {
    fontSize: 12,
    color: AppColors.textSecondary,
    fontWeight: '600',
  },
  weightUnit: {
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.primary,
  },
  restCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: AppColors.accent,
  },
  restTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.accent,
    marginBottom: 8,
  },
  restTimer: {
    fontSize: 32,
    fontWeight: '700',
    color: AppColors.accent,
    marginBottom: 4,
  },
  restSubtitle: {
    fontSize: 14,
    color: AppColors.textSecondary,
  },
  exercisesList: {
    flex: 1,
  },
  exercisesContent: {
    paddingBottom: 150,
  },
  exerciseCard: {
    marginHorizontal: 20,
    marginBottom: 16,
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  exerciseNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: AppColors.primary,
    width: 30,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: '600',
    color: AppColors.textPrimary,
    marginBottom: 4,
  },
  exerciseMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  exerciseDetail: {
    fontSize: 14,
    color: AppColors.textSecondary,
    fontWeight: '500',
  },
  weightContainer: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: AppColors.backgroundSecondary,
    borderRadius: 8,
  },
  exerciseWeight: {
    fontSize: 14,
    color: AppColors.primary,
    fontWeight: '600',
  },
  setsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  setButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: AppColors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: AppColors.border,
  },
  setButtonCompleted: {
    backgroundColor: AppColors.success,
    borderColor: AppColors.success,
  },
  setNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.textSecondary,
  },
  controlsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 130,
    gap: 12,
  },
  controlButton: {
    flex: 1,
  },
  halfButton: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  modalContainer: {
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modal: {
    padding: 0,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: AppColors.textPrimary,
  },
  unitToggle: {
    marginHorizontal: 24,
    marginBottom: 20,
    backgroundColor: AppColors.backgroundSecondary,
    borderRadius: 12,
    padding: 4,
  },
  unitButton: {
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
  exerciseWeights: {
    maxHeight: 300,
    marginHorizontal: 24,
    marginBottom: 20,
  },
  weightRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border,
  },
  weightExerciseName: {
    fontSize: 16,
    color: AppColors.textPrimary,
    flex: 1,
  },
  weightInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.backgroundSecondary,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  weightInput: {
    fontSize: 16,
    color: AppColors.textPrimary,
    minWidth: 50,
    textAlign: 'center',
  },
  weightInputUnit: {
    fontSize: 14,
    color: AppColors.textSecondary,
  },
  modalButton: {
    marginHorizontal: 24,
    marginBottom: 24,
  },
});