import React, { useState } from 'react';
import { SendIcon } from '../icons/Icons';

interface ChatInputProps {
    onSend: (text: string) => void;
    disabled: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSend, disabled }) => {
    const [text, setText] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (text.trim()) {
            onSend(text);
            setText('');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex items-center gap-3">
            <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Ask about loan scams..."
                disabled={disabled}
                className="flex-1 w-full px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-full shadow-sm placeholder-slate-400 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-shadow"
                aria-label="Chat message input"
            />
            <button
                type="submit"
                disabled={disabled || !text.trim()}
                className="w-10 h-10 flex items-center justify-center bg-sky-500 text-white rounded-full transition-opacity disabled:opacity-50 hover:bg-sky-600"
                aria-label="Send message"
            >
                <SendIcon className="w-5 h-5" />
            </button>
        </form>
    );
};

export default ChatInput;
