import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const recommendProgrammes = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ causes: z.string().trim().min(5).max(1000) }).parse(d))
  .handler(async ({ data }) => {
    const { matchCauses } = await import("./cause-match.server");
    try {
      return { ok: true as const, ...(await matchCauses(data.causes)) };
    } catch (e) {
      const status = (e as { statusCode?: number }).statusCode;
      const message = status === 429 ? "Many people are asking right now. Please try again in a minute."
        : status === 402 || status === 403 ? "Recommendations are temporarily unavailable."
        : "We couldn't create recommendations. Please try again.";
      console.error("cause-match", e);
      return { ok: false as const, message };
    }
  });
