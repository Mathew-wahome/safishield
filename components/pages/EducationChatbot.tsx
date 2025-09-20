import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage as ChatMessageType } from '../../types';
import { getChatbotResponse } from '../../services/geminiService';
import ChatMessage from '../Education/ChatMessage';
import ChatInput from '../Education/ChatInput';

const EducationChatbot: React.FC = () => {
    const [messages, setMessages] = useState<ChatMessageType[]>([
        {
            id: 'init',
            sender: 'bot',
            text: "Hello! I'm Safi, your financial security assistant. How can I help you learn about staying safe from scams today?",
            type: 'education',
        },
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSendMessage = async (text: string) => {
        if (isLoading || !text.trim()) return;

        const userMessage: ChatMessageType = {
            id: `user_${Date.now()}`,
            sender: 'user',
            text,
        };
        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);

        const botResponse = await getChatbotResponse(text);
        
        const botMessage: ChatMessageType = {
            id: `bot_${Date.now()}`,
            sender: 'bot',
            ...botResponse,
        };
        setMessages(prev => [...prev, botMessage]);
        setIsLoading(false);
    };
    
    const handleQuizAnswer = (question: string, answer: string, isCorrect: boolean) => {
        const feedbackText = isCorrect
          ? `Correct! "${answer}" is the right choice. Well done!`
          : `Not quite. The correct answer for "${question.substring(0,30)}..." is the one you didn't pick. Keep learning!`;

        const systemMessage: ChatMessageType = {
            id: `system_${Date.now()}`,
            sender: 'system',
            text: feedbackText,
        };
        setMessages(prev => [...prev, systemMessage]);
    };

    return (
        <div className="flex flex-col h-[calc(100vh-150px)] max-w-4xl mx-auto bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex-1 p-6 overflow-y-auto space-y-4">
                {messages.map(msg => (
                    <ChatMessage key={msg.id} message={msg} onQuizAnswer={handleQuizAnswer} />
                ))}
                {isLoading && (
                     <div className="flex justify-start">
                        <div className="bg-slate-100 dark:bg-slate-700 text-slate-800 rounded-lg p-3 max-w-lg">
                            <div className="flex items-center space-x-2">
                               <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></div>
                               <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse delay-75"></div>
                               <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse delay-150"></div>
                           </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                <ChatInput onSend={handleSendMessage} disabled={isLoading} />
            </div>
        </div>
    );
};

export default EducationChatbot;
