import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Archive, ArchiveRestore, Eye, EyeOff, Pencil, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ImageUpload } from "./ImageUpload";
import { slugify } from "@/lib/site";
import { CollectionEditor, type CollectionColumn } from "./CollectionEditor";
import { collectionItems } from "@/lib/programmes";
import { ProjectFinanceEditor } from "./ProjectFinanceEditor";
import { validateFinance, validateProjectDates } from "@/lib/projects";

export type Field =
  | { name: string; label: string; type: "text" | "textarea" | "longtext" | "number" | "image" | "date"; required?: boolean }
  | { name: string; label: string; type: "select"; options: { value: string; label: string }[] }
  | { name: string; label: string; type: "collection"; columns: CollectionColumn[]; itemLabel: string }
  | { name: string; label: string; type: "multiselect"; options: { value: string; label: string }[] };

type Row = { id: string; published: boolean; title: string; slug: string; position?: string; image_url?: string | null; cover_url?: string | null; published_at?: string | null; created_at?: string; updated_at?: string; [k: string]: any };

export function ContentManager({ table, title, singular, fields, orderBy = "sort_order", defaults = {}, publicPath, nameLabel = "Title", approvalRequired = false }: {
  table: "programs" | "projects" | "posts" | "about_sections" | "team_members";
  title: string;
  singular: string;
  fields: Field[];
  orderBy?: string;
  defaults?: Record<string, any>;
  publicPath: string;
  nameLabel?: string;
  approvalRequired?: boolean;
}) {
  const qc = useQueryClient();
  const key = ["admin", table];
  const list = useQuery({
    queryKey: key,
    queryFn: async () => {
      const { data, error } = await supabase.from(table).select("*").order(orderBy, { ascending: orderBy === "sort_order" });
      if (error) throw error;
      return data as unknown as Row[];
    },
  });
  const [editing, setEditing] = useState<Partial<Row> | null>(null);
  const [deleting, setDeleting] = useState<Row | null>(null);

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: key });
    qc.invalidateQueries({ queryKey: [table] });
    if (table === "posts" || table === "projects") qc.invalidateQueries({ queryKey: ["programs", "detail"] });
    if (table === "projects") qc.invalidateQueries({ queryKey: ["admin", "project-finance"] });
  };

  const save = useMutation({
    mutationFn: async (row: Partial<Row>) => {
      const payload: any = { ...row };
      const finance = payload.finance;
      delete payload.finance;
      if (table === "projects") {
        validateProjectDates(payload.start_date, payload.end_date);
        if (!finance) throw new Error("Wait for financial records to load before saving.");
        validateFinance(finance);
        if (payload.archived) payload.published = false;
      }
      payload.slug = slugify(payload.slug || payload.title || "");
      if (!payload.title?.trim()) throw new Error("Title is required");
      if (!payload.slug) throw new Error("Slug is required");
      if (table === "posts" && payload.published && !payload.published_at) payload.published_at = new Date().toISOString();
      delete payload.created_at; delete payload.updated_at;
      const { data: saved, error } = payload.id
        ? await supabase.from(table).update(payload as never).eq("id", payload.id).select("id").single()
        : await supabase.from(table).insert(payload as never).select("id").single();
      if (error) throw new Error(error.code === "23505" ? "That slug is already in use." : error.message);
      if (table === "projects" && saved) {
        setEditing(previous => previous ? { ...previous, id: saved.id } : previous);
        const result = await supabase.from("project_finances").upsert({ ...finance, project_id: saved.id });
        if (result.error) throw new Error(`Project saved, but financial records were not saved: ${result.error.message}. Please retry.`);
      }
    },
    onSuccess: () => { toast.success("Saved"); setEditing(null); invalidate(); },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggle = useMutation({
    mutationFn: async (r: Row) => {
      const patch: any = { published: !r.published };
      if (table === "posts" && !r.published && !r.published_at) patch.published_at = new Date().toISOString();
      const { error } = await supabase.from(table).update(patch as never).eq("id", r.id);
      if (error) throw error;
    },
    onSuccess: invalidate,
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Deleted"); setDeleting(null); invalidate(); },
    onError: (e: Error) => toast.error(e.message),
  });

  const archive = useMutation({
    mutationFn: async (r: Row) => {
      const { error } = await supabase.from("projects").update({ archived: !r.archived, published: false }).eq("id", r.id);
      if (error) throw error;
    },
    onSuccess: invalidate,
    onError: (error: Error) => toast.error(error.message),
  });

  const set = (k: string, v: any) => setEditing((e) => ({ ...e, [k]: v }));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div><h1 className="text-3xl font-extrabold text-navy">{title}</h1><p className="text-muted-foreground">Create, edit, publish or remove {title.toLowerCase()}.</p></div>
        <Button onClick={() => setEditing({ published: false, ...defaults, ...(table === "projects" ? { finance: { currency: "UGX" } } : {}) })}><Plus /> New {singular}</Button>
      </div>

      {approvalRequired && <p role="note" className="mt-5 border-l-4 border-gold bg-gold/10 p-4 text-sm text-ink">Draft content — administrator approval required. Review and verify each item before approving publication. Unpublished drafts are not visible on the website.</p>}

      <div className="mt-8 overflow-hidden rounded-2xl border bg-card">
        {list.isLoading ? (
          <div className="space-y-3 p-6">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-12" />)}</div>
        ) : list.isError ? (
          <p className="p-6 text-destructive">Could not load items.</p>
        ) : !list.data?.length ? (
          <p className="p-10 text-center text-muted-foreground">Nothing here yet. Click “New {singular}” to add one.</p>
        ) : (
          <ul className="divide-y">
            {list.data.map((r) => {
              const img = r.image_url ?? r.cover_url;
              return (
                <li key={r.id} className="flex items-center gap-4 p-4">
                  <div className="h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-soft">{img && <img src={img} alt="" className="h-full w-full object-cover" />}</div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-navy">{r.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{table === "team_members" ? r.position : `${publicPath}${table === "about_sections" ? "#" : "/"}${r.slug}`}</p>
                  </div>
                  <span className={`hidden rounded-full px-2.5 py-1 text-xs font-semibold sm:inline ${r.published ? "bg-emerald text-secondary-foreground" : "bg-muted text-muted-foreground"}`}>{r.archived ? "Archived" : r.published ? "Published" : "Draft"}</span>
                  {table === "projects" && <Button variant="ghost" size="icon" disabled={archive.isPending} aria-label={r.archived ? "Restore project" : "Archive project"} title={r.archived ? "Restore project" : "Archive project"} onClick={() => archive.mutate(r)}>{r.archived ? <ArchiveRestore /> : <Archive />}</Button>}
                  <Button variant="ghost" size="icon" disabled={toggle.isPending || !!r.archived} aria-label={r.published ? "Unpublish" : approvalRequired ? "Approve and publish" : "Publish"} title={r.published ? "Unpublish" : approvalRequired ? "Approve and publish" : "Publish"} onClick={() => toggle.mutate(r)}>{r.published ? <EyeOff /> : <Eye />}</Button>
                  <Button variant="ghost" size="icon" aria-label="Edit" onClick={() => setEditing(r)}><Pencil /></Button>
                  <Button variant="ghost" size="icon" aria-label="Delete" onClick={() => setDeleting(r)}><Trash2 className="text-destructive" /></Button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader><DialogTitle>{editing?.id ? `Edit ${singular}` : `New ${singular}`}</DialogTitle></DialogHeader>
          {editing && (
            <form id="cm-form" className="grid gap-4" onSubmit={(e) => { e.preventDefault(); save.mutate(editing); }}>
              <div className="space-y-1.5"><Label htmlFor="f-title">{nameLabel}</Label><Input id="f-title" value={editing.title ?? ""} onChange={(e) => set("title", e.target.value)} required maxLength={200} /></div>
              <div className="space-y-1.5"><Label htmlFor="f-slug">URL slug</Label><Input id="f-slug" value={editing.slug ?? ""} placeholder={slugify(editing.title ?? "")} onChange={(e) => set("slug", e.target.value)} maxLength={80} /><p className="text-xs text-muted-foreground">Leave empty to generate from the title.</p></div>
              {fields.map((f) => (
                <div key={f.name} className="space-y-1.5">
                  <Label htmlFor={`f-${f.name}`}>{f.label}</Label>
                  {f.type === "text" && <Input id={`f-${f.name}`} value={editing[f.name] ?? ""} onChange={(e) => set(f.name, e.target.value)} />}
                  {f.type === "date" && <Input id={`f-${f.name}`} type="date" value={editing[f.name] ?? ""} onChange={e => set(f.name, e.target.value || null)} />}
                  {f.type === "number" && <Input id={`f-${f.name}`} type="number" value={editing[f.name] ?? 0} onChange={(e) => set(f.name, Number(e.target.value))} />}
                  {f.type === "textarea" && <Textarea id={`f-${f.name}`} rows={3} value={editing[f.name] ?? ""} onChange={(e) => set(f.name, e.target.value)} />}
                  {f.type === "longtext" && <Textarea id={`f-${f.name}`} rows={10} value={editing[f.name] ?? ""} onChange={(e) => set(f.name, e.target.value)} />}
                  {f.type === "image" && <ImageUpload value={editing[f.name]} onChange={(u) => set(f.name, u)} label={f.label} />}
                  {f.type === "collection" && <CollectionEditor value={collectionItems(editing[f.name])} onChange={(items) => set(f.name, items)} columns={f.columns} label={f.itemLabel} />}
                  {f.type === "multiselect" && <div className="max-h-48 space-y-2 overflow-y-auto rounded-md border p-3">{f.options.length ? f.options.map((option) => <label key={option.value} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={(editing[f.name] ?? []).includes(option.value)} onChange={(e) => set(f.name, e.target.checked ? [...(editing[f.name] ?? []), option.value] : (editing[f.name] ?? []).filter((id: string) => id !== option.value))} />{option.label}</label>) : <p className="text-sm text-muted-foreground">No stories available.</p>}</div>}
                  {f.type === "select" && (
                    <select id={`f-${f.name}`} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm" value={editing[f.name] ?? ""} onChange={(e) => set(f.name, e.target.value || null)}>
                      {f.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  )}
                </div>
              ))}
              {table === "projects" && <ProjectFinanceEditor id={editing.id} value={editing.finance} onChange={value => set("finance", value)} />}
              <div className="flex items-center gap-3 rounded-lg bg-soft p-3"><Switch id="f-pub" disabled={!!editing.archived} checked={!!editing.published} onCheckedChange={(v) => set("published", v)} /><Label htmlFor="f-pub">{editing.archived ? "Archived — restore before publishing" : approvalRequired ? "Administrator approved — publish on website" : "Published (visible on website)"}</Label></div>
            </form>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button type="submit" form="cm-form" disabled={save.isPending}>{save.isPending ? "Saving…" : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete “{deleting?.title}”?</AlertDialogTitle><AlertDialogDescription>This cannot be undone. Consider unpublishing instead.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => deleting && remove.mutate(deleting.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
