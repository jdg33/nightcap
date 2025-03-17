/*
  # Update reviews table constraints

  1. Changes
    - Add unique constraint on cocktail_id to ensure only one review per cocktail
    - Remove user_id column as it's no longer needed
  
  2. Data Preservation
    - Keep only the most recent review for each cocktail
*/

-- First, create a temporary table to store the most recent reviews
CREATE TEMP TABLE latest_reviews AS
SELECT DISTINCT ON (cocktail_id)
  id,
  cocktail_id,
  rating,
  comment,
  created_at
FROM reviews
ORDER BY cocktail_id, created_at DESC;

-- Drop the existing reviews table
DROP TABLE IF EXISTS reviews;

-- Recreate the reviews table with new structure
CREATE TABLE reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cocktail_id uuid UNIQUE REFERENCES cocktails(id) ON DELETE CASCADE,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz DEFAULT now()
);

-- Copy data from temporary table
INSERT INTO reviews (id, cocktail_id, rating, comment, created_at)
SELECT id, cocktail_id, rating, comment, created_at
FROM latest_reviews;