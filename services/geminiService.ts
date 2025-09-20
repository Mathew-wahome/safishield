
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { ChatMessage } from '../types';

// IMPORTANT: This is a placeholder for a secure key management system.
// In a real application, this should be handled by a backend proxy to avoid exposing the key.
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("Gemini API key not found. Chatbot functionality will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

const model = 'gemini-2.5-flash';

let chat: Chat | null = null;

const initializeChat = () => {
  if (API_KEY) {
    chat = ai.chats.create({
      model: model,
      config: {
        systemInstruction: `You are "Safi," an AI assistant for SafiShield, a fraud prevention platform in Africa. Your role is to educate users about financial scams in a simple, clear, and friendly manner.
        - Your tone is reassuring, helpful, and professional.
        - Provide concise, actionable advice. Use bullet points for tips.
        - You can generate simple quiz questions to test user knowledge. A quiz question should have the format: [QUESTION] followed by options A, B, C, D on new lines, and finally the correct answer on a new line starting with "ANSWER:".
        - Example Quiz:
          What should you do if you receive an SMS with a suspicious link?
          A. Click it to see where it goes
          B. Reply with your personal details
          C. Delete it and block the number
          D. Forward it to all your friends
          ANSWER: C
        - Keep answers focused on digital financial safety in an African context. Refer to common scam types like mobile money (M-Pesa, etc.), loan scams, impersonation, etc.
        - DO NOT provide financial advice.
        - If the user asks something outside your scope, gently guide them back to financial security topics.`,
      },
    });
  }
};

const parseQuiz = (text: string): Omit<ChatMessage, 'id' | 'sender'> | null => {
  const lines = text.split('\n').filter(line => line.trim() !== '');
  if (lines.length < 3 || !lines[lines.length-1].toUpperCase().startsWith('ANSWER:')) return null;

  const questionIndex = lines.findIndex(line => line.includes('?'));
  if (questionIndex === -1) return null;
  
  const question = lines.slice(0, questionIndex + 1).join('\n');
  const options = lines.slice(questionIndex + 1, -1).map(line => line.trim().substring(3));
  const correctAnswerLetter = lines[lines.length-1].split(':')[1].trim();
  const correctAnswerIndex = 'ABCD'.indexOf(correctAnswerLetter.toUpperCase());
  
  if (options.length < 2 || correctAnswerIndex === -1) return null;

  return {
    text: question,
    type: 'quiz',
    quizOptions: options,
    correctAnswer: options[correctAnswerIndex]
  };
};

export const getChatbotResponse = async (message: string): Promise<Omit<ChatMessage, 'id' | 'sender'>> => {
  if (!API_KEY) {
    return { 
      text: "Chatbot is currently unavailable. Please check the API key configuration.",
      type: 'warning',
    };
  }
  
  if (!chat) {
    initializeChat();
  }

  try {
    const response: GenerateContentResponse = await chat!.sendMessage({ message });
    const text = response.text;
    
    const quizData = parseQuiz(text);
    if(quizData) {
      return quizData;
    }

    return { 
      text,
      type: 'education',
    };
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return {
      text: "Sorry, I'm having trouble connecting right now. Please try again later.",
      type: 'warning',
    };
  }
};
