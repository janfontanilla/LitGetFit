interface TavusConfig {
  apiKey: string;
  replicaId: string;
}

interface VideoGenerationRequest {
  script: string;
  background?: 'gym' | 'studio' | 'outdoor' | 'home';
  duration?: number;
}

interface GeneratedVideo {
  video_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  video_url?: string;
  thumbnail_url?: string;
  created_at: string;
}

export class TavusService {
  private apiKey: string;
  private replicaId: string;
  private baseUrl = 'https://tavusapi.com';

  constructor(config: TavusConfig) {
    this.apiKey = config.apiKey;
    this.replicaId = config.replicaId;
  }

  async generateWorkoutVideo(request: VideoGenerationRequest): Promise<GeneratedVideo | null> {
    try {
      const response = await fetch(`${this.baseUrl}/v2/videos`, {
        method: 'POST',
        headers: {
          'x-api-key': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          replica_id: this.replicaId,
          script: request.script,
          background: request.background || 'gym',
          video_name: `Workout_${Date.now()}`,
        }),
      });

      if (!response.ok) {
        console.error('Tavus API error:', response.status, response.statusText);
        return null;
      }

      const data = await response.json();
      return {
        video_id: data.video_id,
        status: data.status,
        created_at: new Date().toISOString(),
      };

    } catch (error) {
      console.error('Error generating video with Tavus:', error);
      return null;
    }
  }

  async getVideoStatus(videoId: string): Promise<GeneratedVideo | null> {
    try {
      const response = await fetch(`${this.baseUrl}/v2/videos/${videoId}`, {
        headers: {
          'x-api-key': this.apiKey,
        },
      });

      if (!response.ok) {
        console.error('Tavus API error:', response.status, response.statusText);
        return null;
      }

      const data = await response.json();
      return {
        video_id: data.video_id,
        status: data.status,
        video_url: data.download_url,
        thumbnail_url: data.thumbnail_url,
        created_at: data.created_at,
      };

    } catch (error) {
      console.error('Error fetching video status:', error);
      return null;
    }
  }

  async generateMotivationalVideo(
    userName: string, 
    achievement: string, 
    personalizedMessage?: string
  ): Promise<GeneratedVideo | null> {
    const script = personalizedMessage || 
      `Hey ${userName}! Congratulations on ${achievement}! You're absolutely crushing your fitness goals and I'm so proud of your dedication. Keep up the amazing work - you're stronger than you think and capable of achieving anything you set your mind to. Let's keep pushing forward together!`;

    return this.generateWorkoutVideo({
      script,
      background: 'studio',
    });
  }

  async generateWorkoutInstructions(
    exerciseName: string,
    instructions: string,
    tips: string[]
  ): Promise<GeneratedVideo | null> {
    const script = `Let's master the ${exerciseName}! ${instructions} 
    
    Here are my top tips for perfect form: ${tips.join('. ')}. 
    
    Remember, quality over quantity - focus on controlled movements and proper breathing. You've got this!`;

    return this.generateWorkoutVideo({
      script,
      background: 'gym',
    });
  }
}

// Create a singleton instance
const tavusService = new TavusService({
  apiKey: process.env.EXPO_PUBLIC_TAVUS_API_KEY || '',
  replicaId: process.env.EXPO_PUBLIC_TAVUS_REPLICA_ID || '',
});

export default tavusService;