import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Trash2, Clock, Utensils } from 'lucide-react-native';
import { AppColors } from '@/styles/colors';
import LiquidGlassCard from './LiquidGlassCard';
import { foodLogService, FoodLog } from '@/lib/foodLogService';

interface FoodLogsListProps {
  refreshTrigger?: number;
  onLogsChange?: (logs: FoodLog[]) => void;
}

export default function FoodLogsList({ refreshTrigger, onLogsChange }: FoodLogsListProps) {
  const [foodLogs, setFoodLogs] = useState<FoodLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTodaysFoodLogs();
  }, [refreshTrigger]);

  const loadTodaysFoodLogs = async () => {
    try {
      setIsLoading(true);
      const logs = await foodLogService.getTodaysFoodLogs();
      setFoodLogs(logs);
      onLogsChange?.(logs);
    } catch (error) {
      console.error('Error loading food logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteLog = async (logId: string, foodName: string) => {
    Alert.alert(
      'Delete Food Log',
      `Are you sure you want to delete "${foodName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const success = await foodLogService.deleteFoodLog(logId);
            if (success) {
              await loadTodaysFoodLogs();
            } else {
              Alert.alert('Error', 'Failed to delete food log');
            }
          },
        },
      ]
    );
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getMealIcon = (mealType: string) => {
    switch (mealType) {
      case 'breakfast':
        return '🌅';
      case 'lunch':
        return '☀️';
      case 'dinner':
        return '🌙';
      case 'snack':
        return '🍎';
      default:
        return '🍽️';
    }
  };

  const getTotalCalories = () => {
    return foodLogs.reduce((total, log) => total + (log.calories || 0), 0);
  };

  if (isLoading) {
    return (
      <LiquidGlassCard style={styles.container}>
        <Text style={styles.loadingText}>Loading today's food logs...</Text>
      </LiquidGlassCard>
    );
  }

  return (
    <View style={styles.container}>
      {/* Summary Card */}
      <LiquidGlassCard style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <Utensils size={20} color={AppColors.primary} />
          <Text style={styles.summaryTitle}>Today's Food</Text>
        </View>
        <View style={styles.summaryStats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{foodLogs.length}</Text>
            <Text style={styles.statLabel}>Items</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{getTotalCalories()}</Text>
            <Text style={styles.statLabel}>Calories</Text>
          </View>
        </View>
      </LiquidGlassCard>

      {/* Food Logs List */}
      <LiquidGlassCard style={styles.logsCard}>
        <Text style={styles.logsTitle}>Recent Logs</Text>
        
        {foodLogs.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No food logged today</Text>
            <Text style={styles.emptyStateSubtext}>
              Use the voice logger above to start tracking your meals
            </Text>
          </View>
        ) : (
          <ScrollView 
            style={styles.logsList}
            showsVerticalScrollIndicator={false}
          >
            {foodLogs.map((log) => (
              <View key={log.id} style={styles.logItem}>
                <View style={styles.logContent}>
                  <View style={styles.logHeader}>
                    <View style={styles.logMeal}>
                      <Text style={styles.mealIcon}>{getMealIcon(log.meal_type)}</Text>
                      <Text style={styles.mealType}>
                        {log.meal_type.charAt(0).toUpperCase() + log.meal_type.slice(1)}
                      </Text>
                    </View>
                    <View style={styles.logTime}>
                      <Clock size={12} color={AppColors.textTertiary} />
                      <Text style={styles.timeText}>{formatTime(log.logged_at)}</Text>
                    </View>
                  </View>
                  
                  <Text style={styles.foodName}>{log.food_name}</Text>
                  <Text style={styles.quantity}>{log.quantity}</Text>
                  
                  {log.calories && (
                    <Text style={styles.calories}>{log.calories} cal</Text>
                  )}
                  
                  {log.notes && (
                    <Text style={styles.notes}>{log.notes}</Text>
                  )}
                </View>
                
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteLog(log.id, log.food_name)}
                >
                  <Trash2 size={16} color={AppColors.accent} />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        )}
      </LiquidGlassCard>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 16,
  },
  summaryCard: {
    marginBottom: 0,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: AppColors.textPrimary,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
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
  logsCard: {
    flex: 1,
    paddingBottom: 8,
  },
  logsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.textPrimary,
    marginBottom: 16,
  },
  logsList: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.textSecondary,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: AppColors.textTertiary,
    textAlign: 'center',
    lineHeight: 20,
  },
  loadingText: {
    fontSize: 16,
    color: AppColors.textSecondary,
    textAlign: 'center',
    paddingVertical: 20,
  },
  logItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border,
  },
  logContent: {
    flex: 1,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  logMeal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  mealIcon: {
    fontSize: 16,
  },
  mealType: {
    fontSize: 12,
    fontWeight: '600',
    color: AppColors.primary,
    textTransform: 'capitalize',
  },
  logTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 11,
    color: AppColors.textTertiary,
  },
  foodName: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.textPrimary,
    marginBottom: 4,
  },
  quantity: {
    fontSize: 14,
    color: AppColors.textSecondary,
    marginBottom: 4,
  },
  calories: {
    fontSize: 12,
    fontWeight: '600',
    color: AppColors.success,
    marginBottom: 4,
  },
  notes: {
    fontSize: 11,
    color: AppColors.textTertiary,
    fontStyle: 'italic',
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
});