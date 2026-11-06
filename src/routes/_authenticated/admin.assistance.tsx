import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Archive, ArchiveRestore, ChevronDown, ChevronUp, Mail, Phone, Search, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useRoles } from "@/lib/roles";
import { ASSISTANCE_CATEGORIES, ASSISTANCE_STATUSES, ASSISTANCE_STATUS_LABELS, type AssistanceCategory, type AssistanceRequest, type AssistanceStatus } from "@/lib/assistance";

export const Route = createFileRoute("/_authenticated/admin/assistance")({
  head: () => ({ meta: [{ title: "Assistance requests — Servio Hope Foundation" }, { name: "description", content: "Review and manage private assistance requests." }, { property: "og:title", content: "Assistance requests — Servio Hope Foundation" }, { property: "og:description", content: "Case management." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex" }] }),
  component: AssistanceAdmin,
});

function AssistanceAdmin() {
  const qc = useQueryClient();
  const roles = useRoles();
  const isAdmin = roles.data?.roles.includes("admin");
  const [status, setStatus] = useState<"all" | AssistanceStatus>("all");
  const [category, setCategory] = useState<"all" | AssistanceCategory>("all");
  const [showArchived, setShowArchived] = useState(false);
  const [search, setSearch] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const q = useQuery({
    queryKey: ["admin", "assistance"],
    queryFn: async () => {
      const { data, error } = await supabase.from("assistance_requests").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as AssistanceRequest[];
    },
  });
  const inv = () => qc.invalidateQueries({ queryKey: ["admin", "assistance"] });
  const update = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<AssistanceRequest> }) => { const { error } = await supabase.from("assistance_requests").update(patch).eq("id", id); if (error) throw error; },
    onSuccess: () => { toast.success("Saved"); inv(); },
    onError: (e: Error) => toast.error(e.message),
  });
  const del = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("assistance_requests").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { toast.success("Request deleted"); inv(); },
    onError: (e: Error) => toast.error(e.message),
  });

  const items = (q.data ?? []).filter((r) => {
    if (r.archived !== showArchived) return false;
    if (status !== "all" && r.status !== status) return false;
    if (category !== "all" && r.category !== category) return false;
    const s = search.trim().toLowerCase();
    return !s || [r.full_name, r.community_name, r.email, r.phone, r.district, r.assigned_to].some((v) => v?.toLowerCase().includes(s));
  });

  const sel = "h-9 rounded-md border border-input bg-background px-3 text-sm";
  return (
    <div>
      <h1 className="text-3xl font-extrabold text-navy">Assistance requests</h1>
      <p className="text-muted-foreground">Private case management — visible only to foundation staff.</p>
      <div className="mt-6 flex flex-wrap items-center gap-2">
        <select aria-label="Filter by status" className={sel} value={status} onChange={(e) => setStatus(e.target.value as typeof status)}>
          <option value="all">All statuses</option>{ASSISTANCE_STATUSES.map((s) => <option key={s} value={s}>{ASSISTANCE_STATUS_LABELS[s]}</option>)}
        </select>
        <select aria-label="Filter by category" className={sel} value={category} onChange={(e) => setCategory(e.target.value as typeof category)}>
          <option value="all">All categories</option>{Object.entries(ASSISTANCE_CATEGORIES).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <Button size="sm" variant={showArchived ? "default" : "outline"} onClick={() => setShowArchived(!showArchived)}><Archive /> {showArchived ? "Showing archived" : "Show archived"}</Button>
        <div className="relative ml-auto w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, district, caseworker…" className="pl-9" aria-label="Search requests" />
        </div>
      </div>
      <div className="mt-6 overflow-hidden rounded-2xl border bg-card">
        {q.isLoading ? <div className="space-y-3 p-6">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-14" />)}</div>
          : q.isError ? <p className="p-6 text-destructive">Could not load requests.</p>
          : !items.length ? <p className="p-10 text-center text-muted-foreground">No requests match.</p>
          : (
            <ul className="divide-y">
              {items.map((r) => (
                <li key={r.id}>
                  <button className="flex w-full items-start gap-4 p-4 text-left" onClick={() => setOpenId(openId === r.id ? null : r.id)} aria-expanded={openId === r.id}>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-bold text-navy">{r.full_name}{r.community_name && <span className="font-normal text-muted-foreground"> · {r.community_name}</span>}</p>
                      <p className="truncate text-sm text-muted-foreground">{ASSISTANCE_CATEGORIES[r.category as AssistanceCategory]}{r.assigned_to && ` · Assigned to ${r.assigned_to}`}</p>
                    </div>
                    <Badge variant={r.status === "declined" ? "destructive" : r.status === "new" ? "secondary" : r.status === "approved" ? "default" : "outline"} className="shrink-0">{ASSISTANCE_STATUS_LABELS[r.status as AssistanceStatus] ?? r.status}</Badge>
                    <time className="hidden shrink-0 text-xs text-muted-foreground sm:inline">{new Date(r.created_at).toLocaleDateString()}</time>
                    {openId === r.id ? <ChevronUp className="h-4 w-4 shrink-0" /> : <ChevronDown className="h-4 w-4 shrink-0" />}
                  </button>
                  {openId === r.id && <CaseDetail req={r} isAdmin={!!isAdmin} saving={update.isPending} onPatch={(patch) => update.mutate({ id: r.id, patch })} onDelete={() => confirm("Permanently delete this request? Archiving is usually better.") && del.mutate(r.id)} />}
                </li>
              ))}
            </ul>
          )}
      </div>
    </div>
  );
}

