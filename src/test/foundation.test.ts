import { describe, expect, it } from "vitest";
import { publishedInOrder } from "@/lib/foundation";

describe("Foundation publication", () => {
  it("keeps draft About content requiring administrator approval off the public page", () => {
    const result = publishedInOrder([{ title: "Our Mission", published: false, sort_order: 0 }, { title: "Approved vision", published: true, sort_order: 1 }]);
    expect(result.map((r) => r.title)).toEqual(["Approved vision"]);
  });
  it("keeps unpublished team profiles off the public page", () => {
    expect(publishedInOrder([{ title: "Unapproved member", published: false, sort_order: 0 }])).toEqual([]);
  });
  it("respects administrator-configured team display order", () => {
    expect(publishedInOrder([{ title: "Second", published: true, sort_order: 20 }, { title: "First", published: true, sort_order: 10 }]).map((r) => r.title)).toEqual(["First", "Second"]);
  });
});