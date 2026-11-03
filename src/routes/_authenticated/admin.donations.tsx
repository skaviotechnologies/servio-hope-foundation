import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { BadgeCheck, Download, Plus, Trash2, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { campaignsQuery, currencies, designations, donationStatuses, donationsToCsv, formatAmount, validateDonation, type Donation } from "@/lib/donations";
import { programsQuery } from "@/lib/site";

export const Route = createFileRoute("/_authenticated/admin/donations")({
  head: () => ({ meta: [{ title: "Donations — Servio Hope Foundation" }, { name: "description", content: "Track, verify and export donation records." }, { property: "og:title", content: "Donations — Servio Hope Foundation" }, { property: "og:description", content: "Donation administration." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex" }] }),
  component: DonationsAdmin,
});

const STATUS_FILTERS = ["all", "pledged", "recorded", "verified", "cancelled"] as const;

const EMPTY_OFFLINE = { donor_name: "", donor_email: "", donor_phone: "", amount: "" as number | "", currency: "UGX", frequency: "one_time", designation: "general", program_id: "", campaign_id: "", reference: "", notes: "", status: "verified" };

function DonationsAdmin() {
  const qc = useQueryClient();
  const [status, setStatus] = useState<(typeof STATUS_FILTERS)[number]>("all");
  const [designation, setDesignation] = useState("all");
  const [recording, setRecording] = useState<typeof EMPTY_OFFLINE | null>(null);
  const programmes = useQuery(programsQuery);
  const campaigns = useQuery(campaignsQuery);

  const q = useQuery({
    queryKey: ["admin", "donations"],
    queryFn: async () => {
      const { data, error } = await supabase.from("donations").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as Donation[];
    },
  });
  const inv = () => qc.invalidateQueries({ queryKey: ["admin", "donations"] });

  const setStatus = useMutation({
    mutationFn: async ({ id, next }: { id: string; next: string }) => {
      const { error } = await supabase.from("donations").update({ status: next }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Updated"); inv(); },
    onError: (e: Error) => toast.error(e.message),
  });
  const del = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("donations").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { toast.success("Deleted"); inv(); },
    onError: (e: Error) => toast.error(e.message),
  });
  const record = useMutation({
    mutationFn: async () => {
      if (!recording) return;
      const payload = {
        donor_name: recording.donor_name.trim(),
        donor_email: recording.donor_email.trim(),
        donor_phone: recording.donor_phone.trim() || null,
        amount: recording.amount === "" ? null : Number(recording.amount),
        currency: recording.currency,
        frequency: recording.frequency,
        designation: recording.designation,
        program_id: recording.designation === "programme" ? recording.program_id || null : null,
        campaign_id: recording.designation === "campaign" ? recording.campaign_id || null : null,
        method: "offline",
        status: recording.status,
        reference: recording.reference.trim() || null,
        notes: recording.notes.trim() || null,
        is_anonymous: false,
      };
      if (!payload.donor_name) throw new Error("Donor name is required.");
      validateDonation(payload);
      const { error } = await supabase.from("donations").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Offline donation recorded"); setRecording(null); inv(); },
    onError: (e: Error) => toast.error(e.message),
  });

  const all = q.data ?? [];
  const items = all.filter((d) => (status === "all" || d.status === status) && (designation === "all" || d.designation === designation));
  const verified = all.filter((d) => d.status === "verified");
  const verifiedTotal = verified.reduce((sum, d) => sum + Number(d.amount), 0);
  const pledgedCount = all.filter((d) => d.status === "pledged").length;

  function exportCsv() {
    const blob = new Blob([donationsToCsv(items)], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `shf-donations-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div><h1 className="text-3xl font-extrabold text-navy">Donations</h1><p className="text-muted-foreground">Pledges, offline gifts and verified contributions. Donor details are visible to staff only.</p></div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportCsv} disabled={!items.length}><Download /> Export CSV</Button>
          <Button onClick={() => setRecording(EMPTY_OFFLINE)}><Plus /> Record offline donation</Button>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border bg-card p-5"><p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Verified total</p><p className="mt-1 text-2xl font-extrabold text-navy">{formatAmount(verifiedTotal, "UGX")}</p><p className="text-xs text-muted-foreground">{verified.length} verified gift{verified.length === 1 ? "" : "s"} (all currencies summed)</p></div>
        <div className="rounded-2xl border bg-card p-5"><p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pending pledges</p><p className="mt-1 text-2xl font-extrabold text-navy">{pledgedCount}</p><p className="text-xs text-muted-foreground">Awaiting follow-up with the donor</p></div>
        <div className="rounded-2xl border bg-card p-5"><p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">All records</p><p className="mt-1 text-2xl font-extrabold text-navy">{all.length}</p><p className="text-xs text-muted-foreground">Pledges, offline and verified</p></div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        {STATUS_FILTERS.map((s) => <Button key={s} size="sm" variant={status === s ? "default" : "outline"} onClick={() => setStatus(s)} className="capitalize">{s}</Button>)}
        <select aria-label="Filter by designation" className="h-9 rounded-md border bg-background px-3 text-sm" value={designation} onChange={(e) => setDesignation(e.target.value)}>
          <option value="all">All designations</option>
          {Object.entries(designations).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border bg-card">
        {q.isLoading ? <div className="space-y-3 p-6">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-14" />)}</div>
          : !items.length ? <p className="p-10 text-center text-muted-foreground">No donations match these filters.</p>
          : (
            <ul className="divide-y">
              {items.map((d) => (
                <li key={d.id} className="flex flex-wrap items-center gap-4 p-4">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-navy">{d.is_anonymous ? "Anonymous donor" : d.donor_name} <span className="font-normal text-muted-foreground">· {d.donor_email}</span></p>
                    <p className="truncate text-xs text-muted-foreground">
                      {formatAmount(Number(d.amount), d.currency)} · {d.frequency === "monthly" ? "Monthly" : "One-time"} · {designations[d.designation as keyof typeof designations] ?? d.designation} · {d.method}{d.reference ? ` · ref ${d.reference}` : ""}
                    </p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${d.status === "verified" ? "bg-emerald text-secondary-foreground" : d.status === "cancelled" ? "bg-muted text-muted-foreground" : "bg-gold/20 text-ink"}`}>{donationStatuses[d.status as keyof typeof donationStatuses] ?? d.status}</span>
                  <time className="text-xs text-muted-foreground">{new Date(d.created_at).toLocaleDateString()}</time>
                  {d.status !== "verified" && d.status !== "cancelled" && (
                    <Button variant="ghost" size="icon" aria-label="Mark as verified" title="Mark as verified (payment confirmed)" disabled={setStatus.isPending} onClick={() => setStatus.mutate({ id: d.id, next: "verified" })}><BadgeCheck className="text-emerald" /></Button>
                  )}
                  {d.status !== "cancelled" && (
                    <Button variant="ghost" size="icon" aria-label="Cancel donation" title="Cancel" disabled={setStatus.isPending} onClick={() => setStatus.mutate({ id: d.id, next: "cancelled" })}><XCircle className="text-muted-foreground" /></Button>
                  )}
                  <Button variant="ghost" size="icon" aria-label="Delete donation" onClick={() => confirm("Delete this donation record?") && del.mutate(d.id)}><Trash2 className="text-destructive" /></Button>
                </li>
              ))}
            </ul>
          )}
      </div>

      <Dialog open={!!recording} onOpenChange={(o) => !o && setRecording(null)}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader><DialogTitle>Record offline donation</DialogTitle></DialogHeader>
          {recording && (
            <form id="offline-form" className="grid gap-4 sm:grid-cols-2" onSubmit={(e) => { e.preventDefault(); record.mutate(); }}>
              <div className="space-y-1.5"><Label htmlFor="o-name">Donor name</Label><Input id="o-name" required maxLength={120} value={recording.donor_name} onChange={(e) => setRecording({ ...recording, donor_name: e.target.value })} /></div>
              <div className="space-y-1.5"><Label htmlFor="o-email">Donor email</Label><Input id="o-email" type="email" required maxLength={200} value={recording.donor_email} onChange={(e) => setRecording({ ...recording, donor_email: e.target.value })} /></div>
              <div className="space-y-1.5"><Label htmlFor="o-phone">Phone</Label><Input id="o-phone" type="tel" maxLength={40} value={recording.donor_phone} onChange={(e) => setRecording({ ...recording, donor_phone: e.target.value })} /></div>
              <div className="space-y-1.5"><Label htmlFor="o-ref">Reference / receipt no.</Label><Input id="o-ref" maxLength={80} value={recording.reference} onChange={(e) => setRecording({ ...recording, reference: e.target.value })} /></div>
              <div className="space-y-1.5"><Label htmlFor="o-amount">Amount</Label><Input id="o-amount" type="number" min={1} required value={recording.amount} onChange={(e) => setRecording({ ...recording, amount: e.target.value === "" ? "" : Number(e.target.value) })} /></div>
              <div className="space-y-1.5"><Label htmlFor="o-currency">Currency</Label><select id="o-currency" className="h-9 w-full rounded-md border bg-background px-3 text-sm" value={recording.currency} onChange={(e) => setRecording({ ...recording, currency: e.target.value })}>{currencies.map((c) => <option key={c} value={c}>{c}</option>)}</select></div>
              <div className="space-y-1.5"><Label htmlFor="o-freq">Frequency</Label><select id="o-freq" className="h-9 w-full rounded-md border bg-background px-3 text-sm" value={recording.frequency} onChange={(e) => setRecording({ ...recording, frequency: e.target.value })}><option value="one_time">One-time</option><option value="monthly">Monthly</option></select></div>
              <div className="space-y-1.5"><Label htmlFor="o-status">Status</Label><select id="o-status" className="h-9 w-full rounded-md border bg-background px-3 text-sm" value={recording.status} onChange={(e) => setRecording({ ...recording, status: e.target.value })}><option value="recorded">Recorded (awaiting reconciliation)</option><option value="verified">Verified (reconciled)</option></select></div>
              <div className="space-y-1.5 sm:col-span-2"><Label htmlFor="o-designation">Designation</Label><select id="o-designation" className="h-9 w-full rounded-md border bg-background px-3 text-sm" value={recording.designation} onChange={(e) => setRecording({ ...recording, designation: e.target.value })}>{Object.entries(designations).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
              {recording.designation === "programme" && <div className="space-y-1.5 sm:col-span-2"><Label htmlFor="o-programme">Programme</Label><select id="o-programme" required className="h-9 w-full rounded-md border bg-background px-3 text-sm" value={recording.program_id} onChange={(e) => setRecording({ ...recording, program_id: e.target.value })}><option value="">Choose…</option>{(programmes.data ?? []).map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}</select></div>}
              {recording.designation === "campaign" && <div className="space-y-1.5 sm:col-span-2"><Label htmlFor="o-campaign">Campaign</Label><select id="o-campaign" required className="h-9 w-full rounded-md border bg-background px-3 text-sm" value={recording.campaign_id} onChange={(e) => setRecording({ ...recording, campaign_id: e.target.value })}><option value="">Choose…</option>{(campaigns.data ?? []).map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}</select></div>}
              <div className="space-y-1.5 sm:col-span-2"><Label htmlFor="o-notes">Notes (staff only)</Label><Input id="o-notes" maxLength={500} value={recording.notes} onChange={(e) => setRecording({ ...recording, notes: e.target.value })} /></div>
            </form>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setRecording(null)}>Cancel</Button>
            <Button type="submit" form="offline-form" disabled={record.isPending}>{record.isPending ? "Saving…" : "Save donation"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
