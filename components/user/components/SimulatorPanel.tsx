import React, { useState } from 'react';
import { useUser } from '../hooks/useUser';
import { KeyIcon, WarningIcon } from '../../icons/Icons';
import { SEED_USER_PROFILE } from '../constants';

const SimulatorPanel: React.FC = () => {
    const { profile, addTransaction, updateBalance, updateProfile, showToast } = useUser();
    const [isOpen, setIsOpen] = useState(false);

    if (!profile) return null;
    
    const isSimSwapped = profile.lastSimIccid !== SEED_USER_PROFILE.lastSimIccid;

    const handleSimSwapToggle = () => {
        const newIccid = isSimSwapped ? SEED_USER_PROFILE.lastSimIccid : `swapped_${Date.now()}`;
        updateProfile({ lastSimIccid: newIccid });
        showToast(`SIM Swap Attack ${isSimSwapped ? 'Reverted' : 'Injected'}!`, 'info');
    };

    const handleRapidTransfers = () => {
        let currentBalance = profile.balance;
        for (let i = 0; i < 4; i++) {
            const amount = 100 + i;
            currentBalance -= amount;
            addTransaction({
                id: `sim_tx_${Date.now() + i}`,
                type: 'send',
                recipient: '254700000001',
                amount: amount,
                timestamp: new Date(Date.now() - (30 - i*5)*1000).toISOString(),
                riskScore: 0,
                flagged: false,
                verificationMethod: 'none',
            });
        }
        updateBalance(currentBalance);
        showToast('4 rapid transactions added. Next tx will be flagged.', 'info');
    };


    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-20 right-2 z-50 p-3 bg-amber-500 text-white rounded-full shadow-lg"
                title="Open Simulator"
            >
                <KeyIcon className="w-6 h-6" />
            </button>
        );
    }

    return (
        <div className="fixed bottom-20 right-2 z-50 p-4 bg-slate-700 text-white rounded-lg shadow-2xl border border-slate-600 w-64">
            <div className="flex justify-between items-center mb-2">
                <h4 className="font-bold">Simulator</h4>
                <button onClick={() => setIsOpen(false)} className="text-xl">&times;</button>
            </div>
            <div className="space-y-2 text-sm">
                <button
                    onClick={handleSimSwapToggle}
                    className={`w-full p-2 text-left rounded ${isSimSwapped ? 'bg-red-500' : 'bg-slate-600'}`}
                >
                    {isSimSwapped ? 'Revert SIM Swap' : 'Inject SIM Swap Attack'}
                </button>
                <button
                    onClick={handleRapidTransfers}
                    className="w-full p-2 text-left rounded bg-slate-600"
                >
                    Inject Rapid Transfers
                </button>
                <div className="flex items-start gap-2 pt-2 text-xs text-amber-200">
                    <WarningIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <p>This panel simulates high-risk events for demo purposes.</p>
                </div>
            </div>
        </div>
    );
};

export default SimulatorPanel;