function CaseDetail({ req, isAdmin, saving, onPatch, onDelete }: { req: AssistanceRequest; isAdmin: boolean; saving: boolean; onPatch: (p: Partial<AssistanceRequest>) => void; onDelete: () => void }) {
  const [assigned, setAssigned] = useState(req.assigned_to);
  const [notes, setNotes] = useState(req.internal_notes);
  const [outcome, setOutcome] = useState(req.outcome);
  const subject = encodeURIComponent("Your assistance request — Servio Hope Foundation");
  const body = encodeURIComponent(`Dear ${req.full_name},\n\nThank you for contacting Servio Hope Foundation about your request.\n\n`);
  return (
    <div className="grid gap-6 border-t bg-background px-6 py-6 md:grid-cols-2">
      <dl className="space-y-2 text-sm">
        <div><dt className="font-semibold text-navy">Requesting as</dt><dd>{req.requester_type === "community_representative" ? `Community representative — ${req.community_name ?? ""}` : "Individual"}</dd></div>
        <div><dt className="font-semibold text-navy">Contact</dt><dd>{[req.phone, req.email].filter(Boolean).join(" · ")} (prefers {req.preferred_contact})</dd></div>
        <div><dt className="font-semibold text-navy">Location</dt><dd>{[req.district, req.country].filter(Boolean).join(", ")}</dd></div>
        <div><dt className="font-semibold text-navy">Category</dt><dd>{ASSISTANCE_CATEGORIES[req.category as AssistanceCategory]}</dd></div>
        <div><dt className="font-semibold text-navy">Description</dt><dd className="whitespace-pre-wrap">{req.description}</dd></div>
        <div><dt className="font-semibold text-navy">Consent</dt><dd>{req.consent ? "Given" : "Not given"}</dd></div>
        <div className="flex flex-wrap gap-2 pt-2">
          {req.email && <Button size="sm" variant="outline" asChild><a href={`mailto:${req.email}?subject=${subject}&body=${body}`}><Mail /> Email</a></Button>}
          {req.phone && <Button size="sm" variant="outline" asChild><a href={`tel:${req.phone}`}><Phone /> Call</a></Button>}
        </div>
      </dl>
      <div className="space-y-4">
        <div>
          <p className="mb-2 text-sm font-semibold text-navy">Status</p>
          <div className="flex flex-wrap gap-2">
            {ASSISTANCE_STATUSES.map((s) => <Button key={s} size="sm" variant={req.status === s ? "default" : "outline"} disabled={saving || req.status === s} onClick={() => onPatch({ status: s })}>{ASSISTANCE_STATUS_LABELS[s]}</Button>)}
          </div>
        </div>
        <div className="space-y-1.5"><Label htmlFor={`as-${req.id}`}>Assigned caseworker</Label><Input id={`as-${req.id}`} value={assigned} onChange={(e) => setAssigned(e.target.value)} maxLength={120} placeholder="Staff member name" /></div>
        <div className="space-y-1.5"><Label htmlFor={`no-${req.id}`}>Internal notes (never shown to applicant)</Label><Textarea id={`no-${req.id}`} rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={4000} /></div>
        <div className="space-y-1.5"><Label htmlFor={`oc-${req.id}`}>Outcome</Label><Textarea id={`oc-${req.id}`} rows={2} value={outcome} onChange={(e) => setOutcome(e.target.value)} maxLength={2000} placeholder="e.g. Referred to partner clinic; school fees support provided for Term 1" /></div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" disabled={saving} onClick={() => onPatch({ assigned_to: assigned.trim(), internal_notes: notes, outcome })}>Save case details</Button>
          <Button size="sm" variant="outline" disabled={saving} onClick={() => onPatch({ archived: !req.archived })}>{req.archived ? <><ArchiveRestore /> Restore</> : <><Archive /> Archive</>}</Button>
          {isAdmin && <Button size="sm" variant="ghost" onClick={onDelete}><Trash2 className="text-destructive" /> Delete</Button>}
        </div>
      </div>
    </div>
  );
}
