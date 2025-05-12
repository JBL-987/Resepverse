import { useEffect, useRef } from "react";
import { useChatStore } from "../../store/chatStore";
import { useAuth } from "../../contexts/AuthContext";

export const MessageList = () => {
  const { activeThreadId, threads } = useChatStore();
  const { address } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const activeThread = threads.find(thread => thread.id === activeThreadId);
  const messages = activeThread?.messages || [];
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  if (!activeThread) {
    return null;
  }
  
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-black">
      {messages.length === 0 ? (
        <p className="text-center text-gray-400 pt-8">
          No messages yet. Start the conversation!
        </p>
      ) : (
        messages.map((message) => {
          const isCurrentUser = message.sender === address;
          
          return (
            <div
              key={message.id}
              className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs sm:max-w-md rounded-lg px-4 py-2 ${
                  isCurrentUser
                    ? "bg-blue-600 text-white"
                    : "bg-gray-800 text-white"
                }`}
              >
                {!isCurrentUser && (
                  <div className="text-xs font-medium mb-1 text-gray-300">
                    {message.senderName || `${message.sender.substring(0, 6)}...${message.sender.substring(message.sender.length - 4)}`}
                  </div>
                )}
                
                <div className="break-words">{message.content}</div>
                
                <div className="flex justify-end items-center space-x-1 mt-1 text-xs">
                  <span className={`${isCurrentUser ? "text-blue-200" : "text-gray-400"}`}>
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </span>
                  
                  {message.isEncrypted && (
                    <span title="Encrypted">🔒</span>
                  )}
                  
                  {isCurrentUser && (
                    <span title={message.isRead ? "Read" : "Sent"}>
                      {message.isRead ? "✓✓" : "✓"}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};