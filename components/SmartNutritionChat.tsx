import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Send, Bot, User, Loader as Loader2 } from 'lucide-react-native';
import { AppColors } from '@/styles/colors';
import LiquidGlassCard from './LiquidGlassCard';
import WelcomeMessage from './WelcomeMessage';
import { userProfileService } from '@/lib/supabase';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  isLoading?: boolean;
}

interface SmartNutritionChatProps {
  userProfile?: any;
  style?: any;
}

const quickQuestions = [
  "What should I eat before a workout?",
  "How much protein do I need daily?",
  "Best foods for muscle recovery?",
  "Healthy snack ideas?",
  "How to stay hydrated?",
  "Meal prep tips for the week?",
];

export default function SmartNutritionChat({ userProfile, style }: SmartNutritionChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState(Date.now().toString());
  const [userProfileData, setUserProfileData] = useState<any>(userProfile);
  const [conversationHistory, setConversationHistory] = useState<any[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (!userProfileData) {
      loadUserProfile();
    }
    
    // Initialize with welcome message
    if (messages.length === 0) {
      setMessages([
        {
          id: '1',
          text: `Hi! I'm your AI nutrition coach. I can help you with meal planning, nutrition questions, and dietary advice tailored to your fitness goals. What would you like to know?`,
          isUser: false,
          timestamp: new Date(),
        },
      ]);
    }
  }, []);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const loadUserProfile = async () => {
    try {
      const profiles = await userProfileService.getAllProfiles();
      if (profiles.length > 0) {
        setUserProfileData(profiles[0]);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
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
      // Call the API endpoint
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: text.trim(),
          conversationId,
          conversationHistory: updatedHistory,
          userId: userProfileData?.id,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Remove loading message and add actual response
      setMessages(prev => {
        const filtered = prev.filter(msg => !msg.isLoading);
        return [
          ...filtered,
          {
            id: (Date.now() + 2).toString(),
            text: data.response || "I'm sorry, I couldn't process your question right now. Please try again.",
            isUser: false,
            timestamp: new Date(),
          },
        ];
      });

      // Update conversation history with assistant's response
      setConversationHistory([
        ...updatedHistory,
        { role: 'assistant', content: data.response }
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

  const handleQuickQuestion = (question: string) => {
    sendMessage(question);
  };

  const renderMessage = (message: Message) => (
    <View
      key={message.id}
      style={[
        styles.messageContainer,
        message.isUser ? styles.userMessage : styles.botMessage,
      ]}
    >
      <View style={styles.messageHeader}>
        <View style={[
          styles.avatarContainer,
          message.isUser ? styles.userAvatar : styles.botAvatar,
        ]}>
          {message.isUser ? (
            <User size={16} color={AppColors.textPrimary} />
          ) : (
            <Bot size={16} color={AppColors.primary} />
          )}
        </View>
        <Text style={styles.messageTime}>
          {message.timestamp.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </Text>
      </View>
      
      <View style={[
        styles.messageBubble,
        message.isUser ? styles.userBubble : styles.botBubble,
      ]}>
        {message.isLoading ? (
          <View style={styles.loadingContainer}>
            <Loader2 size={16} color={AppColors.primary} />
            <Text style={styles.loadingText}>Thinking...</Text>
          </View>
        ) : (
          <Text style={[
            styles.messageText,
            message.isUser ? styles.userMessageText : styles.botMessageText,
          ]}>
            {message.text}
          </Text>
        )}
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView 
      style={[styles.container, style]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Welcome Message */}
      <WelcomeMessage 
        onPress={() => {
          // Focus on input or show quick questions
        }}
        style={styles.welcomeMessage}
      />
      
      <LiquidGlassCard style={styles.chatCard}>
        {/* Header */}
        <View style={styles.header}>
          <Bot size={24} color={AppColors.primary} />
          <Text style={styles.headerTitle}>Nutrition AI</Text>
          <Text style={styles.headerSubtitle}>Powered by Groq</Text>
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map(renderMessage)}
        </ScrollView>

        {/* Quick Questions */}
        {!isLoading && messages.length <= 2 && (
          <View style={styles.quickQuestionsContainer}>
            <Text style={styles.quickQuestionsTitle}>Quick Questions:</Text>
            <ScrollView
              horizontal
              style={styles.quickQuestions}
              contentContainerStyle={styles.quickQuestionsContent}
              showsHorizontalScrollIndicator={false}
            >
              {quickQuestions.map((question, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.quickQuestionButton}
                  onPress={() => handleQuickQuestion(question)}
                >
                  <Text style={styles.quickQuestionText}>{question}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Input */}
        <View style={styles.inputContainer}>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.textInput}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Ask about nutrition, meal planning, or diet tips..."
              placeholderTextColor={AppColors.textTertiary}
              multiline
              maxLength={500}
              editable={!isLoading}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                (inputText.trim() && !isLoading) && styles.sendButtonActive,
              ]}
              onPress={() => sendMessage(inputText)}
              disabled={!inputText.trim() || isLoading}
            >
              <Send 
                size={18} 
                color={(inputText.trim() && !isLoading) ? AppColors.primary : AppColors.textTertiary} 
              />
            </TouchableOpacity>
          </View>
        </View>
      </LiquidGlassCard>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  welcomeMessage: {
    marginBottom: 16,
  },
  chatCard: {
    flex: 1,
    padding: 0,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: AppColors.textPrimary,
    marginTop: 8,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: AppColors.textSecondary,
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  messagesContent: {
    paddingVertical: 16,
  },
  messageContainer: {
    marginBottom: 16,
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  avatarContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatar: {
    backgroundColor: AppColors.backgroundSecondary,
  },
  botAvatar: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
  },
  messageTime: {
    fontSize: 11,
    color: AppColors.textTertiary,
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  botMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '85%',
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
    fontSize: 15,
    lineHeight: 20,
  },
  userMessageText: {
    color: AppColors.textPrimary,
  },
  botMessageText: {
    color: AppColors.textPrimary,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    color: AppColors.primary,
    fontStyle: 'italic',
  },
  quickQuestionsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: AppColors.border,
  },
  quickQuestionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.textSecondary,
    marginBottom: 12,
  },
  quickQuestions: {
    maxHeight: 40,
  },
  quickQuestionsContent: {
    gap: 8,
    paddingRight: 20,
  },
  quickQuestionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: AppColors.backgroundTertiary,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  quickQuestionText: {
    fontSize: 12,
    color: AppColors.textSecondary,
    fontWeight: '500',
  },
  inputContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: AppColors.border,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: AppColors.backgroundSecondary,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: AppColors.textPrimary,
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendButton: {
    padding: 8,
    borderRadius: 12,
  },
  sendButtonActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
  },
});