import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Alert,
  Animated,
} from 'react-native';
import { Mic, MicOff, Volume2, Loader2, Check, X } from 'lucide-react-native';
import * as Speech from 'expo-speech';
import { AppColors } from '@/styles/colors';
import LiquidGlassCard from './LiquidGlassCard';
import { foodLogService, FoodLogData } from '@/lib/foodLogService';

// Mock voice recognition for web platform
const mockVoiceRecognition = {
  start: () => Promise.resolve(),
  stop: () => Promise.resolve(),
  destroy: () => Promise.resolve(),
  isAvailable: () => Promise.resolve(false),
  onSpeechStart: null as ((e: any) => void) | null,
  onSpeechEnd: null as ((e: any) => void) | null,
  onSpeechResults: null as ((e: any) => void) | null,
  onSpeechError: null as ((e: any) => void) | null,
};

interface VoiceFoodLoggerProps {
  onFoodLogged?: (foodLog: any) => void;
  style?: any;
}

export default function VoiceFoodLogger({ onFoodLogged, style }: VoiceFoodLoggerProps) {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [lastLoggedFood, setLastLoggedFood] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Animation values
  const pulseAnim = new Animated.Value(1);
  const successAnim = new Animated.Value(0);

  useEffect(() => {
    if (Platform.OS !== 'web') {
      // Initialize voice recognition for native platforms
      initializeVoiceRecognition();
    }
    
    return () => {
      if (Platform.OS !== 'web') {
        cleanupVoiceRecognition();
      }
    };
  }, []);

  useEffect(() => {
    if (isListening) {
      startPulseAnimation();
    } else {
      stopPulseAnimation();
    }
  }, [isListening]);

  const initializeVoiceRecognition = async () => {
    if (Platform.OS === 'web') return;
    
    try {
      // For native platforms, you would import and setup @react-native-voice/voice here
      // const Voice = require('@react-native-voice/voice').default;
      // Voice.onSpeechStart = onSpeechStart;
      // Voice.onSpeechEnd = onSpeechEnd;
      // Voice.onSpeechResults = onSpeechResults;
      // Voice.onSpeechError = onSpeechError;
    } catch (error) {
      console.error('Error initializing voice recognition:', error);
    }
  };

  const cleanupVoiceRecognition = () => {
    if (Platform.OS === 'web') return;
    
    try {
      // Voice.destroy().then(Voice.removeAllListeners);
    } catch (error) {
      console.error('Error cleaning up voice recognition:', error);
    }
  };

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const stopPulseAnimation = () => {
    Animated.timing(pulseAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const showSuccessAnimation = () => {
    setShowSuccess(true);
    Animated.sequence([
      Animated.timing(successAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(2000),
      Animated.timing(successAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowSuccess(false);
    });
  };

  const startListening = async () => {
    if (Platform.OS === 'web') {
      // Web fallback - show input dialog
      Alert.prompt(
        'Voice Food Logger',
        'Describe what you ate (e.g., "2 eggs and toast for breakfast"):',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Log Food', 
            onPress: (text) => {
              if (text) {
                handleTranscript(text);
              }
            }
          },
        ],
        'plain-text',
        '',
        'default'
      );
      return;
    }

    try {
      setIsListening(true);
      setTranscript('');
      // await Voice.start('en-US');
    } catch (error) {
      console.error('Error starting voice recognition:', error);
      setIsListening(false);
      Alert.alert('Error', 'Failed to start voice recognition');
    }
  };

  const stopListening = async () => {
    if (Platform.OS === 'web') return;
    
    try {
      setIsListening(false);
      // await Voice.stop();
    } catch (error) {
      console.error('Error stopping voice recognition:', error);
    }
  };

  const handleTranscript = async (text: string) => {
    setTranscript(text);
    setIsProcessing(true);

    try {
      // Parse the food description
      const parsedFood = foodLogService.parseFoodDescription(text);
      
      // Create food log entry
      const foodLogData: FoodLogData = {
        food_name: parsedFood.food_name,
        quantity: parsedFood.quantity,
        meal_type: parsedFood.meal_type || 'snack',
        calories: parsedFood.calories,
        protein: parsedFood.protein,
        carbs: parsedFood.carbs,
        fat: parsedFood.fat,
        notes: `Voice logged: "${text}"`,
      };

      const savedLog = await foodLogService.createFoodLog(foodLogData);

      if (savedLog) {
        const loggedText = `Logged ${parsedFood.quantity} ${parsedFood.food_name} for ${parsedFood.meal_type}`;
        setLastLoggedFood(loggedText);
        
        // Provide voice feedback
        if (Platform.OS !== 'web') {
          Speech.speak(loggedText, {
            language: 'en-US',
            pitch: 1.0,
            rate: 0.9,
          });
        }
        
        showSuccessAnimation();
        onFoodLogged?.(savedLog);
      } else {
        Alert.alert('Error', 'Failed to log food. Please try again.');
      }
    } catch (error) {
      console.error('Error processing food log:', error);
      Alert.alert('Error', 'Failed to process your food log. Please try again.');
    } finally {
      setIsProcessing(false);
      setIsListening(false);
    }
  };

  // Mock voice recognition callbacks for native platforms
  const onSpeechStart = () => {
    console.log('Speech started');
  };

  const onSpeechEnd = () => {
    console.log('Speech ended');
    setIsListening(false);
  };

  const onSpeechResults = (e: any) => {
    if (e.value && e.value[0]) {
      handleTranscript(e.value[0]);
    }
  };

  const onSpeechError = (e: any) => {
    console.error('Speech error:', e);
    setIsListening(false);
    Alert.alert('Error', 'Voice recognition failed. Please try again.');
  };

  return (
    <View style={[styles.container, style]}>
      <LiquidGlassCard style={styles.card}>
        <View style={styles.content}>
          <Text style={styles.title}>Voice Food Logger</Text>
          <Text style={styles.subtitle}>
            {isListening 
              ? 'Listening... Describe what you ate'
              : isProcessing
              ? 'Processing your food log...'
              : 'Tap to log food with your voice'
            }
          </Text>

          {/* Voice Button */}
          <TouchableOpacity
            style={styles.voiceButtonContainer}
            onPress={isListening ? stopListening : startListening}
            disabled={isProcessing}
            activeOpacity={0.8}
          >
            <Animated.View
              style={[
                styles.voiceButton,
                isListening && styles.voiceButtonActive,
                { transform: [{ scale: pulseAnim }] },
              ]}
            >
              {isProcessing ? (
                <Loader2 size={32} color={AppColors.textPrimary} />
              ) : isListening ? (
                <MicOff size={32} color={AppColors.textPrimary} />
              ) : (
                <Mic size={32} color={AppColors.textPrimary} />
              )}
            </Animated.View>
          </TouchableOpacity>

          {/* Transcript Display */}
          {transcript && (
            <View style={styles.transcriptContainer}>
              <Text style={styles.transcriptLabel}>You said:</Text>
              <Text style={styles.transcriptText}>"{transcript}"</Text>
            </View>
          )}

          {/* Success Message */}
          {showSuccess && (
            <Animated.View
              style={[
                styles.successContainer,
                { opacity: successAnim, transform: [{ scale: successAnim }] },
              ]}
            >
              <Check size={20} color={AppColors.success} />
              <Text style={styles.successText}>{lastLoggedFood}</Text>
            </Animated.View>
          )}

          {/* Instructions */}
          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionsTitle}>Try saying:</Text>
            <Text style={styles.instructionText}>• "2 eggs and toast for breakfast"</Text>
            <Text style={styles.instructionText}>• "1 cup of rice for lunch"</Text>
            <Text style={styles.instructionText}>• "Apple as a snack"</Text>
          </View>
        </View>
      </LiquidGlassCard>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  card: {
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    width: '100%',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: AppColors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: AppColors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  voiceButtonContainer: {
    marginBottom: 20,
  },
  voiceButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: AppColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: AppColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  voiceButtonActive: {
    backgroundColor: AppColors.accent,
    shadowColor: AppColors.accent,
  },
  transcriptContainer: {
    width: '100%',
    padding: 16,
    backgroundColor: AppColors.backgroundSecondary,
    borderRadius: 12,
    marginBottom: 16,
  },
  transcriptLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: AppColors.textSecondary,
    marginBottom: 4,
  },
  transcriptText: {
    fontSize: 16,
    color: AppColors.textPrimary,
    fontStyle: 'italic',
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  successText: {
    fontSize: 14,
    color: AppColors.success,
    fontWeight: '600',
    flex: 1,
  },
  instructionsContainer: {
    width: '100%',
    marginTop: 8,
  },
  instructionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.textPrimary,
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 12,
    color: AppColors.textSecondary,
    marginBottom: 4,
    paddingLeft: 8,
  },
});