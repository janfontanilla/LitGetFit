import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Target, Clock, Trophy, Users } from 'lucide-react-native';
import { AppColors } from '@/styles/colors';
import LiquidGlassCard from './LiquidGlassCard';
import GlassButton from './GlassButton';
import ProgressRing from './ProgressRing';

interface Challenge {
  id: string;
  name: string;
  description: string;
  challenge_type: 'daily' | 'weekly' | 'monthly';
  target_metric: 'workouts' | 'duration' | 'calories' | 'streak' | 'exercises';
  target_value: number;
  start_date: string;
  end_date: string;
}

interface ChallengeProgress {
  current_progress: number;
  is_completed: boolean;
  completed_at?: string;
  joined_at: string;
}

interface ChallengeCardProps {
  challenge: Challenge;
  progress?: ChallengeProgress;
  onJoin?: (challengeId: string) => void;
  isJoined?: boolean;
}

export default function ChallengeCard({ challenge, progress, onJoin, isJoined }: ChallengeCardProps) {
  const getTypeIcon = () => {
    switch (challenge.challenge_type) {
      case 'daily': return <Clock size={16} color={AppColors.primary} />;
      case 'weekly': return <Target size={16} color={AppColors.success} />;
      case 'monthly': return <Trophy size={16} color={AppColors.warning} />;
      default: return <Users size={16} color={AppColors.textSecondary} />;
    }
  };

  const getTypeColor = () => {
    switch (challenge.challenge_type) {
      case 'daily': return AppColors.primary;
      case 'weekly': return AppColors.success;
      case 'monthly': return AppColors.warning;
      default: return AppColors.textSecondary;
    }
  };

  const getMetricLabel = () => {
    switch (challenge.target_metric) {
      case 'workouts': return 'workouts';
      case 'duration': return 'minutes';
      case 'calories': return 'calories';
      case 'streak': return 'days';
      case 'exercises': return 'exercises';
      default: return 'points';
    }
  };

  const getProgressPercentage = () => {
    if (!progress) return 0;
    return Math.min((progress.current_progress / challenge.target_value) * 100, 100);
  };

  const getDaysRemaining = () => {
    const endDate = new Date(challenge.end_date);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  return (
    <LiquidGlassCard style={[
      styles.container,
      progress?.is_completed && styles.completedContainer
    ]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <View style={[styles.typeIndicator, { backgroundColor: getTypeColor() }]}>
            {getTypeIcon()}
          </View>
          <View style={styles.titleText}>
            <Text style={styles.challengeName}>{challenge.name}</Text>
            <Text style={styles.challengeType}>
              {challenge.challenge_type.charAt(0).toUpperCase() + challenge.challenge_type.slice(1)} Challenge
            </Text>
          </View>
        </View>
        
        {progress?.is_completed && (
          <View style={styles.completedBadge}>
            <Trophy size={16} color={AppColors.warning} />
          </View>
        )}
      </View>

      {/* Description */}
      <Text style={styles.description}>{challenge.description}</Text>

      {/* Progress Section */}
      {isJoined && progress && (
        <View style={styles.progressSection}>
          <View style={styles.progressInfo}>
            <ProgressRing 
              progress={getProgressPercentage() / 100} 
              size={60} 
              strokeWidth={6}
              color={getTypeColor()}
            />
            <View style={styles.progressText}>
              <Text style={styles.progressValue}>
                {progress.current_progress} / {challenge.target_value}
              </Text>
              <Text style={styles.progressLabel}>{getMetricLabel()}</Text>
            </View>
          </View>
          
          <View style={styles.progressStats}>
            <Text style={styles.progressPercentage}>
              {Math.round(getProgressPercentage())}% Complete
            </Text>
            {!progress.is_completed && (
              <Text style={styles.timeRemaining}>
                {getDaysRemaining()} days remaining
              </Text>
            )}
          </View>
        </View>
      )}

      {/* Target Info */}
      <View style={styles.targetInfo}>
        <Text style={styles.targetLabel}>Target:</Text>
        <Text style={styles.targetValue}>
          {challenge.target_value} {getMetricLabel()}
        </Text>
      </View>

      {/* Action Button */}
      {!isJoined && onJoin && (
        <GlassButton
          title="Join Challenge"
          onPress={() => onJoin(challenge.id)}
          variant="primary"
          size="medium"
          style={styles.joinButton}
        />
      )}

      {progress?.is_completed && (
        <View style={styles.completedMessage}>
          <Trophy size={20} color={AppColors.warning} />
          <Text style={styles.completedText}>Challenge Completed!</Text>
          <Text style={styles.completedDate}>
            {progress.completed_at && new Date(progress.completed_at).toLocaleDateString()}
          </Text>
        </View>
      )}
    </LiquidGlassCard>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  completedContainer: {
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  typeIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  titleText: {
    flex: 1,
  },
  challengeName: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.textPrimary,
    marginBottom: 2,
  },
  challengeType: {
    fontSize: 12,
    color: AppColors.textSecondary,
    textTransform: 'capitalize',
  },
  completedBadge: {
    padding: 6,
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    borderRadius: 12,
  },
  description: {
    fontSize: 14,
    color: AppColors.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  progressSection: {
    marginBottom: 16,
  },
  progressInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressText: {
    marginLeft: 16,
    flex: 1,
  },
  progressValue: {
    fontSize: 18,
    fontWeight: '700',
    color: AppColors.textPrimary,
  },
  progressLabel: {
    fontSize: 12,
    color: AppColors.textSecondary,
  },
  progressStats: {
    alignItems: 'center',
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.primary,
    marginBottom: 4,
  },
  timeRemaining: {
    fontSize: 12,
    color: AppColors.textTertiary,
  },
  targetInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: AppColors.backgroundSecondary,
    borderRadius: 8,
    marginBottom: 16,
  },
  targetLabel: {
    fontSize: 14,
    color: AppColors.textSecondary,
  },
  targetValue: {
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.textPrimary,
  },
  joinButton: {
    width: '100%',
  },
  completedMessage: {
    alignItems: 'center',
    paddingVertical: 12,
    gap: 4,
  },
  completedText: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.warning,
  },
  completedDate: {
    fontSize: 12,
    color: AppColors.textTertiary,
  },
});