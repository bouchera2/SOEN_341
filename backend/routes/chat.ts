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

    // 1) Identify the user from the Firebase ID token (if any)
    const authHeader = req.headers.authorization;
    let userId: string | null = null;

    if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
      const idToken = authHeader.split(" ")[1];
      try {
        const decoded = await admin.auth().verifyIdToken(idToken);
        userId = decoded.uid;
        console.log("👤 Authenticated user:", userId);
      } catch (err) {
        console.warn("⚠️ Failed to verify Firebase token:", err);
      }
    } else {
      console.log("ℹ️ No Authorization header, treating as anonymous user.");
    }

    // 2) Load ALL events (for general questions)
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

    // 3) Load THIS USER's booked events from the "tickets" collection
//    and match them with the events list from the backend.
let bookedEventsForUser: any[] = [];
let formattedBookings: string;

if (!userId) {
  formattedBookings =
    "The user is not authenticated, so their registered events cannot be accessed.";
} else {
  // Each ticket links a user to an eventId
  const ticketsSnapshot = await db
    .collection("tickets")
    .where("userId", "==", userId)
    .get();

  const tickets = ticketsSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as any),
  }));

  console.log(`🎟 Found ${tickets.length} tickets for user ${userId}`);

  const bookedEventIds = tickets.map((t) => t.eventId);

  // Match with the events we already loaded from backend
  bookedEventsForUser = events.filter((e: any) =>
    bookedEventIds.includes(e.id)
  );

  if (bookedEventsForUser.length > 0) {
    formattedBookings = bookedEventsForUser
      .map(
        (e: any, index: number) =>
          `${index + 1}. ${e.title || "Untitled"} — ${
            e.category || "General"
          } at ${e.location || "Unknown location"} on ${
            e.date || "No date"
          } (Fee: ${e.fee ?? "N/A"})`
      )
      .join("\n");
  } else {
    formattedBookings = "This user has not registered for any events yet.";
  }
}


    // 4) System prompt with BOTH all events and this user's bookings
    const systemPrompt = `
You are "Olivia", the official Campus Events Chatbot for Concordia University.

You have two types of data:
1) A list of ALL events happening on campus.
2) A list of events that THIS user has registered for.

Rules:
- If the user asks "What events did I book?" or similar, answer ONLY using their registered events list.
- If they ask "Am I registered for X?", check if that event appears in their registered events.
- If they ask about events in general (e.g., "What events are happening this week?"), use the full events list.
- If the user is not authenticated, clearly say you cannot access their personal bookings.
- Answer in a friendly, clear and concise way.
- Answer cleanly skipping one line between each events when you list them.
- Put important information in bold
-Keep answers clean and readable. When listing events, always skip one blank line between each event.

Here are ALL campus events:
${formattedEvents}

Here are the events this user is registered for:
${formattedBookings}
    `;

    // 5) Call OpenAI
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
