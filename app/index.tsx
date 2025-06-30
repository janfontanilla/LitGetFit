import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useOnboardingStore } from '@/store/onboardingStore';
import Dashboard from './(tabs)/index';

export default function Home() {
  const { hasCompletedOnboarding, _hasHydrated } = useOnboardingStore();
  const router = useRouter();

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!hasCompletedOnboarding) {
      router.replace('/onboarding');
    }
  }, [hasCompletedOnboarding, _hasHydrated, router]);

  if (!_hasHydrated || !hasCompletedOnboarding) {
    return null;
  }

  return <Dashboard />;
}