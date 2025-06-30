/*
  # Update food_logs table to properly associate with user profiles

  1. Changes:
    - Modify `user_id` column to be `user_profile_id` for consistency
    - Add foreign key constraint to link with user_profiles table
    - Update RLS policies to enforce user-specific access

  2. Security:
    - Enable RLS on `food_logs` table (already enabled)
    - Update policies for user-specific access control
    - Ensure each user can only access their own nutrition data
*/

-- Rename user_id column to user_profile_id for consistency
ALTER TABLE food_logs RENAME COLUMN user_id TO user_profile_id;

-- Add foreign key constraint to link with user_profiles
ALTER TABLE food_logs 
  ADD CONSTRAINT food_logs_user_profile_id_fkey 
  FOREIGN KEY (user_profile_id) 
  REFERENCES user_profiles(id) 
  ON DELETE CASCADE;

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view food logs" ON food_logs;
DROP POLICY IF EXISTS "Anyone can insert food logs" ON food_logs;
DROP POLICY IF EXISTS "Anyone can update food logs" ON food_logs;
DROP POLICY IF EXISTS "Anyone can delete food logs" ON food_logs;

-- Create new user-specific policies
CREATE POLICY "Users can view their own food logs"
  ON food_logs
  FOR SELECT
  USING (
    user_profile_id IN (
      SELECT id FROM user_profiles
    )
  );

CREATE POLICY "Users can insert their own food logs"
  ON food_logs
  FOR INSERT
  WITH CHECK (
    user_profile_id IN (
      SELECT id FROM user_profiles
    )
  );

CREATE POLICY "Users can update their own food logs"
  ON food_logs
  FOR UPDATE
  USING (
    user_profile_id IN (
      SELECT id FROM user_profiles
    )
  )
  WITH CHECK (
    user_profile_id IN (
      SELECT id FROM user_profiles
    )
  );

CREATE POLICY "Users can delete their own food logs"
  ON food_logs
  FOR DELETE
  USING (
    user_profile_id IN (
      SELECT id FROM user_profiles
    )
  );

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_food_logs_user_profile_id ON food_logs(user_profile_id);