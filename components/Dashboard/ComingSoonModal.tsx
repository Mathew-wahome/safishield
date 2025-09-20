import React from 'react';
import { CloseIcon, InfoIcon } from '../icons/Icons';

interface ComingSoonModalProps {
    onClose: () => void;
}

const ComingSoonModal: React.FC<ComingSoonModalProps> = ({ onClose }) => {
    return (
        <div 
            className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" 
            aria-modal="true"
            role="dialog"
            aria-labelledby="coming-soon-title"
        >
            <div className="bg-slate-800 rounded-xl shadow-2xl border border-slate-700 p-8 w-full max-w-md text-center relative">
                <button 
                    onClick={onClose} 
                    className="absolute top-4 right-4 p-1 rounded-full hover:bg-slate-700"
                    aria-label="Close"
                >
                    <CloseIcon className="w-6 h-6 text-slate-400" />
                </button>
                <InfoIcon className="w-16 h-16 mx-auto text-sky-400 mb-4" />
                <h2 id="coming-soon-title" className="text-2xl font-bold font-heading text-slate-50">Feature Coming Soon!</h2>
                <p className="text-slate-300 mt-2">
                    Our team is working hard to bring this feature to you. Please check back later.
                </p>
                <button
                    onClick={onClose}
                    className="mt-6 py-2 px-8 bg-sky-500 text-white rounded-lg font-bold hover:bg-sky-600 transition-colors"
                >
                    Got it
                </button>
            </div>
        </div>
    );
};

export default ComingSoonModal;
