import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { HandHeart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { settingsQuery } from "@/lib/site";
import { PageHero } from "@/components/site/ui";
import heroImg from "@/assets/hero.jpg";

export const Route = createFileRoute("/_site/donate")({
  head: () => ({
    meta: [
      { title: "Donate — Support Servio Hope Foundation" },
      { name: "description", content: "Support Servio Hope Foundation's work in education, healthcare, youth empowerment and community development." },
      { property: "og:title", content: "Donate — Servio Hope Foundation" },
      { property: "og:description", content: "Help us serve communities in Uganda." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Donate,
});

function Donate() {
  const { data: s } = useQuery(settingsQuery);
  return (
    <>
      <PageHero eyebrow="Donate" title="Your support inspires hope" intro={s?.donate_intro} image={heroImg} />
      <section className="container-site max-w-3xl py-20">
        <div className="rounded-3xl border bg-card p-8 shadow-soft md:p-12">
          <HandHeart className="h-10 w-10 text-gold" aria-hidden />
          <h2 className="mt-4 text-2xl font-bold text-navy">How to give</h2>
          <p className="prose-body mt-4">{s?.donate_instructions}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild variant="emerald" size="lg"><Link to="/contact">Contact us to give</Link></Button>
            {s?.email && <Button asChild variant="outline" size="lg"><a href={`mailto:${s.email}?subject=Donation`}>Email {s.email}</a></Button>}
          </div>
        </div>
      </section>
    </>
  );
}
