import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Zap } from 'lucide-react-native';

import GlassButton from '@/components/GlassButton';
import LiquidGlassCard from '@/components/LiquidGlassCard';
import { AppColors, Gradients } from '@/styles/colors';
import { userProfileService } from '@/lib/supabase';

export default function WelcomeScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);

  useEffect(() => {
    checkUserProfile();
  }, []);

  const checkUserProfile = async () => {
    try {
      // Check if any user profiles exist
      const profiles = await userProfileService.getAllProfiles();
      
      if (profiles.length > 0) {
        // User has completed onboarding, go to main app
        setHasProfile(true);
        router.replace('/(tabs)');
      } else {
        // No profile found, show welcome screen
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error checking user profile:', error);
      // On error, show welcome screen
      setIsLoading(false);
    }
  };

  const startOnboarding = () => {
    router.push('/onboarding');
  };

  const goToApp = () => {
    router.replace('/(tabs)');
  };

  if (isLoading) {
    return (
      <LinearGradient colors={Gradients.background} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <View style={styles.logoContainer}>
              <Zap size={48} color={AppColors.primary} />
            </View>
            <Text style={styles.loadingText}>Loading Lit Get Fit...</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={Gradients.background} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <View style={styles.logoContainer}>
              <Zap size={64} color={AppColors.primary} />
            </View>
            <Text style={styles.appName}>Lit Get Fit</Text>
            <Text style={styles.tagline}>
              Your personal AI-powered fitness companion
            </Text>
          </View>

          {/* Features Preview */}
          <View style={styles.featuresContainer}>
            <LiquidGlassCard style={styles.featureCard}>
              <View style={styles.featureContent}>
                <Image
                  source={{ uri: 'https://images.pexels.com/photos/416778/pexels-photo-416778.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2' }}
                  style={styles.featureImage}
                />
                <View style={styles.featureText}>
                  <Text style={styles.featureTitle}>AI Form Analysis</Text>
                  <Text style={styles.featureDescription}>
                    Real-time feedback on your workout form using advanced AI
                  </Text>
                </View>
              </View>
            </LiquidGlassCard>

            <LiquidGlassCard style={styles.featureCard}>
              <View style={styles.featureContent}>
                <Image
                  source={{ uri: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2' }}
                  style={styles.featureImage}
                />
                <View style={styles.featureText}>
                  <Text style={styles.featureTitle}>Nutrition Coaching</Text>
                  <Text style={styles.featureDescription}>
                    Personalized meal plans and nutrition guidance
                  </Text>
                </View>
              </View>
            </LiquidGlassCard>

            <LiquidGlassCard style={styles.featureCard}>
              <View style={styles.featureContent}>
                <Image
                  source={{ uri: 'https://images.pexels.com/photos/4164418/pexels-photo-4164418.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2' }}
                  style={styles.featureImage}
                />
                <View style={styles.featureText}>
                  <Text style={styles.featureTitle}>Custom Workouts</Text>
                  <Text style={styles.featureDescription}>
                    Tailored workout routines based on your goals
                  </Text>
                </View>
              </View>
            </LiquidGlassCard>
          </View>

          {/* CTA Section */}
          <View style={styles.ctaSection}>
            <GlassButton
              title="Get Started"
              onPress={startOnboarding}
              variant="primary"
              size="large"
              style={styles.getStartedButton}
            />
            {hasProfile && (
              <GlassButton
                title="Continue to App"
                onPress={goToApp}
                variant="secondary"
                size="medium"
                style={styles.continueButton}
              />
            )}
            <Text style={styles.disclaimer}>
              Join thousands of users achieving their fitness goals
            </Text>
          </View>
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
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 122, 255, 0.3)',
  },
  loadingText: {
    fontSize: 16,
    color: AppColors.textSecondary,
    fontWeight: '500',
  },
  heroSection: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  appName: {
    fontSize: 32,
    fontWeight: '700',
    color: AppColors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
    marginTop: 24,
  },
  tagline: {
    fontSize: 18,
    color: AppColors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 280,
  },
  featuresContainer: {
    flex: 1,
    gap: 16,
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  featureCard: {
    padding: 0,
    overflow: 'hidden',
  },
  featureContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  featureImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginRight: 16,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.textPrimary,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: AppColors.textSecondary,
    lineHeight: 20,
  },
  ctaSection: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
    gap: 12,
  },
  getStartedButton: {
    width: '100%',
  },
  continueButton: {
    width: '100%',
  },
  disclaimer: {
    fontSize: 14,
    color: AppColors.textTertiary,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 8,
  },
});