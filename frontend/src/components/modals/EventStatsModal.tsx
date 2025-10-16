import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface EventStats {
  eventId: string;
  totalTickets: number;
  claimedTickets: number;
  attendanceRate: number;
}

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

interface EventStatsModalProps {
  event: Event | null;
  stats: EventStats | null;
  isOpen: boolean;
  onClose: () => void;
  onExportCSV: (eventId: string) => void;
  isExporting: boolean;
}

const EventStatsModal: React.FC<EventStatsModalProps> = ({
  event,
  stats,
  isOpen,
  onClose,
  onExportCSV,
  isExporting
}) => {
  if (!event) return null;

  const handleExportCSV = () => {
    onExportCSV(event.id);
  };

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
            className="event-stats-modal"
            initial={{ y: "-100vh", opacity: 0 }}
            animate={{ y: "0", opacity: 1 }}
            exit={{ y: "100vh", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 500 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button className="modal-close-btn" onClick={onClose}>
              ✕
            </button>

            <div className="stats-modal-header">
              <h2 className="stats-modal-title">📊 Event Statistics</h2>
              <h3 className="event-title">{event.title}</h3>
            </div>

            <div className="stats-modal-content">
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">🎫</div>
                  <div className="stat-info">
                    <div className="stat-label">Tickets Issued</div>
                    <div className="stat-value">{stats?.totalTickets || 0}</div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">✅</div>
                  <div className="stat-info">
                    <div className="stat-label">Attended</div>
                    <div className="stat-value">{stats?.claimedTickets || 0}</div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">📈</div>
                  <div className="stat-info">
                    <div className="stat-label">Attendance Rate</div>
                    <div className="stat-value">{stats?.attendanceRate || 0}%</div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">👥</div>
                  <div className="stat-info">
                    <div className="stat-label">Capacity</div>
                    <div className="stat-value">
                      {event.capacity ? `${event.bookedCount || 0}/${event.capacity}` : 'Unlimited'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="event-details-section">
                <h4>Event Details</h4>
                <div className="event-details-grid">
                  <div className="detail-item">
                    <span className="detail-label">📅 Date:</span>
                    <span className="detail-value">{event.date}</span>
                  </div>
                  {event.time && (
                    <div className="detail-item">
                      <span className="detail-label">🕐 Time:</span>
                      <span className="detail-value">{event.time}</span>
                    </div>
                  )}
                  <div className="detail-item">
                    <span className="detail-label">📍 Location:</span>
                    <span className="detail-value">{event.location}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">💰 Type:</span>
                    <span className="detail-value">{event.type === 'paid' ? 'Paid Event' : 'Free Event'}</span>
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button 
                  className="export-btn"
                  onClick={handleExportCSV}
                  disabled={isExporting}
                >
                  {isExporting ? '⏳ Exporting...' : '📊 Export Attendees CSV'}
                </button>
                <button className="close-btn" onClick={onClose}>
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EventStatsModal;
