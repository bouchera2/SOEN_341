import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { useUserRole } from '../../hooks/useUserRole';
import { useNavigate } from 'react-router-dom';
import jsQR from 'jsqr';

const AdminPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { userRole, loading: roleLoading, refetch: refetchUserRole } = useUserRole();
  const navigate = useNavigate();
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimMessage, setClaimMessage] = useState('');
  const [scannedTicketId, setScannedTicketId] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Organizer requests state
  const [organizerRequests, setOrganizerRequests] = useState<any[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  // No need for ref with jsQR - it's a static function

  // Check authentication and role
  useEffect(() => {
    
    // Don't do anything while either auth or role is loading
    if (authLoading || roleLoading) {
      return;
    }
    
    // Check if user is authenticated
    if (!user) {
      navigate('/');
      return;
    }
    
    // If role is still null after loading is complete, wait a bit more
    if (userRole === null) {
      return;
    }
    
    // Check if user has admin role
    if (userRole !== 'admin') {
      navigate('/');
      return;
    }
  }, [user, userRole, authLoading, roleLoading, navigate]);

  // Add a timeout to handle cases where role never loads
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!authLoading && !roleLoading && user && userRole === null) {
        console.log('⏰ Timeout: Role never loaded, redirecting to home');
        navigate('/');
      }
    }, 10000); // 10 second timeout

    return () => clearTimeout(timeout);
  }, [authLoading, roleLoading, user, userRole, navigate]);

  // Fetch organizer requests when admin access is granted
  useEffect(() => {
    if (user && userRole === 'admin') {
      fetchOrganizerRequests();
    }
  }, [user, userRole]);

  // Note: Removed the refetch logic that was causing issues

  const fetchOrganizerRequests = async () => {
    if (!user) return;

    setLoadingRequests(true);
    try {
      const token = await user.getIdToken();
      const response = await fetch('http://localhost:3002/organizer-requests/pending', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setOrganizerRequests(result.data || []);
      } else {
        console.error('Failed to fetch organizer requests:', result.error);
        setOrganizerRequests([]);
      }
    } catch (error) {
      console.error('Error fetching organizer requests:', error);
      setOrganizerRequests([]);
    } finally {
      setLoadingRequests(false);
    }
  };

  const handleGrantOrganizer = async (requestId: string) => {
    if (!user) return;

    try {
      const token = await user.getIdToken();
      const response = await fetch(`http://localhost:3002/organizer-requests/grant/${requestId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (response.ok && result.success) {
        alert('Organizer role granted successfully!');
        fetchOrganizerRequests(); // Refresh the list
      } else {
        alert(`Failed to grant organizer role: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error granting organizer role:', error);
      alert('Network error. Please try again.');
    }
  };

  const handleDenyOrganizer = async (requestId: string) => {
    if (!user) return;

    try {
      const token = await user.getIdToken();
      const response = await fetch(`http://localhost:3002/organizer-requests/deny/${requestId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (response.ok && result.success) {
        alert('Request denied and removed.');
        fetchOrganizerRequests(); // Refresh the list
      } else {
        alert(`Failed to deny request: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error denying organizer request:', error);
      alert('Network error. Please try again.');
    }
  };

  const claimTicket = async (ticketId: string) => {
    if (!ticketId.trim()) {
      setClaimMessage('Please enter or scan a ticket ID');
      return;
    }

    if (!user) {
      setClaimMessage('❌ You must be logged in to claim tickets');
      return;
    }

    setIsClaiming(true);
    setClaimMessage('');

    try {
      const token = await user.getIdToken();
      const response = await fetch('http://localhost:3002/tickets/admin/claim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ticketId: ticketId.trim() })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setClaimMessage('✅ Ticket claimed successfully!');
        setScannedTicketId('');
      } else {
        setClaimMessage(`❌ Error: ${result.error || 'Failed to claim ticket'}`);
      }
    } catch (error) {
      setClaimMessage('❌ Network error. Please try again.');
    } finally {
      setIsClaiming(false);
    }
  };

  const handleManualClaim = () => {
    claimTicket(scannedTicketId);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset the input value to allow the same file to be selected again
    e.target.value = '';
    
    // Clear previous results
    setScannedTicketId('');
    setClaimMessage('');

    try {
      setClaimMessage('🔍 Decoding QR code...');
      
      // Create image element to load the file
      const img = new Image();
      const objectURL = URL.createObjectURL(file);
      
      img.onload = () => {
        try {
          // Create canvas to get image data
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            setClaimMessage('❌ Failed to process image. Please try again.');
            URL.revokeObjectURL(objectURL); // Clean up
            return;
          }
          
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          
          // Get image data
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          
          // Decode QR code using jsQR
          const result = jsQR(imageData.data, imageData.width, imageData.height);
          
          if (result && result.data) {
            setScannedTicketId(result.data);
            setClaimMessage('✅ QR code decoded successfully!');
          } else {
            setClaimMessage('❌ No QR code found in the image. Please try again.');
          }
        } catch (error) {
          console.error('Error processing image:', error);
          setClaimMessage('❌ Failed to process image. Please try again.');
        } finally {
          // Clean up the object URL
          URL.revokeObjectURL(objectURL);
        }
      };
      
      img.onerror = () => {
        setClaimMessage('❌ Failed to load image. Please try again.');
        URL.revokeObjectURL(objectURL); // Clean up on error
      };
      
      // Load the image
      img.src = objectURL;
      
    } catch (error) {
      console.error('Error decoding QR code:', error);
      setClaimMessage('❌ Failed to decode QR code. Please try again or enter manually.');
    }
  };

  // Show loading state while checking authentication
  if (authLoading || roleLoading) {
    return (
      <div className="admin-page">
        <div className="admin-container">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Checking permissions...</p>
            <div style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
              Debug: userRole = {userRole}, authLoading = {authLoading.toString()}, roleLoading = {roleLoading.toString()}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show access denied if not authenticated or not admin (only after role is loaded)
  if (!user || (userRole !== null && userRole !== 'admin')) {
    return (
      <div className="admin-page">
        <div className="admin-container">
          <div className="access-denied-container">
            <div className="access-denied-icon">🔒</div>
            <h1>Access Denied</h1>
            <p>You need admin privileges to access this page.</p>
            <p>Current role: {userRole || 'Loading...'}</p>
            <div style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
              Debug: user = {user ? 'true' : 'false'}, userRole = {userRole}, 
              authLoading = {authLoading.toString()}, roleLoading = {roleLoading.toString()}
            </div>
            <button onClick={() => navigate('/')} className="home-btn">
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show admin panel only if user is authenticated and has admin role
  if (user && userRole === 'admin') {
    console.log('🎉 Rendering admin panel for user:', user.email);
  }

  return (
    <div className="admin-page">
      <motion.div
        className="admin-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="admin-header">
          <div className="admin-title-section">
            <h1 className="admin-title">Admin Panel</h1>
            <button 
              onClick={refetchUserRole} 
              className="refresh-role-btn"
              disabled={roleLoading}
              title="Refresh user role"
            >
              {roleLoading ? '⏳' : '🔄'}
            </button>
          </div>
          <div className="admin-user-info">
            <span className="admin-role">Admin</span>
            <span className="admin-email">{user?.email}</span>
          </div>
        </div>

        <div className="admin-content">
          <div className="ticket-claim-section">
            <h2>Claim Ticket</h2>
            
            <div className="claim-methods">
              <div className="manual-claim">
                <h3>Manual Entry</h3>
                <div className="input-group">
                  <input
                    type="text"
                    value={scannedTicketId}
                    onChange={(e) => setScannedTicketId(e.target.value)}
                    placeholder="Enter ticket ID"
                    className="ticket-id-input"
                  />
                  <button
                    onClick={handleManualClaim}
                    disabled={isClaiming}
                    className="claim-btn"
                  >
                    {isClaiming ? 'Claiming...' : 'Claim Ticket'}
                  </button>
                  <button
                    onClick={() => {
                      setScannedTicketId('');
                      setClaimMessage('');
                    }}
                    className="clear-btn"
                    disabled={isClaiming}
                  >
                    Clear
                  </button>
                </div>
              </div>

              <div className="upload-claim">
                <h3>Upload QR Code</h3>
                <div className="upload-group">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="file-input"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="upload-btn"
                  >
                    📷 Upload Image
                  </button>
                </div>
              </div>
            </div>

            {claimMessage && (
              <div className={`claim-message ${claimMessage.includes('✅') ? 'success' : 'error'}`}>
                {claimMessage}
              </div>
            )}
          </div>

          {/* Organizer Requests Section */}
          <div className="organizer-requests-section">
            <div className="section-header">
              <h2>Organizer Requests</h2>
              <button 
                onClick={fetchOrganizerRequests} 
                className="refresh-btn"
                disabled={loadingRequests}
              >
                {loadingRequests ? '⏳' : '🔄'}
              </button>
            </div>

            {loadingRequests ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading requests...</p>
              </div>
            ) : organizerRequests.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📝</div>
                <h3>No pending requests</h3>
                <p>All organizer requests have been processed.</p>
              </div>
            ) : (
              <div className="requests-list">
                {organizerRequests.map((request) => (
                  <div key={request.id} className="request-card">
                    <div className="request-header">
                      <div className="request-user">
                        <span className="user-email">{request.userEmail}</span>
                      </div>
                    </div>
                    <div className="request-message">
                      <strong>Message:</strong>
                      <p>{request.message}</p>
                    </div>
                    <div className="request-actions">
                      <button
                        onClick={() => handleGrantOrganizer(request.id)}
                        className="grant-btn"
                      >
                        ✅ Grant Organizer
                      </button>
                      <button
                        onClick={() => handleDenyOrganizer(request.id)}
                        className="deny-btn"
                      >
                        ❌ Deny
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminPage;
