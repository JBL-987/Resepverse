import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface ChatMessage {
  id: string;
  sender: string;
  senderName: string;
  receiver: string;
  content: string;
  timestamp: number;
  isEncrypted: boolean;
  transactionHash?: string;
  isRead: boolean;
}

export interface Contact {
  address: string;
  name: string;
  avatar?: string;
  lastSeen?: number;
}

export interface ChatThread {
  id: string;
  participants: string[];
  messages: ChatMessage[];
  lastActivity: number;
  isGroup: boolean;
  groupName?: string;
  unreadCount: number;
}

export interface ChatUser {
  address: string;
  name: string;
  avatar?: string;
  publicKey?: string;
  status?: string;
  isOnline: boolean;
  agentEnabled?: boolean;
  agentLastActive?: number;
}

interface ChatStore {
  currentUser: ChatUser | null;
  contacts: Contact[];
  threads: ChatThread[];
  activeThreadId: string | null;

  setCurrentUser: (user: ChatUser) => void;
  updateUserProfile: (updates: Partial<ChatUser>) => void;
  setUserOnlineStatus: (isOnline: boolean) => void;
  logout: () => void;

  addContact: (contact: Contact) => void;
  removeContact: (address: string) => void;
  updateContact: (address: string, updates: Partial<Contact>) => void;

  createThread: (
    participants: string[],
    isGroup?: boolean,
    groupName?: string
  ) => string;
  deleteThread: (threadId: string) => void;
  setActiveThread: (threadId: string) => void;

  sendMessage: (
    content: string,
    receiverAddress: string,
    isEncrypted?: boolean
  ) => Promise<void>;
  markThreadAsRead: (threadId: string) => void;
  deleteMessage: (threadId: string, messageId: string) => void;

  connectWallet: (address: string) => void;
  syncMessagesFromBlockchain: () => Promise<void>;

  // AI Agent related functions
  enableAgent: (enabled: boolean) => void;
  updateAgentActivity: () => void;
  sendAgentMessage: (content: string, threadId: string) => Promise<void>;
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      currentUser: null,
      contacts: [],
      threads: [],
      activeThreadId: null,

      setCurrentUser: (user) => set({ currentUser: user }),
      updateUserProfile: (updates) =>
        set((state) => ({
          currentUser: state.currentUser
            ? { ...state.currentUser, ...updates }
            : null,
        })),
      setUserOnlineStatus: (isOnline) =>
        set((state) => ({
          currentUser: state.currentUser
            ? { ...state.currentUser, isOnline }
            : null,
        })),
      logout: () => set({ currentUser: null, activeThreadId: null }),

      addContact: (contact) =>
        set((state) => ({
          contacts: [...state.contacts, contact],
        })),
      removeContact: (address) =>
        set((state) => ({
          contacts: state.contacts.filter((c) => c.address !== address),
        })),
      updateContact: (address, updates) =>
        set((state) => ({
          contacts: state.contacts.map((c) =>
            c.address === address ? { ...c, ...updates } : c
          ),
        })),

      createThread: (participants, isGroup = false, groupName = "") => {
        const threadId = `thread_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`;
        set((state) => ({
          threads: [
            ...state.threads,
            {
              id: threadId,
              participants,
              messages: [],
              lastActivity: Date.now(),
              isGroup,
              groupName: isGroup ? groupName : undefined,
              unreadCount: 0,
            },
          ],
          activeThreadId: threadId,
        }));
        return threadId;
      },

      deleteThread: (threadId) => {
        set((state) => {
          const filteredThreads = state.threads.filter(
            (t) => t.id !== threadId
          );
          let newActiveThreadId = state.activeThreadId;
          if (state.activeThreadId === threadId) {
            newActiveThreadId =
              filteredThreads.length > 0 ? filteredThreads[0].id : null;
          }

          return {
            threads: filteredThreads,
            activeThreadId: newActiveThreadId,
          };
        });
      },

      setActiveThread: (threadId) => {
        set({ activeThreadId: threadId });
        get().markThreadAsRead(threadId);
      },

