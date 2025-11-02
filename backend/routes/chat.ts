import dotenv from "dotenv";
dotenv.config();

import express, { Request, Response } from "express";
import OpenAI from "openai";

const router = express.Router();

// ✅ Create a client instance using your API key from .env
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post("/chat", async (req: Request, res: Response) => {
  const { message } = req.body as { message?: string };

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    // ✅ Call the OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are ConcoBot, an AI assistant that helps students find campus events that match their interests.",
        },
        { role: "user", content: message },
      ],
    });

    const reply =
      completion.choices?.[0]?.message?.content ??
      "Sorry, I couldn’t generate a response.";

    res.json({ reply });
  } catch (error) {
    console.error("❌ OpenAI API error:", error);
    res.status(500).json({ error: "Failed to connect to AI" });
  }
});

export default router;
