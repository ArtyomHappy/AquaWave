import { supabase } from '../lib/supabase';
import { Booking } from '../types';

export async function getUserBookings(userId: string) {
  const { data, error } = await supabase
    .from('bookings')
    .select('*, pool:pools(*)')
    .eq('user_id', userId)
    .order('date', { ascending: true });
  if (error) throw error;
  return data as Booking[];
}

export async function createBooking(booking: {
  user_id: string;
  pool_id: string;
  date: string;
  time_slot: string;
}) {
  const { data, error } = await supabase.from('bookings').insert(booking).select().single();
  if (error) throw error;
  return data as Booking;
}

export async function updateBookingStatus(id: string, status: Booking['status']) {
  const { data, error } = await supabase.from('bookings').update({ status }).eq('id', id).select().single();
  if (error) throw error;
  return data as Booking;
}

export async function getBookedSlots(poolId: string, date: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('bookings')
    .select('time_slot')
    .eq('pool_id', poolId)
    .eq('date', date)
    .neq('status', 'cancelled');
  if (error) throw error;
  return (data || []).map((b) => b.time_slot);
}
