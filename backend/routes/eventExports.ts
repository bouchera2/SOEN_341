import express, { Request, Response } from "express";
import { db } from "../database/firestore.js";
import { Event, UserProfile } from "../types/index.js";
import { checkUserAuthToken } from "../middleware/userAuth.js";
import { AuthenticatedRequest, ApiResponse } from "../types/index.js";

const router = express.Router();

interface ExportRow {
  name: string;
  studentId: string;
  email: string;
}

router.get('/:eventId/export-attendees', checkUserAuthToken, async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
  const { eventId } = req.params;

  try {
    const eventDoc = await db.collection('events').doc(eventId).get();

    if (!eventDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Event not found',
        details: `No event found with id ${eventId}`
      });
    }

    const eventData = eventDoc.data() as Event | undefined;
    if (!eventData) {
      return res.status(500).json({
        success: false,
        error: 'Failed to load event data'
      });
    }

    const attendeeIds = Array.isArray(eventData.attendees) ? eventData.attendees : [];
    
    console.log(`🔍 CSV Export Debug - Event ID: ${eventId}`);
    console.log(`🔍 Event attendees array:`, attendeeIds);
    console.log(`🔍 Number of attendees: ${attendeeIds.length}`);

    const attendeeProfiles = await Promise.all(
      attendeeIds.map(async (attendeeId) => {
        const userDoc = await db.collection('users').doc(attendeeId).get();
        const profile = userDoc.exists ? (userDoc.data() as UserProfile | undefined) : undefined;
        console.log(`🔍 User ${attendeeId} profile:`, profile);
        return {
          id: attendeeId,
          profile
        };
      })
    );

    const rows: ExportRow[] = attendeeProfiles.map(({ id, profile }) => {
      // Handle different possible field names from Firebase Auth
      const name = toCsvField(profile?.name) || id;
      const studentId = toCsvField(profile?.studentId) || 'N/A';
      const email = toCsvField(profile?.email) || 'N/A';
      
      console.log(`🔍 Processing user ${id}:`, { name, studentId, email });
      
      return {
        name,
        studentId,
        email
      };
    });

    console.log(`🔍 Final CSV rows:`, rows);
    console.log(`🔍 Number of CSV rows: ${rows.length}`);

    const csv = buildCsv(rows);
    console.log(`🔍 Generated CSV content:`, csv);
    
    // If no attendees, return a CSV with just headers
    if (rows.length === 0) {
      console.log(`⚠️ No attendees found for event ${eventId}`);
      const emptyCsv = 'name,studentId,email\n';
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="event-${eventId}-attendees.csv"`);
      res.status(200).send(emptyCsv);
      return;
    }
    
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="event-${eventId}-attendees.csv"`);
    res.status(200).send(csv);
  } catch (error) {
    console.error(`Error exporting attendees for event ${eventId}:`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to export attendees',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;

const buildCsv = (rows: ExportRow[]): string => {
  const headers: Array<keyof ExportRow> = ['name', 'studentId', 'email'];
  const dataLines = rows.map((row) =>
    headers.map((header) => escapeCsvValue(row[header])).join(',')
  );
  return [headers.join(','), ...dataLines].join('\n');
};

const escapeCsvValue = (value: string): string => {
  const normalized = value ?? '';
  if (/[",\n]/.test(normalized)) {
    return `"${normalized.replace(/"/g, '""')}"`;
  }
  return normalized;
};

const toCsvField = (value: unknown): string | undefined => {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length ? trimmed : undefined;
  }

  if (typeof value === 'number') {
    return value.toString();
  }

  return undefined;
};

