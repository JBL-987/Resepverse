import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useChatStore } from "../../store/chatStore";
import { ContactList } from "./ContactList";
import { 
  User, 
  LogOut, 
  Edit, 
  UserPlus, 
  Save, 
  Copy, 
  Check 
} from "lucide-react";

export const Sidebar = () => {
  const [activeTab, setActiveTab] = useState("contacts");
  const [copied, setCopied] = useState(false);
  const { address, disconnect } = useAuth();
  const { currentUser, updateUserProfile } = useChatStore();
  const [username, setUsername] = useState(currentUser?.name || "");
  const [status, setStatus] = useState(currentUser?.status || "");
  
  useEffect(() => {
    if (currentUser) {
      setUsername(currentUser.name || "");
      setStatus(currentUser.status || "");
    }
  }, [currentUser]);
  
  const handleSaveProfile = () => {
    if (username.trim()) {
      updateUserProfile({ 
        name: username,
        status: status 
      });
    }
  };
  
  const handleLogout = () => {
    disconnect();
  };
  
  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  
  const truncateAddress = (addr) => {
    if (!addr) return "Not connected";
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };
  
  return (
    <div className="w-64 h-full bg-black border-r border-gray-800 flex flex-col">
      <div className="p-4 border-b border-gray-800 flex items-center">
        <div className="w-8 h-8 rounded-md bg-blue-600 flex items-center justify-center mr-2">
          <span className="text-white font-bold">T</span>
        </div>
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
          Telepathia
        </h1>
      </div>
      
      <div className="flex border-b border-gray-800">
        <button
          className={`flex-1 py-3 flex items-center justify-center space-x-2 transition-colors ${
            activeTab === "contacts" 
              ? "text-blue-400 border-b-2 border-blue-400" 
              : "text-gray-400 hover:text-gray-300"
          }`}
          onClick={() => setActiveTab("contacts")}
        >
          <UserPlus size={16} />
          <span>Contacts</span>
        </button>
        <button
          className={`flex-1 py-3 flex items-center justify-center space-x-2 transition-colors ${
            activeTab === "profile" 
              ? "text-blue-400 border-b-2 border-blue-400" 
              : "text-gray-400 hover:text-gray-300"
          }`}
          onClick={() => setActiveTab("profile")}
        >
          <User size={16} />
          <span>Profile</span>
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {activeTab === "contacts" ? (
          <ContactList />
        ) : (
          <div className="p-4 space-y-4">
            <div className="flex justify-center py-4">
              <div className="w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center relative group">
                <User size={32} className="text-gray-400" />
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Edit size={16} className="text-white" />
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Username
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-3 pr-10 py-2 bg-gray-900 border border-gray-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-white"
                  placeholder="Enter username"
                />
                <User size={16} className="absolute right-3 top-2.5 text-gray-500" />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Status
              </label>
              <input
                type="text"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-white"
                placeholder="What's on your mind?"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1 flex justify-between">
                <span>Wallet Address</span>
                {address && (
                  <button 
                    onClick={copyAddress}
                    className="text-xs text-blue-400 hover:text-blue-300 flex items-center"
                  >
                    {copied ? (
                      <>
                        <Check size={12} className="mr-1" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy size={12} className="mr-1" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                )}
              </label>
              <div className="px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-gray-300 text-sm flex justify-between items-center">
                <span className="truncate">{truncateAddress(address)}</span>
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
              </div>
            </div>
 
            <button
              onClick={handleSaveProfile}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
            >
              <Save size={16} />
              <span>Save Profile</span>
            </button>
          </div>
        )}
      </div>
      
      <div className="p-4 border-t border-gray-800">
        <button
          onClick={handleLogout}
          className="w-full px-4 py-2 bg-gray-900 text-red-400 rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center space-x-2"
        >
          <LogOut size={16} />
          <span>Disconnect Wallet</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;