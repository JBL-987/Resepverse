/**
 * Gemini AI Service for Telepathia AI
 * 
 * This service handles communication with Google's Gemini API to power the AI agents.
 */

// API configuration
const API_KEY = 'AIzaSyCY9eyAXjXvqww9AVNw7ObdGT-SUaXZXAs';
const MODEL = 'gemini-2.0-flash-lite';
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

// Types for Gemini API
interface GeminiRequest {
  contents: {
    role: 'user' | 'model';
    parts: {
      text: string;
    }[];
  }[];
  generationConfig?: {
    temperature?: number;
    topK?: number;
    topP?: number;
    maxOutputTokens?: number;
    stopSequences?: string[];
  };
  safetySettings?: {
    category: string;
    threshold: string;
  }[];
}

interface GeminiResponse {
  candidates: {
    content: {
      parts: {
        text: string;
      }[];
    };
    finishReason: string;
    safetyRatings: {
      category: string;
      probability: string;
    }[];
  }[];
  promptFeedback?: {
    safetyRatings: {
      category: string;
      probability: string;
    }[];
  };
}

// Agent profile interface
export interface AgentProfile {
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
  communicationStyle: 'formal' | 'casual' | 'friendly' | 'professional';
  decisionMaking: 'cautious' | 'balanced' | 'decisive';
}

/**
 * Generate a system prompt for the AI agent based on the user's profile
 */
const generateSystemPrompt = (agentProfile: AgentProfile, userAddress: string): string => {
  const availabilityText = Object.entries(agentProfile.availability)
    .filter(([_, value]) => value)
    .map(([key]) => key)
    .join(', ');

  return `
You are an AI agent named ${agentProfile.name}, representing a user with the blockchain address ${userAddress}.
Your role is to communicate on behalf of your user according to their preferences and needs.

USER PROFILE:
- Bio: ${agentProfile.bio}
- Interests: ${agentProfile.interests.join(', ')}
- Availability: ${availabilityText}
- Communication style: ${agentProfile.communicationStyle}
- Decision-making approach: ${agentProfile.decisionMaking}

GUIDELINES:
1. You should maintain the communication style specified in the user's profile.
2. When making decisions or commitments, follow the user's decision-making approach.
3. You can share information about the user's interests and availability when relevant.
4. If you don't have enough information to respond to a query, indicate that you need to check with the user.
5. Always prioritize the user's privacy and security.
6. Be helpful, concise, and respectful in all communications.

Your goal is to save the user time and mental energy by handling routine communications effectively.
`;
};

/**
 * Generate a response from the AI agent
 */
export const generateAgentResponse = async (
  message: string,
  agentProfile: AgentProfile,
  userAddress: string,
  conversationHistory: { role: 'user' | 'model'; content: string }[] = []
): Promise<string> => {
  try {
    // Create the system prompt
    const systemPrompt = generateSystemPrompt(agentProfile, userAddress);
    
    // Prepare the conversation history for the API request
    const contents = [
      {
        role: 'user' as const,
        parts: [{ text: systemPrompt }]
      }
    ];
    
    // Add conversation history
    conversationHistory.forEach(entry => {
      contents.push({
        role: entry.role,
        parts: [{ text: entry.content }]
      });
    });
    
    // Add the current message
    contents.push({
      role: 'user' as const,
      parts: [{ text: message }]
    });
    
    // Prepare the request
    const requestBody: GeminiRequest = {
      contents,
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      }
    };
    
    // Make the API request
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });
    
    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${errorData}`);
    }
    
    const data = await response.json() as GeminiResponse;
    
    // Extract the response text
    if (data.candidates && data.candidates.length > 0) {
      const responseText = data.candidates[0].content.parts[0].text;
      return responseText;
    } else {
      throw new Error('No response generated from Gemini API');
    }
  } catch (error) {
    console.error('Error generating agent response:', error);
    return "I'm sorry, I encountered an error while processing your request. Please try again later.";
  }
};

/**
 * Generate a response for agent-to-agent communication
 */
export const generateAgentToAgentResponse = async (
  senderAgentProfile: AgentProfile,
  receiverAgentProfile: AgentProfile,
  message: string,
  context: string
): Promise<string> => {
  try {
    const prompt = `
You are an AI agent named ${receiverAgentProfile.name}, communicating with another AI agent named ${senderAgentProfile.name}.

CONTEXT:
${context}

SENDER AGENT PROFILE:
- Communication style: ${senderAgentProfile.communicationStyle}
- Decision-making approach: ${senderAgentProfile.decisionMaking}

YOUR PROFILE:
- Communication style: ${receiverAgentProfile.communicationStyle}
- Decision-making approach: ${receiverAgentProfile.decisionMaking}

The other agent has sent you this message:
"${message}"

Please respond appropriately based on your communication style and decision-making approach.
`;

    const requestBody: GeminiRequest = {
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      }
    };
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });
    
    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${errorData}`);
    }
    
    const data = await response.json() as GeminiResponse;
    
    if (data.candidates && data.candidates.length > 0) {
      const responseText = data.candidates[0].content.parts[0].text;
      return responseText;
    } else {
      throw new Error('No response generated from Gemini API');
    }
  } catch (error) {
    console.error('Error generating agent-to-agent response:', error);
    return "I'm sorry, I encountered an error while processing the communication. Please try again later.";
  }
};
