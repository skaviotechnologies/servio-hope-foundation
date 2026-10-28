import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import education from "@/assets/education-programme.jpg";
import healthcare from "@/assets/healthcare-programme.jpg";
import youth from "@/assets/youth.jpg";
import community from "@/assets/community.jpg";

export const programmeImages: Record<string, string> = { education, healthcare, "youth-empowerment": youth, "community-development": community };
export function programmeImage(slug: string) { return programmeImages[slug] ?? community; }
export type CollectionItem = Record<string, string>;
export function collectionItems(value: Json | undefined): CollectionItem[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is { [key: string]: Json | undefined } => !!item && typeof item === "object" && !Array.isArray(item)).map((item) => Object.fromEntries(Object.entries(item).filter((entry): entry is [string, string] => typeof entry[1] === "string")));
}
export const ctaTargets = ["/donate", "/get-involved", "/contact"] as const;
export function validCtas(value: Json | undefined) {
  return collectionItems(value).filter((item): item is CollectionItem & { target: typeof ctaTargets[number] } => !!item["label"]?.trim() && ctaTargets.some((target) => target === item["target"]));
}
export function lines(value: string) { return value.split("\n").map((line) => line.trim()).filter(Boolean); }
export const programmeDetailQuery = (slug: string) => queryOptions({
  queryKey: ["programs", "detail", slug],
  queryFn: async () => {
    const { data: programme, error } = await supabase.from("programs").select("*").eq("slug", slug).eq("published", true).maybeSingle();
    if (error) throw error;
    if (!programme) return null;
    const [projects, stories] = await Promise.all([
      supabase.from("projects").select("*").eq("program_id", programme.id).eq("published", true).order("sort_order").order("title"),
      programme.related_story_ids.length ? supabase.from("posts").select("*").in("id", programme.related_story_ids).eq("published", true).order("published_at", { ascending: false }) : Promise.resolve({ data: [], error: null }),
    ]);
    if (projects.error) throw projects.error;
    if (stories.error) throw stories.error;
    return { programme, projects: projects.data ?? [], stories: stories.data ?? [] };
  },
});