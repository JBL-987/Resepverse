/**
 * Speech Service for Telepathia AI
 *
 * This service handles voice input and output using the Web Speech API.
 */

// Types for speech recognition
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
  length: number;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

// Speech recognition class (not available in TypeScript types by default)
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

// Speech recognition instance
let recognition: any = null;

// Speech synthesis instance
const synthesis = window.speechSynthesis;

/**
 * Initialize speech recognition
 */
const initSpeechRecognition = (): any => {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    console.error("Speech recognition not supported in this browser");
    return null;
  }

  try {
    const recognitionInstance = new SpeechRecognition();

    // Test if the browser actually supports the created instance
    if (typeof recognitionInstance.start !== "function") {
      console.error("Speech recognition instance is invalid");
      return null;
    }

    return recognitionInstance;
  } catch (error) {
    console.error("Error creating speech recognition instance:", error);
    return null;
  }
};

/**
 * Check if speech recognition is supported by the browser
 */
export const isSpeechRecognitionSupported = (): boolean => {
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
};

/**
 * Start listening for voice input
 * @param onResult Callback function for speech recognition results
 * @param onEnd Callback function for when speech recognition ends
 * @param onError Callback function for when an error occurs
 */
export const startListening = (
  onResult: (transcript: string) => void,
  onEnd: () => void,
  onError?: (errorType: string, errorMessage: string) => void
): void => {
  // Check for browser support first
  if (!isSpeechRecognitionSupported()) {
    console.error("Speech recognition is not supported in this browser");
    if (onError)
      onError(
        "not_supported",
        "Speech recognition is not supported in this browser"
      );
    onEnd();
    return;
  }

  // Initialize speech recognition if not already done
  if (!recognition) {
    recognition = initSpeechRecognition();

    if (!recognition) {
      console.error("Failed to initialize speech recognition");
      if (onError)
        onError("init_failed", "Failed to initialize speech recognition");
      onEnd();
      return;
    }

    // Configure speech recognition
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
  }

  // Clear any existing event listeners
  recognition.onresult = null;
  recognition.onend = null;
  recognition.onerror = null;
  recognition.onnomatch = null;
  recognition.onaudiostart = null;
  recognition.onaudioend = null;
  recognition.onsoundstart = null;
  recognition.onsoundend = null;
  recognition.onspeechstart = null;
  recognition.onspeechend = null;

  // Set up event listeners
  recognition.onresult = (event: SpeechRecognitionEvent) => {
    if (event.results && event.results.length > 0) {
      const transcript = Array.from(event.results)
        .map((result) => result[0]?.transcript || "")
        .join("");

      onResult(transcript);
    }
  };

  recognition.onend = () => {
    onEnd();
  };

  recognition.onerror = (event: any) => {
    console.error("Speech recognition error", event.error);

    // Handle specific error types
    if (event.error === "not-allowed" || event.error === "permission-denied") {
      if (onError)
        onError("permission_denied", "Microphone permission was denied");

      // Try to request permission explicitly
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices
          .getUserMedia({ audio: true })
          .then(() => {
            // Permission granted, try to restart
            try {
              recognition.start();
            } catch (e) {
              console.error("Error restarting speech recognition:", e);
              onEnd();
            }
          })
          .catch((err) => {
            console.error("Microphone permission denied:", err);
            onEnd();
          });
      }
    } else if (event.error === "no-speech") {
      if (onError) onError("no_speech", "No speech was detected");
    } else if (event.error === "audio-capture") {
      if (onError)
        onError(
          "audio_capture",
          "No microphone was found or microphone is not working"
        );
    } else if (event.error === "network") {
      if (onError) onError("network", "Network error occurred");
    } else if (event.error === "aborted") {
      if (onError) onError("aborted", "Speech recognition was aborted");
    } else {
      if (onError) onError("unknown", `Unknown error: ${event.error}`);
    }

    onEnd();
  };

  // Additional event listeners for debugging
  recognition.onnomatch = () => {
    console.log("Speech recognition: No match found");
  };

  recognition.onaudiostart = () => {
    console.log("Speech recognition: Audio capturing started");
  };

  recognition.onspeechstart = () => {
    console.log("Speech recognition: Speech detected");
  };

  // Start listening
  try {
    recognition.start();
    console.log("Speech recognition started");
  } catch (error) {
    console.error("Error starting speech recognition:", error);
    if (onError) onError("start_failed", "Failed to start speech recognition");
    onEnd();
  }
};

