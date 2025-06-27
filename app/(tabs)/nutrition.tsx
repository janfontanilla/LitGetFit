import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Send, Mic, Camera, Image as ImageIcon, Mic as MicIcon, Utensils } from 'lucide-react-native';

import LiquidGlassCard from '@/components/LiquidGlassCard';
import GlassButton from '@/components/GlassButton';
import VoiceFoodLogger from '@/components/VoiceFoodLogger';
import FoodLogsList from '@/components/FoodLogsList';
import { AppColors, Gradients } from '@/styles/colors';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  type?: 'text' | 'suggestion';
}

interface QuickReply {
  id: string;
  text: string;
  action: string;
}

const mockMessages: Message[] = [
  {
    id: '1',
    text: "Hi! I'm your nutrition coach. I'm here to help you track your meals, get personalized recommendations, and answer any nutrition questions you have. Try using the voice logger below to quickly log your meals!",
    isUser: false,
    timestamp: new Date(Date.now() - 30000),
  },
];

const quickReplies: QuickReply[] = [
  { id: '1', text: 'Show today\'s macros', action: 'show_macros' },
  { id: '2', text: 'Meal recommendations', action: 'meal_suggestions' },
  { id: '3', text: 'Water intake', action: 'water_log' },
  { id: '4', text: 'Nutrition tips', action: 'nutrition_tips' },
];

