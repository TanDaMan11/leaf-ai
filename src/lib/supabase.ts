import { createClient } from '@supabase/supabase-js';
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://znqmzrppqzexdzzwswag.supabase.co';
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_lV_qTP7UmOlUWACEi_e6sA_OspZLlJi';
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
export type LeafTable='contacts'|'calls'|'call_logs'|'messages'|'chat_history'|'memory'|'automations'|'settings';
export async function loadLeafRecords(table:LeafTable, sessionId?:string){let q=supabase.from(table).select('*').order('created_at',{ascending:true}); if(sessionId) q=q.eq('session_id',sessionId); const {data,error}=await q;if(error)throw error;return data??[]}
export async function saveLeafRecord(table:LeafTable, record:Record<string,unknown>){const {data,error}=await supabase.from(table).insert(record).select().single();if(error)throw error;return data}
export async function updateLeafRecord(table:LeafTable,id:string|number,record:Record<string,unknown>){const {data,error}=await supabase.from(table).update(record).eq('id',id).select().single();if(error)throw error;return data}
export async function deleteLeafRecord(table:LeafTable,id:string|number){const {error}=await supabase.from(table).delete().eq('id',id);if(error)throw error}
