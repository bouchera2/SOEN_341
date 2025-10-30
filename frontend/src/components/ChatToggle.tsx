import React, { useState } from "react";
import ChatBox from "./ChatBox";

const ChatToggle: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Bouton flottant pour ouvrir/fermer */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          background: "#0078ff",
          color: "white",
          border: "none",
          borderRadius: "50%",
          width: "60px",
          height: "60px",
          fontSize: "28px",
          cursor: "pointer",
          boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
          zIndex: 1001,
        }}
      >
        {isOpen ? "×" : "💬"}
      </button>

      {/* Le ChatBox, visible seulement quand isOpen = true */}
      {isOpen && <ChatBox />}
    </>
  );
};

export default ChatToggle;
