import React, { useState } from 'react';
import { ChatMessage as ChatMessageType } from '../../types';
import { SafiShieldLogo, InfoIcon } from '../icons/Icons';

interface ChatMessageProps {
    message: ChatMessageType;
    onQuizAnswer: (question: string, answer: string, isCorrect: boolean) => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, onQuizAnswer }) => {
    const [answered, setAnswered] = useState(false);

    const handleOptionClick = (option: string) => {
        if (answered) return;
        setAnswered(true);
        onQuizAnswer(message.text, option, option === message.correctAnswer!);
    };

    const isUser = message.sender === 'user';
    const isSystem = message.sender === 'system';
    const isQuiz = message.type === 'quiz';

    if (isSystem) {
        return (
            <div className="text-center text-xs text-slate-500 dark:text-slate-400 my-2">
                {message.text}
            </div>
        )
    }
    
    if (message.type === 'warning') {
       return (
         <div className="flex justify-start items-start gap-3">
             <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                <InfoIcon className="w-5 h-5 text-amber-500" />
            </div>
            <div className="bg-amber-500/10 text-amber-800 dark:text-amber-300 rounded-lg p-3 max-w-lg">
                 <p className="font-semibold text-sm">System Notice</p>
                 <p>{message.text}</p>
            </div>
        </div>
       )
    }

    return (
        <div className={`flex items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
            {!isUser && (
                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                    <SafiShieldLogo className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                </div>
            )}
            <div
                className={`${
                    isUser ? 'bg-sky-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200'
                } rounded-lg p-3 max-w-lg`}
            >
                <p className="whitespace-pre-wrap">{message.text}</p>
                {isQuiz && message.quizOptions && (
                    <div className="mt-3 pt-3 border-t border-slate-200/50 dark:border-slate-600/50 space-y-2">
                        {message.quizOptions.map((option, index) => {
                            const isCorrect = option === message.correctAnswer;
                            const buttonStyle = answered
                              ? isCorrect ? 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-400 dark:border-emerald-500' : 'bg-red-500/20 text-red-800 dark:text-red-300 border-red-400 dark:border-red-500'
                              : 'bg-white dark:bg-slate-600 hover:bg-slate-200/50 dark:hover:bg-slate-500 border-slate-300 dark:border-slate-500';
                            
                            return (
                                <button
                                    key={index}
                                    onClick={() => handleOptionClick(option)}
                                    disabled={answered}
                                    className={`block w-full text-left p-2 rounded-md border text-sm transition-colors ${buttonStyle}`}
                                >
                                    <strong>{String.fromCharCode(65 + index)}.</strong> {option}
                                </button>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatMessage;
