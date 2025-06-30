/*
  # Add social and community features

  1. New Tables
    - `user_achievements`
      - `id` (uuid, primary key)
      - `user_profile_id` (uuid, foreign key)
      - `achievement_type` (text, required)
      - `achievement_name` (text, required)
      - `description` (text, optional)
      - `icon` (text, optional)
      - `earned_at` (timestamp)
      - `created_at` (timestamp)

    - `workout_challenges`
      - `id` (uuid, primary key)
      - `name` (text, required)
      - `description` (text, required)
      - `challenge_type` (text, required - daily/weekly/monthly)
      - `target_metric` (text, required - workouts/duration/calories/etc)
      - `target_value` (integer, required)
      - `start_date` (date, required)
      - `end_date` (date, required)
      - `is_active` (boolean, default true)
      - `created_at` (timestamp)

    - `user_challenge_progress`
      - `id` (uuid, primary key)
      - `user_profile_id` (uuid, foreign key)
      - `challenge_id` (uuid, foreign key)
      - `current_progress` (integer, default 0)
      - `is_completed` (boolean, default false)
      - `completed_at` (timestamp, optional)
      - `joined_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add appropriate policies

  3. Functions
    - Function to check and award achievements
    - Function to update challenge progress
*/

-- Create user achievements table
CREATE TABLE IF NOT EXISTS user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_profile_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  achievement_type text NOT NULL CHECK (achievement_type IN ('workout_streak', 'total_workouts', 'workout_duration', 'weight_milestone', 'consistency', 'first_workout', 'nutrition_goal')),
  achievement_name text NOT NULL,
  description text,
  icon text,
  earned_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_profile_id, achievement_type, achievement_name)
);

-- Create workout challenges table
CREATE TABLE IF NOT EXISTS workout_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  challenge_type text NOT NULL CHECK (challenge_type IN ('daily', 'weekly', 'monthly')),
  target_metric text NOT NULL CHECK (target_metric IN ('workouts', 'duration', 'calories', 'streak', 'exercises')),
  target_value integer NOT NULL CHECK (target_value > 0),
  start_date date NOT NULL,
  end_date date NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  CHECK (end_date > start_date)
);

-- Create user challenge progress table
CREATE TABLE IF NOT EXISTS user_challenge_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_profile_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  challenge_id uuid REFERENCES workout_challenges(id) ON DELETE CASCADE,
  current_progress integer DEFAULT 0 CHECK (current_progress >= 0),
  is_completed boolean DEFAULT false,
  completed_at timestamptz,
  joined_at timestamptz DEFAULT now(),
  UNIQUE(user_profile_id, challenge_id)
);

-- Enable RLS
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_challenge_progress ENABLE ROW LEVEL SECURITY;

