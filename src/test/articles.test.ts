import { describe, it, expect } from "vitest";
import { ARTICLE_CATEGORIES, publicArticle, publicationDate, articleStatus, safeArticleUrl } from "@/lib/articles";
const now = Date.parse("2026-11-07T07:00:00Z");
describe("article publishing", () => {
  it("supports all eight requested categories", () => { expect([...ARTICLE_CATEGORIES]).toEqual(["Foundation News","Humanitarian Stories","Education","Healthcare","Youth Empowerment","Community Development","Events","Announcements"]); });
  it("keeps drafts private", () => { expect(publicArticle({published:false,status:"draft",published_at:"2026-11-01T00:00:00Z"},now)).toBe(false); });
  it("keeps future schedules private", () => { expect(publicArticle({published:true,status:"scheduled",published_at:"2026-11-08T00:00:00Z"},now)).toBe(false); });
  it("releases schedules at the publication time", () => { const article={published:true,status:"scheduled",published_at:"2026-11-07T07:00:00Z"}; expect(publicArticle(article,now)).toBe(true); expect(articleStatus(article,now)).toBe("published"); });
  it("unpublishing removes public visibility", () => { expect(publicArticle({published:false,status:"draft",published_at:"2026-11-01T00:00:00Z"},now)).toBe(false); });
  it("requires a future schedule date", () => { expect(() => publicationDate("scheduled","",now)).toThrow(); expect(() => publicationDate("scheduled","2026-11-01",now)).toThrow(); expect(publicationDate("scheduled","2026-11-08T00:00:00Z",now)).toBe("2026-11-08T00:00:00.000Z"); });
  it("blocks executable rich-text URLs", () => { expect(safeArticleUrl("javascript:alert(1)")).toBeUndefined(); expect(safeArticleUrl("data:text/html,test")).toBeUndefined(); expect(safeArticleUrl("https://servio-hope.lovable.app/news")).toBe("https://servio-hope.lovable.app/news"); });
});