import { Tabs } from 'expo-router';
import { Platform, Dimensions } from 'react-native';
import { Chrome as Home, RotateCcw, Utensils, User, Zap } from 'lucide-react-native';
import NavigationWrapper from '@/components/NavigationWrapper';

const { width } = Dimensions.get('window');

export default function TabLayout() {
  const iconSize = 24;
  const isWebDesktop = Platform.OS === 'web' && width >= 768;
  
  // Hide tab bar on web desktop since we have sidebar navigation
  const tabBarStyle = isWebDesktop ? { display: 'none' } : {
    backgroundColor: '#1A1A1A',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    right: 0,
    height: Platform.OS === 'ios' ? 95 : 85,
    paddingBottom: Platform.OS === 'ios' ? 35 : 15,
    paddingTop: 12,
  };
  
  return (
    <NavigationWrapper>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle,
          tabBarActiveTintColor: '#007AFF',
          tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.6)',
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
            marginTop: 4,
            marginBottom: 0,
          },
          tabBarIconStyle: {
            marginTop: 2,
          },
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, focused }) => (
              <Home 
                size={iconSize} 
                color={color}
                strokeWidth={focused ? 2.5 : 2}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="routines"
          options={{
            title: 'Routines',
            tabBarIcon: ({ color, focused }) => (
              <RotateCcw 
                size={iconSize} 
                color={color}
                strokeWidth={focused ? 2.5 : 2}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="ai-enhanced"
          options={{
            title: 'AI Coach',
            tabBarIcon: ({ color, focused }) => (
              <Zap 
                size={iconSize} 
                color={color}
                strokeWidth={focused ? 2.5 : 2}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="nutrition"
          options={{
            title: 'Nutrition',
            tabBarIcon: ({ color, focused }) => (
              <Utensils 
                size={iconSize} 
                color={color}
                strokeWidth={focused ? 2.5 : 2}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, focused }) => (
              <User 
                size={iconSize} 
                color={color}
                strokeWidth={focused ? 2.5 : 2}
              />
            ),
          }}
        />
      </Tabs>
    </NavigationWrapper>
  );
}