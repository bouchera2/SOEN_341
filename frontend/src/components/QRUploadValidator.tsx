import React, { useState } from "react";
import QrScanner from "qr-scanner";
import { db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export default function QRUploadValidator() {
  const [result, setResult] = useState("");
  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const decoded = await QrScanner.scanImage(file);
      const ticketId = decoded;

      const ref = doc(db, "tickets", ticketId);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        setResult("Invalid ticket");
        return;
      }

      if (snap.data().claimed) {
        setResult("Ticket already used");
        return;
      }

      await updateDoc(ref, { claimed: true });
      setResult("Ticket validated!");
    } catch (err) {
      console.error(err);
      setResult("Could not decode QR");
    }
  };

  return (
    <div>
      <h3>Organizer – Validate Ticket</h3>
      <input type="file" accept="image/*" onChange={handleFile} />
      <p>{result}</p>
    </div>
  );
}

export{};

