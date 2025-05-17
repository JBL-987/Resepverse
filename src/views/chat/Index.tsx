import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useChatStore } from "../../store/chatStore";
import { Sidebar } from "./Sidebar";
import { ThreadList } from "./ThreadList";
import { MessagePanel } from "./MessagePanel";
import { AgentMessagePanel } from "./AgentMessagePanel";
import { Header } from "./Header";
import {
  createSimulatedAgentThread,
  simulateAgentConversation,
} from "../../services/agentSimulationService";
import { motion } from "framer-motion";

export const Chat: React.FC = () => {
  const { threadId } = useParams<{ threadId: string }>();
  const navigate = useNavigate();
  const {
    setActiveThread,
    currentUser,
    syncMessagesFromBlockchain,
    enableAgent,
    createThread,
    sendAgentMessage,
  } = useChatStore();

  const [showAgentSetupPrompt, setShowAgentSetupPrompt] = useState(false);

  useEffect(() => {
    if (threadId) {
      setActiveThread(threadId);
    }
  }, [threadId, setActiveThread]);

  useEffect(() => {
    if (currentUser) {
      syncMessagesFromBlockchain();

      // Check if agent is configured
      const agentProfile = localStorage.getItem(
        `agent_profile_${currentUser.address}`
      );
      if (!agentProfile && !showAgentSetupPrompt) {
        setShowAgentSetupPrompt(true);
      }
    }
  }, [currentUser, syncMessagesFromBlockchain, showAgentSetupPrompt]);

  const goToAgentSetup = () => {
    navigate("/agent-setup");
  };

  const dismissAgentSetup = () => {
    setShowAgentSetupPrompt(false);
  };

  const createSimulatedConversation = async () => {
    if (!currentUser) return;

    // Create a simulated thread
    const simulatedThread = createSimulatedAgentThread(currentUser.address);

    // Add it to the store
    const newThreadId = createThread(
      simulatedThread.participants,
      simulatedThread.isGroup,
      "Simulated Agent Conversation"
    );

    // Send an initial message from the user's agent
    const initialMessage =
      "Hello, I'm representing my user who is interested in discussing potential collaboration opportunities.";
    await sendAgentMessage(initialMessage, newThreadId);

    // Simulate a response from the other agent
    await simulateAgentConversation(
      currentUser.address,
      newThreadId,
      initialMessage
    );
  };

  const useAgentView = currentUser?.agentEnabled;

  return (
    <div className="flex h-screen bg-[#17212b] text-white">
      <Sidebar />

      <div className="flex flex-col flex-1">
        <Header />

        {showAgentSetupPrompt && (
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 p-3 flex justify-between items-center shadow-md">
            <p className="text-sm font-medium">
              Configure your AI agent to communicate on your behalf
            </p>
            <div className="flex space-x-2">
              <button
                className="px-4 py-1.5 bg-white text-indigo-700 text-sm rounded-full font-medium hover:bg-gray-100 transition-all shadow-sm"
                onClick={goToAgentSetup}
              >
                Setup Agent
              </button>
              <button
                className="px-4 py-1.5 bg-indigo-700 bg-opacity-50 text-white text-sm rounded-full font-medium hover:bg-opacity-70 transition-all"
                onClick={dismissAgentSetup}
              >
                Later
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between px-4 py-3 bg-[#1e2c3a] border-b border-[#2b3b4c] shadow-sm">
          <div className="flex items-center">
            {currentUser?.agentEnabled && (
              <button
                onClick={createSimulatedConversation}
                className="px-4 py-1.5 bg-indigo-600 text-white text-sm rounded-full font-medium hover:bg-indigo-700 transition-all mr-4 shadow-sm"
              >
                Simulate Agent Conversation
              </button>
            )}
          </div>

          <div className="flex items-center">
            <span className="mr-2 text-sm font-medium">AI Agent</span>
            <button
              className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-black ${
                useAgentView ? "bg-indigo-600" : "bg-gray-600"
              }`}
              onClick={() => enableAgent(!useAgentView)}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-200 ease-in-out shadow-sm ${
                  useAgentView ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <motion.div 
            initial={{ width: "72px", opacity: 0.5 }}
            animate={{ width: "18rem", opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="border-r border-[#2b3b4c] bg-[#1e2c3a]"
          >
            <ThreadList />
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="flex-1 bg-[#0e1621]"
          >
            {useAgentView ? <AgentMessagePanel /> : <MessagePanel />}
          </motion.div>
        </div>
      </div>
    </div>
  );
};
