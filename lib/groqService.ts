import { Groq } from 'groq-sdk';

interface GroqConfig {
  apiKey: string;
  model?: string;
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface NutritionChatRequest {
  message: string;
  conversationHistory?: ChatMessage[];
  userProfile?: any;
}

export class GroqService {
  private client: Groq;
  private model: string;
  private maxConversationLength: number = 10;

  constructor(config: GroqConfig) {
    this.client = new Groq({
      apiKey: config.apiKey,
    });
    this.model = config.model || 'mixtral-8x7b-32768';
  }

  async generateNutritionResponse(request: NutritionChatRequest): Promise<string | null> {
    try {
      const systemPrompt = `You are a certified nutritionist and dietitian specializing in fitness nutrition. 
Provide helpful, accurate, and safe nutrition advice. Always recommend consulting with healthcare professionals for specific medical conditions.

Keep responses concise but informative. Focus on evidence-based recommendations.
Provide specific, actionable advice rather than general statements.
When appropriate, suggest specific foods, meal ideas, or recipes.
If you don't know something, admit it rather than making up information.
Be encouraging and positive, but realistic about nutrition goals.`;

      // Prepare conversation history
      let messages: ChatMessage[] = [
        { role: 'system', content: systemPrompt },
      ];

      // Add conversation history if provided, limited to max length
      if (request.conversationHistory && request.conversationHistory.length > 0) {
        const limitedHistory = request.conversationHistory.slice(-this.maxConversationLength);
        messages = [...messages, ...limitedHistory];
      }

      // Add user profile context if available
      if (request.userProfile) {
        const userContext = `User Profile: Age ${request.userProfile.age}, Height ${request.userProfile.height}cm, ${request.userProfile.weight ? `Weight ${request.userProfile.weight}kg, ` : ''}Fitness Experience: ${request.userProfile.fitness_experience}, Primary Goal: ${request.userProfile.primary_goal.replace('_', ' ')}, Activity Level: ${request.userProfile.activity_level.replace('_', ' ')}`;
        
        messages.push({ 
          role: 'user', 
          content: `${userContext}\n\nMy question: ${request.message}` 
        });
      } else {
        messages.push({ role: 'user', content: request.message });
      }

      // Generate response
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000,
        top_p: 0.9,
      });

      return response.choices[0]?.message?.content || null;
    } catch (error) {
      console.error('Error generating nutrition response with Groq:', error);
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
      const systemPrompt = `You are a nutrition expert. Analyze food descriptions and provide nutritional estimates.

Return your response as a valid JSON object with this exact structure:
{
  "food_name": "Food Name",
  "quantity": "Amount with unit",
  "meal_type": "breakfast|lunch|dinner|snack",
  "estimated_calories": 150,
  "estimated_protein": 25,
  "estimated_carbs": 10,
  "estimated_fat": 5
}

Provide reasonable estimates based on common serving sizes. If you can't determine nutrition info, omit those fields.`;

      const messages: ChatMessage[] = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Analyze this food description: "${description}"` }
      ];

      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: messages,
        temperature: 0.3,
        max_tokens: 500,
      });

      const content = response.choices[0]?.message?.content;

      if (!content) return null;

      try {
        return JSON.parse(content);
      } catch (parseError) {
        console.error('Error parsing food analysis response:', parseError);
        return null;
      }
    } catch (error) {
      console.error('Error analyzing food description with Groq:', error);
      return null;
    }
  }

  async generateMealPlan(
    userProfile: any,
    preferences: {
      dietary_restrictions?: string[];
      disliked_foods?: string[];
      meal_count?: number;
      calorie_target?: number;
    }
  ): Promise<any | null> {
    try {
      const systemPrompt = `You are a certified nutritionist specializing in meal planning. Create personalized meal plans based on user profiles and preferences.

Return your response as a valid JSON object with this structure:
{
  "daily_calories": 2000,
  "daily_protein": 150,
  "daily_carbs": 200,
  "daily_fat": 70,
  "meals": [
    {
      "name": "Breakfast",
      "foods": [
        {
          "name": "Scrambled eggs",
          "quantity": "3 eggs",
          "calories": 210,
          "protein": 18,
          "carbs": 2,
          "fat": 15
        }
      ],
      "total_calories": 450,
      "total_protein": 30,
      "total_carbs": 45,
      "total_fat": 15
    }
  ],
  "tips": ["Tip 1", "Tip 2"]
}`;

      const userPrompt = `Create a meal plan for a user with the following profile:
- Age: ${userProfile.age}
- Height: ${userProfile.height}cm
- Weight: ${userProfile.weight || 'Not provided'}kg
- Fitness Experience: ${userProfile.fitness_experience}
- Primary Goal: ${userProfile.primary_goal.replace('_', ' ')}
- Activity Level: ${userProfile.activity_level.replace('_', ' ')}

Preferences:
- Dietary Restrictions: ${preferences.dietary_restrictions?.join(', ') || 'None'}
- Disliked Foods: ${preferences.disliked_foods?.join(', ') || 'None'}
- Preferred Meal Count: ${preferences.meal_count || 3} meals per day
- Calorie Target: ${preferences.calorie_target || 'Calculate based on profile'}

Please create a nutritionally balanced meal plan that supports their fitness goals.`;

      const messages: ChatMessage[] = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ];

      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: messages,
        temperature: 0.7,
        max_tokens: 2000,
      });

      const content = response.choices[0]?.message?.content;

      if (!content) return null;

      try {
        return JSON.parse(content);
      } catch (parseError) {
        console.error('Error parsing meal plan response:', parseError);
        return null;
      }
    } catch (error) {
      console.error('Error generating meal plan with Groq:', error);
      return null;
    }
  }
}

// Create a singleton instance
const groqService = new GroqService({
  apiKey: process.env.EXPO_PUBLIC_GROQ_API_KEY || '',
});

export default groqService;