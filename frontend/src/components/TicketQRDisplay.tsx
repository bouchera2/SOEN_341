import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

type Props = { ticketId: string };

const TicketQRDisplay: React.FC<Props> = ({ ticketId }) => {
  const [qrCode, setQrCode] = useState<string | null>(null);

  useEffect(() => {
    const fetchTicket = async () => {
      const snap = await getDoc(doc(db, "tickets", ticketId));
      if (snap.exists()) {
        setQrCode(snap.data().qrCode);
      }
    };
    fetchTicket();
  }, [ticketId]);

  return (
    <div>
      <h3>Your Ticket</h3>
      {qrCode ? <img src={qrCode} alt="Ticket QR" /> : <p>Loading QR...</p>}
    </div>
  );
};

export default TicketQRDisplay;  
