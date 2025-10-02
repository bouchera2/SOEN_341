// Shared types and utilities for Campus Events & Ticketing Platform

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'user';
  name?: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: Date;
  location: string;
  capacity: number;
  price: number;
  createdBy: string;
}

export interface Ticket {
  id: string;
  eventId: string;
  userId: string;
  qrCode: string;
  purchaseDate: Date;
  status: 'active' | 'used' | 'cancelled';
}

// Add more shared types and utilities as needed
