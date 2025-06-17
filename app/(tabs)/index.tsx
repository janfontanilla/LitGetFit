import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image,
  TouchableOpacity 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Play, Flame, Target, TrendingUp } from 'lucide-react-native';

import LiquidGlassCard from '@/components/LiquidGlassCard';
import GlassButton from '@/components/GlassButton';
import ProgressRing from '@/components/ProgressRing';
import { AppColors, Gradients } from '@/styles/colors';

export default function HomeScreen() {
  const currentHour = new Date().getHours();
  const getGreeting = () => {
    if (currentHour < 12) return 'Good Morning';
    if (currentHour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <LinearGradient colors={Gradients.background} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerText}>
              <Text style={styles.greeting}>{getGreeting()},</Text>
              <Text style={styles.userName}>Alex</Text>
            </View>
            <TouchableOpacity style={styles.profileImage}>
              <Image 
                source={{ uri: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2' }}
                style={styles.avatar}
              />
            </TouchableOpacity>
          </View>

          {/* Today's Workout Card */}
          <LiquidGlassCard style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Today's Workout</Text>
              <Play size={20} color={AppColors.primary} />
            </View>
            
            <View style={styles.workoutInfo}>
              <View style={styles.workoutDetails}>
                <Text style={styles.workoutName}>Upper Body Strength</Text>
                <Text style={styles.workoutMeta}>45 min • Intermediate</Text>
                
                <View style={styles.workoutStats}>
                  <Text style={styles.statText}>3/5 exercises completed</Text>
                </View>
              </View>
              
              <View style={styles.progressContainer}>
                <ProgressRing progress={0.6} size={60} strokeWidth={6} />
                <Text style={styles.progressText}>60%</Text>
              </View>
            </View>
            
            <GlassButton
              title="Continue Workout"
              onPress={() => {}}
              variant="primary"
              style={styles.workoutButton}
            />
          </LiquidGlassCard>

          {/* Weekly Progress Card */}
          <LiquidGlassCard style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Weekly Progress</Text>
              <TrendingUp size={20} color={AppColors.success} />
            </View>
            
            <View style={styles.progressStats}>
              <View style={styles.statItem}>
                <View style={styles.statIcon}>
                  <Flame size={16} color={AppColors.accent} />
                </View>
                <Text style={styles.statLabel}>Current Streak</Text>
                <Text style={styles.statValue}>7 days</Text>
              </View>
              
              <View style={styles.statItem}>
                <View style={styles.statIcon}>
                  <Target size={16} color={AppColors.primary} />
                </View>
                <Text style={styles.statLabel}>This Week</Text>
                <Text style={styles.statValue}>4/5 workouts</Text>
              </View>
            </View>
            
            {/* Weekly Chart Placeholder */}
            <View style={styles.chartContainer}>
              <View style={styles.chartBars}>
                {[0.8, 1.0, 0.6, 0.9, 0.7, 0.4, 0.9].map((height, index) => (
                  <View 
                    key={index}
                    style={[
                      styles.chartBar,
                      { height: height * 40 }
                    ]}
                  />
                ))}
              </View>
              <View style={styles.chartLabels}>
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => (
                  <Text key={index} style={styles.chartLabel}>{day}</Text>
                ))}
              </View>
            </View>
          </LiquidGlassCard>

          {/* Daily Nutrition Card */}
          <LiquidGlassCard style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Daily Nutrition</Text>
              <Text style={styles.calorieCount}>1,850 / 2,200 cal</Text>
            </View>
            
            <View style={styles.nutritionProgress}>
              <View style={styles.nutritionBar}>
                <View style={[styles.nutritionFill, { width: '84%' }]} />
              </View>
            </View>
            
            <View style={styles.macroStats}>
              <View style={styles.macroItem}>
                <View style={[styles.macroIndicator, { backgroundColor: AppColors.primary }]} />
                <Text style={styles.macroLabel}>Protein</Text>
                <Text style={styles.macroValue}>120g</Text>
              </View>
              <View style={styles.macroItem}>
                <View style={[styles.macroIndicator, { backgroundColor: AppColors.success }]} />
                <Text style={styles.macroLabel}>Carbs</Text>
                <Text style={styles.macroValue}>180g</Text>
              </View>
              <View style={styles.macroItem}>
                <View style={[styles.macroIndicator, { backgroundColor: AppColors.warning }]} />
                <Text style={styles.macroLabel}>Fats</Text>
                <Text style={styles.macroValue}>65g</Text>
              </View>
            </View>
            
            <GlassButton
              title="Log Meal"
              onPress={() => {}}
              variant="secondary"
              size="small"
              style={styles.logButton}
            />
          </LiquidGlassCard>

        </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // Tab bar spacing
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  headerText: {
    flex: 1,
  },
  greeting: {
    fontSize: 16,
    color: AppColors.textSecondary,
    fontWeight: '400',
  },
  userName: {
    fontSize: 28,
    color: AppColors.textPrimary,
    fontWeight: '700',
    marginTop: 4,
  },
  profileImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  card: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: AppColors.textPrimary,
  },
  workoutInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  workoutDetails: {
    flex: 1,
  },
  workoutName: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.textPrimary,
    marginBottom: 4,
  },
  workoutMeta: {
    fontSize: 14,
    color: AppColors.textSecondary,
    marginBottom: 8,
  },
  workoutStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 12,
    color: AppColors.textTertiary,
  },
  progressContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  progressText: {
    position: 'absolute',
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.textPrimary,
  },
  workoutButton: {
    width: '100%',
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 12,
    color: AppColors.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.textPrimary,
  },
  chartContainer: {
    marginTop: 8,
  },
  chartBars: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 50,
    marginBottom: 8,
  },
  chartBar: {
    width: 24,
    backgroundColor: AppColors.primary,
    borderRadius: 4,
    opacity: 0.8,
  },
  chartLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  chartLabel: {
    fontSize: 12,
    color: AppColors.textTertiary,
    width: 24,
    textAlign: 'center',
  },
  calorieCount: {
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.primary,
  },
  nutritionProgress: {
    marginBottom: 16,
  },
  nutritionBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  nutritionFill: {
    height: '100%',
    backgroundColor: AppColors.success,
    borderRadius: 4,
  },
  macroStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  macroItem: {
    alignItems: 'flex-start',
  },
  macroIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: 4,
  },
  macroLabel: {
    fontSize: 12,
    color: AppColors.textSecondary,
    marginBottom: 2,
  },
  macroValue: {
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.textPrimary,
  },
  logButton: {
    alignSelf: 'flex-start',
  },
});