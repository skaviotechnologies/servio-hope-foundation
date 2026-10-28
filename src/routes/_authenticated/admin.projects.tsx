import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ContentManager } from "@/components/admin/ContentManager";

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
      { name: "location", label: "Location", type: "text" },
      { name: "status", label: "Status", type: "select", options: [{ value: "planned", label: "Planned" }, { value: "ongoing", label: "Ongoing" }, { value: "completed", label: "Completed" }] },
      { name: "program_id", label: "Programme", type: "select", options: [{ value: "", label: "— None —" }, ...(programs.data ?? []).map((p) => ({ value: p.id, label: p.title }))] },
      { name: "image_url", label: "Image", type: "image" },
      { name: "sort_order", label: "Display order", type: "number" },
    ]} />
  );
}
