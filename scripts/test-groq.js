#!/usr/bin/env node

/**
 * Test script for GroqCloud API integration
 * Run with: node scripts/test-groq.js YOUR_API_KEY
 */

const { runAllGroqTests } = require('../lib/groqService.test.ts');

async function main() {
  const apiKey = process.argv[2];
  
  if (!apiKey) {
    console.log('❌ Please provide your GroqCloud API key as an argument');
    console.log('Usage: node scripts/test-groq.js YOUR_API_KEY');
    console.log('\nTo get your API key:');
    console.log('1. Sign up at https://console.groq.com/');
    console.log('2. Navigate to API Keys section');
    console.log('3. Create a new API key');
    console.log('4. Copy the key and run this script');
    process.exit(1);
  }
  
  console.log('🧪 Testing GroqCloud API integration...\n');
  
  try {
    const results = await runAllGroqTests(apiKey);
    
    if (Object.values(results).every(result => result.success)) {
      console.log('\n🎉 All tests passed! Your GroqCloud integration is working correctly.');
      console.log('\nNext steps:');
      console.log('1. Add your API key to your .env file:');
      console.log('   EXPO_PUBLIC_GROQ_API_KEY=' + apiKey);
      console.log('2. Restart your development server');
      console.log('3. Test the AI chat features in your app');
    } else {
      console.log('\n⚠️ Some tests failed. Please check:');
      console.log('- Your API key is correct');
      console.log('- You have sufficient credits in your GroqCloud account');
      console.log('- Your network connection is stable');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Test execution failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
} 