import React from 'react';
import { WarningIcon } from '../icons/Icons';

interface ResetConfirmationModalProps {
    method: 'face' | 'voice';
    onConfirm: () => void;
    onCancel: () => void;
}

const ResetConfirmationModal: React.FC<ResetConfirmationModalProps> = ({ method, onConfirm, onCancel }) => {
    return (
        <div 
            className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" 
            aria-modal="true"
            role="dialog"
            aria-labelledby="reset-confirmation-title"
        >
            <div className="bg-slate-800 rounded-xl shadow-2xl border border-slate-700 p-6 w-full max-w-md text-center">
                <WarningIcon className="w-12 h-12 mx-auto text-amber-400 mb-3" />
                <h2 id="reset-confirmation-title" className="text-xl font-bold text-slate-50">Confirm Enrollment Reset</h2>
                <p className="text-slate-300 mt-2">
                    Are you sure you want to reset your <span className="font-bold">{method}</span> enrollment? This action cannot be undone.
                </p>
                <div className="mt-6 flex justify-center gap-4">
                    <button
                        onClick={onCancel}
                        className="py-2 px-6 bg-slate-600 text-white rounded-lg font-bold hover:bg-slate-500 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="py-2 px-6 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors"
                    >
                        Reset
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ResetConfirmationModal;