// routes/eventAnalytics.ts

import express, { Response } from "express";
import { db } from "../database/firestore.js";
import { checkUserAuthToken } from "../middleware/userAuth.js";
import { AuthenticatedRequest, Event, ApiResponse, EventAnalytics } from "../types/index.js";

const router = express.Router();

router.get('/:id/analytics',checkUserAuthToken, async (req: AuthenticatedRequest, res: Response<ApiResponse<EventAnalytics>>) => {
    const id = req.params.id as string;

    try {
        const doc = await db.collection('events').doc(id).get();

        if (!doc.exists) {
            return res.status(404).json({
                success: false,
                error: 'Event not found',
                details: `No event found with ID: ${id}`
            });
        }

        const event = doc.data() as Event;

        const requestingUser = req.user;
        const isAdmin = requestingUser?.role === 'admin';
        const isOrganizer = requestingUser?.uid === event.organizer;

        if (!isAdmin && !isOrganizer) {
            return res.status(403).json({
                success: false,
                error: 'Access denied: Not authorized to view this event\'s analytics'
            });
        }

        const capacity = event.capacity || 0;
        const attendees = Array.isArray(event.attendees) ? event.attendees : [];

        const ticketsIssued = typeof event.bookedCount === 'number'
            ? event.bookedCount
            : attendees.length;

        const attendedCount = attendees.filter((a: any) => a.checkedIn === true).length;

        const attendanceRate = ticketsIssued > 0
            ? parseFloat(((attendedCount / ticketsIssued) * 100).toFixed(2))
            : 0;

        const remainingCapacity = capacity - ticketsIssued;

        //  This is where you add the satisfies check:
        res.status(200).json({
            success: true,
            data: {
                eventId: id,
                ticketsIssued,
                attendedCount,
                attendanceRate,
                remainingCapacity
            } satisfies EventAnalytics
        });

    } catch (error) {
        console.error(`Error getting analytics for event ${id}:`, error);
        return res.status(500).json({
            success: false,
            error: 'Failed to retrieve event analytics',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

export default router;
