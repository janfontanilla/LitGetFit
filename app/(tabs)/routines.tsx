import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Animated,
  Modal,
  Dimensions,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Heart, Clock, Star, Zap, Plus, Folder, X, ChevronRight, Dumbbell, Target, Flame } from 'lucide-react-native';
import { router } from 'expo-router';
import { BlurView } from 'expo-blur';

import LiquidGlassCard from '@/components/LiquidGlassCard';
import GlassButton from '@/components/GlassButton';
import CreateWorkoutModal from '@/components/CreateWorkoutModal';
import AIGenerationTypeModal from '@/components/AIGenerationTypeModal';
import { AppColors, Gradients } from '@/styles/colors';
import { workoutService, Workout } from '@/lib/supabase';

const { height } = Dimensions.get('window');

interface Routine {
  id: string;
  name: string;
  description: string;
  duration: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  equipment: string[];
  isFavorited: boolean;
  isSaved: boolean;
  category: string;
  exercises: number;
  type: 'routine' | 'workout';
  workouts?: Workout[];
  image?: string;
  emoji?: string;
}

// Featured workouts with beautiful imagery and emojis
const featuredRoutines: Routine[] = [
  {
    id: 'morning-power-flow',
    name: 'Morning Power Flow',
    description: 'Start your day with this energizing full-body routine',
    duration: 30,
    difficulty: 'Intermediate',
    equipment: ['Dumbbells', 'Mat'],
    isFavorited: true,
    isSaved: true,
    category: 'Full Body',
    exercises: 8,
    type: 'workout',
    emoji: '🧘',
    image: 'https://images.pexels.com/photos/416778/pexels-photo-416778.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&dpr=2',
  },
  {
    id: 'hiit-cardio-blast',
    name: 'HIIT Cardio Blast',
    description: 'High-intensity interval training for maximum fat burn',
    duration: 20,
    difficulty: 'Advanced',
    equipment: ['None'],
    isFavorited: false,
    isSaved: true,
    category: 'Cardio',
    exercises: 6,
    type: 'workout',
    emoji: '🔥',
    image: 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&dpr=2',
  },
  {
    id: 'core-crusher',
    name: 'Core Crusher',
    description: 'Strengthen and tone your core with targeted movements',
    duration: 15,
    difficulty: 'Beginner',
    equipment: ['Mat'],
    isFavorited: true,
    isSaved: false,
    category: 'Core',
    exercises: 10,
    type: 'workout',
    emoji: '💪',
    image: 'https://images.pexels.com/photos/3076509/pexels-photo-3076509.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&dpr=2',
  },
  {
    id: 'upper-body-builder',
    name: 'Upper Body Builder',
    description: 'Build strength and muscle in your upper body',
    duration: 45,
    difficulty: 'Intermediate',
    equipment: ['Dumbbells', 'Pull-up Bar'],
    isFavorited: false,
    isSaved: true,
    category: 'Strength',
    exercises: 12,
    type: 'workout',
    emoji: '🏋️',
    image: 'https://images.pexels.com/photos/1229356/pexels-photo-1229356.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&dpr=2',
  },
  {
    id: 'dumbbell-burner',
    name: 'Dumbbell Burner',
    description: 'Strength-focused routine using only dumbbells',
    duration: 45,
    difficulty: 'Advanced',
    equipment: ['Dumbbells'],
    isFavorited: true,
    isSaved: true,
    category: 'Strength',
    exercises: 10,
    type: 'workout',
    emoji: '🔥',
    image: 'https://images.pexels.com/photos/4164418/pexels-photo-4164418.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&dpr=2',
  },
  {
    id: '15-min-core-shred',
    name: '15-Min Core Shred',
    description: 'Quick and intense core workout to blast your abs',
    duration: 15,
    difficulty: 'Beginner',
    equipment: ['Mat'],
    isFavorited: false,
    isSaved: true,
    category: 'Core',
    exercises: 6,
    type: 'workout',
    emoji: '⚡',
    image: 'https://images.pexels.com/photos/3768916/pexels-photo-3768916.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&dpr=2',
  },
  {
    id: 'no-equipment-hiit',
    name: 'No-Equipment HIIT Blast',
    description: 'Fast-paced, sweat-dripping HIIT with no gear required',
    duration: 20,
    difficulty: 'Intermediate',
    equipment: ['None'],
    isFavorited: true,
    isSaved: true,
    category: 'HIIT',
    exercises: 7,
    type: 'workout',
    emoji: '💥',
    image: 'https://images.pexels.com/photos/3757942/pexels-photo-3757942.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&dpr=2',
  },
  {
    id: 'pull-up-power',
    name: 'Pull-Up Power Routine',
    description: 'Upper body workout focused on back and arms strength',
    duration: 35,
    difficulty: 'Advanced',
    equipment: ['Pull-up Bar'],
    isFavorited: false,
    isSaved: true,
    category: 'Strength',
    exercises: 9,
    type: 'workout',
    emoji: '💪',
    image: 'https://images.pexels.com/photos/1552106/pexels-photo-1552106.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&dpr=2',
  },
];

