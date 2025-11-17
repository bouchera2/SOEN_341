import React, { useState } from "react";
import { motion } from "framer-motion";
import QrReader from "react-qr-reader-es6";
import { db } from "../services/firebase";
import { collection, getDocs } from "firebase/firestore";

export default function OrganizerPage() {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("");

  const handleScan = async (data: string | null) => {
    if (!data) return;

    setScanResult(data);
    setStatus("⏳ Verifying ticket...");

    try {
      const parts = data.split("|");
      if (parts.length < 4) {
        setStatus("❌ Invalid QR format");
        return;
      }

      const [_, eventId, title, email] = parts;

      // 🔍 Verify ticket in Firestore
      const userEventsRef = collection(db, "userEvents");
      const usersSnapshot = await getDocs(userEventsRef);

      let found = false;
      for (const userDoc of usersSnapshot.docs) {
        const registeredRef = collection(
          db,
          "userEvents",
          userDoc.id,
          "registeredEvents"
        );
        const regSnap = await getDocs(registeredRef);
        for (const regDoc of regSnap.docs) {
          const eventData = regDoc.data();
          if (
            eventData.eventId === eventId &&
            eventData.title === title &&
            eventData.email === email
          ) {
            found = true;
            break;
          }
        }
        if (found) break;
      }

      if (found) {
        setStatus("✅ Valid Ticket! Checked In 🎟️");
      } else {
        setStatus("❌ Ticket not found or invalid.");
      }
    } catch (error) {
      console.error(error);
      setStatus("⚠️ Error verifying ticket.");
    }
  };

  const handleError = (err: any) => {
    console.error(err);
    setStatus("⚠️ Camera access error or scanner issue.");
  };

  return (
    <motion.div
      className="organizer-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="section-title">🎫 Organizer Check-In Portal</h1>
      <p>Scan a student's QR code below to verify their registration.</p>

      <div className="scanner-container">
        <QrReader
          delay={300}
          onError={handleError}
          onScan={handleScan}
          style={{ width: "100%" }}
        />
      </div>

      {scanResult && (
        <div className="scan-result">
          <h3>Scanned Data:</h3>
          <p>{scanResult}</p>
        </div>
      )}

      {status && <h2 className="status-message">{status}</h2>}
    </motion.div>
  );
}