      sendMessage: async (content, receiverAddress, isEncrypted = false) => {
        const { currentUser, threads, activeThreadId } = get();

        if (!currentUser) return;

        const newMessage: ChatMessage = {
          id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          sender: currentUser.address,
          senderName: currentUser.name,
          receiver: receiverAddress,
          content,
          timestamp: Date.now(),
          isEncrypted,
          isRead: false,
        };

        let targetThreadId = activeThreadId;
        let threadExists = threads.some(
          (t) =>
            t.id === targetThreadId && t.participants.includes(receiverAddress)
        );

        if (!threadExists) {
          targetThreadId = get().createThread([
            currentUser.address,
            receiverAddress,
          ]);
        }

        set((state) => ({
          threads: state.threads.map((t) =>
            t.id === targetThreadId
              ? {
                  ...t,
                  messages: [...t.messages, newMessage],
                  lastActivity: Date.now(),
                  unreadCount:
                    t.id === state.activeThreadId ? 0 : t.unreadCount + 1,
                }
              : t
          ),
        }));

        await new Promise((resolve) => setTimeout(resolve, 500));

        set((state) => ({
          threads: state.threads.map((t) =>
            t.id === targetThreadId
              ? {
                  ...t,
                  messages: t.messages.map((m) =>
                    m.id === newMessage.id
                      ? {
                          ...m,
                          transactionHash: `0x${Math.random()
                            .toString(36)
                            .substr(2, 64)}`,
                        }
                      : m
                  ),
                }
              : t
          ),
        }));
      },
      markThreadAsRead: (threadId) =>
        set((state) => ({
          threads: state.threads.map((t) =>
            t.id === threadId
              ? {
                  ...t,
                  unreadCount: 0,
                  messages: t.messages.map((m) => ({ ...m, isRead: true })),
                }
              : t
          ),
        })),
      deleteMessage: (threadId, messageId) =>
        set((state) => ({
          threads: state.threads.map((t) =>
            t.id === threadId
              ? { ...t, messages: t.messages.filter((m) => m.id !== messageId) }
              : t
          ),
        })),

      connectWallet: (address) => {
        console.log(`Connected wallet: ${address}`);
        set({
          currentUser: {
            address,
            name: `User_${address.substring(0, 6)}`,
            isOnline: true,
            agentEnabled: false,
          },
        });
      },
      syncMessagesFromBlockchain: async () => {
        console.log("Syncing messages from blockchain...");
        await new Promise((resolve) => setTimeout(resolve, 1000));
        console.log("Messages synced from blockchain");
      },

      // AI Agent related functions
      enableAgent: (enabled) =>
        set((state) => ({
          currentUser: state.currentUser
            ? {
                ...state.currentUser,
                agentEnabled: enabled,
                agentLastActive: enabled ? Date.now() : undefined,
              }
            : null,
        })),

      updateAgentActivity: () =>
        set((state) => ({
          currentUser: state.currentUser
            ? { ...state.currentUser, agentLastActive: Date.now() }
            : null,
        })),

      sendAgentMessage: async (content, threadId) => {
        const { currentUser, threads } = get();

        if (!currentUser || !currentUser.agentEnabled) return;

        // Find the thread
        const thread = threads.find((t) => t.id === threadId);
        if (!thread) return;

        // Determine the receiver (for direct messages)
        const receiverAddress = thread.isGroup
          ? thread.participants.find((p) => p !== currentUser.address) || ""
          : thread.participants.find((p) => p !== currentUser.address) || "";

        const newMessage: ChatMessage = {
          id: `agent_msg_${Date.now()}_${Math.random()
            .toString(36)
            .substr(2, 9)}`,
          sender: currentUser.address,
          senderName: `${currentUser.name}'s Agent`,
          receiver: receiverAddress,
          content,
          timestamp: Date.now(),
          isEncrypted: false,
          isRead: false,
        };

        set((state) => ({
          threads: state.threads.map((t) =>
            t.id === threadId
              ? {
                  ...t,
                  messages: [...t.messages, newMessage],
                  lastActivity: Date.now(),
                }
              : t
          ),
        }));

        // Update agent activity timestamp
        get().updateAgentActivity();

        await new Promise((resolve) => setTimeout(resolve, 500));

        set((state) => ({
          threads: state.threads.map((t) =>
            t.id === threadId
              ? {
                  ...t,
                  messages: t.messages.map((m) =>
                    m.id === newMessage.id
                      ? {
                          ...m,
                          transactionHash: `0x${Math.random()
                            .toString(36)
                            .substr(2, 64)}`,
                        }
                      : m
                  ),
                }
              : t
          ),
        }));
      },
    }),
    {
      name: "blockchain-chat-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        contacts: state.contacts,
        threads: state.threads,
      }),
    }
  )
);
