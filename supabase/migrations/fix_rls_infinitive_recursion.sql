/*
  Fix infinite recursion in profiles RLS policies
*/

DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

DROP POLICY IF EXISTS "Admins can insert pools" ON pools;
DROP POLICY IF EXISTS "Admins can update pools" ON pools;
DROP POLICY IF EXISTS "Admins can delete pools" ON pools;
DROP POLICY IF EXISTS "Admins can view all bookings" ON bookings;
DROP POLICY IF EXISTS "Admins can view all support requests" ON support_requests;
DROP POLICY IF EXISTS "Admins can update support requests" ON support_requests;

CREATE OR REPLACE FUNCTION get_user_role(user_id uuid)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM profiles WHERE id = user_id;
$$;

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (get_user_role(auth.uid()) = 'ADMIN');

CREATE POLICY "Admins can insert pools"
  ON pools FOR INSERT
  TO authenticated
  WITH CHECK (get_user_role(auth.uid()) = 'ADMIN');

CREATE POLICY "Admins can update pools"
  ON pools FOR UPDATE
  TO authenticated
  USING (get_user_role(auth.uid()) = 'ADMIN')
  WITH CHECK (get_user_role(auth.uid()) = 'ADMIN');

CREATE POLICY "Admins can delete pools"
  ON pools FOR DELETE
  TO authenticated
  USING (get_user_role(auth.uid()) = 'ADMIN');

CREATE POLICY "Admins can view all bookings"
  ON bookings FOR SELECT
  TO authenticated
  USING (get_user_role(auth.uid()) = 'ADMIN');

CREATE POLICY "Admins can view all support requests"
  ON support_requests FOR SELECT
  TO authenticated
  USING (get_user_role(auth.uid()) = 'ADMIN');

CREATE POLICY "Admins can update support requests"
  ON support_requests FOR UPDATE
  TO authenticated
  USING (get_user_role(auth.uid()) = 'ADMIN')
  WITH CHECK (get_user_role(auth.uid()) = 'ADMIN');
