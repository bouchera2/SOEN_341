import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

export interface Ticket {
  id: string;
  eventId: string;
  userId: string;
  claimed: boolean;
  qrCode: string;
}

export interface TicketWithEvent extends Ticket {
  event: {
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
    imageUrl?: string;
    category?: string;
    image?: string;
    fee?: number;
  };
}

export const useTickets = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [ticketsWithEvents, setTicketsWithEvents] = useState<TicketWithEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTickets = async () => {
    if (!user) {
      setTickets([]);
      setTicketsWithEvents([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🎫 Fetching user tickets...');
      
      const token = await user.getIdToken();
      const response = await fetch('http://localhost:3002/tickets/user', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch tickets: ${response.status}`);
      }

      const result = await response.json();
      console.log('🎫 Fetched tickets:', result.data);

      if (result.success && result.data) {
        console.log('🎫 Raw tickets data:', result.data);
        setTickets(result.data);
        
        // Fetch event details for each ticket
        const ticketsWithEventData = await Promise.all(
          result.data.map(async (ticket: Ticket) => {
            try {
              console.log(`🔍 Fetching event details for ticket ${ticket.id}, eventId: ${ticket.eventId}`);
              const eventResponse = await fetch(`http://localhost:3002/events/${ticket.eventId}`, {
                method: 'GET',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              });

              if (eventResponse.ok) {
                const eventResult = await eventResponse.json();
                console.log(`✅ Event details fetched for ${ticket.eventId}:`, eventResult.data?.title);
                return {
                  ...ticket,
                  event: eventResult.data
                };
              } else {
                console.error(`❌ Failed to fetch event ${ticket.eventId}, status:`, eventResponse.status);
                return null;
              }
            } catch (error) {
              console.error(`❌ Error fetching event ${ticket.eventId}:`, error);
              return null;
            }
          })
        );

        // Filter out null results
        const validTicketsWithEvents = ticketsWithEventData.filter(ticket => ticket !== null) as TicketWithEvent[];
        console.log('🎫 Final tickets with events:', validTicketsWithEvents);
        setTicketsWithEvents(validTicketsWithEvents);
      } else {
        setTickets([]);
        setTicketsWithEvents([]);
      }
    } catch (error) {
      console.error('❌ Error fetching tickets:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch tickets');
      setTickets([]);
      setTicketsWithEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [user]);

  return {
    tickets,
    ticketsWithEvents,
    loading,
    error,
    refetch: fetchTickets
  };
};
