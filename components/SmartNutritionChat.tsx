import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Utensils, Send, Mic, List } from 'lucide-react-native';
import { AppColors, Gradients } from '@/styles/colors';
import FoodLogsList from './FoodLogsList'; // We will create this next
import VoiceFoodLogger from './VoiceFoodLogger';
import groqService from '@/lib/groqService';
import { userProfileService } from '@/lib/supabase';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
}

export default function SmartNutritionChat() {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: "Hi there! I'm your smart nutrition assistant. You can tell me what you ate, or type it in.", sender: 'bot' },
  ]);
  const [inputText, setInputText] = useState('');
  const [showFoodLogs, setShowFoodLogs] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const flatListRef = useRef<FlatList>(null);

  React.useEffect(() => {
    // Load user profile for context
    userProfileService.getProfile().then(profile => setUserProfile(profile));
  }, []);

  const handleSend = async () => {
    if (inputText.trim() === '') return;
    const userMessage: Message = {
      id: (messages.length + 1).toString(),
      text: inputText,
      sender: 'user',
    };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsProcessing(true);
    try {
      const aiResponse = await groqService.generateNutritionResponse({
        message: userMessage.text,
        conversationHistory: messages.map(m => ({
          role: m.sender === 'user' ? 'user' : 'assistant',
          content: m.text,
        })),
        userProfile,
      });
      if (aiResponse) {
        setMessages(prev => [
          ...prev,
          { id: (prev.length + 1).toString(), text: aiResponse, sender: 'bot' }
        ]);
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { id: (prev.length + 1).toString(), text: 'Sorry, I had trouble responding. Please try again.', sender: 'bot' }
      ]);
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleFoodLogged = (foodName: string) => {
    const successMessage: Message = {
      id: (messages.length + 1).toString(),
      text: `Successfully logged: ${foodName}! Great job!`,
      sender: 'bot'
    };
    setMessages(prev => [...prev, successMessage]);
  }

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[styles.messageContainer, item.sender === 'user' ? styles.userMessage : styles.botMessage]}>
      <Text style={styles.messageText}>{item.text}</Text>
    </View>
  );

  return (
    <LinearGradient colors={Gradients.background} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Utensils color={AppColors.primary} size={24} />
          <Text style={styles.headerTitle}>Nutrition Chat</Text>
          <TouchableOpacity onPress={() => setShowFoodLogs(true)} style={styles.headerButton}>
            <List color={AppColors.textSecondary} size={24} />
          </TouchableOpacity>
        </View>

        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={100}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={inputText}
              onChangeText={setInputText}
              placeholder="e.g., '1 apple and a glass of milk'"
              placeholderTextColor={AppColors.textTertiary}
            />
            <View style={styles.inputActions}>
              {inputText.length === 0 && (
                <VoiceFoodLogger 
                  onFoodLogged={handleFoodLogged} 
                  isProcessing={isProcessing}
                  setIsProcessing={setIsProcessing}
                />
              )}
              {inputText.length > 0 && (
                <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
                  <Send color={AppColors.primary} size={22} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </KeyboardAvoidingView>

        <FoodLogsList
          visible={showFoodLogs}
          onClose={() => setShowFoodLogs(false)}
        />
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    safeArea: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: AppColors.border,
        backgroundColor: 'rgba(0,0,0,0.2)',
    },
    headerTitle: {
        flex: 1,
        textAlign: 'center',
        fontSize: 18,
        fontWeight: '600',
        color: AppColors.textPrimary,
        marginLeft: 10,
    },
    headerButton: { padding: 4 },
    messageList: { padding: 16 },
    messageContainer: {
        padding: 12,
        borderRadius: 18,
        maxWidth: '80%',
        marginBottom: 12,
    },
    userMessage: {
        backgroundColor: AppColors.primary,
        alignSelf: 'flex-end',
    },
    botMessage: {
        backgroundColor: AppColors.backgroundSecondary,
        alignSelf: 'flex-start',
    },
    messageText: {
        fontSize: 16,
        color: AppColors.textPrimary,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        borderTopWidth: 1,
        borderTopColor: AppColors.border,
        backgroundColor: AppColors.background,
    },
    input: {
        flex: 1,
        height: 44,
        backgroundColor: AppColors.backgroundSecondary,
        borderRadius: 22,
        paddingHorizontal: 18,
        paddingRight: 50,
        fontSize: 16,
        color: AppColors.textPrimary,
    },
    inputActions: {
      position: 'absolute',
      right: 10,
      height: '100%',
      justifyContent: 'center',
    },
    sendButton: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
});