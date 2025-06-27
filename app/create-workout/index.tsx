import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  PanResponder,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ChevronLeft, Plus, Trash2, Play, GripVertical, RotateCcw } from 'lucide-react-native';

import LiquidGlassCard from '@/components/LiquidGlassCard';
import GlassButton from '@/components/GlassButton';
import { AppColors, Gradients } from '@/styles/colors';
import { workoutService, WorkoutData } from '@/lib/supabase';

interface Exercise {
  id: string;
  name: string;
  sets: string;
  reps: string;
  weight: string;
  restTime: string;
  order: number;
}

type WeightUnit = 'kg' | 'lbs';

export default function CreateWorkoutScreen() {
  const [workoutName, setWorkoutName] = useState('');
  const [workoutDescription, setWorkoutDescription] = useState('');
  const [weightUnit, setWeightUnit] = useState<WeightUnit>('kg');
  const [isSaving, setIsSaving] = useState(false);
  const [exercises, setExercises] = useState<Exercise[]>([
    {
      id: '1',
      name: '',
      sets: '',
      reps: '',
      weight: '',
      restTime: '',
      order: 0,
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
      order: exercises.length,
    };
    setExercises([...exercises, newExercise]);
  };

  const removeExercise = (id: string) => {
    if (exercises.length > 1) {
      const updatedExercises = exercises
        .filter(exercise => exercise.id !== id)
        .map((exercise, index) => ({ ...exercise, order: index }));
      setExercises(updatedExercises);
    }
  };

  const updateExercise = (id: string, field: keyof Exercise, value: string) => {
    setExercises(exercises.map(exercise => 
      exercise.id === id ? { ...exercise, [field]: value } : exercise
    ));
  };

  const moveExercise = (fromIndex: number, toIndex: number) => {
    const updatedExercises = [...exercises];
    const [movedExercise] = updatedExercises.splice(fromIndex, 1);
    updatedExercises.splice(toIndex, 0, movedExercise);
    
    // Update order values
    const reorderedExercises = updatedExercises.map((exercise, index) => ({
      ...exercise,
      order: index,
    }));
    
    setExercises(reorderedExercises);
  };

  const convertWeight = (weight: string, fromUnit: WeightUnit, toUnit: WeightUnit): string => {
    if (!weight || fromUnit === toUnit) return weight;
    
    const numWeight = parseFloat(weight);
    if (isNaN(numWeight)) return weight;
    
    if (fromUnit === 'kg' && toUnit === 'lbs') {
      return (numWeight * 2.20462).toFixed(1);
    } else if (fromUnit === 'lbs' && toUnit === 'kg') {
      return (numWeight / 2.20462).toFixed(1);
    }
    
    return weight;
  };

  const toggleWeightUnit = () => {
    const newUnit: WeightUnit = weightUnit === 'kg' ? 'lbs' : 'kg';
    
    // Convert all existing weights
    const convertedExercises = exercises.map(exercise => ({
      ...exercise,
      weight: convertWeight(exercise.weight, weightUnit, newUnit),
    }));
    
    setExercises(convertedExercises);
    setWeightUnit(newUnit);
  };

  const handleSave = async () => {
    if (!workoutName.trim()) {
      Alert.alert('Missing Information', 'Please enter a workout name.');
      return;
    }

    const validExercises = exercises.filter(ex => ex.name.trim());
    if (validExercises.length === 0) {
      Alert.alert('Missing Information', 'Please add at least one exercise.');
      return;
    }

    setIsSaving(true);

    try {
      const workoutData: WorkoutData = {
        name: workoutName.trim(),
        description: workoutDescription.trim() || undefined,
        exercises: validExercises.map(({ id, ...exercise }) => exercise),
      };

      const savedWorkout = await workoutService.createWorkout(workoutData);

      if (!savedWorkout) {
        Alert.alert('Error', 'Failed to save workout. Please try again.');
        setIsSaving(false);
        return;
      }

      Alert.alert(
        'Workout Saved!',
        `"${workoutName}" has been saved to your routines.`,
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      console.error('Error saving workout:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
      setIsSaving(false);
    }
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
          <TouchableOpacity 
            style={[styles.saveButton, isSaving && styles.saveButtonDisabled]} 
            onPress={handleSave}
            disabled={isSaving}
          >
            <Text style={styles.saveButtonText}>
              {isSaving ? 'Saving...' : 'Save'}
            </Text>
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

            {/* Weight Unit Toggle */}
            <View style={styles.inputGroup}>
              <View style={styles.unitToggleContainer}>
                <Text style={styles.inputLabel}>Weight Unit</Text>
                <TouchableOpacity style={styles.unitToggle} onPress={toggleWeightUnit}>
                  <RotateCcw size={16} color={AppColors.textSecondary} />
                  <Text style={styles.unitToggleText}>
                    Switch to {weightUnit === 'kg' ? 'lbs' : 'kg'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </LiquidGlassCard>

          {/* Exercises */}
          <LiquidGlassCard style={styles.exercisesCard}>
            <View style={styles.exercisesHeader}>
              <Text style={styles.sectionTitle}>Exercises</Text>
              <TouchableOpacity style={styles.addButton} onPress={addExercise}>
                <Plus size={18} color={AppColors.primary} />
                <Text style={styles.addButtonText}>Add Exercise</Text>
              </TouchableOpacity>
            </View>

            {exercises.map((exercise, index) => (
              <ExerciseItem
                key={exercise.id}
                exercise={exercise}
                index={index}
                weightUnit={weightUnit}
                onUpdate={updateExercise}
                onRemove={removeExercise}
                onMove={moveExercise}
                canRemove={exercises.length > 1}
                totalExercises={exercises.length}
              />
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
              title={isSaving ? 'Saving Workout...' : 'Save Workout'}
              onPress={handleSave}
              disabled={isSaving}
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

// Draggable Exercise Item Component
interface ExerciseItemProps {
  exercise: Exercise;
  index: number;
  weightUnit: WeightUnit;
  onUpdate: (id: string, field: keyof Exercise, value: string) => void;
  onRemove: (id: string) => void;
  onMove: (fromIndex: number, toIndex: number) => void;
  canRemove: boolean;
  totalExercises: number;
}

function ExerciseItem({
  exercise,
  index,
  weightUnit,
  onUpdate,
  onRemove,
  onMove,
  canRemove,
  totalExercises,
}: ExerciseItemProps) {
  const pan = new Animated.ValueXY();
  const [isDragging, setIsDragging] = useState(false);

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      setIsDragging(true);
      pan.setOffset({
        x: pan.x._value,
        y: pan.y._value,
      });
    },
    onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
      useNativeDriver: false,
    }),
    onPanResponderRelease: (_, gestureState) => {
      setIsDragging(false);
      pan.flattenOffset();

      // Calculate new position based on gesture
      const moveThreshold = 60;
      if (Math.abs(gestureState.dy) > moveThreshold) {
        const direction = gestureState.dy > 0 ? 1 : -1;
        const newIndex = Math.max(0, Math.min(totalExercises - 1, index + direction));
        
        if (newIndex !== index) {
          onMove(index, newIndex);
        }
      }

      // Reset position
      Animated.spring(pan, {
        toValue: { x: 0, y: 0 },
        useNativeDriver: false,
      }).start();
    },
  });

  return (
    <Animated.View
      style={[
        styles.exerciseItem,
        isDragging && styles.exerciseItemDragging,
        {
          transform: [{ translateX: pan.x }, { translateY: pan.y }],
        },
      ]}
    >
      <View style={styles.exerciseHeader}>
        <View style={styles.exerciseHeaderLeft}>
          <View {...panResponder.panHandlers} style={styles.dragHandle}>
            <GripVertical size={16} color={AppColors.textTertiary} />
          </View>
          <Text style={styles.exerciseNumber}>Exercise {index + 1}</Text>
        </View>
        {canRemove && (
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => onRemove(exercise.id)}
          >
            <Trash2 size={14} color={AppColors.accent} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.exerciseForm}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Exercise Name *</Text>
          <TextInput
            style={styles.textInput}
            value={exercise.name}
            onChangeText={(value) => onUpdate(exercise.id, 'name', value)}
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
              onChangeText={(value) => onUpdate(exercise.id, 'sets', value)}
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
              onChangeText={(value) => onUpdate(exercise.id, 'reps', value)}
              placeholder="10"
              placeholderTextColor={AppColors.textTertiary}
              keyboardType="numeric"
              maxLength={3}
            />
          </View>

          <View style={[styles.inputGroup, styles.smallInput]}>
            <Text style={styles.inputLabel}>Weight ({weightUnit})</Text>
            <TextInput
              style={styles.textInput}
              value={exercise.weight}
              onChangeText={(value) => onUpdate(exercise.id, 'weight', value)}
              placeholder={weightUnit === 'kg' ? '50' : '110'}
              placeholderTextColor={AppColors.textTertiary}
              keyboardType="numeric"
              maxLength={6}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Rest Time (optional)</Text>
          <TextInput
            style={styles.textInput}
            value={exercise.restTime}
            onChangeText={(value) => onUpdate(exercise.id, 'restTime', value)}
            placeholder="60 seconds"
            placeholderTextColor={AppColors.textTertiary}
            maxLength={20}
          />
        </View>
      </View>
    </Animated.View>
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
  saveButtonDisabled: {
    opacity: 0.6,
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
  unitToggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  unitToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: AppColors.backgroundSecondary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: AppColors.border,
    gap: 6,
  },
  unitToggleText: {
    fontSize: 12,
    fontWeight: '600',
    color: AppColors.textSecondary,
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
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  exerciseItemDragging: {
    shadowColor: AppColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  exerciseHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dragHandle: {
    padding: 4,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  exerciseNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.textPrimary,
  },
  removeButton: {
    padding: 4,
  },
  exerciseForm: {
    gap: 10,
  },
  exerciseRow: {
    flexDirection: 'row',
    gap: 10,
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