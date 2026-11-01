import { useRef, useState } from 'react';
import { FileText, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

export function DocumentUpload({ value, onChange, label }: { value?: string | null; onChange: (url: string) => void; label: string }) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  async function upload(file?: File) {
    if (!file) return;
    setBusy(true);
    try {
      if (file.type !== 'application/pdf' || file.size > 10 * 1024 * 1024) throw new Error('Choose a PDF of 10MB or smaller.');
      const header = await file.slice(0, 5).text();
      if (header !== '%PDF-') throw new Error('This file is not a valid PDF.');
      const path = `documents/${crypto.randomUUID()}.pdf`;
      const { error } = await supabase.storage.from('media').upload(path, file, { contentType: 'application/pdf' });
      if (error) throw error;
      const signed = await supabase.storage.from('media').createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
      if (signed.error) throw signed.error;
      onChange(signed.data.signedUrl);
      toast.success('Document uploaded');
    } catch (error) { toast.error(error instanceof Error ? error.message : 'Upload failed'); }
    finally { setBusy(false); if (ref.current) ref.current.value = ''; }
  }
  return <div className="flex flex-wrap items-center gap-2"><input ref={ref} type="file" accept="application/pdf" aria-label={`Upload ${label}`} className="hidden" onChange={e => upload(e.target.files?.[0])} /><Button type="button" variant="outline" size="sm" disabled={busy} onClick={() => ref.current?.click()}>{busy ? <Loader2 className="animate-spin" /> : <FileText />}{value ? 'Replace PDF' : 'Upload PDF'}</Button>{value && <><span className="text-sm text-muted-foreground">PDF attached</span><Button type="button" variant="ghost" size="icon" aria-label={`Remove ${label}`} onClick={() => onChange('')}><X /></Button></>}</div>;
}
