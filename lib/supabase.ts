import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// For Expo web, we need to access environment variables differently
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 
  (typeof window !== 'undefined' && (window as any).__EXPO_ENV__?.EXPO_PUBLIC_SUPABASE_URL);

const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 
  (typeof window !== 'undefined' && (window as any).__EXPO_ENV__?.EXPO_PUBLIC_SUPABASE_ANON_KEY);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL:', supabaseUrl);
  console.error('Supabase Anon Key:', supabaseAnonKey ? '[PRESENT]' : '[MISSING]');
  throw new Error('Missing Supabase environment variables. Please set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface UserProfile {
  id: string;
  name: string;
  age: number;
  height: number;
  weight?: number;
  fitness_experience: 'beginner' | 'intermediate' | 'advanced';
  primary_goal: 'lose_weight' | 'gain_weight' | 'build_muscle' | 'improve_endurance' | 'general_fitness';
  activity_level: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active';
  created_at: string;
  updated_at: string;
}

export interface OnboardingData {
  name: string;
  age: number;
  height: number;
  weight?: number;
  fitness_experience: string;
  primary_goal: string;
  activity_level: string;
}

export interface Exercise {
  id: string;
  name: string;
  sets: string;
  reps: string;
  weight: string;
  restTime: string;
  order: number;
}

export interface Workout {
  id: string;
  name: string;
  description?: string;
  exercises: Exercise[];
  created_at: string;
  updated_at: string;
}

export interface WorkoutData {
  name: string;
  description?: string;
  exercises: Omit<Exercise, 'id'>[];
}

const PROFILE_KEY = 'user_profile';

export const userProfileService = {
  async createProfile(data: OnboardingData): Promise<UserProfile> {
    const now = new Date().toISOString();
    const profile: UserProfile = {
      id: 'local-user',
      name: data.name,
      age: data.age,
      height: data.height,
      weight: data.weight,
      fitness_experience: data.fitness_experience as UserProfile['fitness_experience'],
      primary_goal: data.primary_goal as UserProfile['primary_goal'],
      activity_level: data.activity_level as UserProfile['activity_level'],
      created_at: now,
      updated_at: now,
    };
    await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    return profile;
  },
  async getProfile(): Promise<UserProfile | null> {
    const json = await AsyncStorage.getItem(PROFILE_KEY);
    if (!json) return null;
    return JSON.parse(json);
  },
  async updateProfile(updates: Partial<OnboardingData>): Promise<UserProfile | null> {
    const current = await userProfileService.getProfile();
    if (!current) return null;
    const updated: UserProfile = {
      ...current,
      ...updates,
      fitness_experience: (updates.fitness_experience ?? current.fitness_experience) as UserProfile['fitness_experience'],
      primary_goal: (updates.primary_goal ?? current.primary_goal) as UserProfile['primary_goal'],
      activity_level: (updates.activity_level ?? current.activity_level) as UserProfile['activity_level'],
      updated_at: new Date().toISOString(),
    };
    await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(updated));
    return updated;
  },
  async deleteProfile(): Promise<void> {
    await AsyncStorage.removeItem(PROFILE_KEY);
  },
};

export const workoutService = {
  async createWorkout(data: WorkoutData): Promise<Workout | null> {
    try {
      const { data: workout, error } = await supabase
        .from('workouts')
        .insert([
          {
            name: data.name,
            description: data.description || null,
            exercises: data.exercises,
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Error creating workout:', error);
        return null;
      }

      return workout;
    } catch (error) {
      console.error('Unexpected error creating workout:', error);
      return null;
    }
  },

  async getWorkouts(): Promise<Workout[]> {
    try {
      const { data: workouts, error } = await supabase
        .from('workouts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching workouts:', error);
        return [];
      }

      return workouts || [];
    } catch (error) {
      console.error('Unexpected error fetching workouts:', error);
      return [];
    }
  },

  async updateWorkout(id: string, updates: Partial<WorkoutData>): Promise<Workout | null> {
    try {
      const { data: workout, error } = await supabase
        .from('workouts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating workout:', error);
        return null;
      }

      return workout;
    } catch (error) {
      console.error('Unexpected error updating workout:', error);
      return null;
    }
  },

  async deleteWorkout(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('workouts')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting workout:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Unexpected error deleting workout:', error);
      return false;
    }
  }
};