/*
  # Create food logs table

  1. New Tables
    - `food_logs`
      - `id` (uuid, primary key)
      - `user_id` (uuid, optional - for future user association)
      - `food_name` (text, required)
      - `quantity` (text, required - e.g., "2 eggs", "1 cup")
      - `meal_type` (text, required - breakfast/lunch/dinner/snack)
      - `calories` (integer, optional - estimated calories)
      - `protein` (decimal, optional - grams)
      - `carbs` (decimal, optional - grams)
      - `fat` (decimal, optional - grams)
      - `notes` (text, optional)
      - `logged_at` (timestamp)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `food_logs` table
    - Add policy for public access (adjust based on authentication needs)
*/

CREATE TABLE IF NOT EXISTS food_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  food_name text NOT NULL,
  quantity text NOT NULL,
  meal_type text NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  calories integer CHECK (calories >= 0),
  protein decimal(5,2) CHECK (protein >= 0),
  carbs decimal(5,2) CHECK (carbs >= 0),
  fat decimal(5,2) CHECK (fat >= 0),
  notes text,
  logged_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE food_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for public access
CREATE POLICY "Anyone can view food logs"
  ON food_logs
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can insert food logs"
  ON food_logs
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update food logs"
  ON food_logs
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete food logs"
  ON food_logs
  FOR DELETE
  TO public
  USING (true);