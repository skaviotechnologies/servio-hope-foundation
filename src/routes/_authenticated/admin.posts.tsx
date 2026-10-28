import { createFileRoute } from "@tanstack/react-router";
import { ContentManager } from "@/components/admin/ContentManager";

export const Route = createFileRoute("/_authenticated/admin/posts")({
  head: () => ({ meta: [{ title: "Manage news — Servio Hope Foundation" }, { name: "description", content: "Edit and publish foundation stories." }, { property: "og:title", content: "Manage news — Servio Hope Foundation" }, { property: "og:description", content: "Edit and publish foundation stories." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <ContentManager table="posts" title="News" singular="post" publicPath="/news" orderBy="created_at" fields={[
      { name: "excerpt", label: "Excerpt", type: "textarea" },
      { name: "body", label: "Article", type: "longtext" },
      { name: "cover_url", label: "Cover image", type: "image" },
    ]} />
  ),
});
