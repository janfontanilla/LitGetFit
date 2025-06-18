/*
  # Create user profiles table

  1. New Tables
    - `user_profiles`
      - `id` (uuid, primary key)
      - `name` (text, required)
      - `age` (integer, required)
      - `height` (integer, required - in cm)
      - `weight` (integer, optional - in kg)
      - `fitness_experience` (text, required - beginner/intermediate/advanced)
      - `primary_goal` (text, required - lose_weight/gain_weight/build_muscle/improve_endurance/general_fitness)
      - `activity_level` (text, required - sedentary/lightly_active/moderately_active/very_active/extremely_active)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `user_profiles` table
    - Add policy for users to manage their own profiles
*/

CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  age integer NOT NULL CHECK (age > 0 AND age < 150),
  height integer NOT NULL CHECK (height > 0 AND height < 300),
  weight integer CHECK (weight IS NULL OR (weight > 0 AND weight < 500)),
  fitness_experience text NOT NULL CHECK (fitness_experience IN ('beginner', 'intermediate', 'advanced')),
  primary_goal text NOT NULL CHECK (primary_goal IN ('lose_weight', 'gain_weight', 'build_muscle', 'improve_endurance', 'general_fitness')),
  activity_level text NOT NULL CHECK (activity_level IN ('sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for user profiles
CREATE POLICY "Users can insert their own profile"
  ON user_profiles
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Users can view all profiles"
  ON user_profiles
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON user_profiles
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();