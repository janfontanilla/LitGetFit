import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
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