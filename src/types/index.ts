export type UserRole = 'CLIENT' | 'TRAINER' | 'ADMIN';

export interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: UserRole;
  avatar_url: string;
  created_at: string;
}

export interface Pool {
  id: string;
  name: string;
  description: string;
  price: number;
  lanes: number;
  water_temp: number;
  length: number;
  address: string;
  lat: number;
  lng: number;
  image_url: string;
  created_at: string;
}

export interface Booking {
  id: string;
  user_id: string;
  pool_id: string;
  date: string;
  time_slot: string;
  status: 'pending' | 'paid' | 'cancelled';
  created_at: string;
  pool?: Pool;
}

export interface Trainer {
  id: string;
  user_id: string;
  bio: string;
  experience: number;
  price_per_hour: number;
  specialization: string;
  avatar_url: string;
  created_at: string;
  profile?: Profile;
}

export interface TrainingRequest {
  id: string;
  client_id: string;
  trainer_id: string;
  date: string;
  time_slot: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  client?: Profile;
  trainer?: Trainer;
}

export interface SupportRequest {
  id: string;
  user_id: string;
  subject: string;
  message: string;
  admin_reply: string;
  image_url: string;
  status: 'open' | 'closed';
  created_at: string;
  user?: Profile;
}
