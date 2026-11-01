import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import type { ProjectFinance } from '@/lib/projects';

export function ProjectFinanceEditor({ id, value, onChange }: { id?: string; value?: Partial<ProjectFinance>; onChange: (value: Partial<ProjectFinance>) => void }) {
  const q = useQuery({ queryKey: ['admin', 'project-finance', id], enabled: !!id, queryFn: async () => {
    const { data, error } = await supabase.from('project_finances').select('*').eq('project_id', id ?? '').maybeSingle();
    if (error) throw error;
    return data;
  } });
  useEffect(() => { if (q.isSuccess && value === undefined) onChange(q.data ?? { currency: 'UGX' }); }, [q.isSuccess, q.data, value, onChange]);
  if (id && q.isPending) return <p>Loading financial records…</p>;
  if (q.isError) return <p role="alert" className="text-destructive">Financial records could not be loaded. Close and reopen this project.</p>;
  const f = value ?? { currency: 'UGX' };
  const update = (key: keyof ProjectFinance, next: unknown) => onChange({ ...f, [key]: next });
  return <fieldset className="space-y-4 border-t pt-5"><legend className="font-bold text-navy">Funding and verified impact</legend>
    <div><Label htmlFor="finance-currency">Currency</Label><Input id="finance-currency" maxLength={3} value={f.currency ?? 'UGX'} onChange={e => update('currency', e.target.value.toUpperCase())} /></div>
    {(['budget', 'funding_target', 'funding_received', 'beneficiaries_reached'] as const).map(key => <div key={key}><Label htmlFor={`finance-${key}`}>{{ budget: 'Budget', funding_target: 'Funding target', funding_received: 'Funding received', beneficiaries_reached: 'Beneficiaries reached' }[key]}</Label><Input id={`finance-${key}`} type="number" min="0" step={key === 'beneficiaries_reached' ? '1' : '0.01'} value={f[key] ?? ''} onChange={e => onChange({ ...f, [key]: e.target.value === '' ? null : Number(e.target.value), ...(key === 'budget' ? { budget_approved: false } : key === 'funding_received' ? { funding_verified: false } : key === 'beneficiaries_reached' ? { beneficiaries_verified: false } : {}) })} /></div>)}
    {(['budget_approved', 'funding_verified', 'beneficiaries_verified'] as const).map(key => <div className="flex items-center gap-3" key={key}><Switch id={`finance-${key}`} checked={!!f[key]} onCheckedChange={next => update(key, next)} /><Label htmlFor={`finance-${key}`}>{{ budget_approved: 'Budget approved for public disclosure', funding_verified: 'Funding received verified', beneficiaries_verified: 'Beneficiaries reached verified' }[key]}</Label></div>)}
  </fieldset>;
}
