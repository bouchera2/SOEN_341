import React, { useState, useEffect, useRef } from "react";
import { Send } from "lucide-react";

const ChatBox: React.FC = () => {
  const [messages, setMessages] = useState<{ text: string; sender: string }[]>([
    { text: "Hi there! 👋 How can I help you today?", sender: "bot" },
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { text: input, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      const response = await fetch("http://localhost:3002/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      if (response.ok) {
        const data = await response.json();
        const botReply = {
          text: data.reply || "Hmm... I couldn’t find an answer.",
          sender: "bot",
        };
        setMessages((prev) => [...prev, botReply]);
      } else {
        throw new Error("Server error");
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          text: "⚠️ The chatbot server isn’t responding right now.",
          sender: "bot",
        },
      ]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <div
      className="chatbox-container fixed bottom-24 right-8 w-[400px] h-[550px]
                 bg-white rounded-2xl shadow-2xl border border-gray-300 
                 flex flex-col overflow-hidden z-[999999]"
    >
      {/* Header */}
      <div className="bg-gray-100 text-black text-lg font-semibold p-3 border-b border-gray-300">
        Campus Chatbot 💬
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${
              msg.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`px-4 py-2 rounded-2xl max-w-[80%] break-words text-sm ${
                msg.sender === "user"
                  ? "bg-indigo-600 text-white rounded-br-none"
                  : "bg-gray-200 text-gray-800 rounded-bl-none"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 bg-white border-t border-gray-200 flex items-center gap-2">
        <input
          type="text"
          className="flex-1 p-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          onClick={sendMessage}
          className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-full flex items-center justify-center"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
