import React, { useState } from 'react';
import { useUser } from '../hooks/useUser';
// Fix: Import UserPage from the correct source file.
import type { UserPage } from '../../../types';
import PageHeader from '../components/PageHeader';
import { UserTransaction } from '../../../types';
import { analyzeTransactionRisk } from '../services/anomalyEngine';
import { ANOMALY_THRESHOLDS } from '../constants';
import * as localData from '../services/userLocalData';
import BiometricVerificationModal from '../components/BiometricVerificationModal';
import PinVerificationModal from '../components/PinVerificationModal';

interface SendMoneyPageProps {
    setCurrentPage: (page: UserPage) => void;
}

const SendMoneyPage: React.FC<SendMoneyPageProps> = ({ setCurrentPage }) => {
    const { profile, transactions, updateBalance, addTransaction, addAlert, showToast, t, biometrics, settings } = useUser();
    const [recipient, setRecipient] = useState('');
    const [amount, setAmount] = useState('');
    const [note, setNote] = useState('');
    
    const [isVerifying, setIsVerifying] = useState(false);
    const [isVerifyingWithPin, setIsVerifyingWithPin] = useState(false);
    const [pendingTx, setPendingTx] = useState<Omit<UserTransaction, 'id' | 'timestamp' | 'verificationMethod'> | null>(null);

    if (!profile) return null;
    
    const agents = localData.getAgents();
    
    const completeTransaction = (tx: Omit<UserTransaction, 'id' | 'timestamp'>) => {
        const newBalance = profile.balance - tx.amount;
        updateBalance(newBalance);
        addTransaction({
            ...tx,
            id: `tx_${Date.now()}`,
            timestamp: new Date().toISOString(),
        });
        showToast('Transaction successful!', 'success');
        setCurrentPage('dashboard');
    };

    const blockTransaction = (tx: Omit<UserTransaction, 'id' | 'timestamp' | 'verificationMethod'>, reason: string) => {
        addAlert({
            description: `Transaction of KES ${tx.amount} to ${tx.recipient} blocked. Reason: ${reason}`,
            riskScore: tx.riskScore,
            relatedTxId: `tx_${Date.now()}`, // Associate alert with a potential transaction attempt
        });
        showToast('Transaction Blocked! High risk detected.', 'error');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0 || numAmount > profile.balance) {
            showToast('Invalid amount or insufficient funds.', 'error');
            return;
        }

        const txData = {
            type: 'send' as const,
            recipient,
            amount: numAmount,
            note,
        };
        
        const { riskScore, reasons } = analyzeTransactionRisk(txData, profile, transactions);
        console.log(`Risk Analysis: Score ${riskScore}`, reasons);
        
        const txWithRisk = { ...txData, riskScore, flagged: riskScore >= ANOMALY_THRESHOLDS.biometric_required };
        
        if (riskScore >= ANOMALY_THRESHOLDS.block) {
            blockTransaction(txWithRisk, 'Risk score over block threshold.');
        } else if (riskScore >= ANOMALY_THRESHOLDS.biometric_required) {
            setPendingTx(txWithRisk);
            const hasBiometrics = settings.biometricsConsent && (biometrics?.face || biometrics?.voice);
            if (hasBiometrics) {
                setIsVerifying(true);
            } else {
                setIsVerifyingWithPin(true);
            }
        } else {
            completeTransaction({ ...txWithRisk, verificationMethod: 'none' });
        }
    };

    const handleVerificationSuccess = () => {
        if (pendingTx) {
            completeTransaction({ ...pendingTx, verificationMethod: 'biometric' });
        }
        setIsVerifying(false);
        setPendingTx(null);
    };
    
    const handleVerificationFailure = (reason: string) => {
        if (pendingTx) {
            blockTransaction(pendingTx, `Biometric verification failed: ${reason}`);
        }
        setIsVerifying(false);
        setPendingTx(null);
    };

    const handlePinVerificationSuccess = () => {
        if (pendingTx) {
            completeTransaction({ ...pendingTx, verificationMethod: 'pin' });
        }
        setIsVerifyingWithPin(false);
        setPendingTx(null);
    };

    const handlePinVerificationFailure = (reason: string) => {
        if (pendingTx) {
            blockTransaction(pendingTx, `PIN verification failed: ${reason}`);
        }
        setIsVerifyingWithPin(false);
        setPendingTx(null);
    };

    const inputClasses = "mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm";

    return (
        <>
            {isVerifying && (
                <BiometricVerificationModal
                    method={biometrics?.face ? 'face' : 'voice'}
                    onSuccess={() => handleVerificationSuccess()}
                    onFailure={handleVerificationFailure}
                    onClose={() => setIsVerifying(false)}
                />
            )}
            {isVerifyingWithPin && (
                <PinVerificationModal
                    onSuccess={handlePinVerificationSuccess}
                    onFailure={handlePinVerificationFailure}
                    onClose={() => setIsVerifyingWithPin(false)}
                />
            )}
            <div>
                <PageHeader title={t('send_money_title')} onBack={() => setCurrentPage('dashboard')} />
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="recipient" className="block text-sm font-medium">{t('send_money_recipient')}</label>
                         <select id="recipient" value={recipient} onChange={e => setRecipient(e.target.value)} required className={inputClasses}>
                            <option value="" disabled>Select an agent</option>
                            {agents.map(agent => <option key={agent.agent_id} value={agent.agent_id}>{agent.name_masked} ({agent.agent_id})</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="amount" className="block text-sm font-medium">{t('send_money_amount')}</label>
                        <input
                            type="number"
                            id="amount"
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                            required
                            placeholder="0.00"
                            className={inputClasses}
                        />
                    </div>
                     <div>
                        <label htmlFor="note" className="block text-sm font-medium">{t('send_money_note')}</label>
                        <input
                            type="text"
                            id="note"
                            value={note}
                            onChange={e => setNote(e.target.value)}
                            className={inputClasses}
                        />
                    </div>
                    <button type="submit" className="w-full py-3 bg-sky-500 text-white rounded-lg font-bold disabled:opacity-50" disabled={!recipient || !amount}>
                        {t('send_money_button')}
                    </button>
                </form>
            </div>
        </>
    );
};

export default SendMoneyPage;