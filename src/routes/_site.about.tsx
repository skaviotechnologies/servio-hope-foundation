import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Compass, Eye, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { settingsQuery } from "@/lib/site";
import { PageHero } from "@/components/site/ui";
import communityImg from "@/assets/community.jpg";

export const Route = createFileRoute("/_site/about")({
  head: () => ({
    meta: [
      { title: "About Us — Servio Hope Foundation" },
      { name: "description", content: "Learn about Servio Hope Foundation's mission, vision and values, and our ambition to serve communities in Uganda and across Africa." },
      { property: "og:title", content: "About Servio Hope Foundation" },
      { property: "og:description", content: "Our mission, vision and values." },
    ],
  }),
  component: About,
});

function About() {
  const { data: s } = useQuery(settingsQuery);
  const blocks = [
    { icon: Compass, title: "Mission", text: s?.mission },
    { icon: Eye, title: "Vision", text: s?.vision },
    { icon: Heart, title: "Values", text: s?.values },
  ];
  return (
    <>
      <PageHero eyebrow="About us" title={s?.org_name ?? "Servio Hope Foundation"} intro={s?.motto} image={communityImg} />
      <section className="py-20">
        <div className="container-site grid gap-12 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <p className="eyebrow">Our story</p>
            <h2 className="mt-3 text-3xl font-extrabold text-navy">Rooted in {s?.country ?? "Uganda"}, with a heart for Africa</h2>
            <p className="prose-body mt-6">{s?.about_intro}</p>
          </div>
          <aside className="rounded-2xl border bg-soft p-7">
            <h3 className="font-bold text-navy">Organisation details</h3>
            <dl className="mt-4 space-y-3 text-sm">
              <div><dt className="text-muted-foreground">Name</dt><dd className="font-medium">{s?.org_name} ({s?.abbreviation})</dd></div>
              <div><dt className="text-muted-foreground">Type</dt><dd className="font-medium">Humanitarian and charitable foundation</dd></div>
              <div><dt className="text-muted-foreground">Country</dt><dd className="font-medium">{s?.country}</dd></div>
              <div><dt className="text-muted-foreground">Registration status</dt><dd className="font-medium">{s?.legal_status}{s?.registration_number ? ` · ${s.registration_number}` : ""}</dd></div>
            </dl>
          </aside>
        </div>
      </section>
      <section className="bg-soft py-20">
        <div className="container-site grid gap-6 md:grid-cols-3">
          {blocks.map((b) => (
            <div key={b.title} className="rounded-2xl bg-card p-8 shadow-soft">
              <b.icon className="h-8 w-8 text-gold" aria-hidden />
              <h3 className="mt-4 text-xl font-bold text-navy">{b.title}</h3>
              <p className="mt-3 whitespace-pre-line text-muted-foreground">{b.text || "—"}</p>
            </div>
          ))}
        </div>
        <div className="container-site mt-12 text-center">
          <Button asChild variant="emerald" size="lg"><Link to="/get-involved">Join our mission</Link></Button>
        </div>
      </section>
    </>
  );
}
