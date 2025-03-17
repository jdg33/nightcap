/*
  # Remove image_url from cocktails table

  1. Changes
    - Remove `image_url` column from `cocktails` table
*/

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cocktails' AND column_name = 'image_url'
  ) THEN
    ALTER TABLE cocktails DROP COLUMN image_url;
  END IF;
END $$;