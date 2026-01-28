/*
  # Add user-specific cocktail preferences and creator tracking

  1. Changes
    - Add `created_by` column to cocktails table (if not exists)
    - Create new `user_cocktail_preferences` table for user-specific flags
    - Remove global is_jesse_original and is_hall_of_fame columns
    - Add appropriate policies for the new table

  2. Security
    - Enable RLS on new table
    - Add policies for users to manage their preferences
    - Ensure users can only modify their own preferences
*/

-- Add created_by to cocktails table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cocktails' AND column_name = 'created_by'
  ) THEN
    ALTER TABLE cocktails
    ADD COLUMN created_by uuid REFERENCES auth.users(id);
  END IF;
END $$;

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

-- Create policies
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
    WHERE table_name = 'cocktails' AND column_name = 'is_jesse_original'
  ) THEN
    ALTER TABLE cocktails DROP COLUMN is_jesse_original;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cocktails' AND column_name = 'is_hall_of_fame'
  ) THEN
    ALTER TABLE cocktails DROP COLUMN is_hall_of_fame;
  END IF;
END $$;