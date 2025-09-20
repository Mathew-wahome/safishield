import React, { useState } from 'react';
import { useUser } from '../hooks/useUser';
import { KeyIcon, CloseIcon } from '../../icons/Icons';

interface PinVerificationModalProps {
    onSuccess: () => void;
    onFailure: (reason: string) => void;
    onClose: () => void;
}

const PinVerificationModal: React.FC<PinVerificationModalProps> = ({ onSuccess, onFailure, onClose }) => {
    const { profile } = useUser();
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');

    const handlePinChange = (value: string) => {
        const numericValue = value.replace(/\D/g, '');
        if (numericValue.length <= 6) {
            setPin(numericValue);
            setError('');
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (pin === profile?.pin) {
            onSuccess();
        } else {
            setError('Incorrect PIN. Transaction blocked.');
            setTimeout(() => {
                onFailure('Incorrect PIN');
                onClose();
            }, 1000);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" aria-modal="true">
            <div className="bg-slate-800 rounded-xl shadow-2xl border border-slate-700 p-6 w-full max-w-sm text-center relative">
                <button onClick={onClose} className="absolute top-2 right-2 p-1 rounded-full hover:bg-slate-700">
                    <CloseIcon className="w-5 h-5 text-slate-400"/>
                </button>
                <KeyIcon className="w-12 h-12 mx-auto text-amber-400 mb-3" />
                <h3 className="text-xl font-bold text-slate-50">PIN Verification Required</h3>
                <p className="text-slate-400 text-sm mt-1">This transaction is high-risk. Please enter your PIN to proceed.</p>
                
                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                    <input
                        type="password"
                        value={pin}
                        onChange={(e) => handlePinChange(e.target.value)}
                        placeholder="● ● ● ● ● ●"
                        maxLength={6}
                        required
                        autoFocus
                        className="w-full tracking-[1.5em] text-center text-2xl font-mono block px-4 py-3 text-slate-50 placeholder-slate-500 bg-slate-700 border border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                    {error && <p className="text-red-400 text-sm">{error}</p>}
                    <button type="submit" className="w-full py-3 bg-amber-500 text-white rounded-lg font-bold disabled:opacity-50" disabled={pin.length < 6}>
                        Verify Transaction
                    </button>
                </form>
            </div>
        </div>
    );
};

export default PinVerificationModal;