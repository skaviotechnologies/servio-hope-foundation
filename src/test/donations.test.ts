import { describe, expect, it } from "vitest";
import { campaignProgress, donationsToCsv, validateDonation, type Donation } from "@/lib/donations";

describe("validateDonation", () => {
  it("rejects zero and negative amounts", () => {
    expect(() => validateDonation({ amount: 0 })).toThrow("greater than zero");
    expect(() => validateDonation({ amount: -500 })).toThrow("greater than zero");
    expect(() => validateDonation({ amount: null })).toThrow("greater than zero");
  });

  it("rejects invalid currency codes", () => {
    expect(() => validateDonation({ amount: 100, currency: "ugx" })).toThrow("three-letter");
    expect(() => validateDonation({ amount: 100, currency: "UGXX" })).toThrow("three-letter");
    expect(() => validateDonation({ amount: 100, currency: "UGX" })).not.toThrow();
  });

  it("requires a target when designating a programme or campaign", () => {
    expect(() => validateDonation({ amount: 100, designation: "programme" })).toThrow("programme");
    expect(() => validateDonation({ amount: 100, designation: "campaign" })).toThrow("campaign");
    expect(() => validateDonation({ amount: 100, designation: "programme", program_id: "p1" })).not.toThrow();
    expect(() => validateDonation({ amount: 100, designation: "general" })).not.toThrow();
  });

  it("rejects malformed donor emails", () => {
    expect(() => validateDonation({ amount: 100, donor_email: "not-an-email" })).toThrow("valid email");
    expect(() => validateDonation({ amount: 100, donor_email: "donor@example.org" })).not.toThrow();
  });
});

describe("campaignProgress", () => {
  it("returns null when there is no funding target", () => {
    expect(campaignProgress(null, 5000)).toBeNull();
    expect(campaignProgress(0, 5000)).toBeNull();
  });

  it("calculates percentage from verified totals and caps at 100", () => {
    expect(campaignProgress(100_000, 25_000)).toEqual({ total: 25_000, target: 100_000, percent: 25 });
    expect(campaignProgress(100_000, 150_000)?.percent).toBe(100);
    expect(campaignProgress(100_000, null)?.percent).toBe(0);
  });
});

describe("donationsToCsv", () => {
  it("escapes commas and quotes in donor data", () => {
    const row = {
      id: "1", created_at: "2026-11-03T00:00:00Z", donor_name: 'Acan, "Grace"', donor_email: "g@example.org",
      donor_phone: null, amount: 5000, currency: "UGX", frequency: "one_time", designation: "general",
      program_id: null, campaign_id: null, method: "offline", status: "verified", reference: "R-1", notes: null, is_anonymous: false,
    } as unknown as Donation;
    const csv = donationsToCsv([row]);
    expect(csv.split("\n")).toHaveLength(2);
    expect(csv).toContain('"Acan, ""Grace"""');
  });
});
