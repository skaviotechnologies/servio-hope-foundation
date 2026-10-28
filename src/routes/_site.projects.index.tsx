import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { projectsQuery } from "@/lib/site";
import { ContentCard, PageHero } from "@/components/site/ui";
import { ListBody } from "@/components/site/ListPage";
import communityImg from "@/assets/community.jpg";

export const Route = createFileRoute("/_site/projects/")({
  head: () => ({
    meta: [
      { title: "Projects — Servio Hope Foundation" },
      { name: "description", content: "Planned, ongoing and completed projects of Servio Hope Foundation." },
      { property: "og:title", content: "Projects — Servio Hope Foundation" },
      { property: "og:description", content: "See our projects in communities." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => {
    const q = useQuery(projectsQuery);
    return (
      <>
        <PageHero eyebrow="On the ground" title="Projects" intro="Planned, ongoing and completed work in communities." image={communityImg} />
        <section className="container-site py-20">
          <ListBody q={q} empty={["Projects coming soon", "As projects are confirmed, details and updates will be published here."]} render={(items) => items.map((p) => (
            <ContentCard key={p.id} to="/projects/$slug" params={{ slug: p.slug }} title={p.title} summary={p.summary} image={p.image_url} fallback={communityImg} badge={p.status} meta={p.location} />
          ))} />
        </section>
      </>
    );
  },
});
