import express, { Request, Response } from "express";
import { ApiResponse, AnalyticsSummary, Event, TopEvent } from "../types/index.js";
import { db } from "../database/firestore.js";

const router = express.Router();

router.get("/", async (req: Request, res: Response<ApiResponse<AnalyticsSummary>>) => {
    try {
        const snapshot = await db.collection("events").get();

        let totalTicketsIssued = 0;
        const participationByPeriod = new Map<
            string,
            { ticketCount: number; eventCount: number; events: TopEvent[] }
        >();

        snapshot.forEach((doc) => {
            const eventData = doc.data() as Event;
            const eventId = doc.id;

            const ticketsForEvent =
                typeof eventData.bookedCount === "number"
                    ? eventData.bookedCount
                    : Array.isArray(eventData.attendees)
                        ? eventData.attendees.length
                        : 0;

            totalTicketsIssued += ticketsForEvent;

            const eventDate = eventData.date ? new Date(eventData.date) : undefined;
            if (eventDate instanceof Date && !Number.isNaN(eventDate.getTime())) {
                const periodKey = `${eventDate.getFullYear()}-${String(eventDate.getMonth() + 1).padStart(
                    2,
                    "0"
                )}`;

                const current = participationByPeriod.get(periodKey) ?? {
                    ticketCount: 0,
                    eventCount: 0,
                    events: [],
                };

                current.ticketCount += ticketsForEvent;
                current.eventCount += 1;

                current.events.push({
                    id: eventId,
                    title: eventData.title,
                    ticketCount: ticketsForEvent,
                });

                participationByPeriod.set(periodKey, current);
            }
        });

        // Convert and compute top 3 events for each month
        const participationTrends = Array.from(participationByPeriod.entries())
            .sort(([periodA], [periodB]) => periodA.localeCompare(periodB))
            .map(([period, stats]) => ({
                period,
                ticketCount: stats.ticketCount,
                eventCount: stats.eventCount,
                topEvents: stats.events
                    .sort((a, b) => b.ticketCount - a.ticketCount)
                    .slice(0, 3), //  Take top 3 events
            }));

        const analytics: AnalyticsSummary = {
            totalEvents: snapshot.size,
            totalTicketsIssued,
            participationTrends,
        };

        res.json({ success: true, data: analytics });
    } catch (error) {
        console.error("Error retrieving analytics:", error);
        res.status(500).json({
            success: false,
            error: "Failed to retrieve analytics",
            details: error instanceof Error ? error.message : "Unknown error",
        });
    }
});

export default router;
