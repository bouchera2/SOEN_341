import express, { Request, Response } from "express";
import { checkUserAuthToken } from "../middleware/userAuth.js";
import { checkEventCreationPermission } from "../middleware/roleCheck.js";
import { AuthenticatedRequest } from "../types/index.js";

const router = express.Router();

// GET /permissions/event-creation - Check if user has event creation permission
router.get('/event-creation', checkUserAuthToken, checkEventCreationPermission, (req: AuthenticatedRequest, res: Response) => {
  console.log('=== PERMISSIONS ROUTE REACHED ===');
  console.log('User authenticated:', !!req.user);
  // This will only execute if checkEventCreationPermission passes
  res.json({
    success: true,
    message: 'User has event creation permission',
    hasPermission: true
  });
});

// Alternative approach: Use the role check middleware directly
router.get('/event-creation-alt', checkUserAuthToken, checkEventCreationPermission, (req: AuthenticatedRequest, res: Response) => {
  // This will only execute if checkEventCreationPermission passes
  res.json({
    success: true,
    message: 'User has event creation permission',
    hasPermission: true
  });
});

export default router;
