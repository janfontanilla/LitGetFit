declare module '@env' {
  export const EXPO_PUBLIC_SUPABASE_URL: string;
  export const EXPO_PUBLIC_SUPABASE_ANON_KEY: string;
  export const EXPO_PUBLIC_ELEVENLABS_API_KEY: string;
  export const EXPO_PUBLIC_OPENAI_API_KEY: string;
  export const EXPO_PUBLIC_TAVUS_API_KEY: string;
  export const EXPO_PUBLIC_TAVUS_REPLICA_ID: string;
}

// For global environment variable types in Expo
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      EXPO_PUBLIC_SUPABASE_URL: string;
      EXPO_PUBLIC_SUPABASE_ANON_KEY: string;
      EXPO_PUBLIC_ELEVENLABS_API_KEY: string;
      EXPO_PUBLIC_OPENAI_API_KEY: string;
      EXPO_PUBLIC_TAVUS_API_KEY: string;
      EXPO_PUBLIC_TAVUS_REPLICA_ID: string;
    }
  }
}

export {};