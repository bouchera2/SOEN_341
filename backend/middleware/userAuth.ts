import { authAdmin } from "../services/adminAuth";
import express, { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../types";

export const checkUserAuthToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    console.log('=== USER AUTH MIDDLEWARE CALLED ===');
    console.log('Authorization header:', req.headers.authorization);
    
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        console.log('❌ No token provided');
        return res.status(401).json({ message: "Unauthorized" });
    }
    
    console.log('Token found, verifying...');
   try{
     let decodedToken = await authAdmin.verifyIdToken(token);
     console.log('✅ Token verified successfully');
     console.log('User email:', decodedToken.email);
     req.user = decodedToken;
     next();
     } catch (err) {
        console.log('❌ Token verification failed:', err);
        return res.status(401).send("Invalid token");
     }
}