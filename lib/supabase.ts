import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
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

// Database helper functions
export const userProfileService = {
  async createProfile(data: OnboardingData): Promise<UserProfile | null> {
    try {
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .insert([
          {
            name: data.name,
            age: data.age,
            height: data.height,
            weight: data.weight || null,
            fitness_experience: data.fitness_experience,
            primary_goal: data.primary_goal,
            activity_level: data.activity_level,
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Error creating user profile:', error);
        return null;
      }

      return profile;
    } catch (error) {
      console.error('Unexpected error creating profile:', error);
      return null;
    }
  },

  async getProfile(id: string): Promise<UserProfile | null> {
    try {
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      return profile;
    } catch (error) {
      console.error('Unexpected error fetching profile:', error);
      return null;
    }
  },

  async updateProfile(id: string, updates: Partial<OnboardingData>): Promise<UserProfile | null> {
    try {
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating user profile:', error);
        return null;
      }

      return profile;
    } catch (error) {
      console.error('Unexpected error updating profile:', error);
      return null;
    }
  },

  async getAllProfiles(): Promise<UserProfile[]> {
    try {
      const { data: profiles, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user profiles:', error);
        return [];
      }

      return profiles || [];
    } catch (error) {
      console.error('Unexpected error fetching profiles:', error);
      return [];
    }
  },

  async deleteProfile(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting user profile:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Unexpected error deleting profile:', error);
      return false;
    }
  }
};