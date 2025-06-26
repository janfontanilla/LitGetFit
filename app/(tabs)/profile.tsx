import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Switch,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Settings, Bell, Shield, Cloud, Watch, Palette, CircleHelp as HelpCircle, Star, LogOut, ChevronRight, Crown, Zap, CreditCard as Edit } from 'lucide-react-native';

import LiquidGlassCard from '@/components/LiquidGlassCard';
import GlassButton from '@/components/GlassButton';
import { AppColors, Gradients } from '@/styles/colors';
import { userProfileService, UserProfile } from '@/lib/supabase';
import { router } from 'expo-router';

interface SettingsOption {
  id: string;
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  hasSwitch?: boolean;
  switchValue?: boolean;
  onPress?: () => void;
  onSwitchChange?: (value: boolean) => void;
  showChevron?: boolean;
  destructive?: boolean;
}

export default function ProfileScreen() {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [cloudSync, setCloudSync] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const profiles = await userProfileService.getAllProfiles();
      if (profiles.length > 0) {
        setUserProfile(profiles[0]); // Get the first profile
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditProfile = () => {
    router.push('/onboarding');
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: () => {
            // Clear user data and go back to welcome screen
            router.replace('/');
          }
        },
      ]
    );
  };

  const userStats = [
    { label: 'Workouts', value: '128', icon: <Zap size={16} color={AppColors.primary} /> },
    { label: 'Streak', value: '12 days', icon: <Zap size={16} color={AppColors.accent} /> },
    { label: 'Level', value: 'Expert', icon: <Crown size={16} color={AppColors.warning} /> },
  ];

  const settingsOptions: SettingsOption[] = [
    {
      id: 'account',
      icon: <User size={20} color={AppColors.textSecondary} />,
      title: 'Account Settings',
      subtitle: 'Manage your personal information',
      showChevron: true,
      onPress: handleEditProfile,
    },
    {
      id: 'notifications',
      icon: <Bell size={20} color={AppColors.textSecondary} />,
      title: 'Notifications',
      subtitle: 'Workout reminders and updates',
      hasSwitch: true,
      switchValue: notifications,
      onSwitchChange: setNotifications,
    },
    {
      id: 'privacy',
      icon: <Shield size={20} color={AppColors.textSecondary} />,
      title: 'Privacy & Security',
      subtitle: 'Control your data and privacy',
      showChevron: true,
      onPress: () => console.log('Privacy settings'),
    },
    {
      id: 'cloud',
      icon: <Cloud size={20} color={AppColors.textSecondary} />,
      title: 'Cloud Sync',
      subtitle: 'Sync data across devices',
      hasSwitch: true,
      switchValue: cloudSync,
      onSwitchChange: setCloudSync,
    },
    {
      id: 'watch',
      icon: <Watch size={20} color={AppColors.textSecondary} />,
      title: 'Apple Watch',
      subtitle: 'Connect your Apple Watch',
      showChevron: true,
      onPress: () => console.log('Apple Watch settings'),
    },
    {
      id: 'appearance',
      icon: <Palette size={20} color={AppColors.textSecondary} />,
      title: 'Appearance',
      subtitle: 'Dark mode and themes',
      hasSwitch: true,
      switchValue: darkMode,
      onSwitchChange: setDarkMode,
    },
    {
      id: 'help',
      icon: <HelpCircle size={20} color={AppColors.textSecondary} />,
      title: 'Help & Support',
      subtitle: 'Get help and contact support',
      showChevron: true,
      onPress: () => console.log('Help & Support'),
    },
    {
      id: 'rate',
      icon: <Star size={20} color={AppColors.textSecondary} />,
      title: 'Rate App',
      subtitle: 'Share your feedback',
      showChevron: true,
      onPress: () => console.log('Rate app'),
    },
    {
      id: 'logout',
      icon: <LogOut size={20} color={AppColors.accent} />,
      title: 'Sign Out',
      destructive: true,
      onPress: handleSignOut,
    },
  ];

  const renderSettingsOption = (option: SettingsOption) => (
    <TouchableOpacity
      key={option.id}
      style={styles.settingsOption}
      onPress={option.onPress}
      disabled={option.hasSwitch}
      activeOpacity={0.7}
    >
      <View style={styles.optionContent}>
        <View style={styles.optionIcon}>
          {option.icon}
        </View>
        <View style={styles.optionText}>
          <Text style={[
            styles.optionTitle,
            option.destructive && styles.destructiveText,
          ]}>
            {option.title}
          </Text>
          {option.subtitle && (
            <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
          )}
        </View>
        <View style={styles.optionAction}>
          {option.hasSwitch ? (
            <Switch
              value={option.switchValue}
              onValueChange={option.onSwitchChange}
              trackColor={{ 
                false: 'rgba(255, 255, 255, 0.2)', 
                true: AppColors.primary 
              }}
              thumbColor={AppColors.textPrimary}
            />
          ) : option.showChevron ? (
            <ChevronRight size={16} color={AppColors.textTertiary} />
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );

  const getDisplayName = () => {
    if (userProfile?.name) {
      return userProfile.name;
    }
    return 'Fitness Enthusiast';
  };

  const getDisplayEmail = () => {
    if (userProfile?.name) {
      return `${userProfile.name.toLowerCase().replace(' ', '.')}@email.com`;
    }
    return 'user@email.com';
  };

  if (isLoading) {
    return (
      <LinearGradient colors={Gradients.background} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading profile...</Text>
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
          {/* Profile Header */}
          <LiquidGlassCard style={styles.profileCard}>
            <View style={styles.profileHeader}>
              <TouchableOpacity style={styles.profileImageContainer}>
                <Image
                  source={{ 
                    uri: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2' 
                  }}
                  style={styles.profileImage}
                />
                <TouchableOpacity style={styles.editBadge} onPress={handleEditProfile}>
                  <Edit size={12} color={AppColors.textPrimary} />
                </TouchableOpacity>
              </TouchableOpacity>
              
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{getDisplayName()}</Text>
                <Text style={styles.profileEmail}>{getDisplayEmail()}</Text>
                
                {userProfile && (
                  <View style={styles.profileDetails}>
                    <Text style={styles.profileDetail}>
                      {userProfile.age} years • {userProfile.height}cm
                      {userProfile.weight && ` • ${userProfile.weight}kg`}
                    </Text>
                    <Text style={styles.profileDetail}>
                      Goal: {userProfile.primary_goal.replace('_', ' ')} • {userProfile.fitness_experience}
                    </Text>
                  </View>
                )}
                
                <View style={styles.subscriptionBadge}>
                  <Crown size={12} color={AppColors.warning} />
                  <Text style={styles.subscriptionText}>Premium Member</Text>
                </View>
              </View>
            </View>
            
            {/* Stats */}
            <View style={styles.statsContainer}>
              {userStats.map((stat, index) => (
                <View key={index} style={styles.statItem}>
                  <View style={styles.statIcon}>
                    {stat.icon}
                  </View>
                  <Text style={styles.statValue}>{stat.value}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </View>
              ))}
            </View>
          </LiquidGlassCard>

          {/* Settings */}
          <LiquidGlassCard style={styles.settingsCard}>
            <Text style={styles.sectionTitle}>Settings</Text>
            
            <View style={styles.settingsList}>
              {settingsOptions.map(renderSettingsOption)}
            </View>
          </LiquidGlassCard>

          {/* App Info */}
          <View style={styles.appInfo}>
            <Text style={styles.appVersion}>Lit Get Fit v1.0.0</Text>
            <View style={styles.legalLinks}>
              <TouchableOpacity>
                <Text style={styles.legalLink}>Terms of Service</Text>
              </TouchableOpacity>
              <Text style={styles.legalSeparator}>•</Text>
              <TouchableOpacity>
                <Text style={styles.legalLink}>Privacy Policy</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.copyright}>© 2024 Lit Get Fit</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: AppColors.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120, // Increased from 100 to 120
  },
  profileCard: {
    margin: 20,
    marginBottom: 16,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  profileImageContainer: {
    position: 'relative',
    marginRight: 16,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: AppColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: AppColors.textPrimary,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: AppColors.textSecondary,
    marginBottom: 8,
  },
  profileDetails: {
    marginBottom: 8,
  },
  profileDetail: {
    fontSize: 12,
    color: AppColors.textTertiary,
    marginBottom: 2,
  },
  subscriptionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 159, 0, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    gap: 4,
  },
  subscriptionText: {
    fontSize: 12,
    fontWeight: '600',
    color: AppColors.warning,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    color: AppColors.textPrimary,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: AppColors.textSecondary,
  },
  settingsCard: {
    margin: 20,
    marginTop: 0,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: AppColors.textPrimary,
    marginBottom: 16,
  },
  settingsList: {
    gap: 4,
  },
  settingsOption: {
    paddingVertical: 4,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  optionIcon: {
    width: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  optionText: {
    flex: 1,
    marginLeft: 8,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: AppColors.textPrimary,
    marginBottom: 2,
  },
  destructiveText: {
    color: AppColors.accent,
  },
  optionSubtitle: {
    fontSize: 12,
    color: AppColors.textSecondary,
  },
  optionAction: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  appInfo: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  appVersion: {
    fontSize: 12,
    color: AppColors.textTertiary,
    marginBottom: 8,
  },
  legalLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  legalLink: {
    fontSize: 12,
    color: AppColors.textSecondary,
    textDecorationLine: 'underline',
  },
  legalSeparator: {
    fontSize: 12,
    color: AppColors.textTertiary,
  },
  copyright: {
    fontSize: 10,
    color: AppColors.textTertiary,
  },
});