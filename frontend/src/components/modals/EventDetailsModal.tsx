import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getEventPlaceholder, getPlaceholderImageFallback } from '../../utils/placeholderImages';
import { useAuth } from '../../hooks/useAuth';

interface Event {
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
}

interface EventDetailsModalProps {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
  onClaimTicket?: (eventId: string) => void;
  onTicketClaimed?: () => void;
  showClaimButton?: boolean;
}

const EventDetailsModal: React.FC<EventDetailsModalProps> = ({
  event,
  isOpen,
  onClose,
  onClaimTicket,
  onTicketClaimed,
  showClaimButton = true
}) => {
  const { user } = useAuth();
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimMessage, setClaimMessage] = useState('');
  if (!event) return null;

  const handleClaimTicket = async () => {
    if (!user || !event || !onClaimTicket) return;

    setIsClaiming(true);
    setClaimMessage('');

    try {
      console.log('🎫 Claiming ticket for event:', event.id);
      
      const token = await user.getIdToken();
      const response = await fetch('http://localhost:3002/tickets', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          eventId: event.id
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        console.log('✅ Ticket claimed successfully');
        setClaimMessage('Ticket claimed successfully!');
        
        // Call the callback to refresh data
        if (onTicketClaimed) {
          onTicketClaimed();
        }
        
        // Close modal after a short delay
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        console.error('❌ Failed to claim ticket:', result.error);
        setClaimMessage(`Failed to claim ticket: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('❌ Error claiming ticket:', error);
      setClaimMessage('Network error. Please try again.');
    } finally {
      setIsClaiming(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return 'Time TBD';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getAvailabilityStatus = () => {
    if (event.capacity === 0) return { text: 'Unlimited', color: '#27ae60' };
    const remaining = event.capacity - event.bookedCount;
    if (remaining <= 0) return { text: 'Sold Out', color: '#e74c3c' };
    if (remaining <= 5) return { text: `Only ${remaining} left`, color: '#f39c12' };
    return { text: `${remaining} spots available`, color: '#27ae60' };
  };

  const availability = getAvailabilityStatus();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="event-modal"
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            transition={{ type: "spring", duration: 0.5 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button className="modal-close-btn" onClick={onClose}>
              ✕
            </button>

            {/* Event Image */}
            <div className="event-modal-image">
              <img 
                src={event.imageUrl || event.image || getEventPlaceholder(600, 300)} 
                alt={event.title}
                onError={(e) => {
                  e.currentTarget.src = getPlaceholderImageFallback('event', 600, 300);
                }}
              />
              <div className="event-modal-badge">
                {event.type === 'free' ? 'FREE' : `$${event.fee || 10}`}
              </div>
            </div>

            {/* Event Content */}
            <div className="event-modal-content">
              <div className="event-modal-header">
                <h2 className="event-modal-title">{event.title}</h2>
                <div className="event-modal-category">{event.category}</div>
              </div>

              <div className="event-modal-details">
                <div className="detail-row">
                  <div className="detail-icon">📅</div>
                  <div className="detail-content">
                    <div className="detail-label">Date</div>
                    <div className="detail-value">{formatDate(event.date)}</div>
                  </div>
                </div>

                <div className="detail-row">
                  <div className="detail-icon">🕐</div>
                  <div className="detail-content">
                    <div className="detail-label">Time</div>
                    <div className="detail-value">{formatTime(event.time)}</div>
                  </div>
                </div>

                <div className="detail-row">
                  <div className="detail-icon">📍</div>
                  <div className="detail-content">
                    <div className="detail-label">Location</div>
                    <div className="detail-value">{event.location}</div>
                  </div>
                </div>

                <div className="detail-row">
                  <div className="detail-icon">👥</div>
                  <div className="detail-content">
                    <div className="detail-label">Availability</div>
                    <div 
                      className="detail-value" 
                      style={{ color: availability.color, fontWeight: '600' }}
                    >
                      {availability.text}
                    </div>
                  </div>
                </div>
              </div>

              <div className="event-modal-description">
                <h3>About This Event</h3>
                <p>{event.description}</p>
              </div>

              {event.tags && event.tags.length > 0 && (
                <div className="event-modal-tags">
                  <h3>Tags</h3>
                  <div className="tags-container">
                    {event.tags.map((tag, index) => (
                      <span key={index} className="tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="event-modal-actions">
                {showClaimButton && (
                  <button 
                    className="claim-btn"
                    onClick={handleClaimTicket}
                    disabled={availability.text === 'Sold Out' || isClaiming}
                  >
                    {isClaiming ? 'Claiming...' : availability.text === 'Sold Out' ? 'Sold Out' : 'Claim Ticket'}
                  </button>
                )}
                <button className="close-btn" onClick={onClose}>
                  Close
                </button>
              </div>

              {claimMessage && (
                <div className={`claim-message ${claimMessage.includes('successfully') ? 'success' : 'error'}`}>
                  {claimMessage}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EventDetailsModal;
