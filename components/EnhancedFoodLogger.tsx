import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Camera, Mic, Send, Sparkles, Loader2 } from 'lucide-react-native';
import { AppColors } from '@/styles/colors';
import LiquidGlassCard from './LiquidGlassCard';
import GlassButton from './GlassButton';
import VoiceFoodLogger from './VoiceFoodLogger';
import openAIService from '@/lib/openaiService';
import { foodLogService } from '@/lib/foodLogService';

interface EnhancedFoodLoggerProps {
  onFoodLogged?: (foodLog: any) => void;
  style?: any;
}

export default function EnhancedFoodLogger({ onFoodLogged, style }: EnhancedFoodLoggerProps) {
  const [inputText, setInputText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showVoiceLogger, setShowVoiceLogger] = useState(false);

  const handleTextSubmit = async () => {
    if (!inputText.trim() || isAnalyzing) return;

    setIsAnalyzing(true);

    try {
      // Use OpenAI to analyze the food description
      const analysis = await openAIService.analyzeFoodDescription(inputText.trim());
      
      if (analysis) {
        // Determine meal type based on time
        const currentHour = new Date().getHours();
        let mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack' = 'snack';
        
        if (currentHour >= 6 && currentHour < 11) {
          mealType = 'breakfast';
        } else if (currentHour >= 11 && currentHour < 16) {
          mealType = 'lunch';
        } else if (currentHour >= 16 && currentHour < 22) {
          mealType = 'dinner';
        }

        // Create food log entry
        const foodLogData = {
          food_name: analysis.food_name,
          quantity: analysis.quantity,
          meal_type: mealType,
          calories: analysis.estimated_calories,
          protein: analysis.estimated_protein,
          carbs: analysis.estimated_carbs,
          fat: analysis.estimated_fat,
          notes: `AI analyzed: "${inputText.trim()}"`,
        };

        const savedLog = await foodLogService.createFoodLog(foodLogData);

        if (savedLog) {
          setInputText('');
          onFoodLogged?.(savedLog);
          Alert.alert(
            'Food Logged!',
            `Successfully logged ${analysis.food_name}${analysis.estimated_calories ? ` (${analysis.estimated_calories} cal)` : ''}`
          );
        } else {
          Alert.alert('Error', 'Failed to log food. Please try again.');
        }
      } else {
        Alert.alert('Analysis Failed', 'Could not analyze the food description. Please try again with more details.');
      }
    } catch (error) {
      console.error('Error analyzing food:', error);
      Alert.alert('Error', 'An error occurred while analyzing your food.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <View style={[styles.container, style]}>
      {showVoiceLogger ? (
        <VoiceFoodLogger 
          onFoodLogged={onFoodLogged}
          style={styles.voiceLogger}
        />
      ) : (
        <LiquidGlassCard style={styles.textLoggerCard}>
          <View style={styles.header}>
            <Sparkles size={24} color={AppColors.primary} />
            <Text style={styles.title}>Smart Food Logger</Text>
            <Text style={styles.subtitle}>
              Describe what you ate and AI will analyze the nutrition
            </Text>
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              value={inputText}
              onChangeText={setInputText}
              placeholder="e.g., 'grilled chicken breast with quinoa and steamed broccoli'"
              placeholderTextColor={AppColors.textTertiary}
              multiline
              numberOfLines={3}
              maxLength={200}
              editable={!isAnalyzing}
            />
            
            <TouchableOpacity
              style={[
                styles.submitButton,
                (inputText.trim() && !isAnalyzing) && styles.submitButtonActive,
              ]}
              onPress={handleTextSubmit}
              disabled={!inputText.trim() || isAnalyzing}
            >
              {isAnalyzing ? (
                <Loader2 size={20} color={AppColors.textPrimary} />
              ) : (
                <Send size={20} color={inputText.trim() ? AppColors.primary : AppColors.textTertiary} />
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.examples}>
            <Text style={styles.examplesTitle}>Try saying:</Text>
            <Text style={styles.exampleText}>• "2 scrambled eggs with whole wheat toast"</Text>
            <Text style={styles.exampleText}>• "Large Caesar salad with grilled chicken"</Text>
            <Text style={styles.exampleText}>• "Protein smoothie with banana and peanut butter"</Text>
          </View>
        </LiquidGlassCard>
      )}

      {/* Toggle Buttons */}
      <View style={styles.toggleContainer}>
        <GlassButton
          title="Text Input"
          onPress={() => setShowVoiceLogger(false)}
          variant={!showVoiceLogger ? 'primary' : 'secondary'}
          size="small"
          style={styles.toggleButton}
          icon={<Send size={16} color={AppColors.textPrimary} />}
        />
        <GlassButton
          title="Voice Input"
          onPress={() => setShowVoiceLogger(true)}
          variant={showVoiceLogger ? 'primary' : 'secondary'}
          size="small"
          style={styles.toggleButton}
          icon={<Mic size={16} color={AppColors.textPrimary} />}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  voiceLogger: {
    marginBottom: 16,
  },
  textLoggerCard: {
    marginBottom: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: AppColors.textPrimary,
    marginTop: 8,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: AppColors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
    marginBottom: 20,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: AppColors.textPrimary,
    backgroundColor: AppColors.backgroundSecondary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: AppColors.border,
    textAlignVertical: 'top',
    minHeight: 80,
  },
  submitButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: AppColors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  submitButtonActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderColor: AppColors.primary,
  },
  examples: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: AppColors.border,
  },
  examplesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.textPrimary,
    marginBottom: 8,
  },
  exampleText: {
    fontSize: 12,
    color: AppColors.textSecondary,
    marginBottom: 4,
    paddingLeft: 8,
  },
  toggleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  toggleButton: {
    flex: 1,
  },
});