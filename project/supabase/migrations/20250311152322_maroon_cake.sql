/*
  # Fix user ingredients policies

  1. Changes
    - Drop existing policies on user_ingredients table
    - Re-create policies with correct user_id check using auth.uid()
    - Ensure RLS is enabled

  2. Security
    - Enable RLS on user_ingredients table
    - Add policies for:
      - Selecting user's own ingredients
      - Adding ingredients to user's bar
      - Removing ingredients from user's bar
*/

-- First, drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can read their own ingredients" ON user_ingredients;
  DROP POLICY IF EXISTS "Users can add ingredients to their bar" ON user_ingredients;
  DROP POLICY IF EXISTS "Users can remove ingredients from their bar" ON user_ingredients;
END $$;

-- Enable RLS
ALTER TABLE user_ingredients ENABLE ROW LEVEL SECURITY;

-- Re-create policies with correct auth.uid() checks
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