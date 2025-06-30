import { useState, useCallback, useRef } from 'react';
import { ChatMessage, ChatResponse, getGroqService } from '@/lib/groqService';

export interface ChatContext {
  userGoals?: string[];
  experienceLevel?: string;
  currentWorkout?: string;
  nutritionData?: any;
}

export interface ChatState {
  messages: ChatMessage[];
  isTyping: boolean;
  error: string | null;
}

export const useChatContext = (initialContext?: ChatContext) => {
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    isTyping: false,
    error: null,
  });
  
  const [context, setContext] = useState<ChatContext>(initialContext || {});
  const groqServiceRef = useRef<ReturnType<typeof getGroqService> | null>(null);

  const initializeGroqService = useCallback(() => {
    try {
      if (!groqServiceRef.current) {
        groqServiceRef.current = getGroqService();
      }
    } catch (error) {
      console.error('Failed to initialize Groq service:', error);
      setChatState(prev => ({
        ...prev,
        error: 'Failed to initialize AI service. Please check your API key.',
      }));
    }
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    // Initialize service if needed
    if (!groqServiceRef.current) {
      initializeGroqService();
    }

    const userMessage: ChatMessage = {
      role: 'user',
      content: content.trim(),
    };

    // Add user message to chat
    setChatState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isTyping: true,
      error: null,
    }));

    try {
      if (!groqServiceRef.current) {
        throw new Error('Groq service not initialized');
      }

      // Get AI response
      const response: ChatResponse = await groqServiceRef.current.generateResponse(
        [...chatState.messages, userMessage],
        context
      );

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response.message,
      };

      // Add assistant response to chat
      setChatState(prev => ({
        ...prev,
        messages: [...prev.messages, assistantMessage],
        isTyping: false,
        error: null,
      }));

    } catch (error) {
      console.error('Error sending message:', error);
      setChatState(prev => ({
        ...prev,
        isTyping: false,
        error: 'Failed to get response. Please try again.',
      }));
    }
  }, [chatState.messages, context, initializeGroqService]);

  const sendWorkoutAdvice = useCallback(async (
    exercise: string,
    formFeedback?: string,
    repCount?: number
  ) => {
    if (!groqServiceRef.current) {
      initializeGroqService();
    }

    setChatState(prev => ({
      ...prev,
      isTyping: true,
      error: null,
    }));

    try {
      if (!groqServiceRef.current) {
        throw new Error('Groq service not initialized');
      }

      const response = await groqServiceRef.current.generateWorkoutAdvice(
        exercise,
        formFeedback,
        repCount
      );

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response.message,
      };

      setChatState(prev => ({
        ...prev,
        messages: [...prev.messages, assistantMessage],
        isTyping: false,
        error: null,
      }));

    } catch (error) {
      console.error('Error getting workout advice:', error);
      setChatState(prev => ({
        ...prev,
        isTyping: false,
        error: 'Failed to get workout advice. Please try again.',
      }));
    }
  }, [initializeGroqService]);

  const sendNutritionAdvice = useCallback(async (question: string) => {
    if (!groqServiceRef.current) {
      initializeGroqService();
    }

    setChatState(prev => ({
      ...prev,
      isTyping: true,
      error: null,
    }));

    try {
      if (!groqServiceRef.current) {
        throw new Error('Groq service not initialized');
      }

      const response = await groqServiceRef.current.generateNutritionAdvice(
        question,
        context.nutritionData
      );

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response.message,
      };

      setChatState(prev => ({
        ...prev,
        messages: [...prev.messages, assistantMessage],
        isTyping: false,
        error: null,
      }));

    } catch (error) {
      console.error('Error getting nutrition advice:', error);
      setChatState(prev => ({
        ...prev,
        isTyping: false,
        error: 'Failed to get nutrition advice. Please try again.',
      }));
    }
  }, [context.nutritionData, initializeGroqService]);

  const sendMotivationalMessage = useCallback(async (
    contextType: 'workout_start' | 'workout_end' | 'nutrition_log' | 'goal_achieved' | 'struggling'
  ) => {
    if (!groqServiceRef.current) {
      initializeGroqService();
    }

    setChatState(prev => ({
      ...prev,
      isTyping: true,
      error: null,
    }));

    try {
      if (!groqServiceRef.current) {
        throw new Error('Groq service not initialized');
      }

      const response = await groqServiceRef.current.generateMotivationalMessage(contextType);

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response.message,
      };

      setChatState(prev => ({
        ...prev,
        messages: [...prev.messages, assistantMessage],
        isTyping: false,
        error: null,
      }));

    } catch (error) {
      console.error('Error getting motivational message:', error);
      setChatState(prev => ({
        ...prev,
        isTyping: false,
        error: 'Failed to get motivational message. Please try again.',
      }));
    }
  }, [initializeGroqService]);

  const updateContext = useCallback((newContext: Partial<ChatContext>) => {
    setContext(prev => ({ ...prev, ...newContext }));
  }, []);

  const clearChat = useCallback(() => {
    setChatState({
      messages: [],
      isTyping: false,
      error: null,
    });
  }, []);

  const clearError = useCallback(() => {
    setChatState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    // State
    messages: chatState.messages,
    isTyping: chatState.isTyping,
    error: chatState.error,
    context,
    
    // Actions
    sendMessage,
    sendWorkoutAdvice,
    sendNutritionAdvice,
    sendMotivationalMessage,
    updateContext,
    clearChat,
    clearError,
    initializeGroqService,
  };
}; 