/*
  # Add author field to cocktails

  1. Changes
    - Add `author` column to cocktails table
    - Make it optional (nullable)
*/

ALTER TABLE cocktails
ADD COLUMN IF NOT EXISTS author text;