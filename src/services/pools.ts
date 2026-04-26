import { supabase } from '../lib/supabase';
import { Pool } from '../types';

export async function getPools(search?: string) {
  let query = supabase.from('pools').select('*').order('created_at', { ascending: true });
  if (search) {
    query = query.ilike('name', `%${search}%`);
  }
  const { data, error } = await query;
  if (error) throw error;
  return data as Pool[];
}

export async function getPool(id: string) {
  const { data, error } = await supabase.from('pools').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data as Pool | null;
}

export async function createPool(pool: Omit<Pool, 'id' | 'created_at'>) {
  const { data, error } = await supabase.from('pools').insert(pool).select().single();
  if (error) throw error;
  return data as Pool;
}

export async function updatePool(id: string, pool: Partial<Pool>) {
  const { data, error } = await supabase.from('pools').update(pool).eq('id', id).select().single();
  if (error) throw error;
  return data as Pool;
}

export async function deletePool(id: string) {
  const { error } = await supabase.from('pools').delete().eq('id', id);
  if (error) throw error;
}