// Push Pull Legs Split Routine
const pushPullLegsRoutine: Routine = {
  id: 'push-pull-legs-split',
  name: 'Push Pull Legs Split',
  description: 'A complete 6-day routine targeting all major muscle groups',
  duration: 270, // Total duration across all workouts
  difficulty: 'Advanced',
  equipment: ['Dumbbells', 'Barbell', 'Pull-up Bar'],
  isFavorited: true,
  isSaved: true,
  category: 'Strength',
  exercises: 24, // Total exercises across all workouts
  type: 'routine',
  emoji: '🧠',
  image: 'https://images.pexels.com/photos/1552252/pexels-photo-1552252.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&dpr=2',
  workouts: [
    {
      id: 'push-day',
      name: 'Push Day - Chest, Shoulders, Triceps',
      description: 'Day 1: Focus on pushing movements',
      exercises: [],
      created_at: '',
      updated_at: '',
    },
    {
      id: 'pull-day',
      name: 'Pull Day - Back, Biceps',
      description: 'Day 2: Focus on pulling movements',
      exercises: [],
      created_at: '',
      updated_at: '',
    },
    {
      id: 'legs-day',
      name: 'Legs Day - Quads, Hamstrings, Glutes, Calves',
      description: 'Day 3: Focus on lower body',
      exercises: [],
      created_at: '',
      updated_at: '',
    },
  ],
};

