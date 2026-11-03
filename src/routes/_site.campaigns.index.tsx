import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { campaignsQuery, campaignProgress, formatAmount } from "@/lib/donations";
import { PageHero, ListBody } from "@/components/site/ListPageExports";
import heroImg from "@/assets/hero.jpg";

export const Route = createFileRoute("/_site/campaigns/")({
  head: () => ({
    meta: [
      { title: "Fundraising Campaigns — Servio Hope Foundation" },
      { name: "description", content: "Active fundraising campaigns from Servio Hope Foundation in Uganda. Track verified progress and support a cause." },
      { property: "og:title", content: "Fundraising Campaigns — Servio Hope Foundation" },
      { property: "og:description", content: "Support verified fundraising campaigns in education, healthcare, youth empowerment and community development." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Campaigns,
});

function Campaigns() {
  const q = useQuery(campaignsQuery);
  return (
    <>
      <PageHero eyebrow="Fundraising" title="Campaigns you can power" intro="Every campaign below shows progress from verified donations only — no estimates, no inflated figures." image={heroImg} />
      <section className="container-site py-20">
        <ListBody q={q} empty={["No active campaigns", "New fundraising campaigns will appear here once published."]} render={(items) => items.map((c) => {
          const progress = campaignProgress(c.funding_target, c.verified_total);
          return (
            <Link key={c.id} to="/campaigns/$slug" params={{ slug: c.slug }}
              className="group flex flex-col overflow-hidden rounded-2xl border bg-card shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift">
              <div className="relative aspect-[4/3] overflow-hidden bg-soft">
                {c.image_url && <img src={c.image_url} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />}
                <span className="absolute left-4 top-4 rounded-full bg-gold px-3 py-1 text-xs font-bold text-ink">{c.currency} target</span>
              </div>
              <div className="flex flex-1 flex-col p-6">
                <h2 className="text-xl font-bold text-navy">{c.title}</h2>
                <p className="mt-2 line-clamp-3 flex-1 text-sm text-muted-foreground">{c.summary}</p>
                {progress && (
                  <div className="mt-4">
                    <div className="h-2 overflow-hidden rounded-full bg-soft" role="progressbar" aria-valuenow={progress.percent} aria-valuemin={0} aria-valuemax={100} aria-label={`${c.title} fundraising progress`}>
                      <div className="h-full rounded-full bg-emerald transition-all" style={{ width: `${progress.percent}%` }} />
                    </div>
                    <p className="mt-2 text-xs font-semibold text-navy">{formatAmount(progress.total, c.currency)} raised of {formatAmount(progress.target, c.currency)} · {progress.percent}%</p>
                  </div>
                )}
                <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-emerald">
                  View campaign <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          );
        })} />
      </section>
    </>
  );
}
