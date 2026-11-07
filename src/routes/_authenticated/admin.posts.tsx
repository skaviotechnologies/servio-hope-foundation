import { createFileRoute } from "@tanstack/react-router";
import { ArticleManager } from "@/components/admin/ArticleManager";

export const Route = createFileRoute("/_authenticated/admin/posts")({
  head: () => ({ meta: [{ title: "Manage news — Servio Hope Foundation" }, { name: "description", content: "Edit and publish foundation stories." }, { property: "og:title", content: "Manage news — Servio Hope Foundation" }, { property: "og:description", content: "Edit and publish foundation stories." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex" }] }),
  component: ArticleManager,
});
