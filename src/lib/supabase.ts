import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://znqmzrppqzexdzzwswag.supabase.co';
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_lV_qTP7UmOlUWACEi_e_sA_OspZLlJi';
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export type LeafTable = 'contacts' | 'calls' | 'chat' | 'memory' | 'automations' | 'settings';
export async function saveLeafRecord(table: LeafTable, record: Record<string, unknown>) {
  const { data, error } = await supabase.from(table).insert(record).select().single();
  if (error) throw error;
  return data;
}
export async function loadLeafRecords(table: LeafTable) {
  const { data, error } = await supabase.from(table).select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}