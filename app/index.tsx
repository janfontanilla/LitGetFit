import { useEffect } from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import { useOnboardingStore } from '@/store/onboardingStore';
import Dashboard from './(tabs)/index';
import { AppColors } from '@/styles/colors';

export default function Home() {
  const { 
    hasCompletedOnboarding, 
    _hasHydrated,
    currentOnboardingStep,
  } = useOnboardingStore() as {
    hasCompletedOnboarding: boolean;
    _hasHydrated: boolean;
    currentOnboardingStep: string;
  };

  useEffect(() => {
    console.log('[INDEX] Hydrated:', _hasHydrated, 'Onboarded:', hasCompletedOnboarding);
    console.log('[INDEX] Current step:', currentOnboardingStep);
  }, [_hasHydrated, hasCompletedOnboarding, currentOnboardingStep]);

  // Show loading while hydrating
  if (!_hasHydrated) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.debugText}>
          _hasHydrated: {_hasHydrated ? 'true' : 'false'} | hasCompletedOnboarding: {hasCompletedOnboarding ? 'true' : 'false'}
        </Text>
        <ActivityIndicator size="large" color={AppColors.primary} />
        <Text style={{color: AppColors.textPrimary, marginTop: 16}}>Loading (hydration)...</Text>
      </View>
    );
  }

  // Determine which onboarding screen to show
  if (!hasCompletedOnboarding) {
    if (currentOnboardingStep === 'welcome' || currentOnboardingStep === 'index') {
      return <Redirect href="/onboarding/name" />;
    }
    if (currentOnboardingStep === 'name') {
      return <Redirect href="/onboarding/name" />;
    }
    if (currentOnboardingStep === 'age') {
      return <Redirect href="/onboarding/age" />;
    }
    if (currentOnboardingStep === 'measurements') {
      return <Redirect href="/onboarding/measurements" />;
    }
    if (currentOnboardingStep === 'experience') {
      return <Redirect href="/onboarding/experience" />;
    }
    if (currentOnboardingStep === 'goals') {
      return <Redirect href="/onboarding/goals" />;
    }
    if (currentOnboardingStep === 'activity') {
      return <Redirect href="/onboarding/activity" />;
    }
    if (currentOnboardingStep === 'complete') {
      return <Redirect href="/onboarding/complete" />;
    }
    // Fallback to first onboarding screen
    return <Redirect href="/onboarding/name" />;
  }

  // Show dashboard
  return (
    <>
      <Text style={styles.debugText}>
        _hasHydrated: {_hasHydrated ? 'true' : 'false'} | hasCompletedOnboarding: {hasCompletedOnboarding ? 'true' : 'false'}
      </Text>
      <Dashboard />
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: AppColors.background,
  },
  debugText: {
    color: 'red',
    fontWeight: 'bold',
    marginBottom: 16,
  },
});