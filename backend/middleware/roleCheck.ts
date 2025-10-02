import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, UserRole } from '../types/index.js';

export const checkEventCreationPermission = (
  req: AuthenticatedRequest, 
  res: Response, 
  next: NextFunction
): void => {
  console.log('=== AUTH MIDDLEWARE CALLED ===');
  
  // This is for testing, code should extract user role from the request
  const userRole: UserRole = 'admin';
  
  if (!userRole || !(['admin', 'organizer'] as UserRole[]).includes(userRole)) {
    res.status(403).json({ 
      error: 'Insufficient permissions to create events' 
    });
    return;
  }
  
  next(); 
};
