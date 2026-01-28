/*
  # Fix RLS policies for user_ingredients table

  1. Changes
    - Drop existing policies
    - Re-create policies with correct permissions
    - Ensure RLS is enabled
  
  2. Security
    - Enable RLS on user_ingredients table
    - Add policies for authenticated users to:
      - Read their own ingredients
      - Add ingredients to their bar
      - Remove ingredients from their bar
*/

-- First, drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can read their own ingredients" ON user_ingredients;
  DROP POLICY IF EXISTS "Users can add ingredients to their bar" ON user_ingredients;
  DROP POLICY IF EXISTS "Users can remove ingredients from their bar" ON user_ingredients;
END $$;

-- Make sure RLS is enabled
ALTER TABLE user_ingredients ENABLE ROW LEVEL SECURITY;

-- Re-create policies with correct permissions
CREATE POLICY "Users can read their own ingredients"
  ON user_ingredients
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add ingredients to their bar"
  ON user_ingredients
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove ingredients from their bar"
  ON user_ingredients
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);