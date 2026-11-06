import { describe, expect, it } from "vitest";
import { assistanceRequestSchema } from "@/lib/assistance";

const valid = { requester_type: "individual" as const, full_name: "Okello John", phone: "+256700000000", country: "Uganda", preferred_contact: "phone" as const, category: "education" as const, description: "School fees support needed for two children.", consent: true as const };

describe("assistance request validation", () => {
  it("accepts a minimal valid request", () => expect(assistanceRequestSchema.safeParse(valid).success).toBe(true));
  it("requires consent", () => expect(assistanceRequestSchema.safeParse({ ...valid, consent: undefined }).success).toBe(false));
  it("requires a way to contact the applicant", () => expect(assistanceRequestSchema.safeParse({ ...valid, phone: undefined }).success).toBe(false));
  it("requires community name for representatives", () => expect(assistanceRequestSchema.safeParse({ ...valid, requester_type: "community_representative" }).success).toBe(false));
  it("rejects unknown categories", () => expect(assistanceRequestSchema.safeParse({ ...valid, category: "loans" }).success).toBe(false));
});
