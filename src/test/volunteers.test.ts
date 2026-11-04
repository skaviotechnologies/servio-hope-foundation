import { describe, expect, it } from "vitest";
import { volunteerApplicationSchema, volunteerHoursSchema, volunteerApplicationsCsv, VOLUNTEER_STATUSES } from "@/lib/volunteers";
import type { VolunteerApplication } from "@/lib/volunteers";

const validApplication = {
  full_name: "Amina Nakato",
  email: "amina@example.com",
  phone: "+256700000000",
  district: "Kampala",
  country: "Uganda",
  interests: "Education",
  skills: "Teaching",
  availability: "Weekends",
  experience: "Tutored primary pupils",
  motivation: "I want to give back to my community.",
  consent: true as const,
};

describe("volunteer application validation", () => {
  it("accepts a complete application with consent", () => {
    expect(volunteerApplicationSchema.safeParse(validApplication).success).toBe(true);
  });

  it("requires consent to data processing", () => {
    const r = volunteerApplicationSchema.safeParse({ ...validApplication, consent: undefined });
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues.some((i) => i.path[0] === "consent")).toBe(true);
  });

  it("requires name, email, interests, availability and motivation", () => {
    for (const key of ["full_name", "email", "interests", "availability", "motivation"] as const) {
      const r = volunteerApplicationSchema.safeParse({ ...validApplication, [key]: "" });
      expect(r.success, key).toBe(false);
    }
  });

  it("rejects an invalid email", () => {
    expect(volunteerApplicationSchema.safeParse({ ...validApplication, email: "not-an-email" }).success).toBe(false);
  });
});

describe("volunteer hours validation", () => {
  it("requires a positive hour count", () => {
    expect(volunteerHoursSchema.safeParse({ activity: "Reading club", hours: 0, date: "2026-11-01" }).success).toBe(false);
    expect(volunteerHoursSchema.safeParse({ activity: "Reading club", hours: 2.5, date: "2026-11-01" }).success).toBe(true);
  });

  it("requires an activity and a YYYY-MM-DD date", () => {
    expect(volunteerHoursSchema.safeParse({ activity: "", hours: 1, date: "2026-11-01" }).success).toBe(false);
    expect(volunteerHoursSchema.safeParse({ activity: "Reading club", hours: 1, date: "01/11/2026" }).success).toBe(false);
  });
});

describe("volunteer statuses", () => {
  it("covers pending, under review, approved, rejected and inactive", () => {
    expect([...VOLUNTEER_STATUSES]).toEqual(["pending", "under_review", "approved", "rejected", "inactive"]);
  });
});

describe("volunteer CSV export", () => {
  it("includes headers, totals hours and escapes commas and quotes", () => {
    const app = {
      id: "a1", full_name: 'Nakato, Amina "A"', email: "amina@example.com", phone: null, district: "Kampala", country: "Uganda",
      interests: "Education", skills: "Teaching", availability: "Weekends", experience: "", motivation: "", consent: true,
      status: "approved", admin_notes: "", assigned_activities: "Reading club", created_at: "2026-11-01T08:00:00Z", updated_at: "2026-11-01T08:00:00Z",
    } as VolunteerApplication;
    const csv = volunteerApplicationsCsv([app], { a1: 7.5 });
    const lines = csv.split("\n");
    expect(lines[0]).toContain("Full name");
    expect(lines[1]).toContain('"Nakato, Amina ""A"""');
    expect(lines[1]).toContain("Approved");
    expect(lines[1]).toContain("7.5");
  });
});
