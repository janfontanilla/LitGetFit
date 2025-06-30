import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { AppColors } from '@/styles/colors';
import LiquidGlassCard from './LiquidGlassCard';
import { userProfileService } from '@/lib/supabase';

interface WelcomeMessageProps {
  onPress?: () => void;
  style?: any;
}

export default function WelcomeMessage({ onPress, style }: WelcomeMessageProps) {
  const [userName, setUserName] = useState<string>('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [greeting, setGreeting] = useState<string>('');

  useEffect(() => {
    loadUserProfile();
    setGreetingBasedOnTime();
  }, []);

  const loadUserProfile = async () => {
    try {
      const profiles = await userProfileService.getAllProfiles();
      if (profiles.length > 0) {
        setUserName(profiles[0].name);
        // In a real app, you would load the profile image from the user's profile
        setProfileImage('https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2');
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const setGreetingBasedOnTime = () => {
    const currentHour = new Date().getHours();
    let timeOfDay = '';
    
    if (currentHour < 12) {
      timeOfDay = 'morning';
    } else if (currentHour < 17) {
      timeOfDay = 'afternoon';
    } else {
      timeOfDay = 'evening';
    }
    
    setGreeting(`Good ${timeOfDay}`);
  };

  return (
    <TouchableOpacity 
      style={[styles.container, style]} 
      onPress={onPress}
      activeOpacity={0.9}
    >
      <LiquidGlassCard style={styles.card}>
        <View style={styles.content}>
          <View style={styles.textContainer}>
            <Text style={styles.greeting}>{greeting},</Text>
            <Text style={styles.name}>{userName || 'Fitness Enthusiast'}</Text>
            <Text style={styles.question}>What have you eaten so far today?</Text>
          </View>
          
          {profileImage && (
            <View style={styles.imageContainer}>
              <Image 
                source={{ uri: profileImage }} 
                style={styles.profileImage}
              />
            </View>
          )}
        </View>
      </LiquidGlassCard>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  card: {
    marginBottom: 16,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: 16,
    color: AppColors.textSecondary,
    marginBottom: 4,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: AppColors.textPrimary,
    marginBottom: 8,
  },
  question: {
    fontSize: 16,
    color: AppColors.primary,
    fontWeight: '500',
  },
  imageContainer: {
    marginLeft: 16,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: AppColors.primary,
  },
});