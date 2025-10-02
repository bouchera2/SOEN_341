import express, { Request, Response } from "express";
import { checkEventCreationPermission } from "../middleware/roleCheck.js";
import { ApiResponse, Event } from "../types/index.js";
import { db } from "../database/firestore.js";
import { checkUserAuthToken } from "../middleware/userAuth.js";


const router = express.Router();


router.post('/', checkUserAuthToken, checkEventCreationPermission, async (req: Request<{}, {}, Event>, res: Response<ApiResponse>) => {

  console.log('Request body:', req.body);
  
  const eventDetails: Event = {
    title: req.body.title, 
    description: req.body.description,
    date: req.body.date,
    time: req.body.time,
    location: req.body.location,
    organizer: req.body.organizer, // ID of organizer
    attendees: req.body.attendees, // Array of user IDs
    tags: req.body.tags, // Tags for event sorting
    type: req.body.type, // Paid or free
    capacity: req.body.capacity, // Event capacity
    bookedCount: req.body.bookedCount, // How many users have signed up
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
router.get('/', async (req: Request, res: Response<ApiResponse<Event[]>>) => {
  try {
    const events = await getAllEvents();
    res.json({
      success: true,
      data: events,
      details: 'Events retrieved successfully'
    });
  } catch (error) {
    console.error('Error retrieving events:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve events',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export async function getAllEvents(): Promise<Event[]> {
  const snapshot = await db.collection('events').get();
  if (snapshot.empty) {
    return [];
  }

  const events: Event[] = [];
  snapshot.forEach((doc) => {
    events.push({ id: doc.id, ...(doc.data() as Event) });
  });
  return events;
}

// GET /events/:id - Get specific event
router.get('/:id', async (req: Request<{ id: string }>, res: Response<ApiResponse<Event>>) => {
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

    res.json({
      success: true,
      data: { id: doc.id, ...(eventData as Event) },
      details: `Event ${id} retrieved successfully`
    });
  } catch (error) {
    console.error(`Error retrieving event ${id}:`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve event',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;


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
