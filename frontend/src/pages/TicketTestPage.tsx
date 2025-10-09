import React from "react";
import ClaimTicket from "../components/ClaimTicket";
import QRUploadValidator from "../components/QRUploadValidator";

type Props = {
  eventId: string;
  userId: string;
};

export default function TicketTestPage({ eventId, userId }: Props) {
  return (
    <div style={{ textAlign: "center" }}>
      <h2> Ticket Testing</h2>
      <div style={{ margin: "20px 0" }}>
        <ClaimTicket eventId={eventId} userId={userId} />
      </div>
      <hr />
      <div style={{ margin: "20px 0" }}>
        <QRUploadValidator />
      </div>
    </div>
  );
}
