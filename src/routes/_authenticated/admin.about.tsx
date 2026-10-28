import { createFileRoute } from "@tanstack/react-router";
import { ContentManager } from "@/components/admin/ContentManager";
import { useRoles } from "@/lib/roles";

export const Route = createFileRoute("/_authenticated/admin/about")({
  head: () => ({ meta: [
    { title: "About Content — SHF Administration" },
    { name: "description", content: "Review and approve foundation About content." },
    { property: "og:title", content: "About Content — SHF Administration" },
    { property: "og:description", content: "Foundation content review and publication." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex" },
  ] }),
  component: AboutManager,
});

function AboutManager() {
  const roles = useRoles();
  if (roles.isLoading) return <p className="text-muted-foreground">Loading…</p>;
  if (!roles.data?.roles.includes("admin")) return <p className="text-muted-foreground">Only administrators can review and approve About content.</p>;
  return <ContentManager table="about_sections" title="About the foundation" singular="section" publicPath="/about" approvalRequired fields={[
    { name: "body", label: "Content", type: "longtext" },
    { name: "image_url", label: "Section photo (optional)", type: "image" },
    { name: "sort_order", label: "Display order", type: "number" },
  ]} defaults={{ sort_order: 0 }} />;
}