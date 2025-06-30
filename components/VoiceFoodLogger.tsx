import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  Platform,
  Animated,
} from 'react-native';
import { Mic } from 'lucide-react-native';
import { AppColors } from '@/styles/colors';
import { foodLogService, FoodLogData } from '@/lib/foodLogService';
import { ElevenLabsService, playAudioBuffer } from '@/lib/elevenLabsService';
import { userProfileService } from '@/lib/supabase';

interface VoiceFoodLoggerProps {
  onFoodLogged: (foodName: string) => void;
  isProcessing: boolean;
  setIsProcessing: (isProcessing: boolean) => void;
}

export default function VoiceFoodLogger({ onFoodLogged, isProcessing, setIsProcessing }: VoiceFoodLoggerProps) {
  const [isListening, setIsListening] = useState(false);
  const [elevenLabsService, setElevenLabsService] = useState<ElevenLabsService | null>(null);
  
  const pulseAnim = new Animated.Value(1);

  useEffect(() => {
    if (Platform.OS !== 'web') {
      // Init native voice recognition
    }
    initializeElevenLabs();
    return () => {
      // cleanup native voice recognition
    };
  }, []);

  useEffect(() => {
    if (isListening) {
      startPulseAnimation();
    } else {
      stopPulseAnimation();
    }
  }, [isListening]);
  
  const initializeElevenLabs = () => {
    const apiKey = process.env.EXPO_PUBLIC_ELEVENLABS_API_KEY;
    if (apiKey) {
      setElevenLabsService(new ElevenLabsService(apiKey));
    }
  };

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.2, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  };

  const stopPulseAnimation = () => {
    Animated.timing(pulseAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
  };

  const speakWithElevenLabs = async (text: string) => {
    if (!elevenLabsService) return false;
    try {
      const encouragingMessages = [`Great job logging ${text}!`, `Awesome! ${text} has been added.`];
      const randomMessage = encouragingMessages[Math.floor(Math.random() * encouragingMessages.length)];
      const audioBuffer = await elevenLabsService.generateSpeech(randomMessage, 'Bella');
      if (audioBuffer) {
        await playAudioBuffer(audioBuffer);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error with ElevenLabs speech:', error);
      return false;
    }
  };

  const handleTranscript = async (text: string) => {
    setIsProcessing(true);
    try {
      const parsedData = foodLogService.parseFoodDescription(text);
      const foodLog = await foodLogService.createFoodLog({
        ...parsedData,
        meal_type: parsedData.meal_type || 'snack',
      });
      
      if (foodLog) {
        onFoodLogged(foodLog.food_name);
        await speakWithElevenLabs(foodLog.food_name);
      }
    } catch (error) {
      console.error('Error processing transcript:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Mock functions for web
  const startListening = async () => {
    if (isListening) return;
    setIsListening(true);
    console.log("Listening started (mock)...");
    // Simulate speech
    setTimeout(() => {
      const mockTranscript = "I had a protein shake and a banana for breakfast";
      console.log("Recognized (mock):", mockTranscript)
      handleTranscript(mockTranscript);
      setIsListening(false);
    }, 3000);
  };

  const stopListening = async () => {
    if (!isListening) return;
    setIsListening(false);
     console.log("Listening stopped (mock).");
  };

  const buttonStyle = [
    styles.container,
    isListening ? styles.listening : null,
    isProcessing ? styles.processing : null,
    { transform: [{ scale: pulseAnim }] },
  ];

  return (
    <Animated.View style={buttonStyle}>
        <TouchableOpacity onPress={isListening ? stopListening : startListening} disabled={isProcessing}>
            <Mic size={24} color={isListening ? AppColors.primary : AppColors.textPrimary} />
        </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: AppColors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listening: {
    backgroundColor: AppColors.primary,
  },
  processing: {
    opacity: 0.5,
  }
});