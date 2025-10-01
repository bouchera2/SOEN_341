import express from 'express';
import { getAllEvents } from './eventsCreation';


const router = express.Router();

// GET /events - Retrieve all events as JSON
router.get('/events', async (req, res) => {
    try {
        const events = await getAllEvents();
        res.json(events);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve events.' });
    }
});

export default router;