/**
 * Stop listening for voice input
 */
export const stopListening = (): void => {
  if (recognition) {
    try {
      recognition.stop();
    } catch (error) {
      console.error("Error stopping speech recognition:", error);
    }
  }
};

/**
 * Check if the browser supports speech synthesis
 */
export const isSpeechSynthesisSupported = (): boolean => {
  return "speechSynthesis" in window;
};

/**
 * Speak text using speech synthesis
 * @param text Text to speak
 * @param onEnd Callback function for when speech ends
 */
export const speak = (text: string, onEnd?: () => void): void => {
  if (!isSpeechSynthesisSupported()) {
    console.error("Speech synthesis not supported in this browser");
    if (onEnd) onEnd();
    return;
  }

  // Cancel any ongoing speech
  synthesis.cancel();

  // Create a new utterance
  const utterance = new SpeechSynthesisUtterance(text);

  // Get the selected voice or find a female voice
  const selectedVoice = getSelectedVoice();
  if (selectedVoice) {
    utterance.voice = selectedVoice;
  } else {
    // Try to find a female voice
    const voices = getAvailableVoices();
    const femaleVoice = voices.find(
      (voice) =>
        voice.name.toLowerCase().includes("female") ||
        voice.name.toLowerCase().includes("woman") ||
        voice.name.toLowerCase().includes("girl") ||
        voice.name.includes("f") // Some voices use 'f' suffix for female
    );

    if (femaleVoice) {
      utterance.voice = femaleVoice;
    }
  }

  // Configure the utterance
  utterance.lang = "en-US";
  utterance.rate = 1.0;
  utterance.pitch = 1.1; // Slightly higher pitch for more feminine sound
  utterance.volume = 1.0;

  // Add natural pauses
  const processedText = addNaturalPauses(text);
  utterance.text = processedText;

  // Set up event listeners
  if (onEnd) {
    utterance.onend = onEnd;
  }

  utterance.onerror = (event) => {
    console.error("Speech synthesis error", event);
    if (onEnd) onEnd();
  };

  // Speak the text
  synthesis.speak(utterance);
};

/**
 * Stop any ongoing speech
 */
export const stopSpeaking = (): void => {
  if (isSpeechSynthesisSupported()) {
    synthesis.cancel();
  }
};

/**
 * Get available voices for speech synthesis
 */
export const getAvailableVoices = (): SpeechSynthesisVoice[] => {
  if (!isSpeechSynthesisSupported()) {
    return [];
  }

  return synthesis.getVoices();
};

/**
 * Set the voice for speech synthesis
 * @param voice Voice to use
 */
export const setVoice = (voice: SpeechSynthesisVoice): void => {
  if (!isSpeechSynthesisSupported()) {
    return;
  }

  // Store the selected voice in localStorage
  localStorage.setItem("selectedVoice", voice.name);
};

/**
 * Get the currently selected voice
 */
export const getSelectedVoice = (): SpeechSynthesisVoice | null => {
  if (!isSpeechSynthesisSupported()) {
    return null;
  }

  const voices = getAvailableVoices();
  const selectedVoiceName = localStorage.getItem("selectedVoice");

  if (selectedVoiceName && voices.length > 0) {
    const selectedVoice = voices.find(
      (voice) => voice.name === selectedVoiceName
    );
    return selectedVoice || voices[0];
  }

  return voices.length > 0 ? voices[0] : null;
};

/**
 * Add natural pauses to text for more human-like speech
 * @param text Text to process
 */
const addNaturalPauses = (text: string): string => {
  // Add slight pauses after punctuation
  let processedText = text
    .replace(/\./g, '. <break time="300ms"/>')
    .replace(/\,/g, ', <break time="200ms"/>')
    .replace(/\;/g, '; <break time="250ms"/>')
    .replace(/\:/g, ': <break time="250ms"/>')
    .replace(/\?/g, '? <break time="300ms"/>')
    .replace(/\!/g, '! <break time="300ms"/>');

  // Add slight emphasis on important words (simple heuristic)
  const emphasisWords = [
    "important",
    "critical",
    "urgent",
    "attention",
    "please",
    "must",
    "should",
    "need",
  ];

  emphasisWords.forEach((word) => {
    const regex = new RegExp(`\\b${word}\\b`, "gi");
    processedText = processedText.replace(
      regex,
      `<emphasis level="moderate">${word}</emphasis>`
    );
  });

  return processedText;
};
