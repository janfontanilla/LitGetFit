import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Utensils } from 'lucide-react-native';

import LiquidGlassCard from '@/components/LiquidGlassCard';
import VoiceFoodLogger from '@/components/VoiceFoodLogger';
import FoodLogsList from '@/components/FoodLogsList';
import AIChatInterface from '@/components/AIChatInterface';
import { AppColors, Gradients } from '@/styles/colors';
import { ChatContext } from '@/hooks/useChatContext';

interface QuickReply {
  id: string;
  text: string;
  action: string;
}

const quickReplies: QuickReply[] = [
  { id: '1', text: 'Show today\'s macros', action: 'show_macros' },
  { id: '2', text: 'Meal recommendations', action: 'meal_suggestions' },
  { id: '3', text: 'Water intake', action: 'water_log' },
  { id: '4', text: 'Nutrition tips', action: 'nutrition_tips' },
];

export default function NutritionScreen() {
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [todaysLogs, setTodaysLogs] = useState<any[]>([]);

  const handleFoodLogged = (foodLog: any) => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleLogsChange = (logs: any[]) => {
    setTodaysLogs(logs);
  };

  const handleQuickReply = (reply: QuickReply) => {
    console.log('Quick reply selected:', reply.action);
  };

  const handleMessageSent = (message: string) => {
    console.log('Message sent:', message);
  };

  const handleVoiceToggle = (enabled: boolean) => {
    setIsVoiceMode(enabled);
    console.log('Voice mode toggled:', enabled);
  };

  // Create nutrition context for the AI
  const nutritionContext: ChatContext = {
    nutritionData: {
      todaysLogs,
      totalCalories: todaysLogs.reduce((sum, log) => sum + (log.calories || 0), 0),
      macros: {
        protein: 120,
        carbs: 180,
        fats: 65,
      },
      goals: {
        calories: 2200,
        protein: 150,
        carbs: 220,
        fats: 85,
      }
    }
  };

  return (
    <LinearGradient colors={Gradients.background} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView 
          style={styles.keyboardContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {/* Voice Logger Section */}
          <View style={styles.voiceLoggerContainer}>
            <VoiceFoodLogger
              style={styles.voiceLogger}
              onFoodLogged={handleFoodLogged}
            />
          </View>

          {/* Food Logs Section */}
          <View style={styles.foodLogsContainer}>
            <Text style={styles.sectionTitle}>Today's Food Log</Text>
            <FoodLogsList
              refreshTrigger={refreshTrigger}
              onLogsChange={handleLogsChange}
            />
          </View>

          {/* AI Chat Section */}
          <View style={styles.chatSection}>
            <AIChatInterface
              title="Nutrition Coach"
              subtitle="AI-powered nutrition guidance"
              icon={<Utensils size={20} color={AppColors.primary} />}
              initialContext={nutritionContext}
              quickReplies={quickReplies}
              onQuickReply={handleQuickReply}
              onMessageSent={handleMessageSent}
              onVoiceToggle={handleVoiceToggle}
              isVoiceEnabled={isVoiceMode}
              placeholder="Ask about nutrition, meal planning, or macros..."
            />
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
  },
  voiceLoggerContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  voiceLogger: {
    marginBottom: 0,
  },
  foodLogsContainer: {
    flex: 1,
    paddingHorizontal: 20,
    maxHeight: 300,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: AppColors.textPrimary,
    marginBottom: 12,
  },
  chatSection: {
    backgroundColor: AppColors.backgroundSecondary,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 16,
    paddingBottom: 130,
    marginTop: 16,
  },
});