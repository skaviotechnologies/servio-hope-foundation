import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import logoAsset from "@/assets/shf-logo.png.asset.json";

export type Settings = Database["public"]["Tables"]["site_settings"]["Row"];
export type Program = Database["public"]["Tables"]["programs"]["Row"];
export type Project = Database["public"]["Tables"]["projects"]["Row"];
export type Post = Database["public"]["Tables"]["posts"]["Row"];
export type Message = Database["public"]["Tables"]["messages"]["Row"];

export const DEFAULT_LOGO = logoAsset.url;

export const settingsQuery = queryOptions({
  queryKey: ["settings"],
  queryFn: async () => {
    const { data, error } = await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle();
    if (error) throw error;
    return data;
  },
  staleTime: 60_000,
});

export const programsQuery = queryOptions({
  queryKey: ["programs", "public"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("programs").select("*").eq("published", true).order("sort_order").order("title");
    if (error) throw error;
    return data;
  },
});

export const projectsQuery = queryOptions({
  queryKey: ["projects", "public"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("projects").select("*").eq("published", true).eq("archived", false).order("sort_order").order("title");
    if (error) throw error;
    return data;
  },
});

export const postsQuery = queryOptions({
  queryKey: ["posts", "public"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("posts").select("*").eq("published", true)
      .order("published_at", { ascending: false, nullsFirst: false });
    if (error) throw error;
    return data;
  },
});

export const bySlug = <T extends "programs" | "projects" | "posts">(table: T, slug: string) =>
  queryOptions({
    queryKey: [table, "slug", slug],
    queryFn: async () => {
      const result = table === "projects"
        ? await supabase.from("projects").select("*").eq("slug", slug).eq("published", true).eq("archived", false).maybeSingle()
        : await supabase.from(table).select("*").eq("slug", slug).eq("published", true).maybeSingle();
      const { data, error } = result;
      if (error) throw error;
      return data as Database["public"]["Tables"][T]["Row"] | null;
    },
  });

export function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 80);
}

export const statusLabel: Record<string, string> = {
  planned: "Planned",
  ongoing: "Active",
  upcoming: "Upcoming",
  active: "Active",
  on_hold: "On Hold",
  cancelled: "Cancelled",
  completed: "Completed",
};
