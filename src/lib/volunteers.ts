import { z } from "zod";
import type { Tables } from "@/integrations/supabase/types";

export type VolunteerApplication = Tables<"volunteer_applications">;
export type VolunteerHours = Tables<"volunteer_hours">;

export const VOLUNTEER_STATUSES = ["pending", "under_review", "approved", "rejected", "inactive"] as const;
export type VolunteerStatus = (typeof VOLUNTEER_STATUSES)[number];

export const VOLUNTEER_STATUS_LABELS: Record<VolunteerStatus, string> = {
  pending: "Pending",
  under_review: "Under review",
  approved: "Approved",
  rejected: "Rejected",
  inactive: "Inactive",
};

export const volunteerApplicationSchema = z.object({
  full_name: z.string().trim().min(1, "Please enter your full name").max(120),
  email: z.string().trim().email("Please enter a valid email").max(255),
  phone: z.string().trim().max(40).optional(),
  district: z.string().trim().max(120).optional(),
  country: z.string().trim().min(1, "Please enter your country").max(120),
  interests: z.string().trim().min(1, "Please tell us which areas interest you").max(1000),
  skills: z.string().trim().max(1000).optional(),
  availability: z.string().trim().min(1, "Please tell us your availability").max(500),
  experience: z.string().trim().max(2000).optional(),
  motivation: z.string().trim().min(1, "Please tell us why you want to volunteer").max(2000),
  consent: z.literal(true, { message: "Please consent to data processing to apply" }),
});

export const volunteerHoursSchema = z.object({
  activity: z.string().trim().min(1, "Activity is required").max(200),
  hours: z.number().positive("Hours must be greater than zero").max(1000),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  notes: z.string().trim().max(500).optional(),
});

function csvCell(value: string | number | null | undefined): string {
  const s = value == null ? "" : String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function volunteerApplicationsCsv(apps: VolunteerApplication[], hoursByApp: Record<string, number>): string {
  const header = ["Full name", "Email", "Phone", "District", "Country", "Interests", "Skills", "Availability", "Status", "Assigned activities", "Total hours", "Applied on"];
  const rows = apps.map((a) => [
    a.full_name, a.email, a.phone, a.district, a.country, a.interests, a.skills, a.availability,
    VOLUNTEER_STATUS_LABELS[a.status as VolunteerStatus] ?? a.status,
    a.assigned_activities, hoursByApp[a.id] ?? 0, new Date(a.created_at).toISOString().slice(0, 10),
  ]);
  return [header, ...rows].map((r) => r.map(csvCell).join(",")).join("\n");
}

export function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
