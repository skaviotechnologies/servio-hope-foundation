import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ChevronDown, ChevronUp, Download, Mail, Plus, Search, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  VOLUNTEER_STATUSES,
  VOLUNTEER_STATUS_LABELS,
  downloadCsv,
  volunteerApplicationsCsv,
  volunteerHoursSchema,
  type VolunteerApplication,
  type VolunteerHours,
  type VolunteerStatus,
} from "@/lib/volunteers";

export const Route = createFileRoute("/_authenticated/admin/volunteers")({
  head: () => ({ meta: [{ title: "Manage volunteers — Servio Hope Foundation" }, { name: "description", content: "Review volunteer applications, assign activities and record hours." }, { property: "og:title", content: "Manage volunteers — Servio Hope Foundation" }, { property: "og:description", content: "Volunteer application management." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex" }] }),
  component: Volunteers,
});

const FILTERS = ["all", ...VOLUNTEER_STATUSES] as const;

function statusVariant(s: string): "default" | "secondary" | "destructive" | "outline" {
  if (s === "approved") return "default";
  if (s === "rejected") return "destructive";
  if (s === "pending") return "secondary";
  return "outline";
}

function Volunteers() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("all");
  const [search, setSearch] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const appsQuery = useQuery({
    queryKey: ["admin", "volunteers"],
    queryFn: async () => {
      const { data, error } = await supabase.from("volunteer_applications").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as VolunteerApplication[];
    },
  });
  const hoursQuery = useQuery({
    queryKey: ["admin", "volunteer-hours"],
    queryFn: async () => {
      const { data, error } = await supabase.from("volunteer_hours").select("*").order("date", { ascending: false });
      if (error) throw error;
      return data as VolunteerHours[];
    },
  });

  const inv = () => { qc.invalidateQueries({ queryKey: ["admin", "volunteers"] }); qc.invalidateQueries({ queryKey: ["admin", "volunteer-hours"] }); };

  const update = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<VolunteerApplication> }) => {
      const { error } = await supabase.from("volunteer_applications").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Saved"); inv(); },
    onError: (e: Error) => toast.error(e.message),
  });
  const del = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("volunteer_applications").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { toast.success("Application deleted"); inv(); },
    onError: (e: Error) => toast.error(e.message),
  });
  const addHours = useMutation({
    mutationFn: async (entry: { application_id: string; activity: string; hours: number; date: string; notes: string }) => {
      const { error } = await supabase.from("volunteer_hours").insert(entry);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Hours recorded"); inv(); },
    onError: (e: Error) => toast.error(e.message),
  });
  const delHours = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("volunteer_hours").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { toast.success("Entry removed"); inv(); },
    onError: (e: Error) => toast.error(e.message),
  });

  const hoursByApp = useMemo(() => {
    const map: Record<string, number> = {};
    (hoursQuery.data ?? []).forEach((h) => { map[h.application_id] = (map[h.application_id] ?? 0) + Number(h.hours); });
    return map;
  }, [hoursQuery.data]);

  const items = (appsQuery.data ?? []).filter((a) => {
    if (filter !== "all" && a.status !== filter) return false;
    if (!search.trim()) return true;
    const q = search.trim().toLowerCase();
    return [a.full_name, a.email, a.phone, a.district, a.country, a.interests, a.skills].some((v) => v?.toLowerCase().includes(q));
  });

  function exportCsv() {
    if (!items.length) { toast.error("Nothing to export"); return; }
    downloadCsv(`volunteers-${new Date().toISOString().slice(0, 10)}.csv`, volunteerApplicationsCsv(items, hoursByApp));
    toast.success("Report downloaded");
  }

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-navy">Volunteers</h1>
          <p className="text-muted-foreground">Review applications, assign activities and track participation.</p>
        </div>
        <Button variant="outline" onClick={exportCsv}><Download /> Export report (CSV)</Button>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <Button key={f} size="sm" variant={filter === f ? "default" : "outline"} onClick={() => setFilter(f)}>
            {f === "all" ? "All" : VOLUNTEER_STATUS_LABELS[f as VolunteerStatus]}
          </Button>
        ))}
        <div className="relative ml-auto w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, email, skills…" className="pl-9" aria-label="Search applications" />
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border bg-card">
        {appsQuery.isLoading ? <div className="space-y-3 p-6">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-14" />)}</div>
          : !items.length ? <p className="p-10 text-center text-muted-foreground">No applications match.</p>
          : (
            <ul className="divide-y">
              {items.map((a) => (
                <li key={a.id}>
                  <button className="flex w-full items-start gap-4 p-4 text-left" onClick={() => setOpenId(openId === a.id ? null : a.id)} aria-expanded={openId === a.id}>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-bold text-navy">{a.full_name} <span className="font-normal text-muted-foreground">· {a.email}</span></p>
                      <p className="truncate text-sm text-muted-foreground">{a.interests}</p>
                    </div>
                    {(hoursByApp[a.id] ?? 0) > 0 && <span className="hidden shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs sm:inline">{hoursByApp[a.id]} h</span>}
                    <Badge variant={statusVariant(a.status)} className="shrink-0">{VOLUNTEER_STATUS_LABELS[a.status as VolunteerStatus] ?? a.status}</Badge>
                    <time className="hidden shrink-0 text-xs text-muted-foreground sm:inline">{new Date(a.created_at).toLocaleDateString()}</time>
                    {openId === a.id ? <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />}
                  </button>
                  {openId === a.id && (
                    <ApplicationDetail
                      app={a}
                      hours={(hoursQuery.data ?? []).filter((h) => h.application_id === a.id)}
                      onPatch={(patch) => update.mutate({ id: a.id, patch })}
                      onDelete={() => confirm("Delete this application and its hour records?") && del.mutate(a.id)}
                      onAddHours={(entry) => addHours.mutate({ ...entry, application_id: a.id })}
                      onDeleteHours={(id) => delHours.mutate(id)}
                      saving={update.isPending}
                    />
                  )}
                </li>
              ))}
            </ul>
          )}
      </div>
    </div>
  );
}

