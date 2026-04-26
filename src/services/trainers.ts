import { supabase } from '../lib/supabase';
import { Trainer, TrainingRequest } from '../types';

export async function getTrainers() {
  const { data, error } = await supabase
    .from('trainers')
    .select('*, profile:profiles(*)')
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data as Trainer[];
}

export async function getTrainer(id: string) {
  const { data, error } = await supabase
    .from('trainers')
    .select('*, profile:profiles(*)')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data as Trainer | null;
}

export async function getTrainerByUserId(userId: string) {
  const { data, error } = await supabase
    .from('trainers')
    .select('*, profile:profiles(*)')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return data as Trainer | null;
}

export async function updateTrainer(id: string, updates: Partial<Trainer>) {
  const { data, error } = await supabase.from('trainers').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data as Trainer;
}

export async function createTrainingRequest(req: {
  client_id: string;
  trainer_id: string;
  date: string;
  time_slot: string;
}) {
  const { data, error } = await supabase.from('training_requests').insert(req).select().single();
  if (error) throw error;
  return data as TrainingRequest;
}

export async function getTrainerRequests(trainerId: string) {
  const { data, error } = await supabase
    .from('training_requests')
    .select('*, client:profiles(*)')
    .eq('trainer_id', trainerId)
    .order('date', { ascending: true });
  if (error) throw error;
  return data as TrainingRequest[];
}

export async function updateRequestStatus(id: string, status: TrainingRequest['status']) {
  const { data, error } = await supabase
    .from('training_requests')
    .update({ status })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as TrainingRequest;
}

export async function getClientRequests(clientId: string) {
  const { data, error } = await supabase
    .from('training_requests')
    .select('*, trainer:trainers(*, profile:profiles(*))')
    .eq('client_id', clientId)
    .order('date', { ascending: true });
  if (error) throw error;
  return data as TrainingRequest[];
}

export async function getTrainerBookedSlots(trainerId: string, date: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('training_requests')
    .select('time_slot')
    .eq('trainer_id', trainerId)
    .eq('date', date)
    .neq('status', 'rejected');
  if (error) throw error;
  return (data || []).map((r) => r.time_slot);
}
