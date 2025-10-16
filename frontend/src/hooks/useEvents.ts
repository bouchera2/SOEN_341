import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { getCategoryPlaceholder } from '../utils/placeholderImages';

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  type: 'free' | 'paid';
  capacity: number;
  bookedCount: number;
  tags: string[];
  organizer: string;
  imageUrl?: string; // URL to image stored in Firebase Storage
  // For display purposes, we'll map backend fields to frontend expectations
  category?: string;
  image?: string; // Fallback/placeholder image
  fee?: number;
}

export const useEvents = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = async () => {
    if (!user) {
      console.log('❌ No user, skipping events fetch');
      setEvents([]);
      setLoading(false);
      return;
    }

    console.log('🔍 Starting events fetch...');
    setLoading(true);
    setError(null);

    try {
      console.log('🔍 Fetching all events...');
      
      const token = await user.getIdToken();
      console.log('🔑 Got auth token, making request...');
      
      const response = await fetch('http://localhost:3002/events/getAll', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', response.headers);

      if (!response.ok) {
        throw new Error(`Failed to fetch events: ${response.status}`);
      }

      const eventsData = await response.json();
      console.log('📅 Fetched events data:', eventsData);
      console.log('📅 Events data type:', typeof eventsData);
      console.log('📅 Events data length:', Array.isArray(eventsData) ? eventsData.length : 'Not an array');

      // Transform backend events to match frontend expectations
      console.log('🔄 Transforming events data...');
      const transformedEvents = eventsData.map((event: any) => ({
        id: event.id,
        title: event.title,
        description: event.description,
        date: event.date,
        time: event.time,
        location: event.location,
        type: event.type,
        capacity: event.capacity || 0,
        bookedCount: event.bookedCount || 0,
        tags: event.tags || [],
        organizer: event.organizer,
        imageUrl: event.imageUrl, // Use actual image URL from backend
        // Map tags to categories for filtering
        category: event.tags && event.tags.length > 0 ? event.tags[0] : 'General',
        // Use actual image URL if available, otherwise fallback to placeholder
        image: event.imageUrl || getEventImage(event.tags),
        // Map type to fee
        fee: event.type === 'paid' ? 10 : 0
      }));

      console.log('✅ Transformed events:', transformedEvents);
      console.log('✅ Setting events in state...');
      setEvents(transformedEvents);
    } catch (error) {
      console.error('❌ Error fetching events:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch events');
      setEvents([]);
    } finally {
      console.log('🏁 Events fetch completed, setting loading to false');
      setLoading(false);
    }
  };

  // Helper function to get appropriate placeholder image based on tags
  const getEventImage = (tags: string[]): string => {
    return getCategoryPlaceholder(tags, 400, 250);
  };

  useEffect(() => {
    fetchEvents();
  }, [user]);

  return {
    events,
    loading,
    error,
    refetch: fetchEvents
  };
};
