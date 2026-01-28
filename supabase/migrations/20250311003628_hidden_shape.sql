/*
  # Remove Row Level Security

  1. Changes
    - Disable RLS on all tables to allow public access
    - Drop existing policies that were restricting access
*/

ALTER TABLE ingredients DISABLE ROW LEVEL SECURITY;
ALTER TABLE cocktails DISABLE ROW LEVEL SECURITY;
ALTER TABLE cocktail_ingredients DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_ingredients DISABLE ROW LEVEL SECURITY;
ALTER TABLE reviews DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can insert ingredients" ON ingredients;
DROP POLICY IF EXISTS "Ingredients are viewable by everyone" ON ingredients;
DROP POLICY IF EXISTS "Cocktails are viewable by everyone" ON cocktails;
DROP POLICY IF EXISTS "Cocktail ingredients are viewable by everyone" ON cocktail_ingredients;
DROP POLICY IF EXISTS "Users can manage their ingredients" ON user_ingredients;
DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON reviews;
DROP POLICY IF EXISTS "Users can manage their reviews" ON reviews;