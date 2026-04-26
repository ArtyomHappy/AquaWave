import { supabase } from '../lib/supabase';
import { SupportRequest } from '../types';

export async function createSupportRequest(req: {
  user_id: string;
  subject: string;
  message: string;
}) {
  const { data, error } = await supabase.from('support_requests').insert(req).select().single();
  if (error) throw error;
  return data as SupportRequest;
}

export async function getUserSupportRequests(userId: string) {
  const { data, error } = await supabase
    .from('support_requests')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as SupportRequest[];
}

export async function getAllSupportRequests() {
  const { data, error } = await supabase
    .from('support_requests')
    .select('*, user:profiles(*)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as SupportRequest[];
}

export async function replyToSupportRequest(id: string, adminReply: string) {
  const { data, error } = await supabase
    .from('support_requests')
    .update({ admin_reply: adminReply, status: 'closed' })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as SupportRequest;
}
