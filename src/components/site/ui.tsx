import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { ArrowRight, Inbox } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { statusLabel } from "@/lib/site";

export function PageHero({ eyebrow, title, intro, image }: { eyebrow: string; title: string; intro?: string | null | undefined; image?: string | undefined }) {
  return (
    <section className="relative isolate overflow-hidden bg-navy text-primary-foreground">
      {image && <img src={image} alt="" className="absolute inset-0 -z-10 h-full w-full object-cover opacity-40" />}
      <div className="absolute inset-0 -z-10 bg-hero-overlay" />
      <div className="container-site py-20 md:py-28">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold animate-rise">{eyebrow}</p>
        <h1 className="mt-4 max-w-3xl text-4xl font-extrabold leading-tight md:text-6xl animate-rise">{title}</h1>
        {intro && <p className="mt-5 max-w-2xl text-lg text-primary-foreground/85 animate-rise">{intro}</p>}
      </div>
    </section>
  );
}

export function SectionHeading({ eyebrow, title, intro, action }: { eyebrow: string; title: string; intro?: string | undefined; action?: ReactNode }) {
  return (
    <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl">
        <p className="eyebrow">{eyebrow}</p>
        <h2 className="mt-3 text-3xl font-extrabold text-navy md:text-4xl">{title}</h2>
        {intro && <p className="mt-3 text-muted-foreground">{intro}</p>}
      </div>
      {action}
    </div>
  );
}

export function CardGridSkeleton({ n = 3 }: { n?: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true" aria-label="Loading">
      {Array.from({ length: n }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-2xl border bg-card">
          <Skeleton className="aspect-[4/3] w-full rounded-none" />
          <div className="space-y-3 p-6"><Skeleton className="h-5 w-2/3" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-5/6" /></div>
        </div>
      ))}
    </div>
  );
}

export function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed bg-soft px-6 py-16 text-center">
      <Inbox className="h-10 w-10 text-emerald" aria-hidden />
      <h3 className="mt-4 text-lg font-bold text-navy">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">{text}</p>
    </div>
  );
}

export function ErrorState() {
  return <EmptyState title="We couldn't load this content" text="Please check your connection and refresh the page." />;
}

type CardProps = {
  to: "/programs/$slug" | "/projects/$slug" | "/news/$slug";
  params: { slug: string };
  title: string;
  summary: string;
  image?: string | null | undefined;
  fallback: string;
  badge?: string | null | undefined;
  meta?: string | null | undefined;
};

export function ContentCard({ to, params, title, summary, image, fallback, badge, meta }: CardProps) {
  return (
    <Link
      to={to}
      params={params}
      className="group flex flex-col overflow-hidden rounded-2xl border bg-card shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-soft">
        <img src={image || fallback} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        {badge && <span className="absolute left-4 top-4 rounded-full bg-gold px-3 py-1 text-xs font-bold text-ink">{statusLabel[badge] ?? badge}</span>}
      </div>
      <div className="flex flex-1 flex-col p-6">
        {meta && <p className="text-xs font-semibold uppercase tracking-wider text-emerald">{meta}</p>}
        <h3 className="mt-1 text-xl font-bold text-navy">{title}</h3>
        <p className="mt-2 line-clamp-3 flex-1 text-sm text-muted-foreground">{summary}</p>
        <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-emerald">
          Read more <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}
