import React from 'react';
import { motion } from 'framer-motion';
import QRCode from 'react-qr-code';
import { useAuth } from '../../hooks/useAuth';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();

  return (
    <motion.main
      className="profile-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="profile-card">
        <h2>My Profile</h2>
        <p>
          <strong>Email:</strong> {user?.email}
        </p>
        <h3>My Tickets 🎟️</h3>
        <div className="ticket-display">
          <QRCode value={`Ticket for ${user?.email}`} size={128} />
          <p>Example QR Code Ticket</p>
        </div>
      </div>
    </motion.main>
  );
};

export default ProfilePage;
