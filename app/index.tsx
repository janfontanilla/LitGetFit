import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useOnboardingStore } from '@/store/onboardingStore';
import Dashboard from './(tabs)/index';
import { ActivityIndicator, View, Text } from 'react-native';
import { AppColors } from '@/styles/colors';

export default function Home() {
  const { hasCompletedOnboarding, _hasHydrated } = useOnboardingStore();
  const router = useRouter();

  useEffect(() => {
    console.log('[INDEX] Hydrated:', _hasHydrated, 'Onboarded:', hasCompletedOnboarding);
    if (!_hasHydrated) return;
    if (!hasCompletedOnboarding) {
      router.replace('/onboarding');
    }
  }, [hasCompletedOnboarding, _hasHydrated, router]);

  if (!_hasHydrated) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: AppColors.background }}>
        <ActivityIndicator size="large" color={AppColors.primary} />
        <Text style={{color: AppColors.textPrimary, marginTop: 16}}>Loading (hydration)...</Text>
      </View>
    );
  }

  if (!hasCompletedOnboarding) {
    // Onboarding route will be shown by router.replace
    return null;
  }

  return <Dashboard />;
}