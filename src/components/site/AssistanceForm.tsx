import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ASSISTANCE_CATEGORIES, assistanceRequestSchema } from "@/lib/assistance";

const selectCls = "h-9 w-full rounded-md border border-input bg-background px-3 text-sm";

export function AssistanceForm() {
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);
  const [type, setType] = useState("individual");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const s = (k: string) => String(fd.get(k) ?? "").trim() || undefined;
    const parsed = assistanceRequestSchema.safeParse({
      requester_type: s("requester_type"), full_name: s("full_name") ?? "", community_name: s("community_name"),
      email: s("email"), phone: s("phone"), district: s("district"), country: s("country") ?? "",
      preferred_contact: s("preferred_contact"), category: s("category"), description: s("description") ?? "",
      consent: fd.get("consent") === "on" ? true : undefined,
    });
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach((i) => (errs[String(i.path[0])] ??= i.message));
      setErrors(errs);
      return;
    }
    setErrors({});
    setBusy(true);
    const d = parsed.data;
    const { error } = await supabase.from("assistance_requests").insert({
      requester_type: d.requester_type, full_name: d.full_name,
      community_name: d.requester_type === "community_representative" ? d.community_name ?? null : null,
      email: d.email || null, phone: d.phone || null, district: d.district || null, country: d.country,
      preferred_contact: d.preferred_contact, category: d.category, description: d.description, consent: true,
    });
    setBusy(false);
    if (error) { toast.error("Sorry, your request could not be sent. Please try again."); return; }
    form.reset();
    setSent(true);
  }

  if (sent)
    return (
      <div role="status" className="rounded-2xl border bg-soft p-8 text-center">
        <h3 className="text-xl font-bold text-navy">Your request has been received</h3>
        <p className="mt-2 text-muted-foreground">Our team will review it and contact you using your preferred method. Please remember that submitting a request does not guarantee assistance.</p>
        <Button variant="outline" className="mt-5" onClick={() => setSent(false)}>Submit another request</Button>
      </div>
    );

  const field = (name: string, label: string, el: React.ReactNode, hint?: string) => (
    <div className="space-y-1.5">
      <Label htmlFor={`ar-${name}`}>{label}</Label>
      {el}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      {errors[name] && <p className="text-sm text-destructive" role="alert">{errors[name]}</p>}
    </div>
  );

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        {field("requester_type", "I am requesting as", <select id="ar-requester_type" name="requester_type" className={selectCls} value={type} onChange={(e) => setType(e.target.value)}><option value="individual">An individual</option><option value="community_representative">A community representative</option></select>)}
        {field("category", "Type of assistance", <select id="ar-category" name="category" className={selectCls} defaultValue=""><option value="" disabled>Choose a category…</option>{Object.entries(ASSISTANCE_CATEGORIES).map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>)}
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        {field("full_name", "Your full name", <Input id="ar-full_name" name="full_name" autoComplete="name" maxLength={120} />)}
        {type === "community_representative" && field("community_name", "Community or group you represent", <Input id="ar-community_name" name="community_name" maxLength={160} />)}
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        {field("phone", "Phone number", <Input id="ar-phone" name="phone" type="tel" autoComplete="tel" maxLength={40} />)}
        {field("email", "Email", <Input id="ar-email" name="email" type="email" autoComplete="email" maxLength={255} />)}
      </div>
      <div className="grid gap-5 sm:grid-cols-3">
        {field("preferred_contact", "Preferred contact", <select id="ar-preferred_contact" name="preferred_contact" className={selectCls} defaultValue="phone"><option value="phone">Phone</option><option value="email">Email</option></select>)}
        {field("district", "District (optional)", <Input id="ar-district" name="district" maxLength={120} />)}
        {field("country", "Country", <Input id="ar-country" name="country" maxLength={120} defaultValue="Uganda" />)}
      </div>
      {field("description", "Briefly describe the support needed", <Textarea id="ar-description" name="description" rows={5} maxLength={2000} />, "Describe the situation in general terms. Please do not include medical diagnoses, health records or other sensitive personal details — we will ask for anything further privately if needed.")}
      <div className="space-y-1.5">
        <div className="flex items-start gap-3">
          <Checkbox id="ar-consent" name="consent" />
          <Label htmlFor="ar-consent" className="text-sm font-normal leading-snug text-muted-foreground">
            I consent to Servio Hope Foundation storing and processing this information to evaluate my request and contact me about it. I understand that submitting a request does not guarantee assistance.
          </Label>
        </div>
        {errors["consent"] && <p className="text-sm text-destructive" role="alert">{errors["consent"]}</p>}
      </div>
      <Button type="submit" variant="emerald" size="lg" disabled={busy} className="justify-self-start">{busy ? "Submitting…" : "Submit request"}</Button>
    </form>
  );
}
