import express, { Request, Response } from "express";
import { db } from "../database/firestore";
import QRCode from "qrcode";

const router = express.Router();

// Claim ticket
router.post("/", async (req: Request, res: Response) => {
  try {
    const { eventId, userId } = req.body;

    // Create Firestore doc
    const ticketRef = await db.collection("tickets").add({
      eventId,
      userId,
      claimedAt: new Date(),
      checkedIn: false,
    });

    const ticketId = ticketRef.id;

    router.post("/", async (req: Request, res: Response) => {
        console.log("POST /tickets hit! Body:", req.body);
        res.json({ success: true, test: true });
      });

      

    // Generate QR code (base64 string)
    const qrDataUrl = await QRCode.toDataURL(ticketId);

    // Save QR to Firestore
    await ticketRef.update({
      qrCode: qrDataUrl, // stored directly in Firestore for now
    });

    res.json({
      success: true,
      message: "Ticket created with QR",
      data: { ticketId, qrCode: qrDataUrl },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Failed to create ticket" });
  }
});

export default router;
