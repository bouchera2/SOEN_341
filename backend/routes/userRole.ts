import express, { Request, Response } from "express";
import { checkUserAuthToken } from "../middleware/userAuth.js";
import { getUserRole, updateUserRole } from "../services/userRoleService.js";
import { AuthenticatedRequest, ApiResponse, UserRole } from "../types/index.js";
import { db } from "../database/firestore.js";

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

// GET /userRole/organizers - Get all users with organizer role (admin only)
router.get('/organizers', checkUserAuthToken, async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
  try {
    console.log('=== GET ALL ORGANIZERS ROUTE CALLED ===');
    console.log('Requesting user UID:', req.user?.uid);

    if (!req.user?.uid) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    // Check if user has admin role
    const userRoleData = await getUserRole(req.user.uid);
    
    if (!userRoleData || userRoleData.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Admin privileges required'
      });
    }

    // Get all users from the database
    const allUsersSnapshot = await db.collection('users').get();
    
    console.log(`📊 Total users in database: ${allUsersSnapshot.size}`);

    // Filter users to get only those with organizer role
    const organizers: { uid: string; email: any; name: any; role: any; createdAt: any; lastLogin: any; }[] = [];
    
    allUsersSnapshot.forEach((doc) => {
      const userData = doc.data();
      const userRole = (userData.role as string)?.trim().toLowerCase();
      
      // Check if user has organizer role (case-insensitive)
      if (userRole === 'organizer') {
        console.log(`✅ Found organizer: ${doc.id} - ${userData.email || 'Unknown'}`);
        organizers.push({
          uid: doc.id,
          email: userData.email || 'Unknown',
          name: userData.name || userData.displayName || 'Unknown',
          role: userData.role,
          createdAt: userData.createdAt,
          lastLogin: userData.lastLogin
        });
      } else {
        console.log(`⏭️ Skipping user ${doc.id} with role: ${userRole || 'undefined'}`);
      }
    });

    console.log(`✅ Found ${organizers.length} organizer(s) out of ${allUsersSnapshot.size} total users`);

    res.json({
      success: true,
      data: organizers,
      message: `Found ${organizers.length} organizer(s)`
    });
  } catch (error) {
    console.error('❌ Error getting organizers:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve organizers',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /userRole/:uid/remove - Remove organizer role and set to student (admin only)
router.post('/:uid/remove', checkUserAuthToken, async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
  try {
    console.log('=== REMOVE ORGANIZER ROLE ROUTE CALLED ===');
    const { uid } = req.params;
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

    // Check if target user exists
    const targetUserDoc = await db.collection('users').doc(uid).get();
    if (!targetUserDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const targetUserData = targetUserDoc.data();
    if (!targetUserData) {
      return res.status(404).json({
        success: false,
        error: 'User data not found'
      });
    }

    // Prevent admin from removing their own admin role
    if (uid === adminUserId) {
      return res.status(400).json({
        success: false,
        error: 'Cannot remove your own role'
      });
    }

    // Update user role to student
    await db.collection('users').doc(uid).update({
      role: 'student',
      updatedAt: new Date()
    });

    console.log(`✅ User ${uid} role changed to student`);

    res.json({
      success: true,
      message: "Organizer role removed successfully. User role set to student."
    });
  } catch (err) {
    console.error('Error removing organizer role:', err);
    res.status(500).json({ 
      success: false, 
      error: "Failed to remove organizer role",
      details: err instanceof Error ? err.message : 'Unknown error'
    });
  }
});

export default router;
