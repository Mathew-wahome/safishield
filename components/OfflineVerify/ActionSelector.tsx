import React from 'react';
import { FaceIcon, MicIcon, CheckCircleIcon, WarningIcon } from '../icons/Icons';

interface ActionSelectorProps {
    method: 'face' | 'voice';
    isEnrolled: boolean;
    onEnrollClick: () => void;
    onVerifyClick: () => void;
    onBackClick: () => void;
}

const ActionSelector: React.FC<ActionSelectorProps> = ({ method, isEnrolled, onEnrollClick, onVerifyClick, onBackClick }) => {
    const isFace = method === 'face';
    const MethodIcon = isFace ? FaceIcon : MicIcon;
    const methodName = isFace ? 'Face' : 'Voice';
    const accentColor = isFace ? 'sky' : 'emerald';

    return (
        <div className={`bg-slate-900/30 backdrop-blur-lg border border-slate-100/20 rounded-xl shadow-2xl p-6 text-center`}>
            <div className="relative text-center mb-4">
                <button onClick={onBackClick} className="absolute left-0 top-1 text-sm text-slate-300 hover:text-sky-300 transition-colors">&larr; Change Method</button>
                <h2 className="text-2xl font-bold font-heading text-slate-50">Manage {methodName} Biometric</h2>
            </div>

            <MethodIcon className={`w-24 h-24 mx-auto my-6 text-${accentColor}-300`} />

            <div className={`flex items-center justify-center gap-2 p-3 rounded-lg text-sm mb-8 ${isEnrolled ? `bg-emerald-500/10 text-emerald-300` : `bg-amber-500/10 text-amber-300`}`}>
                {isEnrolled ? <CheckCircleIcon className="w-5 h-5" /> : <WarningIcon className="w-5 h-5" />}
                <span>Status: <strong>{isEnrolled ? 'Enrolled' : 'Not Enrolled'}</strong></span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button 
                    onClick={onEnrollClick} 
                    className={`py-3 px-6 rounded-lg font-bold border-2 transition-colors
                        bg-${accentColor}-500 border-${accentColor}-500 text-white
                        enabled:hover:bg-${accentColor}-600 enabled:hover:border-${accentColor}-600
                    `}
                >
                    {isEnrolled ? `Re-Enroll ${methodName}` : `Enroll New ${methodName}`}
                </button>
                <button 
                    onClick={onVerifyClick} 
                    disabled={!isEnrolled}
                    className={`py-3 px-6 rounded-lg font-bold border-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                         bg-transparent border-slate-300 text-slate-50
                         enabled:hover:bg-slate-700
                         disabled:border-slate-700 disabled:text-slate-500
                    `}
                >
                    Simulate Verification
                </button>
            </div>
            {isEnrolled && <p className="text-xs text-slate-400 mt-2">Re-enrolling will overwrite existing data.</p>}
        </div>
    );
};

export default ActionSelector;
