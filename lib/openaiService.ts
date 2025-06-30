interface OpenAIConfig {
  apiKey: string;
  model?: string;
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface WorkoutGenerationRequest {
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced';
  goals: string[];
  timeAvailable: number; // in minutes
  equipment: string[];
  targetMuscles?: string[];
  workoutType: 'strength' | 'cardio' | 'hiit' | 'flexibility' | 'full_body';
}

interface GeneratedWorkout {
  name: string;
  description: string;
  estimatedDuration: number;
  exercises: Array<{
    name: string;
    sets: string;
    reps: string;
    weight: string;
    restTime: string;
    instructions?: string;
    order: number;
  }>;
  targetedMuscles: string[];
  tips: string[];
}

export class OpenAIService {
  private apiKey: string;
  private baseUrl = 'https://api.openai.com/v1';
  private model: string;

  constructor(config: OpenAIConfig) {
    this.apiKey = config.apiKey;
    this.model = config.model || 'gpt-4';
  }

  async generateWorkout(request: WorkoutGenerationRequest): Promise<GeneratedWorkout | null> {
    try {
      const systemPrompt = `You are an expert fitness coach and personal trainer. Generate a detailed, safe, and effective workout plan based on the user's requirements. Always prioritize proper form and safety.

Return your response as a valid JSON object with this exact structure:
{
  "name": "Workout Name",
  "description": "Brief description",
  "estimatedDuration": 45,
  "exercises": [
    {
      "name": "Exercise Name",
      "sets": "3",
      "reps": "12",
      "weight": "15 kg",
      "restTime": "60 seconds",
      "instructions": "Brief form instructions",
      "order": 0
    }
  ],
  "targetedMuscles": ["chest", "shoulders"],
  "tips": ["Tip 1", "Tip 2"]
}`;

      const userPrompt = `Generate a ${request.workoutType} workout with these specifications:
- Fitness Level: ${request.fitnessLevel}
- Goals: ${request.goals.join(', ')}
- Time Available: ${request.timeAvailable} minutes
- Equipment: ${request.equipment.join(', ')}
${request.targetMuscles ? `- Target Muscles: ${request.targetMuscles.join(', ')}` : ''}

Please create a workout that:
1. Fits within the time constraint
2. Uses only the available equipment
3. Is appropriate for the fitness level
4. Targets the specified goals
5. Includes proper warm-up considerations
6. Has clear, safe exercise instructions`;

      const messages: ChatMessage[] = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ];

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          temperature: 0.7,
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        console.error('OpenAI API error:', response.status, response.statusText);
        return null;
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        console.error('No content in OpenAI response');
        return null;
      }

      // Parse the JSON response
      try {
        const workout = JSON.parse(content);
        return workout;
      } catch (parseError) {
        console.error('Error parsing OpenAI response:', parseError);
        return null;
      }

    } catch (error) {
      console.error('Error generating workout with OpenAI:', error);
      return null;
    }
  }

  async generateNutritionAdvice(query: string, userProfile?: any): Promise<string | null> {
    try {
      const systemPrompt = `You are a certified nutritionist and dietitian. Provide helpful, accurate, and safe nutrition advice. Always recommend consulting with healthcare professionals for specific medical conditions.

Keep responses concise but informative. Focus on evidence-based recommendations.`;

      const userPrompt = userProfile 
        ? `User Profile: Age ${userProfile.age}, Goal: ${userProfile.primary_goal}, Activity: ${userProfile.activity_level}
        
Question: ${query}`
        : `Question: ${query}`;

      const messages: ChatMessage[] = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ];

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          temperature: 0.7,
          max_tokens: 500,
        }),
      });

      if (!response.ok) {
        console.error('OpenAI API error:', response.status, response.statusText);
        return null;
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || null;

    } catch (error) {
      console.error('Error generating nutrition advice:', error);
      return null;
    }
  }

  async analyzeFoodDescription(description: string): Promise<{
    food_name: string;
    quantity: string;
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

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          temperature: 0.3,
          max_tokens: 300,
        }),
      });

      if (!response.ok) {
        console.error('OpenAI API error:', response.status, response.statusText);
        return null;
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) return null;

      try {
        return JSON.parse(content);
      } catch (parseError) {
        console.error('Error parsing food analysis response:', parseError);
        return null;
      }

    } catch (error) {
      console.error('Error analyzing food description:', error);
      return null;
    }
  }
}

// Create a singleton instance
const openAIService = new OpenAIService({
  apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY || '',
});

export default openAIService;