/*
  # Create workouts table

  1. New Tables
    - `workouts`
      - `id` (uuid, primary key)
      - `name` (text, required) - Name of the workout
      - `description` (text, optional) - Description of the workout
      - `exercises` (jsonb, required) - Array of exercise objects
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `workouts` table
    - Add policy for public users to read all workouts
    - Add policy for public users to insert workouts
    - Add policy for public users to update workouts
    - Add policy for public users to delete workouts

  3. Triggers
    - Add trigger to automatically update `updated_at` timestamp
*/

-- Create workouts table
CREATE TABLE IF NOT EXISTS workouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  exercises jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust based on your authentication needs)
CREATE POLICY "Anyone can view workouts"
  ON workouts
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can insert workouts"
  ON workouts
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update workouts"
  ON workouts
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete workouts"
  ON workouts
  FOR DELETE
  TO public
  USING (true);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger to workouts table if it doesn't exist
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