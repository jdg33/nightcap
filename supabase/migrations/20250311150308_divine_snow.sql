/*
  # Set up User Ingredients Security

  1. Security Changes
    - Add RLS policies for user_ingredients table
      - Users can only read/write their own data
      - Authenticated users can add/remove ingredients from their bar

  2. Changes
    - Enable RLS on user_ingredients table
    - Add policies for user data protection
    - Ensure user_id references auth.users
*/

-- Enable RLS on user_ingredients table
ALTER TABLE user_ingredients ENABLE ROW LEVEL SECURITY;

-- Create policies for user_ingredients table
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

-- Ensure user_id is properly constrained to auth.users
DO $$ BEGIN
  ALTER TABLE user_ingredients
    ADD CONSTRAINT user_ingredients_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES auth.users(id)
    ON DELETE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;