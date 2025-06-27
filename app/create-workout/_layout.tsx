import { Stack } from 'expo-router';

export default function CreateWorkoutLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        gestureEnabled: true,
        gestureDirection: 'horizontal',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="ai-routine" />
      <Stack.Screen name="ai-single" />
      <Stack.Screen name="preview" />
    </Stack>
  );
}