import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type AboutSection = Database["public"]["Tables"]["about_sections"]["Row"];
export type TeamMember = Database["public"]["Tables"]["team_members"]["Row"];

export function publishedInOrder<T extends { published: boolean; sort_order: number; title: string }>(rows: T[]): T[] {
  return rows.filter((row) => row.published).sort((a, b) => a.sort_order - b.sort_order || a.title.localeCompare(b.title));
}

export const aboutQuery = queryOptions({
  queryKey: ["about_sections", "public"],
  queryFn: async () => {
    const { data, error } = await supabase.from("about_sections").select("*").eq("published", true).order("sort_order").order("title");
    if (error) throw error;
    return publishedInOrder(data);
  },
});

export const teamQuery = queryOptions({
  queryKey: ["team_members", "public"],
  queryFn: async () => {
    const { data, error } = await supabase.from("team_members").select("*").eq("published", true).order("sort_order").order("title");
    if (error) throw error;
    return publishedInOrder(data);
  },
});