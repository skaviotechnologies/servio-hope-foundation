import { createFileRoute } from "@tanstack/react-router";
import { ContentManager } from "@/components/admin/ContentManager";

export const Route = createFileRoute("/_authenticated/admin/posts")({
  component: () => (
    <ContentManager table="posts" title="News" singular="post" publicPath="/news" orderBy="created_at" fields={[
      { name: "excerpt", label: "Excerpt", type: "textarea" },
      { name: "body", label: "Article", type: "longtext" },
      { name: "cover_url", label: "Cover image", type: "image" },
    ]} />
  ),
});
