import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { FileText, FolderKanban, Inbox, LayoutDashboard, LogOut, Menu, Newspaper, Settings, ExternalLink, ShieldAlert } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DEFAULT_LOGO } from "@/lib/site";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — Servio Hope Foundation" },
      { name: "description", content: "Manage the Servio Hope Foundation website." },
      { property: "og:title", content: "Admin — Servio Hope Foundation" },
      { property: "og:description", content: "Website management." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLayout,
});

const LINKS = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/programs", label: "Programmes", icon: FileText },
  { to: "/admin/projects", label: "Projects", icon: FolderKanban },
  { to: "/admin/posts", label: "News", icon: Newspaper },
  { to: "/admin/messages", label: "Messages", icon: Inbox },
  { to: "/admin/settings", label: "Site settings", icon: Settings },
] as const;

export function useRoles() {
  return useQuery({
    queryKey: ["my-roles"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return { email: "", roles: [] as string[] };
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", u.user.id);
      return { email: u.user.email ?? "", roles: (data ?? []).map((r) => r.role as string) };
    },
  });
}

function AdminLayout() {
  const roles = useRoles();
  const qc = useQueryClient();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    nav({ to: "/auth", replace: true });
  }

  if (roles.isLoading)
    return <div className="flex min-h-screen items-center justify-center"><Skeleton className="h-10 w-48" /></div>;

  const isStaff = roles.data?.roles.some((r) => r === "admin" || r === "editor");
  if (!isStaff)
    return (
      <div className="flex min-h-screen items-center justify-center bg-soft p-6">
        <div className="max-w-md rounded-3xl bg-card p-8 text-center shadow-soft">
          <ShieldAlert className="mx-auto h-10 w-10 text-gold" />
          <h1 className="mt-4 text-xl font-bold text-navy">Awaiting access</h1>
          <p className="mt-2 text-sm text-muted-foreground">You're signed in as {roles.data?.email}, but this account hasn't been given dashboard access yet. Please ask an administrator.</p>
          <Button className="mt-6" variant="outline" onClick={signOut}>Sign out</Button>
        </div>
      </div>
    );

  const nav_ = (
    <nav className="flex flex-col gap-1" aria-label="Admin">
      {LINKS.map((l) => (
        <Link key={l.to} to={l.to} activeOptions={{ exact: "exact" in l }} onClick={() => setOpen(false)}
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          activeProps={{ className: "bg-sidebar-accent text-sidebar-accent-foreground" }}>
          <l.icon className="h-4 w-4" /> {l.label}
        </Link>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen bg-soft lg:grid lg:grid-cols-[260px_1fr]">
      <aside className={cn("fixed inset-y-0 left-0 z-40 flex w-[260px] flex-col bg-sidebar p-5 transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0", open ? "translate-x-0" : "-translate-x-full")}>
        <div className="mb-8 flex items-center gap-3">
          <span className="rounded-xl bg-background p-1.5"><img src={DEFAULT_LOGO} alt="" className="h-10 w-10 object-contain" /></span>
          <div className="leading-tight"><p className="font-display font-bold text-sidebar-foreground">SHF Admin</p><p className="text-xs text-sidebar-primary">{roles.data?.roles.includes("admin") ? "Administrator" : "Editor"}</p></div>
        </div>
        {nav_}
        <div className="mt-auto space-y-2 border-t border-sidebar-border pt-4">
          <a href="/" target="_blank" rel="noreferrer" className="flex items-center gap-2 px-3 text-sm text-sidebar-foreground/70 hover:text-sidebar-primary"><ExternalLink className="h-4 w-4" /> View website</a>
          <p className="truncate px-3 text-xs text-sidebar-foreground/50">{roles.data?.email}</p>
          <button onClick={signOut} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent"><LogOut className="h-4 w-4" /> Sign out</button>
        </div>
      </aside>
      {open && <button aria-label="Close menu" className="fixed inset-0 z-30 bg-ink/40 lg:hidden" onClick={() => setOpen(false)} />}
      <div className="min-w-0">
        <header className="sticky top-0 z-20 flex h-14 items-center border-b bg-background px-4 lg:hidden">
          <button aria-label="Open menu" onClick={() => setOpen(true)} className="rounded-lg p-2 hover:bg-soft"><Menu /></button>
          <span className="ml-2 font-bold text-navy">SHF Admin</span>
        </header>
        <main className="mx-auto max-w-6xl p-5 md:p-10"><Outlet /></main>
      </div>
    </div>
  );
}
