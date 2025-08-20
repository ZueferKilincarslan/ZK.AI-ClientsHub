/*
  # Create User Tables for ZK.AI Client Portal

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `email` (text, unique)
      - `full_name` (text)
      - `company` (text)
      - `avatar_url` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `workflows`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles)
      - `name` (text)
      - `description` (text)
      - `status` (enum: active, paused, failed)
      - `executions` (integer)
      - `success_rate` (numeric)
      - `last_run` (timestamp)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `analytics`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles)
      - `metric_name` (text)
      - `metric_value` (text)
      - `date` (date)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access only their own data
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  company text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create workflows table
CREATE TABLE IF NOT EXISTS workflows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  status text CHECK (status IN ('active', 'paused', 'failed')) DEFAULT 'active',
  executions integer DEFAULT 0,
  success_rate numeric(5,2) DEFAULT 0.00,
  last_run timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create analytics table
CREATE TABLE IF NOT EXISTS analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  metric_name text NOT NULL,
  metric_value text NOT NULL,
  date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create policies for workflows
CREATE POLICY "Users can read own workflows"
  ON workflows
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own workflows"
  ON workflows
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workflows"
  ON workflows
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own workflows"
  ON workflows
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for analytics
CREATE POLICY "Users can read own analytics"
  ON analytics
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analytics"
  ON analytics
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create function to handle user profile creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION handle_new_user();
  END IF;
END $$;

-- Insert sample data for demonstration
DO $$
DECLARE
  sample_user_id uuid;
BEGIN
  -- Check if we have any users to add sample data for
  SELECT id INTO sample_user_id FROM auth.users LIMIT 1;
  
  IF sample_user_id IS NOT NULL THEN
    -- Insert sample workflows
    INSERT INTO workflows (user_id, name, description, status, executions, success_rate, last_run) VALUES
    (sample_user_id, 'Welcome Email Sequence', 'Automated welcome series for new subscribers', 'active', 1247, 98.2, now() - interval '2 hours'),
    (sample_user_id, 'Lead Nurturing Campaign', 'Follow-up sequence for potential customers', 'active', 856, 94.5, now() - interval '1 day'),
    (sample_user_id, 'Customer Onboarding', 'Onboarding flow for new customers', 'paused', 423, 96.8, now() - interval '3 days'),
    (sample_user_id, 'Abandoned Cart Recovery', 'Recover abandoned shopping carts', 'failed', 234, 87.3, now() - interval '1 week')
    ON CONFLICT DO NOTHING;

    -- Insert sample analytics
    INSERT INTO analytics (user_id, metric_name, metric_value, date) VALUES
    (sample_user_id, 'total_executions', '2760', CURRENT_DATE),
    (sample_user_id, 'success_rate', '94.2', CURRENT_DATE),
    (sample_user_id, 'emails_sent', '15420', CURRENT_DATE),
    (sample_user_id, 'active_workflows', '3', CURRENT_DATE)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;