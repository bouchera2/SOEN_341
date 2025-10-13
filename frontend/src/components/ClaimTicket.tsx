import React, { useState } from "react";
import TicketQRDisplay from "./TicketQRDisplay";

export default function ClaimTicket({ eventId, userId }: { eventId: string; userId: string }) {
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClaim = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("http://localhost:3002/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId, userId }),
      });

      if (!res.ok) throw new Error("Failed to claim ticket");

      const result = await res.json();
      setTicketId(result.data.ticketId);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {!ticketId ? (
        <>
          <button onClick={handleClaim} disabled={loading}>
            {loading ? "Claiming..." : "Claim Ticket"}
          </button>
          {error && <p style={{ color: "red" }}>{error}</p>}
        </>
      ) : (
        <TicketQRDisplay ticketId={ticketId} />
      )}
    </div>
  );
}


