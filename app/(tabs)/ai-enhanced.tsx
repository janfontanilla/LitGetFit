import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Zap, 
  MessageSquare, 
  Video, 
  Dumbbell, 
  Brain,
  Sparkles,
  Play,
  Bot
} from 'lucide-react-native';

import LiquidGlassCard from '@/components/LiquidGlassCard';
import GlassButton from '@/components/GlassButton';
import AIWorkoutGenerator from '@/components/AIWorkoutGenerator';
import SmartNutritionChat from '@/components/SmartNutritionChat';
import { AppColors, Gradients } from '@/styles/colors';
import { userProfileService } from '@/lib/supabase';
import { workoutService } from '@/lib/supabase';
import tavusService from '@/lib/tavusService';
import { router } from 'expo-router';

type AIFeature = 'workout' | 'nutrition' | 'video' | 'overview';

export default function AIEnhancedScreen() {
  const [activeFeature, setActiveFeature] = useState<AIFeature>('overview');
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);

  React.useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const profiles = await userProfileService.getAllProfiles();
      if (profiles.length > 0) {
        setUserProfile(profiles[0]);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const handleWorkoutGenerated = async (workout: any) => {
    try {
      // Save the AI-generated workout
      const savedWorkout = await workoutService.createWorkout({
        name: workout.name,
        description: workout.description,
        exercises: workout.exercises,
      });

      if (savedWorkout) {
        Alert.alert(
          'Workout Generated!',
          `"${workout.name}" has been created and saved to your routines.`,
          [
            {
              text: 'View Routines',
              onPress: () => router.push('/(tabs)/routines'),
            },
            {
              text: 'Start Now',
              onPress: () => router.push({
                pathname: '/workout/start',
                params: { 
                  workoutData: JSON.stringify({
                    id: savedWorkout.id,
                    name: savedWorkout.name,
                    description: savedWorkout.description,
                    exercises: savedWorkout.exercises,
                    estimatedDuration: workout.estimatedDuration,
                    targetedMuscles: workout.targetedMuscles,
                  })
                }
              }),
            },
          ]
        );
      }
    } catch (error) {
      console.error('Error saving AI workout:', error);
      Alert.alert('Error', 'Failed to save the generated workout.');
    }
  };

  const generateMotivationalVideo = async () => {
    if (!userProfile) {
      Alert.alert('Profile Required', 'Please complete your profile first to generate personalized videos.');
      return;
    }

    setIsGeneratingVideo(true);

    try {
      const video = await tavusService.generateMotivationalVideo(
        userProfile.name,
        'starting your fitness journey',
        `Hey ${userProfile.name}! I'm so excited to be your AI fitness coach. With your ${userProfile.primary_goal?.replace('_', ' ')} goal and ${userProfile.fitness_experience} experience level, we're going to create an amazing transformation together. Remember, every expert was once a beginner, and you're taking the most important step right now. Let's make this journey incredible!`
      );

      if (video) {
        Alert.alert(
          'Video Generation Started!',
          'Your personalized motivational video is being created. This may take a few minutes. You\'ll be notified when it\'s ready.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Generation Failed', 'Unable to generate video. Please try again later.');
      }
    } catch (error) {
      console.error('Error generating video:', error);
      Alert.alert('Error', 'An error occurred while generating your video.');
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  const renderOverview = () => (
    <ScrollView style={styles.overviewContainer} showsVerticalScrollIndicator={false}>
      {/* Welcome Header */}
      <LiquidGlassCard style={styles.welcomeCard}>
        <View style={styles.welcomeContent}>
          <Brain size={48} color={AppColors.primary} />
          <Text style={styles.welcomeTitle}>AI-Powered Fitness</Text>
          <Text style={styles.welcomeSubtitle}>
            Experience the future of fitness with personalized AI coaching, smart workout generation, and intelligent nutrition guidance.
          </Text>
        </View>
      </LiquidGlassCard>

      {/* AI Features Grid */}
      <View style={styles.featuresGrid}>
        <TouchableOpacity
          style={styles.featureCard}
          onPress={() => setActiveFeature('workout')}
          activeOpacity={0.8}
        >
          <LiquidGlassCard style={styles.featureCardInner}>
            <Dumbbell size={32} color={AppColors.primary} />
            <Text style={styles.featureTitle}>AI Workout Generator</Text>
            <Text style={styles.featureDescription}>
              Generate personalized workouts based on your goals, equipment, and time
            </Text>
            <View style={styles.featureAction}>
              <Sparkles size={16} color={AppColors.primary} />
              <Text style={styles.featureActionText}>Generate Now</Text>
            </View>
          </LiquidGlassCard>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.featureCard}
          onPress={() => setActiveFeature('nutrition')}
          activeOpacity={0.8}
        >
          <LiquidGlassCard style={styles.featureCardInner}>
            <MessageSquare size={32} color={AppColors.success} />
            <Text style={styles.featureTitle}>Nutrition AI Chat</Text>
            <Text style={styles.featureDescription}>
              Get instant answers to nutrition questions and personalized meal advice
            </Text>
            <View style={styles.featureAction}>
              <Bot size={16} color={AppColors.success} />
              <Text style={styles.featureActionText}>Chat Now</Text>
            </View>
          </LiquidGlassCard>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.featureCard, styles.featureCardWide]}
          onPress={generateMotivationalVideo}
          activeOpacity={0.8}
          disabled={isGeneratingVideo}
        >
          <LiquidGlassCard style={styles.featureCardInner}>
            <Video size={32} color={AppColors.warning} />
            <Text style={styles.featureTitle}>AI Video Coach</Text>
            <Text style={styles.featureDescription}>
              Generate personalized motivational videos with your AI coach
            </Text>
            <View style={styles.featureAction}>
              {isGeneratingVideo ? (
                <>
                  <Sparkles size={16} color={AppColors.warning} />
                  <Text style={styles.featureActionText}>Generating...</Text>
                </>
              ) : (
                <>
                  <Play size={16} color={AppColors.warning} />
                  <Text style={styles.featureActionText}>Create Video</Text>
                </>
              )}
            </View>
          </LiquidGlassCard>
        </TouchableOpacity>
      </View>

      {/* AI Stats */}
      <LiquidGlassCard style={styles.statsCard}>
        <Text style={styles.statsTitle}>AI-Powered Insights</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>∞</Text>
            <Text style={styles.statLabel}>Workout Combinations</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>24/7</Text>
            <Text style={styles.statLabel}>AI Availability</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>100%</Text>
            <Text style={styles.statLabel}>Personalized</Text>
          </View>
        </View>
      </LiquidGlassCard>
    </ScrollView>
  );

  const renderFeatureContent = () => {
    switch (activeFeature) {
      case 'workout':
        return (
          <View style={styles.featureContent}>
            <AIWorkoutGenerator 
              onWorkoutGenerated={handleWorkoutGenerated}
              userProfile={userProfile}
            />
          </View>
        );
      case 'nutrition':
        return (
          <View style={styles.featureContent}>
            <SmartNutritionChat userProfile={userProfile} />
          </View>
        );
      default:
        return renderOverview();
    }
  };

  return (
    <LinearGradient colors={Gradients.background} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          {activeFeature !== 'overview' ? (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setActiveFeature('overview')}
            >
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.headerContent}>
              <Zap size={28} color={AppColors.primary} />
              <Text style={styles.headerTitle}>AI Fitness Coach</Text>
            </View>
          )}
        </View>

        {/* Content */}
        <View style={styles.content}>
          {renderFeatureContent()}
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
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: AppColors.textPrimary,
  },
  backButton: {
    paddingVertical: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: AppColors.primary,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  overviewContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  welcomeCard: {
    marginVertical: 20,
    alignItems: 'center',
  },
  welcomeContent: {
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: AppColors.textPrimary,
    marginTop: 16,
    marginBottom: 12,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: AppColors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 20,
  },
  featureCard: {
    flex: 1,
    minWidth: '45%',
  },
  featureCardWide: {
    flex: 1,
    minWidth: '100%',
  },
  featureCardInner: {
    alignItems: 'center',
    minHeight: 160,
    justifyContent: 'space-between',
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: AppColors.textPrimary,
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: 14,
    color: AppColors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  featureAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
  },
  featureActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: AppColors.textPrimary,
  },
  statsCard: {
    marginBottom: 40,
  },
  statsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: AppColors.textPrimary,
    marginBottom: 20,
    textAlign: 'center',
  },
  statsGrid: {
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
    textAlign: 'center',
    fontWeight: '600',
  },
  featureContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
});