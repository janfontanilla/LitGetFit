import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
  Animated,
  Alert,
  TextInput,
  ScrollView,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { 
  X, 
  Play, 
  Pause, 
  Square, 
  Clock, 
  Dumbbell, 
  Heart, 
  CheckCircle, 
  Home,
  Target,
  Flame,
  Info,
  Edit
} from 'lucide-react-native';

import LiquidGlassCard from './LiquidGlassCard';
import GlassButton from './GlassButton';
import { AppColors } from '@/styles/colors';
import { router } from 'expo-router';

const { width, height } = Dimensions.get('window');

interface WorkoutExercise {
  name: string;
  sets: string;
  reps: string;
  weight: string;
  restTime: string;
  order: number;
  instructions?: string;
  targetMuscles?: string[];
}

interface WorkoutData {
  id?: string;
  name: string;
  description: string;
  exercises: WorkoutExercise[];
  estimatedDuration: number;
  targetedMuscles?: string[];
}

interface WorkoutTrackingOverlayProps {
  visible: boolean;
  workout: WorkoutData;
  onClose: () => void;
  onComplete: (workoutStats: WorkoutStats) => void;
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

type WorkoutState = 'ready' | 'active' | 'paused' | 'resting' | 'completed';

export default function WorkoutTrackingOverlay({ 
  visible, 
  workout, 
  onClose, 
  onComplete 
}: WorkoutTrackingOverlayProps) {
  // Core state
  const [workoutState, setWorkoutState] = useState<WorkoutState>('ready');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [caloriesBurned, setCaloriesBurned] = useState(0);
  const [heartRate, setHeartRate] = useState(0);
  
  // Exercise tracking
  const [completedSets, setCompletedSets] = useState<{ [key: string]: boolean[] }>({});
  const [exerciseData, setExerciseData] = useState<{ [key: string]: { reps: string; weight: string; notes: string } }>({});
  const [showExerciseDetails, setShowExerciseDetails] = useState<string | null>(null);
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible) {
      initializeWorkout();
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (workoutState === 'active') {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
        // Simulate calorie burn (rough estimate: 5-10 calories per minute)
        setCaloriesBurned(prev => prev + 0.15);
        // Simulate heart rate (would be real data from device)
        setHeartRate(120 + Math.floor(Math.random() * 40));
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [workoutState]);

  const initializeWorkout = () => {
    const sets: { [key: string]: boolean[] } = {};
    const data: { [key: string]: { reps: string; weight: string; notes: string } } = {};
    
    workout.exercises.forEach((exercise, index) => {
      sets[index.toString()] = new Array(parseInt(exercise.sets) || 3).fill(false);
      data[index.toString()] = {
        reps: exercise.reps,
        weight: exercise.weight,
        notes: '',
      };
    });
    
    setCompletedSets(sets);
    setExerciseData(data);
    setElapsedTime(0);
    setCaloriesBurned(0);
    setWorkoutState('ready');
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startWorkout = () => {
    setWorkoutState('active');
  };

  const pauseWorkout = () => {
    setWorkoutState('paused');
  };

  const resumeWorkout = () => {
    setWorkoutState('active');
  };

  const stopWorkout = () => {
    Alert.alert(
      'Stop Workout',
      'Are you sure you want to stop this workout? Your progress will be saved.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Stop Workout',
          style: 'destructive',
          onPress: completeWorkout,
        },
      ]
    );
  };

  const completeWorkout = () => {
    const stats: WorkoutStats = {
      workoutId: workout.id,
      workoutName: workout.name,
      duration: elapsedTime,
      exercisesCompleted: getCompletedExercisesCount(),
      totalExercises: workout.exercises.length,
      setsCompleted: getCompletedSetsCount(),
      totalSets: getTotalSets(),
      completedAt: new Date(),
      targetedMuscles: workout.targetedMuscles || [],
      caloriesBurned: Math.round(caloriesBurned),
      heartRate: heartRate,
    };

    setWorkoutState('completed');
    
    // Show completion animation
    Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1.2,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    setTimeout(() => {
      onComplete(stats);
    }, 1500);
  };

  const toggleSetCompletion = (exerciseIndex: number, setIndex: number) => {
    if (workoutState !== 'active') return;
    
    const newCompletedSets = { ...completedSets };
    newCompletedSets[exerciseIndex.toString()][setIndex] = !newCompletedSets[exerciseIndex.toString()][setIndex];
    setCompletedSets(newCompletedSets);

    // Trigger haptic feedback
    if (Platform.OS !== 'web') {
      // Would use Haptics.impactAsync here on native platforms
    } else {
      // Visual feedback for web
      console.log('Set completion toggled - visual feedback');
    }
  };

