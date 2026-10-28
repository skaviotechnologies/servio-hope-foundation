import { describe, expect, it } from "vitest";
import { collectionItems, lines, programmeImage, validCtas } from "@/lib/programmes";

describe("Programme content", () => {
  it("supports new categories without a hardcoded category restriction", () => {
    expect(programmeImage("food-security")).toBeTruthy();
    expect(collectionItems([{ value: "12", label: "Verified activities" }])).toEqual([{ value: "12", label: "Verified activities" }]);
  });
  it("does not fabricate impact metrics from an empty programme", () => {
    expect(collectionItems([])).toEqual([]);
  });
  it("preserves all six education activities", () => {
    expect(lines("Scholarships\nSchool supplies\nEducational outreach\nLearning resources\nSchool infrastructure\nDigital literacy")).toHaveLength(6);
  });
  it("rejects unsafe or unknown call-to-action destinations", () => {
    expect(validCtas([{ label: "Give", target: "/donate" }, { label: "Bad", target: "javascript:alert(1)" }, { label: "External", target: "https://example.com" }])).toEqual([{ label: "Give", target: "/donate" }]);
  });
});