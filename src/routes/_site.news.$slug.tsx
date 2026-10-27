import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { bySlug } from "@/lib/site";
import { Detail } from "@/components/site/Detail";

export const Route = createFileRoute("/_site/news/$slug")({
  head: () => ({
    meta: [
      { title: "News — Servio Hope Foundation" },
      { name: "description", content: "An update from Servio Hope Foundation." },
      { property: "og:title", content: "News — Servio Hope Foundation" },
      { property: "og:description", content: "Read this update." },
      { property: "og:type", content: "article" },
    ],
  }),
  component: () => {
    const { slug } = Route.useParams();
    const q = useQuery(bySlug("posts", slug));
    const p = q.data;
    return (
      <Detail loading={q.isLoading} error={q.isError} found={!!p} back="/news" backLabel="All news" eyebrow="News" title={p?.title} image={p?.cover_url} body={p?.body || p?.excerpt}
        meta={p?.published_at && <time dateTime={p.published_at}>{new Date(p.published_at).toLocaleDateString(undefined, { dateStyle: "long" })}</time>} />
    );
  },
});
