import { useState } from "react";
import { useChatStore } from "../../store/chatStore";
import { useAuth } from "../../contexts/AuthContext";

export const MessageInput = () => {
  const [messageText, setMessageText] = useState("");
  const [isEncrypted, setIsEncrypted] = useState(true);
  const { activeThreadId, threads, sendMessage } = useChatStore();
  const { address } = useAuth();
  
  const activeThread = threads.find(thread => thread.id === activeThreadId);
  
  const handleSendMessage = async () => {
    if (!messageText.trim() || !activeThread || !address) return;
    
    // For direct messages, find the other participant
    let receiverAddress = "";
    if (!activeThread.isGroup) {
      receiverAddress = activeThread.participants.find(p => p !== address) || "";
    } else {
      // For group chats, we'll use thread ID as receiver
      receiverAddress = activeThread.id;
    }
    
    try {
      await sendMessage(messageText, receiverAddress, isEncrypted);
      setMessageText("");
    } catch (error) {
      console.error("Failed to send message:", error);
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
    <div className="p-4 border-t border-gray-800 bg-black">
      <div className="flex items-center mb-2">
        <label className="flex items-center text-sm text-gray-400">
          <input
            type="checkbox"
            checked={isEncrypted}
            onChange={(e) => setIsEncrypted(e.target.checked)}
            className="mr-2 bg-gray-700 border-gray-600"
          />
          Encrypt message
        </label>
      </div>
      
      <div className="flex">
        <textarea
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2 bg-gray-900 border border-gray-700 rounded-l-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-white resize-none"
          rows={2}
        />
        
        <button
          onClick={handleSendMessage}
          disabled={!messageText.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </div>
    </div>
  );
};