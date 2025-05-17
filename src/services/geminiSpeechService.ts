/**
 * Gemini Speech Service for Telepathia AI
 *
 * This service handles voice input using Google's Gemini API.
 */

// API configuration
const API_KEY = "AIzaSyCY9eyAXjXvqww9AVNw7ObdGT-SUaXZXAs";
const MODEL = "gemini-2.0-flash-live-001";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

// MediaRecorder instance
let mediaRecorder: MediaRecorder | null = null;
let audioChunks: Blob[] = [];
let recordingStream: MediaStream | null = null;

/**
 * Check if the browser supports MediaRecorder
 */
export const isMediaRecorderSupported = (): boolean => {
  return (
    "MediaRecorder" in window &&
    navigator.mediaDevices &&
    !!navigator.mediaDevices.getUserMedia
  );
};

/**
 * Request microphone permission explicitly
 */
export const requestMicrophonePermission = async (): Promise<boolean> => {
  try {
    await navigator.mediaDevices.getUserMedia({ audio: true });
    return true;
  } catch (error) {
    console.error("Microphone permission denied:", error);
    return false;
  }
};

/**
 * Start recording audio
 * @param onTranscript Callback function for transcription results
 * @param onError Callback function for errors
 */
export const startRecording = async (
  onTranscript: (transcript: string) => void,
  onError: (errorType: string, errorMessage: string) => void
): Promise<void> => {
  // Check if MediaRecorder is supported
  if (!isMediaRecorderSupported()) {
    onError(
      "not_supported",
      "Audio recording is not supported in this browser"
    );
    return;
  }

  try {
    // Stop any existing recording
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      stopRecording();
    }

    // Reset audio chunks
    audioChunks = [];

    // Get microphone stream
    recordingStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });

    // Create MediaRecorder instance with appropriate MIME type
    const mimeType = MediaRecorder.isTypeSupported("audio/webm")
      ? "audio/webm"
      : MediaRecorder.isTypeSupported("audio/mp4")
      ? "audio/mp4"
      : "audio/ogg";

    console.log(`Using MIME type: ${mimeType} for recording`);

    mediaRecorder = new MediaRecorder(recordingStream, {
      mimeType: mimeType,
      audioBitsPerSecond: 128000,
    });

    // Set up event handlers
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.push(event.data);
      }
    };

    mediaRecorder.onstop = async () => {
      try {
        // Create audio blob from chunks with the same MIME type used for recording
        const mimeType = mediaRecorder?.mimeType || "audio/webm";
        console.log(`Creating audio blob with MIME type: ${mimeType}`);
        const audioBlob = new Blob(audioChunks, { type: mimeType });

        // Transcribe audio using Gemini API
        const transcript = await transcribeAudio(audioBlob);
        onTranscript(transcript);
      } catch (error) {
        console.error("Error transcribing audio:", error);
        onError("transcription_failed", "Failed to transcribe audio");
      } finally {
        // Clean up
        if (recordingStream) {
          recordingStream.getTracks().forEach((track) => track.stop());
          recordingStream = null;
        }
      }
    };

    // Start recording
    mediaRecorder.start(500); // Collect data every 500ms for better quality
    console.log("Recording started");
  } catch (error) {
    console.error("Error starting recording:", error);

    if ((error as Error).name === "NotAllowedError") {
      onError("permission_denied", "Microphone permission was denied");
    } else if ((error as Error).name === "NotFoundError") {
      onError("device_not_found", "No microphone was found on your device");
    } else {
      onError(
        "recording_failed",
        `Failed to start recording: ${(error as Error).message}`
      );
    }
  }
};

/**
 * Stop recording audio
 */
export const stopRecording = (): void => {
  if (mediaRecorder && mediaRecorder.state !== "inactive") {
    mediaRecorder.stop();
    console.log("Recording stopped");
  }
};

/**
 * Transcribe audio using Gemini API
 * @param audioBlob Audio blob to transcribe
 * @returns Transcription text
 */
const transcribeAudio = async (audioBlob: Blob): Promise<string> => {
  try {
    // Convert audio blob to base64
    const base64Audio = await blobToBase64(audioBlob);

    // Prepare request body
    const requestBody = {
      contents: [
        {
          role: "user",
          parts: [
            {
              audio_data: {
                audio_file: {
                  data: base64Audio.split(",")[1], // Remove data URL prefix
                },
              },
            },
          ],
        },
      ],
      generation_config: {
        temperature: 0,
        topP: 0.8,
        topK: 40,
      },
    };

    console.log("Sending audio to Gemini for transcription...");

    // Make API request
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error response:", errorText);
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    // Parse response
    const data = await response.json();
    console.log("Gemini transcription response:", data);

    // Extract transcription text
    if (data.candidates && data.candidates.length > 0) {
      const candidate = data.candidates[0];

      if (
        candidate.content &&
        candidate.content.parts &&
        candidate.content.parts.length > 0
      ) {
        const part = candidate.content.parts[0];
        if (part.text) {
          return part.text;
        }
      }

      // If we can't find text in the expected structure, try to extract it from the raw response
      if (candidate.content && candidate.content.parts) {
        // Try to find any text in any part
        for (const part of candidate.content.parts) {
          if (part.text) {
            return part.text;
          }
        }
      }
    }

    // If we still don't have a transcript, check if there's a finish reason
    if (data.promptFeedback && data.promptFeedback.blockReason) {
      throw new Error(
        `Transcription blocked: ${data.promptFeedback.blockReason}`
      );
    }

    // If we get here, we couldn't extract a transcript
    console.warn("Could not extract transcript from Gemini response:", data);
    return "";
  } catch (error) {
    console.error("Error transcribing audio:", error);
    throw error;
  }
};

/**
 * Convert blob to base64
 * @param blob Blob to convert
 * @returns Base64 string
 */
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};
