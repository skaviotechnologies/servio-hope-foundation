import type { JSONContent } from "@tiptap/react";

export const ARTICLE_CATEGORIES = ["Foundation News", "Humanitarian Stories", "Education", "Healthcare", "Youth Empowerment", "Community Development", "Events", "Announcements"] as const;
export type ArticleStatus = "draft" | "published" | "scheduled";
export function publicArticle(article: { published: boolean; status: string; published_at: string | null }, now = Date.now()) {
  return article.published && ["published", "scheduled"].includes(article.status) && !!article.published_at && Date.parse(article.published_at) <= now;
}
export function articleStatus(article: { status: string; published_at: string | null }, now = Date.now()) {
  return article.status === "scheduled" && article.published_at && Date.parse(article.published_at) <= now ? "published" : article.status;
}
export function publicationDate(status: ArticleStatus, value: string, now = Date.now()) {
  if (status === "scheduled" && (!value || !Number.isFinite(Date.parse(value)) || Date.parse(value) <= now)) throw new Error("Choose a future publication date to schedule an article.");
  if (value && !Number.isFinite(Date.parse(value))) throw new Error("Choose a valid publication date.");
  return value ? new Date(value).toISOString() : status === "published" ? new Date(now).toISOString() : null;
}
export function safeArticleUrl(value: unknown, image = false): string | undefined {
  if (typeof value !== "string") return undefined;
  try { const url = new URL(value); return (url.protocol === "https:" || (!image && ["http:", "mailto:", "tel:"].includes(url.protocol))) ? value : undefined; } catch { return undefined; }
}
export function plainDocument(body: string): JSONContent {
  return { type: "doc", content: body.split(/\n\n+/).map(text => ({ type: "paragraph", content: text ? [{ type: "text", text }] : [] })) };
}
export function documentText(node: JSONContent): string {
  if (node.type === "text") return node.text ?? "";
  return (node.content ?? []).map(documentText).join(["doc", "bulletList", "orderedList"].includes(node.type ?? "") ? "\n\n" : "");
}
export function localDate(value: string | null) {
  if (!value) return "";
  const d = new Date(value); if (!Number.isFinite(d.getTime())) return "";
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0,16);
}