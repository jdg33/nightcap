/*
  # Add Jesse Original field to cocktails

  1. Changes
    - Add `is_jesse_original` boolean column to cocktails table
    - Set default value to false
    - Add column to existing cocktails
*/

ALTER TABLE cocktails
ADD COLUMN IF NOT EXISTS is_jesse_original boolean DEFAULT false;