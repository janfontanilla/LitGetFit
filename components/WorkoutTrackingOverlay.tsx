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
  PanResponder,
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
  ChevronLeft,
  ChevronRight,
  SkipForward,
  Edit3,
  MessageSquare,
  BookOpen,
  Zap,
  Target,
  Flame,
  CheckCircle,
  RotateCcw,
  Settings,
  Camera,
  Mic
} from 'lucide-react-native';

import LiquidGlassCard from './LiquidGlassCard';
import GlassButton from './GlassButton';
import { AppColors, Gradients } from '@/styles/colors';

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
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [restTimer, setRestTimer] = useState(0);
  const [caloriesBurned, setCaloriesBurned] = useState(0);
  const [heartRate, setHeartRate] = useState(0);
  
  // Exercise tracking
  const [completedSets, setCompletedSets] = useState<{ [key: string]: boolean[] }>({});
  const [exerciseData, setExerciseData] = useState<{ [key: string]: { reps: string; weight: string; notes: string } }>({});
  
  // UI state
  const [showQuickMenu, setShowQuickMenu] = useState(false);
  const [showFormGuide, setShowFormGuide] = useState(false);
  const [showExerciseNotes, setShowExerciseNotes] = useState(false);
  const [isAIAnalyzing, setIsAIAnalyzing] = useState(false);
  const [aiFormFeedback, setAIFormFeedback] = useState('');
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(width)).current;

  // Pan responder for swipe gestures
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 20 && Math.abs(gestureState.dy) < 50;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx > 0) {
          // Swiping right - previous exercise
          slideAnim.setValue(-gestureState.dx);
        } else {
          // Swiping left - next exercise
          slideAnim.setValue(-gestureState.dx);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (Math.abs(gestureState.dx) > 100) {
          if (gestureState.dx > 0 && currentExerciseIndex > 0) {
            // Previous exercise
            navigateToExercise(currentExerciseIndex - 1);
          } else if (gestureState.dx < 0 && currentExerciseIndex < workout.exercises.length - 1) {
            // Next exercise
            navigateToExercise(currentExerciseIndex + 1);
          }
        }
        
        // Reset animation
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      },
    })
  ).current;

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

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (workoutState === 'resting' && restTimer > 0) {
      interval = setInterval(() => {
        setRestTimer(prev => {
          if (prev <= 1) {
            setWorkoutState('active');
            // Trigger haptic feedback (web-compatible)
            console.log('Rest complete - haptic feedback');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [workoutState, restTimer]);

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
    setCurrentExerciseIndex(0);
    setCurrentSet(1);
    setElapsedTime(0);
    setRestTimer(0);
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
    setIsAIAnalyzing(true);
    
    // Simulate AI form analysis
    setTimeout(() => {
      setAIFormFeedback('Great form! Keep your core engaged and maintain controlled movements.');
      setIsAIAnalyzing(false);
    }, 2000);
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

  const recordSet = () => {
    const exerciseKey = currentExerciseIndex.toString();
    const newCompletedSets = { ...completedSets };
    
    // Mark current set as completed
    newCompletedSets[exerciseKey][currentSet - 1] = true;
    setCompletedSets(newCompletedSets);

    const exercise = workout.exercises[currentExerciseIndex];
    const totalSetsForExercise = parseInt(exercise.sets);

    if (currentSet < totalSetsForExercise) {
      // Move to next set and start rest timer
      setCurrentSet(currentSet + 1);
      const restTime = parseInt(exercise.restTime) || 60;
      setRestTimer(restTime);
      setWorkoutState('resting');
    } else {
      // Exercise completed, move to next exercise
      if (currentExerciseIndex < workout.exercises.length - 1) {
        navigateToExercise(currentExerciseIndex + 1);
      } else {
        // Workout completed
        completeWorkout();
      }
    }
  };

  const navigateToExercise = (index: number) => {
    if (index >= 0 && index < workout.exercises.length) {
      setCurrentExerciseIndex(index);
      setCurrentSet(1);
      setRestTimer(0);
      if (workoutState === 'resting') {
        setWorkoutState('active');
      }
    }
  };

  const skipExercise = () => {
    Alert.alert(
      'Skip Exercise',
      `Skip ${workout.exercises[currentExerciseIndex].name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Skip',
          onPress: () => {
            if (currentExerciseIndex < workout.exercises.length - 1) {
              navigateToExercise(currentExerciseIndex + 1);
            } else {
              completeWorkout();
            }
          },
        },
      ]
    );
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

  const getProgressPercentage = () => {
    const totalSets = getTotalSets();
    const completedSetsCount = getCompletedSetsCount();
    return totalSets > 0 ? (completedSetsCount / totalSets) * 100 : 0;
  };

  const currentExercise = workout.exercises[currentExerciseIndex];
  const currentExerciseData = exerciseData[currentExerciseIndex.toString()] || { reps: '', weight: '', notes: '' };
  const nextExercise = currentExerciseIndex < workout.exercises.length - 1 ? workout.exercises[currentExerciseIndex + 1] : null;

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
              <TouchableOpacity style={styles.stopButton} onPress={stopWorkout}>
                <Square size={20} color={AppColors.accent} />
                <Text style={styles.stopButtonText}>Stop</Text>
              </TouchableOpacity>
            </View>
            
            {/* Progress Bar */}
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill,
                    { width: `${getProgressPercentage()}%` }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>
                {Math.round(getProgressPercentage())}% Complete
              </Text>
            </View>
          </View>

          {/* Main Content */}
          <ScrollView style={styles.mainContent} showsVerticalScrollIndicator={false}>
            {/* Current Exercise Panel */}
            <Animated.View 
              style={[styles.currentExercisePanel, { transform: [{ translateX: slideAnim }] }]}
              {...panResponder.panHandlers}
            >
              <LiquidGlassCard style={styles.exerciseCard}>
                {/* Exercise Header */}
                <View style={styles.exerciseHeader}>
                  <View style={styles.exerciseNavigation}>
                    <TouchableOpacity
                      style={[styles.navButton, currentExerciseIndex === 0 && styles.navButtonDisabled]}
                      onPress={() => navigateToExercise(currentExerciseIndex - 1)}
                      disabled={currentExerciseIndex === 0}
                    >
                      <ChevronLeft size={20} color={currentExerciseIndex === 0 ? AppColors.textTertiary : AppColors.textPrimary} />
                    </TouchableOpacity>
                    
                    <View style={styles.exerciseInfo}>
                      <Text style={styles.exerciseNumber}>
                        Exercise {currentExerciseIndex + 1} of {workout.exercises.length}
                      </Text>
                      <Text style={styles.exerciseName}>{currentExercise.name}</Text>
                      <Text style={styles.setCounter}>
                        Set {currentSet}/{currentExercise.sets} - Target: {currentExercise.reps} reps
                      </Text>
                    </View>
                    
                    <TouchableOpacity
                      style={[styles.navButton, currentExerciseIndex === workout.exercises.length - 1 && styles.navButtonDisabled]}
                      onPress={() => navigateToExercise(currentExerciseIndex + 1)}
                      disabled={currentExerciseIndex === workout.exercises.length - 1}
                    >
                      <ChevronRight size={20} color={currentExerciseIndex === workout.exercises.length - 1 ? AppColors.textTertiary : AppColors.textPrimary} />
                    </TouchableOpacity>
                  </View>

                  {/* Muscle Group Indicator */}
                  {currentExercise.targetMuscles && (
                    <View style={styles.muscleIndicator}>
                      <Target size={16} color={AppColors.primary} />
                      <Text style={styles.muscleText}>
                        {currentExercise.targetMuscles.join(', ')}
                      </Text>
                    </View>
                  )}
                </View>

                {/* AI Form Feedback */}
                <View style={styles.aiFeedbackContainer}>
                  <View style={styles.aiFeedbackHeader}>
                    <Camera size={16} color={AppColors.primary} />
                    <Text style={styles.aiFeedbackTitle}>AI Form Analysis</Text>
                    {isAIAnalyzing && (
                      <View style={styles.analyzingIndicator}>
                        <Text style={styles.analyzingText}>Analyzing...</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.aiFeedbackText}>
                    {aiFormFeedback || 'Start your set to receive real-time form feedback'}
                  </Text>
                </View>

                {/* Input Fields */}
                <View style={styles.inputSection}>
                  <View style={styles.inputRow}>
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Reps Completed</Text>
                      <TextInput
                        style={styles.input}
                        value={currentExerciseData.reps}
                        onChangeText={(value) => {
                          const newData = { ...exerciseData };
                          newData[currentExerciseIndex.toString()] = {
                            ...newData[currentExerciseIndex.toString()],
                            reps: value,
                          };
                          setExerciseData(newData);
                        }}
                        keyboardType="numeric"
                        placeholder={currentExercise.reps}
                        placeholderTextColor={AppColors.textTertiary}
                      />
                    </View>
                    
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Weight Used</Text>
                      <TextInput
                        style={styles.input}
                        value={currentExerciseData.weight}
                        onChangeText={(value) => {
                          const newData = { ...exerciseData };
                          newData[currentExerciseIndex.toString()] = {
                            ...newData[currentExerciseIndex.toString()],
                            weight: value,
                          };
                          setExerciseData(newData);
                        }}
                        placeholder={currentExercise.weight}
                        placeholderTextColor={AppColors.textTertiary}
                      />
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Notes (Optional)</Text>
                    <TextInput
                      style={[styles.input, styles.notesInput]}
                      value={currentExerciseData.notes}
                      onChangeText={(value) => {
                        const newData = { ...exerciseData };
                        newData[currentExerciseIndex.toString()] = {
                          ...newData[currentExerciseIndex.toString()],
                          notes: value,
                        };
                        setExerciseData(newData);
                      }}
                      placeholder="How did this set feel?"
                      placeholderTextColor={AppColors.textTertiary}
                      multiline
                    />
                  </View>
                </View>

                {/* Record Set Button */}
                <GlassButton
                  title="Record Set"
                  onPress={recordSet}
                  variant="primary"
                  size="large"
                  style={styles.recordButton}
                  disabled={workoutState !== 'active'}
                  icon={<CheckCircle size={20} color={AppColors.textPrimary} />}
                />

                {/* Quick Access Menu */}
                <View style={styles.quickAccessMenu}>
                  <TouchableOpacity 
                    style={styles.quickAccessButton}
                    onPress={() => setShowFormGuide(true)}
                  >
                    <BookOpen size={16} color={AppColors.textSecondary} />
                    <Text style={styles.quickAccessText}>Form Guide</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.quickAccessButton}
                    onPress={skipExercise}
                  >
                    <SkipForward size={16} color={AppColors.textSecondary} />
                    <Text style={styles.quickAccessText}>Skip</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.quickAccessButton}
                    onPress={() => setShowExerciseNotes(true)}
                  >
                    <Edit3 size={16} color={AppColors.textSecondary} />
                    <Text style={styles.quickAccessText}>Modify</Text>
                  </TouchableOpacity>
                </View>
              </LiquidGlassCard>
            </Animated.View>

            {/* Next Exercise Preview */}
            {nextExercise && workoutState !== 'completed' && (
              <LiquidGlassCard style={styles.nextExercisePanel}>
                <View style={styles.nextExerciseHeader}>
                  <Text style={styles.nextExerciseTitle}>Next Exercise</Text>
                  <TouchableOpacity
                    style={styles.continueButton}
                    onPress={() => navigateToExercise(currentExerciseIndex + 1)}
                  >
                    <Text style={styles.continueButtonText}>Continue</Text>
                    <ChevronRight size={16} color={AppColors.primary} />
                  </TouchableOpacity>
                </View>
                <Text style={styles.nextExerciseName}>{nextExercise.name}</Text>
                <Text style={styles.nextExerciseDetails}>
                  {nextExercise.sets} sets × {nextExercise.reps} reps
                </Text>
              </LiquidGlassCard>
            )}

            {/* Rest Timer */}
            {workoutState === 'resting' && (
              <LiquidGlassCard style={styles.restTimerPanel}>
                <Text style={styles.restTitle}>Rest Time</Text>
                <Animated.Text style={[styles.restTimer, { transform: [{ scale: pulseAnim }] }]}>
                  {formatTime(restTimer)}
                </Animated.Text>
                <Text style={styles.restSubtitle}>Get ready for your next set</Text>
                <GlassButton
                  title="Skip Rest"
                  onPress={() => {
                    setRestTimer(0);
                    setWorkoutState('active');
                  }}
                  variant="secondary"
                  size="small"
                  style={styles.skipRestButton}
                />
              </LiquidGlassCard>
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
                {currentExercise.targetMuscles?.[0] || 'Full Body'}
              </Text>
              <Text style={styles.metricLabel}>Active Muscle</Text>
            </View>
            
            <View style={styles.metricItem}>
              <Clock size={16} color={AppColors.success} />
              <Text style={styles.metricValue}>{formatTime(elapsedTime)}</Text>
              <Text style={styles.metricLabel}>Elapsed</Text>
            </View>
            
            {heartRate > 0 && (
              <View style={styles.metricItem}>
                <Heart size={16} color={AppColors.warning} />
                <Text style={styles.metricValue}>{heartRate}</Text>
                <Text style={styles.metricLabel}>BPM</Text>
              </View>
            )}
          </View>

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
              <GlassButton
                title="Pause"
                onPress={pauseWorkout}
                variant="secondary"
                size="large"
                style={styles.controlButton}
                icon={<Pause size={20} color={AppColors.textPrimary} />}
              />
            )}
            
            {workoutState === 'paused' && (
              <GlassButton
                title="Resume"
                onPress={resumeWorkout}
                variant="primary"
                size="large"
                style={styles.controlButton}
                icon={<Play size={20} color={AppColors.textPrimary} />}
              />
            )}

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
          </View>

          {/* Form Guide Modal */}
          <Modal
            visible={showFormGuide}
            transparent
            animationType="slide"
            onRequestClose={() => setShowFormGuide(false)}
          >
            <BlurView intensity={40} tint="dark" style={styles.modalOverlay}>
              <View style={styles.modalContainer}>
                <LiquidGlassCard style={styles.modal}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Form Guide</Text>
                    <TouchableOpacity onPress={() => setShowFormGuide(false)}>
                      <X size={24} color={AppColors.textSecondary} />
                    </TouchableOpacity>
                  </View>
                  <ScrollView style={styles.modalContent}>
                    <Text style={styles.modalText}>
                      {currentExercise.instructions || 
                        `Proper form for ${currentExercise.name}:\n\n• Maintain controlled movements\n• Keep your core engaged\n• Breathe properly throughout the exercise\n• Focus on the target muscles\n• Use full range of motion`
                      }
                    </Text>
                  </ScrollView>
                  <GlassButton
                    title="Got it"
                    onPress={() => setShowFormGuide(false)}
                    variant="primary"
                    size="medium"
                    style={styles.modalButton}
                  />
                </LiquidGlassCard>
              </View>
            </BlurView>
          </Modal>
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
    paddingHorizontal: 20,
  },
  currentExercisePanel: {
    marginVertical: 20,
  },
  exerciseCard: {
    minHeight: 400,
  },
  exerciseHeader: {
    marginBottom: 20,
  },
  exerciseNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: AppColors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonDisabled: {
    opacity: 0.3,
  },
  exerciseInfo: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 16,
  },
  exerciseNumber: {
    fontSize: 12,
    color: AppColors.textSecondary,
    fontWeight: '600',
    marginBottom: 4,
  },
  exerciseName: {
    fontSize: 24,
    fontWeight: '700',
    color: AppColors.textPrimary,
    textAlign: 'center',
    marginBottom: 4,
  },
  setCounter: {
    fontSize: 16,
    color: AppColors.primary,
    fontWeight: '600',
  },
  muscleIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: AppColors.backgroundSecondary,
    borderRadius: 12,
    alignSelf: 'center',
  },
  muscleText: {
    fontSize: 12,
    color: AppColors.primary,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  aiFeedbackContainer: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  aiFeedbackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  aiFeedbackTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.primary,
    flex: 1,
  },
  analyzingIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderRadius: 8,
  },
  analyzingText: {
    fontSize: 10,
    color: AppColors.primary,
    fontWeight: '600',
  },
  aiFeedbackText: {
    fontSize: 14,
    color: AppColors.textPrimary,
    lineHeight: 20,
  },
  inputSection: {
    marginBottom: 20,
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
    fontSize: 16,
    color: AppColors.textPrimary,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  notesInput: {
    height: 60,
    textAlignVertical: 'top',
  },
  recordButton: {
    width: '100%',
    marginBottom: 16,
  },
  quickAccessMenu: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: AppColors.border,
  },
  quickAccessButton: {
    alignItems: 'center',
    gap: 4,
  },
  quickAccessText: {
    fontSize: 11,
    color: AppColors.textSecondary,
    fontWeight: '500',
  },
  nextExercisePanel: {
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  nextExerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  nextExerciseTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.textSecondary,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderRadius: 8,
  },
  continueButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: AppColors.primary,
  },
  nextExerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.textPrimary,
    marginBottom: 4,
  },
  nextExerciseDetails: {
    fontSize: 12,
    color: AppColors.textSecondary,
  },
  restTimerPanel: {
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  restTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.accent,
    marginBottom: 8,
  },
  restTimer: {
    fontSize: 48,
    fontWeight: '700',
    color: AppColors.accent,
    marginBottom: 8,
  },
  restSubtitle: {
    fontSize: 14,
    color: AppColors.textSecondary,
    marginBottom: 16,
  },
  skipRestButton: {
    paddingHorizontal: 24,
  },
  bottomMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderTopWidth: 1,
    borderTopColor: AppColors.border,
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
  controlsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  controlButton: {
    width: '100%',
  },
  completionContainer: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: 20,
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  modalContainer: {
    width: '90%',
    maxWidth: 400,
    maxHeight: height * 0.7,
  },
  modal: {
    padding: 0,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: AppColors.textPrimary,
  },
  modalContent: {
    maxHeight: 300,
    paddingHorizontal: 24,
  },
  modalText: {
    fontSize: 16,
    color: AppColors.textPrimary,
    lineHeight: 24,
  },
  modalButton: {
    marginHorizontal: 24,
    marginVertical: 24,
  },
});