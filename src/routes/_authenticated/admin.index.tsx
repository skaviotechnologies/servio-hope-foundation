import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { FileText, FolderKanban, Inbox, Newspaper } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/_authenticated/admin/")({
  head: () => ({ meta: [{ title: "Dashboard overview — Servio Hope Foundation" }, { name: "description", content: "Foundation website activity overview." }, { property: "og:title", content: "Dashboard overview — Servio Hope Foundation" }, { property: "og:description", content: "Foundation website activity overview." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex" }] }),
  component: Dashboard,
});

async function count(table: "programs" | "projects" | "posts" | "messages", filter?: (q: any) => any) {
  let q = supabase.from(table).select("id", { count: "exact", head: true });
  if (filter) q = filter(q);
  const { count: c } = await q;
  return c ?? 0;
}

function Dashboard() {
  const stats = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: async () => ({
      programs: await count("programs"),
      projects: await count("projects"),
      posts: await count("posts"),
      unread: await count("messages", (q) => q.eq("is_read", false)),
    }),
  });
  const cards = [
    { label: "Programmes", value: stats.data?.programs, icon: FileText, to: "/admin/programs" },
    { label: "Projects", value: stats.data?.projects, icon: FolderKanban, to: "/admin/projects" },
    { label: "News posts", value: stats.data?.posts, icon: Newspaper, to: "/admin/posts" },
    { label: "Unread messages", value: stats.data?.unread, icon: Inbox, to: "/admin/messages" },
  ] as const;
  return (
    <div>
      <h1 className="text-3xl font-extrabold text-navy">Dashboard</h1>
      <p className="mt-1 text-muted-foreground">Manage everything on the public website from here.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Link key={c.label} to={c.to} className="rounded-2xl border bg-card p-6 shadow-soft transition-shadow hover:shadow-lift">
            <c.icon className="h-6 w-6 text-emerald" />
            <p className="mt-4 text-sm text-muted-foreground">{c.label}</p>
            {stats.isLoading ? <Skeleton className="mt-1 h-8 w-12" /> : <p className="text-3xl font-extrabold text-navy">{c.value}</p>}
          </Link>
        ))}
      </div>
      <div className="mt-10 rounded-2xl border bg-card p-6">
        <h2 className="font-bold text-navy">Getting started</h2>
        <ul className="mt-3 list-inside list-disc space-y-1.5 text-sm text-muted-foreground">
          <li>Add contact details, registration status and logos in <Link to="/admin/settings" className="text-emerald underline">Site settings</Link>.</li>
          <li>Only items marked <strong>Published</strong> appear on the public website.</li>
          <li>Messages from the contact, volunteer and partner forms arrive in <Link to="/admin/messages" className="text-emerald underline">Messages</Link>.</li>
        </ul>
      </div>
    </div>
  );
}
