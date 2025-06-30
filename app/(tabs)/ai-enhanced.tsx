import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Animated,
  Modal,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { 
  Zap, 
  MessageSquare, 
  Video, 
  Dumbbell, 
  Brain,
  Sparkles,
  Play,
  Bot,
  X,
  Loader as Loader2,
  Star,
  Camera
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

const { height } = Dimensions.get('window');

type AIFeature = 'workout' | 'nutrition' | 'overview';

export default function AIEnhancedScreen() {
  const [activeFeature, setActiveFeature] = useState<AIFeature>('overview');
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [showVideoCoachModal, setShowVideoCoachModal] = useState(false);
  const [generatedVideo, setGeneratedVideo] = useState<any>(null);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  React.useEffect(() => {
    loadUserProfile();
    
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
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

  const openVideoCoachModal = () => {
    setShowVideoCoachModal(true);
  };

  const generateMotivationalVideo = async (videoType: 'motivational' | 'workout_tips' | 'progress_celebration') => {
    if (!userProfile) {
      Alert.alert('Profile Required', 'Please complete your profile first to generate personalized videos.');
      return;
    }

    setIsGeneratingVideo(true);

    try {
      let video;
      
      switch (videoType) {
        case 'motivational':
          video = await tavusService.generateMotivationalVideo(
            userProfile.name,
            'starting your fitness journey',
            `Hey ${userProfile.name}! I'm so excited to be your AI fitness coach. With your ${userProfile.primary_goal?.replace('_', ' ')} goal and ${userProfile.fitness_experience} experience level, we're going to create an amazing transformation together. Remember, every expert was once a beginner, and you're taking the most important step right now. Let's make this journey incredible!`
          );
          break;
        case 'workout_tips':
          video = await tavusService.generateWorkoutInstructions(
            'Perfect Form',
            'Today I want to share some essential tips for maintaining perfect form during your workouts.',
            [
              'Focus on controlled movements rather than speed',
              'Breathe properly - exhale on exertion, inhale on release',
              'Keep your core engaged throughout each exercise',
              'Start with lighter weights to master the movement pattern'
            ]
          );
          break;
        case 'progress_celebration':
          video = await tavusService.generateMotivationalVideo(
            userProfile.name,
            'your amazing progress',
            `${userProfile.name}, I am so proud of the progress you've made! Your dedication to your ${userProfile.primary_goal?.replace('_', ' ')} goal is truly inspiring. Every workout, every healthy choice, every moment you chose to push forward - it all adds up to the incredible transformation you're experiencing. Keep going, you're absolutely crushing it!`
          );
          break;
      }

      if (video) {
        setGeneratedVideo(video);
        Alert.alert(
          'Video Generation Started!',
          'Your personalized AI coach video is being created. This may take a few minutes. You\'ll be notified when it\'s ready.',
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
      setShowVideoCoachModal(false);
    }
  };

  const renderVideoCoachModal = () => (
    <Modal
      visible={showVideoCoachModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowVideoCoachModal(false)}
    >
      <BlurView intensity={40} tint="dark" style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <LiquidGlassCard style={styles.modal}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleContainer}>
                <Video size={24} color={AppColors.primary} />
                <Text style={styles.modalTitle}>AI Video Coach</Text>
              </View>
              <TouchableOpacity 
                style={styles.closeButton} 
                onPress={() => setShowVideoCoachModal(false)}
              >
                <X size={24} color={AppColors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalDescription}>
              Generate personalized videos with your AI coach for motivation, workout tips, and progress celebrations.
            </Text>

            {/* Video Options */}
            <View style={styles.videoOptions}>
              <TouchableOpacity
                style={styles.videoOption}
                onPress={() => generateMotivationalVideo('motivational')}
                disabled={isGeneratingVideo}
              >
                <LiquidGlassCard style={styles.videoOptionCard}>
                  <Sparkles size={32} color={AppColors.primary} />
                  <Text style={styles.videoOptionTitle}>Motivational Message</Text>
                  <Text style={styles.videoOptionDescription}>
                    Get a personalized pep talk to boost your motivation
                  </Text>
                </LiquidGlassCard>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.videoOption}
                onPress={() => generateMotivationalVideo('workout_tips')}
                disabled={isGeneratingVideo}
              >
                <LiquidGlassCard style={styles.videoOptionCard}>
                  <Brain size={32} color={AppColors.success} />
                  <Text style={styles.videoOptionTitle}>Workout Tips</Text>
                  <Text style={styles.videoOptionDescription}>
                    Learn proper form and technique from your AI coach
                  </Text>
                </LiquidGlassCard>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.videoOption}
                onPress={() => generateMotivationalVideo('progress_celebration')}
                disabled={isGeneratingVideo}
              >
                <LiquidGlassCard style={styles.videoOptionCard}>
                  <Star size={32} color={AppColors.warning} />
                  <Text style={styles.videoOptionTitle}>Progress Celebration</Text>
                  <Text style={styles.videoOptionDescription}>
                    Celebrate your achievements with a personalized message
                  </Text>
                </LiquidGlassCard>
              </TouchableOpacity>
            </View>

            {isGeneratingVideo && (
              <View style={styles.generatingContainer}>
                <Loader2 size={24} color={AppColors.primary} />
                <Text style={styles.generatingText}>Creating your personalized video...</Text>
              </View>
            )}
          </LiquidGlassCard>
        </View>
      </BlurView>
    </Modal>
  );

  const renderOverview = () => (
    <View style={styles.overviewContainer}>
      {/* Welcome Section */}
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

      {/* Form Analysis Integration */}
      <LiquidGlassCard style={styles.formAnalysisCard}>
        <View style={styles.formAnalysisHeader}>
          <Camera size={24} color={AppColors.accent} />
          <Text style={styles.formAnalysisTitle}>AI Form Analysis</Text>
        </View>
        <Text style={styles.formAnalysisDescription}>
          Get real-time feedback on your workout form with advanced computer vision AI
        </Text>
        <GlassButton
          title="Open Form AI"
          onPress={() => router.push('/(tabs)/ai-coach')}
          variant="secondary"
          size="medium"
          style={styles.formAnalysisButton}
          icon={<Camera size={16} color={AppColors.textPrimary} />}
        />
      </LiquidGlassCard>
    </View>
  );

  const renderFeatureContent = () => {
    switch (activeFeature) {
      case 'workout':
        return (
          <AIWorkoutGenerator 
            onWorkoutGenerated={handleWorkoutGenerated}
            userProfile={userProfile}
          />
        );
      case 'nutrition':
        return (
          <SmartNutritionChat userProfile={userProfile} />
        );
      default:
        return renderOverview();
    }
  };

  return (
    <LinearGradient colors={Gradients.background} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Fixed Header with AI Video Coach Button */}
        <Animated.View 
          style={[
            styles.fixedHeader,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <Zap size={28} color={AppColors.primary} />
              <Text style={styles.headerTitle}>AI Fitness Coach</Text>
            </View>
            
            {activeFeature !== 'overview' && (
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => setActiveFeature('overview')}
              >
                <Text style={styles.backButtonText}>← Overview</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Prominent AI Video Coach Button */}
          <TouchableOpacity
            style={styles.videoCoachButton}
            onPress={openVideoCoachModal}
            activeOpacity={0.8}
            disabled={isGeneratingVideo}
          >
            <LinearGradient
              colors={['#FF6B6B', '#FF8E53', '#FF6B6B']}
              style={styles.videoCoachGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.videoCoachContent}>
                {isGeneratingVideo ? (
                  <>
                    <Loader2 size={24} color={AppColors.textPrimary} />
                    <Text style={styles.videoCoachText}>Generating Video...</Text>
                  </>
                ) : (
                  <>
                    <Video size={24} color={AppColors.textPrimary} />
                    <Text style={styles.videoCoachText}>AI Video Coach</Text>
                    <Text style={styles.videoCoachSubtext}>Create Personalized Videos</Text>
                  </>
                )}
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Scrollable Content */}
        <ScrollView 
          style={styles.scrollableContent}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View 
            style={[
              styles.contentContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0],
                }) }],
              },
            ]}
          >
            {renderFeatureContent()}
          </Animated.View>
        </ScrollView>

        {/* Video Coach Modal */}
        {renderVideoCoachModal()}
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
  fixedHeader: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border,
    backgroundColor: 'rgba(10, 10, 10, 0.95)',
    zIndex: 1000,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
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
    paddingHorizontal: 12,
  },
  backButtonText: {
    fontSize: 16,
    color: AppColors.primary,
    fontWeight: '600',
  },
  videoCoachButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  videoCoachGradient: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  videoCoachContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  videoCoachText: {
    fontSize: 18,
    fontWeight: '700',
    color: AppColors.textPrimary,
  },
  videoCoachSubtext: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  scrollableContent: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 130,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  overviewContainer: {
    flex: 1,
  },
  welcomeCard: {
    marginBottom: 20,
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
    gap: 16,
    marginBottom: 20,
  },
  featureCard: {
    flex: 1,
  },
  featureCardInner: {
    alignItems: 'center',
    minHeight: 180,
    justifyContent: 'space-between',
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.textPrimary,
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: 13,
    color: AppColors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
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
    marginBottom: 20,
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
  formAnalysisCard: {
    marginBottom: 20,
  },
  formAnalysisHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  formAnalysisTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: AppColors.textPrimary,
  },
  formAnalysisDescription: {
    fontSize: 14,
    color: AppColors.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  formAnalysisButton: {
    alignSelf: 'flex-start',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  modalContainer: {
    width: '90%',
    maxWidth: 400,
    maxHeight: height * 0.8,
  },
  modal: {
    padding: 0,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
  },
  modalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: AppColors.textPrimary,
  },
  closeButton: {
    padding: 4,
  },
  modalDescription: {
    fontSize: 14,
    color: AppColors.textSecondary,
    lineHeight: 20,
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  videoOptions: {
    paddingHorizontal: 24,
    gap: 16,
    marginBottom: 24,
  },
  videoOption: {
    width: '100%',
  },
  videoOptionCard: {
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  videoOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.textPrimary,
    marginTop: 12,
    marginBottom: 8,
  },
  videoOptionDescription: {
    fontSize: 13,
    color: AppColors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  generatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  generatingText: {
    fontSize: 14,
    color: AppColors.primary,
    fontWeight: '600',
  },
});