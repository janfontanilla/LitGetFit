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
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Send, Utensils, Sparkles } from 'lucide-react-native';

import VoiceFoodLogger from '@/components/VoiceFoodLogger';
import FoodLogsList from '@/components/FoodLogsList';
import { AppColors, Gradients } from '@/styles/colors';
import groqService from '@/lib/groqService';
import { userProfileService } from '@/lib/supabase';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
}

const { height } = Dimensions.get('window');

export default function NutritionScreen() {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: "I'm ready to help with your nutrition!", isUser: false },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [userProfile, setUserProfile] = useState<any>(null);
  const chatScrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      // Assuming a single user profile for now
      const profiles = await userProfileService.getAllProfiles();
      if (profiles.length > 0) {
        setUserProfile(profiles[0]);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };
  
  const handleFoodLogged = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = { id: Date.now().toString(), text: inputText, isUser: true };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await groqService.generateNutritionResponse({
        message: userMessage.text,
        conversationHistory: messages.map(m => ({ role: m.isUser ? 'user' : 'assistant', content: m.text })),
        userProfile,
      });

      if (response) {
        const botMessage: Message = { id: (Date.now() + 1).toString(), text: response, isUser: false };
        setMessages(prev => [...prev, botMessage]);
      } else {
        throw new Error('No response from AI');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I couldn\'t connect to the AI. Please try again.',
        isUser: false,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      chatScrollViewRef.current?.scrollToEnd({ animated: true });
    }
  };

  return (
    <LinearGradient colors={Gradients.background} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.keyboardContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.header}>
            <View style={styles.coachInfo}>
              <View style={styles.avatar}>
                <Sparkles size={20} color={AppColors.primary} />
              </View>
              <View>
                <Text style={styles.coachName}>Nutrition AI</Text>
                <Text style={styles.coachStatus}>Online</Text>
              </View>
            </View>
          </View>
          
          <ScrollView contentContainerStyle={{ paddingBottom: 130 }}>
            <View style={styles.voiceLoggerContainer}>
              <VoiceFoodLogger onFoodLogged={handleFoodLogged} />
            </View>

            <View style={styles.foodLogsContainer}>
              <Text style={styles.sectionTitle}>Today's Food Log</Text>
              <FoodLogsList refreshTrigger={refreshTrigger} />
            </View>
          </ScrollView>

          <View style={styles.chatSection}>
            <ScrollView ref={chatScrollViewRef} style={styles.messagesContainer}>
              {messages.map(msg => (
                <View key={msg.id} style={[styles.messageBubble, msg.isUser ? styles.userBubble : styles.botBubble]}>
                  <Text style={styles.messageText}>{msg.text}</Text>
                </View>
              ))}
              {isLoading && (
                <View style={[styles.messageBubble, styles.botBubble]}>
                  <ActivityIndicator color={AppColors.primary} />
                </View>
              )}
            </ScrollView>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                value={inputText}
                onChangeText={setInputText}
                placeholder="Ask your nutrition questions..."
                placeholderTextColor={AppColors.textSecondary}
              />
              <TouchableOpacity onPress={handleSend} disabled={isLoading}>
                <Send size={24} color={isLoading ? AppColors.textSecondary : AppColors.primary} />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  keyboardContainer: { flex: 1 },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border,
  },
  coachInfo: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: AppColors.backgroundTertiary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  coachName: { color: AppColors.textPrimary, fontSize: 16, fontWeight: '600' },
  coachStatus: { color: AppColors.success, fontSize: 12 },
  voiceLoggerContainer: { padding: 20 },
  foodLogsContainer: { paddingHorizontal: 20, paddingBottom: 20 },
  sectionTitle: {
    color: AppColors.textPrimary,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  chatSection: {
    position: 'absolute',
    bottom: 85,
    left: 0,
    right: 0,
    backgroundColor: AppColors.backgroundSecondary,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: height * 0.5,
  },
  messagesContainer: { flexGrow: 0 },
  messageBubble: {
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
    maxWidth: '80%',
  },
  userBubble: {
    backgroundColor: AppColors.primary,
    alignSelf: 'flex-end',
  },
  botBubble: {
    backgroundColor: AppColors.backgroundTertiary,
    alignSelf: 'flex-start',
  },
  messageText: { color: AppColors.textPrimary },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.backgroundTertiary,
    borderRadius: 24,
    paddingHorizontal: 16,
    marginTop: 10,
  },
  textInput: {
    flex: 1,
    color: AppColors.textPrimary,
    height: 48,
  },
});