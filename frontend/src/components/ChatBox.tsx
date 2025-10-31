import React, { useState } from "react";
console.log("🔵 ChatBox mounted");


type Props = {
  onClose?: () => void;  // 👈 permet à ChatToggle de fermer
};

const ChatBox: React.FC<Props> = ({ onClose }) => {
  const [messages, setMessages] = useState<{ from: string; text: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { from: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg.text }),
      });

      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      const aiMsg = { from: "ai", text: data.reply || "(pas de réponse)" };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (e) {
      setMessages((prev) => [...prev, { from: "ai", text: "⚠️ Erreur de connexion au serveur" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: 100,
        right: 20,
        width: 380,
        height: 500,
        background: "#fff",
        borderRadius: 16,
        boxShadow: "0 8px 30px rgba(0,0,0,0.25)",
        overflow: "hidden",
        zIndex: 3000,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header interne + bouton X en haut à droite */}
      <div
        style={{
          background: "linear-gradient(135deg, #0078ff 0%, #00c6ff 100%)",
          color: "#fff",
          padding: "10px 16px",
          fontWeight: 700,
          position: "relative",
        }}
      >
        🤖 Chat IA — ConcoEvents
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Fermer le chat"
            style={{
              position: "absolute",
              top: 6,
              right: 10,
              background: "transparent",
              border: "none",
              color: "#fff",
              fontSize: 22,
              fontWeight: 800,
              cursor: "pointer",
              lineHeight: 1,
            }}
          >
            ×
          </button>
        )}
      </div>

      {/* Corps du chat */}
      <div style={{ padding: 12, flex: 1, background: "#fafafa", overflow: "auto" }}>
        {messages.map((m, i) => (
          <p
            key={i}
            style={{
              textAlign: m.from === "user" ? "right" : "left",
              color: m.from === "user" ? "#0078ff" : "#333",
              margin: "6px 0",
            }}
          >
            <b>{m.from === "user" ? "Toi" : "IA"}:</b> {m.text}
          </p>
        ))}
        {loading && <p style={{ textAlign: "center" }}>⏳ L’IA réfléchit...</p>}
      </div>

      {/* Input */}
      <div style={{ display: "flex", gap: 8, padding: 12, background: "#fff", borderTop: "1px solid #eee" }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Écris ton message..."
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          style={{
            flex: 1,
            padding: "10px 12px",
            borderRadius: 8,
            border: "1px solid #ddd",
            outline: "none",
          }}
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          style={{
            background: "#0078ff",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "10px 14px",
            cursor: "pointer",
          }}
        >
          Envoyer
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
