import { useState } from "react";
import { useChatStore, Contact } from "../../store/chatStore";
import { PlusCircle, User, Search, MessageSquare, X, Check, Trash2 } from "lucide-react";

export const ContactList = () => {
  const { 
    contacts, 
    addContact, 
    removeContact, 
    currentUser, 
  } = useChatStore();
  
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [isRemovingContact, setIsRemovingContact] = useState(false);
  const [contactToRemove, setContactToRemove] = useState(null);
  const [newAddress, setNewAddress] = useState("");
  const [newName, setNewName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  
  const handleAddContact = () => {
    if (!newAddress || !newName) return;
    
    addContact({
      address: newAddress,
      name: newName,
      lastSeen: Date.now()
    });
    
    setNewAddress("");
    setNewName("");
    setIsAddingContact(false);
  };

  const handleRemoveConfirmation = (contact: Contact) => {
    setContactToRemove(contact);
    setIsRemovingContact(true);
  };
  
  const handleRemoveContact = () => {
    if (contactToRemove) {
      removeContact(contactToRemove.address);
      setIsRemovingContact(false);
      setContactToRemove(null);
    }
  };
  
  const handleStartChat = (contactAddress: string) => {
    if (!currentUser) return;
    
  const { threads, setActiveThread, createThread } = useChatStore.getState();
  
  const existingThread = threads.find(thread => 
    thread.participants.length === 2 &&
    thread.participants.includes(currentUser.address) && 
    thread.participants.includes(contactAddress)
  );
    if (existingThread) {
      setActiveThread(existingThread.id);
    } else {
      const threadId = createThread([currentUser.address, contactAddress]);
      setActiveThread(threadId);
    }
  };

  const filteredContacts = contacts.filter(contact => 
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    contact.address.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <div className="flex flex-col h-full bg-black text-white">
      <div className="p-4 border-b border-gray-800 flex justify-between items-center">
        <h2 className="text-xl font-bold">Contacts</h2>
        <button 
          onClick={() => setIsAddingContact(true)}
          className="text-blue-400 hover:text-blue-300 transition-colors"
        >
          <PlusCircle size={20} />
        </button>
      </div>
      
      <div className="px-4 py-3 border-b border-gray-800">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-2.5 text-gray-500" />
          <input 
            type="text"
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-200"
          />
        </div>
      </div>
      
      {isAddingContact && (
        <div className="p-4 bg-gray-900 border-b border-gray-800">
          <div className="mb-4 flex justify-between items-center">
            <h3 className="font-semibold text-lg">Add New Contact</h3>
            <button 
              onClick={() => setIsAddingContact(false)}
              className="text-gray-400 hover:text-gray-200"
            >
              <X size={18} />
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Wallet Address
              </label>
              <input
                type="text"
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
                placeholder="0x..."
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Name
              </label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Contact name"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-white"
              />
            </div>
            
            <div className="flex space-x-2 pt-2">
              <button
                onClick={handleAddContact}
                className="flex items-center justify-center space-x-2 flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Check size={16} />
                <span>Save</span>
              </button>
            </div>
          </div>
        </div>
      )}
      
      {isRemovingContact && contactToRemove && (
        <div className="p-4 bg-gray-900 border-b border-gray-800">
          <div className="mb-4 flex justify-between items-center">
            <h3 className="font-semibold text-lg">Remove Contact</h3>
            <button 
              onClick={() => {
                setIsRemovingContact(false);
                setContactToRemove(null);
              }}
              className="text-gray-400 hover:text-gray-200"
            >
              <X size={18} />
            </button>
          </div>
          
          <div className="space-y-4">
            <p className="text-gray-300">
              Are you sure you want to remove <span className="font-semibold">{contactToRemove.name}</span>?
            </p>
            
            <div className="flex space-x-2 pt-2">
              <button
                onClick={handleRemoveContact}
                className="flex items-center justify-center space-x-2 flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Trash2 size={16} />
                <span>Remove</span>
              </button>
              <button
                onClick={() => {
                  setIsRemovingContact(false);
                  setContactToRemove(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex-1 overflow-y-auto">
        {filteredContacts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 p-6">
            <User size={48} className="mb-2 opacity-50" />
            <p>{searchQuery ? "No matches found" : "No contacts yet"}</p>
            {!isAddingContact && !searchQuery && (
              <button
                onClick={() => setIsAddingContact(true)}
                className="mt-4 px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 text-blue-400 transition-colors text-sm"
              >
                Add your first contact
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {filteredContacts.map((contact) => (
              <div
                key={contact.address}
                className="flex items-center p-3 rounded-lg hover:bg-gray-900 cursor-pointer transition-colors group"
              >
                <div 
                  className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center mr-3"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStartChat(contact.address);
                  }}
                >
                  {contact.avatar ? (
                    <img 
                      src={contact.avatar} 
                      alt={contact.name} 
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <User size={20} className="text-gray-400" />
                  )}
                </div>
                <div 
                  className="flex-1 min-w-0">
                  <div className="font-medium">{contact.name}</div>
                  <div className="text-sm text-gray-500 truncate">{contact.address}</div>
                  {contact.lastSeen && (
                    <div className="text-xs text-gray-600">
                      Last seen: {new Date(contact.lastSeen).toLocaleString()}
                    </div>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button 
                    className="p-2 rounded-full bg-gray-800 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStartChat(contact.address);
                    }}
                    aria-label="Chat with contact"
                  >
                    <MessageSquare size={16} />
                  </button>
                  <button 
                    className="p-2 rounded-full bg-gray-800 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveConfirmation(contact);
                    }}
                    aria-label="Remove contact"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};