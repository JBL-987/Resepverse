import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useChatStore } from "../../store/chatStore";
import { Sidebar } from "./Sidebar";
import { ThreadList } from "./ThreadList";
import { MessagePanel } from "./MessagePanel";
import { Header } from "./Header";

export const Chat: React.FC = () => {
  const { threadId } = useParams<{ threadId: string }>();
  const { setActiveThread, currentUser, syncMessagesFromBlockchain } = useChatStore();
  
  useEffect(() => {
    if (threadId) {
      setActiveThread(threadId);
    }
  }, [threadId, setActiveThread]);

  useEffect(() => {
    if (currentUser) {
      syncMessagesFromBlockchain();
    }
  }, [currentUser, syncMessagesFromBlockchain]);
  
  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <Sidebar />
      
      <div className="flex flex-col flex-1">
        <Header />
        
        <div className="flex flex-1 overflow-hidden">
          <div className="w-64 border-r border-gray-700 bg-gray-800">
            <ThreadList />
          </div>
          
          <div className="flex-1">
            <MessagePanel />
          </div>
        </div>
      </div>
    </div>
  );
};
