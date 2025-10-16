import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useUserRole } from '../../hooks/useUserRole';
import ProfileModal from '../modals/ProfileModal';

interface NavbarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ searchQuery, setSearchQuery }) => {
  const { user } = useAuth();
  const { isOrganizer, isAdmin, loading: roleLoading, userRole } = useUserRole();
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Debug logging
  console.log('🔍 Navbar - User role check:', { 
    user: !!user, 
    userRole, 
    isOrganizer, 
    isAdmin,
    roleLoading 
  });

  const handleProfileClick = () => {
    setShowProfileModal(true);
  };

  const handleCloseProfile = () => {
    setShowProfileModal(false);
  };

  return (
    <nav className="navbar">
      <Link to="/" className="logo">
        CUEvents
      </Link>

      <input
        type="text"
        className="search-bar"
        placeholder="🔍 Search events..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/myevents">My Events</Link>
        {!roleLoading && isOrganizer && (
          <Link to="/manage-events">Manage Events</Link>
        )}
        {!roleLoading && isAdmin && (
          <Link to="/admin">Admin Panel</Link>
        )}
        
        <div className="profile-menu-container">
          <div
            className="profile-avatar"
            onClick={handleProfileClick}
            title="View Profile"
          >
            {user?.email?.[0]?.toUpperCase()}
          </div>
        </div>
      </div>

      {/* Profile Modal */}
      <ProfileModal 
        isOpen={showProfileModal} 
        onClose={handleCloseProfile} 
      />
    </nav>
  );
};

export default Navbar;
