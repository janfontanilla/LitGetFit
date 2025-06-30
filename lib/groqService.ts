import Groq from 'groq-sdk';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatResponse {
  message: string;
  suggestions?: string[];
  confidence?: number;
}

export class GroqService {
  private client: Groq;
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.client = new Groq({
      apiKey: this.apiKey,
    });
  }

  async generateResponse(
    messages: ChatMessage[],
    context?: {
      userGoals?: string[];
      experienceLevel?: string;
      currentWorkout?: string;
      nutritionData?: any;
    }
  ): Promise<ChatResponse> {
    try {
      // Create system prompt based on context
      const systemPrompt = this.createSystemPrompt(context);
      
      const chatMessages: ChatMessage[] = [
        { role: 'system', content: systemPrompt },
        ...messages
      ];

      const completion = await this.client.chat.completions.create({
        messages: chatMessages,
        model: 'llama3-8b-8192', // Fast and cost-effective model
        temperature: 0.7,
        max_tokens: 500,
        top_p: 0.9,
        stream: false,
      });

      const response = completion.choices[0]?.message?.content || 'I apologize, but I couldn\'t generate a response at the moment.';
      
      return {
        message: response,
        confidence: 0.9,
      };
    } catch (error) {
      console.error('Error generating Groq response:', error);
      return {
        message: 'I\'m having trouble connecting right now. Please try again in a moment.',
        confidence: 0.1,
      };
    }
  }

  private createSystemPrompt(context?: {
    userGoals?: string[];
    experienceLevel?: string;
    currentWorkout?: string;
    nutritionData?: any;
  }): string {
    let prompt = `You are an expert AI fitness and nutrition coach for the LitGetFit app. You provide personalized, encouraging, and scientifically-backed advice to help users achieve their fitness goals.

Your personality:
- Encouraging and motivational, but not overly pushy
- Professional yet friendly
- Focused on sustainable, healthy habits
- Always prioritize safety and proper form
- Use emojis sparingly but effectively

Your expertise:
- Exercise form and technique
- Workout programming and progression
- Nutrition and meal planning
- Recovery and rest
- Mental health and motivation
- Injury prevention

Guidelines:
- Keep responses concise but informative (2-4 sentences typically)
- Provide actionable advice when possible
- Ask follow-up questions to better understand user needs
- If you don't know something, admit it and suggest consulting a professional
- Always encourage proper form and safety first
- Be supportive of all fitness levels and goals`;

    if (context) {
      if (context.userGoals?.length) {
        prompt += `\n\nUser's fitness goals: ${context.userGoals.join(', ')}`;
      }
      if (context.experienceLevel) {
        prompt += `\n\nUser's experience level: ${context.experienceLevel}`;
      }
      if (context.currentWorkout) {
        prompt += `\n\nCurrent workout: ${context.currentWorkout}`;
      }
      if (context.nutritionData) {
        prompt += `\n\nNutrition context: ${JSON.stringify(context.nutritionData)}`;
      }
    }

    return prompt;
  }

  async generateWorkoutAdvice(
    exercise: string,
    formFeedback?: string,
    repCount?: number
  ): Promise<ChatResponse> {
    const messages: ChatMessage[] = [
      {
        role: 'user',
        content: `I'm doing ${exercise}${repCount ? ` and I'm on rep ${repCount}` : ''}. ${formFeedback ? `Form feedback: ${formFeedback}` : 'How am I doing?'}`
      }
    ];

    return this.generateResponse(messages, {
      currentWorkout: exercise
    });
  }

  async generateNutritionAdvice(
    question: string,
    nutritionData?: any
  ): Promise<ChatResponse> {
    const messages: ChatMessage[] = [
      {
        role: 'user',
        content: question
      }
    ];

    return this.generateResponse(messages, {
      nutritionData
    });
  }

  async generateMotivationalMessage(
    context: 'workout_start' | 'workout_end' | 'nutrition_log' | 'goal_achieved' | 'struggling'
  ): Promise<ChatResponse> {
    const contextMessages = {
      workout_start: "I'm about to start my workout. Give me a quick motivational boost!",
      workout_end: "I just finished my workout. Give me some encouragement!",
      nutrition_log: "I just logged my meal. Give me positive reinforcement!",
      goal_achieved: "I achieved a fitness goal today! Celebrate with me!",
      struggling: "I'm having a hard time staying motivated today. Help me get back on track."
    };

    const messages: ChatMessage[] = [
      {
        role: 'user',
        content: contextMessages[context]
      }
    ];

    return this.generateResponse(messages);
  }
}

// Export a singleton instance
let groqServiceInstance: GroqService | null = null;

export const getGroqService = (): GroqService => {
  if (!groqServiceInstance) {
    const apiKey = process.env.EXPO_PUBLIC_GROQ_API_KEY;
    if (!apiKey) {
      throw new Error('GROQ_API_KEY environment variable is required');
    }
    groqServiceInstance = new GroqService(apiKey);
  }
  return groqServiceInstance;
}; 