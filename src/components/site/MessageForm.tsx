import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const schema = z.object({
  name: z.string().trim().min(1, "Please enter your name").max(120),
  email: z.string().trim().email("Please enter a valid email").max(255),
  phone: z.string().trim().max(40).optional(),
  subject: z.string().trim().max(200).optional(),
  message: z.string().trim().min(1, "Please write a message").max(4000),
});

export function MessageForm({ kind, cta = "Send message", messageLabel = "Message" }: { kind: "contact" | "volunteer" | "partner"; cta?: string; messageLabel?: string }) {
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const raw = Object.fromEntries(new FormData(form)) as Record<string, string>;
    const parsed = schema.safeParse(raw);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach((i) => (errs[String(i.path[0])] = i.message));
      setErrors(errs);
      return;
    }
    setErrors({});
    setBusy(true);
    const d = parsed.data;
    const { error } = await supabase.from("messages").insert({
      kind, name: d.name, email: d.email, phone: d.phone || null, subject: d.subject || null, message: d.message,
    });
    setBusy(false);
    if (error) { toast.error("Sorry, your message could not be sent. Please try again."); return; }
    form.reset();
    setSent(true);
    toast.success("Thank you — we have received your message.");
  }

  if (sent)
    return (
      <div role="status" className="rounded-2xl border bg-soft p-8 text-center">
        <h3 className="text-xl font-bold text-navy">Thank you!</h3>
        <p className="mt-2 text-muted-foreground">Your message has been received. A member of our team will get back to you.</p>
        <Button variant="outline" className="mt-5" onClick={() => setSent(false)}>Send another</Button>
      </div>
    );

  const field = (name: string, label: string, el: React.ReactNode) => (
    <div className="space-y-1.5">
      <Label htmlFor={`${kind}-${name}`}>{label}</Label>
      {el}
      {errors[name] && <p className="text-sm text-destructive" role="alert">{errors[name]}</p>}
    </div>
  );

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        {field("name", "Full name", <Input id={`${kind}-name`} name="name" autoComplete="name" required maxLength={120} />)}
        {field("email", "Email", <Input id={`${kind}-email`} name="email" type="email" autoComplete="email" required maxLength={255} />)}
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        {field("phone", "Phone (optional)", <Input id={`${kind}-phone`} name="phone" type="tel" autoComplete="tel" maxLength={40} />)}
        {field("subject", "Subject (optional)", <Input id={`${kind}-subject`} name="subject" maxLength={200} />)}
      </div>
      {field("message", messageLabel, <Textarea id={`${kind}-message`} name="message" rows={6} required maxLength={4000} />)}
      <Button type="submit" variant="emerald" size="lg" disabled={busy} className="justify-self-start">
        {busy ? "Sending…" : cta}
      </Button>
    </form>
  );
}
