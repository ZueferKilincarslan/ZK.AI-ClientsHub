/*
  # Update profiles table with role support

  1. Changes
    - Add role column to profiles table with default 'client'
    - Add check constraint for valid roles
    - Update existing profiles to have 'client' role
    - Create admin user for testing

  2. Security
    - Maintain existing RLS policies
    - Add admin access policies for cross-user data access
*/

-- Add role column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'role'
  ) THEN
    ALTER TABLE profiles ADD COLUMN role text DEFAULT 'client';
  END IF;
END $$;

-- Add check constraint for valid roles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'profiles_role_check'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('client', 'admin'));
  END IF;
END $$;

-- Update existing profiles to have client role
UPDATE profiles SET role = 'client' WHERE role IS NULL;

-- Add admin access policies for workflows
CREATE POLICY "admin_can_access_all" ON workflows
  FOR SELECT TO public
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Add admin access policies for analytics
CREATE POLICY "admin_can_access_all_analytics" ON analytics
  FOR SELECT TO public
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Add admin access policies for profiles
CREATE POLICY "admin_can_access_all_profiles" ON profiles
  FOR SELECT TO public
  USING (
    EXISTS (
      SELECT 1 FROM profiles AS admin_profile
      WHERE admin_profile.id = auth.uid() 
      AND admin_profile.role = 'admin'
    )
  );