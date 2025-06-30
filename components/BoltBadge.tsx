import React from 'react';
import { Image, StyleSheet, TouchableOpacity, View, Platform, Linking } from 'react-native';

export default function BoltBadge() {
  const handlePress = () => {
    Linking.openURL('https://bolt.new/');
  };

  return (
    <View style={styles.container} pointerEvents="box-none">
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handlePress}
        accessibilityLabel="Built with Bolt.new"
        style={styles.touchable}
      >
        <Image
          source={require('@/assets/images/white_circle_360x360.png')}
          style={styles.badge}
          resizeMode="contain"
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    zIndex: 1000,
    pointerEvents: 'box-none',
  },
  touchable: {
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  badge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
}); 