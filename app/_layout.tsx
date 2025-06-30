import 'react-native-url-polyfill/auto';
import { SessionProvider, useSession } from '@/hooks/useSession';
import { Slot, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { AppColors } from '@/styles/colors';
import { StatusBar } from 'expo-status-bar';
import { supabase } from '@/lib/supabase';

const InitialLayout = () => {
  const { session, isLoading } = useSession();
  const segments = useSegments();
  const router = useRouter();

  // Handle OAuth callback
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash.includes('access_token')) {
      supabase.auth.exchangeCodeForSession(window.location.hash).then(({ data, error }) => {
        if (data?.session) {
          window.history.replaceState({}, document.title, '/');
          router.replace('/(tabs)');
        }
      });
    }
  }, []);

  useEffect(() => {
    if (isLoading) {
      return;
    }
    const inAuthGroup = (segments[0] as any) === '(auth)';
    if (session && !inAuthGroup) {
      router.replace('/(tabs)');
    } else if (!session && !inAuthGroup) {
      router.replace('/(auth)/login' as any);
    }
  }, [session, isLoading, segments, router]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={AppColors.primary} />
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

// This is the root layout for the entire app.
export default function RootLayout() {
  return (
    <SessionProvider>
      <InitialLayout />
    </SessionProvider>
  );
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