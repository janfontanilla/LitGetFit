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
  Alert,
} from 'react-native';
import { Send, Mic, MicOff, RefreshCw, AlertCircle } from 'lucide-react-native';

import LiquidGlassCard from '@/components/LiquidGlassCard';
import { AppColors } from '@/styles/colors';
import { useChatContext, ChatContext } from '@/hooks/useChatContext';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface QuickReply {
  id: string;
  text: string;
  action: string;
}

interface AIChatInterfaceProps {
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  initialContext?: ChatContext;
  quickReplies?: QuickReply[];
  onQuickReply?: (reply: QuickReply) => void;
  onMessageSent?: (message: string) => void;
  onVoiceToggle?: (enabled: boolean) => void;
  isVoiceEnabled?: boolean;
  placeholder?: string;
  style?: any;
}

export default function AIChatInterface({
  title,
  subtitle,
  icon,
  initialContext,
  quickReplies = [],
  onQuickReply,
  onMessageSent,
  onVoiceToggle,
  isVoiceEnabled = false,
  placeholder = "Ask me anything...",
  style,
}: AIChatInterfaceProps) {
  const [inputText, setInputText] = useState('');
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  
  const {
    messages,
    isTyping,
    error,
    sendMessage,
    clearChat,
    clearError,
    initializeGroqService,
  } = useChatContext(initialContext);

  useEffect(() => {
    // Initialize Groq service on component mount
    initializeGroqService();
  }, [initializeGroqService]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    const messageText = text.trim();
    setInputText('');
    
    // Call parent callback if provided
    onMessageSent?.(messageText);
    
    // Send message to AI
    await sendMessage(messageText);
  };

  const handleQuickReply = (reply: QuickReply) => {
    handleSendMessage(reply.text);
    onQuickReply?.(reply);
  };

  const toggleVoiceMode = () => {
    const newVoiceMode = !isVoiceMode;
    setIsVoiceMode(newVoiceMode);
    onVoiceToggle?.(newVoiceMode);
  };

  const handleRetry = () => {
    clearError();
    initializeGroqService();
  };

  const renderMessage = (message: any, index: number) => {
    const isUser = message.role === 'user';
    const timestamp = new Date();
    
    return (
      <View
        key={`${message.role}-${index}`}
        style={[
          styles.messageContainer,
          isUser ? styles.userMessage : styles.botMessage,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            isUser ? styles.userBubble : styles.botBubble,
          ]}
        >
          <Text style={[
            styles.messageText,
            isUser ? styles.userMessageText : styles.botMessageText,
          ]}>
            {message.content}
          </Text>
          <Text style={[
            styles.timestamp,
            isUser ? styles.userTimestamp : styles.botTimestamp,
          ]}>
            {timestamp.toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </Text>
        </View>
      </View>
    );
  };

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

  const renderError = () => (
    <View style={styles.errorContainer}>
      <LiquidGlassCard style={styles.errorCard}>
        <AlertCircle size={20} color={AppColors.accent} style={styles.errorIcon} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
          <RefreshCw size={16} color={AppColors.primary} />
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </LiquidGlassCard>
    </View>
  );

  return (
    <View style={[styles.container, style]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.coachInfo}>
          <View style={styles.avatar}>
            {icon}
          </View>
          <View style={styles.coachDetails}>
            <Text style={styles.coachName}>{title}</Text>
            <Text style={styles.coachStatus}>
              {subtitle || 'Online • Ready to help'}
            </Text>
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
          {isVoiceMode ? (
            <MicOff size={16} color={AppColors.textPrimary} />
          ) : (
            <Mic size={16} color={AppColors.textSecondary} />
          )}
          <Text style={[
            styles.voiceModeText,
            isVoiceMode && styles.voiceModeTextActive,
          ]}>
            Voice
          </Text>
        </TouchableOpacity>
      </View>

      {/* Quick Replies */}
      {quickReplies.length > 0 && (
        <View style={styles.quickRepliesContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickRepliesContent}
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
        </View>
      )}

      {/* Error Display */}
      {error && renderError()}

      {/* Chat Messages */}
      <KeyboardAvoidingView 
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.messagesContent}
        >
          {messages.length === 0 && (
            <View style={styles.welcomeContainer}>
              <LiquidGlassCard style={styles.welcomeCard}>
                <Text style={styles.welcomeText}>
                  Hi! I'm your AI coach. I'm here to help you with your fitness and nutrition goals. Ask me anything!
                </Text>
              </LiquidGlassCard>
            </View>
          )}
          
          {messages.map((message, index) => renderMessage(message, index))}
          {isTyping && renderTypingIndicator()}
        </ScrollView>

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              value={inputText}
              onChangeText={setInputText}
              placeholder={placeholder}
              placeholderTextColor={AppColors.textSecondary}
              multiline
              maxLength={500}
              onSubmitEditing={() => handleSendMessage(inputText)}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                !inputText.trim() && styles.sendButtonDisabled,
              ]}
              onPress={() => handleSendMessage(inputText)}
              disabled={!inputText.trim()}
            >
              <Send 
                size={20} 
                color={inputText.trim() ? AppColors.textPrimary : AppColors.textSecondary} 
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
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
  quickRepliesContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  quickRepliesContent: {
    gap: 8,
  },
  quickReplyButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  quickReplyText: {
    fontSize: 14,
    color: AppColors.textPrimary,
    fontWeight: '500',
  },
  errorContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    borderColor: 'rgba(255, 59, 48, 0.3)',
    borderWidth: 1,
  },
  errorIcon: {
    marginRight: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: AppColors.accent,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    gap: 4,
  },
  retryText: {
    fontSize: 12,
    color: AppColors.primary,
    fontWeight: '600',
  },
  chatContainer: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  welcomeContainer: {
    marginBottom: 20,
  },
  welcomeCard: {
    padding: 16,
  },
  welcomeText: {
    fontSize: 16,
    color: AppColors.textPrimary,
    textAlign: 'center',
    lineHeight: 22,
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
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  userBubble: {
    backgroundColor: AppColors.primary,
    borderBottomRightRadius: 4,
  },
  botBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: AppColors.textPrimary,
  },
  botMessageText: {
    color: AppColors.textPrimary,
  },
  timestamp: {
    fontSize: 11,
    marginTop: 4,
    opacity: 0.7,
  },
  userTimestamp: {
    color: AppColors.textPrimary,
    textAlign: 'right',
  },
  botTimestamp: {
    color: AppColors.textSecondary,
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: AppColors.textSecondary,
    opacity: 0.6,
  },
  inputContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: AppColors.textPrimary,
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: AppColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
}); 