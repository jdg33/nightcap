/*
  # Restore Jesse Original and Hall of Fame fields to cocktails table

  1. Changes
    - Add back is_jesse_original and is_hall_of_fame columns to cocktails table
    - Drop user_cocktail_preferences table as it's no longer needed
*/

-- Add back the fields to cocktails table
ALTER TABLE cocktails
ADD COLUMN is_jesse_original boolean DEFAULT false,
ADD COLUMN is_hall_of_fame boolean DEFAULT false;

-- Drop the preferences table if it exists
DROP TABLE IF EXISTS user_cocktail_preferences;