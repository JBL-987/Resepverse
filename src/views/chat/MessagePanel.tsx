import { useChatStore } from "../../store/chatStore";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { motion, AnimatePresence } from "framer-motion";

export const MessagePanel = () => {
  const { activeThreadId, threads } = useChatStore();
  
  const activeThread = threads.find(thread => thread.id === activeThreadId);
  
  if (!activeThread) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-black text-gray-400 p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-md"
        >
          <svg 
            className="w-16 h-16 mx-auto mb-4 text-indigo-500 opacity-50" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1.5} 
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" 
            />
          </svg>
          <h3 className="text-xl font-medium mb-2">No conversation selected</h3>
          <p>Select an existing conversation or start a new one to begin chatting</p>
        </motion.div>
      </div>
    );
  }
  
  return (
    <AnimatePresence mode="wait">
      <motion.div 
        key={activeThreadId}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="flex flex-col h-full"
      >
        <MessageList />
        <MessageInput />
      </motion.div>
    </AnimatePresence>
  );
};
