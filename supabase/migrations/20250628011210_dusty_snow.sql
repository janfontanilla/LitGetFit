/*
  # Add featured workouts to the database

  1. Insert Featured Workouts
    - Morning Power Flow
    - HIIT Cardio Blast  
    - Core Crusher
    - Upper Body Builder
    - Dumbbell Burner
    - 15-Min Core Shred
    - No-Equipment HIIT Blast
    - Pull-Up Power Routine

  2. Insert Push Pull Legs Split Routine
    - Push Day workout
    - Pull Day workout  
    - Legs Day workout

  3. Security
    - All workouts are public and accessible to everyone
*/

-- Insert individual featured workouts
INSERT INTO workouts (name, description, exercises) VALUES 
(
  'Morning Power Flow',
  'Start your day with this energizing full-body routine',
  '[
    {"name": "Jumping Jacks", "sets": "3", "reps": "30", "weight": "Bodyweight", "restTime": "45 seconds", "order": 0},
    {"name": "Push-ups", "sets": "3", "reps": "12", "weight": "Bodyweight", "restTime": "60 seconds", "order": 1},
    {"name": "Bodyweight Squats", "sets": "3", "reps": "15", "weight": "Bodyweight", "restTime": "60 seconds", "order": 2},
    {"name": "Dumbbell Rows", "sets": "3", "reps": "10", "weight": "15 kg", "restTime": "90 seconds", "order": 3},
    {"name": "Plank", "sets": "3", "reps": "45 seconds", "weight": "Bodyweight", "restTime": "60 seconds", "order": 4},
    {"name": "Dumbbell Shoulder Press", "sets": "3", "reps": "12", "weight": "10 kg", "restTime": "90 seconds", "order": 5},
    {"name": "Lunges", "sets": "3", "reps": "10 each leg", "weight": "Bodyweight", "restTime": "60 seconds", "order": 6},
    {"name": "Mountain Climbers", "sets": "3", "reps": "20", "weight": "Bodyweight", "restTime": "45 seconds", "order": 7}
  ]'::jsonb
),
(
  'HIIT Cardio Blast',
  'High-intensity interval training for maximum fat burn',
  '[
    {"name": "Burpees", "sets": "4", "reps": "30 seconds", "weight": "Bodyweight", "restTime": "30 seconds", "order": 0},
    {"name": "High Knees", "sets": "4", "reps": "30 seconds", "weight": "Bodyweight", "restTime": "30 seconds", "order": 1},
    {"name": "Jump Squats", "sets": "4", "reps": "30 seconds", "weight": "Bodyweight", "restTime": "30 seconds", "order": 2},
    {"name": "Mountain Climbers", "sets": "4", "reps": "30 seconds", "weight": "Bodyweight", "restTime": "30 seconds", "order": 3},
    {"name": "Jumping Lunges", "sets": "4", "reps": "30 seconds", "weight": "Bodyweight", "restTime": "30 seconds", "order": 4},
    {"name": "Plank Jacks", "sets": "4", "reps": "30 seconds", "weight": "Bodyweight", "restTime": "30 seconds", "order": 5}
  ]'::jsonb
),
(
  'Core Crusher',
  'Strengthen and tone your core with targeted movements',
  '[
    {"name": "Crunches", "sets": "3", "reps": "20", "weight": "Bodyweight", "restTime": "45 seconds", "order": 0},
    {"name": "Plank", "sets": "3", "reps": "60 seconds", "weight": "Bodyweight", "restTime": "60 seconds", "order": 1},
    {"name": "Russian Twists", "sets": "3", "reps": "25", "weight": "Bodyweight", "restTime": "45 seconds", "order": 2},
    {"name": "Bicycle Crunches", "sets": "3", "reps": "20 each side", "weight": "Bodyweight", "restTime": "45 seconds", "order": 3},
    {"name": "Dead Bug", "sets": "3", "reps": "10 each side", "weight": "Bodyweight", "restTime": "45 seconds", "order": 4},
    {"name": "Side Plank", "sets": "3", "reps": "30 seconds each side", "weight": "Bodyweight", "restTime": "60 seconds", "order": 5},
    {"name": "Leg Raises", "sets": "3", "reps": "15", "weight": "Bodyweight", "restTime": "45 seconds", "order": 6},
    {"name": "Flutter Kicks", "sets": "3", "reps": "30 seconds", "weight": "Bodyweight", "restTime": "45 seconds", "order": 7},
    {"name": "Hollow Body Hold", "sets": "3", "reps": "30 seconds", "weight": "Bodyweight", "restTime": "60 seconds", "order": 8},
    {"name": "V-Ups", "sets": "3", "reps": "12", "weight": "Bodyweight", "restTime": "45 seconds", "order": 9}
  ]'::jsonb
),
(
  'Upper Body Builder',
  'Build strength and muscle in your upper body',
  '[
    {"name": "Push-ups", "sets": "4", "reps": "12", "weight": "Bodyweight", "restTime": "90 seconds", "order": 0},
    {"name": "Dumbbell Bench Press", "sets": "4", "reps": "10", "weight": "20 kg", "restTime": "2 minutes", "order": 1},
    {"name": "Pull-ups", "sets": "4", "reps": "8", "weight": "Bodyweight", "restTime": "2 minutes", "order": 2},
    {"name": "Dumbbell Rows", "sets": "4", "reps": "10", "weight": "18 kg", "restTime": "90 seconds", "order": 3},
    {"name": "Overhead Press", "sets": "4", "reps": "10", "weight": "15 kg", "restTime": "2 minutes", "order": 4},
    {"name": "Dumbbell Flyes", "sets": "3", "reps": "12", "weight": "12 kg", "restTime": "90 seconds", "order": 5},
    {"name": "Bicep Curls", "sets": "3", "reps": "12", "weight": "12 kg", "restTime": "60 seconds", "order": 6},
    {"name": "Tricep Dips", "sets": "3", "reps": "12", "weight": "Bodyweight", "restTime": "60 seconds", "order": 7},
    {"name": "Lateral Raises", "sets": "3", "reps": "15", "weight": "8 kg", "restTime": "60 seconds", "order": 8},
    {"name": "Face Pulls", "sets": "3", "reps": "15", "weight": "Light resistance", "restTime": "60 seconds", "order": 9},
    {"name": "Diamond Push-ups", "sets": "3", "reps": "8", "weight": "Bodyweight", "restTime": "90 seconds", "order": 10},
    {"name": "Hammer Curls", "sets": "3", "reps": "12", "weight": "10 kg", "restTime": "60 seconds", "order": 11}
  ]'::jsonb
),
(
  'Dumbbell Burner',
  'Strength-focused routine using only dumbbells',
  '[
    {"name": "Dumbbell Squats", "sets": "4", "reps": "12", "weight": "20 kg", "restTime": "2 minutes", "order": 0},
    {"name": "Dumbbell Bench Press", "sets": "4", "reps": "10", "weight": "22 kg", "restTime": "2 minutes", "order": 1},
    {"name": "Dumbbell Rows", "sets": "4", "reps": "10", "weight": "20 kg", "restTime": "90 seconds", "order": 2},
    {"name": "Dumbbell Shoulder Press", "sets": "4", "reps": "10", "weight": "15 kg", "restTime": "90 seconds", "order": 3},
    {"name": "Dumbbell Lunges", "sets": "3", "reps": "12 each leg", "weight": "15 kg", "restTime": "90 seconds", "order": 4},
    {"name": "Dumbbell Deadlifts", "sets": "4", "reps": "10", "weight": "25 kg", "restTime": "2 minutes", "order": 5},
    {"name": "Dumbbell Bicep Curls", "sets": "3", "reps": "12", "weight": "12 kg", "restTime": "60 seconds", "order": 6},
    {"name": "Dumbbell Tricep Extensions", "sets": "3", "reps": "12", "weight": "10 kg", "restTime": "60 seconds", "order": 7},
    {"name": "Dumbbell Flyes", "sets": "3", "reps": "12", "weight": "12 kg", "restTime": "90 seconds", "order": 8},
    {"name": "Dumbbell Thrusters", "sets": "3", "reps": "10", "weight": "12 kg", "restTime": "90 seconds", "order": 9}
  ]'::jsonb
),
(
  '15-Min Core Shred',
  'Quick and intense core workout to blast your abs',
  '[
    {"name": "Plank", "sets": "3", "reps": "45 seconds", "weight": "Bodyweight", "restTime": "30 seconds", "order": 0},
    {"name": "Bicycle Crunches", "sets": "3", "reps": "30", "weight": "Bodyweight", "restTime": "30 seconds", "order": 1},
    {"name": "Russian Twists", "sets": "3", "reps": "25", "weight": "Bodyweight", "restTime": "30 seconds", "order": 2},
    {"name": "Mountain Climbers", "sets": "3", "reps": "30 seconds", "weight": "Bodyweight", "restTime": "30 seconds", "order": 3},
    {"name": "Dead Bug", "sets": "3", "reps": "10 each side", "weight": "Bodyweight", "restTime": "30 seconds", "order": 4},
    {"name": "V-Ups", "sets": "3", "reps": "15", "weight": "Bodyweight", "restTime": "30 seconds", "order": 5}
  ]'::jsonb
),
(
  'No-Equipment HIIT Blast',
  'Fast-paced, sweat-dripping HIIT with no gear required',
  '[
    {"name": "Jumping Jacks", "sets": "4", "reps": "45 seconds", "weight": "Bodyweight", "restTime": "15 seconds", "order": 0},
    {"name": "Burpees", "sets": "4", "reps": "30 seconds", "weight": "Bodyweight", "restTime": "30 seconds", "order": 1},
    {"name": "High Knees", "sets": "4", "reps": "30 seconds", "weight": "Bodyweight", "restTime": "30 seconds", "order": 2},
    {"name": "Jump Squats", "sets": "4", "reps": "30 seconds", "weight": "Bodyweight", "restTime": "30 seconds", "order": 3},
    {"name": "Push-ups", "sets": "4", "reps": "30 seconds", "weight": "Bodyweight", "restTime": "30 seconds", "order": 4},
    {"name": "Plank Jacks", "sets": "4", "reps": "30 seconds", "weight": "Bodyweight", "restTime": "30 seconds", "order": 5},
    {"name": "Tuck Jumps", "sets": "4", "reps": "20 seconds", "weight": "Bodyweight", "restTime": "40 seconds", "order": 6}
  ]'::jsonb
),
(
  'Pull-Up Power Routine',
  'Upper body workout focused on back and arms strength',
  '[
    {"name": "Pull-ups", "sets": "5", "reps": "8", "weight": "Bodyweight", "restTime": "2 minutes", "order": 0},
    {"name": "Chin-ups", "sets": "4", "reps": "6", "weight": "Bodyweight", "restTime": "2 minutes", "order": 1},
    {"name": "Wide Grip Pull-ups", "sets": "3", "reps": "5", "weight": "Bodyweight", "restTime": "2 minutes", "order": 2},
    {"name": "Negative Pull-ups", "sets": "3", "reps": "5", "weight": "Bodyweight", "restTime": "90 seconds", "order": 3},
    {"name": "Hanging Knee Raises", "sets": "3", "reps": "10", "weight": "Bodyweight", "restTime": "90 seconds", "order": 4},
    {"name": "Dead Hang", "sets": "3", "reps": "30 seconds", "weight": "Bodyweight", "restTime": "90 seconds", "order": 5},
    {"name": "Commando Pull-ups", "sets": "3", "reps": "6", "weight": "Bodyweight", "restTime": "2 minutes", "order": 6},
    {"name": "L-Sit Pull-ups", "sets": "2", "reps": "3", "weight": "Bodyweight", "restTime": "2 minutes", "order": 7},
    {"name": "Archer Pull-ups", "sets": "2", "reps": "4 each side", "weight": "Bodyweight", "restTime": "2 minutes", "order": 8}
  ]'::jsonb
);

