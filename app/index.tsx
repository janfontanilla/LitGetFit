import { useEffect } from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useOnboardingStore } from '@/store/onboardingStore';
import Dashboard from './(tabs)/index';
import { AppColors } from '@/styles/colors';

export default function Home() {
  const { hasCompletedOnboarding, _hasHydrated } = useOnboardingStore();
  const router = useRouter();

  useEffect(() => {
    console.log('[INDEX] Hydrated:', _hasHydrated, 'Onboarded:', hasCompletedOnboarding);
  }, [_hasHydrated, hasCompletedOnboarding]);

  useEffect(() => {
    if (_hasHydrated && !hasCompletedOnboarding) {
      router.replace('/onboarding');
    }
  }, [_hasHydrated, hasCompletedOnboarding, router]);

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

  if (!hasCompletedOnboarding) {
    // Don't render anything while redirecting
    return null;
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