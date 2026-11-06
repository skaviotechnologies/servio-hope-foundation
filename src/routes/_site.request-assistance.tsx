import { createFileRoute } from "@tanstack/react-router";
import { Lock, Info } from "lucide-react";
import { PageHero } from "@/components/site/ui";
import { AssistanceForm } from "@/components/site/AssistanceForm";
import communityImg from "@/assets/community.jpg";

export const Route = createFileRoute("/_site/request-assistance")({
  head: () => ({
    meta: [
      { title: "Request Assistance | Servio Hope Foundation" },
      { name: "description", content: "Individuals and community representatives can privately request education, healthcare, youth or community support from Servio Hope Foundation." },
      { property: "og:title", content: "Request Assistance — Servio Hope Foundation" },
      { property: "og:description", content: "Privately request support from Servio Hope Foundation." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RequestAssistance,
});

function RequestAssistance() {
  return (
    <>
      <PageHero eyebrow="Request assistance" title="Ask us for support" intro="Individuals and community representatives can tell us about a need in education, healthcare, youth support or community development." image={communityImg} />
      <section className="container-site max-w-3xl py-20">
        <div className="mb-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border-l-4 border-gold bg-gold/10 p-5 text-sm text-ink">
            <p className="flex items-center gap-2 font-bold text-navy"><Info className="h-4 w-4" /> Please note</p>
            <p className="mt-2">Submitting a request does not guarantee assistance. Support depends on our programmes, available resources and an assessment of each request.</p>
          </div>
          <div className="rounded-2xl border-l-4 border-emerald bg-soft p-5 text-sm text-ink">
            <p className="flex items-center gap-2 font-bold text-navy"><Lock className="h-4 w-4" /> Your privacy</p>
            <p className="mt-2">Requests are private and seen only by authorised foundation staff. We collect only what we need to evaluate your request and never publish it.</p>
          </div>
        </div>
        <AssistanceForm />
      </section>
    </>
  );
}
