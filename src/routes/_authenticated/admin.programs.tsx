import { createFileRoute } from "@tanstack/react-router";
import { ContentManager } from "@/components/admin/ContentManager";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/programs")({
  head: () => ({ meta: [{ title: "Manage Programmes — Servio Hope Foundation" }, { name: "description", content: "Manage foundation programmes and their activities." }, { property: "og:title", content: "Manage Programmes — Servio Hope Foundation" }, { property: "og:description", content: "Foundation programme administration." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: ProgrammesAdmin,
});

function ProgrammesAdmin() {
  const stories = useQuery({ queryKey: ["admin", "posts", "options"], queryFn: async () => {
    const { data, error } = await supabase.from("posts").select("id,title,published").order("title");
    if (error) throw error;
    return data;
  } });
  return <ContentManager table="programs" title="Programmes" singular="programme" publicPath="/programs" defaults={{ objectives: "", activities: "", impact_metrics: [], gallery: [], related_story_ids: [], calls_to_action: [{ label: "Donate", target: "/donate" }, { label: "Volunteer", target: "/get-involved" }] }} fields={[
      { name: "summary", label: "Short summary", type: "textarea" },
      { name: "body", label: "Full description", type: "longtext" },
      { name: "image_url", label: "Image", type: "image" },
      { name: "objectives", label: "Objectives (one per line)", type: "longtext" },
      { name: "activities", label: "Activities (one per line)", type: "longtext" },
      { name: "impact_metrics", label: "Verified impact metrics", type: "collection", itemLabel: "metric", columns: [{ key: "value", label: "Value" }, { key: "label", label: "Metric" }, { key: "context", label: "Period / source" }] },
      { name: "gallery", label: "Gallery", type: "collection", itemLabel: "photo", columns: [{ key: "url", label: "Photo", type: "image" }, { key: "caption", label: "Caption / alternative text" }] },
      { name: "related_story_ids", label: "Related stories", type: "multiselect", options: (stories.data ?? []).map((story) => ({ value: story.id, label: `${story.title}${story.published ? "" : " (draft)"}` })) },
      { name: "calls_to_action", label: "Call-to-action buttons", type: "collection", itemLabel: "button", columns: [{ key: "label", label: "Button label" }, { key: "target", label: "Destination", type: "target" }] },
      { name: "sort_order", label: "Display order", type: "number" },
    ]} />;
}
