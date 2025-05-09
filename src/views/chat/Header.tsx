import { useChatStore } from "../../store/chatStore";
import { useAuth } from "../../contexts/AuthContext";

export const Header = () => {
  const { activeThreadId, threads } = useChatStore();
  const { address } = useAuth();
  
  const activeThread = threads.find(thread => thread.id === activeThreadId);
  
  let headerTitle = "Telepathia Chat";
  if (activeThread) {
    if (activeThread.isGroup) {
      headerTitle = activeThread.groupName || "Group Chat";
    } else {
      const otherParticipant = activeThread.participants.find(p => p !== address);
      if (otherParticipant) {
        headerTitle = `${otherParticipant.substring(0, 6)}...${otherParticipant.substring(otherParticipant.length - 4)}`;
      }
    }
  }
  
  return (
    <header className="flex items-center justify-between p-4 border-b border-gray-800 bg-black">
      <h2 className="text-lg font-medium text-white">{headerTitle}</h2>
      
      {activeThread && !activeThread.isGroup && (
        <div className="text-sm text-gray-400">
          {activeThread.messages.length} messages
        </div>
      )}
    </header>
  );
};

export default Header;