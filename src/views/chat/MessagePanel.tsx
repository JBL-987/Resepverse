import { useChatStore } from "../../store/chatStore";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";

export const MessagePanel = () => {
  const { activeThreadId, threads } = useChatStore();
  
  const activeThread = threads.find(thread => thread.id === activeThreadId);
  
  if (!activeThread) {
    return (
      <div className="flex items-center justify-center h-full bg-black text-gray-400">
        Select a conversation or start a new one
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-full">
      <MessageList />
      <MessageInput />
    </div>
  );
};