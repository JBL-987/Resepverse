import { useState, useRef, useEffect } from "react";
import { useChatStore } from "../../store/chatStore";
import { useAuth } from "../../contexts/AuthContext";
import { motion } from "framer-motion";
import { Send, Lock, Unlock, Image, Paperclip, Smile, Mic } from "lucide-react";

export const MessageInput = () => {
  const [messageText, setMessageText] = useState("");
  const [isEncrypted, setIsEncrypted] = useState(true);
  const [isFocused, setIsFocused] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { activeThreadId, threads, sendMessage } = useChatStore();
  const { address } = useAuth();

  const activeThread = threads.find((thread) => thread.id === activeThreadId);

  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
      setIsExpanded(textareaRef.current.scrollHeight > 50);
    }
  }, [messageText]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !activeThread || !address) return;

    let receiverAddress = "";
    if (!activeThread.isGroup) {
      receiverAddress =
        activeThread.participants.find((p) => p !== address) || "";
    } else {
      receiverAddress = activeThread.id;
    }

    try {
      setIsLoading(true);
      await sendMessage(messageText, receiverAddress, isEncrypted);
      setMessageText("");
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
      setIsExpanded(false);
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!activeThread) {
    return null;
  }

  return (
    <div className="p-4 border-t border-[#2b3b4c] bg-[#0e1621]">
      {/* Message tools */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{
          opacity: isFocused || isExpanded ? 1 : 0.7,
          y: 0,
          height: isFocused || isExpanded ? 'auto' : 0,
          marginBottom: isFocused || isExpanded ? 12 : 0
        }}
        transition={{ duration: 0.2 }}
        className="flex items-center justify-between overflow-hidden"
      >
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setIsEncrypted(!isEncrypted)}
            className={`p-2 rounded-full transition-colors ${isEncrypted ? 'text-indigo-400 hover:bg-indigo-600/10' : 'text-gray-400 hover:bg-gray-700/30'}`}
            title={isEncrypted ? "Encrypted message" : "Unencrypted message"}
          >
            {isEncrypted ? <Lock size={16} /> : <Unlock size={16} />}
          </button>

          <span className="text-xs font-medium text-gray-400 ml-1">
            {isEncrypted ? "Encrypted" : "Unencrypted"}
          </span>
        </div>

        <div className="flex space-x-1">
          <button
            className="p-2 rounded-full text-gray-400 hover:text-gray-200 hover:bg-gray-700/30 transition-colors"
            title="Attach file"
          >
            <Paperclip size={16} />
          </button>
          <button
            className="p-2 rounded-full text-gray-400 hover:text-gray-200 hover:bg-gray-700/30 transition-colors"
            title="Send image"
          >
            <Image size={16} />
          </button>
          <button
            className="p-2 rounded-full text-gray-400 hover:text-gray-200 hover:bg-gray-700/30 transition-colors"
            title="Voice message"
          >
            <Mic size={16} />
          </button>
          <button
            className="p-2 rounded-full text-gray-400 hover:text-gray-200 hover:bg-gray-700/30 transition-colors"
            title="Emoji"
          >
            <Smile size={16} />
          </button>
        </div>
      </motion.div>

      {/* Message input */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Type a message..."
          className="w-full px-4 py-3 pr-12 bg-[#1e2c3a] border border-[#2b3b4c] rounded-2xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white resize-none transition-all"
          style={{ minHeight: "50px" }}
        />

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSendMessage}
          disabled={!messageText.trim() || isLoading}
          className={`absolute right-3 bottom-3 p-2 rounded-full ${
            !messageText.trim() || isLoading
              ? "bg-[#2b3b4c] text-gray-500 cursor-not-allowed"
              : "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white hover:shadow-md hover:from-indigo-500 hover:to-indigo-600"
          } transition-all focus:outline-none`}
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <Send size={18} className="text-white" />
          )}
        </motion.button>
      </div>

      {/* Character count - only show when approaching limit */}
      {messageText.length > 200 && (
        <div className="mt-2 text-xs text-right">
          <span className={messageText.length > 500 ? "text-red-400" : "text-gray-400"}>
            {messageText.length}/1000
          </span>
        </div>
      )}
    </div>
  );
};
