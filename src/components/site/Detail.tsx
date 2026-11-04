import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "./ui";
import type { ReactNode } from "react";

export function Detail({ loading, error, found, back, backLabel, eyebrow, title, image, meta, body, aside }: {
  loading: boolean; error: boolean; found: boolean;
  back: "/programs" | "/projects" | "/news" | "/campaigns"; backLabel: string;
  eyebrow?: string | undefined; title?: string | undefined; image?: string | null | undefined; meta?: ReactNode; body?: string | undefined; aside?: ReactNode;
}) {
  if (loading)
    return (
      <div className="container-site space-y-6 py-16" aria-busy="true">
        <Skeleton className="h-10 w-2/3" /><Skeleton className="aspect-[21/9] w-full rounded-3xl" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-5/6" />
      </div>
    );
  if (error) return <div className="container-site py-16"><ErrorState /></div>;
  if (!found)
    return (
      <div className="container-site py-16">
        <EmptyState title="Not found" text="This page may have been moved or is no longer published." />
        <div className="mt-6 text-center"><Link to={back} className="font-semibold text-emerald">← {backLabel}</Link></div>
      </div>
    );
  return (
    <article className="pb-20">
      <div className="container-site pt-10">
        <Link to={back} className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald hover:underline"><ArrowLeft className="h-4 w-4" /> {backLabel}</Link>
        {eyebrow && <p className="eyebrow mt-8">{eyebrow}</p>}
        <h1 className="mt-3 max-w-4xl text-4xl font-extrabold text-navy md:text-5xl">{title}</h1>
        {meta && <div className="mt-4 flex flex-wrap gap-3 text-sm text-muted-foreground">{meta}</div>}
      </div>
      {image && (
        <div className="container-site mt-10">
          <img src={image} alt="" className="aspect-[21/9] w-full rounded-3xl object-cover shadow-lift" />
        </div>
      )}
      <div className="container-site mt-12 grid gap-12 lg:grid-cols-[1fr_320px]">
        <div className="prose-body max-w-3xl">{body}</div>
        {aside}
      </div>
    </article>
  );
}
