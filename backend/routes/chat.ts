import dotenv from "dotenv";
dotenv.config();

import express, { Request, Response } from "express";
import OpenAI from "openai";
import admin from "../config/firebaseAdmin"; 
import fetch from "node-fetch"; 

const db = admin.firestore();
const router = express.Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "" });

console.log("🔑 OpenAI Key loaded?", !!process.env.OPENAI_API_KEY);


async function getAllEventsViaAPI(): Promise<any[]> {
  try {
    const response = await fetch("http://localhost:3000/events/getAll");
    if (!response.ok) throw new Error("Failed to fetch events from backend");

   
    const events = (await response.json()) as any[];
    return events;
  } catch (err) {
    console.error("⚠️ Failed to fetch events from API route, falling back to Firestore:", err);

    
    const snapshot = await db.collection("events").get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }
}


router.post("/chatbot", async (req: Request, res: Response) => {
  try {
    const userMessage = req.body.message || "";
    console.log("🟢 Received message:", userMessage);

    if (!userMessage.trim()) {
      return res.status(400).json({ reply: "Please enter a message." });
    }

    
    const events = await getAllEventsViaAPI();
    console.log(`📅 Loaded ${events.length} events from backend`);

    
    const formattedEvents = events
      .map((e: any, index: number) => {
        const category =
          Array.isArray(e.tags) && e.tags.length > 0
            ? e.tags.join(", ")
            : "Uncategorized";
        return `${index + 1}. ${e.title || "Untitled"} — ${category} at ${
          e.location || "Unknown location"
        } on ${e.date || "TBD"} (${e.type || "N/A"})`;
      })
      .join("\n");

    
    const systemPrompt = `
You are "Olivia", the official Campus Events Chatbot for Concordia University.
Use ONLY the following event data to answer questions about upcoming events.
If the user asks about something that is not in the list, say it's not available yet.

Here are all the events:
${formattedEvents}
    `;

    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      temperature: 0.5,
      max_tokens: 400,
    });

    const reply =
      completion.choices[0].message?.content ||
      "Sorry, I couldn’t find that information right now.";
    res.json({ reply });
  } catch (error: any) {
    console.error("❌ Chatbot error:", error);
    res.status(500).json({ reply: "Server error — check backend logs." });
  }
});

export default router;
