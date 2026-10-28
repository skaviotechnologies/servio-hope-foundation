import { createOpenAI } from "@ai-sdk/openai";
import { createClient } from "@supabase/supabase-js";
import { Output, streamText, NoObjectGeneratedError } from "ai";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

const schema = z.object({
  intro: z.string(),
  recommendations: z.array(z.object({ slug: z.string(), reason: z.string(), donation_support: z.string() })),
});
export type CauseMatch = z.infer<typeof schema>;

async function publishedProgrammes() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  const db = createClient<Database>(process.env["SUPABASE_URL"]!, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: { fetch: (input, init) => {
      const h = new Headers(init?.headers);
      if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
      h.set("apikey", key);
      return fetch(input, { ...init, headers: h });
    } },
  });
  const { data, error } = await db.from("programs").select("slug,title,summary,body,objectives,activities").eq("published", true).order("sort_order");
  if (error) throw new Error("Could not load programmes.");
  return data ?? [];
}

export async function matchCauses(causes: string): Promise<CauseMatch & { programmes: { slug: string; title: string }[] }> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new Error("The recommendation service is not configured.");
  const programmes = await publishedProgrammes();
  if (!programmes.length) return { intro: "No programmes are published yet.", recommendations: [], programmes: [] };

  const provider = createOpenAI({
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
  });
  const catalogue = programmes.map((p) => JSON.stringify(p)).join("\n");
  const result = streamText({
    model: provider.responses("openai/gpt-6-astra"),
    instructions: `You help supporters of Servio Hope Foundation (SHF), a humanitarian foundation in Uganda, find programmes matching causes they care about.
Recommend 1 to 3 programmes ONLY from the catalogue below, using their exact slug. For each, give a short reason tied to the supporter's words and explain how a donation can support that programme's described activities.
Use only facts in the catalogue. Never invent statistics, results, costs per item, beneficiaries, partners or registration claims. Keep each field under 70 words, warm and plain. If nothing fits, return an empty list and say so kindly in intro.
Catalogue (JSON lines):
${catalogue}`,
    messages: [{ role: "user", content: causes }],
    output: Output.object({ schema }),
    providerOptions: { openai: { store: false, forceReasoning: true, reasoningEffort: "low", reasoningSummary: "auto", include: ["reasoning.encrypted_content"] } },
  });
  let out: CauseMatch;
  try {
    out = await result.output;
  } catch (e) {
    if (NoObjectGeneratedError.isInstance(e) && e.text) out = schema.parse(JSON.parse(e.text));
    else throw e;
  }
  const valid = new Set(programmes.map((p) => p.slug));
  return {
    intro: out.intro,
    recommendations: out.recommendations.filter((r) => valid.has(r.slug)).slice(0, 3),
    programmes: programmes.map((p) => ({ slug: p.slug, title: p.title })),
  };
}