-- Insert Push Pull Legs Split routine workouts
INSERT INTO workouts (name, description, exercises) VALUES 
(
  'Push Day - Chest, Shoulders, Triceps',
  'Day 1 of Push Pull Legs Split - Focus on pushing movements',
  '[
    {"name": "Bench Press", "sets": "4", "reps": "8-10", "weight": "70 kg", "restTime": "3 minutes", "order": 0},
    {"name": "Overhead Press", "sets": "4", "reps": "8-10", "weight": "45 kg", "restTime": "2.5 minutes", "order": 1},
    {"name": "Incline Dumbbell Press", "sets": "3", "reps": "10-12", "weight": "25 kg", "restTime": "2 minutes", "order": 2},
    {"name": "Dumbbell Flyes", "sets": "3", "reps": "12-15", "weight": "15 kg", "restTime": "90 seconds", "order": 3},
    {"name": "Lateral Raises", "sets": "4", "reps": "12-15", "weight": "10 kg", "restTime": "60 seconds", "order": 4},
    {"name": "Triceps Dips", "sets": "3", "reps": "10-12", "weight": "Bodyweight", "restTime": "90 seconds", "order": 5},
    {"name": "Overhead Tricep Extension", "sets": "3", "reps": "12-15", "weight": "20 kg", "restTime": "90 seconds", "order": 6},
    {"name": "Push-ups", "sets": "3", "reps": "15-20", "weight": "Bodyweight", "restTime": "60 seconds", "order": 7}
  ]'::jsonb
),
(
  'Pull Day - Back, Biceps',
  'Day 2 of Push Pull Legs Split - Focus on pulling movements',
  '[
    {"name": "Deadlifts", "sets": "4", "reps": "6-8", "weight": "80 kg", "restTime": "3 minutes", "order": 0},
    {"name": "Pull-ups", "sets": "4", "reps": "8-10", "weight": "Bodyweight", "restTime": "2.5 minutes", "order": 1},
    {"name": "Barbell Rows", "sets": "4", "reps": "8-10", "weight": "60 kg", "restTime": "2.5 minutes", "order": 2},
    {"name": "Lat Pulldowns", "sets": "3", "reps": "10-12", "weight": "50 kg", "restTime": "2 minutes", "order": 3},
    {"name": "Cable Rows", "sets": "3", "reps": "12-15", "weight": "45 kg", "restTime": "90 seconds", "order": 4},
    {"name": "Bicep Curls", "sets": "4", "reps": "12-15", "weight": "15 kg", "restTime": "60 seconds", "order": 5},
    {"name": "Hammer Curls", "sets": "3", "reps": "12-15", "weight": "12 kg", "restTime": "60 seconds", "order": 6},
    {"name": "Face Pulls", "sets": "3", "reps": "15-20", "weight": "Light", "restTime": "60 seconds", "order": 7}
  ]'::jsonb
),
(
  'Legs Day - Quads, Hamstrings, Glutes, Calves',
  'Day 3 of Push Pull Legs Split - Focus on lower body',
  '[
    {"name": "Squats", "sets": "4", "reps": "8-10", "weight": "60 kg", "restTime": "3 minutes", "order": 0},
    {"name": "Romanian Deadlifts", "sets": "4", "reps": "8-10", "weight": "50 kg", "restTime": "2.5 minutes", "order": 1},
    {"name": "Bulgarian Split Squats", "sets": "3", "reps": "10-12 each leg", "weight": "20 kg", "restTime": "2 minutes", "order": 2},
    {"name": "Leg Press", "sets": "3", "reps": "12-15", "weight": "100 kg", "restTime": "2 minutes", "order": 3},
    {"name": "Walking Lunges", "sets": "3", "reps": "12 each leg", "weight": "15 kg", "restTime": "90 seconds", "order": 4},
    {"name": "Calf Raises", "sets": "4", "reps": "15-20", "weight": "30 kg", "restTime": "60 seconds", "order": 5},
    {"name": "Glute Bridges", "sets": "3", "reps": "15-20", "weight": "25 kg", "restTime": "90 seconds", "order": 6},
    {"name": "Step-ups", "sets": "3", "reps": "10 each leg", "weight": "15 kg", "restTime": "90 seconds", "order": 7}
  ]'::jsonb
);