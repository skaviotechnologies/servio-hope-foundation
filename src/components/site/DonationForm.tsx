import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { CheckCircle2, HandHeart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { programsQuery } from "@/lib/site";
import { campaignsQuery, currencies, designations, frequencies, validateDonation } from "@/lib/donations";
import { cn } from "@/lib/utils";

const QUICK_AMOUNTS = [20_000, 50_000, 100_000, 250_000];

export function DonationForm() {
  const programmes = useQuery(programsQuery);
  const campaigns = useQuery(campaignsQuery);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({
    amount: 50_000 as number | "",
    currency: "UGX",
    frequency: "one_time",
    designation: "general",
    program_id: "",
    campaign_id: "",
    donor_name: "",
    donor_email: "",
    donor_phone: "",
    is_anonymous: false,
  });
  const set = (key: string, value: unknown) => setForm((f) => ({ ...f, [key]: value }));

  const submit = useMutation({
    mutationFn: async () => {
      const payload = {
        amount: form.amount === "" ? null : Number(form.amount),
        currency: form.currency,
        frequency: form.frequency,
        designation: form.designation,
        program_id: form.designation === "programme" ? form.program_id || null : null,
        campaign_id: form.designation === "campaign" ? form.campaign_id || null : null,
        donor_name: form.donor_name.trim(),
        donor_email: form.donor_email.trim(),
        donor_phone: form.donor_phone.trim() || null,
        is_anonymous: form.is_anonymous,
        method: "pledge",
        status: "pledged",
      };
      if (!payload.donor_name) throw new Error("Please tell us your name.");
      validateDonation(payload);
      const { error } = await supabase.from("donations").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => setDone(true),
    onError: (e: Error) => toast.error(e.message),
  });

  if (done)
    return (
      <div className="rounded-3xl border bg-card p-8 text-center shadow-soft md:p-12" role="status">
        <CheckCircle2 className="mx-auto h-12 w-12 text-emerald" aria-hidden />
        <h2 className="mt-4 text-2xl font-bold text-navy">Thank you, {form.is_anonymous ? "friend" : form.donor_name.split(" ")[0]}!</h2>
        <p className="prose-body mx-auto mt-3 max-w-md">
          Your donation pledge has been recorded. Our team will contact you at <strong>{form.donor_email}</strong> to
          arrange your gift securely. Online payments are not yet active, so no money has been charged.
        </p>
        <Button variant="outline" className="mt-6" onClick={() => setDone(false)}>Make another pledge</Button>
      </div>
    );

  return (
    <form
      className="rounded-3xl border bg-card p-8 shadow-soft md:p-12"
      onSubmit={(e) => { e.preventDefault(); submit.mutate(); }}
    >
      <HandHeart className="h-10 w-10 text-gold" aria-hidden />
      <h2 className="mt-4 text-2xl font-bold text-navy">Pledge your donation</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Tell us what you'd like to give and we'll contact you to complete it securely. Online payments are not yet active.
      </p>

      <div className="mt-8 grid gap-6">
        <fieldset>
          <legend className="text-sm font-semibold text-navy">How often?</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {Object.entries(frequencies).map(([value, label]) => (
              <button key={value} type="button" onClick={() => set("frequency", value)}
                className={cn("rounded-full border px-4 py-2 text-sm font-semibold transition-colors", form.frequency === value ? "border-emerald bg-emerald text-secondary-foreground" : "hover:bg-soft")}
                aria-pressed={form.frequency === value}>{label}</button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="text-sm font-semibold text-navy">What should your gift support?</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {Object.entries(designations).map(([value, label]) => (
              <button key={value} type="button" onClick={() => set("designation", value)}
                className={cn("rounded-full border px-4 py-2 text-sm font-semibold transition-colors", form.designation === value ? "border-emerald bg-emerald text-secondary-foreground" : "hover:bg-soft")}
                aria-pressed={form.designation === value}>{label}</button>
            ))}
          </div>
          {form.designation === "programme" && (
            <div className="mt-3 space-y-1.5">
              <Label htmlFor="d-programme">Programme</Label>
              <select id="d-programme" required className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                value={form.program_id} onChange={(e) => set("program_id", e.target.value)}>
                <option value="">Choose a programme…</option>
                {(programmes.data ?? []).map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
              </select>
            </div>
          )}
          {form.designation === "campaign" && (
            <div className="mt-3 space-y-1.5">
              <Label htmlFor="d-campaign">Campaign</Label>
              <select id="d-campaign" required className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                value={form.campaign_id} onChange={(e) => set("campaign_id", e.target.value)}>
                <option value="">Choose a campaign…</option>
                {(campaigns.data ?? []).map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </div>
          )}
        </fieldset>

        <div>
          <Label htmlFor="d-amount" className="text-sm font-semibold text-navy">Amount</Label>
          <div className="mt-2 flex flex-wrap gap-2">
            {QUICK_AMOUNTS.map((amount) => (
              <button key={amount} type="button" onClick={() => set("amount", amount)}
                className={cn("rounded-full border px-4 py-2 text-sm font-semibold transition-colors", form.amount === amount ? "border-gold bg-gold text-ink" : "hover:bg-soft")}
                aria-pressed={form.amount === amount}>{amount.toLocaleString()}</button>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <Input id="d-amount" type="number" min={1} required className="h-10" placeholder="Custom amount"
              value={form.amount} onChange={(e) => set("amount", e.target.value === "" ? "" : Number(e.target.value))} />
            <select aria-label="Currency" className="h-10 rounded-md border bg-background px-3 text-sm"
              value={form.currency} onChange={(e) => set("currency", e.target.value)}>
              {currencies.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5"><Label htmlFor="d-name">Your name</Label><Input id="d-name" required maxLength={120} value={form.donor_name} onChange={(e) => set("donor_name", e.target.value)} /></div>
          <div className="space-y-1.5"><Label htmlFor="d-email">Email</Label><Input id="d-email" type="email" required maxLength={200} value={form.donor_email} onChange={(e) => set("donor_email", e.target.value)} /></div>
          <div className="space-y-1.5"><Label htmlFor="d-phone">Phone (optional)</Label><Input id="d-phone" type="tel" maxLength={40} value={form.donor_phone} onChange={(e) => set("donor_phone", e.target.value)} /></div>
          <label className="flex items-end gap-2 pb-2 text-sm">
            <input type="checkbox" checked={form.is_anonymous} onChange={(e) => set("is_anonymous", e.target.checked)} />
            Keep my donation anonymous
          </label>
        </div>

        <Button type="submit" variant="emerald" size="lg" disabled={submit.isPending}>
          {submit.isPending ? "Recording…" : "Record my pledge"}
        </Button>
      </div>
    </form>
  );
}
