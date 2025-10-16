import express, { Request, Response } from "express";
import { db } from "../database/firestore";
import QRCode from "qrcode";
import { checkUserAuthToken } from "../middleware/userAuth.js";
import { AuthenticatedRequest, ApiResponse } from "../types/index.js";

const router = express.Router();

// Claim ticket
router.post("/", checkUserAuthToken, async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
  try {
    console.log('=== CLAIM TICKET ROUTE CALLED ===');
    const { eventId } = req.body;
    const userId = req.user?.uid;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    if (!eventId) {
      return res.status(400).json({
        success: false,
        error: 'Event ID is required'
      });
    }

    // Check if event exists and has capacity
    const eventDoc = await db.collection('events').doc(eventId).get();
    if (!eventDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }

    const eventData = eventDoc.data();
    if (!eventData) {
      return res.status(404).json({
        success: false,
        error: 'Event data not found'
      });
    }

    // Check if user already has a ticket for this event
    const existingTicket = await db.collection('tickets')
      .where('eventId', '==', eventId)
      .where('userId', '==', userId)
      .get();

    if (!existingTicket.empty) {
      return res.status(400).json({
        success: false,
        error: 'You already have a ticket for this event'
      });
    }

    // Check capacity
    const currentBookedCount = eventData.bookedCount || 0;
    const capacity = eventData.capacity || 0;
    
    if (capacity > 0 && currentBookedCount >= capacity) {
      return res.status(400).json({
        success: false,
        error: 'Event is at full capacity'
      });
    }

    // Create ticket
    const ticketRef = await db.collection("tickets").add({
      eventId,
      userId,
      claimed: false,
    });

    const ticketId = ticketRef.id;

    // Generate QR code
    const qrDataUrl = await QRCode.toDataURL(ticketId);

    // Save QR to Firestore
    await ticketRef.update({
      qrCode: qrDataUrl,
    });

    // Update event's booked count and add user to attendees
    const currentAttendees = eventData.attendees || [];
    console.log(`🔍 Current attendees before adding user:`, currentAttendees);
    
    const updatedAttendees = [...currentAttendees, userId];
    await db.collection('events').doc(eventId).update({
      bookedCount: currentBookedCount + 1,
      attendees: updatedAttendees
    });

    console.log(`✅ Added user ${userId} to event ${eventId} attendees. Total attendees: ${updatedAttendees.length}`);
    console.log(`🔍 Updated attendees array:`, updatedAttendees);

    console.log('✅ Ticket claimed successfully:', ticketId);

    res.json({
      success: true,
      message: "Ticket claimed successfully",
      data: { ticketId, qrCode: qrDataUrl },
    });
  } catch (err) {
    console.error('❌ Error claiming ticket:', err);
    res.status(500).json({ 
      success: false, 
      error: "Failed to claim ticket",
      details: err instanceof Error ? err.message : 'Unknown error'
    });
  }
});

// Get user's tickets
router.get("/user", checkUserAuthToken, async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
  try {
    console.log('=== GET USER TICKETS ROUTE CALLED ===');
    const userId = req.user?.uid;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    // Get user's tickets
    const ticketsSnapshot = await db.collection('tickets')
      .where('userId', '==', userId)
      .get();

    const tickets = ticketsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    console.log(`✅ Found ${tickets.length} tickets for user ${userId}`);

    res.json({
      success: true,
      data: tickets,
      message: `Found ${tickets.length} tickets`
    });
  } catch (err) {
    console.error('❌ Error getting user tickets:', err);
    res.status(500).json({ 
      success: false, 
      error: "Failed to get user tickets",
      details: err instanceof Error ? err.message : 'Unknown error'
    });
  }
});

// Admin route to claim ticket by scanning QR code
router.post("/admin/claim", checkUserAuthToken, async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
  try {
    console.log('=== ADMIN CLAIM TICKET ROUTE CALLED ===');
    const { ticketId } = req.body;
    const userId = req.user?.uid;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    if (!ticketId) {
      return res.status(400).json({
        success: false,
        error: 'Ticket ID is required'
      });
    }

    // Check if user has admin role
    const { getUserRole } = await import('../services/userRoleService.js');
    const userRoleData = await getUserRole(userId);
    
    if (!userRoleData || userRoleData.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Admin privileges required'
      });
    }

    // Check if ticket exists
    const ticketDoc = await db.collection('tickets').doc(ticketId).get();
    if (!ticketDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Ticket not found'
      });
    }

    const ticketData = ticketDoc.data();
    if (!ticketData) {
      return res.status(404).json({
        success: false,
        error: 'Ticket data not found'
      });
    }

    // Check if ticket is already claimed
    if (ticketData.claimed) {
      return res.status(400).json({
        success: false,
        error: 'Ticket already claimed'
      });
    }

    // Update ticket status to claimed
    await db.collection('tickets').doc(ticketId).update({
      claimed: true
    });

    // Add user to event attendees if not already there
    const eventId = ticketData.eventId;
    const eventDoc = await db.collection('events').doc(eventId).get();
    if (eventDoc.exists) {
      const eventData = eventDoc.data();
      if (eventData) {
        const currentAttendees = eventData.attendees || [];
        if (!currentAttendees.includes(ticketData.userId)) {
          const updatedAttendees = [...currentAttendees, ticketData.userId];
          await db.collection('events').doc(eventId).update({
            attendees: updatedAttendees
          });
          console.log(`✅ Added user ${ticketData.userId} to event ${eventId} attendees via admin claim. Total attendees: ${updatedAttendees.length}`);
        }
      }
    }

    console.log('✅ Ticket claimed by admin:', ticketId);

    res.json({
      success: true,
      message: "Ticket claimed successfully",
      data: { ticketId, claimed: true }
    });
  } catch (err) {
    console.error('❌ Error claiming ticket:', err);
    res.status(500).json({ 
      success: false, 
      error: "Failed to claim ticket",
      details: err instanceof Error ? err.message : 'Unknown error'
    });
  }
});

export default router;
