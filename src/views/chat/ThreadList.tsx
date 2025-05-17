import { useState } from "react";
import { useChatStore } from "../../store/chatStore";
import { useAuth } from "../../contexts/AuthContext";
import Swal from "sweetalert2";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trash2,
  Plus,
  MessageSquare,
  Search,
  Users,
  MoreVertical,
  Lock,
  CheckCheck
} from "lucide-react";

export const ThreadList = () => {
  const { threads, activeThreadId, setActiveThread, deleteThread } = useChatStore();
  const { address } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Sort threads by last activity and filter by search query if present
  const filteredThreads = [...threads]
    .sort((a, b) => b.lastActivity - a.lastActivity)
    .filter(thread => {
      if (!searchQuery) return true;

      // Search in group name if it's a group
      if (thread.isGroup && thread.groupName) {
        return thread.groupName.toLowerCase().includes(searchQuery.toLowerCase());
      }

      // Search in participant address for non-group chats
      if (!thread.isGroup) {
        const otherParticipant = thread.participants.find(p => p !== address);
        if (otherParticipant) {
          return otherParticipant.toLowerCase().includes(searchQuery.toLowerCase());
        }
      }

      // Search in messages
      return thread.messages.some(msg =>
        msg.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });

  const handleDeleteThread = (e, threadId: string) => {
    e.stopPropagation();
    Swal.fire({
      title: "Delete Conversation",
      text: "Are you sure you want to delete this conversation?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      background: "#1e2c3a",
      color: "#fff",
      customClass: {
        popup: "border border-gray-700 rounded-xl",
        confirmButton: "px-4 py-2 rounded-lg",
        cancelButton: "px-4 py-2 rounded-lg",
        title: "text-xl",
        htmlContainer: "text-gray-300"
      },
    }).then((result) => {
      if (result.isConfirmed) {
        deleteThread(threadId);
        Swal.fire({
          title: "Deleted!",
          text: "Conversation has been deleted.",
          icon: "success",
          background: "#1e2c3a",
          color: "#fff",
          customClass: {
            popup: "border border-gray-700 rounded-xl",
            title: "text-xl",
            htmlContainer: "text-gray-300"
          },
          timer: 1500,
          showConfirmButton: false,
        });
      }
    });
  };

  // Toggle search mode
  const toggleSearch = () => {
    setIsSearching(!isSearching);
    if (isSearching) {
      setSearchQuery("");
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-[#1e2c3a]">
      {/* Header with search functionality */}
      <div className="p-4 border-b border-[#2b3b4c] flex-shrink-0">
        <AnimatePresence mode="wait">
          {isSearching ? (
            <motion.div
              key="search"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="relative"
            >
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conversations..."
                className="w-full py-2 pl-10 pr-4 bg-[#2b3b4c] rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                autoFocus
              />
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <button
                onClick={toggleSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="header"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              className="flex justify-between items-center"
            >
              <h2 className="text-lg font-medium text-white">Conversations</h2>
              <div className="flex items-center space-x-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={toggleSearch}
                  className="w-8 h-8 rounded-full bg-[#2b3b4c] flex items-center justify-center cursor-pointer hover:bg-[#3a4b5c] transition-colors"
                  title="Search conversations"
                >
                  <Search size={16} className="text-gray-300" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center cursor-pointer hover:bg-indigo-700 transition-colors"
                  title="New conversation"
                >
                  <Plus size={16} className="text-white" />
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Thread list with scroll */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <AnimatePresence>
          {filteredThreads.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center justify-center p-8 text-center h-full"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-600/20 to-blue-600/20 flex items-center justify-center mb-4 animate-pulse" style={{ animationDuration: "3s" }}>
                <MessageSquare size={32} className="text-indigo-400" />
              </div>
              <p className="text-gray-300 font-medium">
                {searchQuery ? "No matching conversations" : "No conversations yet"}
              </p>
              <p className="text-sm text-gray-400 mt-2 max-w-xs">
                {searchQuery
                  ? "Try a different search term or clear the search"
                  : "Start a new conversation to begin messaging"}
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white text-sm transition-colors"
                >
                  Clear search
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="divide-y divide-[#2b3b4c]/50">
          {filteredThreads.map((thread, index) => {
            const isActive = thread.id === activeThreadId;
            let displayName = thread.groupName || "Group Chat";
            if (!thread.isGroup) {
              const otherParticipant = thread.participants.find(
                (p) => p !== address
              );
              if (otherParticipant) {
                displayName = `${otherParticipant.substring(
                  0,
                  6
                )}...${otherParticipant.substring(
                  otherParticipant.length - 4
                )}`;
              }
            }

            const lastMessage = thread.messages[thread.messages.length - 1];
            const messageDate = thread.lastActivity
              ? new Date(thread.lastActivity)
              : null;
            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);

            // Enhanced date formatting
            let formattedDate = "No activity";
            if (messageDate) {
              if (messageDate.toDateString() === today.toDateString()) {
                formattedDate = messageDate.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                });
              } else if (messageDate.toDateString() === yesterday.toDateString()) {
                formattedDate = "Yesterday";
              } else if (messageDate > new Date(today.setDate(today.getDate() - 7))) {
                // Within the last week
                formattedDate = messageDate.toLocaleDateString([], {
                  weekday: "short",
                });
              } else {
                formattedDate = messageDate.toLocaleDateString([], {
                  month: "short",
                  day: "numeric",
                });
              }
            }

            // Determine if the last message was sent by the current user
            const isLastMessageFromUser = lastMessage && lastMessage.sender === address;

            return (
              <motion.div
                key={thread.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={`relative p-4 cursor-pointer transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-indigo-600/20 to-indigo-600/10 border-l-2 border-indigo-500"
                    : "hover:bg-[#242f3d] border-l-2 border-transparent"
                }`}
                onClick={() => setActiveThread(thread.id)}
              >
                <div className="flex items-start">
                  {/* Avatar with online indicator */}
                  <div className="relative mr-3 flex-shrink-0">
                    <div className={`w-12 h-12 rounded-full ${
                      thread.isGroup
                        ? "bg-gradient-to-br from-blue-600 to-indigo-600"
                        : "bg-gradient-to-br from-indigo-600 to-violet-600"
                    } flex items-center justify-center shadow-md`}>
                      {thread.isGroup ? (
                        <Users size={20} className="text-white" />
                      ) : (
                        <span className="text-white font-medium text-lg">
                          {displayName.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>

                    {/* Online status indicator - just for UI demonstration */}
                    {!thread.isGroup && Math.random() > 0.5 && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#1e2c3a]"></div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <div className="font-medium text-white truncate">
                        {displayName}
                      </div>
                      <div className="text-xs text-gray-400 ml-2 flex-shrink-0">
                        {formattedDate}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-1">
                      {lastMessage ? (
                        <div className="flex items-center text-sm text-gray-400 truncate max-w-[180px]">
                          {isLastMessageFromUser && (
                            <span className="mr-1 text-xs text-indigo-400">You: </span>
                          )}
                          {lastMessage.isEncrypted && (
                            <Lock size={12} className="inline mr-1 text-gray-500" />
                          )}
                          {lastMessage.content}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500 italic">No messages yet</div>
                      )}

                      <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                        {isLastMessageFromUser && lastMessage?.isRead && (
                          <CheckCheck size={14} className="text-indigo-400" />
                        )}

                        {thread.unreadCount > 0 && (
                          <div className="min-w-5 h-5 px-1.5 flex items-center justify-center text-xs bg-indigo-600 rounded-full text-white font-medium">
                            {thread.unreadCount}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Thread actions - appear on hover */}
                <div className={`absolute right-2 top-2 flex space-x-1 ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-1 text-gray-400 hover:text-red-500 rounded-full hover:bg-[#1e2c3a] transition-colors"
                    onClick={(e) => handleDeleteThread(e, thread.id)}
                    title="Delete conversation"
                  >
                    <Trash2 size={14} />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-1 text-gray-400 hover:text-white rounded-full hover:bg-[#1e2c3a] transition-colors"
                    title="More options"
                  >
                    <MoreVertical size={14} />
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
