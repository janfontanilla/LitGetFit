import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image,
  TouchableOpacity 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Play, Flame, Target, TrendingUp, Plus } from 'lucide-react-native';
import { router } from 'expo-router';

import LiquidGlassCard from '@/components/LiquidGlassCard';
import GlassButton from '@/components/GlassButton';
import ProgressRing from '@/components/ProgressRing';
import WorkoutOverlay from '@/components/WorkoutOverlay';
import { AppColors, Gradients } from '@/styles/colors';
import { workoutService, Workout } from '@/lib/supabase';
import { workoutProgressService, WeeklyStats } from '@/lib/workoutProgressService';

interface TodaysWorkout {
  id: string;
  name: string;
  description: string;
  exercises: any[];
  estimatedDuration: number;
  targetedMuscles: string[];
  progress?: number;
}

export default function HomeScreen() {
  const [todaysWorkout, setTodaysWorkout] = useState<TodaysWorkout | null>(null);
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats | null>(null);
  const [showWorkoutOverlay, setShowWorkoutOverlay] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const currentHour = new Date().getHours();
  const getGreeting = () => {
    if (currentHour < 12) return 'Good Morning';
    if (currentHour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Load weekly stats
      const stats = await workoutProgressService.getWeeklyStats();
      setWeeklyStats(stats);

      // Load today's workout or suggest one
      await loadTodaysWorkout();
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTodaysWorkout = async () => {
    try {
      // Check if user already completed a workout today
      const todaysSession = await workoutProgressService.getTodaysWorkout();
      
      if (todaysSession) {
        // User already worked out today, show completion status
        setTodaysWorkout({
          id: 'completed',
          name: todaysSession.workout_name,
          description: 'Completed today',
          exercises: [],
          estimatedDuration: todaysSession.duration,
          targetedMuscles: todaysSession.targeted_muscles,
          progress: 1.0,
        });
        return;
      }

      // Get user's workouts and suggest one
      const workouts = await workoutService.getWorkouts();
      
      if (workouts.length > 0) {
        // Pick a random workout or use smart selection logic
        const suggestedWorkout = workouts[Math.floor(Math.random() * workouts.length)];
        
        setTodaysWorkout({
          id: suggestedWorkout.id,
          name: suggestedWorkout.name,
          description: suggestedWorkout.description || 'Ready to start',
          exercises: suggestedWorkout.exercises,
          estimatedDuration: 45, // Default duration
          targetedMuscles: extractTargetedMuscles(suggestedWorkout.exercises),
          progress: 0,
        });
      } else {
        // No workouts available, suggest creating one
        setTodaysWorkout({
          id: 'create',
          name: 'Create Your First Workout',
          description: 'Get started with a personalized routine',
          exercises: [],
          estimatedDuration: 30,
          targetedMuscles: [],
          progress: 0,
        });
      }
    } catch (error) {
      console.error('Error loading today\'s workout:', error);
    }
  };

  const extractTargetedMuscles = (exercises: any[]): string[] => {
    const muscles: string[] = [];
    
    exercises.forEach(exercise => {
      if (exercise.name) {
        const exerciseName = exercise.name.toLowerCase();
        if (exerciseName.includes('chest') || exerciseName.includes('bench') || exerciseName.includes('push')) {
          muscles.push('chest');
        }
        if (exerciseName.includes('back') || exerciseName.includes('pull') || exerciseName.includes('row')) {
          muscles.push('back');
        }
        if (exerciseName.includes('squat') || exerciseName.includes('leg') || exerciseName.includes('lunge')) {
          muscles.push('legs');
        }
        if (exerciseName.includes('shoulder') || exerciseName.includes('press') && !exerciseName.includes('bench')) {
          muscles.push('shoulders');
        }
        if (exerciseName.includes('bicep') || exerciseName.includes('tricep') || exerciseName.includes('arm')) {
          muscles.push('arms');
        }
        if (exerciseName.includes('abs') || exerciseName.includes('core') || exerciseName.includes('plank')) {
          muscles.push('abs');
        }
      }
    });
    
    return [...new Set(muscles)];
  };

  const handleStartWorkout = () => {
    if (!todaysWorkout) return;

    if (todaysWorkout.id === 'create') {
      // Navigate to workout creation
      router.push('/create-workout');
      return;
    }

    if (todaysWorkout.id === 'completed') {
      // Already completed, maybe show stats or suggest another workout
      return;
    }

    // Start the workout - navigate to workout start screen
    router.push({
      pathname: '/workout/start',
      params: { 
        workoutId: todaysWorkout.id,
        workoutData: JSON.stringify({
          id: todaysWorkout.id,
          name: todaysWorkout.name,
          description: todaysWorkout.description,
          exercises: todaysWorkout.exercises,
          estimatedDuration: todaysWorkout.estimatedDuration,
          targetedMuscles: todaysWorkout.targetedMuscles,
        })
      }
    });
  };

  const handleWorkoutComplete = async (workoutStats: any) => {
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

      // Refresh dashboard data
      await loadDashboardData();
      
      // Close overlay
      setShowWorkoutOverlay(false);
    } catch (error) {
      console.error('Error saving workout session:', error);
      setShowWorkoutOverlay(false);
    }
  };

  const getWorkoutButtonTitle = () => {
    if (!todaysWorkout) return 'Loading...';
    
    if (todaysWorkout.id === 'create') return 'Create Workout';
    if (todaysWorkout.id === 'completed') return 'Workout Complete ✓';
    if (todaysWorkout.progress && todaysWorkout.progress > 0) return 'Continue Workout';
    
    return 'Start Workout';
  };

  const getWorkoutButtonVariant = () => {
    if (!todaysWorkout) return 'secondary';
    if (todaysWorkout.id === 'completed') return 'secondary';
    return 'primary';
  };

  if (isLoading) {
    return (
      <LinearGradient colors={Gradients.background} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading your fitness dashboard...</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={Gradients.background} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerText}>
              <Text style={styles.greeting}>{getGreeting()}</Text>
            </View>
          </View>

          {/* Today's Workout Card */}
          {todaysWorkout && (
            <LiquidGlassCard style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Today's Workout</Text>
                {todaysWorkout.id === 'completed' ? (
                  <Target size={20} color={AppColors.success} />
                ) : (
                  <Play size={20} color={AppColors.primary} />
                )}
              </View>
              
              <View style={styles.workoutInfo}>
                <View style={styles.workoutDetails}>
                  <Text style={styles.workoutName}>{todaysWorkout.name}</Text>
                  <Text style={styles.workoutMeta}>
                    {todaysWorkout.estimatedDuration} min • {todaysWorkout.description}
                  </Text>
                  
                  {todaysWorkout.exercises.length > 0 && (
                    <View style={styles.workoutStats}>
                      <Text style={styles.statText}>
                        {todaysWorkout.exercises.length} exercises
                        {todaysWorkout.targetedMuscles.length > 0 && 
                          ` • ${todaysWorkout.targetedMuscles.join(', ')}`
                        }
                      </Text>
                    </View>
                  )}
                </View>
                
                {todaysWorkout.progress !== undefined && (
                  <View style={styles.progressContainer}>
                    <ProgressRing progress={todaysWorkout.progress} size={60} strokeWidth={6} />
                    <Text style={styles.progressText}>
                      {Math.round(todaysWorkout.progress * 100)}%
                    </Text>
                  </View>
                )}
              </View>
              
              <GlassButton
                title={getWorkoutButtonTitle()}
                onPress={handleStartWorkout}
                variant={getWorkoutButtonVariant()}
                style={styles.workoutButton}
                disabled={todaysWorkout.id === 'completed'}
              />
            </LiquidGlassCard>
          )}

          {/* Weekly Progress Card */}
          {weeklyStats && (
            <LiquidGlassCard style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Weekly Progress</Text>
                <TrendingUp size={20} color={AppColors.success} />
              </View>
              
              <View style={styles.progressStats}>
                <View style={styles.statItem}>
                  <View style={styles.statIcon}>
                    <Flame size={16} color={AppColors.accent} />
                  </View>
                  <Text style={styles.statLabel}>Current Streak</Text>
                  <Text style={styles.statValue}>{weeklyStats.streak} days</Text>
                </View>
                
                <View style={styles.statItem}>
                  <View style={styles.statIcon}>
                    <Target size={16} color={AppColors.primary} />
                  </View>
                  <Text style={styles.statLabel}>This Week</Text>
                  <Text style={styles.statValue}>{weeklyStats.totalWorkouts}/5 workouts</Text>
                </View>
              </View>
              
              {/* Weekly Chart */}
              <View style={styles.chartContainer}>
                <View style={styles.chartBars}>
                  {Object.entries(weeklyStats.workoutsByDay).map(([day, count]) => (
                    <View key={day} style={styles.chartBarContainer}>
                      <View 
                        style={[
                          styles.chartBar,
                          { height: Math.max(4, count * 20) }
                        ]}
                      />
                      <Text style={styles.chartLabel}>{day.charAt(0)}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </LiquidGlassCard>
          )}

          {/* Daily Nutrition Card */}
          <LiquidGlassCard style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Daily Nutrition</Text>
              <Text style={styles.calorieCount}>1,850 / 2,200 cal</Text>
            </View>
            
            <View style={styles.nutritionProgress}>
              <View style={styles.nutritionBar}>
                <View style={[styles.nutritionFill, { width: '84%' }]} />
              </View>
            </View>
            
            <View style={styles.macroStats}>
              <View style={styles.macroItem}>
                <View style={[styles.macroIndicator, { backgroundColor: AppColors.primary }]} />
                <Text style={styles.macroLabel}>Protein</Text>
                <Text style={styles.macroValue}>120g</Text>
              </View>
              <View style={styles.macroItem}>
                <View style={[styles.macroIndicator, { backgroundColor: AppColors.success }]} />
                <Text style={styles.macroLabel}>Carbs</Text>
                <Text style={styles.macroValue}>180g</Text>
              </View>
              <View style={styles.macroItem}>
                <View style={[styles.macroIndicator, { backgroundColor: AppColors.warning }]} />
                <Text style={styles.macroLabel}>Fats</Text>
                <Text style={styles.macroValue}>65g</Text>
              </View>
            </View>
            
            <GlassButton
              title="Log Meal"
              onPress={() => router.push('/(tabs)/nutrition')}
              variant="secondary"
              size="small"
              style={styles.logButton}
            />
          </LiquidGlassCard>

          {/* Quick Actions */}
          <LiquidGlassCard style={styles.card}>
            <Text style={styles.cardTitle}>Quick Actions</Text>
            
            <View style={styles.quickActions}>
              <TouchableOpacity 
                style={styles.quickAction}
                onPress={() => router.push('/create-workout')}
              >
                <View style={styles.quickActionIcon}>
                  <Plus size={20} color={AppColors.primary} />
                </View>
                <Text style={styles.quickActionText}>Create Workout</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.quickAction}
                onPress={() => router.push('/(tabs)/profile')}
              >
                <View style={styles.quickActionIcon}>
                  <Target size={20} color={AppColors.success} />
                </View>
                <Text style={styles.quickActionText}>Set Goals</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.quickAction}
                onPress={() => router.push('/(tabs)/routines')}
              >
                <View style={styles.quickActionIcon}>
                  <TrendingUp size={20} color={AppColors.warning} />
                </View>
                <Text style={styles.quickActionText}>View Progress</Text>
              </TouchableOpacity>
            </View>
          </LiquidGlassCard>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: AppColors.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 130,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  headerText: {
    flex: 1,
  },
  greeting: {
    fontSize: 28,
    color: AppColors.textPrimary,
    fontWeight: '700',
  },
  profileImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  card: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: AppColors.textPrimary,
  },
  workoutInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  workoutDetails: {
    flex: 1,
  },
  workoutName: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.textPrimary,
    marginBottom: 4,
  },
  workoutMeta: {
    fontSize: 14,
    color: AppColors.textSecondary,
    marginBottom: 8,
  },
  workoutStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 12,
    color: AppColors.textTertiary,
  },
  progressContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  progressText: {
    position: 'absolute',
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.textPrimary,
  },
  workoutButton: {
    width: '100%',
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 12,
    color: AppColors.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.textPrimary,
  },
  chartContainer: {
    marginTop: 8,
  },
  chartBars: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 60,
    marginBottom: 8,
  },
  chartBarContainer: {
    alignItems: 'center',
    flex: 1,
  },
  chartBar: {
    width: 20,
    backgroundColor: AppColors.primary,
    borderRadius: 4,
    opacity: 0.8,
    marginBottom: 8,
  },
  chartLabel: {
    fontSize: 12,
    color: AppColors.textTertiary,
    textAlign: 'center',
  },
  calorieCount: {
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.primary,
  },
  nutritionProgress: {
    marginBottom: 16,
  },
  nutritionBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  nutritionFill: {
    height: '100%',
    backgroundColor: AppColors.success,
    borderRadius: 4,
  },
  macroStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  macroItem: {
    alignItems: 'flex-start',
  },
  macroIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: 4,
  },
  macroLabel: {
    fontSize: 12,
    color: AppColors.textSecondary,
    marginBottom: 2,
  },
  macroValue: {
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.textPrimary,
  },
  logButton: {
    alignSelf: 'flex-start',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  quickAction: {
    alignItems: 'center',
    flex: 1,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    color: AppColors.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
  },
});