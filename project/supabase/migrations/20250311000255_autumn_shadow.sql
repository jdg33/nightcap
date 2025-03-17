/*
  # Cocktail Database Schema

  1. New Tables
    - `ingredients`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `category` (text) - e.g., spirit, mixer, garnish
      - `description` (text)
      - `created_at` (timestamp)
    
    - `cocktails`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `description` (text)
      - `instructions` (text)
      - `image_url` (text)
      - `created_at` (timestamp)
    
    - `cocktail_ingredients`
      - `id` (uuid, primary key)
      - `cocktail_id` (uuid, foreign key)
      - `ingredient_id` (uuid, foreign key)
      - `amount` (decimal)
      - `unit` (text) - e.g., oz, ml, pieces
    
    - `user_ingredients`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `ingredient_id` (uuid, foreign key)
      - `created_at` (timestamp)
    
    - `reviews`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `cocktail_id` (uuid, foreign key)
      - `rating` (integer)
      - `comment` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create ingredients table
CREATE TABLE ingredients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  category text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Create cocktails table
CREATE TABLE cocktails (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  instructions text NOT NULL,
  image_url text,
  created_at timestamptz DEFAULT now()
);

-- Create cocktail_ingredients junction table
CREATE TABLE cocktail_ingredients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cocktail_id uuid REFERENCES cocktails(id) ON DELETE CASCADE,
  ingredient_id uuid REFERENCES ingredients(id) ON DELETE CASCADE,
  amount decimal NOT NULL,
  unit text NOT NULL,
  UNIQUE(cocktail_id, ingredient_id)
);

-- Create user_ingredients table
CREATE TABLE user_ingredients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  ingredient_id uuid REFERENCES ingredients(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, ingredient_id)
);

-- Create reviews table
CREATE TABLE reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  cocktail_id uuid REFERENCES cocktails(id) ON DELETE CASCADE,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE cocktails ENABLE ROW LEVEL SECURITY;
ALTER TABLE cocktail_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Ingredients are viewable by everyone"
  ON ingredients FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Cocktails are viewable by everyone"
  ON cocktails FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Cocktail ingredients are viewable by everyone"
  ON cocktail_ingredients FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can manage their ingredients"
  ON user_ingredients FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Reviews are viewable by everyone"
  ON reviews FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can manage their reviews"
  ON reviews FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);