function ApplicationDetail({ app, hours, onPatch, onDelete, onAddHours, onDeleteHours, saving }: {
  app: VolunteerApplication;
  hours: VolunteerHours[];
  onPatch: (patch: Partial<VolunteerApplication>) => void;
  onDelete: () => void;
  onAddHours: (entry: { activity: string; hours: number; date: string; notes: string }) => void;
  onDeleteHours: (id: string) => void;
  saving: boolean;
}) {
  const [notes, setNotes] = useState(app.admin_notes);
  const [activities, setActivities] = useState(app.assigned_activities);
  const [hourErrors, setHourErrors] = useState<Record<string, string>>({});

  function submitHours(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const parsed = volunteerHoursSchema.safeParse({
      activity: String(fd.get("activity") ?? ""),
      hours: Number(fd.get("hours")),
      date: String(fd.get("date") ?? ""),
      notes: String(fd.get("notes") ?? "") || undefined,
    });
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach((i) => (errs[String(i.path[0])] = i.message));
      setHourErrors(errs);
      return;
    }
    setHourErrors({});
    onAddHours({ activity: parsed.data.activity, hours: parsed.data.hours, date: parsed.data.date, notes: parsed.data.notes ?? "" });
    form.reset();
  }

  const totalHours = hours.reduce((sum, h) => sum + Number(h.hours), 0);
  const mailSubject = encodeURIComponent(`Your volunteer application — Servio Hope Foundation`);
  const mailBody = encodeURIComponent(`Dear ${app.full_name},\n\nThank you for your volunteer application to Servio Hope Foundation.\n\n`);

  return (
    <div className="space-y-8 border-t bg-background px-6 py-6">
      <div className="grid gap-6 md:grid-cols-2">
        <dl className="space-y-2 text-sm">
          <div><dt className="font-semibold text-navy">Contact</dt><dd>{app.email}{app.phone ? ` · ${app.phone}` : ""}</dd></div>
          <div><dt className="font-semibold text-navy">Location</dt><dd>{[app.district, app.country].filter(Boolean).join(", ")}</dd></div>
          <div><dt className="font-semibold text-navy">Areas of interest</dt><dd>{app.interests}</dd></div>
          {app.skills && <div><dt className="font-semibold text-navy">Skills</dt><dd>{app.skills}</dd></div>}
          <div><dt className="font-semibold text-navy">Availability</dt><dd>{app.availability}</dd></div>
          {app.experience && <div><dt className="font-semibold text-navy">Experience</dt><dd className="whitespace-pre-wrap">{app.experience}</dd></div>}
          <div><dt className="font-semibold text-navy">Motivation</dt><dd className="whitespace-pre-wrap">{app.motivation}</dd></div>
          <div><dt className="font-semibold text-navy">Data processing consent</dt><dd>{app.consent ? "Given" : "Not given"}</dd></div>
        </dl>

        <div className="space-y-4">
          <div>
            <p className="mb-2 text-sm font-semibold text-navy">Application status</p>
            <div className="flex flex-wrap gap-2">
              {VOLUNTEER_STATUSES.map((s) => (
                <Button key={s} size="sm" variant={app.status === s ? "default" : "outline"} disabled={saving || app.status === s} onClick={() => onPatch({ status: s })}>
                  {VOLUNTEER_STATUS_LABELS[s]}
                </Button>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`acts-${app.id}`}>Assigned activities</Label>
            <Textarea id={`acts-${app.id}`} rows={2} value={activities} onChange={(e) => setActivities(e.target.value)} maxLength={1000} placeholder="e.g. Saturday reading club, health camp registration desk" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`notes-${app.id}`}>Staff notes (internal, incl. information requested from applicant)</Label>
            <Textarea id={`notes-${app.id}`} rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={2000} />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" disabled={saving} onClick={() => onPatch({ admin_notes: notes, assigned_activities: activities })}>Save notes & activities</Button>
            <Button size="sm" variant="outline" asChild>
              <a href={`mailto:${app.email}?subject=${mailSubject}&body=${mailBody}`}><Mail /> Contact applicant</a>
            </Button>
            <Button size="sm" variant="ghost" onClick={onDelete}><Trash2 className="text-destructive" /> Delete</Button>
          </div>
          <p className="text-xs text-muted-foreground">To request additional information, set the status to “Under review”, note what is needed, and use “Contact applicant” to email them.</p>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-navy">Participation & hours</h3>
          <span className="text-sm text-muted-foreground">Total: {totalHours} h</span>
        </div>
        {hours.length > 0 && (
          <ul className="mt-3 divide-y rounded-xl border">
            {hours.map((h) => (
              <li key={h.id} className="flex items-center gap-3 px-4 py-2 text-sm">
                <time className="shrink-0 text-muted-foreground">{h.date}</time>
                <span className="min-w-0 flex-1 truncate">{h.activity}{h.notes ? ` — ${h.notes}` : ""}</span>
                <span className="shrink-0 font-semibold text-navy">{Number(h.hours)} h</span>
                <button aria-label="Remove entry" onClick={() => onDeleteHours(h.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
              </li>
            ))}
          </ul>
        )}
        <form onSubmit={submitHours} className="mt-4 grid gap-3 rounded-xl border bg-soft p-4 sm:grid-cols-[1fr_110px_150px_auto]">
          <div>
            <Label htmlFor={`h-act-${app.id}`} className="sr-only">Activity</Label>
            <Input id={`h-act-${app.id}`} name="activity" placeholder="Activity" maxLength={200} />
            {hourErrors["activity"] && <p className="mt-1 text-xs text-destructive" role="alert">{hourErrors["activity"]}</p>}
          </div>
          <div>
            <Label htmlFor={`h-hrs-${app.id}`} className="sr-only">Hours</Label>
            <Input id={`h-hrs-${app.id}`} name="hours" type="number" step="0.5" min="0.5" placeholder="Hours" />
            {hourErrors["hours"] && <p className="mt-1 text-xs text-destructive" role="alert">{hourErrors["hours"]}</p>}
          </div>
          <div>
            <Label htmlFor={`h-date-${app.id}`} className="sr-only">Date</Label>
            <Input id={`h-date-${app.id}`} name="date" type="date" defaultValue={new Date().toISOString().slice(0, 10)} />
            {hourErrors["date"] && <p className="mt-1 text-xs text-destructive" role="alert">{hourErrors["date"]}</p>}
          </div>
          <Button type="submit" size="sm" className="self-start"><Plus /> Record hours</Button>
        </form>
      </div>
    </div>
  );
}
