import { rateLimit } from 'express-rate-limit';

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});

// Helper to sanitize input
const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/<[^>]*>?/gm, '') // Remove HTML tags
    .replace(/[^\w\s.,?!:;()'"]/g, ''); // Allow only safe characters
};

// Apply rate limiting to all requests
export const middleware = [limiter];

export async function POST(request: Request) {
  try {
    // Validate request
    if (!request.body) {
      return new Response(JSON.stringify({ error: 'Request body is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Parse request body
    const body = await request.json();
    
    // Validate required fields
    if (!body.description) {
      return new Response(JSON.stringify({ error: 'Food description is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Sanitize input
    const sanitizedDescription = sanitizeInput(body.description);
    
    // Simple food parser function
    const parseFoodDescription = (description: string) => {
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

      // Estimate macros based on food type
      const estimateMacros = (food: string, calories: number) => {
        // Default macro distribution (balanced)
        let proteinPct = 0.25;
        let carbsPct = 0.5;
        let fatPct = 0.25;
        
        // Adjust based on food type
        if (food.includes('egg') || food.includes('meat') || food.includes('chicken') || 
            food.includes('fish') || food.includes('protein')) {
          proteinPct = 0.6;
          carbsPct = 0.1;
          fatPct = 0.3;
        } else if (food.includes('bread') || food.includes('rice') || food.includes('pasta') || 
                  food.includes('cereal') || food.includes('oat')) {
          proteinPct = 0.15;
          carbsPct = 0.7;
          fatPct = 0.15;
        } else if (food.includes('avocado') || food.includes('oil') || food.includes('butter') || 
                  food.includes('nut') || food.includes('cheese')) {
          proteinPct = 0.15;
          carbsPct = 0.15;
          fatPct = 0.7;
        }
        
        return {
          protein: Math.round((calories * proteinPct) / 4), // 4 calories per gram of protein
          carbs: Math.round((calories * carbsPct) / 4),     // 4 calories per gram of carbs
          fat: Math.round((calories * fatPct) / 9)          // 9 calories per gram of fat
        };
      };
      
      const calories = estimateCalories(foodName, quantity);
      const macros = estimateMacros(lowerDesc, calories);
      
      return {
        food_name: foodName || 'Unknown food',
        quantity,
        meal_type: mealType,
        estimated_calories: calories,
        estimated_protein: macros.protein,
        estimated_carbs: macros.carbs,
        estimated_fat: macros.fat
      };
    };

    // Parse the food description
    const analysis = parseFoodDescription(sanitizedDescription);

    // Return successful response
    return Response.json({
      analysis,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in analyze-food API:', error);
    
    // Return error response
    return new Response(
      JSON.stringify({
        error: 'An error occurred while analyzing the food description',
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}