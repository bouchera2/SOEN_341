// backend/routes/chat.ts
import express from "express";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// Config (env overrides)
const OPENAI_API_KEY = process.env.OPENAI_API_KEY ?? "";
const OLLAMA_HOST = process.env.OLLAMA_HOST || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3";

/**
 * POST /api/chat
 * Body: { message: string }
 */
router.post("/api/chat", async (req, res) => {
  try {
    const { message } = (req.body ?? {}) as { message?: string };
    if (!message || !message.trim()) {
      return res.status(400).json({ error: "Missing 'message' in body" });
    }

    // ---- Path A: Use OpenAI if key is provided ----
    if (OPENAI_API_KEY) {
      try {
        // Dynamic import so we don't construct OpenAI at module load
        const { default: OpenAI } = await import("openai");
        const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

        const completion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: "You are a helpful assistant for ConcoEvents." },
            { role: "user", content: message },
          ],
        });

        const reply = completion.choices[0]?.message?.content ?? "(no response)";
        return res.json({ reply });
      } catch (err: any) {
        // If OpenAI fails (e.g., 429 quota), surface the reason
        console.error("OpenAI error:", err?.message || err);
        return res.status(502).json({
          error: `OpenAI error: ${err?.message || "unknown"}`,
        });
      }
    }

    // ---- Path B: Fallback to Ollama if no OpenAI key ----
    try {
      const r = await fetch(`${OLLAMA_HOST}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: OLLAMA_MODEL,
          stream: false,
          messages: [
            { role: "system", content: "You are a helpful assistant for ConcoEvents." },
            { role: "user", content: message },
          ],
        }),
      });

      if (!r.ok) {
        const text = await r.text().catch(() => "");
        console.error("Ollama HTTP error:", r.status, text);
        return res
          .status(502)
          .json({ error: `Ollama HTTP ${r.status}: ${text || "unknown"}` });
      }

      const data = (await r.json()) as { message?: { content?: string } };
      const reply = data?.message?.content ?? "(no response)";
      return res.json({ reply });
    } catch (err: any) {
      console.error("Ollama error:", err?.message || err);
      return res
        .status(502)
        .json({ error: `Ollama not reachable at ${OLLAMA_HOST}. Is it running?` });
    }
  } catch (err: any) {
    console.error("Chat route error:", err?.message || err);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;

