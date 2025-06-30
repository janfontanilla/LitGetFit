interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface NutritionChatRequest {
  message: string;
  conversationHistory?: ChatMessage[];
  userProfile?: any;
}

class GroqService {
  private maxConversationLength: number = 10;

  async generateNutritionResponse(request: NutritionChatRequest): Promise<string | null> {
    try {
      // Since we can't use Groq directly in the browser, we'll use our API endpoint
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: request.message,
          conversationHistory: request.conversationHistory || [],
          userProfile: request.userProfile,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      return data.response || null;
    } catch (error) {
      console.error('Error generating nutrition response:', error);
      return null;
    }
  }

  async analyzeFoodDescription(description: string): Promise<{
    food_name: string;
    quantity: string;
    meal_type?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    estimated_calories?: number;
    estimated_protein?: number;
    estimated_carbs?: number;
    estimated_fat?: number;
  } | null> {
    try {
      // Use our API endpoint for food analysis
      const response = await fetch('/api/analyze-food', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ description }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      return data.analysis || null;
    } catch (error) {
      console.error('Error analyzing food description:', error);
      
      // Fallback to simple parsing if API fails
      return this.simpleFoodParser(description);
    }
  }

  // Simple fallback parser when API is unavailable
  simpleFoodParser(description: string): {
    food_name: string;
    quantity: string;
    meal_type?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    estimated_calories?: number;
  } {
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
      estimated_calories: estimateCalories(foodName, quantity),
    };
  }
}

// Create a singleton instance
const groqService = new GroqService();

export default groqService;