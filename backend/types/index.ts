import { Request, Response, NextFunction } from 'express';
import { DecodedIdToken } from 'firebase-admin/auth';

export type UserRole = 'admin' | 'organizer' | 'student';



export interface Event {
  // Core required fields
  title: string;
  description: string;
  date: string; // ISO string for consistency
  location: string;
  organizer: string; // organizer ID
  

  time?: string;
  attendees?: string[]; // Array of student IDs
  tags?: string[]; // Tags for event sorting
  type: 'paid' | 'free';
  capacity?: number; // Event capacity
  bookedCount?: number; // How many users have signed up
  
  // Auto-generated fields (only present when saved to database)
  id?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Express types with custom properties
export interface AuthenticatedRequest extends Request {
  user?: DecodedIdToken;
}

// Middleware types
export type AuthMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;



  // API Response types
export interface ParticipationTrend {
  period: string;
  ticketCount: number;
  eventCount: number;
}

export interface AnalyticsSummary {
  totalEvents: number;
  totalTicketsIssued: number;
  participationTrends: ParticipationTrend[];
}
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  details?: string;
}

// Error types
export interface ApiError extends Error {
  statusCode: number;
  isOperational: boolean;
}
