import React, { useState } from "react";
import ChatBox from "./ChatBox";
import { MessageCircle, X } from "lucide-react";

const ChatToggle: React.FC = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      {open && <ChatBox />}
      <button
        onClick={() => setOpen(!open)}
        className="chat-toggle-button fixed bottom-6 right-6 bg-gradient-to-r from-white-600 to-orange-600 
                   hover:from-white-700 hover:to-black-700 text-white p-4 rounded-full shadow-lg 
                   transition-all duration-300 transform hove:scale-110 focus:outline-none z-[999999] !important"
      >
        {open ? <X size={26} /> : <MessageCircle size={26} />}
      </button>
    </>
  );
};

export default ChatToggle;
