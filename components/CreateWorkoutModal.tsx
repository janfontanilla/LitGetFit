import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { X, CreditCard as Edit3, Zap } from 'lucide-react-native';
import { AppColors } from '@/styles/colors';
import LiquidGlassCard from './LiquidGlassCard';

const { height } = Dimensions.get('window');

interface CreateWorkoutModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectManual: () => void;
  onSelectAI: () => void;
}

export default function CreateWorkoutModal({
  visible,
  onClose,
  onSelectManual,
  onSelectAI,
}: CreateWorkoutModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <BlurView intensity={20} tint="dark" style={styles.overlay}>
        <View style={styles.modalContainer}>
          <LiquidGlassCard style={styles.modal}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>How would you like to create your workout?</Text>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <X size={24} color={AppColors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Creation Options */}
            <View style={styles.optionsContainer}>
              {/* Manual Creation */}
              <TouchableOpacity
                style={styles.optionButton}
                onPress={onSelectManual}
                activeOpacity={0.7}
              >
                <LiquidGlassCard style={styles.optionCard}>
                  <View style={styles.optionContent}>
                    <View style={styles.optionIcon}>
                      <Edit3 size={32} color={AppColors.primary} />
                    </View>
                    <Text style={styles.optionTitle}>Create from Scratch</Text>
                    <Text style={styles.optionDescription}>
                      Build your own custom workout with exercises, sets, and reps
                    </Text>
                  </View>
                </LiquidGlassCard>
              </TouchableOpacity>

              {/* AI Generation */}
              <TouchableOpacity
                style={styles.optionButton}
                onPress={onSelectAI}
                activeOpacity={0.7}
              >
                <LiquidGlassCard style={styles.optionCard}>
                  <View style={styles.optionContent}>
                    <View style={styles.optionIcon}>
                      <Zap size={32} color={AppColors.accent} />
                    </View>
                    <Text style={styles.optionTitle}>Generate with AI</Text>
                    <Text style={styles.optionDescription}>
                      Let AI create the perfect workout or routine based on your goals
                    </Text>
                  </View>
                </LiquidGlassCard>
              </TouchableOpacity>
            </View>
          </LiquidGlassCard>
        </View>
      </BlurView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '90%',
    maxWidth: 400,
    maxHeight: height * 0.8,
  },
  modal: {
    padding: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: AppColors.textPrimary,
    flex: 1,
    marginRight: 16,
    lineHeight: 26,
  },
  closeButton: {
    padding: 4,
  },
  optionsContainer: {
    gap: 16,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  optionButton: {
    width: '100%',
  },
  optionCard: {
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  optionContent: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  optionIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: AppColors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  optionDescription: {
    fontSize: 14,
    color: AppColors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});