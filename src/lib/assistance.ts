import { z } from "zod";
import type { Tables } from "@/integrations/supabase/types";

export type AssistanceRequest = Tables<"assistance_requests">;

export const ASSISTANCE_CATEGORIES = { education: "Education", healthcare: "Healthcare", youth: "Youth support", community: "Community development", other: "Other humanitarian assistance" } as const;
export type AssistanceCategory = keyof typeof ASSISTANCE_CATEGORIES;

export const ASSISTANCE_STATUSES = ["new", "under_review", "info_requested", "approved", "declined", "closed"] as const;
export type AssistanceStatus = (typeof ASSISTANCE_STATUSES)[number];
export const ASSISTANCE_STATUS_LABELS: Record<AssistanceStatus, string> = {
  new: "New", under_review: "Under review", info_requested: "Information requested", approved: "Approved", declined: "Declined", closed: "Closed",
};

export const assistanceRequestSchema = z.object({
  requester_type: z.enum(["individual", "community_representative"]),
  full_name: z.string().trim().min(1, "Please enter your full name").max(120),
  community_name: z.string().trim().max(160).optional(),
  email: z.string().trim().email("Please enter a valid email").max(255).optional().or(z.literal("")),
  phone: z.string().trim().max(40).optional(),
  district: z.string().trim().max(120).optional(),
  country: z.string().trim().min(1, "Please enter your country").max(120),
  preferred_contact: z.enum(["phone", "email"]),
  category: z.enum(Object.keys(ASSISTANCE_CATEGORIES) as [AssistanceCategory, ...AssistanceCategory[]], { message: "Please choose a category" }),
  description: z.string().trim().min(20, "Please describe the support needed (at least 20 characters)").max(2000),
  consent: z.literal(true, { message: "Please consent to data processing to submit" }),
}).superRefine((d, ctx) => {
  if (!d.email && !d.phone) ctx.addIssue({ code: "custom", path: ["phone"], message: "Please give a phone number or email so we can reach you" });
  if (d.preferred_contact === "email" && !d.email) ctx.addIssue({ code: "custom", path: ["email"], message: "Please enter an email, or choose phone as preferred contact" });
  if (d.preferred_contact === "phone" && !d.phone) ctx.addIssue({ code: "custom", path: ["phone"], message: "Please enter a phone number, or choose email as preferred contact" });
  if (d.requester_type === "community_representative" && !d.community_name) ctx.addIssue({ code: "custom", path: ["community_name"], message: "Please name the community or group you represent" });
});
