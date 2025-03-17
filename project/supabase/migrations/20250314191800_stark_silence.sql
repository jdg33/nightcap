/*
  # Fix created_by foreign key relationship

  1. Changes
    - Drop and recreate created_by column with correct foreign key reference
    - Add comment to explain the relationship
*/

-- First drop the existing column if it exists
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cocktails' AND column_name = 'created_by'
  ) THEN
    ALTER TABLE cocktails DROP COLUMN created_by;
  END IF;
END $$;

-- Add created_by column with correct foreign key reference
ALTER TABLE cocktails
ADD COLUMN created_by uuid REFERENCES auth.users(id);

COMMENT ON COLUMN cocktails.created_by IS 'The user who created this cocktail';