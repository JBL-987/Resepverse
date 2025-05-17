import { useState } from "react";
import { useChatStore } from "../../store/chatStore";
import { useAuth } from "../../contexts/AuthContext";

export const MessageInput = () => {
  const [messageText, setMessageText] = useState("");
  const [isEncrypted, setIsEncrypted] = useState(true);
  const { activeThreadId, threads, sendMessage } = useChatStore();
  const { address } = useAuth();

  const activeThread = threads.find((thread) => thread.id === activeThreadId);

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
    <div className="p-4 border-t border-[#2b3b4c] bg-[#0e1621]">
      <div className="flex items-center mb-2 justify-between">
        <label className="flex items-center text-sm text-gray-400">
          <div className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none bg-[#1e2c3a]">
            <input
              type="checkbox"
              checked={isEncrypted}
              onChange={(e) => setIsEncrypted(e.target.checked)}
              className="sr-only"
            />
            <span
              className={`inline-block h-4 w-4 transform rounded-full transition-transform ${
                isEncrypted
                  ? "translate-x-4 bg-indigo-600"
                  : "translate-x-1 bg-gray-500"
              }`}
            />
          </div>
          <span className="ml-2 text-xs font-medium">Encrypt message</span>
        </label>

        <div className="flex space-x-2">
          <button className="w-8 h-8 rounded-full bg-[#1e2c3a] flex items-center justify-center hover:bg-[#2b3b4c] transition-colors">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-gray-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
          </button>
          <button className="w-8 h-8 rounded-full bg-[#1e2c3a] flex items-center justify-center hover:bg-[#2b3b4c] transition-colors">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-gray-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <polyline points="21 15 16 10 5 21"></polyline>
            </svg>
          </button>
        </div>
      </div>

      <div className="relative">
        <textarea
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="w-full px-4 py-3 bg-[#1e2c3a] border border-[#2b3b4c] rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-white resize-none"
          rows={1}
          style={{ minHeight: "44px", maxHeight: "120px" }}
        />

        <button
          onClick={handleSendMessage}
          disabled={!messageText.trim()}
          className={`absolute right-2 bottom-2 p-2 rounded-full ${
            !messageText.trim()
              ? "bg-[#2b3b4c] text-gray-500 cursor-not-allowed"
              : "bg-indigo-600 text-white hover:bg-indigo-700"
          } transition-colors focus:outline-none`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </div>
    </div>
  );
};
