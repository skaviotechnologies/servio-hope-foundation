import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { programsQuery } from "@/lib/site";
import { ContentCard, PageHero } from "@/components/site/ui";
import { ListBody } from "@/components/site/ListPage";
import youthImg from "@/assets/youth.jpg";

export const Route = createFileRoute("/_site/programs/")({
  head: () => ({
    meta: [
      { title: "Programmes — Servio Hope Foundation" },
      { name: "description", content: "Education, healthcare, youth empowerment and community development programmes by Servio Hope Foundation." },
      { property: "og:title", content: "Our Programmes — Servio Hope Foundation" },
      { property: "og:description", content: "Explore our four focus areas." },
    ],
  }),
  component: () => {
    const q = useQuery(programsQuery);
    return (
      <>
        <PageHero eyebrow="What we do" title="Our programmes" intro="Our work is organised around four connected focus areas." image={youthImg} />
        <section className="container-site py-20">
          <ListBody q={q} empty={["No programmes yet", "Programme information will be published soon."]} render={(items) => items.map((p) => (
            <ContentCard key={p.id} to="/programs/$slug" params={{ slug: p.slug }} title={p.title} summary={p.summary} image={p.image_url} fallback={youthImg} />
          ))} />
        </section>
      </>
    );
  },
});
