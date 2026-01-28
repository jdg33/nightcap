/*
  # Enable Row Level Security for user data

  1. Security
    - Enable RLS on user_ingredients table (if not already enabled)
    - Add policies for authenticated users to:
      - Read their own ingredients
      - Add ingredients to their bar
      - Remove ingredients from their bar
    
  Note: Uses DO blocks to check if policies exist before creating them
*/

-- Enable RLS on user_ingredients table if not already enabled
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'user_ingredients' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE user_ingredients ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Create policies if they don't exist
DO $$ 
BEGIN
  -- Select policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_ingredients' 
    AND policyname = 'Users can read their own ingredients'
  ) THEN
    CREATE POLICY "Users can read their own ingredients"
      ON user_ingredients
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;

  -- Insert policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_ingredients' 
    AND policyname = 'Users can add ingredients to their bar'
  ) THEN
    CREATE POLICY "Users can add ingredients to their bar"
      ON user_ingredients
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;

  -- Delete policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_ingredients' 
    AND policyname = 'Users can remove ingredients from their bar'
  ) THEN
    CREATE POLICY "Users can remove ingredients from their bar"
      ON user_ingredients
      FOR DELETE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;