import React from "react";
import { useChatStore } from "../../store/chatStore";
import { useAuth } from "../../contexts/AuthContext";

export const ThreadList: React.FC = () => {
  const { threads, activeThreadId, setActiveThread } = useChatStore();
  const { address } = useAuth();
  
  // Sort threads by last activity (most recent first)
  const sortedThreads = [...threads].sort((a, b) => b.lastActivity - a.lastActivity);
  
  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-lg font-medium">Conversations</h2>
      </div>
      
      <div>
        {sortedThreads.length === 0 ? (
          <p className="text-gray-400 text-center p-4">No conversations yet</p>
        ) : (
          sortedThreads.map((thread) => {
            const isActive = thread.id === activeThreadId;
            
            // Get display name for the thread
            let displayName = thread.groupName || "Group Chat";
            if (!thread.isGroup) {
              const otherParticipant = thread.participants.find(p => p !== address);
              if (otherParticipant) {
                displayName = `${otherParticipant.substring(0, 6)}...${otherParticipant.substring(otherParticipant.length - 4)}`;
              }
            }
            
            const lastMessage = thread.messages[thread.messages.length - 1];
            
            return (
              <div
                key={thread.id}
                className={`p-4 border-b border-gray-700 cursor-pointer ${
                  isActive ? "bg-gray-700" : "hover:bg-gray-700"
                }`}
                onClick={() => setActiveThread(thread.id)}
              >
                <div className="flex justify-between items-center">
                  <div className="font-medium">{displayName}</div>
                  {thread.unreadCount > 0 && (
                    <div className="px-2 py-1 text-xs bg-blue-600 rounded-full">
                      {thread.unreadCount}
                    </div>
                  )}
                </div>
                
                {lastMessage && (
                  <div className="mt-1 text-sm text-gray-400 line-clamp-1">
                    {lastMessage.content}
                  </div>
                )}
                
                <div className="mt-1 text-xs text-gray-500">
                  {thread.lastActivity ? new Date(thread.lastActivity).toLocaleTimeString() : "No activity"}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};