export default function RoutinesScreen() {
  const [selectedFilter, setSelectedFilter] = useState<'All' | 'Favorites' | 'Routines'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [routines, setRoutines] = useState<Routine[]>([...featuredRoutines, pushPullLegsRoutine]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [selectedRoutine, setSelectedRoutine] = useState<Routine | null>(null);
  const [showRoutineModal, setShowRoutineModal] = useState(false);
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAITypeModal, setShowAITypeModal] = useState(false);

  // Animation values
  const searchWidthAnim = useRef(new Animated.Value(120)).current;
  const filtersOpacityAnim = useRef(new Animated.Value(1)).current;
  const filtersTranslateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadWorkouts();
  }, []);

  const loadWorkouts = async () => {
    try {
      const fetchedWorkouts = await workoutService.getWorkouts();
      setWorkouts(fetchedWorkouts);
      
      // Convert workouts to routine format for display
      const workoutRoutines: Routine[] = fetchedWorkouts.map(workout => ({
        id: workout.id,
        name: workout.name,
        description: workout.description || '',
        duration: 30, // Default duration
        difficulty: 'Intermediate' as const,
        equipment: ['Various'],
        isFavorited: false,
        isSaved: true,
        category: 'Custom',
        exercises: workout.exercises.length,
        type: 'workout' as const,
        emoji: '🏋️',
      }));
      
      // Combine with featured routines
      setRoutines([...featuredRoutines, pushPullLegsRoutine, ...workoutRoutines]);
    } catch (error) {
      console.error('Error loading workouts:', error);
    }
  };

  const filteredRoutines = routines.filter(routine => {
    let matchesFilter = true;
    
    if (selectedFilter === 'Favorites') {
      matchesFilter = routine.isFavorited;
    } else if (selectedFilter === 'Routines') {
      matchesFilter = routine.type === 'routine';
    }
    
    const matchesSearch = routine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         routine.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleSearchFocus = () => {
    setIsSearchFocused(true);
    
    Animated.parallel([
      Animated.timing(searchWidthAnim, {
        toValue: 280,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(filtersOpacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(filtersTranslateAnim, {
        toValue: 100,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleSearchBlur = () => {
    if (!searchQuery) {
      setIsSearchFocused(false);
      
      Animated.parallel([
        Animated.timing(searchWidthAnim, {
          toValue: 120,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(filtersOpacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(filtersTranslateAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return AppColors.success;
      case 'Intermediate': return AppColors.warning;
      case 'Advanced': return AppColors.accent;
      default: return AppColors.textSecondary;
    }
  };

  const toggleFavorite = (routineId: string) => {
    setRoutines(prevRoutines => 
      prevRoutines.map(routine => 
        routine.id === routineId 
          ? { ...routine, isFavorited: !routine.isFavorited }
          : routine
      )
    );
  };

  const handleRoutinePress = (routine: Routine) => {
    if (routine.type === 'routine' && routine.workouts) {
      setSelectedRoutine(routine);
      setShowRoutineModal(true);
    } else {
      // Start single workout - navigate to workout start screen
      const workoutData = workouts.find(w => w.id === routine.id);
      if (workoutData) {
        router.push({
          pathname: '/workout/start',
          params: { 
            workoutData: JSON.stringify({
              id: workoutData.id,
              name: workoutData.name,
              description: workoutData.description,
              exercises: workoutData.exercises,
              estimatedDuration: routine.duration,
              targetedMuscles: [],
            })
          }
        });
      } else {
        // For featured workouts, create mock data
        router.push({
          pathname: '/workout/start',
          params: { 
            workoutData: JSON.stringify({
              id: routine.id,
              name: routine.name,
              description: routine.description,
              exercises: generateMockExercises(routine.exercises),
              estimatedDuration: routine.duration,
              targetedMuscles: [],
            })
          }
        });
      }
    }
  };

  const generateMockExercises = (count: number) => {
    const mockExercises = [
      { name: 'Push-ups', sets: '3', reps: '12', weight: 'Bodyweight', restTime: '60 seconds', order: 0 },
      { name: 'Squats', sets: '3', reps: '15', weight: 'Bodyweight', restTime: '90 seconds', order: 1 },
      { name: 'Plank', sets: '3', reps: '30 seconds', weight: 'Bodyweight', restTime: '60 seconds', order: 2 },
      { name: 'Lunges', sets: '3', reps: '10 each leg', weight: 'Bodyweight', restTime: '60 seconds', order: 3 },
      { name: 'Mountain Climbers', sets: '3', reps: '20', weight: 'Bodyweight', restTime: '45 seconds', order: 4 },
      { name: 'Burpees', sets: '3', reps: '8', weight: 'Bodyweight', restTime: '90 seconds', order: 5 },
      { name: 'Jumping Jacks', sets: '3', reps: '30', weight: 'Bodyweight', restTime: '45 seconds', order: 6 },
      { name: 'High Knees', sets: '3', reps: '20', weight: 'Bodyweight', restTime: '45 seconds', order: 7 },
      { name: 'Bicycle Crunches', sets: '3', reps: '15 each side', weight: 'Bodyweight', restTime: '60 seconds', order: 8 },
      { name: 'Wall Sit', sets: '3', reps: '45 seconds', weight: 'Bodyweight', restTime: '90 seconds', order: 9 },
      { name: 'Tricep Dips', sets: '3', reps: '10', weight: 'Bodyweight', restTime: '60 seconds', order: 10 },
      { name: 'Russian Twists', sets: '3', reps: '20', weight: 'Bodyweight', restTime: '60 seconds', order: 11 },
    ];
    
    return mockExercises.slice(0, count).map((exercise, index) => ({
      ...exercise,
      order: index
    }));
  };

  // Modal handlers
  const handleCreateWorkout = () => {
    setShowCreateModal(true);
  };

  const handleSelectManual = () => {
    setShowCreateModal(false);
    router.push('/create-workout');
  };

  const handleSelectAI = () => {
    setShowCreateModal(false);
    setShowAITypeModal(true);
  };

  const handleSelectRoutine = () => {
    setShowAITypeModal(false);
    router.push('/create-workout/ai-routine');
  };

  const handleSelectSingleWorkout = () => {
    setShowAITypeModal(false);
    router.push('/create-workout/ai-single');
  };

  const handleBackToCreate = () => {
    setShowAITypeModal(false);
    setShowCreateModal(true);
  };

  return (
    <LinearGradient colors={Gradients.background} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.title}>Workout Library</Text>
            <TouchableOpacity style={styles.createButton} onPress={handleCreateWorkout}>
              <Plus size={16} color={AppColors.textPrimary} />
              <Text style={styles.createButtonText}>Create</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Search and Filter Row */}
        <View style={styles.searchFilterRow}>
          {/* Animated Search Container */}
          <Animated.View 
            style={[
              styles.searchContainer,
              {
                width: searchWidthAnim,
              }
            ]}
          >
            <View style={styles.searchCard}>
              <View style={styles.searchInputContainer}>
                <Search size={14} color={AppColors.textSecondary} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search workouts..."
                  placeholderTextColor={AppColors.textSecondary}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  onFocus={handleSearchFocus}
                  onBlur={handleSearchBlur}
                />
              </View>
            </View>
          </Animated.View>

          {/* Animated Filter Tabs */}
          <Animated.View 
            style={[
              styles.filterContainer,
              {
                opacity: filtersOpacityAnim,
                transform: [{ translateX: filtersTranslateAnim }],
              }
            ]}
          >
            <TouchableOpacity
              style={[
                styles.filterTab,
                selectedFilter === 'All' && styles.activeFilterTab,
              ]}
              onPress={() => setSelectedFilter('All')}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedFilter === 'All' && styles.activeFilterText,
                ]}
              >
                All
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterTab,
                selectedFilter === 'Favorites' && styles.activeFilterTab,
              ]}
              onPress={() => setSelectedFilter('Favorites')}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedFilter === 'Favorites' && styles.activeFilterText,
                ]}
              >
                Favorites
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterTab,
                selectedFilter === 'Routines' && styles.activeFilterTab,
              ]}
              onPress={() => setSelectedFilter('Routines')}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedFilter === 'Routines' && styles.activeFilterText,
                ]}
              >
                Routines
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* Routines List */}
        <ScrollView
          style={styles.routinesList}
          contentContainerStyle={styles.routinesContent}
          showsVerticalScrollIndicator={false}
        >
          {filteredRoutines.length === 0 ? (
            <LiquidGlassCard style={styles.emptyStateCard}>
              <Text style={styles.emptyStateTitle}>
                {selectedFilter === 'Favorites' 
                  ? 'No favorites yet' 
                  : selectedFilter === 'Routines'
                  ? 'No routines found'
                  : 'No workouts found'
                }
              </Text>
              <Text style={styles.emptyStateDescription}>
                {selectedFilter === 'Favorites' 
                  ? 'Heart your favorite workouts to see them here'
                  : selectedFilter === 'Routines'
                  ? 'Create multi-day routines to see them here'
                  : searchQuery 
                    ? 'Try adjusting your search terms'
                    : 'Create your first workout to get started'
                }
              </Text>
              {!searchQuery && (
                <GlassButton
                  title="Create Workout"
                  onPress={handleCreateWorkout}
                  variant="primary"
                  size="medium"
                  style={styles.emptyStateButton}
                />
              )}
            </LiquidGlassCard>
          ) : (
            filteredRoutines.map((routine) => (
              <LiquidGlassCard key={routine.id} style={styles.routineCard}>
                {/* Hero Image */}
                {routine.image && (
                  <View style={styles.imageContainer}>
                    <Image source={{ uri: routine.image }} style={styles.routineImage} />
                    <View style={styles.imageOverlay}>
                      <Text style={styles.routineEmoji}>{routine.emoji}</Text>
                      <TouchableOpacity
                        style={styles.favoriteButton}
                        onPress={() => toggleFavorite(routine.id)}
                      >
                        <Heart
                          size={18}
                          color={routine.isFavorited ? AppColors.accent : AppColors.textPrimary}
                          fill={routine.isFavorited ? AppColors.accent : 'transparent'}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                <View style={styles.routineContent}>
                  <View style={styles.routineHeader}>
                    <View style={styles.routineInfo}>
                      <View style={styles.routineNameContainer}>
                        {routine.type === 'routine' && (
                          <Folder size={16} color={AppColors.primary} style={styles.routineIcon} />
                        )}
                        <Text style={styles.routineName}>{routine.name}</Text>
                      </View>
                      <Text style={styles.routineDescription}>
                        {routine.description}
                      </Text>
                    </View>
                    {!routine.image && (
                      <TouchableOpacity
                        style={styles.favoriteButtonAlt}
                        onPress={() => toggleFavorite(routine.id)}
                      >
                        <Heart
                          size={18}
                          color={routine.isFavorited ? AppColors.accent : AppColors.textSecondary}
                          fill={routine.isFavorited ? AppColors.accent : 'transparent'}
                        />
                      </TouchableOpacity>
                    )}
                  </View>

                  <View style={styles.routineMeta}>
                    <View style={styles.metaItem}>
                      <Clock size={14} color={AppColors.textSecondary} />
                      <Text style={styles.metaText}>
                        {routine.type === 'routine' ? `${routine.duration} min total` : `${routine.duration} min`}
                      </Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Star size={14} color={getDifficultyColor(routine.difficulty)} />
                      <Text style={[styles.metaText, { color: getDifficultyColor(routine.difficulty) }]}>
                        {routine.difficulty}
                      </Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Zap size={14} color={AppColors.textSecondary} />
                      <Text style={styles.metaText}>
                        {routine.type === 'routine' ? `${routine.workouts?.length || 0} workouts` : `${routine.exercises} exercises`}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.equipmentContainer}>
                    <Text style={styles.equipmentLabel}>Equipment:</Text>
                    <Text style={styles.equipmentText}>
                      {routine.equipment.join(', ')}
                    </Text>
                  </View>

                  <GlassButton
                    title={routine.type === 'routine' ? 'View Routine' : 'Start Workout'}
                    onPress={() => handleRoutinePress(routine)}
                    variant="primary"
                    style={styles.startButton}
                  />
                </View>
              </LiquidGlassCard>
            ))
          )}
        </ScrollView>

        {/* Routine Detail Modal */}
        <Modal
          visible={showRoutineModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowRoutineModal(false)}
        >
          <BlurView intensity={40} tint="dark" style={styles.modalOverlay}>
            <View style={styles.routineModalContainer}>
              <LiquidGlassCard style={styles.routineModal}>
                {/* Modal Header */}
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{selectedRoutine?.name}</Text>
                  <TouchableOpacity 
                    style={styles.closeButton} 
                    onPress={() => setShowRoutineModal(false)}
                  >
                    <X size={24} color={AppColors.textSecondary} />
                  </TouchableOpacity>
                </View>

                {/* Routine Description */}
                <Text style={styles.modalDescription}>
                  {selectedRoutine?.description}
                </Text>

                {/* Routine Stats */}
                <View style={styles.routineStats}>
                  <View style={styles.routineStatItem}>
                    <Target size={20} color={AppColors.primary} />
                    <Text style={styles.routineStatValue}>6 Days</Text>
                    <Text style={styles.routineStatLabel}>Split</Text>
                  </View>
                  <View style={styles.routineStatItem}>
                    <Flame size={20} color={AppColors.accent} />
                    <Text style={styles.routineStatValue}>Advanced</Text>
                    <Text style={styles.routineStatLabel}>Level</Text>
                  </View>
                  <View style={styles.routineStatItem}>
                    <Dumbbell size={20} color={AppColors.success} />
                    <Text style={styles.routineStatValue}>24</Text>
                    <Text style={styles.routineStatLabel}>Exercises</Text>
                  </View>
                </View>

                {/* Workouts List */}
                <ScrollView style={styles.workoutsList} showsVerticalScrollIndicator={false}>
                  {selectedRoutine?.workouts?.map((workout, index) => (
                    <TouchableOpacity
                      key={workout.id}
                      style={styles.workoutItem}
                      onPress={() => {
                        setShowRoutineModal(false);
                        router.push({
                          pathname: '/workout/start',
                          params: { 
                            workoutData: JSON.stringify({
                              id: workout.id,
                              name: workout.name,
                              description: workout.description,
                              exercises: generateMockExercises(8),
                              estimatedDuration: 45,
                              targetedMuscles: [],
                            })
                          }
                        });
                      }}
                    >
                      <LiquidGlassCard style={styles.workoutCard}>
                        <View style={styles.workoutContent}>
                          <View style={styles.workoutInfo}>
                            <Text style={styles.workoutName}>
                              Day {index + 1}: {workout.name.split(' - ')[0]}
                            </Text>
                            <Text style={styles.workoutDescription}>
                              {workout.description}
                            </Text>
                            <View style={styles.workoutMeta}>
                              <Text style={styles.workoutMetaText}>45 min • 8 exercises</Text>
                            </View>
                          </View>
                          <ChevronRight size={16} color={AppColors.textTertiary} />
                        </View>
                      </LiquidGlassCard>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {/* Modal Actions */}
                <View style={styles.modalActions}>
                  <GlassButton
                    title="Start Full Routine"
                    onPress={() => {
                      setShowRoutineModal(false);
                      // Start with first workout in routine
                      if (selectedRoutine?.workouts && selectedRoutine.workouts.length > 0) {
                        const firstWorkout = selectedRoutine.workouts[0];
                        router.push({
                          pathname: '/workout/start',
                          params: { 
                            workoutData: JSON.stringify({
                              id: firstWorkout.id,
                              name: firstWorkout.name,
                              description: firstWorkout.description,
                              exercises: generateMockExercises(8),
                              estimatedDuration: 45,
                              targetedMuscles: [],
                            })
                          }
                        });
                      }
                    }}
                    variant="primary"
                    size="large"
                    style={styles.startRoutineButton}
                  />
                </View>
              </LiquidGlassCard>
            </View>
          </BlurView>
        </Modal>

        {/* Modals */}
        <CreateWorkoutModal
          visible={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSelectManual={handleSelectManual}
          onSelectAI={handleSelectAI}
        />

        <AIGenerationTypeModal
          visible={showAITypeModal}
          onClose={() => setShowAITypeModal(false)}
          onBack={handleBackToCreate}
          onSelectRoutine={handleSelectRoutine}
          onSelectSingleWorkout={handleSelectSingleWorkout}
        />
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
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: AppColors.textPrimary,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: AppColors.primary,
    borderRadius: 16,
    gap: 4,
  },
  createButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: AppColors.textPrimary,
  },
  searchFilterRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 10,
    alignItems: 'center',
  },
  searchContainer: {
    height: 32,
  },
  searchCard: {
    flex: 1,
    height: '100%',
    paddingVertical: 4,
    paddingHorizontal: 10,
    backgroundColor: AppColors.backgroundSecondary,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    color: AppColors.textPrimary,
    paddingVertical: 1,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  filterTab: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  activeFilterTab: {
    backgroundColor: AppColors.primary,
  },
  filterText: {
    fontSize: 11,
    fontWeight: '600',
    color: AppColors.textSecondary,
  },
  activeFilterText: {
    color: AppColors.textPrimary,
  },
  routinesList: {
    flex: 1,
  },
  routinesContent: {
    paddingBottom: 130,
  },
  emptyStateCard: {
    marginHorizontal: 20,
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: AppColors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateDescription: {
    fontSize: 14,
    color: AppColors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyStateButton: {
    paddingHorizontal: 32,
  },
  routineCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 0,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    height: 120,
  },
  routineImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
  },
  routineEmoji: {
    fontSize: 32,
  },
  favoriteButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  favoriteButtonAlt: {
    padding: 4,
  },
  routineContent: {
    padding: 20,
  },
  routineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  routineInfo: {
    flex: 1,
    marginRight: 12,
  },
  routineNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  routineIcon: {
    marginRight: 8,
  },
  routineName: {
    fontSize: 18,
    fontWeight: '600',
    color: AppColors.textPrimary,
  },
  routineDescription: {
    fontSize: 14,
    color: AppColors.textSecondary,
    lineHeight: 20,
  },
  routineMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    color: AppColors.textSecondary,
    fontWeight: '500',
  },
  equipmentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  equipmentLabel: {
    fontSize: 12,
    color: AppColors.textSecondary,
    fontWeight: '600',
  },
  equipmentText: {
    fontSize: 12,
    color: AppColors.textTertiary,
  },
  startButton: {
    width: '100%',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  routineModalContainer: {
    width: '90%',
    maxWidth: 400,
    maxHeight: height * 0.8,
  },
  routineModal: {
    padding: 0,
    maxHeight: height * 0.8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: AppColors.textPrimary,
    flex: 1,
    marginRight: 16,
  },
  closeButton: {
    padding: 4,
  },
  modalDescription: {
    fontSize: 14,
    color: AppColors.textSecondary,
    lineHeight: 20,
    marginBottom: 20,
    paddingHorizontal: 24,
  },
  routineStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    paddingHorizontal: 24,
  },
  routineStatItem: {
    alignItems: 'center',
    gap: 8,
  },
  routineStatValue: {
    fontSize: 16,
    fontWeight: '700',
    color: AppColors.textPrimary,
  },
  routineStatLabel: {
    fontSize: 12,
    color: AppColors.textSecondary,
    fontWeight: '600',
  },
  workoutsList: {
    flex: 1,
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  workoutItem: {
    marginBottom: 12,
  },
  workoutCard: {
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  workoutContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  workoutInfo: {
    flex: 1,
  },
  workoutName: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.textPrimary,
    marginBottom: 4,
  },
  workoutDescription: {
    fontSize: 14,
    color: AppColors.textSecondary,
    marginBottom: 4,
  },
  workoutMeta: {
    marginTop: 4,
  },
  workoutMetaText: {
    fontSize: 12,
    color: AppColors.textTertiary,
  },
  modalActions: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  startRoutineButton: {
    width: '100%',
  },
});