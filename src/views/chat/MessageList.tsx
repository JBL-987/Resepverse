import { useEffect, useRef, useState } from "react";
import { useChatStore } from "../../store/chatStore";
import { useAuth } from "../../contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Lock, CheckCheck, Check } from "lucide-react";

export const MessageList = () => {
  const { activeThreadId, threads } = useChatStore();
  const { address } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeThread = threads.find((thread) => thread.id === activeThreadId);
  const messages = activeThread?.messages || [];

  // Handle scrolling and scroll button visibility
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;

      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowScrollButton(!isNearBottom && messages.length > 0);
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [messages.length]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0 && !showScrollButton) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, showScrollButton]);

  // Scroll to bottom function
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    setShowScrollButton(false);
  };

  // Format date for message grouping
  const formatMessageDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!activeThread) {
    return null;
  }

  // Group messages by date
  const groupedMessages: { [key: string]: typeof messages } = {};
  messages.forEach(message => {
    const date = formatMessageDate(message.timestamp);
    if (!groupedMessages[date]) {
      groupedMessages[date] = [];
    }
    groupedMessages[date].push(message);
  });

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0e1621] custom-scrollbar relative"
    >
      {messages.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center h-full"
        >
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-600/20 to-blue-600/20 flex items-center justify-center mb-6 animate-pulse" style={{ animationDuration: "3s" }}>
            <MessageSquare size={40} className="text-indigo-400" />
          </div>
          <h3 className="text-xl font-medium text-white mb-2">No messages yet</h3>
          <p className="text-gray-400 text-center max-w-xs">
            Start the conversation by sending a message below!
          </p>
        </motion.div>
      ) : (
        <>
          {/* Date-grouped messages */}
          {Object.entries(groupedMessages).map(([date, dateMessages]) => (
            <div key={date} className="space-y-3">
              {/* Date separator */}
              <div className="flex items-center justify-center my-6">
                <div className="h-px bg-gray-700 flex-grow"></div>
                <span className="px-4 text-xs text-gray-500">{date}</span>
                <div className="h-px bg-gray-700 flex-grow"></div>
              </div>

              {/* Messages for this date */}
              {dateMessages.map((message, index) => {
                const isCurrentUser = message.sender === address;
                const showAvatar =
                  index === 0 || dateMessages[index - 1]?.sender !== message.sender;
                const messageDate = new Date(message.timestamp);
                const isFirstInGroup = index === 0 || dateMessages[index - 1]?.sender !== message.sender;
                const isLastInGroup = index === dateMessages.length - 1 || dateMessages[index + 1]?.sender !== message.sender;

                // Format time as HH:MM
                const formattedTime = messageDate.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex ${
                      isCurrentUser ? "justify-end" : "justify-start"
                    } ${isFirstInGroup ? "mt-4" : "mt-1"}`}
                  >
                    {/* Avatar for other user */}
                    {!isCurrentUser && isFirstInGroup && (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center mr-3 flex-shrink-0 shadow-md">
                        <span className="text-white text-sm font-medium">
                          {(message.senderName || message.sender.substring(0, 2))
                            .charAt(0)
                            .toUpperCase()}
                        </span>
                      </div>
                    )}

                    <div
                      className={`flex flex-col ${
                        !isCurrentUser && !isFirstInGroup ? "ml-13" : ""
                      }`}
                    >
                      {/* Sender name */}
                      {!isCurrentUser && isFirstInGroup && (
                        <div className="text-xs font-medium mb-1 text-gray-300 ml-1">
                          {message.senderName ||
                            `${message.sender.substring(
                              0,
                              6
                            )}...${message.sender.substring(
                              message.sender.length - 4
                            )}`}
                        </div>
                      )}

                      {/* Message bubble */}
                      <div
                        className={`max-w-xs sm:max-w-md px-4 py-3 ${
                          isCurrentUser
                            ? "bg-gradient-to-br from-indigo-600 to-indigo-700 text-white"
                            : "bg-[#1e2c3a] text-white"
                        } ${
                          isFirstInGroup && isLastInGroup
                            ? isCurrentUser
                              ? "rounded-2xl"
                              : "rounded-2xl"
                            : isFirstInGroup
                            ? isCurrentUser
                              ? "rounded-t-2xl rounded-l-2xl rounded-br-md"
                              : "rounded-t-2xl rounded-r-2xl rounded-bl-md"
                            : isLastInGroup
                            ? isCurrentUser
                              ? "rounded-b-2xl rounded-l-2xl rounded-tr-md"
                              : "rounded-b-2xl rounded-r-2xl rounded-tl-md"
                            : isCurrentUser
                            ? "rounded-l-2xl rounded-tr-md rounded-br-md"
                            : "rounded-r-2xl rounded-tl-md rounded-bl-md"
                        } shadow-sm`}
                      >
                        <div className="break-words text-sm leading-relaxed">{message.content}</div>
                      </div>

                      {/* Message metadata */}
                      <div
                        className={`flex ${
                          isCurrentUser ? "justify-end" : "justify-start"
                        } items-center space-x-1 mt-1 text-xs px-1`}
                      >
                        <span className="text-gray-500">{formattedTime}</span>

                        {message.isEncrypted && (
                          <Lock size={12} className="text-gray-500" />
                        )}

                        {isCurrentUser && (
                          <span
                            className="text-gray-500"
                            title={message.isRead ? "Read" : "Sent"}
                          >
                            {message.isRead ? (
                              <CheckCheck size={12} className="text-indigo-400" />
                            ) : (
                              <Check size={12} className="text-gray-500" />
                            )}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Avatar for current user */}
                    {isCurrentUser && isFirstInGroup && (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center ml-3 flex-shrink-0 shadow-md">
                        <span className="text-white text-sm font-medium">
                          {(message.senderName || "Me").charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          ))}
          <div ref={messagesEndRef} className="h-4" />

          {/* Scroll to bottom button */}
          <AnimatePresence>
            {showScrollButton && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
                onClick={scrollToBottom}
                className="absolute bottom-6 right-6 p-3 rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 transition-colors"
                aria-label="Scroll to bottom"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
              </motion.button>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
};
