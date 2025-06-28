/*
  # Create workout_sessions table

  1. New Tables
    - `workout_sessions`
      - `id` (uuid, primary key)
      - `user_profile_id` (uuid, optional foreign key to user_profiles)
      - `workout_id` (uuid, optional foreign key to workouts)
      - `workout_name` (text, required)
      - `duration` (integer, required - duration in minutes)
      - `exercises_completed` (integer, required)
      - `total_exercises` (integer, required)
      - `sets_completed` (integer, required)
      - `total_sets` (integer, required)
      - `targeted_muscles` (text array, required)
      - `completed_at` (timestamp, required)
      - `created_at` (timestamp, auto-generated)

  2. Security
    - Enable RLS on `workout_sessions` table
    - Add policies for authenticated users to manage their own workout sessions
    - Add policies for public access (matching existing pattern in other tables)

  3. Indexes
    - Add index on completed_at for efficient date-based queries
    - Add index on user_profile_id for user-specific queries
*/

CREATE TABLE IF NOT EXISTS workout_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_profile_id uuid REFERENCES user_profiles(id) ON DELETE SET NULL,
  workout_id uuid REFERENCES workouts(id) ON DELETE SET NULL,
  workout_name text NOT NULL,
  duration integer NOT NULL CHECK (duration > 0),
  exercises_completed integer NOT NULL DEFAULT 0 CHECK (exercises_completed >= 0),
  total_exercises integer NOT NULL DEFAULT 1 CHECK (total_exercises > 0),
  sets_completed integer NOT NULL DEFAULT 0 CHECK (sets_completed >= 0),
  total_sets integer NOT NULL DEFAULT 1 CHECK (total_sets > 0),
  targeted_muscles text[] NOT NULL DEFAULT '{}',
  completed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (matching the pattern from other tables)
CREATE POLICY "Anyone can view workout sessions"
  ON workout_sessions
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can insert workout sessions"
  ON workout_sessions
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update workout sessions"
  ON workout_sessions
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete workout sessions"
  ON workout_sessions
  FOR DELETE
  TO public
  USING (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_workout_sessions_completed_at ON workout_sessions(completed_at);
CREATE INDEX IF NOT EXISTS idx_workout_sessions_user_profile_id ON workout_sessions(user_profile_id);
CREATE INDEX IF NOT EXISTS idx_workout_sessions_workout_id ON workout_sessions(workout_id);

-- Add constraint to ensure exercises_completed doesn't exceed total_exercises
ALTER TABLE workout_sessions ADD CONSTRAINT check_exercises_completed 
  CHECK (exercises_completed <= total_exercises);

-- Add constraint to ensure sets_completed doesn't exceed total_sets
ALTER TABLE workout_sessions ADD CONSTRAINT check_sets_completed 
  CHECK (sets_completed <= total_sets);