import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { 
  Camera, 
  Mic, 
  MicOff, 
  Settings, 
  Play, 
  Pause, 
  RotateCcw 
} from 'lucide-react-native';

import LiquidGlassCard from '@/components/LiquidGlassCard';
import GlassButton from '@/components/GlassButton';
import { AppColors, Gradients } from '@/styles/colors';

const { width, height } = Dimensions.get('window');

type CoachingState = 'idle' | 'preparing' | 'active' | 'paused' | 'completed';

export default function AICoachScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [coachingState, setCoachingState] = useState<CoachingState>('idle');
  const [facing, setFacing] = useState<CameraType>('front');
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [repCount, setRepCount] = useState(0);
  const [currentExercise, setCurrentExercise] = useState('Push-ups');
  const cameraRef = useRef<CameraView>(null);

  const triggerHaptic = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const startCoaching = () => {
    setCoachingState('active');
    setRepCount(0);
    triggerHaptic();
  };

  const pauseCoaching = () => {
    setCoachingState(coachingState === 'paused' ? 'active' : 'paused');
    triggerHaptic();
  };

  const toggleCamera = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
    triggerHaptic();
  };

  const toggleVoice = () => {
    setIsVoiceEnabled(!isVoiceEnabled);
    triggerHaptic();
  };

  const renderCameraPermissionRequest = () => (
    <View style={styles.permissionContainer}>
      <LiquidGlassCard style={styles.permissionCard}>
        <Camera size={48} color={AppColors.primary} style={styles.permissionIcon} />
        <Text style={styles.permissionTitle}>Camera Access Required</Text>
        <Text style={styles.permissionText}>
          The AI Coach needs camera access to analyze your form and provide real-time feedback.
        </Text>
        <GlassButton
          title="Grant Camera Permission"
          onPress={requestPermission}
          variant="primary"
          style={styles.permissionButton}
        />
      </LiquidGlassCard>
    </View>
  );

  const renderCoachingOverlay = () => (
    <View style={styles.overlay}>
      {/* Top Overlay - Exercise Info */}
      <View style={styles.topOverlay}>
        <LiquidGlassCard style={styles.exerciseCard}>
          <Text style={styles.exerciseName}>{currentExercise}</Text>
          <Text style={styles.exerciseInstructions}>
            Keep your form steady and controlled
          </Text>
        </LiquidGlassCard>
      </View>

      {/* Center Overlay - Rep Counter */}
      {coachingState === 'active' && (
        <View style={styles.centerOverlay}>
          <LiquidGlassCard style={styles.repCounter}>
            <Text style={styles.repCountText}>{repCount}</Text>
            <Text style={styles.repLabel}>reps</Text>
          </LiquidGlassCard>
        </View>
      )}

      {/* Bottom Overlay - Controls */}
      <View style={styles.bottomOverlay}>
        <View style={styles.controlsContainer}>
          {/* Voice Toggle */}
          <TouchableOpacity
            style={styles.controlButton}
            onPress={toggleVoice}
            accessibilityLabel={isVoiceEnabled ? "Disable voice" : "Enable voice"}
          >
            <View style={styles.controlButtonInner}>
              {isVoiceEnabled ? (
                <Mic size={24} color={AppColors.textPrimary} />
              ) : (
                <MicOff size={24} color={AppColors.textSecondary} />
              )}
            </View>
          </TouchableOpacity>

          {/* Main Action Button */}
          <TouchableOpacity
            style={[
              styles.mainActionButton,
              coachingState === 'active' && styles.activeActionButton,
            ]}
            onPress={coachingState === 'idle' ? startCoaching : pauseCoaching}
            accessibilityLabel={
              coachingState === 'idle' 
                ? "Start workout" 
                : coachingState === 'active' 
                ? "Pause workout" 
                : "Resume workout"
            }
          >
            <View style={styles.mainActionInner}>
              {coachingState === 'idle' ? (
                <Play size={32} color={AppColors.textPrimary} />
              ) : coachingState === 'active' ? (
                <Pause size={32} color={AppColors.textPrimary} />
              ) : (
                <Play size={32} color={AppColors.textPrimary} />
              )}
            </View>
          </TouchableOpacity>

          {/* Camera Toggle */}
          <TouchableOpacity
            style={styles.controlButton}
            onPress={toggleCamera}
            accessibilityLabel="Switch camera"
          >
            <View style={styles.controlButtonInner}>
              <RotateCcw size={24} color={AppColors.textPrimary} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Coaching Feedback */}
        {coachingState === 'active' && (
          <LiquidGlassCard style={styles.feedbackCard}>
            <Text style={styles.feedbackText}>
              Great form! Keep your back straight and engage your core.
            </Text>
          </LiquidGlassCard>
        )}
      </View>
    </View>
  );

  if (!permission) {
    return (
      <LinearGradient colors={Gradients.background} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading camera...</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  if (!permission.granted) {
    return (
      <LinearGradient colors={Gradients.background} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          {renderCameraPermissionRequest()}
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView 
        ref={cameraRef}
        style={styles.camera} 
        facing={facing}
      >
        <SafeAreaView style={styles.safeArea}>
          {renderCoachingOverlay()}
        </SafeAreaView>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: AppColors.textSecondary,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  permissionCard: {
    alignItems: 'center',
    maxWidth: 300,
  },
  permissionIcon: {
    marginBottom: 16,
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: AppColors.textPrimary,
    marginBottom: 12,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 14,
    color: AppColors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  permissionButton: {
    width: '100%',
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topOverlay: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  exerciseCard: {
    alignItems: 'center',
  },
  exerciseName: {
    fontSize: 20,
    fontWeight: '600',
    color: AppColors.textPrimary,
    marginBottom: 4,
  },
  exerciseInstructions: {
    fontSize: 14,
    color: AppColors.textSecondary,
    textAlign: 'center',
  },
  centerOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -60 }, { translateY: -60 }],
  },
  repCounter: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  repCountText: {
    fontSize: 36,
    fontWeight: '700',
    color: AppColors.primary,
  },
  repLabel: {
    fontSize: 12,
    color: AppColors.textSecondary,
    fontWeight: '600',
  },
  bottomOverlay: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
  },
  controlButtonInner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  mainActionButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
  },
  activeActionButton: {
    shadowColor: AppColors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
  },
  mainActionInner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 122, 255, 0.2)',
  },
  feedbackCard: {
    alignItems: 'center',
  },
  feedbackText: {
    fontSize: 14,
    color: AppColors.textPrimary,
    textAlign: 'center',
    lineHeight: 20,
  },
});