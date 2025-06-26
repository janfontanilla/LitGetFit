import { createClient } from '@supabase/supabase-js';

// Use environment variables with fallbacks for development
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';

// Only throw error in production if variables are missing
if ((!supabaseUrl || !supabaseAnonKey) && process.env.NODE_ENV === 'production') {
  throw new Error('Missing Supabase environment variables');
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