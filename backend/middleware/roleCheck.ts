import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, UserRole } from '../types/index.js';
import { getUserRole } from '../services/userRoleService.js';

export const checkEventCreationPermission = async (
  req: AuthenticatedRequest, 
  res: Response, 
  next: NextFunction
): Promise<void> => {
  console.log('=== ROLE CHECK MIDDLEWARE CALLED ===');
  console.log('Request headers:', req.headers);
  console.log('User from request:', req.user);
  
  if (!req.user?.uid) {
    console.log('❌ No user UID found in request');
    res.status(401).json({ 
      error: 'User not authenticated' 
    });
    return;
  }
  
  try {
    // Fetch actual user role from Firestore
    const userRoleData = await getUserRole(req.user.uid);
    
    if (!userRoleData) {
      console.log('❌ User role not found in database');
      res.status(403).json({ 
        error: 'User role not found. Please contact support.' 
      });
      return;
    }
    
    const userRole = userRoleData.role;
    console.log('Checking role:', userRole);
    
    if (!userRole || !(['admin', 'organizer'] as UserRole[]).includes(userRole)) {
      console.log('❌ Permission denied - role:', userRole);
      res.status(403).json({ 
        error: 'Insufficient permissions to create events',
        userRole: userRole // Include role in response for debugging
      });
      return;
    }
    
    console.log('✅ Permission granted - role:', userRole);
    // Store the role in the request for use in routes
    req.userRole = userRole;
    next(); 
  } catch (error) {
    console.error('❌ Error checking user role:', error);
    res.status(500).json({ 
      error: 'Failed to verify user permissions' 
    });
    return;
  }
};
