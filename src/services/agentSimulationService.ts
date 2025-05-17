/**
 * Agent Simulation Service
 * 
 * This service simulates agent-to-agent communication for demonstration purposes.
 * In a production environment, this would be replaced with actual agent communication.
 */

import { ChatMessage, ChatThread, useChatStore } from "../store/chatStore";
import { AgentProfile, generateAgentToAgentResponse } from "./geminiService";

// Sample agent profiles for simulation
const sampleAgentProfiles: Record<string, AgentProfile> = {
  agent1: {
    name: "Alex's Agent",
    bio: "Represents Alex, a software engineer who enjoys hiking and photography.",
    interests: ["technology", "hiking", "photography", "travel"],
    availability: {
      weekdays: true,
      weekends: true,
      mornings: false,
      afternoons: true,
      evenings: true,
    },
    communicationStyle: "casual",
    decisionMaking: "balanced",
  },
  agent2: {
    name: "Sam's Agent",
    bio: "Represents Sam, a marketing professional who loves music and cooking.",
    interests: ["marketing", "music", "cooking", "movies"],
    availability: {
      weekdays: true,
      weekends: false,
      mornings: true,
      afternoons: true,
      evenings: false,
    },
    communicationStyle: "professional",
    decisionMaking: "decisive",
  },
  agent3: {
    name: "Jordan's Agent",
    bio: "Represents Jordan, a teacher who enjoys reading and gardening.",
    interests: ["education", "literature", "gardening", "art"],
    availability: {
      weekdays: false,
      weekends: true,
      mornings: true,
      afternoons: false,
      evenings: true,
    },
    communicationStyle: "friendly",
    decisionMaking: "cautious",
  },
};

/**
 * Simulate a conversation between agents
 */
export const simulateAgentConversation = async (
  userAddress: string,
  threadId: string,
  initialMessage: string
): Promise<void> => {
  const store = useChatStore.getState();
  const thread = store.threads.find(t => t.id === threadId);
  
  if (!thread) return;
  
  // Get the user's agent profile
  const userAgentProfileStr = localStorage.getItem(`agent_profile_${userAddress}`);
  if (!userAgentProfileStr) return;
  
  const userAgentProfile = JSON.parse(userAgentProfileStr) as AgentProfile;
  
  // Determine which sample agent to use based on the thread participants
  const otherParticipant = thread.participants.find(p => p !== userAddress);
  if (!otherParticipant) return;
  
  // Use a sample agent profile based on the participant address
  const agentKey = `agent${(parseInt(otherParticipant.substring(2, 4), 16) % 3) + 1}` as keyof typeof sampleAgentProfiles;
  const otherAgentProfile = sampleAgentProfiles[agentKey];
  
  // Generate context for the conversation
  const context = `
This is a conversation between two AI agents representing their users.
The conversation is about: ${initialMessage}
`;
  
  // Simulate a delay for realism
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Generate a response from the other agent
  const response = await generateAgentToAgentResponse(
    userAgentProfile,
    otherAgentProfile,
    initialMessage,
    context
  );
  
  // Create a message from the other agent
  const newMessage: ChatMessage = {
    id: `sim_msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    sender: otherParticipant,
    senderName: `${otherAgentProfile.name}`,
    receiver: userAddress,
    content: response,
    timestamp: Date.now(),
    isEncrypted: false,
    isRead: false,
  };
  
  // Update the thread with the new message
  store.threads = store.threads.map(t => 
    t.id === threadId
      ? {
          ...t,
          messages: [...t.messages, newMessage],
          lastActivity: Date.now(),
          unreadCount: t.unreadCount + 1
        }
      : t
  );
  
  // Trigger a store update
  useChatStore.setState({ threads: store.threads });
};

/**
 * Create a simulated agent conversation thread
 */
export const createSimulatedAgentThread = (userAddress: string): ChatThread => {
  // Choose a random sample agent
  const agentKey = `agent${Math.floor(Math.random() * 3) + 1}` as keyof typeof sampleAgentProfiles;
  const agentProfile = sampleAgentProfiles[agentKey];
  
  // Generate a simulated address for the agent
  const simulatedAddress = `0x${Math.random().toString(36).substr(2, 40)}`;
  
  // Create a new thread
  const threadId = `sim_thread_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  return {
    id: threadId,
    participants: [userAddress, simulatedAddress],
    messages: [],
    lastActivity: Date.now(),
    isGroup: false,
    unreadCount: 0
  };
};
