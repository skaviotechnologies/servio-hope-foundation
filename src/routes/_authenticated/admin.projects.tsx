import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ContentManager } from "@/components/admin/ContentManager";
import { projectStatuses } from "@/lib/projects";
import { statusLabel } from "@/lib/site";

export const Route = createFileRoute("/_authenticated/admin/projects")({
  head: () => ({ meta: [{ title: "Manage projects — Servio Hope Foundation" }, { name: "description", content: "Edit projects and their programme associations." }, { property: "og:title", content: "Manage projects — Servio Hope Foundation" }, { property: "og:description", content: "Edit projects and their programme associations." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex" }] }),
  component: ProjectsAdmin,
});

function ProjectsAdmin() {
  const programs = useQuery({
    queryKey: ["admin", "programs", "options"],
    queryFn: async () => (await supabase.from("programs").select("id,title").order("sort_order")).data ?? [],
  });
  return (
    <ContentManager table="projects" title="Projects" singular="project" publicPath="/projects" defaults={{ status: "planned" }} fields={[
      { name: "summary", label: "Short summary", type: "textarea" },
      { name: "body", label: "Full description", type: "longtext" },
      { name: "objectives", label: "Objectives (one per line)", type: "longtext" },
      { name: "location", label: "Location", type: "text" },
      { name: "district", label: "District", type: "text" },
      { name: "country", label: "Country", type: "text" },
      { name: "start_date", label: "Start date", type: "date" },
      { name: "end_date", label: "End date", type: "date" },
      { name: "project_manager", label: "Project manager", type: "text" },
      { name: "status", label: "Status", type: "select", options: projectStatuses.map(value => ({ value, label: statusLabel[value] ?? value })) },
      { name: "program_id", label: "Programme", type: "select", options: [{ value: "", label: "— None —" }, ...(programs.data ?? []).map((p) => ({ value: p.id, label: p.title }))] },
      { name: "image_url", label: "Image", type: "image" },
      { name: "gallery", label: "Gallery", type: "collection", itemLabel: "photo", columns: [{ key: "url", label: "Photo", type: "image" }, { key: "caption", label: "Caption" }] },
      { name: "progress_updates", label: "Progress updates", type: "collection", itemLabel: "update", columns: [{ key: "date", label: "Date", type: "date" }, { key: "title", label: "Heading" }, { key: "body", label: "Update", type: "textarea" }] },
      { name: "related_campaigns", label: "Related campaigns", type: "collection", itemLabel: "campaign", columns: [{ key: "label", label: "Campaign name" }, { key: "url", label: "Campaign URL (HTTPS)" }] },
      { name: "supporting_documents", label: "Public supporting documents", type: "collection", itemLabel: "document", columns: [{ key: "label", label: "Document name" }, { key: "url", label: "PDF", type: "document" }] },
      { name: "sort_order", label: "Display order", type: "number" },
    ]} />
  );
}
