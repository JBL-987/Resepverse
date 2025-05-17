import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useChatStore } from "../store/chatStore";

interface AgentProfile {
  name: string;
  bio: string;
  interests: string[];
  availability: {
    weekdays: boolean;
    weekends: boolean;
    mornings: boolean;
    afternoons: boolean;
    evenings: boolean;
  };
  communicationStyle: "formal" | "casual" | "friendly" | "professional";
  decisionMaking: "cautious" | "balanced" | "decisive";
}

export const AgentSetup: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, updateUserProfile } = useChatStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [agentProfile, setAgentProfile] = useState<AgentProfile>({
    name: "",
    bio: "",
    interests: [],
    availability: {
      weekdays: true,
      weekends: true,
      mornings: true,
      afternoons: true,
      evenings: true,
    },
    communicationStyle: "friendly",
    decisionMaking: "balanced",
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setAgentProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleInterestChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const interest = e.target.value.trim();
    if (interest && !agentProfile.interests.includes(interest)) {
      setAgentProfile(prev => ({
        ...prev,
        interests: [...prev.interests, interest]
      }));
      e.target.value = "";
    }
  };
  
  const removeInterest = (interest: string) => {
    setAgentProfile(prev => ({
      ...prev,
      interests: prev.interests.filter(i => i !== interest)
    }));
  };
  
  const handleAvailabilityChange = (key: keyof AgentProfile["availability"]) => {
    setAgentProfile(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        [key]: !prev.availability[key]
      }
    }));
  };
  
  const handleCommunicationStyleChange = (style: AgentProfile["communicationStyle"]) => {
    setAgentProfile(prev => ({
      ...prev,
      communicationStyle: style
    }));
  };
  
  const handleDecisionMakingChange = (style: AgentProfile["decisionMaking"]) => {
    setAgentProfile(prev => ({
      ...prev,
      decisionMaking: style
    }));
  };
  
  const nextStep = () => {
    setCurrentStep(prev => prev + 1);
  };
  
  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };
  
  const completeSetup = () => {
    // Save agent profile to user profile
    updateUserProfile({
      name: agentProfile.name,
      status: "Agent configured",
      // Add other profile data as needed
    });
    
    // Store the full agent profile in localStorage for now
    // In a real implementation, this would be encrypted and stored securely
    localStorage.setItem(`agent_profile_${currentUser?.address}`, JSON.stringify(agentProfile));
    
    // Navigate to chat
    navigate("/chat");
  };
  
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold mb-8 text-center">Configure Your AI Agent</h1>
        
        {currentStep === 1 && (
          <div className="space-y-6">
            <h2 className="text-xl mb-4">Basic Information</h2>
            
            <div>
              <label className="block text-sm font-medium mb-2">Agent Name</label>
              <input
                type="text"
                name="name"
                value={agentProfile.name}
                onChange={handleInputChange}
                className="w-full p-2 bg-gray-800 rounded border border-gray-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                placeholder="What would you like to call your agent?"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">About You</label>
              <textarea
                name="bio"
                value={agentProfile.bio}
                onChange={handleInputChange}
                className="w-full p-2 bg-gray-800 rounded border border-gray-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 h-32"
                placeholder="Tell your agent about yourself, your job, and anything else that would help it represent you..."
              />
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={nextStep}
                className="px-4 py-2 bg-indigo-600 rounded hover:bg-indigo-700 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
        
        {currentStep === 2 && (
          <div className="space-y-6">
            <h2 className="text-xl mb-4">Interests & Availability</h2>
            
            <div>
              <label className="block text-sm font-medium mb-2">Your Interests</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {agentProfile.interests.map(interest => (
                  <span key={interest} className="bg-indigo-900 px-2 py-1 rounded-full text-sm flex items-center">
                    {interest}
                    <button 
                      onClick={() => removeInterest(interest)}
                      className="ml-1 text-gray-400 hover:text-white"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                className="w-full p-2 bg-gray-800 rounded border border-gray-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                placeholder="Add an interest and press Enter"
                onKeyDown={(e) => e.key === 'Enter' && handleInterestChange(e as any)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Your Availability</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  className={`p-2 rounded ${agentProfile.availability.weekdays ? 'bg-indigo-600' : 'bg-gray-700'}`}
                  onClick={() => handleAvailabilityChange('weekdays')}
                >
                  Weekdays
                </button>
                <button
                  className={`p-2 rounded ${agentProfile.availability.weekends ? 'bg-indigo-600' : 'bg-gray-700'}`}
                  onClick={() => handleAvailabilityChange('weekends')}
                >
                  Weekends
                </button>
                <button
                  className={`p-2 rounded ${agentProfile.availability.mornings ? 'bg-indigo-600' : 'bg-gray-700'}`}
                  onClick={() => handleAvailabilityChange('mornings')}
                >
                  Mornings
                </button>
                <button
                  className={`p-2 rounded ${agentProfile.availability.afternoons ? 'bg-indigo-600' : 'bg-gray-700'}`}
                  onClick={() => handleAvailabilityChange('afternoons')}
                >
                  Afternoons
                </button>
                <button
                  className={`p-2 rounded ${agentProfile.availability.evenings ? 'bg-indigo-600' : 'bg-gray-700'}`}
                  onClick={() => handleAvailabilityChange('evenings')}
                >
                  Evenings
                </button>
              </div>
            </div>
            
            <div className="flex justify-between">
              <button
                onClick={prevStep}
                className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600 transition-colors"
              >
                Back
              </button>
              <button
                onClick={nextStep}
                className="px-4 py-2 bg-indigo-600 rounded hover:bg-indigo-700 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
        
        {currentStep === 3 && (
          <div className="space-y-6">
            <h2 className="text-xl mb-4">Agent Personality</h2>
            
            <div>
              <label className="block text-sm font-medium mb-2">Communication Style</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  className={`p-2 rounded ${agentProfile.communicationStyle === 'formal' ? 'bg-indigo-600' : 'bg-gray-700'}`}
                  onClick={() => handleCommunicationStyleChange('formal')}
                >
                  Formal
                </button>
                <button
                  className={`p-2 rounded ${agentProfile.communicationStyle === 'casual' ? 'bg-indigo-600' : 'bg-gray-700'}`}
                  onClick={() => handleCommunicationStyleChange('casual')}
                >
                  Casual
                </button>
                <button
                  className={`p-2 rounded ${agentProfile.communicationStyle === 'friendly' ? 'bg-indigo-600' : 'bg-gray-700'}`}
                  onClick={() => handleCommunicationStyleChange('friendly')}
                >
                  Friendly
                </button>
                <button
                  className={`p-2 rounded ${agentProfile.communicationStyle === 'professional' ? 'bg-indigo-600' : 'bg-gray-700'}`}
                  onClick={() => handleCommunicationStyleChange('professional')}
                >
                  Professional
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Decision Making</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  className={`p-2 rounded ${agentProfile.decisionMaking === 'cautious' ? 'bg-indigo-600' : 'bg-gray-700'}`}
                  onClick={() => handleDecisionMakingChange('cautious')}
                >
                  Cautious
                </button>
                <button
                  className={`p-2 rounded ${agentProfile.decisionMaking === 'balanced' ? 'bg-indigo-600' : 'bg-gray-700'}`}
                  onClick={() => handleDecisionMakingChange('balanced')}
                >
                  Balanced
                </button>
                <button
                  className={`p-2 rounded ${agentProfile.decisionMaking === 'decisive' ? 'bg-indigo-600' : 'bg-gray-700'}`}
                  onClick={() => handleDecisionMakingChange('decisive')}
                >
                  Decisive
                </button>
              </div>
            </div>
            
            <div className="flex justify-between">
              <button
                onClick={prevStep}
                className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600 transition-colors"
              >
                Back
              </button>
              <button
                onClick={completeSetup}
                className="px-4 py-2 bg-green-600 rounded hover:bg-green-700 transition-colors"
              >
                Complete Setup
              </button>
            </div>
          </div>
        )}
        
        <div className="mt-8 flex justify-center">
          <div className="flex space-x-2">
            {[1, 2, 3].map(step => (
              <div 
                key={step}
                className={`w-3 h-3 rounded-full ${currentStep === step ? 'bg-indigo-500' : 'bg-gray-600'}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
