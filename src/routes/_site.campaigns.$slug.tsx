import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, FolderKanban, HandHeart, Layers } from "lucide-react";
import { campaignDetailQuery, campaignProgress, campaignUpdates, formatAmount } from "@/lib/donations";
import { Detail } from "@/components/site/Detail";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_site/campaigns/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `Campaign — Servio Hope Foundation` },
      { name: "description", content: `Support the ${params.slug} fundraising campaign from Servio Hope Foundation.` },
      { property: "og:title", content: "Fundraising Campaign — Servio Hope Foundation" },
      { property: "og:description", content: "Track verified progress and support this campaign." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CampaignPage,
});

function CampaignPage() {
  const { slug } = Route.useParams();
  const q = useQuery(campaignDetailQuery(slug));
  const data = q.data;
  const campaign = data?.campaign;
  const progress = campaign ? campaignProgress(campaign.funding_target, data?.verifiedTotal) : null;
  const updates = campaign ? campaignUpdates(campaign.updates) : [];

  return (
    <Detail
      loading={q.isLoading} error={q.isError} found={!!data}
      back="/campaigns" backLabel="All campaigns"
      eyebrow="Fundraising campaign" title={campaign?.title} image={campaign?.image_url}
      meta={campaign && (
        <>
          {campaign.start_date && <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-4 w-4" /> {campaign.start_date}{campaign.end_date ? ` → ${campaign.end_date}` : ""}</span>}
          {data?.programme && <Link to="/programs/$slug" params={{ slug: data.programme.slug }} className="inline-flex items-center gap-1.5 text-emerald hover:underline"><Layers className="h-4 w-4" /> {data.programme.title}</Link>}
          {data?.project && <Link to="/projects/$slug" params={{ slug: data.project.slug }} className="inline-flex items-center gap-1.5 text-emerald hover:underline"><FolderKanban className="h-4 w-4" /> {data.project.title}</Link>}
        </>
      )}
      body={campaign?.body || campaign?.summary}
      aside={campaign && (
        <aside className="space-y-6">
          <div className="rounded-3xl border bg-card p-6 shadow-soft">
            <HandHeart className="h-8 w-8 text-gold" aria-hidden />
            {progress ? (
              <>
                <p className="mt-4 text-3xl font-extrabold text-navy">{formatAmount(progress.total, campaign.currency)}</p>
                <p className="text-sm text-muted-foreground">raised of {formatAmount(progress.target, campaign.currency)} target</p>
                <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-soft" role="progressbar" aria-valuenow={progress.percent} aria-valuemin={0} aria-valuemax={100} aria-label="Fundraising progress">
                  <div className="h-full rounded-full bg-emerald transition-all" style={{ width: `${progress.percent}%` }} />
                </div>
                <p className="mt-2 text-xs font-semibold text-emerald">{progress.percent}% funded — verified donations only</p>
              </>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">This campaign has no fixed funding target. Every verified gift counts.</p>
            )}
            <Button asChild variant="gold" size="lg" className="mt-6 w-full"><Link to="/donate">Support this campaign</Link></Button>
          </div>
          {updates.length > 0 && (
            <div className="rounded-3xl border bg-card p-6 shadow-soft">
              <h2 className="text-lg font-bold text-navy">Campaign updates</h2>
              <ul className="mt-4 space-y-4">
                {updates.map((update, i) => (
                  <li key={i} className="border-l-2 border-emerald pl-3">
                    {update["date"] && <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{update["date"]}</p>}
                    <p className="mt-1 text-sm text-ink">{update["text"]}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      )}
    />
  );
}