  const getTotalSets = () => {
    return workout.exercises.reduce((total, exercise) => {
      return total + (parseInt(exercise.sets) || 0);
    }, 0);
  };

  const getCompletedSetsCount = () => {
    return Object.values(completedSets).reduce((total, sets) => {
      return total + sets.filter(Boolean).length;
    }, 0);
  };

  const getCompletedExercisesCount = () => {
    return workout.exercises.filter((_, index) => {
      const sets = completedSets[index.toString()] || [];
      return sets.every(Boolean);
    }).length;
  };

  const getExerciseProgress = (exerciseIndex: number) => {
    const sets = completedSets[exerciseIndex.toString()] || [];
    const completedSetsCount = sets.filter(Boolean).length;
    const totalSets = parseInt(workout.exercises[exerciseIndex].sets) || 0;
    return totalSets > 0 ? (completedSetsCount / totalSets) * 100 : 0;
  };

  const getOverallProgress = () => {
    const totalSets = getTotalSets();
    const completedSetsCount = getCompletedSetsCount();
    return totalSets > 0 ? (completedSetsCount / totalSets) * 100 : 0;
  };

  const exitToHome = () => {
    router.replace('/(tabs)');
  };

  const toggleExerciseDetails = (exerciseIndex: string | null) => {
    setShowExerciseDetails(exerciseIndex);
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <BlurView intensity={95} tint="dark" style={styles.blurContainer}>
          {/* Top Bar */}
          <View style={styles.topBar}>
            <View style={styles.topBarContent}>
              <Text style={styles.workoutName}>{workout.name}</Text>
              <Text style={styles.timer}>{formatTime(elapsedTime)}</Text>
              <TouchableOpacity 
                style={styles.stopButton} 
                onPress={exitToHome}
                accessibilityLabel="Exit workout"
              >
                <Home size={20} color={AppColors.accent} />
                <Text style={styles.stopButtonText}>Exit</Text>
              </TouchableOpacity>
            </View>
            
            {/* Progress Bar */}
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill,
                    { width: `${getOverallProgress()}%` }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>
                {Math.round(getOverallProgress())}% Complete
              </Text>
            </View>
          </View>

          {/* Main Content */}
          <ScrollView 
            style={styles.mainContent} 
            contentContainerStyle={styles.mainContentContainer}
            showsVerticalScrollIndicator={false}
          >
            {/* Workout State Controls */}
            <View style={styles.workoutControls}>
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
                <GlassButton
                  title="Pause Workout"
                  onPress={pauseWorkout}
                  variant="secondary"
                  size="large"
                  style={styles.controlButton}
                  icon={<Pause size={20} color={AppColors.textPrimary} />}
                />
              )}
              
              {workoutState === 'paused' && (
                <GlassButton
                  title="Resume Workout"
                  onPress={resumeWorkout}
                  variant="primary"
                  size="large"
                  style={styles.controlButton}
                  icon={<Play size={20} color={AppColors.textPrimary} />}
                />
              )}
            </View>

            {/* All Exercises List */}
            <View style={styles.exercisesList}>
              <Text style={styles.exercisesListTitle}>Exercises</Text>
              
              {workout.exercises.map((exercise, exerciseIndex) => (
                <LiquidGlassCard 
                  key={exerciseIndex} 
                  style={[
                    styles.exerciseCard,
                    showExerciseDetails === exerciseIndex.toString() && styles.exerciseCardExpanded
                  ]}
                >
                  {/* Exercise Header */}
                  <TouchableOpacity
                    style={styles.exerciseHeader}
                    onPress={() => toggleExerciseDetails(
                      showExerciseDetails === exerciseIndex.toString() ? null : exerciseIndex.toString()
                    )}
                  >
                    <View style={styles.exerciseHeaderLeft}>
                      <Text style={styles.exerciseNumber}>{exerciseIndex + 1}</Text>
                      <View style={styles.exerciseInfo}>
                        <Text style={styles.exerciseName}>{exercise.name}</Text>
                        <Text style={styles.exerciseDetails}>
                          {exercise.sets} sets × {exercise.reps} reps • {exercise.weight}
                        </Text>
                      </View>
                    </View>
                    
                    <View style={styles.exerciseProgress}>
                      <View style={styles.exerciseProgressBar}>
                        <View 
                          style={[
                            styles.exerciseProgressFill,
                            { width: `${getExerciseProgress(exerciseIndex)}%` }
                          ]} 
                        />
                      </View>
                      <Text style={styles.exerciseProgressText}>
                        {Math.round(getExerciseProgress(exerciseIndex))}%
                      </Text>
                    </View>
                  </TouchableOpacity>

                  {/* Exercise Details (expanded view) */}
                  {showExerciseDetails === exerciseIndex.toString() && (
                    <View style={styles.exerciseDetails}>
                      {/* Instructions */}
                      {exercise.instructions && (
                        <View style={styles.instructionsContainer}>
                          <View style={styles.instructionsHeader}>
                            <Info size={16} color={AppColors.primary} />
                            <Text style={styles.instructionsTitle}>Instructions</Text>
                          </View>
                          <Text style={styles.instructionsText}>{exercise.instructions}</Text>
                        </View>
                      )}
                      
                      {/* Input Fields */}
                      <View style={styles.inputSection}>
                        <View style={styles.inputRow}>
                          <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Reps</Text>
                            <TextInput
                              style={styles.input}
                              value={exerciseData[exerciseIndex.toString()]?.reps}
                              onChangeText={(value) => {
                                const newData = { ...exerciseData };
                                if (!newData[exerciseIndex.toString()]) {
                                  newData[exerciseIndex.toString()] = { reps: '', weight: '', notes: '' };
                                }
                                newData[exerciseIndex.toString()].reps = value;
                                setExerciseData(newData);
                              }}
                              keyboardType="numeric"
                              placeholder={exercise.reps}
                              placeholderTextColor={AppColors.textTertiary}
                            />
                          </View>
                          
                          <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Weight</Text>
                            <TextInput
                              style={styles.input}
                              value={exerciseData[exerciseIndex.toString()]?.weight}
                              onChangeText={(value) => {
                                const newData = { ...exerciseData };
                                if (!newData[exerciseIndex.toString()]) {
                                  newData[exerciseIndex.toString()] = { reps: '', weight: '', notes: '' };
                                }
                                newData[exerciseIndex.toString()].weight = value;
                                setExerciseData(newData);
                              }}
                              placeholder={exercise.weight}
                              placeholderTextColor={AppColors.textTertiary}
                            />
                          </View>
                        </View>

                        <View style={styles.inputGroup}>
                          <Text style={styles.inputLabel}>Notes</Text>
                          <TextInput
                            style={[styles.input, styles.notesInput]}
                            value={exerciseData[exerciseIndex.toString()]?.notes}
                            onChangeText={(value) => {
                              const newData = { ...exerciseData };
                              if (!newData[exerciseIndex.toString()]) {
                                newData[exerciseIndex.toString()] = { reps: '', weight: '', notes: '' };
                              }
                              newData[exerciseIndex.toString()].notes = value;
                              setExerciseData(newData);
                            }}
                            placeholder="Add notes about this exercise..."
                            placeholderTextColor={AppColors.textTertiary}
                            multiline
                          />
                        </View>
                      </View>
                    </View>
                  )}

                  {/* Sets Tracking */}
                  <View style={styles.setsContainer}>
                    <Text style={styles.setsLabel}>Sets:</Text>
                    <View style={styles.setsRow}>
                      {Array.from({ length: parseInt(exercise.sets) || 3 }).map((_, setIndex) => {
                        const isCompleted = completedSets[exerciseIndex.toString()]?.[setIndex] || false;
                        return (
                          <TouchableOpacity
                            key={setIndex}
                            style={[
                              styles.setButton,
                              isCompleted && styles.setButtonCompleted,
                            ]}
                            onPress={() => toggleSetCompletion(exerciseIndex, setIndex)}
                            disabled={workoutState !== 'active'}
                          >
                            {isCompleted ? (
                              <CheckCircle size={16} color={AppColors.textPrimary} />
                            ) : (
                              <Text style={styles.setNumber}>{setIndex + 1}</Text>
                            )}
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                </LiquidGlassCard>
              ))}
            </View>

            {/* Completion Section */}
            {workoutState === 'completed' && (
              <View style={styles.completionContainer}>
                <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                  <CheckCircle size={48} color={AppColors.success} />
                </Animated.View>
                <Text style={styles.completionTitle}>Workout Complete!</Text>
                <Text style={styles.completionStats}>
                  {formatTime(elapsedTime)} • {Math.round(caloriesBurned)} calories burned
                </Text>
              </View>
            )}
          </ScrollView>

          {/* Bottom Metrics Bar */}
          <View style={styles.bottomMetrics}>
            <View style={styles.metricItem}>
              <Flame size={16} color={AppColors.accent} />
              <Text style={styles.metricValue}>{Math.round(caloriesBurned)}</Text>
              <Text style={styles.metricLabel}>Calories</Text>
            </View>
            
            <View style={styles.metricItem}>
              <Dumbbell size={16} color={AppColors.primary} />
              <Text style={styles.metricValue}>
                {getCompletedSetsCount()}/{getTotalSets()}
              </Text>
              <Text style={styles.metricLabel}>Sets</Text>
            </View>
            
            <View style={styles.metricItem}>
              <Clock size={16} color={AppColors.success} />
              <Text style={styles.metricValue}>{formatTime(elapsedTime)}</Text>
              <Text style={styles.metricLabel}>Time</Text>
            </View>
            
            {heartRate > 0 && (
              <View style={styles.metricItem}>
                <Heart size={16} color={AppColors.warning} />
                <Text style={styles.metricValue}>{heartRate}</Text>
                <Text style={styles.metricLabel}>BPM</Text>
              </View>
            )}
          </View>
        </BlurView>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.98)',
  },
  blurContainer: {
    flex: 1,
  },
  topBar: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border,
    backgroundColor: 'rgba(10, 10, 10, 0.95)',
    zIndex: 1000,
  },
  topBarContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  workoutName: {
    fontSize: 18,
    fontWeight: '600',
    color: AppColors.textPrimary,
    flex: 1,
  },
  timer: {
    fontSize: 24,
    fontWeight: '700',
    color: AppColors.primary,
    marginHorizontal: 20,
  },
  stopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderRadius: 12,
    gap: 6,
  },
  stopButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.accent,
  },
  progressBarContainer: {
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: AppColors.backgroundSecondary,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: AppColors.primary,
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: AppColors.textSecondary,
    fontWeight: '600',
  },
  mainContent: {
    flex: 1,
  },
  mainContentContainer: {
    paddingBottom: 100,
  },
  workoutControls: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  controlButton: {
    width: '100%',
  },
  exercisesList: {
    paddingHorizontal: 20,
  },
  exercisesListTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: AppColors.textPrimary,
    marginBottom: 16,
  },
  exerciseCard: {
    marginBottom: 16,
    padding: 16,
  },
  exerciseCardExpanded: {
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  exerciseHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  exerciseNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: AppColors.primary,
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: 16,
    fontWeight: '700',
    color: AppColors.textPrimary,
    marginRight: 12,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.textPrimary,
    marginBottom: 4,
  },
  exerciseDetails: {
    fontSize: 14,
    color: AppColors.textSecondary,
  },
  exerciseProgress: {
    alignItems: 'flex-end',
    width: 60,
  },
  exerciseProgressBar: {
    width: 50,
    height: 4,
    backgroundColor: AppColors.backgroundSecondary,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 4,
  },
  exerciseProgressFill: {
    height: '100%',
    backgroundColor: AppColors.success,
    borderRadius: 2,
  },
  exerciseProgressText: {
    fontSize: 10,
    color: AppColors.textTertiary,
  },
  exerciseDetails: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: AppColors.border,
  },
  instructionsContainer: {
    marginBottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 12,
  },
  instructionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  instructionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.primary,
  },
  instructionsText: {
    fontSize: 14,
    color: AppColors.textPrimary,
    lineHeight: 20,
  },
  inputSection: {
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  inputGroup: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: AppColors.textSecondary,
    marginBottom: 6,
  },
  input: {
    backgroundColor: AppColors.backgroundSecondary,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: AppColors.textPrimary,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  notesInput: {
    height: 60,
    textAlignVertical: 'top',
  },
  setsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  setsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.textSecondary,
    marginRight: 12,
  },
  setsRow: {
    flexDirection: 'row',
    gap: 8,
    flex: 1,
  },
  setButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: AppColors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
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
  completionContainer: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: 30,
    marginTop: 20,
  },
  completionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: AppColors.success,
  },
  completionStats: {
    fontSize: 16,
    color: AppColors.textSecondary,
  },
  bottomMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(10, 10, 10, 0.95)',
    borderTopWidth: 1,
    borderTopColor: AppColors.border,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  metricItem: {
    alignItems: 'center',
    gap: 4,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '700',
    color: AppColors.textPrimary,
  },
  metricLabel: {
    fontSize: 10,
    color: AppColors.textSecondary,
    fontWeight: '600',
  },
});