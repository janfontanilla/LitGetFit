import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Play, Flame, Target, TrendingUp, Plus, Dumbbell } from 'lucide-react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';

import LiquidGlassCard from '@/components/LiquidGlassCard';
import GlassButton from '@/components/GlassButton';
import ProgressRing from '@/components/ProgressRing';
import WorkoutOverlay from '@/components/WorkoutOverlay';
import { AppColors, Gradients } from '@/styles/colors';
import { workoutService, Workout } from '@/lib/supabase';
import { workoutProgressService, WeeklyStats } from '@/lib/workoutProgressService';
import { foodLogService } from '@/lib/foodLogService';
import { useOnboardingStore } from '@/store/onboardingStore';

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
  const [todaysCalories, setTodaysCalories] = useState(0);
  const [showWorkoutOverlay, setShowWorkoutOverlay] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState('Champion'); // Placeholder
  const { hasCompletedOnboarding, _hasHydrated } = useOnboardingStore();
  const router = useRouter();

  const currentHour = new Date().getHours();
  const getGreeting = () => {
    if (currentHour < 12) return 'Good Morning';
    if (currentHour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash.includes('access_token')) {
      supabase.auth.exchangeCodeForSession(window.location.hash).then(({ data, error }) => {
        if (data?.session) {
          if (hasCompletedOnboarding) {
            router.replace('/(tabs)');
          } else {
            router.replace('/onboarding');
          }
        }
      });
    }
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Load weekly stats
      const stats = await workoutProgressService.getWeeklyStats();
      setWeeklyStats(stats);

      const foodLogs = await foodLogService.getTodaysFoodLogs();
      const totalCalories = foodLogs.reduce((sum, log) => sum + (log.calories || 0), 0);
      setTodaysCalories(totalCalories);

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
          description: suggestedWorkout.description || 'Ready for a new challenge',
          exercises: suggestedWorkout.exercises,
          estimatedDuration: 45, // Default duration
          targetedMuscles: ['Chest', 'Triceps'], // Placeholder
          progress: 0,
        });
      } else {
        // No workouts available, suggest creating one
        setTodaysWorkout({
          id: 'create',
          name: 'Create Your First Routine',
          description: 'A personalized workout is just a few taps away.',
          exercises: [],
          estimatedDuration: 0,
          targetedMuscles: [],
          progress: 0,
        });
      }
    } catch (error) {
      console.error('Error loading today\'s workout:', error);
    }
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
        workoutData: JSON.stringify(todaysWorkout)
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
      <LinearGradient colors={Gradients.background} style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={AppColors.primary} />
        <Text style={styles.loadingText}>Loading Your Dashboard...</Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={Gradients.background} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.greeting}>Hello, {userName}</Text>
            <Text style={styles.motivation}>Ready to crush your goals today?</Text>
          </View>

          {/* Today's Workout Card */}
          <LinearGradient
            colors={Gradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.mainCard}
          >
            <View style={styles.mainCardContent}>
              <View style={styles.mainCardHeader}>
                <Dumbbell size={24} color="#FFF" />
                <Text style={styles.mainCardTitle}>Today's Focus</Text>
              </View>
              <Text style={styles.workoutName}>{todaysWorkout?.name}</Text>
              <Text style={styles.workoutDescription}>{todaysWorkout?.description}</Text>
              
              <View style={styles.workoutMeta}>
                <View style={styles.metaItem}>
                  <Flame size={16} color="#FFF" style={styles.metaIcon} />
                  <Text style={styles.metaText}>{todaysWorkout?.estimatedDuration} min</Text>
                </View>
                <View style={styles.metaItem}>
                  <Target size={16} color="#FFF" style={styles.metaIcon} />
                  <Text style={styles.metaText}>{todaysWorkout?.targetedMuscles.join(', ')}</Text>
                </View>
              </View>

              <TouchableOpacity style={styles.startButton} onPress={handleStartWorkout} activeOpacity={0.8}>
                <Play size={22} color={AppColors.primary} style={styles.playIcon} />
                <Text style={styles.startButtonText}>
                  {todaysWorkout?.id === 'create' ? 'Create Workout' : 'Start Workout'}
                </Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>

          {/* Weekly Stats */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Week at a Glance</Text>
            <View style={styles.statsGrid}>
              <LiquidGlassCard style={styles.statCard}>
                <TrendingUp size={24} color={AppColors.primary} />
                <Text style={styles.statValue}>{weeklyStats?.totalWorkouts || 0}</Text>
                <Text style={styles.statLabel}>Workouts</Text>
              </LiquidGlassCard>
              <LiquidGlassCard style={styles.statCard}>
                <Flame size={24} color={AppColors.primary} />
                <Text style={styles.statValue}>{todaysCalories}</Text>
                <Text style={styles.statLabel}>Calories</Text>
              </LiquidGlassCard>
              <LiquidGlassCard style={styles.statCard}>
                <Dumbbell size={24} color={AppColors.primary} />
                <Text style={styles.statValue}>{(weeklyStats?.totalWorkouts || 0) * 12}</Text>
                <Text style={styles.statLabel}>Sets</Text>
              </LiquidGlassCard>
            </View>
          </View>
          
          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <GlassButton 
              title="Create New Workout" 
              onPress={() => router.push('/create-workout')} 
              icon={<Plus size={18} color={AppColors.textPrimary} />}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 120 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, color: AppColors.textSecondary, fontSize: 16 },
  
  header: { marginBottom: 24 },
  greeting: { fontSize: 28, fontWeight: 'bold', color: AppColors.textPrimary },
  motivation: { fontSize: 16, color: AppColors.textSecondary, marginTop: 4 },

  mainCard: { borderRadius: 24, padding: 24, marginBottom: 32 },
  mainCardContent: {},
  mainCardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, opacity: 0.8 },
  mainCardTitle: { color: '#FFF', fontSize: 16, fontWeight: '600', marginLeft: 8 },
  workoutName: { color: '#FFF', fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  workoutDescription: { color: '#FFF', opacity: 0.8, marginBottom: 20, lineHeight: 20 },
  
  workoutMeta: { flexDirection: 'row', gap: 20, marginBottom: 24 },
  metaItem: { flexDirection: 'row', alignItems: 'center' },
  metaIcon: { marginRight: 6, opacity: 0.8 },
  metaText: { color: '#FFF', fontSize: 14, fontWeight: '500' },
  
  startButton: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  playIcon: { marginRight: 8 },
  startButtonText: { color: AppColors.primary, fontSize: 16, fontWeight: 'bold' },
  
  section: { marginBottom: 32 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: AppColors.textPrimary, marginBottom: 16 },
  
  statsGrid: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  statCard: { flex: 1, padding: 16, alignItems: 'center', gap: 8 },
  statValue: { fontSize: 22, fontWeight: 'bold', color: AppColors.textPrimary },
  statLabel: { fontSize: 12, color: AppColors.textSecondary, fontWeight: '600' },
});