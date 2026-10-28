import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { postsQuery } from "@/lib/site";
import { ContentCard, PageHero } from "@/components/site/ui";
import { ListBody } from "@/components/site/ListPage";
import heroImg from "@/assets/hero.jpg";

export const Route = createFileRoute("/_site/news/")({
  head: () => ({
    meta: [
      { title: "News & Updates — Servio Hope Foundation" },
      { name: "description", content: "News, stories and updates from Servio Hope Foundation." },
      { property: "og:title", content: "News — Servio Hope Foundation" },
      { property: "og:description", content: "Stories and updates from our work." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => {
    const q = useQuery(postsQuery);
    return (
      <>
        <PageHero eyebrow="Updates" title="News & stories" image={heroImg} />
        <section className="container-site py-20">
          <ListBody q={q} empty={["No news yet", "Updates from the foundation will appear here."]} render={(items) => items.map((p) => (
            <ContentCard key={p.id} to="/news/$slug" params={{ slug: p.slug }} title={p.title} summary={p.excerpt} image={p.cover_url} fallback={heroImg} meta={p.published_at ? new Date(p.published_at).toLocaleDateString(undefined, { dateStyle: "medium" }) : null} />
          ))} />
        </section>
      </>
    );
  },
});
