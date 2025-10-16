import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import CreateEventForm from '../forms/CreateEventForm';
import EventStatsModal from '../modals/EventStatsModal';
import { useAuth } from '../../hooks/useAuth';
import { useUserRole } from '../../hooks/useUserRole';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time?: string;
  location: string;
  type: 'paid' | 'free';
  capacity?: number;
  bookedCount?: number;
  tags?: string[];
  organizer: string;
  imageUrl?: string;
}

interface EventStats {
  eventId: string;
  totalTickets: number;
  claimedTickets: number;
  attendanceRate: number;
}

const ManageEventsPage: React.FC = () => {
  const { user } = useAuth();
  const { userRole, isOrganizer, loading: roleLoading } = useUserRole();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [eventStats, setEventStats] = useState<Record<string, EventStats>>({});
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [isExportingCSV, setIsExportingCSV] = useState(false);

  // Function to load organizer's events
  const loadOrganizerEvents = async () => {
    if (!user) return;

    setIsLoadingEvents(true);
    try {
      console.log('🔍 Loading organizer events...');
      
      // First, get the event IDs for this organizer
      const token = await user.getIdToken();
      const response = await fetch('http://localhost:3002/events/organizer', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch organizer events');
      }

      const result = await response.json();
      console.log('📋 Organizer event IDs:', result.data);

      if (result.data && result.data.length > 0) {
        // Now fetch the full event details for each ID
        const eventsResponse = await fetch('http://localhost:3002/events/by-ids', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ eventIds: result.data })
        });

        if (!eventsResponse.ok) {
          throw new Error('Failed to fetch event details');
        }

        const eventsResult = await eventsResponse.json();
        console.log('📅 Loaded events:', eventsResult.data);
        setEvents(eventsResult.data || []);
      } else {
        console.log('📭 No events found for organizer');
        setEvents([]);
      }
    } catch (error) {
      console.error('❌ Error loading organizer events:', error);
      setEvents([]);
    } finally {
      setIsLoadingEvents(false);
    }
  };

  // Check permission using useUserRole hook
  useEffect(() => {
    if (!roleLoading && user) {
      if (isOrganizer) {
        console.log('✅ User has organizer/admin permission');
        loadOrganizerEvents();
      } else {
        console.log('❌ User does not have organizer/admin permission');
      }
    }
  }, [user, isOrganizer, roleLoading]);

  // Load stats when events are loaded
  useEffect(() => {
    if (events.length > 0) {
      loadEventStats();
    }
  }, [events]);

  // Note: Removed periodic permission re-check as we now use useUserRole hook

  // Note: Removed handleCloseAlert as we no longer use showAccessDeniedAlert

  const handleEditEvent = (event: Event) => {
    setSelectedEvent(event);
    // For now, just show an alert - this will be replaced with edit functionality
    alert(`Edit event: ${event.title}`);
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!user) {
      alert('You must be logged in to delete events');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return;
    }

    try {
      console.log('🗑️ Deleting event:', eventId);
      
      const token = await user.getIdToken();
      const response = await fetch(`http://localhost:3002/events/delete/${eventId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (response.ok && result.success) {
        console.log('✅ Event deleted successfully');
        // Remove the event from the local state
        setEvents(prev => prev.filter(event => event.id !== eventId));
        alert('Event deleted successfully!');
      } else {
        console.error('❌ Failed to delete event:', result.error);
        alert(`Failed to delete event: ${result.error || result.details || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('❌ Error deleting event:', error);
      alert('Network error. Please try again.');
    }
  };

  // Function to fetch stats for all events
  const loadEventStats = async () => {
    if (!user || events.length === 0) return;

    setIsLoadingStats(true);
    try {
      const token = await user.getIdToken();
      const statsPromises = events.map(async (event) => {
        try {
          const response = await fetch(`http://localhost:3002/events/stats/${event.id}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            const result = await response.json();
            return { eventId: event.id, ...result.data };
          } else {
            console.error(`Failed to fetch stats for event ${event.id}`);
            return { eventId: event.id, totalTickets: 0, claimedTickets: 0, attendanceRate: 0 };
          }
        } catch (error) {
          console.error(`Error fetching stats for event ${event.id}:`, error);
          return { eventId: event.id, totalTickets: 0, claimedTickets: 0, attendanceRate: 0 };
        }
      });

      const statsResults = await Promise.all(statsPromises);
      const statsMap: Record<string, EventStats> = {};
      statsResults.forEach(stat => {
        statsMap[stat.eventId] = stat;
      });
      setEventStats(statsMap);
    } catch (error) {
      console.error('Error loading event stats:', error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const handleEventCreated = () => {
    // This will be called when a new event is created
    console.log('🎉 Event created successfully, reloading events...');
    loadOrganizerEvents();
  };

  const handleShowStats = (event: Event) => {
    setSelectedEvent(event);
    setShowStatsModal(true);
  };

  const handleCloseStatsModal = () => {
    setShowStatsModal(false);
    setSelectedEvent(null);
  };

  const handleExportCSV = async (eventId: string) => {
    if (!user) return;

    setIsExportingCSV(true);
    try {
      const token = await user.getIdToken();
      const response = await fetch(`http://localhost:3002/events/${eventId}/export-attendees`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `event-${eventId}-attendees.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Failed to export CSV');
      }
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('Error exporting CSV');
    } finally {
      setIsExportingCSV(false);
    }
  };

  // Show loading state while checking role
  if (roleLoading) {
    return (
      <div className="manage-events-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Checking permissions...</p>
        </div>
      </div>
    );
  }

  // Show access denied if no permission
  if (!isOrganizer) {
    return (
      <div className="manage-events-page">
        <div className="access-denied-container">
          <div className="access-denied-icon">🔒</div>
          <h1>Access Restricted</h1>
          <p>Managing events is restricted to organizers and admins.</p>
          <p>Please request organizer role in your profile settings.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <motion.div
        className="manage-events-page"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
      {/* Note: Removed popup alert as we now use direct access denied page */}
      <div className="manage-events-container">
        <div className="manage-events-header">
          <h1 className="manage-events-title">Manage Events</h1>
          <p className="manage-events-subtitle">
            Create new events and manage existing ones
          </p>
        </div>

        <div className="manage-events-content">
          {/* Left Panel - Event List */}
          <div className="events-panel">
            <div className="panel-header">
              <h2>Your Events ({events.length})</h2>
            </div>
            
            <div className="events-list">
              {isLoadingEvents ? (
                <div className="loading-container">
                  <div className="loading-spinner"></div>
                  <p>Loading your events...</p>
                </div>
              ) : events.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">📅</div>
                  <h3>No events yet</h3>
                  <p>Create your first event to get started!</p>
                </div>
              ) : (
                events.map((event) => (
                  <motion.div
                    key={event.id}
                    className="event-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="event-card-header">
                      <h3 className="event-title">{event.title}</h3>
                      <div className={`event-type-badge ${event.type}`}>
                        {event.type === 'paid' ? '💰 Paid' : '🆓 Free'}
                      </div>
                    </div>
                    
                    <p className="event-description">{event.description}</p>
                    
                    <div className="event-details">
                      <div className="event-detail">
                        <span className="detail-label">📅 Date:</span>
                        <span>{event.date}</span>
                      </div>
                      {event.time && (
                        <div className="event-detail">
                          <span className="detail-label">🕐 Time:</span>
                          <span>{event.time}</span>
                        </div>
                      )}
                      <div className="event-detail">
                        <span className="detail-label">📍 Location:</span>
                        <span>{event.location}</span>
                      </div>
                      <div className="event-detail">
                        <span className="detail-label">👥 Capacity:</span>
                        <span>{event.bookedCount || 0}/{event.capacity || 'Unlimited'}</span>
                      </div>
                    </div>


                    {event.tags && event.tags.length > 0 && (
                      <div className="event-tags">
                        {event.tags.map((tag, index) => (
                          <span key={index} className="tag">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="event-actions">
                      <button
                        className="stats-btn"
                        onClick={() => handleShowStats(event)}
                      >
                        📊 Statistics
                      </button>
                      <button
                        className="edit-btn"
                        onClick={() => handleEditEvent(event)}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => handleDeleteEvent(event.id)}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          {/* Right Panel - Create Event Form */}
          <div className="create-event-panel">
            <div className="panel-header">
              <h2>Create New Event</h2>
            </div>
            <CreateEventForm onEventCreated={handleEventCreated} />
          </div>
        </div>
      </div>
      </motion.div>

      {/* Event Statistics Modal */}
      <EventStatsModal
        event={selectedEvent}
        stats={selectedEvent ? eventStats[selectedEvent.id] : null}
        isOpen={showStatsModal}
        onClose={handleCloseStatsModal}
        onExportCSV={handleExportCSV}
        isExporting={isExportingCSV}
      />
    </>
  );
};

export default ManageEventsPage;
