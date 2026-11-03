import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ContentManager } from "@/components/admin/ContentManager";
import { currencies } from "@/lib/donations";

export const Route = createFileRoute("/_authenticated/admin/campaigns")({
  head: () => ({ meta: [{ title: "Manage Campaigns — Servio Hope Foundation" }, { name: "description", content: "Create and manage fundraising campaigns." }, { property: "og:title", content: "Manage Campaigns — Servio Hope Foundation" }, { property: "og:description", content: "Fundraising campaign administration." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex" }] }),
  component: CampaignsAdmin,
});

function CampaignsAdmin() {
  const programmes = useQuery({ queryKey: ["admin", "programs", "options"], queryFn: async () => {
    const { data, error } = await supabase.from("programs").select("id,title").order("title");
    if (error) throw error;
    return data;
  } });
  const projects = useQuery({ queryKey: ["admin", "projects", "options"], queryFn: async () => {
    const { data, error } = await supabase.from("projects").select("id,title").order("title");
    if (error) throw error;
    return data;
  } });
  return <ContentManager table="campaigns" title="Campaigns" singular="campaign" publicPath="/campaigns" approvalRequired
    defaults={{ summary: "", body: "", currency: "UGX", updates: [], sort_order: 0 }}
    fields={[
      { name: "summary", label: "Short summary", type: "textarea" },
      { name: "body", label: "Full description", type: "longtext" },
      { name: "image_url", label: "Image", type: "image" },
      { name: "funding_target", label: "Funding target", type: "number" },
      { name: "currency", label: "Currency", type: "select", options: currencies.map((c) => ({ value: c, label: c })) },
      { name: "start_date", label: "Start date", type: "date" },
      { name: "end_date", label: "End date", type: "date" },
      { name: "program_id", label: "Related programme", type: "select", options: [{ value: "", label: "None" }, ...(programmes.data ?? []).map((p) => ({ value: p.id, label: p.title }))] },
      { name: "project_id", label: "Related project", type: "select", options: [{ value: "", label: "None" }, ...(projects.data ?? []).map((p) => ({ value: p.id, label: p.title }))] },
      { name: "updates", label: "Campaign updates", type: "collection", itemLabel: "update", columns: [{ key: "date", label: "Date", type: "date" }, { key: "text", label: "Update", type: "textarea" }] },
      { name: "sort_order", label: "Display order", type: "number" },
    ]} />;
}
