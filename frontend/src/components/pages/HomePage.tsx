import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import EventDetailsModal from '../modals/EventDetailsModal';
import { getEventPlaceholder, getPlaceholderImageFallback } from '../../utils/placeholderImages';

interface HomePageProps {
  filteredEvents: any[];
  filter: string;
  setFilter: (filter: string) => void;
  loading?: boolean;
  error?: string | null;
  onRefetch?: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ 
  filteredEvents, 
  filter, 
  setFilter, 
  loading = false, 
  error = null, 
  onRefetch 
}) => {
  const navigate = useNavigate();
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleEventClick = (event: any) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  const handleClaimTicket = (eventId: string) => {
    console.log('Claiming ticket for event:', eventId);
    // TODO: Implement actual ticket claiming logic
    alert(`Claiming ticket for event: ${eventId}`);
  };

  return (
    <motion.main
      className="event-section"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
    >
      <div className="section-header">
        <h2 className="section-title">Upcoming Events</h2>
        {onRefetch && (
          <button 
            className="refresh-btn" 
            onClick={onRefetch}
            disabled={loading}
            title="Refresh events"
          >
            🔄
          </button>
        )}
      </div>

      <div className="filter-bar">
        {["All", "Sports", "Technology", "Music", "Competition"].map((cat) => (
          <button
            key={cat}
            className={`filter-btn ${filter === cat ? "active" : ""}`}
            onClick={() => setFilter(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading events...</p>
        </div>
      ) : error ? (
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h3>Failed to load events</h3>
          <p>{error}</p>
          {onRefetch && (
            <button className="retry-btn" onClick={onRefetch}>
              Try Again
            </button>
          )}
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📅</div>
          <h3>No events found</h3>
          <p>Try adjusting your search or filter criteria.</p>
        </div>
      ) : (
        <div className="event-grid">
          {filteredEvents.map((event: any, index: number) => (
            <motion.div
              key={event.id}
              className="event-card"
              whileHover={{ scale: 1.05 }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              onClick={() => handleEventClick(event)}
            >
              <img 
                src={event.image || getEventPlaceholder(400, 250)} 
                alt={event.title} 
                className="event-img"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.src = getPlaceholderImageFallback('event', 400, 250);
                }}
              />
              <div className="event-content">
                <h3>{event.title}</h3>
                <p className="event-category">{event.category}</p>
                <p className="event-location">📍 {event.location}</p>
                <p className="event-date">📅 {event.date}</p>
                <p className="event-fee">
                  {event.fee === 0 ? 'Free' : `$${event.fee}`}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Event Details Modal */}
          <EventDetailsModal
            event={selectedEvent}
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            onClaimTicket={handleClaimTicket}
            onTicketClaimed={onRefetch}
          />
    </motion.main>
  );
};

export default HomePage;
