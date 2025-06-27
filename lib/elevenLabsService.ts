export interface ElevenLabsConfig {
  apiKey: string;
  voiceId: string;
  model?: string;
  stability?: number;
  similarityBoost?: number;
}

export interface VoiceSettings {
  stability: number;
  similarity_boost: number;
  style?: number;
  use_speaker_boost?: boolean;
}

export class ElevenLabsService {
  private apiKey: string;
  private baseUrl = 'https://api.elevenlabs.io/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateSpeech(
    text: string,
    voiceId: string,
    options: {
      model?: string;
      voice_settings?: VoiceSettings;
    } = {}
  ): Promise<ArrayBuffer | null> {
    try {
      const response = await fetch(`${this.baseUrl}/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': this.apiKey,
        },
        body: JSON.stringify({
          text,
          model_id: options.model || 'eleven_monolingual_v1',
          voice_settings: options.voice_settings || {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.0,
            use_speaker_boost: true,
          },
        }),
      });

      if (!response.ok) {
        console.error('ElevenLabs API error:', response.status, response.statusText);
        return null;
      }

      return await response.arrayBuffer();
    } catch (error) {
      console.error('Error generating speech with ElevenLabs:', error);
      return null;
    }
  }

  async getVoices(): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/voices`, {
        headers: {
          'xi-api-key': this.apiKey,
        },
      });

      if (!response.ok) {
        console.error('Error fetching voices:', response.status);
        return [];
      }

      const data = await response.json();
      return data.voices || [];
    } catch (error) {
      console.error('Error fetching voices:', error);
      return [];
    }
  }

  // Predefined voice IDs for different personalities
  static readonly VOICES = {
    // Professional, clear female voice
    RACHEL: '21m00Tcm4TlvDq8ikWAM',
    // Warm, friendly male voice
    ADAM: 'pNInz6obpgDQGcFmaJgB',
    // Energetic, motivational female voice
    BELLA: 'EXAVITQu4vr4xnSDxMaL',
    // Calm, soothing male voice
    JOSH: 'TxGEqnHWrfWFTfGW9XjX',
    // Professional, authoritative female voice
    SARAH: 'EXAVITQu4vr4xnSDxMaL',
  };

  // Predefined voice settings for different contexts
  static readonly VOICE_SETTINGS = {
    ENCOURAGING: {
      stability: 0.3,
      similarity_boost: 0.8,
      style: 0.2,
      use_speaker_boost: true,
    },
    PROFESSIONAL: {
      stability: 0.7,
      similarity_boost: 0.75,
      style: 0.0,
      use_speaker_boost: true,
    },
    FRIENDLY: {
      stability: 0.4,
      similarity_boost: 0.85,
      style: 0.3,
      use_speaker_boost: true,
    },
  };
}

// Utility function to play audio from ArrayBuffer
export const playAudioBuffer = async (audioBuffer: ArrayBuffer): Promise<void> => {
  try {
    if (typeof window !== 'undefined' && window.Audio) {
      // Web platform
      const blob = new Blob([audioBuffer], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(blob);
      const audio = new Audio(audioUrl);
      
      return new Promise((resolve, reject) => {
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          resolve();
        };
        audio.onerror = () => {
          URL.revokeObjectURL(audioUrl);
          reject(new Error('Audio playback failed'));
        };
        audio.play().catch(reject);
      });
    } else {
      // React Native platform - would use expo-av
      console.log('Audio playback not implemented for this platform');
    }
  } catch (error) {
    console.error('Error playing audio:', error);
    throw error;
  }
};