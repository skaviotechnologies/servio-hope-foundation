import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Check, ArrowUpRight } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { collectionItems, lines, programmeDetailQuery, programmeImage, validCtas } from "@/lib/programmes";
import { ContentCard, EmptyState, ErrorState, PageHero, SectionHeading, CardGridSkeleton } from "./ui";

export function ProgrammePage({ slug }: { slug: string }) {
  const q = useQuery(programmeDetailQuery(slug));
  const [photo, setPhoto] = useState<{ url: string; caption: string } | null>(null);
  if (q.isLoading) return <div className="container-site py-20"><CardGridSkeleton /></div>;
  if (q.isError) return <div className="container-site py-20"><ErrorState /></div>;
  if (!q.data) return <div className="container-site py-20"><EmptyState title="Programme unavailable" text="This programme is not currently published." /><Link to="/programs" className="mt-6 inline-flex items-center gap-2 text-emerald"><ArrowLeft /> All programmes</Link></div>;
  const { programme: p, projects, stories } = q.data;
  const metrics = collectionItems(p.impact_metrics).filter((item) => item.value && item["label"]);
  const gallery = collectionItems(p.gallery).filter((item) => item["url"]);
  const ctas = validCtas(p.calls_to_action);
  return <article>
    <PageHero eyebrow="Our programmes" title={p.title} intro={p.summary} image={p.image_url || programmeImage(p.slug)} />
    <section className="container-site py-14 md:py-20">
      <Link to="/programs" className="inline-flex items-center gap-2 text-sm font-semibold text-emerald"><ArrowLeft className="size-4" /> All programmes</Link>
      <div className="mt-9 grid gap-10 lg:grid-cols-[1fr_300px]">
        <div><h2 className="text-3xl font-bold text-navy">About this programme</h2><p className="prose-body mt-5 max-w-3xl">{p.body || p.summary}</p></div>
        <div className="border-l-2 border-gold pl-6"><h2 className="text-xl font-bold text-navy">Get involved</h2><div className="mt-5 flex flex-wrap gap-3">{ctas.map((cta, i) => <Button key={i} asChild variant={i === 0 ? "gold" : "outline"}><Link to={cta.target}>{cta["label"]}<ArrowUpRight /></Link></Button>)}</div></div>
      </div>
    </section>
    <section className="bg-soft py-14 md:py-20"><div className="container-site grid gap-12 md:grid-cols-2">
      {[{ title: "Our objectives", items: lines(p.objectives) }, { title: "Programme activities", items: lines(p.activities) }].map((group) => <div key={group.title}><h2 className="text-2xl font-bold text-navy">{group.title}</h2>{group.items.length ? <ul className="mt-6 space-y-4">{group.items.map((line, i) => <li key={i} className="flex gap-3"><Check className="mt-1 size-4 shrink-0 text-emerald" /><span className="text-muted-foreground">{line}</span></li>)}</ul> : <p className="mt-5 text-muted-foreground">Details will be shared as they are confirmed.</p>}</div>)}
    </div></section>
    <section className="container-site py-14 md:py-20"><SectionHeading eyebrow="On the ground" title="Programme projects" />{projects.length ? <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{projects.map((project) => <ContentCard key={project.id} to="/projects/$slug" params={{ slug: project.slug }} title={project.title} summary={project.summary} image={project.image_url} fallback={programmeImage(p.slug)} badge={project.status} meta={project.location} />)}</div> : <p className="border-t pt-6 text-muted-foreground">Confirmed projects will be published here.</p>}</section>
    <section className="bg-navy py-14 text-primary-foreground"><div className="container-site"><p className="text-sm font-bold text-gold">ACCOUNTABILITY</p><h2 className="mt-3 text-3xl font-bold">Our impact</h2>{metrics.length ? <dl className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">{metrics.map((metric, i) => <div key={i} className="border-t border-primary-foreground/25 pt-5"><dd className="break-words text-4xl font-bold text-gold">{metric["value"]}</dd><dt className="mt-2 font-semibold">{metric["label"]}</dt>{metric["context"] && <p className="mt-2 text-sm text-primary-foreground/75">{metric["context"]}</p>}</div>)}</dl> : <p className="mt-5 text-primary-foreground/80">Verified impact updates will be shared as programme activities are delivered and evaluated.</p>}</div></section>
    <section className="container-site py-14 md:py-20"><SectionHeading eyebrow="In pictures" title="Programme gallery" />{gallery.length ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{gallery.map((item, i) => <figure key={i}><Button variant="ghost" className="block h-auto w-full overflow-hidden rounded-lg p-0" aria-label={`View ${item["caption"] || `photo ${i + 1}`}`} onClick={() => setPhoto({ url: item["url"] ?? "", caption: item["caption"] || "Programme photograph" })}><img src={item["url"]} alt={item["caption"] || "Programme photograph"} loading="lazy" className="aspect-[4/3] w-full object-cover" /></Button>{item["caption"] && <figcaption className="mt-3 text-sm text-muted-foreground">{item["caption"]}</figcaption>}</figure>)}</div> : <p className="border-t pt-6 text-muted-foreground">Programme photographs will be shared here.</p>}</section>
    <section className="bg-soft py-14 md:py-20"><div className="container-site"><SectionHeading eyebrow="Updates" title="Related stories" />{stories.length ? <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{stories.map((story) => <ContentCard key={story.id} to="/news/$slug" params={{ slug: story.slug }} title={story.title} summary={story.excerpt} image={story.cover_url} fallback={programmeImage(p.slug)} />)}</div> : <p className="text-muted-foreground">Programme stories and updates will appear here.</p>}</div></section>
    <Dialog open={!!photo} onOpenChange={(open) => !open && setPhoto(null)}><DialogContent className="max-w-4xl"><DialogHeader><DialogTitle>{photo?.caption}</DialogTitle></DialogHeader>{photo && <img src={photo.url} alt={photo.caption} className="max-h-[70vh] w-full object-contain" />}</DialogContent></Dialog>
  </article>;
}