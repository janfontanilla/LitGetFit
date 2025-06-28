import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Svg, { Path, G } from 'react-native-svg';
import { AppColors } from '@/styles/colors';

const { width } = Dimensions.get('window');

interface MuscleGroupVisualizationProps {
  targetedMuscles: string[];
  style?: any;
}

// Muscle group mappings to body parts
const muscleMapping: { [key: string]: string[] } = {
  chest: ['chest', 'pectorals', 'pecs'],
  shoulders: ['shoulders', 'delts', 'deltoids'],
  arms: ['biceps', 'triceps', 'arms', 'forearms'],
  back: ['back', 'lats', 'latissimus', 'rhomboids', 'traps'],
  abs: ['abs', 'core', 'abdominals'],
  legs: ['legs', 'quads', 'quadriceps', 'hamstrings', 'calves'],
  glutes: ['glutes', 'glute', 'butt'],
};

// SVG paths for different muscle groups (simplified human figure)
const musclePaths = {
  chest: "M150,80 L170,80 L175,100 L165,110 L155,110 L145,100 Z",
  shoulders: "M130,75 L150,80 L145,90 L135,85 Z M170,80 L190,75 L185,85 L175,90 Z",
  arms: "M125,85 L135,85 L140,120 L130,125 L120,120 Z M185,85 L195,85 L200,120 L190,125 L180,120 Z",
  back: "M145,85 L175,85 L170,110 L150,110 Z",
  abs: "M150,110 L170,110 L165,140 L155,140 Z",
  legs: "M145,140 L165,140 L160,200 L150,200 Z M165,140 L175,140 L170,200 L160,200 Z",
  glutes: "M148,130 L172,130 L170,145 L150,145 Z",
};

export default function MuscleGroupVisualization({ targetedMuscles, style }: MuscleGroupVisualizationProps) {
  const getActiveMuscles = () => {
    const activeMuscles: string[] = [];
    
    targetedMuscles.forEach(muscle => {
      const lowerMuscle = muscle.toLowerCase();
      Object.entries(muscleMapping).forEach(([group, keywords]) => {
        if (keywords.some(keyword => lowerMuscle.includes(keyword))) {
          if (!activeMuscles.includes(group)) {
            activeMuscles.push(group);
          }
        }
      });
    });
    
    return activeMuscles;
  };

  const activeMuscles = getActiveMuscles();

  const getMuscleColor = (muscleGroup: string) => {
    return activeMuscles.includes(muscleGroup) ? AppColors.primary : AppColors.backgroundSecondary;
  };

  const getMuscleOpacity = (muscleGroup: string) => {
    return activeMuscles.includes(muscleGroup) ? 0.8 : 0.3;
  };

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>Targeted Muscle Groups</Text>
      
      <View style={styles.diagramContainer}>
        <Svg width={width * 0.6} height={250} viewBox="0 0 320 250">
          <G>
            {/* Body outline */}
            <Path
              d="M160,20 L180,30 L190,50 L195,70 L200,90 L205,120 L200,150 L190,180 L180,200 L170,220 L160,240 L150,240 L140,220 L130,200 L120,180 L110,150 L115,120 L120,90 L125,70 L130,50 L140,30 Z"
              fill="none"
              stroke={AppColors.border}
              strokeWidth="2"
            />
            
            {/* Head */}
            <Path
              d="M160,10 C170,10 175,15 175,25 C175,35 170,40 160,40 C150,40 145,35 145,25 C145,15 150,10 160,10 Z"
              fill={AppColors.backgroundSecondary}
              stroke={AppColors.border}
              strokeWidth="1"
            />
            
            {/* Muscle groups */}
            {Object.entries(musclePaths).map(([muscle, path]) => (
              <Path
                key={muscle}
                d={path}
                fill={getMuscleColor(muscle)}
                opacity={getMuscleOpacity(muscle)}
                stroke={AppColors.border}
                strokeWidth="1"
              />
            ))}
          </G>
        </Svg>
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        {activeMuscles.length > 0 ? (
          activeMuscles.map((muscle) => (
            <View key={muscle} style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: AppColors.primary }]} />
              <Text style={styles.legendText}>
                {muscle.charAt(0).toUpperCase() + muscle.slice(1)}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.noMusclesText}>No specific muscle groups targeted</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: AppColors.textPrimary,
    marginBottom: 20,
  },
  diagramContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    maxWidth: width * 0.8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 14,
    color: AppColors.textSecondary,
    fontWeight: '500',
  },
  noMusclesText: {
    fontSize: 14,
    color: AppColors.textTertiary,
    fontStyle: 'italic',
  },
});