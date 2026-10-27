import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Mail, MailOpen, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Message } from "@/lib/site";

export const Route = createFileRoute("/_authenticated/admin/messages")({
  component: Messages,
});

const KINDS = ["all", "contact", "volunteer", "partner"] as const;

function Messages() {
  const qc = useQueryClient();
  const [kind, setKind] = useState<(typeof KINDS)[number]>("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const q = useQuery({
    queryKey: ["admin", "messages"],
    queryFn: async () => {
      const { data, error } = await supabase.from("messages").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as Message[];
    },
  });
  const inv = () => { qc.invalidateQueries({ queryKey: ["admin"] }); };
  const markRead = useMutation({
    mutationFn: async ({ id, is_read }: { id: string; is_read: boolean }) => { const { error } = await supabase.from("messages").update({ is_read }).eq("id", id); if (error) throw error; },
    onSuccess: inv,
  });
  const del = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("messages").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { toast.success("Deleted"); inv(); },
    onError: (e: Error) => toast.error(e.message),
  });
  const items = (q.data ?? []).filter((m) => kind === "all" || m.kind === kind);

  return (
    <div>
      <h1 className="text-3xl font-extrabold text-navy">Messages</h1>
      <p className="text-muted-foreground">Contact, volunteer and partnership submissions.</p>
      <div className="mt-6 flex flex-wrap gap-2">
        {KINDS.map((k) => <Button key={k} size="sm" variant={kind === k ? "default" : "outline"} onClick={() => setKind(k)} className="capitalize">{k}</Button>)}
      </div>
      <div className="mt-6 overflow-hidden rounded-2xl border bg-card">
        {q.isLoading ? <div className="space-y-3 p-6">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-14" />)}</div>
          : !items.length ? <p className="p-10 text-center text-muted-foreground">No messages.</p>
          : (
            <ul className="divide-y">
              {items.map((m) => (
                <li key={m.id} className={m.is_read ? "" : "bg-soft"}>
                  <button className="flex w-full items-start gap-4 p-4 text-left" onClick={() => { setOpenId(openId === m.id ? null : m.id); if (!m.is_read) markRead.mutate({ id: m.id, is_read: true }); }} aria-expanded={openId === m.id}>
                    {m.is_read ? <MailOpen className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" /> : <Mail className="mt-1 h-4 w-4 shrink-0 text-emerald" />}
                    <div className="min-w-0 flex-1">
                      <p className={`truncate ${m.is_read ? "" : "font-bold"} text-navy`}>{m.name} <span className="font-normal text-muted-foreground">· {m.email}</span></p>
                      <p className="truncate text-sm text-muted-foreground">{m.subject || m.message}</p>
                    </div>
                    <span className="hidden shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs capitalize sm:inline">{m.kind}</span>
                    <time className="shrink-0 text-xs text-muted-foreground">{new Date(m.created_at).toLocaleDateString()}</time>
                  </button>
                  {openId === m.id && (
                    <div className="border-t bg-background px-12 py-5">
                      {m.phone && <p className="text-sm"><strong>Phone:</strong> {m.phone}</p>}
                      <p className="mt-2 whitespace-pre-wrap text-sm">{m.message}</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <Button asChild size="sm"><a href={`mailto:${m.email}?subject=${encodeURIComponent("Re: " + (m.subject ?? "Your message to Servio Hope Foundation"))}`}>Reply by email</a></Button>
                        <Button size="sm" variant="outline" onClick={() => markRead.mutate({ id: m.id, is_read: false })}>Mark unread</Button>
                        <Button size="sm" variant="ghost" onClick={() => confirm("Delete this message?") && del.mutate(m.id)}><Trash2 className="text-destructive" /> Delete</Button>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
      </div>
    </div>
  );
}
