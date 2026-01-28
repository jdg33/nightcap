/*
  # Add ingredients insert policy

  1. Security
    - Add policy to allow authenticated users to insert new ingredients
*/

CREATE POLICY "Authenticated users can insert ingredients"
  ON ingredients
  FOR INSERT
  TO authenticated
  WITH CHECK (true);