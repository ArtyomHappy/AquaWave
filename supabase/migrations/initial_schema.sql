/*
  Initial Schema for Pool Booking Application
*/

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name text NOT NULL DEFAULT '',
  last_name text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT 'CLIENT' CHECK (role IN ('CLIENT', 'TRAINER', 'ADMIN')),
  avatar_url text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'ADMIN'
    )
  );

-- Pools table
CREATE TABLE IF NOT EXISTS pools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  price integer NOT NULL DEFAULT 500,
  lanes integer NOT NULL DEFAULT 4,
  water_temp integer NOT NULL DEFAULT 27,
  length integer NOT NULL DEFAULT 25,
  address text NOT NULL DEFAULT '',
  lat double precision DEFAULT 56.8389,
  lng double precision DEFAULT 60.6057,
  image_url text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE pools ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view pools"
  ON pools FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert pools"
  ON pools FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

CREATE POLICY "Admins can update pools"
  ON pools FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

CREATE POLICY "Admins can delete pools"
  ON pools FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  pool_id uuid NOT NULL REFERENCES pools(id) ON DELETE CASCADE,
  date date NOT NULL,
  time_slot text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bookings"
  ON bookings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bookings"
  ON bookings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bookings"
  ON bookings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all bookings"
  ON bookings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Trainers table
CREATE TABLE IF NOT EXISTS trainers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  bio text NOT NULL DEFAULT '',
  experience integer NOT NULL DEFAULT 1,
  price_per_hour integer NOT NULL DEFAULT 2500,
  specialization text NOT NULL DEFAULT '',
  avatar_url text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE trainers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view trainers"
  ON trainers FOR SELECT
  USING (true);

CREATE POLICY "Trainers can insert own record"
  ON trainers FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Trainers can update own record"
  ON trainers FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Training requests table
CREATE TABLE IF NOT EXISTS training_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  trainer_id uuid NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
  date date NOT NULL,
  time_slot text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE training_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients can view own requests"
  ON training_requests FOR SELECT
  TO authenticated
  USING (auth.uid() = client_id);

CREATE POLICY "Clients can insert requests"
  ON training_requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Trainers can view requests for them"
  ON training_requests FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trainers WHERE trainers.id = training_requests.trainer_id AND trainers.user_id = auth.uid()
    )
  );

CREATE POLICY "Trainers can update request status"
  ON training_requests FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trainers WHERE trainers.id = training_requests.trainer_id AND trainers.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM trainers WHERE trainers.id = training_requests.trainer_id AND trainers.user_id = auth.uid()
    )
  );

-- Support requests table
CREATE TABLE IF NOT EXISTS support_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  subject text NOT NULL DEFAULT '',
  message text NOT NULL DEFAULT '',
  admin_reply text DEFAULT '',
  image_url text DEFAULT '',
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE support_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own support requests"
  ON support_requests FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert support requests"
  ON support_requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all support requests"
  ON support_requests FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

CREATE POLICY "Admins can update support requests"
  ON support_requests FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );
