import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { useUserRole } from '../../hooks/useUserRole';
import { useNavigate } from 'react-router-dom';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const { userRole, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      onClose();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleRequestOrganizer = async () => {
    const message = prompt('Please provide a message explaining why you want organizer access:');
    if (!message || message.trim().length === 0) {
      return;
    }

    try {
      const token = await user?.getIdToken();
      const response = await fetch('http://localhost:3002/organizer-requests/request', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: message.trim() })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        alert('Organizer request submitted successfully! An admin will review your request.');
      } else {
        alert(`Failed to submit request: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error submitting organizer request:', error);
      alert('Network error. Please try again.');
    }
  };


  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      alert('Account deletion feature coming soon!');
    }
  };

  const handleMyEvents = () => {
    navigate('/myevents');
    onClose();
  };

  const handleBilling = () => {
    alert('Billing feature coming soon!');
  };

  if (!isOpen || !user) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="profile-modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="profile-modal"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 500 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="profile-modal-header">
            <div className="profile-avatar-large">
              {user.email?.[0]?.toUpperCase()}
            </div>
            <div className="profile-info">
              <h2 className="profile-name">{user.displayName || user.email?.split('@')[0] || 'User'}</h2>
              <p className="profile-email">{user.email}</p>
              <div className="profile-role">
                <span className={`role-badge ${userRole}`}>
                  {roleLoading ? 'Loading...' : userRole?.toUpperCase() || 'STUDENT'}
                </span>
              </div>
            </div>
            <button className="profile-close-btn" onClick={onClose}>
              ✕
            </button>
          </div>

          {/* Content */}
          <div className="profile-modal-content">
            {/* Quick Actions */}
            <div className="profile-section">
              <h3 className="section-title">Quick Actions</h3>
              <div className="action-buttons">
                <button className="action-btn primary" onClick={handleMyEvents}>
                  <span className="btn-icon">📅</span>
                  My Events
                </button>
                <button className="action-btn secondary" onClick={handleBilling}>
                  <span className="btn-icon">💳</span>
                  Billing
                </button>
              </div>
            </div>

            {/* Account Management */}
            <div className="profile-section">
              <h3 className="section-title">Account Management</h3>
              <div className="account-actions">
                {/* Show request button for students or users without admin/organizer roles */}
                {(!roleLoading && userRole !== 'admin' && userRole !== 'organizer') && (
                  <button className="account-btn request-organizer" onClick={handleRequestOrganizer}>
                    <span className="btn-icon">👑</span>
                    Request Organizer Status
                  </button>
                )}
                <button className="account-btn danger" onClick={handleDeleteAccount}>
                  <span className="btn-icon">🗑️</span>
                  Delete Account
                </button>
              </div>
            </div>

            {/* User Stats */}
            <div className="profile-section">
              <h3 className="section-title">Account Information</h3>
              <div className="user-stats">
                <div className="stat-item">
                  <span className="stat-label">Account Type:</span>
                  <span className="stat-value">{userRole === 'admin' ? 'Administrator' : userRole === 'organizer' ? 'Organizer' : 'Student'}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Member Since:</span>
                  <span className="stat-value">
                    {user.metadata?.creationTime ? 
                      new Date(user.metadata.creationTime).toLocaleDateString() : 
                      'Unknown'
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="profile-modal-footer">
            <button className="logout-btn" onClick={handleLogout}>
              <span className="btn-icon">⎋</span>
              Sign Out
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ProfileModal;
