import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Zap, ArrowRight } from 'lucide-react-native';

import LiquidGlassCard from '@/components/LiquidGlassCard';
import GlassButton from '@/components/GlassButton';
import { AppColors, Gradients } from '@/styles/colors';

export default function OnboardingWelcome() {
  const startOnboarding = () => {
    router.push('/onboarding/name');
  };

  return (
    <LinearGradient colors={Gradients.background} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            {/* Hero Section */}
            <View style={styles.heroSection}>
              <View style={styles.logoContainer}>
                <Zap size={64} color={AppColors.primary} />
              </View>
              <Text style={styles.title}>Let's Get Started</Text>
              <Text style={styles.subtitle}>
                We'll ask you a few questions to personalize your fitness journey
              </Text>
            </View>

            {/* Preview Cards */}
            <View style={styles.previewContainer}>
              <LiquidGlassCard style={styles.previewCard}>
                <View style={styles.previewContent}>
                  <Image
                    source={{ uri: 'https://images.pexels.com/photos/416778/pexels-photo-416778.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&dpr=2' }}
                    style={styles.previewImage}
                  />
                  <Text style={styles.previewTitle}>Personalized Workouts</Text>
                  <Text style={styles.previewDescription}>
                    Get custom routines based on your goals and experience
                  </Text>
                </View>
              </LiquidGlassCard>

              <LiquidGlassCard style={styles.previewCard}>
                <View style={styles.previewContent}>
                  <Image
                    source={{ uri: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&dpr=2' }}
                    style={styles.previewImage}
                  />
                  <Text style={styles.previewTitle}>AI Form Analysis</Text>
                  <Text style={styles.previewDescription}>
                    Real-time feedback to perfect your technique
                  </Text>
                </View>
              </LiquidGlassCard>

              <LiquidGlassCard style={styles.previewCard}>
                <View style={styles.previewContent}>
                  <Image
                    source={{ uri: 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&dpr=2' }}
                    style={styles.previewImage}
                  />
                  <Text style={styles.previewTitle}>Nutrition Guidance</Text>
                  <Text style={styles.previewDescription}>
                    Smart meal planning and dietary recommendations
                  </Text>
                </View>
              </LiquidGlassCard>
            </View>

            {/* CTA Section */}
            <View style={styles.ctaSection}>
              <Text style={styles.timeEstimate}>Takes about 2 minutes</Text>
              <GlassButton
                title="Start Setup"
                onPress={startOnboarding}
                variant="primary"
                size="large"
                style={styles.startButton}
                icon={<ArrowRight size={20} color={AppColors.textPrimary} />}
              />
            </View>
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
    flexGrow: 1,
    paddingBottom: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  heroSection: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 40,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: AppColors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: AppColors.textPrimary,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: AppColors.textSecondary,
    textAlign: 'center',
    lineHeight: 26,
    maxWidth: 300,
  },
  previewContainer: {
    flex: 1,
    gap: 20,
    paddingVertical: 20,
    minHeight: 400,
  },
  previewCard: {
    padding: 0,
    overflow: 'hidden',
  },
  previewContent: {
    padding: 20,
    alignItems: 'center',
  },
  previewImage: {
    width: 80,
    height: 60,
    borderRadius: 12,
    marginBottom: 16,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: AppColors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  previewDescription: {
    fontSize: 14,
    color: AppColors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  ctaSection: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  timeEstimate: {
    fontSize: 14,
    color: AppColors.textTertiary,
    marginBottom: 20,
  },
  startButton: {
    width: '100%',
  },
});