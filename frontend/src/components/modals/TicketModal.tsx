import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Ticket {
  id: string;
  eventId: string;
  userId: string;
  claimed: boolean;
  qrCode: string;
}

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

interface TicketModalProps {
  ticket: Ticket | null;
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
}

const TicketModal: React.FC<TicketModalProps> = ({ ticket, event, isOpen, onClose }) => {
  if (!isOpen || !ticket || !event) return null;

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
    if (!timeString) return 'N/A';
    const time = new Date(`2000-01-01T${timeString}`);
    return time.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <AnimatePresence>
      <motion.div
        className="modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="ticket-modal"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 500 }}
          onClick={(e) => e.stopPropagation()}
        >
          <button className="modal-close-btn" onClick={onClose}>
            ✕
          </button>

          <div className="ticket-modal-header">
            <h2>Your Ticket</h2>
            <div className="ticket-status">
              <span className={`status-badge ${ticket.claimed ? 'claimed' : 'unclaimed'}`}>
                {ticket.claimed ? 'Claimed' : 'Unclaimed'}
              </span>
            </div>
          </div>

          <div className="ticket-modal-content">
            {/* Event Info */}
            <div className="ticket-event-info">
              <h3 className="event-title">{event.title}</h3>
              <div className="event-details">
                <div className="detail-item">
                  <span className="detail-icon">📅</span>
                  <span className="detail-text">{formatDate(event.date)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-icon">🕐</span>
                  <span className="detail-text">{formatTime(event.time)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-icon">📍</span>
                  <span className="detail-text">{event.location}</span>
                </div>
              </div>
            </div>

            {/* QR Code */}
            <div className="ticket-qr-section">
              <h4>QR Code</h4>
              <div className="qr-container">
                <img 
                  src={ticket.qrCode} 
                  alt="Ticket QR Code" 
                  className="qr-code"
                />
              </div>
              <p className="qr-instructions">
                Show this QR code at the event entrance for check-in
              </p>
            </div>

            {/* Ticket Details */}
            <div className="ticket-details">
              <div className="ticket-info-item">
                <span className="info-label">Ticket ID:</span>
                <span className="info-value">{ticket.id}</span>
              </div>
              <div className="ticket-info-item">
                <span className="info-label">Status:</span>
                <span className="info-value">{ticket.claimed ? 'Claimed' : 'Unclaimed'}</span>
              </div>
              <div className="ticket-info-item">
                <span className="info-label">Event Type:</span>
                <span className="info-value">{event.type === 'free' ? 'Free' : `$${event.fee || 10}`}</span>
              </div>
            </div>
          </div>

          <div className="ticket-modal-footer">
            <button className="close-ticket-btn" onClick={onClose}>
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default TicketModal;
