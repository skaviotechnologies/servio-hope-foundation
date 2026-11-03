import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { collectionItems } from "@/lib/programmes";

export type Campaign = Database["public"]["Tables"]["campaigns"]["Row"];
export type Donation = Database["public"]["Tables"]["donations"]["Row"];

export const currencies = ["UGX", "USD", "EUR", "GBP", "KES"] as const;
export const donationStatuses = { pledged: "Pledged", recorded: "Recorded", verified: "Verified", cancelled: "Cancelled" } as const;
export const designations = { general: "General foundation support", programme: "A specific programme", campaign: "A specific campaign" } as const;
export const frequencies = { one_time: "One-time donation", monthly: "Monthly donation" } as const;

export function formatAmount(amount: number | null | undefined, currency = "UGX") {
  if (amount == null) return "—";
  try {
    return new Intl.NumberFormat("en-UG", { style: "currency", currency, maximumFractionDigits: 0 }).format(Number(amount));
  } catch {
    return `${currency} ${Number(amount).toLocaleString()}`;
  }
}

export function validateDonation(d: { amount?: number | null; currency?: string; designation?: string; program_id?: string | null; campaign_id?: string | null; donor_email?: string }) {
  if (d.amount == null || !Number.isFinite(Number(d.amount)) || Number(d.amount) <= 0) throw new Error("Enter a donation amount greater than zero.");
  if (!/^[A-Z]{3}$/.test(d.currency ?? "UGX")) throw new Error("Use a three-letter currency code, such as UGX.");
  if (d.designation === "programme" && !d.program_id) throw new Error("Choose the programme this donation supports.");
  if (d.designation === "campaign" && !d.campaign_id) throw new Error("Choose the campaign this donation supports.");
  if (d.donor_email != null && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.donor_email)) throw new Error("Enter a valid email address.");
}

export function campaignProgress(target: number | null | undefined, verifiedTotal: number | null | undefined) {
  if (!target || target <= 0) return null;
  const total = verifiedTotal ?? 0;
  return { total, target, percent: Math.min(100, Math.round((total / target) * 100)) };
}

export const campaignsQuery = queryOptions({
  queryKey: ["campaigns", "public"],
  queryFn: async () => {
    const { data: campaigns, error } = await supabase
      .from("campaigns").select("*").eq("published", true).order("sort_order").order("title");
    if (error) throw error;
    const { data: progress, error: progressError } = await supabase.from("public_campaign_progress").select("*");
    if (progressError) throw progressError;
    const totals = new Map((progress ?? []).map((row) => [row.campaign_id, row.verified_total ?? 0]));
    return (campaigns ?? []).map((campaign) => ({ ...campaign, verified_total: totals.get(campaign.id) ?? 0 }));
  },
});

export const campaignDetailQuery = (slug: string) => queryOptions({
  queryKey: ["campaigns", "detail", slug],
  queryFn: async () => {
    const { data: campaign, error } = await supabase.from("campaigns").select("*").eq("slug", slug).eq("published", true).maybeSingle();
    if (error) throw error;
    if (!campaign) return null;
    const [progress, programme, project] = await Promise.all([
      supabase.from("public_campaign_progress").select("*").eq("campaign_id", campaign.id).maybeSingle(),
      campaign.program_id ? supabase.from("programs").select("id,title,slug").eq("id", campaign.program_id).eq("published", true).maybeSingle() : Promise.resolve({ data: null, error: null }),
      campaign.project_id ? supabase.from("projects").select("id,title,slug").eq("id", campaign.project_id).eq("published", true).eq("archived", false).maybeSingle() : Promise.resolve({ data: null, error: null }),
    ]);
    if (progress.error) throw progress.error;
    if (programme.error) throw programme.error;
    if (project.error) throw project.error;
    return { campaign, verifiedTotal: progress.data?.verified_total ?? 0, programme: programme.data, project: project.data };
  },
});

export function campaignUpdates(value: Campaign["updates"]) {
  return collectionItems(value).filter((item) => !!item["text"]?.trim());
}

function csvCell(value: string | number | null | undefined) {
  const text = value == null ? "" : String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function donationsToCsv(rows: Donation[]) {
  const header = ["Date", "Donor name", "Donor email", "Donor phone", "Amount", "Currency", "Frequency", "Designation", "Method", "Status", "Reference", "Anonymous"];
  const lines = rows.map((d) => [
    new Date(d.created_at).toISOString().slice(0, 10), d.donor_name, d.donor_email, d.donor_phone,
    d.amount, d.currency, d.frequency, d.designation, d.method, d.status, d.reference, d.is_anonymous ? "yes" : "no",
  ].map(csvCell).join(","));
  return [header.join(","), ...lines].join("\n");
}
