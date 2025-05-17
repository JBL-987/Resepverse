import { useChatStore } from "../../store/chatStore";
import { useAuth } from "../../contexts/AuthContext";

export const Header = () => {
  const { activeThreadId, threads } = useChatStore();
  const { address } = useAuth();

  const activeThread = threads.find((thread) => thread.id === activeThreadId);

  let headerTitle = "Telepathia Chat";
  if (activeThread) {
    if (activeThread.isGroup) {
      headerTitle = activeThread.groupName || "Group Chat";
    } else {
      const otherParticipant = activeThread.participants.find(
        (p) => p !== address
      );
      if (otherParticipant) {
        headerTitle = `${otherParticipant.substring(
          0,
          6
        )}...${otherParticipant.substring(otherParticipant.length - 4)}`;
      }
    }
  }

  return (
    <header className="flex items-center justify-between p-4 border-b border-[#2b3b4c] bg-[#17212b] shadow-sm">
      <div className="flex items-center">
        {activeThread && (
          <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center mr-3">
            <span className="text-white font-medium">
              {headerTitle.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <div>
          <h2 className="text-lg font-medium text-white">{headerTitle}</h2>
          {activeThread && (
            <div className="text-xs text-gray-400">
              {activeThread.isGroup
                ? `${activeThread.participants.length} participants`
                : activeThread.messages.length > 0
                ? `${activeThread.messages.length} messages`
                : "No messages yet"}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-2">
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
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
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
            <circle cx="12" cy="12" r="1"></circle>
            <circle cx="19" cy="12" r="1"></circle>
            <circle cx="5" cy="12" r="1"></circle>
          </svg>
        </button>
      </div>
    </header>
  );
};

export default Header;
