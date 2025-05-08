import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useChatStore } from "../../store/chatStore";
import { ContactList } from "./ContactList";

export const Sidebar: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"contacts" | "profile">("contacts");
  const { address, disconnect } = useAuth();
  const { currentUser, updateUserProfile } = useChatStore();
  const [username, setUsername] = useState(currentUser?.name || "");
  
  const handleSaveProfile = () => {
    if (username.trim()) {
      updateUserProfile({ name: username });
    }
  };
  
  const handleLogout = () => {
    disconnect();
  };
  
  return (
    <div className="w-64 h-full bg-gray-800 border-r border-gray-700 flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h1 className="text-xl font-bold text-blue-400">Telepathia</h1>
      </div>
      
      <div className="flex border-b border-gray-700">
        <button
          className={`flex-1 py-3 ${activeTab === "contacts" ? "text-blue-400 border-b-2 border-blue-400" : "text-gray-400"}`}
          onClick={() => setActiveTab("contacts")}
        >
          Contacts
        </button>
        <button
          className={`flex-1 py-3 ${activeTab === "profile" ? "text-blue-400 border-b-2 border-blue-400" : "text-gray-400"}`}
          onClick={() => setActiveTab("profile")}
        >
          Profile
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {activeTab === "contacts" ? (
          <ContactList />
        ) : (
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Wallet Address
              </label>
              <div className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-300 text-sm break-all">
                {address ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}` : "Not connected"}
              </div>
            </div>
            
            <button
              onClick={handleSaveProfile}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800"
            >
              Save Profile
            </button>
          </div>
        )}
      </div>
      
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={handleLogout}
          className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-800"
        >
          Disconnect Wallet
        </button>
      </div>
    </div>
  );
};