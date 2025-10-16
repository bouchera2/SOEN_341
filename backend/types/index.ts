// backend/types/index.ts
import { Request, Response, NextFunction } from 'express';
import { DecodedIdToken } from 'firebase-admin/auth';

// --- User roles ---
export type UserRole = 'admin' | 'organizer' | 'student';

// --- Event model ---
export interface Event {
  title: string;
  description: string;
  date: string; // ISO string
  location: string;
  organizer: string;

  time?: string;
  attendees?: string[];
  tags?: string[];
  type: 'paid' | 'free';
  capacity?: number;
  bookedCount?: number;
  imageUrl?: string; // URL to image stored in Firebase Storage

  id?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// --- User profile info ---
export interface UserProfile {
  name?: string;
  studentId?: string;
  email?: string;
}

// --- Express custom request ---
export interface AuthenticatedRequest extends Request {
  user?: DecodedIdToken;
  userRole?: UserRole; // Added to store user role from middleware
  file?: any; // For multer file uploads
}

// --- Middleware function type ---
export type AuthMiddleware = (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => void;

// ✅ NEW: Top event entry (for the top 3 events per trend)
export interface TopEvent {
  id: string;
  title: string;
  ticketCount: number;
}

// --- Participation trend ---
export interface ParticipationTrend {
  period: string;
  ticketCount: number;
  eventCount: number;

  // ✅ NEW: add this field for top 3 events inside each trend
  topEvents?: TopEvent[];
}

// --- Analytics summary ---
export interface AnalyticsSummary {
  totalEvents: number;
  totalTicketsIssued: number;
  participationTrends: ParticipationTrend[];
}

// --- Event analytics for per-event route ---
export interface EventAnalytics {
  eventId: string;
  ticketsIssued: number;
  attendedCount: number;
  attendanceRate: number;
  remainingCapacity: number;
}

// --- Generic API response wrapper ---
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  details?: string;
}

// --- Error model ---
export interface ApiError extends Error {
  statusCode: number;
  isOperational: boolean;
}
