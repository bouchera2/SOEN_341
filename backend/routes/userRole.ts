import express, { Request, Response } from "express";
import { checkUserAuthToken } from "../middleware/userAuth.js";
import { getUserRole, updateUserRole } from "../services/userRoleService.js";
import { AuthenticatedRequest, ApiResponse, UserRole } from "../types/index.js";

const router = express.Router();

// GET /userRole - Get current user's role
router.get('/', checkUserAuthToken, async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
  try {
    console.log('=== GET USER ROLE ROUTE CALLED ===');
    console.log('User UID:', req.user?.uid);

    if (!req.user?.uid) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const userRoleData = await getUserRole(req.user.uid);
    
    if (!userRoleData) {
      console.log('❌ User role not found');
      return res.status(404).json({
        success: false,
        error: 'User role not found. Please contact support.'
      });
    }

    console.log('✅ User role retrieved:', userRoleData.role);

    res.json({
      success: true,
      data: {
        role: userRoleData.role.trim(),
        uid: userRoleData.uid,
        email: userRoleData.email
      },
      message: 'User role retrieved successfully'
    });
  } catch (error) {
    console.error('❌ Error getting user role:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve user role',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// PUT /userRole - Update current user's role (for testing)
router.put('/', checkUserAuthToken, async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
  try {
    console.log('=== UPDATE USER ROLE ROUTE CALLED ===');
    console.log('User UID:', req.user?.uid);
    console.log('Request body:', req.body);

    if (!req.user?.uid) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const { role } = req.body;
    
    if (!role || !['admin', 'organizer', 'student'].includes(role)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid role. Must be admin, organizer, or student'
      });
    }

    const success = await updateUserRole(req.user.uid, role as UserRole);
    
    if (!success) {
      return res.status(500).json({
        success: false,
        error: 'Failed to update user role'
      });
    }

    console.log('✅ User role updated to:', role);

    res.json({
      success: true,
      data: {
        role: role as UserRole,
        uid: req.user.uid
      },
      message: 'User role updated successfully'
    });
  } catch (error) {
    console.error('❌ Error updating user role:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update user role',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
