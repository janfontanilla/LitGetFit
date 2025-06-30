import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Trash2, Clock, Utensils, X } from 'lucide-react-native';
import { AppColors } from '@/styles/colors';
import LiquidGlassCard from './LiquidGlassCard';
import { foodLogService, FoodLog } from '@/lib/foodLogService';
import { userProfileService } from '@/lib/supabase';
import { SafeAreaView } from 'react-native-safe-area-context';

interface FoodLogsListProps {
  visible: boolean;
  onClose: () => void;
}

export default function FoodLogsList({ visible, onClose }: FoodLogsListProps) {
  const [foodLogs, setFoodLogs] = useState<FoodLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userProfileId, setUserProfileId] = useState<string | null>(null);

  useEffect(() => {
    loadUserProfile();
  }, []);

  useEffect(() => {
    if (visible) {
      fetchLogs();
    }
  }, [visible]);

  const loadUserProfile = async () => {
    try {
      const profiles = await userProfileService.getAllProfiles();
      if (profiles.length > 0) {
        setUserProfileId(profiles[0].id);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const todayLogs = await foodLogService.getTodaysFoodLogs();
      setFoodLogs(todayLogs);
    } catch (error) {
      console.error('Error fetching today\'s food logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await foodLogService.deleteFoodLog(id);
      fetchLogs(); // Refresh the list
    } catch (error) {
      console.error('Error deleting food log:', error);
    }
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

  const renderLogItem = ({ item }: { item: FoodLog }) => (
    <View style={styles.logItem}>
      <View style={styles.logDetails}>
        <Text style={styles.logName}>{item.food_name}</Text>
        <Text style={styles.logQuantity}>{item.quantity}</Text>
      </View>
      <View style={styles.logMacros}>
        <Text style={styles.logCalories}>{item.calories || 0} kcal</Text>
      </View>
      <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteButton}>
        <Trash2 size={20} color={AppColors.warning} />
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Today's Food Log</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={AppColors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total Calories</Text>
            <Text style={styles.summaryValue}>{getTotalCalories().toLocaleString()}</Text>
          </View>

          {isLoading ? (
            <ActivityIndicator size="large" color={AppColors.primary} style={styles.loader} />
          ) : (
            <FlatList
              data={foodLogs}
              renderItem={renderLogItem}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={() => (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No food logged today. Start by telling me what you ate!</Text>
                </View>
              )}
            />
          )}
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: AppColors.textPrimary,
  },
  closeButton: {
    padding: 4,
  },
  summaryCard: {
    backgroundColor: AppColors.backgroundSecondary,
    borderRadius: 12,
    padding: 20,
    margin: 16,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 16,
    color: AppColors.textSecondary,
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: AppColors.primary,
  },
  loader: {
    marginTop: 50,
  },
  listContent: {
    paddingHorizontal: 16,
  },
  emptyContainer: {
    marginTop: 50,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: AppColors.textSecondary,
    textAlign: 'center',
  },
  logItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.background,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  logDetails: {
    flex: 1,
  },
  logName: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.textPrimary,
  },
  logQuantity: {
    fontSize: 14,
    color: AppColors.textSecondary,
    marginTop: 4,
  },
  logMacros: {
    alignItems: 'flex-end',
    marginHorizontal: 16,
  },
  logCalories: {
    fontSize: 16,
    fontWeight: 'bold',
    color: AppColors.primary,
  },
  deleteButton: {
    padding: 8,
  },
});