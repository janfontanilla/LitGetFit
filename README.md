# 🏋️ Lit Get Fit - AI Fitness Coach

A cutting-edge AI-powered fitness companion built with React Native and Expo. Get personalized workouts, real-time form analysis, and intelligent nutrition coaching all in one beautiful app.

![Lit Get Fit](https://images.pexels.com/photos/416778/pexels-photo-416778.jpeg?auto=compress&cs=tinysrgb&w=1200&h=400&dpr=2)

## ✨ Features

### 🤖 AI-Powered Coaching
- **Real-time Form Analysis**: Advanced computer vision analyzes your workout form and provides instant feedback
- **Personalized Workouts**: AI generates custom routines based on your goals, experience, and available time
- **Smart Progression**: Adaptive difficulty that evolves with your fitness journey

### 🍎 Intelligent Nutrition
- **Voice Food Logging**: Simply speak what you ate - "2 eggs and toast for breakfast"
- **Premium Voice Feedback**: Encouraging AI coach powered by ElevenLabs for motivational responses
- **Smart Meal Analysis**: Automatic calorie and macro estimation from natural language
- **Nutrition Chat**: Ask questions and get personalized dietary advice

### 💪 Comprehensive Workout System
- **Custom Workout Builder**: Create detailed workouts with exercises, sets, reps, and rest times
- **AI Routine Generator**: Generate complete weekly routines or single targeted workouts
- **Exercise Library**: Extensive database with proper form instructions
- **Progress Tracking**: Monitor your fitness journey with detailed analytics

### 🎨 Beautiful Design
- **Liquid Glass UI**: Stunning glassmorphism design with smooth animations
- **Dark Theme**: Eye-friendly interface perfect for any lighting
- **Responsive Layout**: Optimized for all screen sizes and orientations
- **Micro-interactions**: Delightful animations and haptic feedback

## 🚀 Tech Stack

- **Frontend**: React Native with Expo SDK 52
- **Navigation**: Expo Router 4.0 with tab-based architecture
- **Database**: Supabase (PostgreSQL)
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
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   EXPO_PUBLIC_ELEVENLABS_API_KEY=your_elevenlabs_api_key
   ```

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
│   └── ...
├── lib/                         # Services and utilities
│   ├── supabase.ts              # Database client
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

### Voice Nutrition Logging
Simply speak what you ate in natural language:
- "2 scrambled eggs and whole wheat toast for breakfast"
- "1 cup of brown rice with grilled chicken for lunch"
- "Apple as an afternoon snack"

The app intelligently parses your speech, estimates calories and macros, and provides encouraging feedback through premium AI voice synthesis.

### Smart Workout Generation
Choose between:
- **Manual Creation**: Build custom workouts exercise by exercise
- **AI Single Workout**: Generate targeted workouts for specific muscle groups
- **AI Weekly Routine**: Create comprehensive multi-day training programs

## 🔧 Configuration

### Voice Features
The app supports multiple voice feedback modes:
- **ElevenLabs Premium**: High-quality AI voice with encouraging personality
- **Silent Mode**: Visual feedback only

### Database Schema
The app uses three main tables:
- **user_profiles**: Stores onboarding data, goals, and preferences
- **workouts**: Custom workout routines with exercises and metadata
- **food_logs**: Nutrition entries with meal timing and macro data

### Customization
- Modify colors in `/styles/colors.ts`
- Adjust voice settings in `/lib/elevenLabsService.ts`
- Update UI components in `/components/`

## 🚀 Deployment

### Web Deployment
```bash
npm run build:web
```

### Mobile App Store
1. Create development build:
   ```bash
   expo build
   ```

2. Submit to app stores using EAS:
   ```bash
   eas submit
   ```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Supabase** for the backend infrastructure
- **ElevenLabs** for premium AI voice synthesis
- **Expo** for the amazing development platform
- **Pexels** for beautiful stock photography
- **Lucide** for the comprehensive icon library

## 📞 Support

For support, email support@litgetfit.com or join our Discord community.

---

**Built with ❤️ for the fitness community**

Transform your fitness journey with AI-powered coaching, personalized nutrition, and beautiful design.