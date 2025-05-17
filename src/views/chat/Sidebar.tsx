import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";
import { useChatStore } from "../../store/chatStore";
import { ContactList } from "./ContactList";
import { useUser } from "../../contexts/UserContext";
import { authService, UserProfile } from "../../services/authService";
import {
  User,
  LogOut,
  Edit,
  UserPlus,
  Save,
  Copy,
  Check,
  Settings,
  Users,
  Search,
  Plus,
  X,
  Volume2,
  VolumeX,
} from "lucide-react";

export const Sidebar = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("contacts");
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);

  // Auth contexts
  const { address, disconnect } = useAuth();
  const { user, signOut } = useUser();
  const { currentUser, updateUserProfile, addContact } = useChatStore();

  // Profile state
  const [username, setUsername] = useState(currentUser?.name || "");
  const [status, setStatus] = useState(currentUser?.status || "");

  // Voice settings
  const [voiceEnabled, setVoiceEnabled] = useState(
    user?.preferences?.voiceEnabled || true
  );

  // Load user profile
  useEffect(() => {
    if (currentUser) {
      setUsername(currentUser.name || "");
      setStatus(currentUser.status || "");
    }
  }, [currentUser]);

  // Load all users for contacts
  useEffect(() => {
    const users = authService.getAllUsers();
    // Filter out current user
    const otherUsers = users.filter((u) => u.id !== user?.id);
    setAllUsers(otherUsers);
    setFilteredUsers(otherUsers);
  }, [user]);

  // Filter users based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredUsers(allUsers);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = allUsers.filter(
      (user) =>
        user.displayName.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
    );

    setFilteredUsers(filtered);
  }, [searchQuery, allUsers]);

  // Handle saving profile
  const handleSaveProfile = () => {
    if (username.trim()) {
      updateUserProfile({
        name: username,
        status: status,
      });

      // Update voice preferences if user context exists
      if (user) {
        authService.updateUserPreferences(user.id, {
          voiceEnabled,
        });
      }
    }
  };

  // Handle logout
  const handleLogout = async () => {
    disconnect();

    // Also sign out from user context if available
    if (signOut) {
      await signOut();
      navigate("/login");
    }
  };

  // Handle adding a contact
  const handleAddContact = (userToAdd: UserProfile) => {
    if (!currentUser) return;

    addContact({
      address: userToAdd.blockchainAddress || userToAdd.id,
      name: userToAdd.displayName,
      avatar: userToAdd.photoURL,
      status: "Available",
      isOnline: true,
    });

    setIsAddingContact(false);
    setSearchQuery("");
  };

  // Copy wallet address
  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Toggle voice output
  const toggleVoice = () => {
    setVoiceEnabled(!voiceEnabled);

    // Update user preferences if user context exists
    if (user) {
      authService.updateUserPreferences(user.id, {
        voiceEnabled: !voiceEnabled,
      });
    }
  };

  // Format address for display
  const truncateAddress = (addr: any) => {
    if (!addr) return "Not connected";
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  return (
    <div className="w-64 h-full bg-[#17212b] border-r border-[#2b3b4c] flex flex-col">
      <div className="p-4 border-b border-[#2b3b4c] flex items-center">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center mr-2 shadow-lg">
          <span className="text-white font-bold">T</span>
        </div>
        <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-500 text-transparent bg-clip-text">
          Telepathia
        </h1>
      </div>

      <div className="flex border-b border-[#2b3b4c]">
        <button
          className={`flex-1 py-3 flex items-center justify-center space-x-2 transition-colors ${
            activeTab === "contacts"
              ? "text-indigo-400 border-b-2 border-indigo-400 bg-[#1e2c3a]"
              : "text-gray-400 hover:text-gray-300 hover:bg-[#1e2c3a]"
          }`}
          onClick={() => setActiveTab("contacts")}
        >
          <UserPlus size={16} />
          <span className="font-medium">Contacts</span>
        </button>
        <button
          className={`flex-1 py-3 flex items-center justify-center space-x-2 transition-colors ${
            activeTab === "profile"
              ? "text-indigo-400 border-b-2 border-indigo-400 bg-[#1e2c3a]"
              : "text-gray-400 hover:text-gray-300 hover:bg-[#1e2c3a]"
          }`}
          onClick={() => setActiveTab("profile")}
        >
          <User size={16} />
          <span className="font-medium">Profile</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {activeTab === "contacts" ? (
          <div className="p-4">
            {/* Search */}
            <div className="relative mb-4">
              <input
                type="text"
                placeholder="Search contacts..."
                className="w-full bg-[#1e2c3a] text-white rounded-full pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 border border-[#2b3b4c]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search
                size={16}
                className="absolute left-3 top-3 text-gray-400"
              />
            </div>

            {/* Add Contact Button */}
            <button
              className={`w-full rounded-full py-2.5 mb-4 text-sm font-medium transition-all flex items-center justify-center gap-2 shadow-sm ${
                isAddingContact
                  ? "bg-[#1e2c3a] text-gray-300 border border-[#2b3b4c] hover:bg-[#2b3b4c]"
                  : "bg-indigo-600 text-white hover:bg-indigo-700"
              }`}
              onClick={() => setIsAddingContact(!isAddingContact)}
            >
              {isAddingContact ? (
                <>
                  <X size={16} />
                  <span>Cancel</span>
                </>
              ) : (
                <>
                  <Plus size={16} />
                  <span>Add Contact</span>
                </>
              )}
            </button>

            {/* Contact List or User List */}
            {isAddingContact ? (
              <div>
                <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center">
                  <Users size={14} className="mr-2 text-indigo-400" />
                  Available Users
                </h3>
                {filteredUsers.length > 0 ? (
                  <div className="space-y-2">
                    {filteredUsers.map((user) => (
                      <button
                        key={user.id}
                        className="w-full flex items-center p-3 rounded-lg hover:bg-[#1e2c3a] transition-all border border-transparent hover:border-[#2b3b4c]"
                        onClick={() => handleAddContact(user)}
                      >
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center mr-3 shadow-sm">
                          {user.photoURL ? (
                            <img
                              src={user.photoURL}
                              alt={user.displayName}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-white font-medium">
                              {user.displayName.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 text-left">
                          <div className="font-medium text-white">
                            {user.displayName}
                          </div>
                          <div className="text-xs text-gray-400">
                            {user.email}
                          </div>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white hover:bg-indigo-700 transition-colors">
                          <Plus size={16} />
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="w-16 h-16 rounded-full bg-[#1e2c3a] flex items-center justify-center mb-4">
                      <Users size={24} className="text-gray-500" />
                    </div>
                    <p className="text-gray-500">No users found</p>
                  </div>
                )}
              </div>
            ) : (
              <ContactList />
            )}
          </div>
        ) : (
          <div className="p-4 space-y-5">
            <div className="flex justify-center py-4">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center relative group shadow-lg">
                <User size={36} className="text-white" />
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Edit size={20} className="text-white" />
                </div>
              </div>
            </div>

            <div>
              <label className="flex text-sm font-medium text-gray-300 mb-2 items-center">
                <User size={14} className="mr-2 text-indigo-400" />
                Username
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-3 pr-10 py-2.5 bg-[#1e2c3a] border border-[#2b3b4c] rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-white"
                  placeholder="Enter username"
                />
                <User
                  size={16}
                  className="absolute right-3 top-3 text-gray-500"
                />
              </div>
            </div>

            <div>
              <label className="flex text-sm font-medium text-gray-300 mb-2 items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-2 text-indigo-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M12 16v-4"></path>
                  <path d="M12 8h.01"></path>
                </svg>
                Status
              </label>
              <input
                type="text"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2.5 bg-[#1e2c3a] border border-[#2b3b4c] rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-white"
                placeholder="What's on your mind?"
              />
            </div>

            <div>
              <label className="flex text-sm font-medium text-gray-300 mb-2 justify-between items-center">
                <div className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-2 text-indigo-400"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                    <path d="M7 15h0M12 15h0M17 15h0"></path>
                  </svg>
                  <span>Wallet Address</span>
                </div>
                {address && (
                  <button
                    onClick={copyAddress}
                    className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center bg-[#1e2c3a] px-2 py-1 rounded-full"
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
              <div className="px-3 py-2.5 bg-[#1e2c3a] border border-[#2b3b4c] rounded-lg text-gray-300 text-sm flex justify-between items-center">
                <span className="truncate">{truncateAddress(address)}</span>
                <div className="h-3 w-3 rounded-full bg-green-500 shadow-sm"></div>
              </div>
            </div>

            {/* Voice Settings */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-300 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-2 text-indigo-400"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                    <line x1="12" y1="19" x2="12" y2="22"></line>
                  </svg>
                  Voice Output
                </label>
                <button
                  onClick={toggleVoice}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                    voiceEnabled ? "bg-indigo-600" : "bg-gray-600"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      voiceEnabled ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
              <div className="px-3 py-2.5 bg-[#1e2c3a] border border-[#2b3b4c] rounded-lg text-gray-300 text-sm flex items-center">
                {voiceEnabled ? (
                  <>
                    <Volume2 size={16} className="text-indigo-400 mr-2" />
                    <span>Voice output is enabled</span>
                  </>
                ) : (
                  <>
                    <VolumeX size={16} className="text-gray-500 mr-2" />
                    <span>Voice output is disabled</span>
                  </>
                )}
              </div>
            </div>

            <button
              onClick={handleSaveProfile}
              className="w-full px-4 py-2.5 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-all flex items-center justify-center space-x-2 shadow-sm mt-6"
            >
              <Save size={16} />
              <span className="font-medium">Save Profile</span>
            </button>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-[#2b3b4c]">
        <button
          onClick={handleLogout}
          className="w-full px-4 py-2.5 bg-[#1e2c3a] text-red-400 rounded-full hover:bg-[#2b3b4c] transition-all flex items-center justify-center space-x-2 border border-[#2b3b4c]"
        >
          <LogOut size={16} />
          <span className="font-medium">Disconnect Wallet</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
