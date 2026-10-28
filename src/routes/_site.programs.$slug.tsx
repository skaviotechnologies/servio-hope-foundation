import { createFileRoute } from "@tanstack/react-router";
import { ProgrammePage } from "@/components/site/ProgrammePage";

export const Route = createFileRoute("/_site/programs/$slug")({
  head: () => ({
    meta: [
      { title: "Programme — Servio Hope Foundation" },
      { name: "description", content: "Programme details from Servio Hope Foundation." },
      { property: "og:title", content: "Programme — Servio Hope Foundation" },
      { property: "og:description", content: "Learn about this programme." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => {
    const { slug } = Route.useParams();
    return <ProgrammePage slug={slug} />;
  },
});
