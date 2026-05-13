CREATE POLICY "Anyone can view trainer profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trainers WHERE trainers.user_id = profiles.id
    )
  );