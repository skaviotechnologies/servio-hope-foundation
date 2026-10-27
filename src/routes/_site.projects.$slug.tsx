import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { bySlug, statusLabel } from "@/lib/site";
import { Detail } from "@/components/site/Detail";

export const Route = createFileRoute("/_site/projects/$slug")({
  head: () => ({
    meta: [
      { title: "Project — Servio Hope Foundation" },
      { name: "description", content: "Project details from Servio Hope Foundation." },
      { property: "og:title", content: "Project — Servio Hope Foundation" },
      { property: "og:description", content: "Learn about this project." },
    ],
  }),
  component: () => {
    const { slug } = Route.useParams();
    const q = useQuery(bySlug("projects", slug));
    const p = q.data;
    return (
      <Detail loading={q.isLoading} error={q.isError} found={!!p} back="/projects" backLabel="All projects" eyebrow="Project" title={p?.title} image={p?.image_url} body={p?.body || p?.summary}
        meta={p && <><span className="rounded-full bg-gold px-3 py-1 text-xs font-bold text-ink">{statusLabel[p.status]}</span>{p.location && <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4" />{p.location}</span>}</>}
        aside={<aside className="h-fit rounded-2xl bg-soft p-7"><h2 className="font-bold text-navy">Help make it happen</h2><div className="mt-5 flex flex-col gap-2"><Button asChild variant="gold"><Link to="/donate">Donate</Link></Button><Button asChild variant="outline"><Link to="/contact">Ask a question</Link></Button></div></aside>} />
    );
  },
});
