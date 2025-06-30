import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Utensils, MessageSquare, Sparkles } from 'lucide-react-native';

import LiquidGlassCard from '@/components/LiquidGlassCard';
import EnhancedFoodLogger from '@/components/EnhancedFoodLogger';
import FoodLogsList from '@/components/FoodLogsList';
import SmartNutritionChat from '@/components/SmartNutritionChat';
import WelcomeMessage from '@/components/WelcomeMessage';
import { AppColors, Gradients } from '@/styles/colors';

type NutritionView = 'logging' | 'chat';

export default function NutritionScreen() {
  const [activeView, setActiveView] = useState<NutritionView>('logging');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [todaysLogs, setTodaysLogs] = useState<any[]>([]);

  const handleFoodLogged = (foodLog: any) => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleLogsChange = (logs: any[]) => {
    setTodaysLogs(logs);
  };

  const getTotalCalories = () => {
    return todaysLogs.reduce((total, log) => total + (log.calories || 0), 0);
  };

  const getTotalProtein = () => {
    return todaysLogs.reduce((total, log) => total + (log.protein || 0), 0);
  };

  const renderLoggingView = () => (
    <ScrollView 
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Welcome Message */}
      <WelcomeMessage 
        onPress={() => setActiveView('chat')}
      />
      
      {/* Daily Summary */}
      <LiquidGlassCard style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <Utensils size={24} color={AppColors.primary} />
          <Text style={styles.summaryTitle}>Today's Nutrition</Text>
        </View>
        
        <View style={styles.summaryStats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{getTotalCalories()}</Text>
            <Text style={styles.statLabel}>Calories</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{Math.round(getTotalProtein())}</Text>
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
                { width: `${Math.min((getTotalCalories() / 2200) * 100, 100)}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            {getTotalCalories()} / 2,200 calories
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
    </ScrollView>
  );

  const renderChatView = () => (
    <View style={styles.chatContainer}>
      <SmartNutritionChat />
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
          
          {/* View Toggle */}
          <View style={styles.viewToggle}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                activeView === 'logging' && styles.activeToggleButton,
              ]}
              onPress={() => setActiveView('logging')}
            >
              <Utensils size={16} color={activeView === 'logging' ? AppColors.textPrimary : AppColors.textSecondary} />
              <Text style={[
                styles.toggleText,
                activeView === 'logging' && styles.activeToggleText,
              ]}>
                Logging
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.toggleButton,
                activeView === 'chat' && styles.activeToggleButton,
              ]}
              onPress={() => setActiveView('chat')}
            >
              <MessageSquare size={16} color={activeView === 'chat' ? AppColors.textPrimary : AppColors.textSecondary} />
              <Text style={[
                styles.toggleText,
                activeView === 'chat' && styles.activeToggleText,
              ]}>
                AI Chat
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {activeView === 'logging' ? renderLoggingView() : renderChatView()}
        </View>
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
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: AppColors.textPrimary,
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: AppColors.backgroundSecondary,
    borderRadius: 12,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  activeToggleButton: {
    backgroundColor: AppColors.primary,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.textSecondary,
  },
  activeToggleText: {
    color: AppColors.textPrimary,
  },
  content: {
    flex: 1,
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
    flex: 1,
    paddingHorizontal: 20,
  },
  chatContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
});