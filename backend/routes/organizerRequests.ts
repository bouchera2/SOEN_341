import express, { Request, Response } from "express";
import { db } from "../database/firestore";
import { checkUserAuthToken } from "../middleware/userAuth.js";
import { AuthenticatedRequest, ApiResponse } from "../types/index.js";
import { getUserRole } from '../services/userRoleService.js';

const router = express.Router();

// Submit organizer role request
router.post("/request", checkUserAuthToken, async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
  try {
    const { message } = req.body;
    const userId = req.user?.uid;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    // Check if user already has a pending request
    const existingRequest = await db.collection('organizerRequests')
      .where('userId', '==', userId)
      .get();

    if (!existingRequest.empty) {
      return res.status(400).json({
        success: false,
        error: 'You already have a pending organizer request'
      });
    }

    // Add request to collection
    await db.collection('organizerRequests').add({
      userId,
      message: message.trim(),
      requestedAt: new Date(),
      status: 'pending'
    });

    res.json({
      success: true,
      message: "Organizer request submitted successfully"
    });
  } catch (err) {
    console.error('Error submitting organizer request:', err);
    res.status(500).json({ 
      success: false, 
      error: "Failed to submit request",
      details: err instanceof Error ? err.message : 'Unknown error'
    });
  }
});

// Get all pending organizer requests (admin only)
router.get("/pending", checkUserAuthToken, async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
  try {
    const userId = req.user?.uid;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    // Check if user has admin role
    const userRoleData = await getUserRole(userId);
    
    if (!userRoleData || userRoleData.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Admin privileges required'
      });
    }

    // Get all requests (both with and without status field)
    const requestsSnapshot = await db.collection('organizerRequests')
      .get();
    
    // Filter for pending requests (including those without status field)
    const pendingRequests = requestsSnapshot.docs.filter(doc => {
      const data = doc.data();
      return !data.status || data.status === 'pending';
    });
    
    const requests = [];
    for (const doc of pendingRequests) {
      const requestData = doc.data();
      
      // Get user info
      const userDoc = await db.collection('users').doc(requestData.userId).get();
      const userData = userDoc.data();
      
      requests.push({
        id: doc.id,
        userId: requestData.userId,
        userEmail: userData?.email || 'Unknown',
        message: requestData.message,
        requestedAt: requestData.requestedAt
      });
    }

    res.json({
      success: true,
      data: requests
    });
  } catch (err) {
    console.error('Error fetching organizer requests:', err);
    res.status(500).json({ 
      success: false, 
      error: "Failed to fetch requests",
      details: err instanceof Error ? err.message : 'Unknown error'
    });
  }
});

// Grant organizer role (admin only)
router.post("/grant/:requestId", checkUserAuthToken, async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
  try {
    const { requestId } = req.params;
    const adminUserId = req.user?.uid;

    if (!adminUserId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    // Check if user has admin role
    const userRoleData = await getUserRole(adminUserId);
    
    if (!userRoleData || userRoleData.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Admin privileges required'
      });
    }

    // Get the request
    const requestDoc = await db.collection('organizerRequests').doc(requestId).get();
    if (!requestDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Request not found'
      });
    }

    const requestData = requestDoc.data();
    if (!requestData) {
      return res.status(404).json({
        success: false,
        error: 'Request data not found'
      });
    }

    // Update user role to organizer
    await db.collection('users').doc(requestData.userId).update({
      role: 'organizer'
    });

    // Delete the request
    await db.collection('organizerRequests').doc(requestId).delete();

    res.json({
      success: true,
      message: "Organizer role granted successfully"
    });
  } catch (err) {
    console.error('Error granting organizer role:', err);
    res.status(500).json({ 
      success: false, 
      error: "Failed to grant organizer role",
      details: err instanceof Error ? err.message : 'Unknown error'
    });
  }
});

// Deny organizer request (admin only)
router.delete("/deny/:requestId", checkUserAuthToken, async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
  try {
    const { requestId } = req.params;
    const adminUserId = req.user?.uid;

    if (!adminUserId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    // Check if user has admin role
    const userRoleData = await getUserRole(adminUserId);
    
    if (!userRoleData || userRoleData.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Admin privileges required'
      });
    }

    // Delete the request
    await db.collection('organizerRequests').doc(requestId).delete();

    res.json({
      success: true,
      message: "Request denied and removed"
    });
  } catch (err) {
    console.error('Error denying organizer request:', err);
    res.status(500).json({ 
      success: false, 
      error: "Failed to deny request",
      details: err instanceof Error ? err.message : 'Unknown error'
    });
  }
});

export default router;
