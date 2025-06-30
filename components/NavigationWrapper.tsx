import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Platform, Dimensions } from 'react-native';
import { usePathname } from 'expo-router';
import ResponsiveNavigation from './ResponsiveNavigation';
import { useSession } from '@/hooks/useSession';

const { width } = Dimensions.get('window');

interface NavigationWrapperProps {
  children: React.ReactNode;
}

export default function NavigationWrapper({ children }: NavigationWrapperProps) {
  const isDesktop = Platform.OS === 'web' && width >= 768;
  const pathname = usePathname();
  const [isNavCollapsed, setIsNavCollapsed] = useState(false);
  const { session, isLoading } = useSession();

  const showNavigation = !!session && !pathname.startsWith('/onboarding') && !pathname.startsWith('/(auth)');

  // This is a bit of a hack to communicate collapse state
  // In a real app, this would be managed with a global state manager (like Zustand or Redux)
  useEffect(() => {
    const handleMessage = (event: any) => {
      if (event.data.type === 'nav-collapse') {
        setIsNavCollapsed(event.data.isCollapsed);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const desktopContentStyle = [
    styles.content,
    isDesktop && styles.desktopContent,
    isDesktop && showNavigation && (isNavCollapsed ? styles.desktopContentCollapsed : styles.desktopContentExpanded),
    Platform.OS === 'web' && width < 768 && styles.mobileWebContent,
  ];

  return (
    <View style={styles.container}>
      {isDesktop && showNavigation && <ResponsiveNavigation />}
      <View style={desktopContentStyle}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  content: {
    flex: 1,
  },
  desktopContent: {
    // No default margin
  },
  desktopContentExpanded: {
    marginLeft: 260,
  },
  desktopContentCollapsed: {
    marginLeft: 90,
  },
  mobileWebContent: {
    paddingTop: 80, // Height of mobile header
  },
});