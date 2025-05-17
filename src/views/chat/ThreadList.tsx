import { useChatStore } from "../../store/chatStore";
import { useAuth } from "../../contexts/AuthContext";
import Swal from "sweetalert2";
import { TrashIcon } from "lucide-react";

export const ThreadList = () => {
  const { threads, activeThreadId, setActiveThread, deleteThread } =
    useChatStore();
  const { address } = useAuth();
  const sortedThreads = [...threads].sort(
    (a, b) => b.lastActivity - a.lastActivity
  );

  const handleDeleteThread = (e, threadId: string) => {
    e.stopPropagation();
    Swal.fire({
      title: "Delete Conversation",
      text: "Are you sure you want to delete this conversation?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      customClass: {
        popup: "border border-gray-700",
        confirmButton: "px-4 py-2 rounded",
        cancelButton: "px-4 py-2 rounded",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        deleteThread(threadId);
        Swal.fire({
          title: "Deleted!",
          text: "Conversation has been deleted.",
          icon: "success",
          background: "#1a1a1a",
          color: "#fff",
          customClass: {
            popup: "border border-gray-700",
          },
          timer: 1500,
          showConfirmButton: false,
        });
      }
    });
  };

  return (
    <div className="h-full overflow-y-auto bg-[#1e2c3a] custom-scrollbar">
      <div className="p-4 border-b border-[#2b3b4c] flex justify-between items-center">
        <h2 className="text-lg font-medium text-white">Conversations</h2>
        <div className="w-7 h-7 rounded-full bg-[#2b3b4c] flex items-center justify-center cursor-pointer hover:bg-indigo-600 transition-colors">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </div>
      </div>

      <div>
        {sortedThreads.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-[#2b3b4c] flex items-center justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-indigo-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
            </div>
            <p className="text-gray-400">No conversations yet</p>
            <p className="text-xs text-gray-500 mt-2">
              Start a new conversation to begin messaging
            </p>
          </div>
        ) : (
          sortedThreads.map((thread) => {
            const isActive = thread.id === activeThreadId;
            let displayName = thread.groupName || "Group Chat";
            if (!thread.isGroup) {
              const otherParticipant = thread.participants.find(
                (p) => p !== address
              );
              if (otherParticipant) {
                displayName = `${otherParticipant.substring(
                  0,
                  6
                )}...${otherParticipant.substring(
                  otherParticipant.length - 4
                )}`;
              }
            }

            const lastMessage = thread.messages[thread.messages.length - 1];
            const messageDate = thread.lastActivity
              ? new Date(thread.lastActivity)
              : null;
            const today = new Date();

            // Format date: show time if today, otherwise show date
            const formattedDate = messageDate
              ? messageDate.toDateString() === today.toDateString()
                ? messageDate.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : messageDate.toLocaleDateString([], {
                    month: "short",
                    day: "numeric",
                  })
              : "No activity";

            return (
              <div
                key={thread.id}
                className={`p-4 cursor-pointer transition-all duration-200 ${
                  isActive ? "bg-[#2b5278]" : "hover:bg-[#242f3d]"
                }`}
                onClick={() => setActiveThread(thread.id)}
              >
                <div className="flex items-center mb-1">
                  <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center mr-3 flex-shrink-0">
                    <span className="text-white font-medium">
                      {displayName.charAt(0).toUpperCase()}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <div className="font-medium text-white truncate">
                        {displayName}
                      </div>
                      <div className="text-xs text-gray-400 ml-2 flex-shrink-0">
                        {formattedDate}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-1">
                      {lastMessage && (
                        <div className="text-sm text-gray-400 truncate max-w-[180px]">
                          {lastMessage.content}
                        </div>
                      )}

                      <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                        {thread.unreadCount > 0 && (
                          <div className="w-5 h-5 flex items-center justify-center text-xs bg-indigo-600 rounded-full text-white">
                            {thread.unreadCount}
                          </div>
                        )}
                        <button
                          className="p-1 text-gray-400 hover:text-red-500 rounded-full hover:bg-[#1e2c3a] transition-colors"
                          onClick={(e) => handleDeleteThread(e, thread.id)}
                          title="Delete conversation"
                        >
                          <TrashIcon size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
