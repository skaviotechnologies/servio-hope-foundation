import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { settingsQuery, type Settings } from "@/lib/site";
import { useRoles } from "@/lib/roles";

export const Route = createFileRoute("/_authenticated/admin/settings")({
  component: SettingsPage,
});

type K = keyof Settings;
const SECTIONS: { title: string; fields: { k: K; label: string; type?: "textarea" | "image"; hint?: string }[] }[] = [
  { title: "Organisation", fields: [
    { k: "org_name", label: "Official name" }, { k: "abbreviation", label: "Abbreviation" }, { k: "motto", label: "Motto" },
    { k: "country", label: "Country" },
    { k: "legal_status", label: "Legal registration status", hint: "Shown publicly. Only state registration once it is confirmed." },
    { k: "registration_number", label: "Registration number (optional)" }, { k: "domain", label: "Website domain" },
  ]},
  { title: "Contact & social", fields: [
    { k: "email", label: "Email" }, { k: "phone", label: "Phone" }, { k: "address", label: "Address", type: "textarea" },
    { k: "facebook_url", label: "Facebook URL" }, { k: "x_url", label: "X (Twitter) URL" }, { k: "instagram_url", label: "Instagram URL" },
    { k: "linkedin_url", label: "LinkedIn URL" }, { k: "youtube_url", label: "YouTube URL" },
  ]},
  { title: "Homepage", fields: [
    { k: "hero_title", label: "Headline" }, { k: "hero_subtitle", label: "Sub-headline", type: "textarea" },
    { k: "hero_image_url", label: "Main photo", type: "image" },
  ]},
  { title: "Homepage mission & introduction", fields: [
    { k: "about_intro", label: "About introduction", type: "textarea" }, { k: "mission", label: "Mission", type: "textarea" },
    { k: "vision", label: "Vision", type: "textarea" }, { k: "values", label: "Values", type: "textarea" },
  ]},
  { title: "Donate & volunteer", fields: [
    { k: "donate_intro", label: "Donate page introduction", type: "textarea" },
    { k: "donate_instructions", label: "How to give (payment details)", type: "textarea", hint: "Only publish verified account details." },
    { k: "volunteer_intro", label: "Get involved introduction", type: "textarea" },
  ]},
  { title: "Branding", fields: [
    { k: "logo_url", label: "Main logo", type: "image", hint: "Leave empty to use the official logo." },
    { k: "header_logo_url", label: "Header logo", type: "image" }, { k: "footer_logo_url", label: "Footer logo", type: "image" },
    { k: "favicon_url", label: "Favicon (square)", type: "image" }, { k: "og_image_url", label: "Social sharing image", type: "image" },
  ]},
];

function SettingsPage() {
  const qc = useQueryClient();
  const roles = useRoles();
  const isAdmin = roles.data?.roles.includes("admin");
  const q = useQuery(settingsQuery);
  const [form, setForm] = useState<Partial<Settings>>({});
  useEffect(() => { if (q.data) setForm(q.data); }, [q.data]);

  const save = useMutation({
    mutationFn: async () => {
      const { id, updated_at, ...rest } = form as Settings;
      const { error } = await supabase.from("site_settings").update(rest).eq("id", 1);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Settings saved"); qc.invalidateQueries({ queryKey: ["settings"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  if (q.isLoading) return <div className="space-y-4"><Skeleton className="h-10 w-60" /><Skeleton className="h-96" /></div>;

  return (
    <form onSubmit={(e) => { e.preventDefault(); save.mutate(); }}>
      <div className="sticky top-14 z-10 -mx-5 flex flex-wrap items-center justify-between gap-4 bg-soft/95 px-5 py-4 backdrop-blur lg:top-0 md:-mx-10 md:px-10">
        <div><h1 className="text-3xl font-extrabold text-navy">Site settings</h1><p className="text-sm text-muted-foreground">Organisation details, page content and branding.</p></div>
        <Button type="submit" disabled={!isAdmin || save.isPending}>{save.isPending ? "Saving…" : "Save changes"}</Button>
      </div>
      {!isAdmin && <p className="mt-4 rounded-lg bg-gold/20 p-3 text-sm">Only administrators can change site settings.</p>}
      <div className="mt-5 flex flex-wrap gap-3"><Button asChild variant="outline"><Link to="/admin/about">About sections</Link></Button><Button asChild variant="outline"><Link to="/admin/team">Leadership profiles</Link></Button></div>
      <fieldset disabled={!isAdmin} className="mt-6 space-y-6">
        {SECTIONS.map((sec) => (
          <section key={sec.title} className="rounded-2xl border bg-card p-6">
            <h2 className="mb-5 text-lg font-bold text-navy">{sec.title}</h2>
            <div className="grid gap-5 md:grid-cols-2">
              {sec.fields.map((f) => (
                <div key={f.k} className={`space-y-1.5 ${f.type ? "md:col-span-2" : ""}`}>
                  <Label htmlFor={`s-${f.k}`}>{f.label}</Label>
                  {f.type === "image" ? (
                    <ImageUpload value={form[f.k] as string | null} onChange={(u) => setForm((s) => ({ ...s, [f.k]: u }))} label={f.label} />
                  ) : f.type === "textarea" ? (
                    <Textarea id={`s-${f.k}`} rows={4} value={(form[f.k] as string) ?? ""} onChange={(e) => setForm((s) => ({ ...s, [f.k]: e.target.value }))} />
                  ) : (
                    <Input id={`s-${f.k}`} value={(form[f.k] as string) ?? ""} onChange={(e) => setForm((s) => ({ ...s, [f.k]: e.target.value }))} />
                  )}
                  {f.hint && <p className="text-xs text-muted-foreground">{f.hint}</p>}
                </div>
              ))}
            </div>
          </section>
        ))}
      </fieldset>
    </form>
  );
}
