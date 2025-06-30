# 🏋️ Lit Get Fit - AI Fitness Coach

A cutting-edge AI-powered fitness companion built with React Native and Expo. Get personalized workouts, real-time form analysis, and intelligent nutrition coaching all in one beautiful app.

![Lit Get Fit](https://images.pexels.com/photos/416778/pexels-photo-416778.jpeg?auto=compress&cs=tinysrgb&w=1200&h=400&dpr=2)

## ✨ Features

### 🤖 AI-Powered Coaching
- **Real-time Form Analysis**: Advanced computer vision analyzes your workout form and provides instant feedback
- **Personalized Workouts**: AI generates custom routines based on your goals, experience, and available time
- **Smart Progression**: Adaptive difficulty that evolves with your fitness journey
- **GroqCloud AI Chat**: Intelligent chatbot powered by GroqCloud API for personalized fitness and nutrition advice

### 🍎 Intelligent Nutrition
- **Voice Food Logging**: Simply speak what you ate - "2 eggs and toast for breakfast"
- **Premium Voice Feedback**: Encouraging AI coach powered by ElevenLabs for motivational responses
- **Smart Meal Analysis**: Automatic calorie and macro estimation from natural language
- **Nutrition Chat**: Ask questions and get personalized dietary advice powered by GroqCloud AI

### 💪 Comprehensive Workout System
- **Custom Workout Builder**: Create detailed workouts with exercises, sets, reps, and rest times
- **AI Routine Generator**: Generate complete weekly routines or single targeted workouts
- **Exercise Library**: Extensive database with proper form instructions
- **Progress Tracking**: Monitor your fitness journey with detailed analytics

## 🚀 Tech Stack

- **Frontend**: React Native with Expo SDK 52
- **Navigation**: Expo Router 4.0 with tab-based architecture
- **Database**: Supabase (PostgreSQL)
- **AI Chat**: GroqCloud API (Llama3-8b model)
- **AI Voice**: ElevenLabs Text-to-Speech
- **Camera**: Expo Camera for form analysis
- **Animations**: React Native Reanimated
- **Icons**: Lucide React Native
- **Styling**: StyleSheet with custom design system

## 📱 Screenshots

### Onboarding & Profile Setup
Personalized setup flow that adapts the app to your fitness goals and experience level.

### AI Coach Camera
Real-time form analysis with live feedback and rep counting.

### Voice Nutrition Logger
Speak naturally to log meals with intelligent parsing and encouraging feedback.

### Custom Workout Builder
Drag-and-drop workout creation with weight unit conversion and exercise reordering.

## 🛠️ Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Expo CLI
- Supabase account
- GroqCloud account (for AI chat features)
- ElevenLabs account (optional, for premium voice features)

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd lit-get-fit
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   
   Create a `.env` file in the root directory:
   ```env
   # Supabase Configuration
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   
   # GroqCloud Configuration (Required for AI chat)
   EXPO_PUBLIC_GROQ_API_KEY=your_groq_api_key
   
   # ElevenLabs Configuration (Optional, for voice features)
   EXPO_PUBLIC_ELEVENLABS_API_KEY=your_elevenlabs_api_key
   ```

   **Getting your GroqCloud API Key:**
   1. Sign up at [GroqCloud](https://console.groq.com/)
   2. Navigate to API Keys section
   3. Create a new API key
   4. Copy the key to your `.env` file

4. **Database Setup**
   
   The app uses Supabase for data storage. The required tables will be created automatically using the migration files in `/supabase/migrations/`.

   Tables included:
   - `user_profiles` - User onboarding data and preferences
   - `workouts` - Custom workout routines and exercises
   - `food_logs` - Nutrition tracking and meal history

5. **Start the development server**
   ```bash
   npm start
   ```

6. **Run on your preferred platform**
   - Web: Press `w`
   - iOS Simulator: Press `i`
   - Android Emulator: Press `a`
   - Physical Device: Scan QR code with Expo Go

## 🏗️ Project Structure

```
lit-get-fit/
├── app/                          # Expo Router pages
│   ├── (tabs)/                   # Tab navigation
│   │   ├── index.tsx            # Home dashboard
│   │   ├── routines.tsx         # Workout routines
│   │   ├── ai-coach.tsx         # AI form analysis
│   │   ├── nutrition.tsx        # Nutrition tracking
│   │   └── profile.tsx          # User profile
│   ├── onboarding/              # User setup flow
│   ├── create-workout/          # Workout creation
│   └── _layout.tsx              # Root layout
├── components/                   # Reusable UI components
│   ├── LiquidGlassCard.tsx      # Glassmorphism cards
│   ├── GlassButton.tsx          # Styled buttons
│   ├── VoiceFoodLogger.tsx      # Voice nutrition input
│   ├── AIChatInterface.tsx      # AI chat interface
│   └── ...
├── hooks/                       # Custom React hooks
│   ├── useChatContext.ts        # AI chat state management
│   └── useFrameworkReady.ts     # Framework initialization
├── lib/                         # Services and utilities
│   ├── supabase.ts              # Database client
│   ├── groqService.ts           # GroqCloud AI service
│   ├── foodLogService.ts        # Nutrition data
│   └── elevenLabsService.ts     # AI voice synthesis
├── styles/                      # Design system
│   └── colors.ts                # Color palette
├── store/                       # State management
│   └── onboardingStore.ts       # User setup state
└── supabase/migrations/         # Database schema
```

## 🎯 Key Features Deep Dive

### AI Form Analysis
The AI Coach uses your device's camera to provide real-time feedback on exercise form. It can:
- Count repetitions automatically
- Detect form issues and provide corrections
- Track workout progress
- Provide motivational coaching

### GroqCloud AI Chat Integration
The app features an intelligent chatbot powered by GroqCloud's Llama3-8b model:
- **Nutrition Coach**: Get personalized meal advice, macro analysis, and recipe suggestions
- **Workout Coach**: Receive form tips, exercise modifications, and workout recommendations
- **Motivational Support**: Encouraging messages and progress tracking
- **Context-Aware**: The AI understands your fitness goals, experience level, and current workout

### Voice Nutrition Logging
Simply speak what you ate in natural language:
- "2 scrambled eggs and whole wheat toast for breakfast"
- "1 cup of brown rice with grilled chicken for lunch"
- "Apple as an afternoon snack"

## 🔧 API Configuration

### GroqCloud API
The app uses GroqCloud's fast and cost-effective Llama3-8b model for AI chat features:

```typescript
// Example usage in components
import { getGroqService } from '@/lib/groqService';

const groqService = getGroqService();
const response = await groqService.generateResponse([
  { role: 'user', content: 'How can I improve my squat form?' }
]);
```

**Features:**
- Real-time AI responses
- Context-aware conversations
- Personalized fitness advice
- Nutrition guidance
- Motivational support

### ElevenLabs Voice Synthesis
For premium voice features, the app integrates with ElevenLabs:

```typescript
// Example usage
import { ElevenLabsService } from '@/lib/elevenLabsService';

const voiceService = new ElevenLabsService(apiKey);
const audioBuffer = await voiceService.generateSpeech(
  "Great job on that set! Keep up the excellent form.",
  ElevenLabsService.VOICES.RACHEL
);
```

## 🚀 Deployment

### Web Deployment
```bash
npm run build:web
```

### Mobile Deployment
```bash
# For iOS
eas build --platform ios

# For Android
eas build --platform android
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- GroqCloud for providing fast and reliable AI chat capabilities
- ElevenLabs for high-quality voice synthesis
- Supabase for the backend infrastructure
- Expo team for the amazing development platform

## 📞 Support

For support, email support@litgetfit.com or join our Discord community.

---

**Built with ❤️ for the fitness community**

Transform your fitness journey with AI-powered coaching, personalized nutrition, and beautiful design.