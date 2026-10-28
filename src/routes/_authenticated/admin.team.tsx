import { createFileRoute } from "@tanstack/react-router";
import { ContentManager } from "@/components/admin/ContentManager";
import { useRoles } from "@/lib/roles";

export const Route = createFileRoute("/_authenticated/admin/team")({
  head: () => ({ meta: [
    { title: "Leadership — SHF Administration" },
    { name: "description", content: "Manage approved leadership profiles and photographs." },
    { property: "og:title", content: "Leadership — SHF Administration" },
    { property: "og:description", content: "Leadership profile review and publication." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex" },
  ] }),
  component: TeamManager,
});

function TeamManager() {
  const roles = useRoles();
  if (roles.isLoading) return <p className="text-muted-foreground">Loading…</p>;
  if (!roles.data?.roles.includes("admin")) return <p className="text-muted-foreground">Only administrators can manage leadership profiles.</p>;
  return <ContentManager table="team_members" title="Our leadership" singular="team member" nameLabel="Full name" publicPath="/about" approvalRequired fields={[
    { name: "position", label: "Position", type: "text" },
    { name: "image_url", label: "Photograph", type: "image" },
    { name: "body", label: "Biography", type: "longtext" },
    { name: "sort_order", label: "Display order", type: "number" },
  ]} defaults={{ sort_order: 0 }} />;
}