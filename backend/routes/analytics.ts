import express, { Request, Response } from "express";
import { ApiResponse, AnalyticsSummary, Event } from "../types/index.js";
import { db } from "../database/firestore.js";

const router = express.Router();

router.get('/analytics', async (req: Request, res: Response<ApiResponse<AnalyticsSummary>>) => {
    try {
        const snapshot = await db.collection('events').get();

        let totalTicketsIssued = 0;
        const participationByPeriod = new Map<string, { ticketCount: number; eventCount: number }>();

        snapshot.forEach((doc) => {
            const eventData = doc.data() as Event;

            const ticketsForEvent = typeof eventData.bookedCount === 'number'
                ? eventData.bookedCount
                : Array.isArray(eventData.attendees)
                    ? eventData.attendees.length
                    : 0;

            totalTicketsIssued += ticketsForEvent;

            const eventDate = eventData.date ? new Date(eventData.date) : undefined;
            if (eventDate instanceof Date && !Number.isNaN(eventDate.getTime())) {
                const periodKey = `${eventDate.getFullYear()}-${String(eventDate.getMonth() + 1).padStart(2, '0')}`;
                const currentStats = participationByPeriod.get(periodKey) ?? { ticketCount: 0, eventCount: 0 };
                currentStats.ticketCount += ticketsForEvent;
                currentStats.eventCount += 1;
                participationByPeriod.set(periodKey, currentStats);
            }
        });
        const participationTrends = Array.from(participationByPeriod.entries())
            .sort(([periodA], [periodB]) => periodA.localeCompare(periodB))
            .map(([period, stats]) => ({ period, ...stats }));

        const analytics: AnalyticsSummary = {
            totalEvents: snapshot.size,
            totalTicketsIssued,
            participationTrends,
        };

        res.json({ success: true, data: analytics });
    } catch (error) {
        console.error('Error retrieving analytics:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve analytics',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

export default router;