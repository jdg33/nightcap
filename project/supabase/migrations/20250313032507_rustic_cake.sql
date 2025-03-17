/*
  # Add Hall of Fame field to cocktails

  1. Changes
    - Add `is_hall_of_fame` boolean column to cocktails table
    - Set default value to false
*/

ALTER TABLE cocktails
ADD COLUMN IF NOT EXISTS is_hall_of_fame boolean DEFAULT false;