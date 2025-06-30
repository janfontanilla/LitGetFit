import 'react-native-url-polyfill/auto';
import { SessionProvider, useSession } from '@/hooks/useSession';
import { Slot, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { AppColors } from '@/styles/colors';
import { StatusBar } from 'expo-status-bar';

const InitialLayout = () => {
  const { session, isLoading } = useSession();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    const inAuthGroup = (segments[0] as any) === '(auth)';

    if (session && !inAuthGroup) {
      // User is authenticated and not in the auth flow,
      // so we can redirect to the main app.
      router.replace('/(tabs)');
    } else if (!session && !inAuthGroup) {
      // User is not authenticated and not in the auth flow,
      // so redirect to the login page.
      router.replace('/(auth)/login' as any);
    }
    // If the user is in the auth group, we don't need to do anything,
    // as they are already where they should be (login/signup page).

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