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
import { Send, Mic, Camera, Image as ImageIcon, MicIcon } from 'lucide-react-native';

import LiquidGlassCard from '@/components/LiquidGlassCard';
import GlassButton from '@/components/GlassButton';
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
    text: "Hi! I'm your nutrition coach. I'm here to help you track your meals, get personalized recommendations, and answer any nutrition questions you have. How can I assist you today?",
    isUser: false,
    timestamp: new Date(Date.now() - 30000),
  },
];

const quickReplies: QuickReply[] = [
  { id: '1', text: 'Log breakfast', action: 'log_meal' },
  { id: '2', text: 'Show today\'s macros', action: 'show_macros' },
  { id: '3', text: 'Meal recommendations', action: 'meal_suggestions' },
  { id: '4', text: 'Water intake', action: 'water_log' },
];

export default function NutritionScreen() {
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
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
    
    if (lowerMessage.includes('breakfast') || lowerMessage.includes('log')) {
      return "Great! Let's log your breakfast. What did you have? You can describe your meal or take a photo and I'll help identify the foods and estimate calories.";
    } else if (lowerMessage.includes('macro') || lowerMessage.includes('nutrition')) {
      return "Here's your nutrition summary for today:\n\n• Calories: 1,850 / 2,200\n• Protein: 120g / 150g\n• Carbs: 180g / 220g\n• Fats: 65g / 85g\n\nYou're doing well! Try to add more protein to reach your daily goal.";
    } else if (lowerMessage.includes('recommend') || lowerMessage.includes('suggest')) {
      return "Based on your goals and current intake, I recommend:\n\n🥗 Grilled chicken salad with quinoa\n🍳 Greek yogurt with berries and nuts\n🐟 Salmon with roasted vegetables\n\nWould you like the recipe for any of these?";
    } else if (lowerMessage.includes('water')) {
      return "Staying hydrated is crucial! You've had 6 glasses today - aim for 8-10. Set reminders throughout the day to drink water regularly.";
    } else {
      return "I understand you're asking about nutrition. I can help you track meals, analyze your macros, suggest healthy recipes, and answer nutrition questions. What specific area would you like to focus on?";
    }
  };

  const handleQuickReply = (reply: QuickReply) => {
    sendMessage(reply.text);
  };

  const toggleVoiceMode = () => {
    setIsVoiceMode(!isVoiceMode);
    // Voice mode logic will be implemented later
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
      <LiquidGlassCard
        style={[
          styles.messageBubble,
          message.isUser ? styles.userBubble : styles.botBubble,
        ]}
        tint={message.isUser ? 'dark' : 'light'}
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
      </LiquidGlassCard>
    </View>
  );

  const renderTypingIndicator = () => (
    <View style={[styles.messageContainer, styles.botMessage]}>
      <LiquidGlassCard style={[styles.messageBubble, styles.botBubble]}>
        <View style={styles.typingContainer}>
          <View style={styles.typingDot} />
          <View style={styles.typingDot} />
          <View style={styles.typingDot} />
        </View>
      </LiquidGlassCard>
    </View>
  );

  return (
    <LinearGradient colors={Gradients.background} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.coachInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>🥗</Text>
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
          {/* Messages */}
          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesContainer}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
          >
            {messages.map(renderMessage)}
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
            <LiquidGlassCard style={styles.inputCard}>
              <View style={styles.inputRow}>
                <TouchableOpacity style={styles.attachButton}>
                  <Camera size={20} color={AppColors.textSecondary} />
                </TouchableOpacity>
                
                <TextInput
                  style={styles.textInput}
                  value={inputText}
                  onChangeText={setInputText}
                  placeholder="Ask about nutrition, log meals..."
                  placeholderTextColor={AppColors.textSecondary}
                  multiline
                  maxLength={500}
                />
                
                <TouchableOpacity style={styles.voiceButton}>
                  <Mic size={20} color={AppColors.textSecondary} />
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
                    size={20} 
                    color={inputText.trim() ? AppColors.primary : AppColors.textSecondary} 
                  />
                </TouchableOpacity>
              </View>
            </LiquidGlassCard>
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
  avatarText: {
    fontSize: 20,
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
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingVertical: 16,
    paddingBottom: 20,
  },
  messageContainer: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  botMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    minWidth: 60,
  },
  userBubble: {
    backgroundColor: 'rgba(0, 122, 255, 0.2)',
  },
  botBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
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
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: AppColors.textSecondary,
    marginHorizontal: 2,
    opacity: 0.6,
  },
  quickRepliesContainer: {
    maxHeight: 50,
    marginBottom: 16,
  },
  quickRepliesContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  quickReplyButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  quickReplyText: {
    fontSize: 12,
    color: AppColors.textSecondary,
    fontWeight: '500',
  },
  inputContainer: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  inputCard: {
    paddingVertical: 4,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  attachButton: {
    padding: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: AppColors.textPrimary,
    maxHeight: 100,
    paddingVertical: 8,
    paddingHorizontal: 0,
  },
  voiceButton: {
    padding: 8,
  },
  sendButton: {
    padding: 8,
  },
  sendButtonActive: {
    backgroundColor: 'rgba(0, 122, 255, 0.2)',
    borderRadius: 16,
  },
});