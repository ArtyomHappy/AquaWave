import { supabase } from '../lib/supabase';
import { UserRole } from '../types';

export async function signUp(
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  role: UserRole = 'CLIENT'
) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;

  if (data.user) {
    const { error: profileError } = await supabase.from('profiles').insert({
      id: data.user.id,
      first_name: firstName,
      last_name: lastName,
      email,
      role,
    });
    if (profileError) throw profileError;

    if (role === 'TRAINER') {
      await supabase.from('trainers').insert({
        user_id: data.user.id,
        bio: '',
        experience: 1,
        price_per_hour: 2500,
        specialization: '',
        avatar_url: '',
      });
    }
  }

  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}
