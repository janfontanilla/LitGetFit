/*
  # Fix missing workout_sessions table
  
  This script creates the missing workout_sessions and workouts tables
  that should have been created by the migration but weren't applied.
  
  Run this script in your Supabase SQL Editor to fix the database schema.
*/

-- Create workouts table if it doesn't exist
CREATE TABLE IF NOT EXISTS workouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_profile_id uuid,
  name text NOT NULL,
  description text,
  exercises jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create workout_sessions table if it doesn't exist
CREATE TABLE IF NOT EXISTS workout_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_profile_id uuid,
  workout_id uuid,
  workout_name text NOT NULL,
  duration integer NOT NULL CHECK (duration >= 0),
  exercises_completed integer NOT NULL CHECK (exercises_completed >= 0),
  total_exercises integer NOT NULL CHECK (total_exercises > 0),
  sets_completed integer NOT NULL CHECK (sets_completed >= 0),
  total_sets integer NOT NULL CHECK (total_sets > 0),
  targeted_muscles text[] NOT NULL DEFAULT '{}',
  completed_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for workouts table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'workouts' AND policyname = 'Anyone can view workouts'
  ) THEN
    CREATE POLICY "Anyone can view workouts"
      ON workouts
      FOR SELECT
      TO public
      USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'workouts' AND policyname = 'Anyone can insert workouts'
  ) THEN
    CREATE POLICY "Anyone can insert workouts"
      ON workouts
      FOR INSERT
      TO public
      WITH CHECK (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'workouts' AND policyname = 'Anyone can update workouts'
  ) THEN
    CREATE POLICY "Anyone can update workouts"
      ON workouts
      FOR UPDATE
      TO public
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'workouts' AND policyname = 'Anyone can delete workouts'
  ) THEN
    CREATE POLICY "Anyone can delete workouts"
      ON workouts
      FOR DELETE
      TO public
      USING (true);
  END IF;
END $$;

-- Create policies for workout_sessions table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'workout_sessions' AND policyname = 'Anyone can view workout sessions'
  ) THEN
    CREATE POLICY "Anyone can view workout sessions"
      ON workout_sessions
      FOR SELECT
      TO public
      USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'workout_sessions' AND policyname = 'Anyone can insert workout sessions'
  ) THEN
    CREATE POLICY "Anyone can insert workout sessions"
      ON workout_sessions
      FOR INSERT
      TO public
      WITH CHECK (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'workout_sessions' AND policyname = 'Anyone can update workout sessions'
  ) THEN
    CREATE POLICY "Anyone can update workout sessions"
      ON workout_sessions
      FOR UPDATE
      TO public
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'workout_sessions' AND policyname = 'Anyone can delete workout sessions'
  ) THEN
    CREATE POLICY "Anyone can delete workout sessions"
      ON workout_sessions
      FOR DELETE
      TO public
      USING (true);
  END IF;
END $$;

-- Create function to update updated_at timestamp (if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger to workouts table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_workouts_updated_at'
  ) THEN
    CREATE TRIGGER update_workouts_updated_at
      BEFORE UPDATE ON workouts
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Add foreign key constraint for workout_sessions -> workouts (optional reference)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'workout_sessions_workout_id_fkey'
  ) THEN
    ALTER TABLE workout_sessions 
    ADD CONSTRAINT workout_sessions_workout_id_fkey 
    FOREIGN KEY (workout_id) REFERENCES workouts(id) ON DELETE SET NULL;
  END IF;
END $$;