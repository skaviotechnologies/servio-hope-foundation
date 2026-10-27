import { createFileRoute } from "@tanstack/react-router";
import { ContentManager } from "@/components/admin/ContentManager";

export const Route = createFileRoute("/_authenticated/admin/programs")({
  component: () => (
    <ContentManager table="programs" title="Programmes" singular="programme" publicPath="/programs" fields={[
      { name: "summary", label: "Short summary", type: "textarea" },
      { name: "body", label: "Full description", type: "longtext" },
      { name: "image_url", label: "Image", type: "image" },
      { name: "sort_order", label: "Display order", type: "number" },
    ]} />
  ),
});
