import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { bySlug } from "@/lib/site";
import { Detail } from "@/components/site/Detail";

export const Route = createFileRoute("/_site/programs/$slug")({
  head: () => ({
    meta: [
      { title: "Programme — Servio Hope Foundation" },
      { name: "description", content: "Programme details from Servio Hope Foundation." },
      { property: "og:title", content: "Programme — Servio Hope Foundation" },
      { property: "og:description", content: "Learn about this programme." },
    ],
  }),
  component: () => {
    const { slug } = Route.useParams();
    const q = useQuery(bySlug("programs", slug));
    const p = q.data;
    return (
      <Detail loading={q.isLoading} error={q.isError} found={!!p} back="/programs" backLabel="All programmes" eyebrow="Programme" title={p?.title} image={p?.image_url} body={p?.body || p?.summary}
        aside={<aside className="h-fit rounded-2xl bg-soft p-7"><h2 className="font-bold text-navy">Support this programme</h2><p className="mt-2 text-sm text-muted-foreground">Your time or gift helps this work grow.</p><div className="mt-5 flex flex-col gap-2"><Button asChild variant="gold"><Link to="/donate">Donate</Link></Button><Button asChild variant="outline"><Link to="/get-involved">Volunteer</Link></Button></div></aside>} />
    );
  },
});
