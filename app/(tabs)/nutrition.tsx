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
import { Send, Mic as MicIcon, Utensils } from 'lucide-react-native';

import VoiceFoodLogger from '@/components/VoiceFoodLogger';
import FoodLogsList from '@/components/FoodLogsList';
import { AppColors, Gradients } from '@/styles/colors';

// A simple mock until the new chat is implemented
const mockMessages = [
  { id: '1', text: "I'm ready to help with your nutrition!", isUser: false },
];

export default function NutritionScreen() {
  const [messages, setMessages] = useState(mockMessages);
  const [inputText, setInputText] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleFoodLogged = () => {
    setRefreshTrigger(prev => prev + 1);
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
                <Utensils size={20} color={AppColors.primary} />
              </View>
              <View>
                <Text style={styles.coachName}>Nutrition Coach</Text>
                <Text style={styles.coachStatus}>Online</Text>
              </View>
            </View>
          </View>

          <View style={styles.voiceLoggerContainer}>
            <VoiceFoodLogger onFoodLogged={handleFoodLogged} />
          </View>

          <View style={styles.foodLogsContainer}>
            <Text style={styles.sectionTitle}>Today's Food Log</Text>
            <FoodLogsList refreshTrigger={refreshTrigger} />
          </View>

          <View style={styles.chatSection}>
            <ScrollView style={styles.messagesContainer}>
              {messages.map(msg => (
                <Text key={msg.id} style={msg.isUser ? styles.userMessage : styles.botMessage}>
                  {msg.text}
                </Text>
              ))}
            </ScrollView>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                value={inputText}
                onChangeText={setInputText}
                placeholder="Ask your nutrition questions..."
                placeholderTextColor={AppColors.textSecondary}
              />
              <TouchableOpacity>
                <Send size={24} color={AppColors.primary} />
              </TouchableOpacity>
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
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border,
  },
  coachInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: AppColors.backgroundTertiary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  coachName: {
    color: AppColors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  coachStatus: {
    color: AppColors.success,
    fontSize: 12,
  },
  voiceLoggerContainer: {
    padding: 20,
  },
  foodLogsContainer: {
    paddingHorizontal: 20,
    flex: 1,
  },
  sectionTitle: {
    color: AppColors.textPrimary,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  chatSection: {
    backgroundColor: AppColors.backgroundSecondary,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 130
  },
  messagesContainer: {
    height: 100,
    marginBottom: 10,
  },
  userMessage: {
    color: AppColors.textPrimary,
    textAlign: 'right',
    marginBottom: 8,
  },
  botMessage: {
    color: AppColors.textPrimary,
    textAlign: 'left',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.backgroundTertiary,
    borderRadius: 24,
    paddingHorizontal: 16,
  },
  textInput: {
    flex: 1,
    color: AppColors.textPrimary,
    height: 48,
  },
});