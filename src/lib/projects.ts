import { queryOptions } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database, Json } from '@/integrations/supabase/types';
import { collectionItems } from './programmes';

export const projectStatuses = ['planned', 'upcoming', 'active', 'on_hold', 'completed', 'cancelled'] as const;
export type ProjectFinance = Database['public']['Tables']['project_finances']['Row'];
export function publicFigures(f: ProjectFinance) {
  return { budget: f.budget_approved ? f.budget : null, funding_target: f.funding_target, funding_received: f.funding_verified ? f.funding_received : null, beneficiaries_reached: f.beneficiaries_verified ? f.beneficiaries_reached : null };
}
export function safeProjectLinks(value: Json | undefined) {
  return collectionItems(value).filter(item => {
    try { const url = new URL(item['url'] ?? ''); return url.protocol === 'https:' && !!item['label']?.trim(); } catch { return false; }
  });
}
export function validateProjectDates(start?: string | null, end?: string | null) {
  if (start && end && end < start) throw new Error('End date must be on or after the start date.');
}
export function validateFinance(f: Partial<ProjectFinance>) {
  for (const key of ['budget', 'funding_target', 'funding_received', 'beneficiaries_reached'] as const) {
    const value = f[key];
    if (value != null && (!Number.isFinite(Number(value)) || Number(value) < 0)) throw new Error('Amounts and beneficiaries cannot be negative.');
  }
  if (f.beneficiaries_reached != null && !Number.isInteger(Number(f.beneficiaries_reached))) throw new Error('Beneficiaries must be a whole number.');
  if (!/^[A-Z]{3}$/.test(f.currency ?? 'UGX')) throw new Error('Use a three-letter currency code, such as UGX.');
}
export const projectDetailQuery = (slug: string) => queryOptions({
  queryKey: ['projects', 'detail', slug],
  queryFn: async () => {
    const { data: project, error } = await supabase.from('projects').select('*').eq('slug', slug).eq('published', true).eq('archived', false).maybeSingle();
    if (error) throw error;
    if (!project) return null;
    const [finance, programme] = await Promise.all([
      supabase.from('public_project_finances').select('*').eq('project_id', project.id).maybeSingle(),
      project.program_id ? supabase.from('programs').select('id,title,slug').eq('id', project.program_id).eq('published', true).maybeSingle() : Promise.resolve({ data: null, error: null }),
    ]);
    if (finance.error) throw finance.error;
    if (programme.error) throw programme.error;
    return { project, finance: finance.data, programme: programme.data };
  },
});
