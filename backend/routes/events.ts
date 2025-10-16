import express, { Request, Response } from "express";
import { checkEventCreationPermission } from "../middleware/roleCheck.js";
import { checkUserAuthToken } from "../middleware/userAuth.js";
import { ApiResponse, Event, AuthenticatedRequest } from "../types/index.js";
import { db } from "../database/firestore.js";
import { getUserRole } from "../services/userRoleService.js";


const router = express.Router();


router.post('/create', checkUserAuthToken, checkEventCreationPermission, async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
  console.log('=== EVENT CREATION ROUTE CALLED ===');
  console.log('Request body:', req.body);
  console.log('Authenticated user:', req.user?.uid);
  
  const eventDetails: Event = {
    title: req.body.title, 
    description: req.body.description,
    date: req.body.date,
    time: req.body.time,
    location: req.body.location,
    organizer: req.user?.uid || '', // Use authenticated user's ID as organizer
    attendees: req.body.attendees || [], // Array of user IDs
    tags: req.body.tags || [], // Tags for event sorting
    type: req.body.type, // Paid or free
    capacity: req.body.capacity || 0, // Event capacity
    bookedCount: req.body.bookedCount || 0, // How many users have signed up
    imageUrl: req.body.imageUrl || undefined, // URL to image in Firebase Storage
  };

  // Validate event details
  const validation = validateEvent(eventDetails);
  if (!validation.isValid) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: validation.errors.join(', ')
    });
  }

  try {
    const eventRef = await db.collection('events').add({
      ...eventDetails,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const eventId = eventRef.id;
    console.log('Event created with ID:', eventId);
    console.log('Event organizer ID:', eventDetails.organizer);

    res.json({ 
      success: true,
      details: 'Event created successfully',
      data: {
        id: eventId,
        ...eventDetails
      }
    });
  } catch (error) {
    console.error('Error creating event:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    res.status(500).json({
      success: false,
      error: 'Failed to create event',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /events - Get all events
router.get('/getAll', async (req: Request, res: Response) => {
  try {
    console.log('🔍 Fetching all events from database...');
    const snapshot = await db.collection('events').get();
    
    if (snapshot.empty) {
      console.log('📭 No events found in database');
      return res.json([]);
    }

    const events: Event[] = [];
    snapshot.forEach((doc) => {
      events.push({ id: doc.id, ...(doc.data() as Event) });
    });
    
    console.log(`📅 Found ${events.length} events in database`);
    res.json(events);
  } catch (error) {
    console.error('❌ Error retrieving events:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve events',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /events/organizer - Get events belonging to the authenticated organizer
router.get('/organizer', checkUserAuthToken, checkEventCreationPermission, async (req: AuthenticatedRequest, res: Response) => {
  try {
    console.log('=== GET ORGANIZER EVENTS ROUTE CALLED ===');
    console.log('Organizer ID:', req.user?.uid);
    
    const organizerId = req.user?.uid;
    if (!organizerId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const snapshot = await db.collection('events')
      .where('organizer', '==', organizerId)
      .get();

    if (snapshot.empty) {
      console.log('No events found for organizer:', organizerId);
      return res.json({
        success: true,
        data: [],
        message: 'No events found for this organizer'
      });
    }

    const eventIds: string[] = [];
    snapshot.forEach((doc) => {
      eventIds.push(doc.id);
    });

    console.log(`Found ${eventIds.length} events for organizer ${organizerId}`);
    console.log('Event IDs:', eventIds);

    res.json({
      success: true,
      data: eventIds,
      message: `Found ${eventIds.length} events for organizer`
    });
  } catch (error) {
    console.error('Error retrieving organizer events:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve organizer events',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /events/:id - Get single event by ID
router.get('/:id', checkUserAuthToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    console.log('=== GET SINGLE EVENT ROUTE CALLED ===');
    const { id } = req.params;
    console.log('Event ID:', id);

    const doc = await db.collection('events').doc(id).get();
    
    if (!doc.exists) {
      console.log('❌ Event not found:', id);
      return res.status(404).json({
        success: false,
        error: 'Event not found',
        details: `No event found with id ${id}`
      });
    }

    const eventData = doc.data();
    if (!eventData) {
      console.log('❌ Event data is null');
      return res.status(404).json({
        success: false,
        error: 'Event data not found'
      });
    }

    const event = { id: doc.id, ...eventData } as Event;
    console.log('✅ Event retrieved:', event.title);

    res.json({
      success: true,
      data: event,
      message: 'Event retrieved successfully'
    });
  } catch (error) {
    console.error('❌ Error retrieving event:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve event',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /events/by-ids - Get multiple events by their IDs
router.post('/by-ids', checkUserAuthToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    console.log('=== GET EVENTS BY IDS ROUTE CALLED ===');
    const { eventIds } = req.body;
    
    if (!eventIds || !Array.isArray(eventIds) || eventIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Event IDs array is required'
      });
    }

    console.log('Requested event IDs:', eventIds);

    const events: Event[] = [];
    const promises = eventIds.map(async (id: string) => {
      try {
        const doc = await db.collection('events').doc(id).get();
        if (doc.exists) {
          const eventData = doc.data();
          if (eventData) {
            events.push({ id: doc.id, ...eventData } as Event);
          }
        }
      } catch (error) {
        console.error(`Error fetching event ${id}:`, error);
      }
    });

    await Promise.all(promises);

    console.log(`Successfully retrieved ${events.length} events`);

    res.json({
      success: true,
      data: events,
      message: `Retrieved ${events.length} events`
    });
  } catch (error) {
    console.error('Error retrieving events by IDs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve events',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /events/:id - Get specific event
router.get('/get::id', async (req: Request<{ id: string }>, res: Response) => {
  const { id } = req.params;

  try {
    const doc = await db.collection('events').doc(id).get();
   
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Event not found',
        details: `No event found with id ${id}`
      });
    }

    const eventData = doc.data();
    if (!eventData) {
      return res.status(500).json({
        success: false,
        error: 'Failed to retrieve event',
        details: `Event ${id} returned no data`
      });
    }

    res.json(eventData);
  } catch (error) {
    console.error(`Error retrieving event ${id}:`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve event',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /events/stats/:eventId - Get ticket statistics for a specific event
router.get('/stats/:eventId', checkUserAuthToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { eventId } = req.params;
    const userId = req.user?.uid;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    // Check if user has permission to view stats (organizer or admin)
    const userRoleData = await getUserRole(userId);
    if (!userRoleData || !(['admin', 'organizer'].includes(userRoleData.role))) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      });
    }

    // Get the event to verify ownership (organizers can only see their own events)
    const eventDoc = await db.collection('events').doc(eventId).get();
    if (!eventDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }

    const eventData = eventDoc.data();
    
    // If user is organizer (not admin), check if they own this event
    if (userRoleData.role === 'organizer' && eventData?.organizer !== userId) {
      return res.status(403).json({
        success: false,
        error: 'You can only view stats for your own events'
      });
    }

    // Get all tickets for this event
    console.log(`🔍 Fetching tickets for event: ${eventId}`);
    const ticketsSnapshot = await db.collection('tickets')
      .where('eventId', '==', eventId)
      .get();

    console.log(`📊 Found ${ticketsSnapshot.size} tickets for event ${eventId}`);
    
    const totalTickets = ticketsSnapshot.size;
    const claimedTickets = ticketsSnapshot.docs.filter(doc => {
      const data = doc.data();
      console.log(`🎫 Ticket ${doc.id}: claimed=${data.claimed}`);
      return data.claimed === true;
    }).length;
    
    console.log(`📈 Stats for event ${eventId}: total=${totalTickets}, claimed=${claimedTickets}`);

    res.json({
      success: true,
      data: {
        eventId,
        totalTickets,
        claimedTickets,
        attendanceRate: totalTickets > 0 ? Math.round((claimedTickets / totalTickets) * 100) : 0
      }
    });
  } catch (error) {
    console.error('Error fetching event stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch event statistics',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;

router.delete('/delete/:id', checkUserAuthToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    console.log('=== DELETE EVENT ROUTE CALLED ===');
    const { id } = req.params;
    console.log('Event ID to delete:', id);
    console.log('User requesting deletion:', req.user?.uid);

    if (!req.user?.uid) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    // Get the event document
    const eventDoc = await db.collection('events').doc(id).get();
    
    if (!eventDoc.exists) {
      console.log('❌ Event not found:', id);
      return res.status(404).json({
        success: false,
        error: 'Event not found',
        details: `No event found with id ${id}`
      });
    }

    const eventData = eventDoc.data();
    if (!eventData) {
      console.log('❌ Event data is null');
      return res.status(404).json({
        success: false,
        error: 'Event data not found'
      });
    }

    // Check if the user is the organizer of this event
    const eventOrganizer = eventData.organizer;
    const requestingUser = req.user.uid;

    console.log('Event organizer:', eventOrganizer);
    console.log('Requesting user:', requestingUser);

    if (eventOrganizer !== requestingUser) {
      console.log('❌ Permission denied - user is not the organizer');
      return res.status(403).json({
        success: false,
        error: 'Permission denied',
        details: 'Only the event organizer can delete this event'
      });
    }

    // Delete the event and all related tickets
    console.log('✅ Permission granted, deleting event and related tickets...');
    
    // First, find and delete all tickets for this event
    const ticketsSnapshot = await db.collection('tickets')
      .where('eventId', '==', id)
      .get();
    
    console.log(`🗑️ Found ${ticketsSnapshot.size} tickets to delete for event ${id}`);
    
    // Delete all tickets in batch
    const batch = db.batch();
    ticketsSnapshot.forEach((ticketDoc) => {
      batch.delete(ticketDoc.ref);
    });
    
    // Delete the event
    batch.delete(db.collection('events').doc(id));
    
    // Commit the batch deletion
    await batch.commit();
    
    console.log('✅ Event and all related tickets deleted successfully');
    res.json({ 
      success: true,
      message: 'Event and all related tickets deleted successfully',
      data: { 
        deletedEventId: id,
        deletedTicketsCount: ticketsSnapshot.size
      }
    });
    
  } catch (error) {
    console.error('❌ Error deleting event:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete event',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Validation function
const validateEvent = (event: Event): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Required fields
  if (!event.title?.trim()) errors.push('title is required');
  if (!event.description?.trim()) errors.push('description is required');
  if (!event.date?.trim()) errors.push('date is required');
  if (!event.location?.trim()) errors.push('location is required');
  if (!event.organizer?.trim()) errors.push('organizer is required');
  if (!event.type) errors.push('type is required');
  
  // Date validation
  if (event.date && isNaN(Date.parse(event.date))) {
    errors.push('date must be a valid ISO date string');
  }
  
  // Type validation
  if (event.type && !['paid', 'free'].includes(event.type)) {
    errors.push('type must be either "paid" or "free"');
  }

  
  // Numeric validations
  if (event.capacity && event.capacity < 1) {
    errors.push('capacity must be greater than 0');
  }
  
  if (event.bookedCount && event.bookedCount < 0) {
    errors.push('bookedCount cannot be negative');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};
