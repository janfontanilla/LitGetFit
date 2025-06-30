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
import { Send, Mic, Camera, Bot, Utensils, MessageSquare, Sparkles } from 'lucide-react-native';

import LiquidGlassCard from '@/components/LiquidGlassCard';
import EnhancedFoodLogger from '@/components/EnhancedFoodLogger';
import FoodLogsList from '@/components/FoodLogsList';
import WelcomeMessage from '@/components/WelcomeMessage';
import { AppColors, Gradients } from '@/styles/colors';
import groqService from '@/lib/groqService';
import { userProfileService } from '@/lib/supabase';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  isLoading?: boolean;
}

interface QuickReply {
  id: string;
  text: string;
}

export default function NutritionScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [todaysLogs, setTodaysLogs] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [conversationHistory, setConversationHistory] = useState<any[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);
  const chatScrollViewRef = useRef<ScrollView>(null);

  const quickReplies: QuickReply[] = [
    { id: '1', text: 'What should I eat before a workout?' },
    { id: '2', text: 'How much protein do I need daily?' },
    { id: '3', text: 'Best foods for muscle recovery?' },
    { id: '4', text: 'Healthy snack ideas?' },
  ];

  useEffect(() => {
    loadUserProfile();
    
    // Initialize with welcome message
    if (messages.length === 0) {
      setMessages([
        {
          id: '1',
          text: "Hi! I'm your nutrition coach. I can help you track meals, get personalized recommendations, and answer any nutrition questions you have. Try using the food logger above to quickly log your meals!",
          isUser: false,
          timestamp: new Date(),
        },
      ]);
    }
  }, []);

  useEffect(() => {
    chatScrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const loadUserProfile = async () => {
    try {
      const profiles = await userProfileService.getAllProfiles();
      if (profiles.length > 0) {
        setUserProfile(profiles[0]);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
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

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    // Add loading message
    const loadingMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: '',
      isUser: false,
      timestamp: new Date(),
      isLoading: true,
    };
    setMessages(prev => [...prev, loadingMessage]);

    // Update conversation history for context
    const updatedHistory = [
      ...conversationHistory,
      { role: 'user', content: text.trim() }
    ];
    setConversationHistory(updatedHistory);

    try {
      // Generate response using Groq
      const response = await groqService.generateNutritionResponse({
        message: text.trim(),
        conversationHistory: updatedHistory,
        userProfile,
      });
      
      // Remove loading message and add actual response
      setMessages(prev => {
        const filtered = prev.filter(msg => !msg.isLoading);
        return [
          ...filtered,
          {
            id: (Date.now() + 2).toString(),
            text: response || "I'm sorry, I couldn't process your question right now. Please try again.",
            isUser: false,
            timestamp: new Date(),
          },
        ];
      });

      // Update conversation history with assistant's response
      setConversationHistory([
        ...updatedHistory,
        { role: 'assistant', content: response }
      ]);

    } catch (error) {
      console.error('Error getting nutrition advice:', error);
      setMessages(prev => {
        const filtered = prev.filter(msg => !msg.isLoading);
        return [
          ...filtered,
          {
            id: (Date.now() + 2).toString(),
            text: "I'm experiencing some technical difficulties. Please try again in a moment.",
            isUser: false,
            timestamp: new Date(),
          },
        ];
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickReply = (reply: QuickReply) => {
    sendMessage(reply.text);
  };

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
        {message.isLoading ? (
          <View style={styles.typingContainer}>
            <View style={styles.typingDot} />
            <View style={styles.typingDot} />
            <View style={styles.typingDot} />
          </View>
        ) : (
          <Text style={[
            styles.messageText,
            message.isUser ? styles.userMessageText : styles.botMessageText,
          ]}>
            {message.text}
          </Text>
        )}
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

  return (
    <LinearGradient colors={Gradients.background} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Sparkles size={28} color={AppColors.primary} />
            <Text style={styles.title}>Smart Nutrition</Text>
          </View>
        </View>

        <KeyboardAvoidingView 
          style={styles.keyboardContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {/* Main Content */}
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            ref={scrollViewRef}
          >
            {/* Welcome Message */}
            <WelcomeMessage />
            
            {/* Daily Summary */}
            <LiquidGlassCard style={styles.summaryCard}>
              <View style={styles.summaryHeader}>
                <Utensils size={24} color={AppColors.primary} />
                <Text style={styles.summaryTitle}>Today's Nutrition</Text>
              </View>
              
              <View style={styles.summaryStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>
                    {todaysLogs.reduce((sum, log) => sum + (log.calories || 0), 0)}
                  </Text>
                  <Text style={styles.statLabel}>Calories</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>
                    {Math.round(todaysLogs.reduce((sum, log) => sum + (log.protein || 0), 0))}
                  </Text>
                  <Text style={styles.statLabel}>Protein (g)</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{todaysLogs.length}</Text>
                  <Text style={styles.statLabel}>Items Logged</Text>
                </View>
              </View>

              {/* Progress Bar */}
              <View style={styles.progressContainer}>
                <Text style={styles.progressLabel}>Daily Goal Progress</Text>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { width: `${Math.min((todaysLogs.reduce((sum, log) => sum + (log.calories || 0), 0) / 2200) * 100, 100)}%` }
                    ]} 
                  />
                </View>
                <Text style={styles.progressText}>
                  {todaysLogs.reduce((sum, log) => sum + (log.calories || 0), 0)} / 2,200 calories
                </Text>
              </View>
            </LiquidGlassCard>

            {/* Enhanced Food Logger */}
            <View style={styles.loggerContainer}>
              <EnhancedFoodLogger 
                onFoodLogged={handleFoodLogged}
              />
            </View>

            {/* Food Logs List */}
            <View style={styles.logsContainer}>
              <FoodLogsList 
                refreshTrigger={refreshTrigger}
                onLogsChange={handleLogsChange}
              />
            </View>

            {/* Chat Section */}
            <View style={styles.chatSection}>
              <LiquidGlassCard style={styles.chatCard}>
                <View style={styles.chatHeader}>
                  <MessageSquare size={20} color={AppColors.primary} />
                  <Text style={styles.chatTitle}>Nutrition AI Chat</Text>
                </View>
                
                {/* Chat Messages */}
                <ScrollView
                  ref={chatScrollViewRef}
                  style={styles.messagesContainer}
                  contentContainerStyle={styles.messagesContent}
                  showsVerticalScrollIndicator={false}
                >
                  {messages.map(renderMessage)}
                </ScrollView>

                {/* Quick Replies */}
                {!isLoading && (
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
                      <TextInput
                        style={styles.textInput}
                        value={inputText}
                        onChangeText={setInputText}
                        placeholder="Ask about nutrition, get meal tips..."
                        placeholderTextColor={AppColors.textSecondary}
                        multiline
                        maxLength={500}
                      />
                      
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
              </LiquidGlassCard>
            </View>
          </ScrollView>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: AppColors.textPrimary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 130,
  },
  summaryCard: {
    margin: 20,
    marginBottom: 16,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: AppColors.textPrimary,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: AppColors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: AppColors.textSecondary,
    fontWeight: '600',
  },
  progressContainer: {
    marginTop: 16,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.textPrimary,
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: AppColors.backgroundSecondary,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: AppColors.success,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: AppColors.textSecondary,
    textAlign: 'center',
  },
  loggerContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  logsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  chatSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  chatCard: {
    padding: 0,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border,
  },
  chatTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.textPrimary,
  },
  messagesContainer: {
    maxHeight: 300,
    padding: 16,
  },
  messagesContent: {
    paddingBottom: 8,
  },
  messageContainer: {
    marginBottom: 16,
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: AppColors.primary,
    borderBottomRightRadius: 4,
  },
  botBubble: {
    backgroundColor: AppColors.backgroundSecondary,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  userMessageText: {
    color: AppColors.textPrimary,
  },
  botMessageText: {
    color: AppColors.textPrimary,
  },
  timestamp: {
    fontSize: 10,
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
    paddingVertical: 8,
    gap: 4,
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: AppColors.textSecondary,
    opacity: 0.6,
    marginHorizontal: 1,
  },
  quickRepliesContainer: {
    maxHeight: 40,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  quickRepliesContent: {
    gap: 8,
  },
  quickReplyButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: AppColors.backgroundTertiary,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  quickReplyText: {
    fontSize: 12,
    color: AppColors.textSecondary,
    fontWeight: '500',
  },
  inputContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: AppColors.border,
  },
  inputCard: {
    backgroundColor: AppColors.backgroundSecondary,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: AppColors.textPrimary,
    maxHeight: 80,
    paddingVertical: 8,
  },
  sendButton: {
    padding: 8,
    borderRadius: 16,
  },
  sendButtonActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
  },
});