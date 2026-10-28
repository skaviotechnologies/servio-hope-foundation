import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowDown, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { settingsQuery } from "@/lib/site";
import { PageHero, CardGridSkeleton, ErrorState } from "@/components/site/ui";
import { aboutQuery, teamQuery } from "@/lib/foundation";
import communityImg from "@/assets/community.jpg";

export const Route = createFileRoute("/_site/about")({
  head: () => ({
    meta: [
      { title: "About Us — Servio Hope Foundation" },
      { name: "description", content: "Learn about Servio Hope Foundation's mission, vision and values, and our ambition to serve communities in Uganda and across Africa." },
      { property: "og:title", content: "About Servio Hope Foundation" },
      { property: "og:description", content: "Our mission, vision and values." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: About,
});

function About() {
  const { data: s } = useQuery(settingsQuery);
  const sections = useQuery(aboutQuery);
  const team = useQuery(teamQuery);
  return (
    <>
      <PageHero eyebrow="About us" title={s?.org_name ?? "Servio Hope Foundation"} intro={s?.motto} image={communityImg} />
      {!!sections.data?.length && <nav aria-label="About this foundation" className="border-b bg-soft">
        <div className="container-site flex flex-wrap gap-x-7 gap-y-3 py-6">
          {sections.data.map((section) => <a key={section.id} href={`#${section.slug}`} className="inline-flex items-center gap-2 text-sm font-semibold text-navy hover:text-emerald">{section.title}<ArrowDown className="h-3 w-3" aria-hidden /></a>)}
        </div>
      </nav>}
      {sections.isLoading && <div className="container-site py-16"><CardGridSkeleton /></div>}
      {sections.isError && <div className="container-site py-16"><ErrorState /></div>}
      {sections.data?.map((section, index) => (
        <section key={section.id} id={section.slug} className={`scroll-mt-24 py-16 md:py-20 ${index % 2 ? "bg-soft" : "bg-background"}`}>
          <div className="container-site grid gap-8 md:grid-cols-[0.7fr_1.3fr]">
            <h2 className="text-3xl font-extrabold text-navy">{section.title}</h2>
            <div className="min-w-0">
              {section.image_url && <img src={section.image_url} alt={section.title} loading="lazy" className="mb-8 aspect-[16/9] w-full rounded-lg object-cover" />}
              {section.slug === "our-core-values" ? <ul className="grid gap-4 sm:grid-cols-2">{section.body.split("\n").filter(Boolean).map((value, i) => <li key={`${i}-${value}`} className="border-l-2 border-gold py-2 pl-4 font-semibold text-emerald">{value}</li>)}</ul> : <p className="prose-body break-words">{section.body}</p>}
            </div>
          </div>
        </section>
      ))}
      {team.isLoading && <div className="container-site py-12"><CardGridSkeleton /></div>}
      {team.isError && <div className="container-site py-12"><ErrorState /></div>}
      {!!team.data?.length && <section aria-label="Leadership profiles" className="border-t py-16">
        <div className="container-site">
          {!sections.data?.some((section) => section.slug === "our-leadership") && <h2 className="mb-8 text-3xl font-extrabold text-navy">Our Leadership</h2>}
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {team.data.map((member) => <article key={member.id} className="overflow-hidden rounded-lg border bg-card">
              <div className="flex aspect-[4/5] items-center justify-center bg-soft">{member.image_url ? <img src={member.image_url} alt={member.title} loading="lazy" className="h-full w-full object-cover" /> : <UserRound className="h-16 w-16 text-emerald" aria-hidden />}</div>
              <div className="p-6"><h3 className="break-words text-xl font-bold text-navy">{member.title}</h3><p className="mt-1 break-words font-medium text-emerald">{member.position}</p><p className="mt-4 whitespace-pre-line break-words text-sm leading-relaxed text-muted-foreground">{member.body}</p></div>
            </article>)}
          </div>
        </div>
      </section>}
      <section className="border-t bg-soft py-16">
        <div className="container-site grid gap-10 md:grid-cols-2">
          <div>
            <h3 className="font-bold text-navy">Organisation details</h3>
            <dl className="mt-4 space-y-3 text-sm">
              <div><dt className="text-muted-foreground">Name</dt><dd className="font-medium">{s?.org_name} ({s?.abbreviation})</dd></div>
              <div><dt className="text-muted-foreground">Type</dt><dd className="font-medium">Humanitarian and charitable foundation</dd></div>
              <div><dt className="text-muted-foreground">Country</dt><dd className="font-medium">{s?.country}</dd></div>
              <div><dt className="text-muted-foreground">Registration status</dt><dd className="font-medium">{s?.legal_status}{s?.registration_number ? ` · ${s.registration_number}` : ""}</dd></div>
            </dl>
          </div>
          <div className="flex items-center md:justify-end"><Button asChild variant="emerald" size="lg"><Link to="/get-involved">Join our mission</Link></Button></div>
        </div>
      </section>
    </>
  );
}
