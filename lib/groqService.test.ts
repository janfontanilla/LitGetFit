import { GroqService } from './groqService';

// Simple test function to verify GroqCloud integration
export const testGroqIntegration = async (apiKey: string) => {
  try {
    const groqService = new GroqService(apiKey);
    
    console.log('🧪 Testing GroqCloud integration...');
    
    // Test basic response generation
    const response = await groqService.generateResponse([
      { role: 'user', content: 'Hello! Can you give me a quick fitness tip?' }
    ]);
    
    console.log('✅ GroqCloud integration successful!');
    console.log('Response:', response.message);
    
    return {
      success: true,
      message: response.message,
    };
  } catch (error) {
    console.error('❌ GroqCloud integration failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

// Test workout advice generation
export const testWorkoutAdvice = async (apiKey: string) => {
  try {
    const groqService = new GroqService(apiKey);
    
    console.log('🏋️ Testing workout advice generation...');
    
    const response = await groqService.generateWorkoutAdvice(
      'push-ups',
      'Keep your back straight',
      5
    );
    
    console.log('✅ Workout advice generation successful!');
    console.log('Advice:', response.message);
    
    return {
      success: true,
      message: response.message,
    };
  } catch (error) {
    console.error('❌ Workout advice generation failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

// Test nutrition advice generation
export const testNutritionAdvice = async (apiKey: string) => {
  try {
    const groqService = new GroqService(apiKey);
    
    console.log('🍎 Testing nutrition advice generation...');
    
    const response = await groqService.generateNutritionAdvice(
      'What should I eat before a workout?',
      {
        todaysLogs: [],
        totalCalories: 0,
        macros: { protein: 0, carbs: 0, fats: 0 },
        goals: { calories: 2000, protein: 150, carbs: 200, fats: 70 }
      }
    );
    
    console.log('✅ Nutrition advice generation successful!');
    console.log('Advice:', response.message);
    
    return {
      success: true,
      message: response.message,
    };
  } catch (error) {
    console.error('❌ Nutrition advice generation failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

// Test motivational message generation
export const testMotivationalMessage = async (apiKey: string) => {
  try {
    const groqService = new GroqService(apiKey);
    
    console.log('💪 Testing motivational message generation...');
    
    const response = await groqService.generateMotivationalMessage('workout_start');
    
    console.log('✅ Motivational message generation successful!');
    console.log('Message:', response.message);
    
    return {
      success: true,
      message: response.message,
    };
  } catch (error) {
    console.error('❌ Motivational message generation failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

// Run all tests
export const runAllGroqTests = async (apiKey: string) => {
  console.log('🚀 Running all GroqCloud integration tests...\n');
  
  const results = {
    basic: await testGroqIntegration(apiKey),
    workout: await testWorkoutAdvice(apiKey),
    nutrition: await testNutritionAdvice(apiKey),
    motivational: await testMotivationalMessage(apiKey),
  };
  
  const allPassed = Object.values(results).every(result => result.success);
  
  console.log('\n📊 Test Results:');
  console.log(`Basic Integration: ${results.basic.success ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Workout Advice: ${results.workout.success ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Nutrition Advice: ${results.nutrition.success ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Motivational Messages: ${results.motivational.success ? '✅ PASS' : '❌ FAIL'}`);
  
  if (allPassed) {
    console.log('\n🎉 All tests passed! GroqCloud integration is working correctly.');
  } else {
    console.log('\n⚠️ Some tests failed. Please check your API key and network connection.');
  }
  
  return results;
}; 