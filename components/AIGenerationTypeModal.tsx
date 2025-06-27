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
import { X, Calendar, Dumbbell, ArrowRight } from 'lucide-react-native';
import { AppColors } from '@/styles/colors';
import LiquidGlassCard from './LiquidGlassCard';
import GlassButton from './GlassButton';

const { height } = Dimensions.get('window');

interface AIGenerationTypeModalProps {
  visible: boolean;
  onClose: () => void;
  onBack: () => void;
  onSelectRoutine: () => void;
  onSelectSingleWorkout: () => void;
}

export default function AIGenerationTypeModal({
  visible,
  onClose,
  onBack,
  onSelectRoutine,
  onSelectSingleWorkout,
}: AIGenerationTypeModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <BlurView intensity={20} tint="dark" style={styles.overlay}>
        <View style={styles.modalContainer}>
          <LiquidGlassCard style={styles.modal}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>What do you want to generate?</Text>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <X size={24} color={AppColors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Generation Options */}
            <View style={styles.optionsContainer}>
              {/* Full Routine */}
              <TouchableOpacity
                style={styles.optionButton}
                onPress={onSelectRoutine}
                activeOpacity={0.7}
              >
                <LiquidGlassCard style={styles.optionCard}>
                  <View style={styles.optionContent}>
                    <View style={styles.optionLeft}>
                      <View style={styles.optionIcon}>
                        <Calendar size={28} color={AppColors.primary} />
                      </View>
                      <View style={styles.optionText}>
                        <Text style={styles.optionTitle}>Full Weekly Routine</Text>
                        <Text style={styles.optionDescription}>
                          Multi-day plan hitting all muscle groups
                        </Text>
                      </View>
                    </View>
                    <ArrowRight size={20} color={AppColors.textTertiary} />
                  </View>
                </LiquidGlassCard>
              </TouchableOpacity>

              {/* Single Workout */}
              <TouchableOpacity
                style={styles.optionButton}
                onPress={onSelectSingleWorkout}
                activeOpacity={0.7}
              >
                <LiquidGlassCard style={styles.optionCard}>
                  <View style={styles.optionContent}>
                    <View style={styles.optionLeft}>
                      <View style={styles.optionIcon}>
                        <Dumbbell size={28} color={AppColors.success} />
                      </View>
                      <View style={styles.optionText}>
                        <Text style={styles.optionTitle}>Single Workout</Text>
                        <Text style={styles.optionDescription}>
                          Target specific muscle groups today
                        </Text>
                      </View>
                    </View>
                    <ArrowRight size={20} color={AppColors.textTertiary} />
                  </View>
                </LiquidGlassCard>
              </TouchableOpacity>
            </View>

            {/* Navigation */}
            <View style={styles.navigation}>
              <GlassButton
                title="Back"
                onPress={onBack}
                variant="secondary"
                size="medium"
                style={styles.backButton}
              />
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
  },
  closeButton: {
    padding: 4,
  },
  optionsContainer: {
    gap: 12,
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  optionButton: {
    width: '100%',
  },
  optionCard: {
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingVertical: 8,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.textPrimary,
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: AppColors.textSecondary,
    lineHeight: 18,
  },
  navigation: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  backButton: {
    width: '100%',
  },
});