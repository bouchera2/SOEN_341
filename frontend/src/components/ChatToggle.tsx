import React, { useState } from "react";
import ChatBox from "./ChatBox";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import oliviaLogo from "../assets/olivia-logo.png";

const ChatToggle: React.FC = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Chatbox with smooth appearance */}
      <AnimatePresence>{open && <ChatBox />}</AnimatePresence>

      {/* Olivia button */}
      <motion.button
        onClick={() => setOpen(!open)}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.75 }}
        animate={{ y: [0, -5, 0] }} 
        transition={{
          repeat: Infinity,
          duration: 2,
          ease: "easeInOut",
        }}
        className="chat-toggle-button fixed bottom-6 right-6 bg-gradient-to-r from-purple-600 to-pink-500 
                   hover:from-purple-700 hover:to-pink-600 text-white p-1 rounded-full shadow-lg 
                   transition-all duration-300 transform focus:outline-none z-[999999] w-5 h-5 flex items-center justify-center p-0"
      >
        {open ? (
          <X size={26}
          color="black" />
        ) : (
          <img
            src={oliviaLogo}
            alt="Olivia"
            className="w-9 h-15 rounded-full object-contain"
          />
        )}
      </motion.button>
    </>
  );
};

export default ChatToggle;
