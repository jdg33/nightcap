/*
  # Add cocktail logs table

  1. Changes
    - Drop existing reviews table
    - Create new cocktail_logs table for tracking when drinks are consumed
    - Add appropriate policies for user data protection

  2. Security
    - Enable RLS on new table
    - Add policies for authenticated users to manage their logs
*/

-- Drop the existing reviews table
DROP TABLE IF EXISTS reviews;

-- Create the cocktail_logs table
CREATE TABLE cocktail_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cocktail_id uuid REFERENCES cocktails(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  notes text,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE cocktail_logs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read their own logs"
  ON cocktail_logs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own logs"
  ON cocktail_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own logs"
  ON cocktail_logs
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own logs"
  ON cocktail_logs
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);