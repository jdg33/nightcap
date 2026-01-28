/*
  # Add brands support
  
  1. New Tables
    - `ingredient_brands`
      - `id` (uuid, primary key)
      - `ingredient_id` (uuid, references ingredients)
      - `name` (text, brand name)
      - `description` (text, optional)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `ingredient_brands` table
    - Add policies for authenticated users to manage brands
*/

-- Create ingredient_brands table
CREATE TABLE IF NOT EXISTS ingredient_brands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ingredient_id uuid REFERENCES ingredients(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(ingredient_id, name)
);

-- Enable RLS
ALTER TABLE ingredient_brands ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can read ingredient brands"
  ON ingredient_brands
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create brands"
  ON ingredient_brands
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update brands"
  ON ingredient_brands
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete brands"
  ON ingredient_brands
  FOR DELETE
  TO authenticated
  USING (true);