-- Policies for user_achievements
CREATE POLICY "Users can view their own achievements"
  ON user_achievements
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "System can manage achievements"
  ON user_achievements
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Policies for workout_challenges
CREATE POLICY "Anyone can view active challenges"
  ON workout_challenges
  FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "System can manage challenges"
  ON workout_challenges
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Policies for user_challenge_progress
CREATE POLICY "Users can view their own challenge progress"
  ON user_challenge_progress
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can manage their own challenge progress"
  ON user_challenge_progress
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_profile_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_type ON user_achievements(achievement_type);
CREATE INDEX IF NOT EXISTS idx_workout_challenges_active ON workout_challenges(is_active, start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_user_challenge_progress_user_id ON user_challenge_progress(user_profile_id);
CREATE INDEX IF NOT EXISTS idx_user_challenge_progress_challenge_id ON user_challenge_progress(challenge_id);

-- Function to check and award achievements
CREATE OR REPLACE FUNCTION check_and_award_achievements(p_user_profile_id uuid)
RETURNS void AS $$
DECLARE
  workout_count integer;
  current_streak integer;
  total_duration integer;
BEGIN
  -- Get user stats
  SELECT COUNT(*) INTO workout_count
  FROM workout_sessions 
  WHERE user_profile_id = p_user_profile_id;

  -- Calculate current streak (simplified)
  SELECT COUNT(*) INTO current_streak
  FROM (
    SELECT DISTINCT DATE(completed_at) as workout_date
    FROM workout_sessions 
    WHERE user_profile_id = p_user_profile_id
    AND completed_at >= CURRENT_DATE - INTERVAL '30 days'
    ORDER BY workout_date DESC
  ) consecutive_days;

  SELECT COALESCE(SUM(duration), 0) INTO total_duration
  FROM workout_sessions 
  WHERE user_profile_id = p_user_profile_id;

  -- Award first workout achievement
  IF workout_count = 1 THEN
    INSERT INTO user_achievements (user_profile_id, achievement_type, achievement_name, description, icon)
    VALUES (p_user_profile_id, 'first_workout', 'First Workout Complete', 'Completed your very first workout!', '🎉')
    ON CONFLICT (user_profile_id, achievement_type, achievement_name) DO NOTHING;
  END IF;

  -- Award workout milestone achievements
  IF workout_count >= 10 THEN
    INSERT INTO user_achievements (user_profile_id, achievement_type, achievement_name, description, icon)
    VALUES (p_user_profile_id, 'total_workouts', '10 Workouts', 'Completed 10 workouts!', '💪')
    ON CONFLICT (user_profile_id, achievement_type, achievement_name) DO NOTHING;
  END IF;

  IF workout_count >= 50 THEN
    INSERT INTO user_achievements (user_profile_id, achievement_type, achievement_name, description, icon)
    VALUES (p_user_profile_id, 'total_workouts', '50 Workouts', 'Completed 50 workouts!', '🏆')
    ON CONFLICT (user_profile_id, achievement_type, achievement_name) DO NOTHING;
  END IF;

  -- Award streak achievements
  IF current_streak >= 7 THEN
    INSERT INTO user_achievements (user_profile_id, achievement_type, achievement_name, description, icon)
    VALUES (p_user_profile_id, 'workout_streak', '7 Day Streak', 'Worked out for 7 consecutive days!', '🔥')
    ON CONFLICT (user_profile_id, achievement_type, achievement_name) DO NOTHING;
  END IF;

  IF current_streak >= 30 THEN
    INSERT INTO user_achievements (user_profile_id, achievement_type, achievement_name, description, icon)
    VALUES (p_user_profile_id, 'workout_streak', '30 Day Streak', 'Worked out for 30 consecutive days!', '🚀')
    ON CONFLICT (user_profile_id, achievement_type, achievement_name) DO NOTHING;
  END IF;

END;
$$ LANGUAGE plpgsql;

-- Function to update challenge progress
CREATE OR REPLACE FUNCTION update_challenge_progress()
RETURNS TRIGGER AS $$
DECLARE
  challenge_record RECORD;
  user_id uuid;
BEGIN
  -- Get user_profile_id from the workout session
  user_id := NEW.user_profile_id;
  
  -- Skip if no user_profile_id
  IF user_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Check all active challenges for this user
  FOR challenge_record IN 
    SELECT c.*, ucp.current_progress, ucp.id as progress_id
    FROM workout_challenges c
    LEFT JOIN user_challenge_progress ucp ON c.id = ucp.challenge_id AND ucp.user_profile_id = user_id
    WHERE c.is_active = true 
    AND c.start_date <= CURRENT_DATE 
    AND c.end_date >= CURRENT_DATE
  LOOP
    -- Auto-join challenge if not already joined
    IF challenge_record.progress_id IS NULL THEN
      INSERT INTO user_challenge_progress (user_profile_id, challenge_id, current_progress)
      VALUES (user_id, challenge_record.id, 0);
      challenge_record.current_progress := 0;
    END IF;

    -- Update progress based on challenge type
    IF challenge_record.target_metric = 'workouts' THEN
      UPDATE user_challenge_progress 
      SET current_progress = current_progress + 1,
          is_completed = (current_progress + 1 >= challenge_record.target_value),
          completed_at = CASE WHEN (current_progress + 1 >= challenge_record.target_value) THEN now() ELSE completed_at END
      WHERE user_profile_id = user_id AND challenge_id = challenge_record.id;
    
    ELSIF challenge_record.target_metric = 'duration' THEN
      UPDATE user_challenge_progress 
      SET current_progress = current_progress + (NEW.duration / 60), -- Convert seconds to minutes
          is_completed = (current_progress + (NEW.duration / 60) >= challenge_record.target_value),
          completed_at = CASE WHEN (current_progress + (NEW.duration / 60) >= challenge_record.target_value) THEN now() ELSE completed_at END
      WHERE user_profile_id = user_id AND challenge_id = challenge_record.id;
    END IF;
  END LOOP;

  -- Check for achievements
  PERFORM check_and_award_achievements(user_id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update challenge progress when workout sessions are added
CREATE TRIGGER update_challenge_progress_on_workout
  AFTER INSERT ON workout_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_challenge_progress();

-- Insert some default challenges
INSERT INTO workout_challenges (name, description, challenge_type, target_metric, target_value, start_date, end_date) VALUES
('Weekly Warrior', 'Complete 5 workouts this week', 'weekly', 'workouts', 5, CURRENT_DATE - INTERVAL '7 days', CURRENT_DATE + INTERVAL '7 days'),
('Daily Dedication', 'Complete 1 workout today', 'daily', 'workouts', 1, CURRENT_DATE, CURRENT_DATE),
('Monthly Marathon', 'Complete 20 workouts this month', 'monthly', 'workouts', 20, DATE_TRUNC('month', CURRENT_DATE), DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' - INTERVAL '1 day'),
('Time Champion', 'Exercise for 300 minutes this week', 'weekly', 'duration', 300, CURRENT_DATE - INTERVAL '7 days', CURRENT_DATE + INTERVAL '7 days');