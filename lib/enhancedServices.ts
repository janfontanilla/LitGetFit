import { supabase } from './supabase';

// Enhanced Exercise Library Service
export interface ExerciseLibraryItem {
  id: string;
  name: string;
  category: 'strength' | 'cardio' | 'flexibility' | 'balance' | 'plyometric' | 'core';
  muscle_groups: string[];
  equipment_needed: string[];
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  instructions?: string;
  form_tips?: string;
  video_url?: string;
  created_at: string;
}

export const exerciseLibraryService = {
  async getExercises(filters?: {
    category?: string;
    muscle_groups?: string[];
    difficulty?: string;
    equipment?: string[];
  }): Promise<ExerciseLibraryItem[]> {
    try {
      let query = supabase.from('exercise_library').select('*');

      if (filters?.category) {
        query = query.eq('category', filters.category);
      }
      if (filters?.difficulty) {
        query = query.eq('difficulty_level', filters.difficulty);
      }
      if (filters?.muscle_groups && filters.muscle_groups.length > 0) {
        query = query.overlaps('muscle_groups', filters.muscle_groups);
      }
      if (filters?.equipment && filters.equipment.length > 0) {
        query = query.overlaps('equipment_needed', filters.equipment);
      }

      const { data, error } = await query.order('name');

      if (error) {
        console.error('Error fetching exercises:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Unexpected error fetching exercises:', error);
      return [];
    }
  },

  async searchExercises(searchTerm: string): Promise<ExerciseLibraryItem[]> {
    try {
      const { data, error } = await supabase
        .from('exercise_library')
        .select('*')
        .ilike('name', `%${searchTerm}%`)
        .order('name')
        .limit(20);

      if (error) {
        console.error('Error searching exercises:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Unexpected error searching exercises:', error);
      return [];
    }
  }
};

// Enhanced Workout Templates Service
export interface WorkoutTemplate {
  id: string;
  name: string;
  description?: string;
  category: 'strength' | 'cardio' | 'hiit' | 'yoga' | 'pilates' | 'crossfit' | 'bodyweight' | 'powerlifting';
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  estimated_duration: number;
  equipment_needed: string[];
  target_muscle_groups: string[];
  exercises: any[];
  is_featured: boolean;
  created_by: string;
  created_at: string;
}

export const workoutTemplateService = {
  async getTemplates(filters?: {
    category?: string;
    difficulty?: string;
    duration_max?: number;
    equipment?: string[];
    featured_only?: boolean;
  }): Promise<WorkoutTemplate[]> {
    try {
      let query = supabase.from('workout_templates').select('*');

      if (filters?.category) {
        query = query.eq('category', filters.category);
      }
      if (filters?.difficulty) {
        query = query.eq('difficulty_level', filters.difficulty);
      }
      if (filters?.duration_max) {
        query = query.lte('estimated_duration', filters.duration_max);
      }
      if (filters?.featured_only) {
        query = query.eq('is_featured', true);
      }
      if (filters?.equipment && filters.equipment.length > 0) {
        query = query.overlaps('equipment_needed', filters.equipment);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching workout templates:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Unexpected error fetching workout templates:', error);
      return [];
    }
  },

  async getFeaturedTemplates(): Promise<WorkoutTemplate[]> {
    return this.getTemplates({ featured_only: true });
  }
};

// Nutrition Goals Service
export interface NutritionGoals {
  id: string;
  user_profile_id: string;
  daily_calories: number;
  daily_protein: number;
  daily_carbs: number;
  daily_fat: number;
  daily_water_ml?: number;
  created_at: string;
  updated_at: string;
}

export const nutritionGoalsService = {
  async getUserGoals(userProfileId: string): Promise<NutritionGoals | null> {
    try {
      const { data, error } = await supabase
        .from('nutrition_goals')
        .select('*')
        .eq('user_profile_id', userProfileId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching nutrition goals:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Unexpected error fetching nutrition goals:', error);
      return null;
    }
  },

  async setUserGoals(userProfileId: string, goals: Omit<NutritionGoals, 'id' | 'user_profile_id' | 'created_at' | 'updated_at'>): Promise<NutritionGoals | null> {
    try {
      const { data, error } = await supabase
        .from('nutrition_goals')
        .upsert({
          user_profile_id: userProfileId,
          ...goals
        })
        .select()
        .single();

      if (error) {
        console.error('Error setting nutrition goals:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Unexpected error setting nutrition goals:', error);
      return null;
    }
  },

  // Calculate recommended goals based on user profile
  calculateRecommendedGoals(userProfile: any): Omit<NutritionGoals, 'id' | 'user_profile_id' | 'created_at' | 'updated_at'> {
    const { age, height, weight, activity_level, primary_goal } = userProfile;
    
    // Basic BMR calculation (Mifflin-St Jeor Equation)
    let bmr = 10 * (weight || 70) + 6.25 * height - 5 * age + 5; // Male formula as default
    
    // Activity multipliers
    const activityMultipliers = {
      sedentary: 1.2,
      lightly_active: 1.375,
      moderately_active: 1.55,
      very_active: 1.725,
      extremely_active: 1.9
    };
    
    const tdee = bmr * (activityMultipliers[activity_level as keyof typeof activityMultipliers] || 1.55);
    
    // Adjust calories based on goal
    let targetCalories = tdee;
    if (primary_goal === 'lose_weight') {
      targetCalories = tdee - 500; // 500 calorie deficit
    } else if (primary_goal === 'gain_weight') {
      targetCalories = tdee + 500; // 500 calorie surplus
    }
    
    // Macro distribution (moderate approach)
    const proteinCalories = targetCalories * 0.25; // 25% protein
    const carbCalories = targetCalories * 0.45; // 45% carbs
    const fatCalories = targetCalories * 0.30; // 30% fat
    
    return {
      daily_calories: Math.round(targetCalories),
      daily_protein: Math.round(proteinCalories / 4), // 4 calories per gram
      daily_carbs: Math.round(carbCalories / 4), // 4 calories per gram
      daily_fat: Math.round(fatCalories / 9), // 9 calories per gram
      daily_water_ml: 2500 // Default 2.5L
    };
  }
};

// Achievements Service
export interface Achievement {
  id: string;
  user_profile_id: string;
  achievement_type: 'workout_streak' | 'total_workouts' | 'workout_duration' | 'weight_milestone' | 'consistency' | 'first_workout' | 'nutrition_goal';
  achievement_name: string;
  description?: string;
  icon?: string;
  earned_at: string;
  created_at: string;
}

export const achievementsService = {
  async getUserAchievements(userProfileId: string): Promise<Achievement[]> {
    try {
      const { data, error } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_profile_id', userProfileId)
        .order('earned_at', { ascending: false });

      if (error) {
        console.error('Error fetching achievements:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Unexpected error fetching achievements:', error);
      return [];
    }
  },

  async checkAndAwardAchievements(userProfileId: string): Promise<void> {
    try {
      // Call the database function to check and award achievements
      const { error } = await supabase.rpc('check_and_award_achievements', {
        p_user_profile_id: userProfileId
      });

      if (error) {
        console.error('Error checking achievements:', error);
      }
    } catch (error) {
      console.error('Unexpected error checking achievements:', error);
    }
  }
};

// Challenges Service
export interface Challenge {
  id: string;
  name: string;
  description: string;
  challenge_type: 'daily' | 'weekly' | 'monthly';
  target_metric: 'workouts' | 'duration' | 'calories' | 'streak' | 'exercises';
  target_value: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
}

export interface ChallengeProgress {
  id: string;
  user_profile_id: string;
  challenge_id: string;
  current_progress: number;
  is_completed: boolean;
  completed_at?: string;
  joined_at: string;
  challenge?: Challenge;
}

export const challengesService = {
  async getActiveChallenges(): Promise<Challenge[]> {
    try {
      const { data, error } = await supabase
        .from('workout_challenges')
        .select('*')
        .eq('is_active', true)
        .lte('start_date', new Date().toISOString().split('T')[0])
        .gte('end_date', new Date().toISOString().split('T')[0])
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching challenges:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Unexpected error fetching challenges:', error);
      return [];
    }
  },

  async getUserChallengeProgress(userProfileId: string): Promise<ChallengeProgress[]> {
    try {
      const { data, error } = await supabase
        .from('user_challenge_progress')
        .select(`
          *,
          challenge:workout_challenges(*)
        `)
        .eq('user_profile_id', userProfileId)
        .order('joined_at', { ascending: false });

      if (error) {
        console.error('Error fetching user challenge progress:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Unexpected error fetching user challenge progress:', error);
      return [];
    }
  },

  async joinChallenge(userProfileId: string, challengeId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_challenge_progress')
        .insert({
          user_profile_id: userProfileId,
          challenge_id: challengeId,
          current_progress: 0
        });

      if (error) {
        console.error('Error joining challenge:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Unexpected error joining challenge:', error);
      return false;
    }
  }
};

// Water Intake Service
export interface WaterIntake {
  id: string;
  user_profile_id: string;
  amount_ml: number;
  logged_at: string;
  created_at: string;
}

export const waterIntakeService = {
  async logWaterIntake(userProfileId: string, amountMl: number): Promise<WaterIntake | null> {
    try {
      const { data, error } = await supabase
        .from('water_intake')
        .insert({
          user_profile_id: userProfileId,
          amount_ml: amountMl
        })
        .select()
        .single();

      if (error) {
        console.error('Error logging water intake:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Unexpected error logging water intake:', error);
      return null;
    }
  },

  async getTodaysWaterIntake(userProfileId: string): Promise<number> {
    try {
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

      const { data, error } = await supabase
        .from('water_intake')
        .select('amount_ml')
        .eq('user_profile_id', userProfileId)
        .gte('logged_at', startOfDay.toISOString())
        .lt('logged_at', endOfDay.toISOString());

      if (error) {
        console.error('Error fetching water intake:', error);
        return 0;
      }

      return (data || []).reduce((total, intake) => total + intake.amount_ml, 0);
    } catch (error) {
      console.error('Unexpected error fetching water intake:', error);
      return 0;
    }
  }
};