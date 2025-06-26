import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Heart, Clock, Star, Zap } from 'lucide-react-native';

import LiquidGlassCard from '@/components/LiquidGlassCard';
import GlassButton from '@/components/GlassButton';
import { AppColors, Gradients } from '@/styles/colors';

interface Routine {
  id: string;
  name: string;
  description: string;
  duration: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  equipment: string[];
  isFavorited: boolean;
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
    category: 'Strength',
    exercises: 12,
  },
];

export default function RoutinesScreen() {
  const [selectedFilter, setSelectedFilter] = useState<'All' | 'Favorites'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [routines, setRoutines] = useState<Routine[]>(initialRoutines);

  const filteredRoutines = routines.filter(routine => {
    const matchesFilter = selectedFilter === 'All' || routine.isFavorited;
    const matchesSearch = routine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         routine.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

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

  return (
    <LinearGradient colors={Gradients.background} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Workout Routines</Text>
          <Text style={styles.subtitle}>Find your perfect workout</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <LiquidGlassCard style={styles.searchCard}>
            <View style={styles.searchInputContainer}>
              <Search size={18} color={AppColors.textSecondary} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search routines..."
                placeholderTextColor={AppColors.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </LiquidGlassCard>
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterContainer}>
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
              All Routines
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
        </View>

        {/* Routines List */}
        <ScrollView
          style={styles.routinesList}
          contentContainerStyle={styles.routinesContent}
          showsVerticalScrollIndicator={false}
        >
          {filteredRoutines.map((routine) => (
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
                    size={20}
                    color={routine.isFavorited ? AppColors.accent : AppColors.textSecondary}
                    fill={routine.isFavorited ? AppColors.accent : 'transparent'}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.routineMeta}>
                <View style={styles.metaItem}>
                  <Clock size={16} color={AppColors.textSecondary} />
                  <Text style={styles.metaText}>{routine.duration} min</Text>
                </View>
                <View style={styles.metaItem}>
                  <Star size={16} color={getDifficultyColor(routine.difficulty)} />
                  <Text style={[styles.metaText, { color: getDifficultyColor(routine.difficulty) }]}>
                    {routine.difficulty}
                  </Text>
                </View>
                <View style={styles.metaItem}>
                  <Zap size={16} color={AppColors.textSecondary} />
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
          ))}
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
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: AppColors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: AppColors.textSecondary,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchCard: {
    paddingVertical: 8, // Reduced from default padding
    paddingHorizontal: 16, // Reduced horizontal padding
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 14, // Reduced from 16
    color: AppColors.textPrimary,
    paddingVertical: 4, // Reduced from 8
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  activeFilterTab: {
    backgroundColor: AppColors.primary,
  },
  filterText: {
    fontSize: 14,
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
    paddingBottom: 105, // Adjusted for smaller tab bar
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
    fontSize: 12,
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