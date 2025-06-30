import React from 'react';
import { View, StyleSheet, Platform, Dimensions } from 'react-native';
import ResponsiveNavigation from './ResponsiveNavigation';

const { width } = Dimensions.get('window');

interface NavigationWrapperProps {
  children: React.ReactNode;
}

export default function NavigationWrapper({ children }: NavigationWrapperProps) {
  const isDesktop = Platform.OS === 'web' && width >= 768;

  return (
    <View style={styles.container}>
      {Platform.OS === 'web' && <ResponsiveNavigation />}
      <View style={[
        styles.content,
        isDesktop && styles.desktopContent,
        Platform.OS === 'web' && width < 768 && styles.mobileWebContent,
      ]}>
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
    marginLeft: 280, // Width of desktop sidebar
  },
  mobileWebContent: {
    paddingTop: 80, // Height of mobile header
  },
});