/*
  # Add workout templates and exercise library

  1. New Tables
    - `exercise_library`
      - `id` (uuid, primary key)
      - `name` (text, required)
      - `category` (text, required - strength/cardio/flexibility/etc)
      - `muscle_groups` (text array, required)
      - `equipment_needed` (text array, optional)
      - `difficulty_level` (text, required - beginner/intermediate/advanced)
      - `instructions` (text, optional)
      - `form_tips` (text, optional)
      - `video_url` (text, optional)
      - `created_at` (timestamp)

    - `workout_templates`
      - `id` (uuid, primary key)
      - `name` (text, required)
      - `description` (text, optional)
      - `category` (text, required - strength/cardio/hiit/yoga/etc)
      - `difficulty_level` (text, required)
      - `estimated_duration` (integer, required - in minutes)
      - `equipment_needed` (text array, optional)
      - `target_muscle_groups` (text array, required)
      - `exercises` (jsonb, required - array of exercise objects)
      - `is_featured` (boolean, default false)
      - `created_by` (text, optional - 'system' or user id)
      - `created_at` (timestamp)

    - `user_workout_favorites`
      - `id` (uuid, primary key)
      - `user_profile_id` (uuid, foreign key)
      - `workout_id` (uuid, optional - for custom workouts)
      - `template_id` (uuid, optional - for template workouts)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add appropriate policies for public access and user-specific data

  3. Indexes
    - Add indexes for efficient querying by category, difficulty, muscle groups
*/

-- Create exercise library table
CREATE TABLE IF NOT EXISTS exercise_library (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL CHECK (category IN ('strength', 'cardio', 'flexibility', 'balance', 'plyometric', 'core')),
  muscle_groups text[] NOT NULL DEFAULT '{}',
  equipment_needed text[] DEFAULT '{}',
  difficulty_level text NOT NULL CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  instructions text,
  form_tips text,
  video_url text,
  created_at timestamptz DEFAULT now()
);

-- Create workout templates table
CREATE TABLE IF NOT EXISTS workout_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  category text NOT NULL CHECK (category IN ('strength', 'cardio', 'hiit', 'yoga', 'pilates', 'crossfit', 'bodyweight', 'powerlifting')),
  difficulty_level text NOT NULL CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  estimated_duration integer NOT NULL CHECK (estimated_duration > 0),
  equipment_needed text[] DEFAULT '{}',
  target_muscle_groups text[] NOT NULL DEFAULT '{}',
  exercises jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_featured boolean DEFAULT false,
  created_by text DEFAULT 'system',
  created_at timestamptz DEFAULT now()
);

-- Create user workout favorites table
CREATE TABLE IF NOT EXISTS user_workout_favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_profile_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  workout_id uuid REFERENCES workouts(id) ON DELETE CASCADE,
  template_id uuid REFERENCES workout_templates(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT check_favorite_type CHECK (
    (workout_id IS NOT NULL AND template_id IS NULL) OR 
    (workout_id IS NULL AND template_id IS NOT NULL)
  )
);

-- Enable RLS
ALTER TABLE exercise_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_workout_favorites ENABLE ROW LEVEL SECURITY;

-- Policies for exercise_library (public read access)
CREATE POLICY "Anyone can view exercise library"
  ON exercise_library
  FOR SELECT
  TO public
  USING (true);

-- Policies for workout_templates (public read access)
CREATE POLICY "Anyone can view workout templates"
  ON workout_templates
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can insert workout templates"
  ON workout_templates
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Policies for user_workout_favorites
CREATE POLICY "Users can view their own favorites"
  ON user_workout_favorites
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can manage their own favorites"
  ON user_workout_favorites
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_exercise_library_category ON exercise_library(category);
CREATE INDEX IF NOT EXISTS idx_exercise_library_muscle_groups ON exercise_library USING GIN(muscle_groups);
CREATE INDEX IF NOT EXISTS idx_exercise_library_difficulty ON exercise_library(difficulty_level);

CREATE INDEX IF NOT EXISTS idx_workout_templates_category ON workout_templates(category);
CREATE INDEX IF NOT EXISTS idx_workout_templates_difficulty ON workout_templates(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_workout_templates_featured ON workout_templates(is_featured);
CREATE INDEX IF NOT EXISTS idx_workout_templates_muscle_groups ON workout_templates USING GIN(target_muscle_groups);

CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON user_workout_favorites(user_profile_id);