import { supabase } from './supabase';

export interface WorkoutSession {
  id: string;
  user_profile_id?: string;
  workout_id?: string;
  workout_name: string;
  duration: number;
  exercises_completed: number;
  total_exercises: number;
  sets_completed: number;
  total_sets: number;
  targeted_muscles: string[];
  completed_at: string;
  created_at: string;
}

export interface WorkoutSessionData {
  workout_id?: string;
  workout_name: string;
  duration: number;
  exercises_completed: number;
  total_exercises: number;
  sets_completed: number;
  total_sets: number;
  targeted_muscles: string[];
  completed_at?: string;
}

export interface WeeklyStats {
  totalWorkouts: number;
  totalDuration: number;
  averageDuration: number;
  completionRate: number;
  streak: number;
  workoutsByDay: { [key: string]: number };
}

export const workoutProgressService = {
  async createWorkoutSession(data: WorkoutSessionData): Promise<WorkoutSession | null> {
    try {
      const { data: session, error } = await supabase
        .from('workout_sessions')
        .insert([{
          workout_id: data.workout_id || null,
          workout_name: data.workout_name,
          duration: data.duration,
          exercises_completed: data.exercises_completed,
          total_exercises: data.total_exercises,
          sets_completed: data.sets_completed,
          total_sets: data.total_sets,
          targeted_muscles: data.targeted_muscles,
          completed_at: data.completed_at || new Date().toISOString(),
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating workout session:', error);
        return null;
      }

      return session;
    } catch (error) {
      console.error('Unexpected error creating workout session:', error);
      return null;
    }
  },

  async getWorkoutSessions(limit: number = 50): Promise<WorkoutSession[]> {
    try {
      const { data: sessions, error } = await supabase
        .from('workout_sessions')
        .select('*')
        .order('completed_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching workout sessions:', error);
        return [];
      }

      return sessions || [];
    } catch (error) {
      console.error('Unexpected error fetching workout sessions:', error);
      return [];
    }
  },

  async getWeeklyStats(): Promise<WeeklyStats> {
    try {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const { data: sessions, error } = await supabase
        .from('workout_sessions')
        .select('*')
        .gte('completed_at', oneWeekAgo.toISOString())
        .order('completed_at', { ascending: false });

      if (error) {
        console.error('Error fetching weekly stats:', error);
        return this.getEmptyWeeklyStats();
      }

      const workouts = sessions || [];
      
      // Calculate stats
      const totalWorkouts = workouts.length;
      const totalDuration = workouts.reduce((sum, w) => sum + w.duration, 0);
      const averageDuration = totalWorkouts > 0 ? Math.round(totalDuration / totalWorkouts) : 0;
      
      // Calculate completion rate
      const completionRate = totalWorkouts > 0 
        ? workouts.reduce((sum, w) => sum + (w.exercises_completed / w.total_exercises), 0) / totalWorkouts 
        : 0;

      // Calculate streak
      const streak = await this.calculateStreak();

      // Workouts by day
      const workoutsByDay: { [key: string]: number } = {
        'Mon': 0, 'Tue': 0, 'Wed': 0, 'Thu': 0, 'Fri': 0, 'Sat': 0, 'Sun': 0
      };

      workouts.forEach(workout => {
        const date = new Date(workout.completed_at);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        if (workoutsByDay[dayName] !== undefined) {
          workoutsByDay[dayName]++;
        }
      });

      return {
        totalWorkouts,
        totalDuration,
        averageDuration,
        completionRate,
        streak,
        workoutsByDay,
      };
    } catch (error) {
      console.error('Unexpected error calculating weekly stats:', error);
      return this.getEmptyWeeklyStats();
    }
  },

  async calculateStreak(): Promise<number> {
    try {
      const { data: sessions, error } = await supabase
        .from('workout_sessions')
        .select('completed_at')
        .order('completed_at', { ascending: false })
        .limit(30); // Check last 30 workouts for streak

      if (error || !sessions || sessions.length === 0) {
        return 0;
      }

      let streak = 0;
      let currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);

      // Group workouts by date
      const workoutDates = new Set(
        sessions.map(session => {
          const date = new Date(session.completed_at);
          date.setHours(0, 0, 0, 0);
          return date.getTime();
        })
      );

      // Check consecutive days
      while (workoutDates.has(currentDate.getTime())) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      }

      return streak;
    } catch (error) {
      console.error('Error calculating streak:', error);
      return 0;
    }
  },

  async getTodaysWorkout(): Promise<WorkoutSession | null> {
    try {
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

      const { data: sessions, error } = await supabase
        .from('workout_sessions')
        .select('*')
        .gte('completed_at', startOfDay.toISOString())
        .lt('completed_at', endOfDay.toISOString())
        .order('completed_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Error fetching today\'s workout:', error);
        return null;
      }

      return sessions && sessions.length > 0 ? sessions[0] : null;
    } catch (error) {
      console.error('Unexpected error fetching today\'s workout:', error);
      return null;
    }
  },

  getEmptyWeeklyStats(): WeeklyStats {
    return {
      totalWorkouts: 0,
      totalDuration: 0,
      averageDuration: 0,
      completionRate: 0,
      streak: 0,
      workoutsByDay: {
        'Mon': 0, 'Tue': 0, 'Wed': 0, 'Thu': 0, 'Fri': 0, 'Sat': 0, 'Sun': 0
      },
    };
  },
};