export default function NutritionScreen() {
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [todaysLogs, setTodaysLogs] = useState<any[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: generateBotResponse(text),
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const generateBotResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('macro') || lowerMessage.includes('nutrition')) {
      const totalCalories = todaysLogs.reduce((sum, log) => sum + (log.calories || 0), 0);
      return `Here's your nutrition summary for today:\n\n• Calories: ${totalCalories} / 2,200\n• Protein: 120g / 150g\n• Carbs: 180g / 220g\n• Fats: 65g / 85g\n\nYou're doing well! Try to add more protein to reach your daily goal.`;
    } else if (lowerMessage.includes('recommend') || lowerMessage.includes('suggest')) {
      return "Based on your goals and current intake, I recommend:\n\n🥗 Grilled chicken salad with quinoa\n🍳 Greek yogurt with berries and nuts\n🐟 Salmon with roasted vegetables\n\nWould you like the recipe for any of these?";
    } else if (lowerMessage.includes('water')) {
      return "Staying hydrated is crucial! You've had 6 glasses today - aim for 8-10. Set reminders throughout the day to drink water regularly.";
    } else if (lowerMessage.includes('tip')) {
      return "Here are some quick nutrition tips:\n\n• Eat protein with every meal\n• Fill half your plate with vegetables\n• Stay hydrated throughout the day\n• Plan your meals in advance\n• Listen to your hunger cues";
    } else {
      return "I understand you're asking about nutrition. I can help you track meals, analyze your macros, suggest healthy recipes, and answer nutrition questions. What specific area would you like to focus on?";
    }
  };

  const handleQuickReply = (reply: QuickReply) => {
    sendMessage(reply.text);
  };

  const handleFoodLogged = (foodLog: any) => {
    setRefreshTrigger(prev => prev + 1);
    
    // Add a success message to the chat
    const successMessage: Message = {
      id: Date.now().toString(),
      text: `Great! I've logged "${foodLog.quantity} ${foodLog.food_name}" for ${foodLog.meal_type}. ${foodLog.calories ? `That's approximately ${foodLog.calories} calories.` : ''} Keep up the good tracking!`,
      isUser: false,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, successMessage]);
  };

  const handleLogsChange = (logs: any[]) => {
    setTodaysLogs(logs);
  };

  const toggleVoiceMode = () => {
    setIsVoiceMode(!isVoiceMode);
    console.log('Voice mode toggled:', !isVoiceMode);
  };

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const renderMessage = (message: Message) => (
    <View
      key={message.id}
      style={[
        styles.messageContainer,
        message.isUser ? styles.userMessage : styles.botMessage,
      ]}
    >
      <View
        style={[
          styles.messageBubble,
          message.isUser ? styles.userBubble : styles.botBubble,
        ]}
      >
        <Text style={[
          styles.messageText,
          message.isUser ? styles.userMessageText : styles.botMessageText,
        ]}>
          {message.text}
        </Text>
        <Text style={[
          styles.timestamp,
          message.isUser ? styles.userTimestamp : styles.botTimestamp,
        ]}>
          {message.timestamp.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </Text>
      </View>
    </View>
  );

  const renderTypingIndicator = () => (
    <View style={[styles.messageContainer, styles.botMessage]}>
      <View style={[styles.messageBubble, styles.botBubble]}>
        <View style={styles.typingContainer}>
          <View style={styles.typingDot} />
          <View style={styles.typingDot} />
          <View style={styles.typingDot} />
        </View>
      </View>
    </View>
  );

  return (
    <LinearGradient colors={Gradients.background} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.coachInfo}>
            <View style={styles.avatar}>
              <Utensils size={20} color={AppColors.primary} />
            </View>
            <View style={styles.coachDetails}>
              <Text style={styles.coachName}>Nutrition Coach</Text>
              <Text style={styles.coachStatus}>Online • Ready to help</Text>
            </View>
          </View>
          
          {/* Voice Mode Button */}
          <TouchableOpacity
            style={[
              styles.voiceModeButton,
              isVoiceMode && styles.voiceModeButtonActive,
            ]}
            onPress={toggleVoiceMode}
          >
            <MicIcon 
              size={20} 
              color={isVoiceMode ? AppColors.textPrimary : AppColors.textSecondary} 
            />
            <Text style={[
              styles.voiceModeText,
              isVoiceMode && styles.voiceModeTextActive,
            ]}>
              Voice
            </Text>
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView 
          style={styles.keyboardContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {/* Voice Food Logger */}
          <View style={styles.voiceLoggerContainer}>
            <VoiceFoodLogger 
              onFoodLogged={handleFoodLogged}
              style={styles.voiceLogger}
            />
          </View>

          {/* Food Logs List */}
          <View style={styles.foodLogsContainer}>
            <FoodLogsList 
              refreshTrigger={refreshTrigger}
              onLogsChange={handleLogsChange}
            />
          </View>

          {/* Compact Chat Section */}
          <View style={styles.chatSection}>
            <Text style={styles.chatTitle}>Quick Nutrition Help</Text>
            
            {/* Messages */}
            <ScrollView
              ref={scrollViewRef}
              style={styles.messagesContainer}
              contentContainerStyle={styles.messagesContent}
              showsVerticalScrollIndicator={false}
            >
              {messages.slice(-2).map(renderMessage)} {/* Only show last 2 messages */}
              {isTyping && renderTypingIndicator()}
            </ScrollView>

            {/* Quick Replies */}
            {!isTyping && (
              <ScrollView
                horizontal
                style={styles.quickRepliesContainer}
                contentContainerStyle={styles.quickRepliesContent}
                showsHorizontalScrollIndicator={false}
              >
                {quickReplies.map((reply) => (
                  <TouchableOpacity
                    key={reply.id}
                    style={styles.quickReplyButton}
                    onPress={() => handleQuickReply(reply)}
                  >
                    <Text style={styles.quickReplyText}>{reply.text}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            {/* Input Area */}
            <View style={styles.inputContainer}>
              <View style={styles.inputCard}>
                <View style={styles.inputRow}>
                  <TouchableOpacity style={styles.attachButton}>
                    <Camera size={18} color={AppColors.textSecondary} />
                  </TouchableOpacity>
                  
                  <TextInput
                    style={styles.textInput}
                    value={inputText}
                    onChangeText={setInputText}
                    placeholder="Ask about nutrition, get meal tips..."
                    placeholderTextColor={AppColors.textSecondary}
                    multiline
                    maxLength={500}
                  />
                  
                  <TouchableOpacity style={styles.voiceButton}>
                    <Mic size={18} color={AppColors.textSecondary} />
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.sendButton,
                      inputText.trim() && styles.sendButtonActive,
                    ]}
                    onPress={() => sendMessage(inputText)}
                    disabled={!inputText.trim()}
                  >
                    <Send 
                      size={18} 
                      color={inputText.trim() ? AppColors.primary : AppColors.textSecondary} 
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  coachInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  coachDetails: {
    flex: 1,
  },
  coachName: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.textPrimary,
  },
  coachStatus: {
    fontSize: 12,
    color: AppColors.success,
    marginTop: 2,
  },
  voiceModeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    gap: 6,
  },
  voiceModeButtonActive: {
    backgroundColor: AppColors.primary,
  },
  voiceModeText: {
    fontSize: 12,
    fontWeight: '600',
    color: AppColors.textSecondary,
  },
  voiceModeTextActive: {
    color: AppColors.textPrimary,
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
  chatSection: {
    backgroundColor: AppColors.backgroundSecondary,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 16,
    paddingBottom: 130,
    marginTop: 16,
  },
  chatTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.textPrimary,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  messagesContainer: {
    maxHeight: 120,
    paddingHorizontal: 20,
  },
  messagesContent: {
    paddingVertical: 8,
  },
  messageContainer: {
    marginBottom: 8,
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  botMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '85%',
    minWidth: 60,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: AppColors.primary,
  },
  botBubble: {
    backgroundColor: AppColors.backgroundTertiary,
  },
  messageText: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 2,
  },
  userMessageText: {
    color: AppColors.textPrimary,
  },
  botMessageText: {
    color: AppColors.textPrimary,
  },
  timestamp: {
    fontSize: 9,
    opacity: 0.7,
  },
  userTimestamp: {
    color: AppColors.textSecondary,
    textAlign: 'right',
  },
  botTimestamp: {
    color: AppColors.textSecondary,
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: AppColors.textSecondary,
    marginHorizontal: 1,
    opacity: 0.6,
  },
  quickRepliesContainer: {
    maxHeight: 40,
    marginVertical: 12,
  },
  quickRepliesContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  quickReplyButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: AppColors.backgroundTertiary,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  quickReplyText: {
    fontSize: 11,
    color: AppColors.textSecondary,
    fontWeight: '500',
  },
  inputContainer: {
    paddingHorizontal: 20,
  },
  inputCard: {
    backgroundColor: AppColors.backgroundTertiary,
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 4,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  attachButton: {
    padding: 6,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: AppColors.textPrimary,
    maxHeight: 80,
    paddingVertical: 6,
    paddingHorizontal: 0,
  },
  voiceButton: {
    padding: 6,
  },
  sendButton: {
    padding: 6,
  },
  sendButtonActive: {
    backgroundColor: 'rgba(0, 122, 255, 0.2)',
    borderRadius: 12,
  },
});