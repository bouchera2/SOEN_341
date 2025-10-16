import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTickets, TicketWithEvent } from '../../hooks/useTickets';
import EventDetailsModal from '../modals/EventDetailsModal';
import TicketModal from '../modals/TicketModal';
import { getEventPlaceholder } from '../../utils/placeholderImages';

const MyEventsPage: React.FC = () => {
  const { ticketsWithEvents, loading, error, refetch } = useTickets();
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [selectedTicket, setSelectedTicket] = useState<TicketWithEvent | null>(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);

  // Debug logging
  console.log('🎫 MyEventsPage - ticketsWithEvents:', ticketsWithEvents);
  console.log('🎫 MyEventsPage - loading:', loading);
  console.log('🎫 MyEventsPage - error:', error);

  const handleViewEvent = (ticket: TicketWithEvent) => {
    setSelectedEvent(ticket.event);
    setIsEventModalOpen(true);
  };

  const handleViewTicket = (ticket: TicketWithEvent) => {
    setSelectedTicket(ticket);
    setIsTicketModalOpen(true);
  };

  const handleCloseEventModal = () => {
    setIsEventModalOpen(false);
    setSelectedEvent(null);
  };

  const handleCloseTicketModal = () => {
    setIsTicketModalOpen(false);
    setSelectedTicket(null);
  };

  const handleTicketClaimed = () => {
    // Refresh tickets when a new one is claimed
    refetch();
  };

  if (loading) {
    return (
      <motion.main
        className="my-events-page"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your events...</p>
        </div>
      </motion.main>
    );
  }

  if (error) {
    return (
      <motion.main
        className="my-events-page"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h3>Failed to load events</h3>
          <p>{error}</p>
          <button className="retry-btn" onClick={refetch}>
            Try Again
          </button>
        </div>
      </motion.main>
    );
  }

  return (
    <motion.main
      className="my-events-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="my-events-header">
        <h2 className="section-title">My Events</h2>
        <button className="refresh-btn" onClick={refetch} title="Refresh events">
          🔄
        </button>
      </div>

      {ticketsWithEvents.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🎫</div>
          <h3>No tickets yet</h3>
          <p>You haven't claimed any event tickets yet.</p>
          <p>Browse events on the home page to get started!</p>
        </div>
      ) : (
        <div className="tickets-grid">
          {ticketsWithEvents.map((ticket, index) => (
            <motion.div
              key={ticket.id}
              className="ticket-card"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <div className="ticket-card-image">
                <img
                  src={ticket.event.imageUrl || ticket.event.image || getEventPlaceholder(400, 250)}
                  alt={ticket.event.title}
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.src = getEventPlaceholder(400, 250);
                  }}
                />
                <div className="ticket-status-badge">
                  {ticket.claimed ? '✅ Claimed' : '⏳ Unclaimed'}
                </div>
              </div>
              
              <div className="ticket-card-content">
                <h3 className="ticket-event-title">{ticket.event.title}</h3>
                <p className="ticket-event-date">📅 {new Date(ticket.event.date).toLocaleDateString()}</p>
                <p className="ticket-event-location">📍 {ticket.event.location}</p>
                
                {ticket.event.tags && ticket.event.tags.length > 0 && (
                  <div className="ticket-event-tags">
                    {ticket.event.tags.map((tag, index) => (
                      <span key={index} className="ticket-tag">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="ticket-card-actions">
                <button
                  className="view-event-btn"
                  onClick={() => handleViewEvent(ticket)}
                >
                  View Event
                </button>
                <button
                  className="view-ticket-btn"
                  onClick={() => handleViewTicket(ticket)}
                >
                  View Ticket
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Event Details Modal */}
      <EventDetailsModal
        event={selectedEvent}
        isOpen={isEventModalOpen}
        onClose={handleCloseEventModal}
        onTicketClaimed={handleTicketClaimed}
        showClaimButton={false}
      />

      {/* Ticket QR Modal */}
      <TicketModal
        ticket={selectedTicket}
        event={selectedTicket?.event || null}
        isOpen={isTicketModalOpen}
        onClose={handleCloseTicketModal}
      />
    </motion.main>
  );
};

export default MyEventsPage;
