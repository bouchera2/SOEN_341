import React, { useState, useEffect, useRef } from "react";
import { Send } from "lucide-react";
import botLogo from "../assets/olivia-logo.png";
import { getAuth } from "firebase/auth";
import "./ChatBox.css";

type Sender = "user" | "bot";

interface Message {
  text: string;
  sender: Sender;
}

const ChatBox: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      text: "Hi there! 👋 I'm Olivia, your campus AI assistant.",
      sender: "bot",
    },
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text) return;

    const userMessage: Message = { text, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      const token = currentUser ? await currentUser.getIdToken() : null;

      const res = await fetch("http://localhost:3002/api/chatbot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ message: text }),
      });

      if (!res.ok) throw new Error("Server error");
      const data = await res.json();

      const botReply: Message = {
        text:
          data.reply ||
          "Hmm... I couldn’t find an answer for that, but I’m learning 📚.",
        sender: "bot",
      };

      setMessages((prev) => [...prev, botReply]);
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => [
        ...prev,
        {
          text:
            "⚠️ I’m having trouble reaching the server right now. Please try again later.",
          sender: "bot",
        },
      ]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="olivia-chat-wrapper">
      <div className="olivia-chat-container">
        {/* Header */}
        <div className="olivia-chat-header">
          <span className="olivia-chat-title">Assistant Olivia</span>
        </div>

        {/* Messages */}
        <div className="olivia-messages">
          {messages.map((msg, idx) => {
            const isUser = msg.sender === "user";
            return (
              <div
                key={idx}
                className={`olivia-message-row ${
                  isUser ? "olivia-message-row-user" : "olivia-message-row-bot"
                }`}
              >
                {!isUser && (
                  <div className="olivia-avatar-wrap">
                    <img
                      src={botLogo}
                      alt="Olivia"
                      className="olivia-avatar"
                    />
                    <span className="olivia-avatar-label">Olivia</span>
                  </div>
                )}

                <div
                  className={`olivia-bubble ${
                    isUser ? "olivia-bubble-user" : "olivia-bubble-bot"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input + send */}
        <div className="olivia-input-bar">
          <input
            type="text"
            className="olivia-input"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim()}
            className="SendBtn"
            type="button"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBox;
