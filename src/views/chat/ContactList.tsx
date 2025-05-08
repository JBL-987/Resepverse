import React, { useState } from "react";
import { useChatStore } from "../../store/chatStore";

export const ContactList: React.FC = () => {
  const { contacts, addContact, createThread, setActiveThread, currentUser } = useChatStore();
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [newAddress, setNewAddress] = useState("");
  const [newName, setNewName] = useState("");
  
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
  
  const handleStartChat = (contactAddress: string) => {
    if (!currentUser) return;
    
    const threadId = createThread([currentUser.address, contactAddress]);
    setActiveThread(threadId);
  };
  
  return (
    <div className="p-4">
      {isAddingContact ? (
        <div className="space-y-3 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Wallet Address
            </label>
            <input
              type="text"
              value={newAddress}
              onChange={(e) => setNewAddress(e.target.value)}
              placeholder="0x..."
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
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
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
            />
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={handleAddContact}
              className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Add
            </button>
            <button
              onClick={() => setIsAddingContact(false)}
              className="flex-1 px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsAddingContact(true)}
          className="w-full px-4 py-2 mb-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Add Contact
        </button>
      )}
      
      <div className="space-y-2">
        {contacts.length === 0 ? (
          <p className="text-gray-400 text-center py-4">No contacts yet</p>
        ) : (
          contacts.map((contact) => (
            <div
              key={contact.address}
              className="p-3 bg-gray-700 rounded-md hover:bg-gray-600 cursor-pointer"
              onClick={() => handleStartChat(contact.address)}
            >
              <div className="font-medium">{contact.name}</div>
              <div className="text-sm text-gray-400 truncate">{contact.address}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};