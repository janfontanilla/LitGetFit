import 'react-native-url-polyfill/auto';
import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/lib/supabase';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Zap } from 'lucide-react-native';
import { AppColors, Gradients } from '@/styles/colors';

export default function LoginScreen() {
  return (
    <LinearGradient colors={Gradients.background} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Zap size={48} color={AppColors.primary} />
            <Text style={styles.title}>Welcome to LitGetFit</Text>
            <Text style={styles.subtitle}>Sign in or create an account to continue</Text>
          </View>
          <View style={styles.authContainer}>
            <Auth
              supabaseClient={supabase}
              appearance={{ theme: ThemeSupa }}
              providers={['google']}
              theme="dark"
              localization={{
                variables: {
                  sign_in: {
                    email_label: 'Email',
                    password_label: 'Password',
                  },
                },
              }}
            />
          </View>
        </View>
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
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: AppColors.textPrimary,
    marginTop: 16,
  },
  subtitle: {
    fontSize: 16,
    color: AppColors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  authContainer: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 24,
  },
}); 