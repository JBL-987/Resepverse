import { useEffect, useRef } from "react";
import { useChatStore } from "../../store/chatStore";
import { useAuth } from "../../contexts/AuthContext";

export const MessageList = () => {
  const { activeThreadId, threads } = useChatStore();
  const { address } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeThread = threads.find((thread) => thread.id === activeThreadId);
  const messages = activeThread?.messages || [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!activeThread) {
    return null;
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#0e1621] custom-scrollbar">
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full">
          <div className="w-20 h-20 rounded-full bg-[#1e2c3a] flex items-center justify-center mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 text-indigo-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
          </div>
          <p className="text-gray-300 font-medium">No messages yet</p>
          <p className="text-gray-500 text-sm mt-2">Start the conversation!</p>
        </div>
      ) : (
        messages.map((message, index) => {
          const isCurrentUser = message.sender === address;
          const showAvatar =
            index === 0 || messages[index - 1]?.sender !== message.sender;
          const messageDate = new Date(message.timestamp);

          // Format time as HH:MM
          const formattedTime = messageDate.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });

          return (
            <div
              key={message.id}
              className={`flex ${
                isCurrentUser ? "justify-end" : "justify-start"
              } ${showAvatar ? "mt-4" : "mt-1"}`}
            >
              {!isCurrentUser && showAvatar && (
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center mr-2 flex-shrink-0 mt-1">
                  <span className="text-white text-xs font-medium">
                    {(message.senderName || message.sender.substring(0, 2))
                      .charAt(0)
                      .toUpperCase()}
                  </span>
                </div>
              )}

              <div
                className={`flex flex-col ${
                  !isCurrentUser && !showAvatar ? "ml-10" : ""
                }`}
              >
                {!isCurrentUser && showAvatar && (
                  <div className="text-xs font-medium mb-1 text-gray-400 ml-1">
                    {message.senderName ||
                      `${message.sender.substring(
                        0,
                        6
                      )}...${message.sender.substring(
                        message.sender.length - 4
                      )}`}
                  </div>
                )}

                <div
                  className={`max-w-xs sm:max-w-md px-3 py-2 ${
                    isCurrentUser
                      ? "bg-indigo-600 text-white rounded-t-lg rounded-l-lg"
                      : "bg-[#182533] text-white rounded-t-lg rounded-r-lg"
                  } ${!showAvatar && !isCurrentUser ? "rounded-tl-none" : ""} ${
                    !showAvatar && isCurrentUser ? "rounded-tr-none" : ""
                  }`}
                >
                  <div className="break-words text-sm">{message.content}</div>
                </div>

                <div
                  className={`flex ${
                    isCurrentUser ? "justify-end" : "justify-start"
                  } items-center space-x-1 mt-0.5 text-xs px-1`}
                >
                  <span className="text-gray-500">{formattedTime}</span>

                  {message.isEncrypted && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3 w-3 text-gray-500"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect
                        x="3"
                        y="11"
                        width="18"
                        height="11"
                        rx="2"
                        ry="2"
                      ></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                  )}

                  {isCurrentUser && (
                    <span
                      className="text-gray-500"
                      title={message.isRead ? "Read" : "Sent"}
                    >
                      {message.isRead ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3 w-3 text-indigo-400"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M18 6L7 17l-5-5"></path>
                          <path d="M22 10L11 21l-4-4"></path>
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3 w-3"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M20 6L9 17l-5-5"></path>
                        </svg>
                      )}
                    </span>
                  )}
                </div>
              </div>

              {isCurrentUser && showAvatar && (
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center ml-2 flex-shrink-0 mt-1">
                  <span className="text-white text-xs font-medium">
                    {(message.senderName || "Me").charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
          );
        })
      )}
      <div ref={messagesEndRef} className="h-4" />
    </div>
  );
};
