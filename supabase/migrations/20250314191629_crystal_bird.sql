/*
  # Add user-specific cocktail preferences and creator tracking

  1. Changes
    - Create user_cocktail_preferences table if not exists
    - Enable RLS and add policies for user data protection
    - Remove global is_jesse_original and is_hall_of_fame columns
    
  2. Security
    - Enable RLS on new table
    - Add policy for users to manage their preferences (if not exists)
    - Ensure users can only modify their own preferences
*/

-- Create user_cocktail_preferences table
CREATE TABLE IF NOT EXISTS user_cocktail_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  cocktail_id uuid REFERENCES cocktails(id) ON DELETE CASCADE,
  is_jesse_original boolean DEFAULT false,
  is_hall_of_fame boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, cocktail_id)
);

-- Enable RLS
ALTER TABLE user_cocktail_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_cocktail_preferences' 
    AND policyname = 'Users can manage their own preferences'
  ) THEN
    CREATE POLICY "Users can manage their own preferences"
      ON user_cocktail_preferences
      FOR ALL
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Remove old columns from cocktails table
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'cocktails' 
    AND column_name = 'is_jesse_original'
  ) THEN
    ALTER TABLE cocktails DROP COLUMN is_jesse_original;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'cocktails' 
    AND column_name = 'is_hall_of_fame'
  ) THEN
    ALTER TABLE cocktails DROP COLUMN is_hall_of_fame;
  END IF;
END $$;