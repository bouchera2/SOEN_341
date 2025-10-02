import { authAdmin } from "../services/adminAuth";
import express, { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../types";

export const checkUserAuthToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {

    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }
   try{
     let decodedToken = await authAdmin.verifyIdToken(token);
     req.user = decodedToken;
     next();
     } catch (err) {
        return res.status(401).send("Invalid token");
     }
}