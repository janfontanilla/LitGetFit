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
  ScrollView,
  TextInput,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { 
  X, 
  Play, 
  Pause, 
  Square, 
  Clock, 
  Dumbbell, 
  Settings,
  RotateCcw,
  Check,
  ChevronLeft,
  ChevronRight,
  SkipForward,
  Volume2,
  VolumeX,
  Target,
  Award
} from 'lucide-react-native';

import LiquidGlassCard from './LiquidGlassCard';
import GlassButton from './GlassButton';
import MuscleGroupVisualization from './MuscleGroupVisualization';
import { AppColors, Gradients } from '@/styles/colors';

const { width, height } = Dimensions.get('window');

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

interface WorkoutOverlayProps {
  visible: boolean;
  workout: WorkoutData;
  onClose: () => void;
  onComplete: (workoutStats: WorkoutStats) => void;
  onSave?: (progress: WorkoutProgress) => void;
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
}

interface WorkoutProgress {
  workoutId?: string;
  currentExerciseIndex: number;
  completedSets: { [key: string]: boolean[] };
  exerciseWeights: { [key: string]: string };
  elapsedTime: number;
  pausedAt?: Date;
}

type WeightUnit = 'kg' | 'lbs';
type WorkoutState = 'ready' | 'active' | 'paused' | 'resting' | 'completed';

