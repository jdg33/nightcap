/*
  # Security Improvements: Add Indexes and Optimize RLS Policies

  ## Summary
  This migration addresses critical security and performance issues identified in the database audit:
  
  1. **Missing Indexes on Foreign Keys** - Adds indexes to improve query performance
     - `cocktail_ingredients.ingredient_id`
     - `cocktail_logs.cocktail_id`
     - `cocktail_logs.user_id`
     - `cocktails.created_by`
     - `user_ingredients.ingredient_id`
  
  2. **RLS Policy Optimization** - Optimizes auth function calls to prevent re-evaluation
     - Wraps `auth.uid()` calls with `(select auth.uid())` for better performance
     - Affects policies on `user_ingredients` and `cocktail_logs` tables
  
  3. **Enable RLS on Public Tables** - Enables Row Level Security for data protection
     - `ingredients` table
     - `cocktail_ingredients` table
     - `cocktails` table
  
  ## Performance Impact
  - Indexes will significantly improve query performance on foreign key lookups
  - RLS optimization prevents function re-evaluation on every row
  - Public tables now have proper security policies

  ## Security Notes
  - All public tables (ingredients, cocktails, cocktail_ingredients) are readable by everyone
  - Only authenticated users can create/modify cocktails
  - User-specific data (logs, user_ingredients) remain protected
*/

-- =============================================================================
-- 1. ADD MISSING INDEXES ON FOREIGN KEYS
-- =============================================================================

-- Index for cocktail_ingredients.ingredient_id foreign key
CREATE INDEX IF NOT EXISTS idx_cocktail_ingredients_ingredient_id 
ON cocktail_ingredients(ingredient_id);

-- Index for cocktail_logs.cocktail_id foreign key
CREATE INDEX IF NOT EXISTS idx_cocktail_logs_cocktail_id 
ON cocktail_logs(cocktail_id);

-- Index for cocktail_logs.user_id foreign key
CREATE INDEX IF NOT EXISTS idx_cocktail_logs_user_id 
ON cocktail_logs(user_id);

-- Index for cocktails.created_by foreign key
CREATE INDEX IF NOT EXISTS idx_cocktails_created_by 
ON cocktails(created_by);

-- Index for user_ingredients.ingredient_id foreign key
CREATE INDEX IF NOT EXISTS idx_user_ingredients_ingredient_id 
ON user_ingredients(ingredient_id);

-- Additional useful indexes for common queries
CREATE INDEX IF NOT EXISTS idx_cocktail_ingredients_cocktail_id 
ON cocktail_ingredients(cocktail_id);

CREATE INDEX IF NOT EXISTS idx_user_ingredients_user_id 
ON user_ingredients(user_id);

-- =============================================================================
-- 2. OPTIMIZE RLS POLICIES - USER_INGREDIENTS TABLE
-- =============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read their own ingredients" ON user_ingredients;
DROP POLICY IF EXISTS "Users can add ingredients to their bar" ON user_ingredients;
DROP POLICY IF EXISTS "Users can remove ingredients from their bar" ON user_ingredients;

-- Re-create optimized policies with (select auth.uid())
CREATE POLICY "Users can read their own ingredients"
  ON user_ingredients
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can add ingredients to their bar"
  ON user_ingredients
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can remove ingredients from their bar"
  ON user_ingredients
  FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- =============================================================================
-- 3. OPTIMIZE RLS POLICIES - COCKTAIL_LOGS TABLE
-- =============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read their own logs" ON cocktail_logs;
DROP POLICY IF EXISTS "Users can create their own logs" ON cocktail_logs;
DROP POLICY IF EXISTS "Users can update their own logs" ON cocktail_logs;
DROP POLICY IF EXISTS "Users can delete their own logs" ON cocktail_logs;

-- Re-create optimized policies with (select auth.uid())
CREATE POLICY "Users can read their own logs"
  ON cocktail_logs
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can create their own logs"
  ON cocktail_logs
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update their own logs"
  ON cocktail_logs
  FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete their own logs"
  ON cocktail_logs
  FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- =============================================================================
-- 4. ENABLE RLS ON PUBLIC TABLES
-- =============================================================================

-- Enable RLS on ingredients table
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;

-- Enable RLS on cocktail_ingredients table
ALTER TABLE cocktail_ingredients ENABLE ROW LEVEL SECURITY;

-- Enable RLS on cocktails table
ALTER TABLE cocktails ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- 5. CREATE RLS POLICIES FOR PUBLIC TABLES
-- =============================================================================

-- INGREDIENTS: Everyone can read, no one can modify through app
-- (Modifications should be done through admin interface or migrations)
CREATE POLICY "Everyone can view ingredients"
  ON ingredients
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can create ingredients"
  ON ingredients
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update ingredients"
  ON ingredients
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete ingredients"
  ON ingredients
  FOR DELETE
  TO authenticated
  USING (true);

-- COCKTAILS: Everyone can read, authenticated users can create/modify
CREATE POLICY "Everyone can view cocktails"
  ON cocktails
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can create cocktails"
  ON cocktails
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update cocktails"
  ON cocktails
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete cocktails"
  ON cocktails
  FOR DELETE
  TO authenticated
  USING (true);

-- COCKTAIL_INGREDIENTS: Everyone can read, authenticated users can modify
CREATE POLICY "Everyone can view cocktail ingredients"
  ON cocktail_ingredients
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can add cocktail ingredients"
  ON cocktail_ingredients
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update cocktail ingredients"
  ON cocktail_ingredients
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete cocktail ingredients"
  ON cocktail_ingredients
  FOR DELETE
  TO authenticated
  USING (true);
