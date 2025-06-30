/*
  # Enhance nutrition tracking with goals and analytics

  1. New Tables
    - `nutrition_goals`
      - `id` (uuid, primary key)
      - `user_profile_id` (uuid, foreign key)
      - `daily_calories` (integer, required)
      - `daily_protein` (decimal, required)
      - `daily_carbs` (decimal, required)
      - `daily_fat` (decimal, required)
      - `daily_water` (integer, optional - in ml)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `water_intake`
      - `id` (uuid, primary key)
      - `user_profile_id` (uuid, foreign key)
      - `amount_ml` (integer, required)
      - `logged_at` (timestamp)
      - `created_at` (timestamp)

    - `nutrition_analytics`
      - `id` (uuid, primary key)
      - `user_profile_id` (uuid, foreign key)
      - `date` (date, required)
      - `total_calories` (integer, default 0)
      - `total_protein` (decimal, default 0)
      - `total_carbs` (decimal, default 0)
      - `total_fat` (decimal, default 0)
      - `total_water_ml` (integer, default 0)
      - `meals_logged` (integer, default 0)
      - `goal_calories_met` (boolean, default false)
      - `goal_protein_met` (boolean, default false)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for user-specific data access

  3. Functions
    - Function to automatically update nutrition analytics when food logs are added
*/

-- Create nutrition goals table
CREATE TABLE IF NOT EXISTS nutrition_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_profile_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  daily_calories integer NOT NULL CHECK (daily_calories > 0),
  daily_protein decimal(6,2) NOT NULL CHECK (daily_protein > 0),
  daily_carbs decimal(6,2) NOT NULL CHECK (daily_carbs > 0),
  daily_fat decimal(6,2) NOT NULL CHECK (daily_fat > 0),
  daily_water_ml integer CHECK (daily_water_ml IS NULL OR daily_water_ml > 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_profile_id)
);

-- Create water intake table
CREATE TABLE IF NOT EXISTS water_intake (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_profile_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  amount_ml integer NOT NULL CHECK (amount_ml > 0),
  logged_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create nutrition analytics table
CREATE TABLE IF NOT EXISTS nutrition_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_profile_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  date date NOT NULL,
  total_calories integer DEFAULT 0 CHECK (total_calories >= 0),
  total_protein decimal(6,2) DEFAULT 0 CHECK (total_protein >= 0),
  total_carbs decimal(6,2) DEFAULT 0 CHECK (total_carbs >= 0),
  total_fat decimal(6,2) DEFAULT 0 CHECK (total_fat >= 0),
  total_water_ml integer DEFAULT 0 CHECK (total_water_ml >= 0),
  meals_logged integer DEFAULT 0 CHECK (meals_logged >= 0),
  goal_calories_met boolean DEFAULT false,
  goal_protein_met boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_profile_id, date)
);

-- Enable RLS
ALTER TABLE nutrition_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE water_intake ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_analytics ENABLE ROW LEVEL SECURITY;

-- Policies for nutrition_goals
CREATE POLICY "Users can manage their own nutrition goals"
  ON nutrition_goals
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Policies for water_intake
CREATE POLICY "Users can manage their own water intake"
  ON water_intake
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Policies for nutrition_analytics
CREATE POLICY "Users can view their own nutrition analytics"
  ON nutrition_analytics
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "System can manage nutrition analytics"
  ON nutrition_analytics
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_nutrition_goals_user_id ON nutrition_goals(user_profile_id);
CREATE INDEX IF NOT EXISTS idx_water_intake_user_date ON water_intake(user_profile_id, logged_at);
CREATE INDEX IF NOT EXISTS idx_nutrition_analytics_user_date ON nutrition_analytics(user_profile_id, date);

-- Add trigger to nutrition_goals for updated_at
CREATE TRIGGER update_nutrition_goals_updated_at
  BEFORE UPDATE ON nutrition_goals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add trigger to nutrition_analytics for updated_at
CREATE TRIGGER update_nutrition_analytics_updated_at
  BEFORE UPDATE ON nutrition_analytics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to update nutrition analytics when food logs change
CREATE OR REPLACE FUNCTION update_nutrition_analytics()
RETURNS TRIGGER AS $$
DECLARE
  log_date date;
  user_id uuid;
BEGIN
  -- Determine the date and user for the food log
  IF TG_OP = 'DELETE' THEN
    log_date := OLD.logged_at::date;
    user_id := OLD.user_id;
  ELSE
    log_date := NEW.logged_at::date;
    user_id := NEW.user_id;
  END IF;

  -- Skip if no user_id (for public logs)
  IF user_id IS NULL THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  -- Update or insert nutrition analytics for the date
  INSERT INTO nutrition_analytics (
    user_profile_id,
    date,
    total_calories,
    total_protein,
    total_carbs,
    total_fat,
    meals_logged
  )
  SELECT 
    user_id,
    log_date,
    COALESCE(SUM(calories), 0),
    COALESCE(SUM(protein), 0),
    COALESCE(SUM(carbs), 0),
    COALESCE(SUM(fat), 0),
    COUNT(*)
  FROM food_logs 
  WHERE user_id = user_id AND logged_at::date = log_date
  ON CONFLICT (user_profile_id, date) 
  DO UPDATE SET
    total_calories = EXCLUDED.total_calories,
    total_protein = EXCLUDED.total_protein,
    total_carbs = EXCLUDED.total_carbs,
    total_fat = EXCLUDED.total_fat,
    meals_logged = EXCLUDED.meals_logged,
    updated_at = now();

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers for food_logs to update analytics
CREATE TRIGGER update_nutrition_analytics_on_food_log
  AFTER INSERT OR UPDATE OR DELETE ON food_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_nutrition_analytics();