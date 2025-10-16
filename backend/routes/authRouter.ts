import express, { Request, Response } from "express";
import { checkEventCreationPermission } from "../middleware/roleCheck.js";
import { ApiResponse, AuthenticatedRequest, Event } from "../types/index.js";
import { db } from "../database/firestore.js";
import { checkUserAuthToken } from "../middleware/userAuth.js";


const router = express.Router();


router.get('/sync', checkUserAuthToken, async (req: AuthenticatedRequest, res: Response) => {

    if (!req.user) {
        return res.status(500).json({ error: "User not found in request" });
    }
    const user = await db.collection('users').doc(req.user.uid).get();

    if (!user.exists) {
        return res.status(500).json({ error: "User already exists in database" });
    }
    const userData = user.data();

    if (!userData) {
        return res.status(500).json({ error: "User data not found in database" });
    }

    return res.status(200).json({
        success: true,
        message: "User synced with backend successfully",
        data: userData
    });


});


router.get('/signup', checkUserAuthToken, async (req: AuthenticatedRequest, res: Response) => {

    if (!req.user) {
        return res.status(500).json({ error: "User not found in request" });
    }

   
    // For testing purposes, set some users as organizers/admins based on email
    const email = req.user.email || '';
    let role = 'student';
    if (email.includes('admin')) {
      role = 'admin';
    } else if (email.includes('organizer')) {
      role = 'organizer';
    }
    
    await db.collection('users').doc(req.user.uid).set({
      ...req.user, 
      role: role, 
      createdAt: new Date(), 
      lastLogin: new Date()
    });
    
    console.log(`✅ User created with role: ${role} for email: ${email}`);

    return res.status(200).json({
        success: true,
        message: "User signed up and synced with backend successfully",
        data: req.user
    });
});

export default router;