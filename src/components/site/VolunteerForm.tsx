import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { volunteerApplicationSchema } from "@/lib/volunteers";

export function VolunteerForm() {
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const raw = {
      full_name: String(fd.get("full_name") ?? ""),
      email: String(fd.get("email") ?? ""),
      phone: String(fd.get("phone") ?? "") || undefined,
      district: String(fd.get("district") ?? "") || undefined,
      country: String(fd.get("country") ?? ""),
      interests: String(fd.get("interests") ?? ""),
      skills: String(fd.get("skills") ?? "") || undefined,
      availability: String(fd.get("availability") ?? ""),
      experience: String(fd.get("experience") ?? "") || undefined,
      motivation: String(fd.get("motivation") ?? ""),
      consent: fd.get("consent") === "on" ? true : (undefined as unknown as true),
    };
    const parsed = volunteerApplicationSchema.safeParse(raw);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach((i) => (errs[String(i.path[0])] = i.message));
      setErrors(errs);
      return;
    }
    setErrors({});
    setBusy(true);
    const d = parsed.data;
    const { error } = await supabase.from("volunteer_applications").insert({
      full_name: d.full_name,
      email: d.email,
      phone: d.phone || null,
      district: d.district || null,
      country: d.country,
      interests: d.interests,
      skills: d.skills ?? "",
      availability: d.availability,
      experience: d.experience ?? "",
      motivation: d.motivation,
      consent: true,
    });
    setBusy(false);
    if (error) { toast.error("Sorry, your application could not be sent. Please try again."); return; }
    form.reset();
    setSent(true);
    toast.success("Thank you — we have received your application.");
  }

  if (sent)
    return (
      <div role="status" className="rounded-2xl border bg-soft p-8 text-center">
        <h3 className="text-xl font-bold text-navy">Thank you for applying!</h3>
        <p className="mt-2 text-muted-foreground">Your volunteer application has been received. Our team will review it and contact you by email.</p>
        <Button variant="outline" className="mt-5" onClick={() => setSent(false)}>Submit another application</Button>
      </div>
    );

  const field = (name: string, label: string, el: React.ReactNode) => (
    <div className="space-y-1.5">
      <Label htmlFor={`vol-${name}`}>{label}</Label>
      {el}
      {errors[name] && <p className="text-sm text-destructive" role="alert">{errors[name]}</p>}
    </div>
  );

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        {field("full_name", "Full name", <Input id="vol-full_name" name="full_name" autoComplete="name" required maxLength={120} />)}
        {field("email", "Email", <Input id="vol-email" name="email" type="email" autoComplete="email" required maxLength={255} />)}
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        {field("phone", "Phone number (optional)", <Input id="vol-phone" name="phone" type="tel" autoComplete="tel" maxLength={40} />)}
        {field("district", "District (optional)", <Input id="vol-district" name="district" maxLength={120} />)}
      </div>
      {field("country", "Country", <Input id="vol-country" name="country" autoComplete="country-name" required maxLength={120} defaultValue="Uganda" />)}
      {field("interests", "Areas of interest", <Input id="vol-interests" name="interests" required maxLength={1000} placeholder="e.g. Education, Healthcare, Youth Empowerment, Community Development" />)}
      {field("skills", "Skills (optional)", <Input id="vol-skills" name="skills" maxLength={1000} placeholder="e.g. teaching, nursing, photography, event organising" />)}
      {field("availability", "Availability", <Input id="vol-availability" name="availability" required maxLength={500} placeholder="e.g. Weekends, weekday evenings, full-time in July" />)}
      {field("experience", "Relevant experience (optional)", <Textarea id="vol-experience" name="experience" rows={3} maxLength={2000} />)}
      {field("motivation", "Why would you like to volunteer with us?", <Textarea id="vol-motivation" name="motivation" rows={4} required maxLength={2000} />)}
      <div className="space-y-1.5">
        <div className="flex items-start gap-3">
          <Checkbox id="vol-consent" name="consent" />
          <Label htmlFor="vol-consent" className="text-sm font-normal leading-snug text-muted-foreground">
            I consent to Servio Hope Foundation storing and processing the information I have provided so my volunteer application can be reviewed and I can be contacted about it.
          </Label>
        </div>
        {errors["consent"] && <p className="text-sm text-destructive" role="alert">{errors["consent"]}</p>}
      </div>
      <Button type="submit" variant="emerald" size="lg" disabled={busy} className="justify-self-start">
        {busy ? "Submitting…" : "Submit application"}
      </Button>
    </form>
  );
}
