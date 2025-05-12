import { useChatStore } from "../../store/chatStore";
import { useAuth } from "../../contexts/AuthContext";
import Swal from "sweetalert2";
import { TrashIcon } from "lucide-react";

export const ThreadList = () => {
  const { threads, activeThreadId, setActiveThread, deleteThread } = useChatStore();
  const { address } = useAuth();
  const sortedThreads = [...threads].sort((a, b) => b.lastActivity - a.lastActivity);
  
  const handleDeleteThread = (e, threadId: string) => {
    e.stopPropagation(); 
    Swal.fire({
      title: 'Delete Conversation',
      text: 'Are you sure you want to delete this conversation?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      customClass: {
        popup: 'border border-gray-700',
        confirmButton: 'px-4 py-2 rounded',
        cancelButton: 'px-4 py-2 rounded'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        deleteThread(threadId);
        Swal.fire({
          title: 'Deleted!',
          text: 'Conversation has been deleted.',
          icon: 'success',
          background: '#1a1a1a',
          color: '#fff',
          customClass: {
            popup: 'border border-gray-700'
          },
          timer: 1500,
          showConfirmButton: false
        });
      }
    });
  };

  return (
    <div className="h-full overflow-y-auto bg-black">
      <div className="p-4 border-b border-gray-800">
        <h2 className="text-lg font-medium text-white">Conversations</h2>
      </div>
      
      <div>
        {sortedThreads.length === 0 ? (
          <p className="text-gray-500 text-center p-4">No conversations yet</p>
        ) : (
          sortedThreads.map((thread) => {
            const isActive = thread.id === activeThreadId;
            let displayName = thread.groupName || "Group Chat";
            if (!thread.isGroup) {
              const otherParticipant = thread.participants.find(p => p !== address);
              if (otherParticipant) {
                displayName = `${otherParticipant.substring(0, 6)}...${otherParticipant.substring(otherParticipant.length - 4)}`;
              }
            }
            
            const lastMessage = thread.messages[thread.messages.length - 1];
            
            return (
              <div
                key={thread.id}
                className={`p-4 border-b border-gray-800 cursor-pointer ${
                  isActive ? "bg-gray-800" : "hover:bg-gray-800"
                }`}
                onClick={() => setActiveThread(thread.id)}
              >
                <div className="flex justify-between items-center">
                  <div className="font-medium text-white">{displayName}</div>
                  <div className="flex items-center gap-2">
                    {thread.unreadCount > 0 && (
                      <div className="px-2 py-1 text-xs bg-blue-600 rounded-full text-white">
                        {thread.unreadCount}
                      </div>
                    )}
                    <button 
                      className="p-1 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-700 transition-colors"
                      onClick={(e) => handleDeleteThread(e, thread.id)}
                      title="Delete conversation"
                    >
                      <TrashIcon size={16} />
                    </button>
                  </div>
                </div>
                
                {lastMessage && (
                  <div className="mt-1 text-sm text-gray-400 line-clamp-1">
                    {lastMessage.content}
                  </div>
                )}
                
                <div className="mt-1 text-xs text-gray-500">
                  {thread.lastActivity ? new Date(thread.lastActivity).toLocaleTimeString() : "No activity"}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};