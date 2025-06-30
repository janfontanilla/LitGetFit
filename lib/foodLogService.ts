import { supabase } from './supabase';
import { userProfileService } from './supabase';

export interface FoodLog {
  id: string;
  user_profile_id?: string;
  food_name: string;
  quantity: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  notes?: string;
  logged_at: string;
  created_at: string;
}

export interface FoodLogData {
  food_name: string;
  quantity: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  notes?: string;
  logged_at?: string;
}

export interface ParsedFoodData {
  food_name: string;
  quantity: string;
  meal_type?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

export const foodLogService = {
  async createFoodLog(data: FoodLogData): Promise<FoodLog | null> {
    try {
      // Get the first user profile for now (in a real app, this would be the authenticated user)
      const profiles = await userProfileService.getAllProfiles();
      const userProfileId = profiles.length > 0 ? profiles[0].id : null;

      if (!userProfileId) {
        console.error('No user profile found');
        return null;
      }

      const { data: foodLog, error } = await supabase
        .from('food_logs')
        .insert([{
          user_profile_id: userProfileId,
          food_name: data.food_name,
          quantity: data.quantity,
          meal_type: data.meal_type,
          calories: data.calories || null,
          protein: data.protein || null,
          carbs: data.carbs || null,
          fat: data.fat || null,
          notes: data.notes || null,
          logged_at: data.logged_at || new Date().toISOString(),
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating food log:', error);
        return null;
      }

      return foodLog;
    } catch (error) {
      console.error('Unexpected error creating food log:', error);
      return null;
    }
  },

  async getFoodLogs(limit: number = 50): Promise<FoodLog[]> {
    try {
      // Get the first user profile for now
      const profiles = await userProfileService.getAllProfiles();
      const userProfileId = profiles.length > 0 ? profiles[0].id : null;

      if (!userProfileId) {
        console.error('No user profile found');
        return [];
      }

      const { data: foodLogs, error } = await supabase
        .from('food_logs')
        .select('*')
        .eq('user_profile_id', userProfileId)
        .order('logged_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching food logs:', error);
        return [];
      }

      return foodLogs || [];
    } catch (error) {
      console.error('Unexpected error fetching food logs:', error);
      return [];
    }
  },

  async getTodaysFoodLogs(): Promise<FoodLog[]> {
    try {
      // Get the first user profile for now
      const profiles = await userProfileService.getAllProfiles();
      const userProfileId = profiles.length > 0 ? profiles[0].id : null;

      if (!userProfileId) {
        console.error('No user profile found');
        return [];
      }

      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

      const { data: foodLogs, error } = await supabase
        .from('food_logs')
        .select('*')
        .eq('user_profile_id', userProfileId)
        .gte('logged_at', startOfDay.toISOString())
        .lt('logged_at', endOfDay.toISOString())
        .order('logged_at', { ascending: false });

      if (error) {
        console.error('Error fetching today\'s food logs:', error);
        return [];
      }

      return foodLogs || [];
    } catch (error) {
      console.error('Unexpected error fetching today\'s food logs:', error);
      return [];
    }
  },

  async deleteFoodLog(id: string): Promise<boolean> {
    try {
      // Get the first user profile for now
      const profiles = await userProfileService.getAllProfiles();
      const userProfileId = profiles.length > 0 ? profiles[0].id : null;

      if (!userProfileId) {
        console.error('No user profile found');
        return false;
      }

      const { error } = await supabase
        .from('food_logs')
        .delete()
        .eq('id', id)
        .eq('user_profile_id', userProfileId);

      if (error) {
        console.error('Error deleting food log:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Unexpected error deleting food log:', error);
      return false;
    }
  },

  // Parse food description using a simple rule-based approach
  // In production, you'd want to use GPT or a nutrition API
  parseFoodDescription(description: string): ParsedFoodData {
    const lowerDesc = description.toLowerCase();
    
    // Extract quantity and food name
    const quantityMatch = lowerDesc.match(/(\d+(?:\.\d+)?)\s*(?:cups?|pieces?|slices?|ounces?|oz|grams?|g|lbs?|pounds?|tablespoons?|tbsp|teaspoons?|tsp|servings?|portions?)?/);
    const quantity = quantityMatch ? quantityMatch[0] : '1 serving';
    
    // Remove quantity from food name
    let foodName = description.replace(quantityMatch?.[0] || '', '').trim();
    if (foodName.startsWith('of ')) {
      foodName = foodName.substring(3);
    }
    
    // Determine meal type based on time or keywords
    const currentHour = new Date().getHours();
    let mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack' = 'snack';
    
    if (lowerDesc.includes('breakfast') || (currentHour >= 6 && currentHour < 11)) {
      mealType = 'breakfast';
    } else if (lowerDesc.includes('lunch') || (currentHour >= 11 && currentHour < 16)) {
      mealType = 'lunch';
    } else if (lowerDesc.includes('dinner') || (currentHour >= 16 && currentHour < 22)) {
      mealType = 'dinner';
    }
    
    // Basic calorie estimation (very simplified)
    const estimateCalories = (food: string, qty: string): number => {
      const calorieMap: { [key: string]: number } = {
        'egg': 70,
        'toast': 80,
        'bread': 80,
        'apple': 95,
        'banana': 105,
        'chicken': 165,
        'rice': 130,
        'pasta': 220,
        'salad': 20,
        'pizza': 285,
        'burger': 540,
        'sandwich': 300,
      };
      
      const qtyNum = parseFloat(qty) || 1;
      const foodKey = Object.keys(calorieMap).find(key => food.includes(key));
      const baseCalories = foodKey ? calorieMap[foodKey] : 100;
      
      return Math.round(baseCalories * qtyNum);
    };
    
    return {
      food_name: foodName || 'Unknown food',
      quantity,
      meal_type: mealType,
      calories: estimateCalories(foodName, quantity),
    };
  }
};