import React, { useState, useEffect, useRef } from "react";
import { useChatStore } from "../../store/chatStore";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import {
  generateAgentResponse,
  AgentProfile,
} from "../../services/geminiService";
import {
  speak,
  stopSpeaking,
  isSpeechSynthesisSupported,
} from "../../services/speechService";

import {
  startRecording,
  stopRecording,
  isMediaRecorderSupported,
  requestMicrophonePermission as requestMicPermission,
} from "../../services/geminiSpeechService";

export const AgentMessagePanel: React.FC = () => {
  const {
    activeThreadId,
    threads,
    currentUser,
    sendAgentMessage,
    updateAgentActivity,
  } = useChatStore();

  const [isMinimalist, setIsMinimalist] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [agentProfile, setAgentProfile] = useState<AgentProfile | null>(null);
  const [userInput, setUserInput] = useState("");
  const [transcript, setTranscript] = useState("");
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [speechError, setSpeechError] = useState<{
    type: string;
    message: string;
  } | null>(null);
  const [permissionRequested, setPermissionRequested] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  // Reference to track if component is mounted
  const isMounted = useRef(true);

  const activeThread = threads.find((thread) => thread.id === activeThreadId);

  // Check if speech features are supported
  const speechSynthesisSupported = isSpeechSynthesisSupported();
  const speechRecognitionSupported = isMediaRecorderSupported();
  const speechSupported =
    speechSynthesisSupported && speechRecognitionSupported;

  // Load agent profile from localStorage
  useEffect(() => {
    if (currentUser) {
      const storedProfile = localStorage.getItem(
        `agent_profile_${currentUser.address}`
      );
      if (storedProfile) {
        try {
          const profile = JSON.parse(storedProfile) as AgentProfile;
          setAgentProfile(profile);
        } catch (error) {
          console.error("Error parsing agent profile:", error);
        }
      }
    }
  }, [currentUser]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      isMounted.current = false;
      stopRecording();
      stopSpeaking();
    };
  }, []);

  // Request microphone permission explicitly
  const requestMicrophonePermission = async () => {
    setPermissionRequested(true);
    const permissionGranted = await requestMicPermission();

    if (permissionGranted) {
      setSpeechError(null);
      return true;
    } else {
      setSpeechError({
        type: "permission_denied",
        message:
          "Microphone access was denied. Please allow microphone access in your browser settings.",
      });
      return false;
    }
  };

  // Handle voice input
  const handleVoiceInput = async () => {
    // Clear any previous errors
    setSpeechError(null);

    // Check if speech recognition is supported
    if (!speechRecognitionSupported) {
      setSpeechError({
        type: "not_supported",
        message:
          "Speech recognition is not supported in this browser. Please try using Chrome, Edge, or Safari.",
      });
      return;
    }

    if (isListening) {
      // Stop recording
      stopRecording();
      setIsListening(false);
      setIsRecording(false);

      // Processing will happen automatically when recording stops
      // The transcript will be updated via the callback
    } else {
      // Request permission if not already done
      if (!permissionRequested) {
        const permissionGranted = await requestMicrophonePermission();
        if (!permissionGranted) {
          return;
        }
      }

      // Start recording
      setIsListening(true);
      setIsRecording(true);
      setTranscript("");
      setUserInput("");

      startRecording(
        // On transcript received
        (newTranscript) => {
          if (isMounted.current) {
            setSpeechError(null);
            setTranscript(newTranscript);
            setUserInput(newTranscript);
            setIsListening(false);
            setIsRecording(false);

            // Submit the transcript after a short delay
            if (newTranscript.trim()) {
              setTimeout(() => {
                if (isMounted.current) {
                  handleUserInput(newTranscript);
                }
              }, 500);
            }
          }
        },
        // On error
        (errorType, errorMessage) => {
          if (isMounted.current) {
            console.log(
              `Speech recognition error: ${errorType} - ${errorMessage}`
            );
            setSpeechError({ type: errorType, message: errorMessage });
            setIsListening(false);
            setIsRecording(false);

            // If permission denied, update permission requested state
            if (errorType === "permission_denied") {
              setPermissionRequested(true);
            }
          }
        }
      );
    }
  };

  // Toggle voice output
  const toggleVoice = () => {
    setVoiceEnabled(!voiceEnabled);

    // If turning off voice, stop any ongoing speech
    if (voiceEnabled) {
      stopSpeaking();
      setIsSpeaking(false);
    }
  };

  // Handle incoming messages and generate agent responses
  useEffect(() => {
    if (
      !activeThread ||
      !currentUser ||
      !currentUser.agentEnabled ||
      !agentProfile
    )
      return;

    // Get the last message in the thread
    const lastMessage = activeThread.messages[activeThread.messages.length - 1];

    // If the last message is from someone else and not read, generate a response
    if (
      lastMessage &&
      lastMessage.sender !== currentUser.address &&
      !lastMessage.isRead &&
      !isProcessing
    ) {
      handleAgentResponse(lastMessage.content);
    }
  }, [activeThread, currentUser, agentProfile, isProcessing]);

  const handleAgentResponse = async (message: string) => {
    if (!activeThread || !currentUser || !agentProfile) return;

    setIsProcessing(true);

    try {
      // Get conversation history (last 10 messages)
      const conversationHistory = activeThread.messages
        .slice(-10)
        .map((msg) => ({
          role:
            msg.sender === currentUser.address
              ? ("model" as const)
              : ("user" as const),
          content: msg.content,
        }));

      // Generate response from Gemini
      const response = await generateAgentResponse(
        message,
        agentProfile,
        currentUser.address,
        conversationHistory
      );

      // Send the agent's response
      if (activeThread.id) {
        await sendAgentMessage(response, activeThread.id);
        updateAgentActivity();

        // Speak the response if voice is enabled
        if (voiceEnabled && speechSupported) {
          setIsSpeaking(true);
          speak(response, () => {
            if (isMounted.current) {
              setIsSpeaking(false);
            }
          });
        }
      }
    } catch (error) {
      console.error("Error generating agent response:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUserInput = async (inputText?: string) => {
    const textToProcess = inputText || userInput;

    if (!textToProcess.trim() || !activeThread || !currentUser || !agentProfile)
      return;

    // Stop any ongoing speech or recording
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
    }

    if (isListening || isRecording) {
      stopRecording();
      setIsListening(false);
      setIsRecording(false);
    }

    // Send the user's instruction to the agent
    const instruction = `[User Instruction]: ${textToProcess}`;
    await sendAgentMessage(instruction, activeThread.id);

    // Generate and send the agent's response
    await handleAgentResponse(textToProcess);

    // Clear the input
    setUserInput("");
    setTranscript("");
  };

  if (!activeThread) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-black text-gray-400">
        <div className="text-center">
          <h3 className="text-xl mb-4">Welcome to Telepathia AI</h3>
          <p className="mb-6">
            Your AI agent is ready to communicate on your behalf
          </p>
          <button
            className="px-4 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors"
            onClick={() => {
              /* Start new conversation */
            }}
          >
            Start a new conversation
          </button>
        </div>
      </div>
    );
  }

  const toggleView = () => {
    setIsMinimalist(!isMinimalist);
  };

  const toggleListening = () => {
    if (isProcessing || isSpeaking) return;
    handleVoiceInput();
  };

  return (
    <div className="flex flex-col h-full bg-black">
      {isMinimalist ? (
        // Minimalist view (similar to ChatGPT voice interface)
        <div className="flex flex-col items-center justify-center h-full">
          <div className="flex space-x-2 mb-12">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="w-4 h-4 bg-white rounded-full animate-pulse"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>

          <p className="text-gray-400 text-sm mb-8">
            {isListening
              ? "Recording... Speak to your agent"
              : isProcessing
              ? "Processing..."
              : isSpeaking
              ? "Your agent is speaking..."
              : "Your agent is communicating with others"}
          </p>

          {isRecording && (
            <div className="mb-6 flex items-center justify-center">
              <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse mr-2"></div>
              <span className="text-red-400 text-sm">
                Recording your voice...
              </span>
            </div>
          )}

          {isListening && (
            <div className="mb-8 w-full max-w-md px-4">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleUserInput()}
                placeholder="Type your message to your agent..."
                className="w-full p-3 rounded-full bg-gray-800 text-white border border-gray-700 focus:border-indigo-500 focus:outline-none"
                autoFocus
              />
              {userInput.trim() && (
                <button
                  onClick={handleUserInput}
                  className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors w-full"
                >
                  Send to Agent
                </button>
              )}
            </div>
          )}

          <div className="flex items-center space-x-4">
            <button
              className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center"
              onClick={toggleView}
              disabled={isProcessing}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-white"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path
                  fillRule="evenodd"
                  d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            <button
              className={`w-14 h-14 rounded-full ${
                isListening || isRecording
                  ? "bg-red-500"
                  : isSpeaking
                  ? "bg-green-500"
                  : "bg-indigo-600"
              } flex items-center justify-center ${
                isProcessing ? "opacity-50 cursor-not-allowed" : ""
              } ${isRecording ? "animate-pulse" : ""}`}
              onClick={toggleListening}
              disabled={isProcessing || isSpeaking}
            >
              {isRecording ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-white"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <rect x="6" y="6" width="8" height="8" rx="1" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-white"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>

            <button
              className={`w-10 h-10 rounded-full ${
                voiceEnabled ? "bg-indigo-600" : "bg-gray-800"
              } flex items-center justify-center`}
              onClick={toggleVoice}
              disabled={!speechSupported}
              title={
                speechSupported
                  ? "Toggle voice output"
                  : "Voice output not supported in this browser"
              }
            >
              {voiceEnabled ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-white"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-white"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          </div>

          {speechError ? (
            <div className="text-red-400 text-xs mt-4 max-w-md px-4 py-2 bg-red-900/20 rounded-lg">
              <p className="font-medium mb-1">Microphone Error:</p>
              <p>{speechError.message}</p>
              {speechError.type === "permission_denied" && (
                <button
                  onClick={requestMicrophonePermission}
                  className="mt-2 px-3 py-1 bg-red-600 text-white rounded-full text-xs hover:bg-red-700 transition-colors"
                >
                  Request Permission Again
                </button>
              )}
            </div>
          ) : (
            <p className="text-gray-400 text-xs mt-8">
              {isListening || isRecording
                ? "Recording... tap microphone to stop"
                : isSpeaking
                ? "Your agent is speaking..."
                : speechSupported
                ? "Tap microphone to speak to your agent"
                : "Voice input not supported in this browser"}
            </p>
          )}
        </div>
      ) : (
        // Standard chat view with message history
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-gray-800 flex justify-between items-center">
            <h3 className="text-white font-medium">
              {activeThread.isGroup
                ? activeThread.groupName
                : `Agent conversation with ${activeThread.participants.find(
                    (p) => p !== currentUser?.address
                  )}`}
            </h3>
            <div className="flex items-center space-x-3">
              {speechSupported && (
                <button
                  className={`p-2 rounded-full ${
                    voiceEnabled ? "bg-indigo-600" : "bg-gray-700"
                  }`}
                  onClick={toggleVoice}
                  title="Toggle voice output"
                >
                  {voiceEnabled ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-white"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-white"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
              )}
              <button
                className="text-gray-400 hover:text-white"
                onClick={toggleView}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                </svg>
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            <MessageList />
          </div>

          {isProcessing && (
            <div className="p-3 bg-gray-800 text-center text-gray-400">
              Your agent is thinking...
            </div>
          )}

          <div className="p-4 border-t border-gray-700">
            <div className="relative">
              <input
                type="text"
                value={isListening ? transcript : userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleUserInput()}
                placeholder={
                  isListening
                    ? "Listening..."
                    : "Send a message to your agent..."
                }
                className={`w-full p-3 pr-24 rounded-full bg-gray-700 text-white border ${
                  isListening ? "border-red-500" : "border-gray-600"
                } focus:border-indigo-500 focus:outline-none`}
                readOnly={isListening}
              />

              {/* Voice input button */}
              {speechSupported && (
                <button
                  onClick={handleVoiceInput}
                  disabled={isProcessing || isSpeaking}
                  className={`absolute right-14 top-1/2 transform -translate-y-1/2 p-2 rounded-full ${
                    isProcessing || isSpeaking
                      ? "bg-gray-600 text-gray-400"
                      : isListening || isRecording
                      ? "bg-red-500 text-white"
                      : "bg-gray-600 text-white hover:bg-gray-500"
                  } ${isRecording ? "animate-pulse" : ""}`}
                  title={isRecording ? "Stop recording" : "Start voice input"}
                >
                  {isRecording ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <rect x="6" y="6" width="8" height="8" rx="1" />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
              )}

              {/* Send button */}
              <button
                onClick={() => handleUserInput()}
                disabled={
                  (!userInput.trim() && !transcript.trim()) || isProcessing
                }
                className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full ${
                  (!userInput.trim() && !transcript.trim()) || isProcessing
                    ? "bg-gray-600 text-gray-400"
                    : "bg-indigo-600 text-white hover:bg-indigo-700"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
            {speechError ? (
              <div className="text-red-400 text-xs mt-2 px-3 py-2 bg-red-900/20 rounded-lg">
                <p className="font-medium mb-1">Microphone Error:</p>
                <p>{speechError.message}</p>
                {speechError.type === "permission_denied" && (
                  <button
                    onClick={requestMicrophonePermission}
                    className="mt-2 px-3 py-1 bg-red-600 text-white rounded-full text-xs hover:bg-red-700 transition-colors"
                  >
                    Request Permission Again
                  </button>
                )}
              </div>
            ) : (
              <div>
                <p className="text-xs text-gray-500 mt-2">
                  {isListening || isRecording
                    ? "Recording... speak clearly or type your message"
                    : isSpeaking
                    ? "Your agent is speaking..."
                    : "Your agent will respond on your behalf based on your preferences"}
                </p>

                {isRecording && (
                  <div className="mt-2 flex items-center">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse mr-2"></div>
                    <span className="text-red-400 text-xs">
                      Recording in progress...
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
