import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../contexts/UserContext';
import { getAvailableVoices, setVoice } from '../services/speechService';

const Onboarding: React.FC = () => {
  const { user, loading, connectWallet, completeOnboarding, updateUserPreferences } = useUser();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [connecting, setConnecting] = useState(false);
  const [walletError, setWalletError] = useState<string | null>(null);
  const [selectedVoice, setSelectedVoice] = useState<string | null>(null);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [agentEnabled, setAgentEnabled] = useState(true);
  
  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    } else if (user && user.isOnboarded) {
      navigate('/chat');
    }
  }, [user, loading, navigate]);
  
  // Load available voices
  useEffect(() => {
    const voices = getAvailableVoices();
    
    // Filter for female voices
    const femaleVoices = voices.filter(voice => 
      voice.name.toLowerCase().includes('female') || 
      voice.name.toLowerCase().includes('woman') ||
      voice.name.toLowerCase().includes('girl') ||
      voice.name.includes('f') // Some voices use 'f' suffix for female
    );
    
    setAvailableVoices(femaleVoices.length > 0 ? femaleVoices : voices);
    
    // Set default voice (first female voice or first available)
    if (femaleVoices.length > 0) {
      setSelectedVoice(femaleVoices[0].name);
    } else if (voices.length > 0) {
      setSelectedVoice(voices[0].name);
    }
  }, []);
  
  // Handle wallet connection
  const handleConnectWallet = async () => {
    try {
      setConnecting(true);
      setWalletError(null);
      await connectWallet();
      // Move to next step after successful connection
      setStep(step + 1);
    } catch (error) {
      setWalletError((error as Error).message);
    } finally {
      setConnecting(false);
    }
  };
  
  // Handle voice selection
  const handleVoiceSelect = (voiceName: string) => {
    setSelectedVoice(voiceName);
    
    // Set the voice in the speech service
    const voice = availableVoices.find(v => v.name === voiceName);
    if (voice) {
      setVoice(voice);
    }
  };
  
  // Complete onboarding
  const handleComplete = () => {
    // Save preferences
    updateUserPreferences({
      voiceEnabled: true,
      voiceId: selectedVoice || undefined,
      agentEnabled
    });
    
    // Mark onboarding as complete
    completeOnboarding();
    
    // Navigate to chat
    navigate('/chat');
  };
  
  // Skip wallet connection
  const handleSkipWallet = () => {
    setStep(step + 1);
  };
  
  // Animation variants
  const pageVariants = {
    initial: { opacity: 0, x: 100 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, x: -100, transition: { duration: 0.3 } }
  };
  
  if (loading || !user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-24 h-24 bg-indigo-600 rounded-full mb-4 opacity-50"></div>
          <div className="h-4 w-32 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <header className="p-6 border-b border-gray-800">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold">Telepathia AI</h1>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center">
              {user.displayName.charAt(0)}
            </div>
            <span className="text-sm">{user.displayName}</span>
          </div>
        </div>
      </header>
      
      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          {/* Progress bar */}
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-400">Getting Started</span>
              <span className="text-sm text-gray-400">Step {step} of 3</span>
            </div>
            <div className="h-2 bg-gray-800 rounded-full">
              <div 
                className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                style={{ width: `${(step / 3) * 100}%` }}
              ></div>
            </div>
          </div>
          
          {/* Step content */}
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="bg-gray-900 rounded-xl p-8 shadow-xl"
              >
                <h2 className="text-2xl font-semibold mb-4">Welcome to Telepathia AI</h2>
                <p className="text-gray-400 mb-6">
                  Let's set up your account so your AI agent can represent you effectively.
                </p>
                
                <div className="mb-8">
                  <h3 className="text-lg font-medium mb-4">Connect your wallet</h3>
                  <p className="text-gray-400 mb-4">
                    Connecting a blockchain wallet allows us to securely store your conversation history.
                  </p>
                  
                  {walletError && (
                    <div className="bg-red-900 bg-opacity-50 text-red-200 p-3 rounded-lg mb-4">
                      {walletError}
                    </div>
                  )}
                  
                  <button
                    className="w-full bg-indigo-600 font-medium p-3 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                    onClick={handleConnectWallet}
                    disabled={connecting}
                  >
                    {connecting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Connecting...</span>
                      </>
                    ) : (
                      <>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M19 7H5C3.89543 7 3 7.89543 3 9V17C3 18.1046 3.89543 19 5 19H19C20.1046 19 21 18.1046 21 17V9C21 7.89543 20.1046 7 19 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M16 14C16.5523 14 17 13.5523 17 13C17 12.4477 16.5523 12 16 12C15.4477 12 15 12.4477 15 13C15 13.5523 15.4477 14 16 14Z" fill="currentColor"/>
                        </svg>
                        <span>Connect Wallet</span>
                      </>
                    )}
                  </button>
                  
                  <button
                    className="w-full mt-3 bg-transparent border border-gray-700 font-medium p-3 rounded-lg hover:bg-gray-800 transition-colors"
                    onClick={handleSkipWallet}
                  >
                    Skip for now
                  </button>
                </div>
                
                <div className="flex justify-end">
                  <button
                    className="px-6 py-2 bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
                    onClick={() => setStep(2)}
                  >
                    Next
                  </button>
                </div>
              </motion.div>
            )}
            
            {step === 2 && (
              <motion.div
                key="step2"
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="bg-gray-900 rounded-xl p-8 shadow-xl"
              >
                <h2 className="text-2xl font-semibold mb-4">Voice Settings</h2>
                <p className="text-gray-400 mb-6">
                  Choose how your AI agent will sound when speaking to you.
                </p>
                
                <div className="mb-8">
                  <h3 className="text-lg font-medium mb-4">Select a voice</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                    {availableVoices.map(voice => (
                      <button
                        key={voice.name}
                        className={`p-3 rounded-lg text-left ${
                          selectedVoice === voice.name 
                            ? 'bg-indigo-600 border-indigo-500' 
                            : 'bg-gray-800 border-gray-700'
                        } border transition-colors`}
                        onClick={() => handleVoiceSelect(voice.name)}
                      >
                        <div className="font-medium">{voice.name}</div>
                        <div className="text-sm text-gray-400">{voice.lang}</div>
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <button
                    className="px-6 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
                    onClick={() => setStep(1)}
                  >
                    Back
                  </button>
                  <button
                    className="px-6 py-2 bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
                    onClick={() => setStep(3)}
                  >
                    Next
                  </button>
                </div>
              </motion.div>
            )}
            
            {step === 3 && (
              <motion.div
                key="step3"
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="bg-gray-900 rounded-xl p-8 shadow-xl"
              >
                <h2 className="text-2xl font-semibold mb-4">AI Agent Settings</h2>
                <p className="text-gray-400 mb-6">
                  Configure how your AI agent will work for you.
                </p>
                
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-medium">Enable AI Agent</h3>
                      <p className="text-sm text-gray-400">Let your agent communicate on your behalf</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={agentEnabled}
                        onChange={() => setAgentEnabled(!agentEnabled)}
                      />
                      <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <button
                    className="px-6 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
                    onClick={() => setStep(2)}
                  >
                    Back
                  </button>
                  <button
                    className="px-6 py-2 bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                    onClick={handleComplete}
                  >
                    Complete Setup
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
