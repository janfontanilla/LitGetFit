import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ChevronLeft, Plus, Trash2, Play } from 'lucide-react-native';

import LiquidGlassCard from '@/components/LiquidGlassCard';
import GlassButton from '@/components/GlassButton';
import { AppColors, Gradients } from '@/styles/colors';

interface Exercise {
  id: string;
  name: string;
  sets: string;
  reps: string;
  weight: string;
  restTime: string;
}

export default function CreateWorkoutScreen() {
  const [workoutName, setWorkoutName] = useState('');
  const [workoutDescription, setWorkoutDescription] = useState('');
  const [exercises, setExercises] = useState<Exercise[]>([
    {
      id: '1',
      name: '',
      sets: '',
      reps: '',
      weight: '',
      restTime: '',
    },
  ]);

  const addExercise = () => {
    const newExercise: Exercise = {
      id: Date.now().toString(),
      name: '',
      sets: '',
      reps: '',
      weight: '',
      restTime: '',
    };
    setExercises([...exercises, newExercise]);
  };

  const removeExercise = (id: string) => {
    if (exercises.length > 1) {
      setExercises(exercises.filter(exercise => exercise.id !== id));
    }
  };

  const updateExercise = (id: string, field: keyof Exercise, value: string) => {
    setExercises(exercises.map(exercise => 
      exercise.id === id ? { ...exercise, [field]: value } : exercise
    ));
  };

  const handleSave = () => {
    if (!workoutName.trim()) {
      Alert.alert('Missing Information', 'Please enter a workout name.');
      return;
    }

    const validExercises = exercises.filter(ex => ex.name.trim());
    if (validExercises.length === 0) {
      Alert.alert('Missing Information', 'Please add at least one exercise.');
      return;
    }

    // Here you would save to your backend/storage
    console.log('Saving workout:', {
      name: workoutName,
      description: workoutDescription,
      exercises: validExercises,
    });

    Alert.alert(
      'Workout Saved!',
      `"${workoutName}" has been saved to your routines.`,
      [{ text: 'OK', onPress: () => router.back() }]
    );
  };

  const handlePreview = () => {
    if (!workoutName.trim()) {
      Alert.alert('Missing Information', 'Please enter a workout name to preview.');
      return;
    }

    const validExercises = exercises.filter(ex => ex.name.trim());
    if (validExercises.length === 0) {
      Alert.alert('Missing Information', 'Please add at least one exercise to preview.');
      return;
    }

    // Navigate to preview screen (would be implemented)
    console.log('Preview workout:', { workoutName, exercises: validExercises });
  };

  return (
    <LinearGradient colors={Gradients.background} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ChevronLeft size={24} color={AppColors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Create from Scratch</Text>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Workout Info */}
          <LiquidGlassCard style={styles.workoutInfoCard}>
            <Text style={styles.sectionTitle}>Workout Details</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Workout Name *</Text>
              <TextInput
                style={styles.textInput}
                value={workoutName}
                onChangeText={setWorkoutName}
                placeholder="e.g., Upper Body Strength"
                placeholderTextColor={AppColors.textTertiary}
                maxLength={50}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Description (optional)</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={workoutDescription}
                onChangeText={setWorkoutDescription}
                placeholder="Brief description of your workout..."
                placeholderTextColor={AppColors.textTertiary}
                multiline
                numberOfLines={3}
                maxLength={200}
              />
            </View>
          </LiquidGlassCard>

          {/* Exercises */}
          <LiquidGlassCard style={styles.exercisesCard}>
            <View style={styles.exercisesHeader}>
              <Text style={styles.sectionTitle}>Exercises</Text>
              <TouchableOpacity style={styles.addButton} onPress={addExercise}>
                <Plus size={20} color={AppColors.primary} />
                <Text style={styles.addButtonText}>Add Exercise</Text>
              </TouchableOpacity>
            </View>

            {exercises.map((exercise, index) => (
              <View key={exercise.id} style={styles.exerciseItem}>
                <View style={styles.exerciseHeader}>
                  <Text style={styles.exerciseNumber}>Exercise {index + 1}</Text>
                  {exercises.length > 1 && (
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => removeExercise(exercise.id)}
                    >
                      <Trash2 size={16} color={AppColors.accent} />
                    </TouchableOpacity>
                  )}
                </View>

                <View style={styles.exerciseForm}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Exercise Name *</Text>
                    <TextInput
                      style={styles.textInput}
                      value={exercise.name}
                      onChangeText={(value) => updateExercise(exercise.id, 'name', value)}
                      placeholder="e.g., Push-ups, Bench Press"
                      placeholderTextColor={AppColors.textTertiary}
                      maxLength={50}
                    />
                  </View>

                  <View style={styles.exerciseRow}>
                    <View style={[styles.inputGroup, styles.smallInput]}>
                      <Text style={styles.inputLabel}>Sets</Text>
                      <TextInput
                        style={styles.textInput}
                        value={exercise.sets}
                        onChangeText={(value) => updateExercise(exercise.id, 'sets', value)}
                        placeholder="3"
                        placeholderTextColor={AppColors.textTertiary}
                        keyboardType="numeric"
                        maxLength={2}
                      />
                    </View>

                    <View style={[styles.inputGroup, styles.smallInput]}>
                      <Text style={styles.inputLabel}>Reps</Text>
                      <TextInput
                        style={styles.textInput}
                        value={exercise.reps}
                        onChangeText={(value) => updateExercise(exercise.id, 'reps', value)}
                        placeholder="10"
                        placeholderTextColor={AppColors.textTertiary}
                        keyboardType="numeric"
                        maxLength={3}
                      />
                    </View>

                    <View style={[styles.inputGroup, styles.smallInput]}>
                      <Text style={styles.inputLabel}>Weight</Text>
                      <TextInput
                        style={styles.textInput}
                        value={exercise.weight}
                        onChangeText={(value) => updateExercise(exercise.id, 'weight', value)}
                        placeholder="50kg"
                        placeholderTextColor={AppColors.textTertiary}
                        maxLength={10}
                      />
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Rest Time (optional)</Text>
                    <TextInput
                      style={styles.textInput}
                      value={exercise.restTime}
                      onChangeText={(value) => updateExercise(exercise.id, 'restTime', value)}
                      placeholder="60 seconds"
                      placeholderTextColor={AppColors.textTertiary}
                      maxLength={20}
                    />
                  </View>
                </View>
              </View>
            ))}
          </LiquidGlassCard>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <GlassButton
              title="Preview Workout"
              onPress={handlePreview}
              variant="secondary"
              size="large"
              style={styles.previewButton}
              icon={<Play size={20} color={AppColors.textPrimary} />}
            />
            <GlassButton
              title="Save Workout"
              onPress={handleSave}
              variant="primary"
              size="large"
              style={styles.saveWorkoutButton}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border,
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: AppColors.textPrimary,
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: AppColors.primary,
    borderRadius: 16,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.textPrimary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 150,
  },
  workoutInfoCard: {
    margin: 20,
    marginBottom: 16,
  },
  exercisesCard: {
    margin: 20,
    marginTop: 0,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: AppColors.textPrimary,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.textSecondary,
    marginBottom: 8,
  },
  textInput: {
    fontSize: 16,
    color: AppColors.textPrimary,
    backgroundColor: AppColors.backgroundSecondary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  exercisesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderRadius: 16,
    gap: 6,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.primary,
  },
  exerciseItem: {
    backgroundColor: AppColors.backgroundSecondary,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  exerciseNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.textPrimary,
  },
  removeButton: {
    padding: 4,
  },
  exerciseForm: {
    gap: 12,
  },
  exerciseRow: {
    flexDirection: 'row',
    gap: 12,
  },
  smallInput: {
    flex: 1,
    marginBottom: 0,
  },
  actionButtons: {
    paddingHorizontal: 20,
    gap: 12,
  },
  previewButton: {
    width: '100%',
  },
  saveWorkoutButton: {
    width: '100%',
  },
});