import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, BookOpen, HeartPulse, Sprout, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { settingsQuery, programsQuery, projectsQuery, postsQuery } from "@/lib/site";
import { ContentCard, CardGridSkeleton, EmptyState, SectionHeading } from "@/components/site/ui";
import heroImg from "@/assets/hero.jpg";
import communityImg from "@/assets/community.jpg";
import youthImg from "@/assets/youth.jpg";

export const Route = createFileRoute("/_site/")({
  head: () => ({
    meta: [
      { title: "Servio Hope Foundation (SHF) — Serving Humanity. Inspiring Hope." },
      { name: "description", content: "A Ugandan humanitarian foundation working in education, healthcare, youth empowerment and community development." },
      { property: "og:title", content: "Servio Hope Foundation — Serving Humanity. Inspiring Hope." },
      { property: "og:description", content: "Education, healthcare, youth empowerment and community development in Uganda and beyond." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const ICONS: Record<string, typeof BookOpen> = {
  education: BookOpen,
  healthcare: HeartPulse,
  "youth-empowerment": Users,
  "community-development": Sprout,
};

function Home() {
  const settings = useQuery(settingsQuery);
  const programs = useQuery(programsQuery);
  const projects = useQuery(projectsQuery);
  const posts = useQuery(postsQuery);
  const s = settings.data;

  return (
    <>
      {/* Hero */}
      <section className="relative isolate flex min-h-[86vh] items-center overflow-hidden text-primary-foreground">
        <img src={s?.hero_image_url || heroImg} alt="Children walking to school at sunrise in rural Uganda" width={1920} height={1088} fetchPriority="high" className="absolute inset-0 -z-10 h-full w-full object-cover" />
        <div className="absolute inset-0 -z-10 bg-hero-overlay" />
        <div className="container-site py-24">
          <p className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/25 bg-primary-foreground/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-gold backdrop-blur animate-rise">
            {s?.org_name ?? "Servio Hope Foundation"} · {s?.country ?? "Uganda"}
          </p>
          {settings.isLoading ? (
            <div className="mt-6 max-w-3xl space-y-4"><Skeleton className="h-16 w-full bg-primary-foreground/20" /><Skeleton className="h-6 w-2/3 bg-primary-foreground/20" /></div>
          ) : (
            <>
              <h1 className="mt-6 max-w-4xl text-5xl font-extrabold leading-[1.05] md:text-7xl animate-rise">{s?.hero_title}</h1>
              <p className="mt-6 max-w-2xl text-lg text-primary-foreground/85 md:text-xl animate-rise">{s?.hero_subtitle}</p>
            </>
          )}
          <div className="mt-10 flex flex-wrap gap-3 animate-rise">
            <Button asChild variant="gold" size="lg"><Link to="/donate">Support our work <ArrowRight /></Link></Button>
            <Button asChild variant="heroOutline" size="lg"><Link to="/get-involved">Volunteer with us</Link></Button>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="bg-background py-20 md:py-28">
        <div className="container-site grid items-center gap-14 lg:grid-cols-2">
          <div className="relative">
            <img src={communityImg} alt="A community health worker speaking with a mother and baby" width={1280} height={960} loading="lazy" className="aspect-[4/3] w-full rounded-3xl object-cover shadow-lift" />
            <img src={youthImg} alt="Young people learning skills together" width={1280} height={960} loading="lazy" className="absolute -bottom-10 -right-4 hidden w-1/2 rounded-2xl border-8 border-background object-cover shadow-lift md:block" />
          </div>
          <div>
            <p className="eyebrow">Who we are</p>
            <h2 className="mt-3 text-3xl font-extrabold text-navy md:text-5xl">{s?.motto ?? "Serving Humanity. Inspiring Hope."}</h2>
            <p className="prose-body mt-6">{s?.about_intro}</p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-soft p-5"><h3 className="font-bold text-navy">Our mission</h3><p className="mt-2 text-sm text-muted-foreground">{s?.mission}</p></div>
              <div className="rounded-2xl bg-soft p-5"><h3 className="font-bold text-navy">Our vision</h3><p className="mt-2 text-sm text-muted-foreground">{s?.vision}</p></div>
            </div>
            <Button asChild variant="link" className="mt-6 px-0 text-emerald"><Link to="/about">Learn more about us <ArrowRight /></Link></Button>
          </div>
        </div>
      </section>

      {/* Programmes */}
      <section className="bg-soft py-20 md:py-28">
        <div className="container-site">
          <SectionHeading eyebrow="What we do" title="Our focus areas" intro="Four connected programmes guide our work with communities." action={<Button asChild variant="outline" className="rounded-full"><Link to="/programs">All programmes</Link></Button>} />
          {programs.isLoading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-56 rounded-2xl" />)}</div>
          ) : !programs.data?.length ? (
            <EmptyState title="Programmes coming soon" text="Our programme information will be published here shortly." />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {programs.data.map((p) => {
                const Icon = ICONS[p.slug] ?? Sprout;
                return (
                  <Link key={p.id} to="/programs/$slug" params={{ slug: p.slug }} className="group rounded-2xl border bg-card p-7 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-emerald hover:shadow-lift">
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-gradient text-primary-foreground"><Icon className="h-6 w-6" /></span>
                    <h3 className="mt-5 text-xl font-bold text-navy">{p.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{p.summary}</p>
                    <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-emerald">Explore <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Projects */}
      <section className="py-20 md:py-28">
        <div className="container-site">
          <SectionHeading eyebrow="On the ground" title="Projects" action={<Button asChild variant="outline" className="rounded-full"><Link to="/projects">All projects</Link></Button>} />
          {projects.isLoading ? <CardGridSkeleton /> : !projects.data?.length ? (
            <EmptyState title="Projects will be shared here" text="As our first projects are confirmed, we will publish details and updates on this page." />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {projects.data.slice(0, 3).map((p) => (
                <ContentCard key={p.id} to="/projects/$slug" params={{ slug: p.slug }} title={p.title} summary={p.summary} image={p.image_url} fallback={communityImg} badge={p.status} meta={p.location} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="pb-20 md:pb-28">
        <div className="container-site">
          <div className="relative overflow-hidden rounded-3xl bg-brand-gradient px-8 py-14 text-primary-foreground md:px-16 md:py-20">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-extrabold md:text-5xl">Be part of the hope.</h2>
              <p className="mt-4 text-lg text-primary-foreground/85">Give, volunteer or partner with us as we build our work with communities in Uganda.</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild variant="gold" size="lg"><Link to="/donate">Donate</Link></Button>
                <Button asChild variant="heroOutline" size="lg"><Link to="/get-involved">Get involved</Link></Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* News */}
      {!!posts.data?.length && (
        <section className="bg-soft py-20 md:py-28">
          <div className="container-site">
            <SectionHeading eyebrow="Updates" title="Latest news" action={<Button asChild variant="outline" className="rounded-full"><Link to="/news">All news</Link></Button>} />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posts.data.slice(0, 3).map((p) => (
                <ContentCard key={p.id} to="/news/$slug" params={{ slug: p.slug }} title={p.title} summary={p.excerpt} image={p.cover_url} fallback={heroImg} meta={p.published_at ? new Date(p.published_at).toLocaleDateString(undefined, { dateStyle: "medium" }) : null} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