export default function WorkoutOverlay({ 
  visible, 
  workout, 
  onClose, 
  onComplete, 
  onSave 
}: WorkoutOverlayProps) {
  // Core state
  const [workoutState, setWorkoutState] = useState<WorkoutState>('ready');
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [restTimer, setRestTimer] = useState(0);
  const [weightUnit, setWeightUnit] = useState<WeightUnit>('kg');
  
  // Exercise tracking
  const [exerciseWeights, setExerciseWeights] = useState<{ [key: string]: string }>({});
  const [completedSets, setCompletedSets] = useState<{ [key: string]: boolean[] }>({});
  
  // UI state
  const [showSettings, setShowSettings] = useState(false);
  const [showExerciseNotes, setShowExerciseNotes] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoAdvance, setAutoAdvance] = useState(true);
  const [defaultRestTime, setDefaultRestTime] = useState(60);
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      initializeWorkout();
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

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
    
    if (workoutState === 'resting' && restTimer > 0) {
      interval = setInterval(() => {
        setRestTimer(prev => {
          if (prev <= 1) {
            setWorkoutState('active');
            if (soundEnabled) {
              // Trigger sound notification
              console.log('Rest complete sound');
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [workoutState, restTimer, soundEnabled]);

  useEffect(() => {
    // Update progress animation
    const totalSets = getTotalSets();
    const completedSetsCount = getCompletedSetsCount();
    const progress = totalSets > 0 ? completedSetsCount / totalSets : 0;
    
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [completedSets]);

  useEffect(() => {
    // Pulse animation for active state
    if (workoutState === 'active') {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [workoutState]);

  const initializeWorkout = () => {
    const weights: { [key: string]: string } = {};
    const sets: { [key: string]: boolean[] } = {};
    
    workout.exercises.forEach((exercise, index) => {
      weights[index.toString()] = exercise.weight;
      sets[index.toString()] = new Array(parseInt(exercise.sets) || 3).fill(false);
    });
    
    setExerciseWeights(weights);
    setCompletedSets(sets);
    setCurrentExerciseIndex(0);
    setElapsedTime(0);
    setRestTimer(0);
    setWorkoutState('ready');
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
    
    const convertedWeights: { [key: string]: string } = {};
    Object.entries(exerciseWeights).forEach(([key, weight]) => {
      convertedWeights[key] = convertWeight(weight, weightUnit, newUnit);
    });
    
    setExerciseWeights(convertedWeights);
    setWeightUnit(newUnit);
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

  const getExerciseProgress = () => {
    const completed = workout.exercises.filter((_, index) => {
      const sets = completedSets[index.toString()] || [];
      return sets.every(Boolean);
    }).length;
    
    return `${completed}/${workout.exercises.length}`;
  };

  const getOverallProgress = () => {
    const totalSets = getTotalSets();
    const completedSetsCount = getCompletedSetsCount();
    return totalSets > 0 ? (completedSetsCount / totalSets) * 100 : 0;
  };

  const startWorkout = () => {
    setWorkoutState('active');
  };

  const pauseWorkout = () => {
    setWorkoutState('paused');
    onSave?.({
      workoutId: workout.id,
      currentExerciseIndex,
      completedSets,
      exerciseWeights,
      elapsedTime,
      pausedAt: new Date(),
    });
  };

  const resumeWorkout = () => {
    setWorkoutState('active');
  };

  const completeSet = (exerciseIndex: number, setIndex: number) => {
    const newCompletedSets = { ...completedSets };
    newCompletedSets[exerciseIndex.toString()][setIndex] = true;
    setCompletedSets(newCompletedSets);

    // Check if exercise is complete
    const exercise = workout.exercises[exerciseIndex];
    const sets = newCompletedSets[exerciseIndex.toString()];
    const isExerciseComplete = sets.every(Boolean);

    if (isExerciseComplete) {
      // Exercise completed
      if (soundEnabled) {
        console.log('Exercise complete sound');
      }
      
      if (autoAdvance && exerciseIndex < workout.exercises.length - 1) {
        setTimeout(() => {
          setCurrentExerciseIndex(exerciseIndex + 1);
        }, 1000);
      }
    } else {
      // Start rest timer
      const restTime = parseInt(exercise.restTime) || defaultRestTime;
      setRestTimer(restTime);
      setWorkoutState('resting');
    }

    // Check if workout is complete
    const allExercisesComplete = workout.exercises.every((_, index) => {
      const exerciseSets = newCompletedSets[index.toString()] || [];
      return exerciseSets.every(Boolean);
    });

    if (allExercisesComplete) {
      completeWorkout();
    }
  };

  const skipRest = () => {
    setRestTimer(0);
    setWorkoutState('active');
  };

  const nextExercise = () => {
    if (currentExerciseIndex < workout.exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
    }
  };

  const previousExercise = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(currentExerciseIndex - 1);
    }
  };

  const completeWorkout = () => {
    setWorkoutState('completed');
    
    const stats: WorkoutStats = {
      workoutId: workout.id,
      workoutName: workout.name,
      duration: elapsedTime,
      exercisesCompleted: workout.exercises.length,
      totalExercises: workout.exercises.length,
      setsCompleted: getCompletedSetsCount(),
      totalSets: getTotalSets(),
      completedAt: new Date(),
      targetedMuscles: workout.targetedMuscles || [],
    };

    // Completion animation
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

  const endWorkoutEarly = () => {
    Alert.alert(
      'End Workout',
      'Are you sure you want to end this workout early?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End Workout',
          style: 'destructive',
          onPress: () => {
            const stats: WorkoutStats = {
              workoutId: workout.id,
              workoutName: workout.name,
              duration: elapsedTime,
              exercisesCompleted: parseInt(getExerciseProgress().split('/')[0]),
              totalExercises: workout.exercises.length,
              setsCompleted: getCompletedSetsCount(),
              totalSets: getTotalSets(),
              completedAt: new Date(),
              targetedMuscles: workout.targetedMuscles || [],
            };
            onComplete(stats);
          },
        },
      ]
    );
  };

  const updateExerciseWeight = (exerciseIndex: number, weight: string) => {
    const newWeights = { ...exerciseWeights };
    newWeights[exerciseIndex.toString()] = weight;
    setExerciseWeights(newWeights);
  };

  const currentExercise = workout.exercises[currentExerciseIndex];
  const currentSets = completedSets[currentExerciseIndex.toString()] || [];

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <BlurView intensity={80} tint="dark" style={styles.blurContainer}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X size={24} color={AppColors.textPrimary} />
            </TouchableOpacity>
            
            <View style={styles.headerCenter}>
              <Text style={styles.workoutTitle}>{workout.name}</Text>
              <Text style={styles.workoutTime}>{formatTime(elapsedTime)}</Text>
            </View>
            
            <TouchableOpacity 
              style={styles.settingsButton} 
              onPress={() => setShowSettings(true)}
            >
              <Settings size={24} color={AppColors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressSection}>
            <View style={styles.progressInfo}>
              <Text style={styles.progressText}>
                Exercise {getExerciseProgress()} • {Math.round(getOverallProgress())}% Complete
              </Text>
            </View>
            <View style={styles.progressBarContainer}>
              <Animated.View 
                style={[
                  styles.progressBar,
                  {
                    width: progressAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%'],
                    }),
                  },
                ]}
              />
            </View>
          </View>

          {/* Rest Timer */}
          {workoutState === 'resting' && (
            <LiquidGlassCard style={styles.restCard}>
              <Text style={styles.restTitle}>Rest Time</Text>
              <Animated.Text style={[styles.restTimer, { transform: [{ scale: pulseAnim }] }]}>
                {formatTime(restTimer)}
              </Animated.Text>
              <Text style={styles.restSubtitle}>Get ready for your next set</Text>
              <GlassButton
                title="Skip Rest"
                onPress={skipRest}
                variant="secondary"
                size="small"
                style={styles.skipButton}
                icon={<SkipForward size={16} color={AppColors.textPrimary} />}
              />
            </LiquidGlassCard>
          )}

          {/* Current Exercise */}
          <View style={styles.exerciseSection}>
            <LiquidGlassCard style={styles.exerciseCard}>
              {/* Exercise Navigation */}
              <View style={styles.exerciseNavigation}>
                <TouchableOpacity
                  style={[styles.navButton, currentExerciseIndex === 0 && styles.navButtonDisabled]}
                  onPress={previousExercise}
                  disabled={currentExerciseIndex === 0}
                >
                  <ChevronLeft size={20} color={currentExerciseIndex === 0 ? AppColors.textTertiary : AppColors.textPrimary} />
                </TouchableOpacity>
                
                <View style={styles.exerciseInfo}>
                  <Text style={styles.exerciseNumber}>
                    Exercise {currentExerciseIndex + 1} of {workout.exercises.length}
                  </Text>
                  <Text style={styles.exerciseName}>{currentExercise?.name}</Text>
                  <View style={styles.exerciseMeta}>
                    <Text style={styles.exerciseDetail}>{currentExercise?.sets} sets</Text>
                    <Text style={styles.exerciseDetail}>{currentExercise?.reps} reps</Text>
                    <TouchableOpacity
                      style={styles.weightContainer}
                      onPress={() => setShowSettings(true)}
                    >
                      <Text style={styles.exerciseWeight}>
                        {exerciseWeights[currentExerciseIndex.toString()] || currentExercise?.weight} {weightUnit}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
                
                <TouchableOpacity
                  style={[styles.navButton, currentExerciseIndex === workout.exercises.length - 1 && styles.navButtonDisabled]}
                  onPress={nextExercise}
                  disabled={currentExerciseIndex === workout.exercises.length - 1}
                >
                  <ChevronRight size={20} color={currentExerciseIndex === workout.exercises.length - 1 ? AppColors.textTertiary : AppColors.textPrimary} />
                </TouchableOpacity>
              </View>

              {/* Exercise Notes */}
              {currentExercise?.notes && (
                <TouchableOpacity
                  style={styles.notesButton}
                  onPress={() => setShowExerciseNotes(true)}
                >
                  <Text style={styles.notesText}>💡 Tap for form tips</Text>
                </TouchableOpacity>
              )}

              {/* Sets */}
              <View style={styles.setsContainer}>
                <Text style={styles.setsTitle}>Sets</Text>
                <View style={styles.setsGrid}>
                  {Array.from({ length: parseInt(currentExercise?.sets || '3') }).map((_, setIndex) => {
                    const isCompleted = currentSets[setIndex] || false;
                    return (
                      <TouchableOpacity
                        key={setIndex}
                        style={[
                          styles.setButton,
                          isCompleted && styles.setButtonCompleted,
                        ]}
                        onPress={() => completeSet(currentExerciseIndex, setIndex)}
                        disabled={workoutState !== 'active'}
                      >
                        {isCompleted ? (
                          <Check size={20} color={AppColors.textPrimary} />
                        ) : (
                          <Text style={styles.setNumber}>{setIndex + 1}</Text>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </LiquidGlassCard>
          </View>

          {/* Muscle Group Visualization */}
          {workout.targetedMuscles && workout.targetedMuscles.length > 0 && (
            <View style={styles.muscleSection}>
              <LiquidGlassCard style={styles.muscleCard}>
                <MuscleGroupVisualization 
                  targetedMuscles={workout.targetedMuscles} 
                  style={styles.muscleVisualization}
                />
              </LiquidGlassCard>
            </View>
          )}

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
                  title="End Early"
                  onPress={endWorkoutEarly}
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
                  onPress={endWorkoutEarly}
                  variant="tertiary"
                  size="large"
                  style={styles.halfButton}
                  icon={<Square size={20} color={AppColors.accent} />}
                />
              </>
            )}

            {workoutState === 'completed' && (
              <View style={styles.completionContainer}>
                <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                  <Award size={48} color={AppColors.success} />
                </Animated.View>
                <Text style={styles.completionTitle}>Workout Complete!</Text>
                <Text style={styles.completionStats}>
                  {formatTime(elapsedTime)} • {getCompletedSetsCount()} sets completed
                </Text>
              </View>
            )}
          </View>

          {/* Settings Modal */}
          <Modal
            visible={showSettings}
            transparent
            animationType="slide"
            onRequestClose={() => setShowSettings(false)}
          >
            <BlurView intensity={40} tint="dark" style={styles.modalOverlay}>
              <View style={styles.modalContainer}>
                <LiquidGlassCard style={styles.modal}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Workout Settings</Text>
                    <TouchableOpacity onPress={() => setShowSettings(false)}>
                      <X size={24} color={AppColors.textSecondary} />
                    </TouchableOpacity>
                  </View>

                  <ScrollView style={styles.settingsContent}>
                    {/* Weight Unit Toggle */}
                    <View style={styles.settingSection}>
                      <Text style={styles.settingTitle}>Weight Unit</Text>
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
                            kg
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
                            lbs
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Sound Settings */}
                    <View style={styles.settingSection}>
                      <View style={styles.settingRow}>
                        <View style={styles.settingInfo}>
                          <Text style={styles.settingTitle}>Sound Alerts</Text>
                          <Text style={styles.settingDescription}>Rest timer and completion sounds</Text>
                        </View>
                        <TouchableOpacity
                          style={styles.toggleButton}
                          onPress={() => setSoundEnabled(!soundEnabled)}
                        >
                          {soundEnabled ? (
                            <Volume2 size={20} color={AppColors.primary} />
                          ) : (
                            <VolumeX size={20} color={AppColors.textTertiary} />
                          )}
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Auto Advance */}
                    <View style={styles.settingSection}>
                      <View style={styles.settingRow}>
                        <View style={styles.settingInfo}>
                          <Text style={styles.settingTitle}>Auto Advance</Text>
                          <Text style={styles.settingDescription}>Automatically move to next exercise</Text>
                        </View>
                        <TouchableOpacity
                          style={[
                            styles.switch,
                            autoAdvance && styles.switchActive,
                          ]}
                          onPress={() => setAutoAdvance(!autoAdvance)}
                        >
                          <View style={[
                            styles.switchThumb,
                            autoAdvance && styles.switchThumbActive,
                          ]} />
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Default Rest Time */}
                    <View style={styles.settingSection}>
                      <Text style={styles.settingTitle}>Default Rest Time</Text>
                      <View style={styles.restTimeContainer}>
                        <TouchableOpacity
                          style={styles.restTimeButton}
                          onPress={() => setDefaultRestTime(Math.max(30, defaultRestTime - 15))}
                        >
                          <Text style={styles.restTimeButtonText}>-</Text>
                        </TouchableOpacity>
                        <Text style={styles.restTimeValue}>{defaultRestTime}s</Text>
                        <TouchableOpacity
                          style={styles.restTimeButton}
                          onPress={() => setDefaultRestTime(Math.min(300, defaultRestTime + 15))}
                        >
                          <Text style={styles.restTimeButtonText}>+</Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Exercise Weights */}
                    <View style={styles.settingSection}>
                      <Text style={styles.settingTitle}>Exercise Weights</Text>
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
                    </View>
                  </ScrollView>

                  <GlassButton
                    title="Done"
                    onPress={() => setShowSettings(false)}
                    variant="primary"
                    size="large"
                    style={styles.modalButton}
                  />
                </LiquidGlassCard>
              </View>
            </BlurView>
          </Modal>

          {/* Exercise Notes Modal */}
          <Modal
            visible={showExerciseNotes}
            transparent
            animationType="fade"
            onRequestClose={() => setShowExerciseNotes(false)}
          >
            <BlurView intensity={40} tint="dark" style={styles.modalOverlay}>
              <View style={styles.notesModalContainer}>
                <LiquidGlassCard style={styles.notesModal}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Form Tips</Text>
                    <TouchableOpacity onPress={() => setShowExerciseNotes(false)}>
                      <X size={24} color={AppColors.textSecondary} />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.exerciseNotesText}>
                    {currentExercise?.notes || 'No specific form tips available for this exercise.'}
                  </Text>
                  <GlassButton
                    title="Got it"
                    onPress={() => setShowExerciseNotes(false)}
                    variant="primary"
                    size="medium"
                    style={styles.notesButton}
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
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
  },
  blurContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  workoutTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: AppColors.textPrimary,
    textAlign: 'center',
  },
  workoutTime: {
    fontSize: 16,
    color: AppColors.primary,
    fontWeight: '600',
    marginTop: 4,
  },
  settingsButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  progressSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  progressInfo: {
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    color: AppColors.textSecondary,
    textAlign: 'center',
    fontWeight: '600',
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: AppColors.primary,
    borderRadius: 3,
  },
  restCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: AppColors.accent,
  },
  restTitle: {
    fontSize: 18,
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
  skipButton: {
    paddingHorizontal: 24,
  },
  exerciseSection: {
    flex: 1,
    paddingHorizontal: 20,
  },
  exerciseCard: {
    minHeight: 200,
  },
  exerciseNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
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
    fontSize: 14,
    color: AppColors.textSecondary,
    fontWeight: '600',
    marginBottom: 4,
  },
  exerciseName: {
    fontSize: 24,
    fontWeight: '700',
    color: AppColors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  exerciseMeta: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },
  exerciseDetail: {
    fontSize: 14,
    color: AppColors.textSecondary,
    fontWeight: '500',
  },
  weightContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: AppColors.primary,
    borderRadius: 12,
  },
  exerciseWeight: {
    fontSize: 14,
    color: AppColors.textPrimary,
    fontWeight: '600',
  },
  notesButton: {
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    marginBottom: 20,
  },
  notesText: {
    fontSize: 12,
    color: AppColors.textSecondary,
    fontWeight: '500',
  },
  setsContainer: {
    alignItems: 'center',
  },
  setsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.textPrimary,
    marginBottom: 16,
  },
  setsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  setButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
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
    fontSize: 18,
    fontWeight: '600',
    color: AppColors.textSecondary,
  },
  muscleSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  muscleCard: {
    paddingVertical: 10,
  },
  muscleVisualization: {
    transform: [{ scale: 0.8 }],
  },
  controlsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 12,
  },
  controlButton: {
    flex: 1,
  },
  halfButton: {
    flex: 1,
  },
  completionContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
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
    maxHeight: height * 0.8,
  },
  modal: {
    padding: 0,
    maxHeight: height * 0.8,
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
  settingsContent: {
    maxHeight: height * 0.5,
    paddingHorizontal: 24,
  },
  settingSection: {
    marginBottom: 24,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.textPrimary,
    marginBottom: 12,
  },
  settingDescription: {
    fontSize: 14,
    color: AppColors.textSecondary,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingInfo: {
    flex: 1,
  },
  toggleButton: {
    padding: 8,
  },
  switch: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: AppColors.backgroundSecondary,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  switchActive: {
    backgroundColor: AppColors.primary,
  },
  switchThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: AppColors.textPrimary,
  },
  switchThumbActive: {
    alignSelf: 'flex-end',
  },
  unitToggle: {
    flexDirection: 'row',
    backgroundColor: AppColors.backgroundSecondary,
    borderRadius: 12,
    padding: 4,
  },
  unitButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  unitButtonActive: {
    backgroundColor: AppColors.primary,
  },
  unitButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.textSecondary,
  },
  unitButtonTextActive: {
    color: AppColors.textPrimary,
  },
  restTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  restTimeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: AppColors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  restTimeButtonText: {
    fontSize: 20,
    fontWeight: '600',
    color: AppColors.textPrimary,
  },
  restTimeValue: {
    fontSize: 18,
    fontWeight: '600',
    color: AppColors.textPrimary,
    minWidth: 60,
    textAlign: 'center',
  },
  weightRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border,
  },
  weightExerciseName: {
    fontSize: 14,
    color: AppColors.textPrimary,
    flex: 1,
  },
  weightInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.backgroundSecondary,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 8,
  },
  weightInput: {
    fontSize: 14,
    color: AppColors.textPrimary,
    minWidth: 40,
    textAlign: 'center',
  },
  weightInputUnit: {
    fontSize: 12,
    color: AppColors.textSecondary,
  },
  modalButton: {
    marginHorizontal: 24,
    marginBottom: 24,
  },
  notesModalContainer: {
    width: '85%',
    maxWidth: 350,
  },
  notesModal: {
    padding: 0,
  },
  exerciseNotesText: {
    fontSize: 16,
    color: AppColors.textPrimary,
    lineHeight: 24,
    paddingHorizontal: 24,
    marginBottom: 24,
  },
});