import { createServerFn } from "@tanstack/react-start";
import { demoAnalyze, type Analysis } from "./complaints";

const schema = {
  type: "object",
  additionalProperties: false,
  required: ["category", "urgency", "title", "summary"],
  properties: {
    category: { type: "string", enum: ["pothole", "garbage", "water", "drainage", "streetlight", "other"] },
    urgency: { type: "string", enum: ["low", "medium", "high", "critical"] },
    title: { type: "string", description: "Short English title, max 8 words" },
    summary: { type: "string", description: "One-sentence English summary for officials" },
  },
};

export const analyzeComplaint = createServerFn({ method: "POST" })
  .inputValidator((input: { text: string }) => ({ text: String(input.text ?? "").slice(0, 2000) }))
  .handler(async ({ data }): Promise<Analysis & { source: "ai" | "demo" }> => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key || !data.text.trim()) return { ...demoAnalyze(data.text), source: "demo" };
    try {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Lovable-API-Key": key, "X-Lovable-AIG-SDK": "fetch" },
        body: JSON.stringify({
          model: "openai/gpt-6.1-sol",
          stream: true,
          store: false,
          reasoning: { effort: "low" },
          instructions:
            "You triage Indian civic complaints (Kannada or English). Classify category and urgency (critical = immediate danger to life/health). Write title and summary in English.",
          input: data.text,
          text: { format: { type: "json_schema", name: "analysis", strict: true, schema } },
        }),
      });
      if (!res.ok || !res.body) throw new Error(`AI ${res.status}`);
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let buf = "", out = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() ?? "";
        for (const l of lines) {
          if (!l.startsWith("data:")) continue;
          const p = l.slice(5).trim();
          if (!p || p === "[DONE]") continue;
          try {
            const ev = JSON.parse(p);
            if (ev.type === "response.output_text.delta") out += ev.delta;
          } catch {}
        }
      }
      const parsed = JSON.parse(out) as Analysis;
      return { ...parsed, source: "ai" };
    } catch (e) {
      console.error("analyze failed", e);
      return { ...demoAnalyze(data.text), source: "demo" };
    }
  });
