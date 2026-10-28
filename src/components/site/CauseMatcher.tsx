import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Compass, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { recommendProgrammes } from "@/lib/cause-match.functions";

type Result = Awaited<ReturnType<typeof recommendProgrammes>>;

export function CauseMatcher() {
  const run = useServerFn(recommendProgrammes);
  const [causes, setCauses] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (causes.trim().length < 5 || loading) return;
    setLoading(true);
    setResult(null);
    try { setResult(await run({ data: { causes } })); }
    catch { setResult({ ok: false, message: "We couldn't create recommendations. Please try again." }); }
    finally { setLoading(false); }
  }

  return (
    <div className="rounded-3xl border bg-card p-8 shadow-soft md:p-12">
      <Compass className="h-10 w-10 text-emerald" aria-hidden />
      <h2 className="mt-4 text-2xl font-bold text-navy">Find the cause closest to your heart</h2>
      <p className="mt-2 text-muted-foreground">Tell us what you care about and our AI-powered guide will suggest SHF programmes and explain how your gift can help.</p>
      <form onSubmit={submit} className="mt-6 space-y-3">
        <label htmlFor="causes" className="sr-only">Causes you care about</label>
        <Textarea id="causes" value={causes} maxLength={1000} rows={4} onChange={(e) => setCauses(e.target.value)} placeholder="e.g. I want girls in rural villages to stay in school, and families to reach basic health care." />
        <Button type="submit" variant="emerald" disabled={loading || causes.trim().length < 5}>
          {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Finding matches…</> : "Recommend programmes"}
        </Button>
      </form>
      <div aria-live="polite" className="mt-6">
        {result && !result.ok && <p className="text-sm text-destructive">{result.message}</p>}
        {result?.ok && (
          <div className="space-y-4">
            <p className="text-foreground">{result.intro}</p>
            {result.recommendations.map((r) => (
              <div key={r.slug} className="rounded-2xl border bg-soft p-5">
                <Link to="/programs/$slug" params={{ slug: r.slug }} className="text-lg font-bold text-navy hover:underline">
                  {result.programmes.find((p) => p.slug === r.slug)?.title ?? r.slug}
                </Link>
                <p className="mt-2 text-sm">{r.reason}</p>
                <p className="mt-2 text-sm"><span className="font-semibold text-emerald">How your gift helps: </span>{r.donation_support}</p>
              </div>
            ))}
            <p className="text-xs text-muted-foreground">Suggestions are AI-generated from our published programme information. Please contact us to confirm how your gift will be used.</p>
          </div>
        )}
      </div>
    </div>
  );
}
