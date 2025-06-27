import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Heart, Clock, Star, Zap, Plus } from 'lucide-react-native';
import { router } from 'expo-router';

import LiquidGlassCard from '@/components/LiquidGlassCard';
import GlassButton from '@/components/GlassButton';
import CreateWorkoutModal from '@/components/CreateWorkoutModal';
import AIGenerationTypeModal from '@/components/AIGenerationTypeModal';
import { AppColors, Gradients } from '@/styles/colors';

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
}

const initialRoutines: Routine[] = [
  {
    id: '1',
    name: 'Morning Power Flow',
    description: 'Start your day with this energizing full-body routine',
    duration: 30,
    difficulty: 'Intermediate',
    equipment: ['Dumbbells', 'Mat'],
    isFavorited: true,
    isSaved: true,
    category: 'Full Body',
    exercises: 8,
  },
  {
    id: '2',
    name: 'HIIT Cardio Blast',
    description: 'High-intensity interval training for maximum fat burn',
    duration: 20,
    difficulty: 'Advanced',
    equipment: ['None'],
    isFavorited: false,
    isSaved: true,
    category: 'Cardio',
    exercises: 6,
  },
  {
    id: '3',
    name: 'Core Crusher',
    description: 'Strengthen and tone your core with targeted movements',
    duration: 15,
    difficulty: 'Beginner',
    equipment: ['Mat'],
    isFavorited: true,
    isSaved: false,
    category: 'Core',
    exercises: 10,
  },
  {
    id: '4',
    name: 'Upper Body Builder',
    description: 'Build strength and muscle in your upper body',
    duration: 45,
    difficulty: 'Intermediate',
    equipment: ['Dumbbells', 'Pull-up Bar'],
    isFavorited: false,
    isSaved: true,
    category: 'Strength',
    exercises: 12,
  },
];

export default function RoutinesScreen() {
  const [selectedFilter, setSelectedFilter] = useState<'All' | 'Favorites' | 'Saved'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [routines, setRoutines] = useState<Routine[]>(initialRoutines);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAITypeModal, setShowAITypeModal] = useState(false);

  // Animation values
  const searchWidthAnim = useRef(new Animated.Value(0)).current;
  const filtersOpacityAnim = useRef(new Animated.Value(1)).current;
  const filtersTranslateAnim = useRef(new Animated.Value(0)).current;

  const filteredRoutines = routines.filter(routine => {
    let matchesFilter = true;
    
    if (selectedFilter === 'Favorites') {
      matchesFilter = routine.isFavorited;
    } else if (selectedFilter === 'Saved') {
      matchesFilter = routine.isSaved;
    }
    
    const matchesSearch = routine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         routine.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleSearchFocus = () => {
    setIsSearchFocused(true);
    
    Animated.parallel([
      Animated.timing(searchWidthAnim, {
        toValue: 1,
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
          toValue: 0,
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
            <Text style={styles.title}>Routines</Text>
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
                flex: searchWidthAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 3],
                }),
              }
            ]}
          >
            <LiquidGlassCard style={styles.searchCard}>
              <View style={styles.searchInputContainer}>
                <Search size={14} color={AppColors.textSecondary} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search routines..."
                  placeholderTextColor={AppColors.textSecondary}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  onFocus={handleSearchFocus}
                  onBlur={handleSearchBlur}
                />
              </View>
            </LiquidGlassCard>
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
                selectedFilter === 'Saved' && styles.activeFilterTab,
              ]}
              onPress={() => setSelectedFilter('Saved')}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedFilter === 'Saved' && styles.activeFilterText,
                ]}
              >
                Saved
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
                  : selectedFilter === 'Saved'
                  ? 'No saved routines'
                  : 'No routines found'
                }
              </Text>
              <Text style={styles.emptyStateDescription}>
                {selectedFilter === 'Favorites' 
                  ? 'Heart your favorite workouts to see them here'
                  : selectedFilter === 'Saved'
                  ? 'Save routines to access them quickly'
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
                <View style={styles.routineHeader}>
                  <View style={styles.routineInfo}>
                    <Text style={styles.routineName}>{routine.name}</Text>
                    <Text style={styles.routineDescription}>
                      {routine.description}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.favoriteButton}
                    onPress={() => toggleFavorite(routine.id)}
                  >
                    <Heart
                      size={18}
                      color={routine.isFavorited ? AppColors.accent : AppColors.textSecondary}
                      fill={routine.isFavorited ? AppColors.accent : 'transparent'}
                    />
                  </TouchableOpacity>
                </View>

                <View style={styles.routineMeta}>
                  <View style={styles.metaItem}>
                    <Clock size={14} color={AppColors.textSecondary} />
                    <Text style={styles.metaText}>{routine.duration} min</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Star size={14} color={getDifficultyColor(routine.difficulty)} />
                    <Text style={[styles.metaText, { color: getDifficultyColor(routine.difficulty) }]}>
                      {routine.difficulty}
                    </Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Zap size={14} color={AppColors.textSecondary} />
                    <Text style={styles.metaText}>{routine.exercises} exercises</Text>
                  </View>
                </View>

                <View style={styles.equipmentContainer}>
                  <Text style={styles.equipmentLabel}>Equipment:</Text>
                  <Text style={styles.equipmentText}>
                    {routine.equipment.join(', ')}
                  </Text>
                </View>

                <GlassButton
                  title="Start Workout"
                  onPress={() => console.log('Start workout:', routine.id)}
                  variant="primary"
                  style={styles.startButton}
                />
              </LiquidGlassCard>
            ))
          )}
        </ScrollView>

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
    minWidth: 120,
  },
  searchCard: {
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  searchInputContainer: {
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
  routineName: {
    fontSize: 18,
    fontWeight: '600',
    color: AppColors.textPrimary,
    marginBottom: 4,
  },
  routineDescription: {
    fontSize: 14,
    color: AppColors.textSecondary,
    lineHeight: 20,
  },
  favoriteButton: {
    padding: 4,
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
});