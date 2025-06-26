import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { Chrome as Home, RotateCcw, Brain, Utensils, User } from 'lucide-react-native';

export default function TabLayout() {
  const iconSize = 24;
  
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#1A1A1A', // Solid background
          borderTopWidth: 1,
          borderTopColor: 'rgba(255, 255, 255, 0.2)',
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: Platform.OS === 'ios' ? 85 : 85, // Reduced from 100 to 85
          paddingBottom: Platform.OS === 'ios' ? 28 : 16, // Reduced padding
          paddingTop: 12, // Reduced from 16 to 12
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.6)',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4, // Reduced from 6 to 4
          marginBottom: 0,
        },
        tabBarIconStyle: {
          marginTop: 2, // Reduced from 4 to 2
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
        name="ai-coach"
        options={{
          title: 'AI Coach',
          tabBarIcon: ({ color, focused }) => (
            <Brain 
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
  );
}