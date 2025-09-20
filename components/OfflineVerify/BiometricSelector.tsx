import React from 'react';
import { FaceIcon, MicIcon, WarningIcon } from '../icons/Icons';

interface BiometricSelectorProps {
    onSelect: (method: 'face' | 'voice') => void;
    modelsLoaded: boolean;
    modelsError: string | null;
}

const BiometricSelector: React.FC<BiometricSelectorProps> = ({ onSelect, modelsLoaded, modelsError }) => {
    
    const faceButtonContent = () => {
        if (modelsError) {
            return (
                <>
                    <WarningIcon className="w-16 h-16 mb-4 text-red-400" />
                    <h3 className="text-xl font-bold text-slate-100">Module Error</h3>
                    <p className="text-sm text-red-400 mt-1">Face enrollment is unavailable.</p>
                </>
            );
        }
        if (!modelsLoaded) {
            return (
                <div className="flex flex-col items-center justify-center">
                    <svg className="animate-spin h-16 w-16 mb-4 text-sky-400" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <h3 className="text-xl font-bold text-slate-100">Initializing...</h3>
                    <p className="text-sm text-slate-400 mt-1">Loading security module...</p>
                </div>
            );
        }
        return (
            <>
                <FaceIcon className="w-16 h-16 mb-4 text-sky-300" />
                <h3 className="text-xl font-bold text-slate-100">Enroll with Face</h3>
                <p className="text-sm text-slate-400 mt-1">Use your device's camera for facial recognition.</p>
            </>
        );
    };

    return (
        <div className="bg-slate-900/30 backdrop-blur-lg border border-slate-100/20 rounded-xl shadow-2xl p-8 text-center">
            <h2 className="text-2xl font-bold font-heading text-slate-50 mb-2">Choose Your Biometric Method</h2>
            <p className="text-slate-300 mb-6">Select how you'd like to secure your offline transactions. This data is only stored on this device.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <button
                    onClick={() => onSelect('face')}
                    disabled={!modelsLoaded || !!modelsError}
                    className="flex flex-col items-center justify-center p-6 bg-slate-800/50 border-2 rounded-lg transition-all duration-300
                    disabled:opacity-70 disabled:cursor-not-allowed
                    enabled:hover:bg-sky-500/20 enabled:hover:border-sky-400
                    border-slate-600
                    "
                >
                    {faceButtonContent()}
                </button>
                <button
                    onClick={() => onSelect('voice')}
                    className="flex flex-col items-center justify-center p-6 bg-slate-800/50 hover:bg-emerald-500/20 border-2 border-slate-600 hover:border-emerald-400 rounded-lg transition-all duration-300"
                >
                    <MicIcon className="w-16 h-16 mb-4 text-emerald-300" />
                    <h3 className="text-xl font-bold text-slate-100">Enroll with Voice</h3>
                    <p className="text-sm text-slate-400 mt-1">Use your device's microphone for voice recognition.</p>
                </button>
            </div>
        </div>
    );
};

export default BiometricSelector;