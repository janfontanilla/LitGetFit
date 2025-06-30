import { Slot, useSegments, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { AppColors } from '@/styles/colors';
import { useOnboardingStore } from '@/store/onboardingStore';
import { StatusBar } from 'expo-status-bar';

const InitialLayout = () => {
  const { hasCompletedOnboarding, _hasHydrated } = useOnboardingStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    console.log('[LAYOUT] Hydrated:', _hasHydrated, 'Onboarded:', hasCompletedOnboarding, 'Segments:', segments);
    if (!_hasHydrated) return;
    const inOnboarding = segments[0] === 'onboarding';
    if (!hasCompletedOnboarding && !inOnboarding) {
      router.replace('/onboarding');
    } else if (hasCompletedOnboarding && inOnboarding) {
      router.replace('/(tabs)');
    }
  }, [hasCompletedOnboarding, _hasHydrated, segments, router]);

  if (!_hasHydrated) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={AppColors.primary} />
        <Text style={{color: AppColors.textPrimary, marginTop: 16}}>Loading (hydration)...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Slot />
      <StatusBar style="light" />
    </View>
  );
};

export default function RootLayout() {
  return <InitialLayout />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: AppColors.background,
  },
});