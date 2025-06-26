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
          backgroundColor: '#1A1A1A', // Solid background instead of transparent
          borderTopWidth: 1,
          borderTopColor: 'rgba(255, 255, 255, 0.2)',
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: Platform.OS === 'ios' ? 88 : 88, // Increased height for both platforms
          paddingBottom: Platform.OS === 'ios' ? 28 : 28, // Increased padding
          paddingTop: 12, // Increased top padding
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.6)',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
          marginBottom: 4, // Added bottom margin
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