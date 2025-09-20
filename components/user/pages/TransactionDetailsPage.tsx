import React from 'react';
import { useUser } from '../hooks/useUser';
// Fix: Import UserPage from the correct source file.
import type { UserPage } from '../../../types';
import PageHeader from '../components/PageHeader';
import { InfoIcon, WarningIcon, CheckCircleIcon, SendIcon, WithdrawIcon } from '../../icons/Icons';

interface TransactionDetailsPageProps {
    transactionId: string;
    setCurrentPage: (page: UserPage) => void;
}

const DetailRow: React.FC<{ label: string, value: React.ReactNode, isMono?: boolean }> = ({ label, value, isMono = false }) => (
    <div className="flex justify-between items-center py-2">
        <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
        <p className={`font-semibold text-right ${isMono ? 'font-mono text-xs' : ''}`}>{value}</p>
    </div>
);

const TransactionDetailsPage: React.FC<TransactionDetailsPageProps> = ({ transactionId, setCurrentPage }) => {
    const { transactions, alerts } = useUser();

    const transaction = transactions.find(tx => tx.id === transactionId);
    const relatedAlert = alerts.find(alert => alert.relatedTxId === transactionId);

    if (!transaction) {
        return (
            <div>
                <PageHeader title="Transaction Not Found" onBack={() => setCurrentPage('history')} />
                <p className="text-center">The requested transaction could not be found.</p>
            </div>
        );
    }

    const isSend = transaction.type === 'send';
    const riskScore = transaction.riskScore;
    
    let riskStatus: 'low' | 'medium' | 'high' = 'low';
    if (riskScore >= 85) riskStatus = 'high';
    else if (riskScore >= 50) riskStatus = 'medium';

    const riskStyles = {
        low: { Icon: CheckCircleIcon, color: 'text-emerald-500', bg: 'bg-emerald-500/10', text: 'Low Risk' },
        medium: { Icon: InfoIcon, color: 'text-amber-500', bg: 'bg-amber-500/10', text: 'Medium Risk' },
        high: { Icon: WarningIcon, color: 'text-red-500', bg: 'bg-red-500/10', text: 'High Risk' },
    };

    const { Icon: RiskIcon, color: riskColor, bg: riskBg, text: riskText } = riskStyles[riskStatus];

    return (
        <div>
            <PageHeader title="Transaction Details" onBack={() => setCurrentPage('history')} />
            
            <div className="space-y-6">
                {/* Main Transaction Info */}
                <div className="p-4 bg-slate-200 dark:bg-slate-800 rounded-lg">
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isSend ? 'bg-sky-500/20' : 'bg-emerald-500/20'}`}>
                            {isSend ? <SendIcon className="w-6 h-6 text-sky-500" /> : <WithdrawIcon className="w-6 h-6 text-emerald-500" />}
                        </div>
                        <div>
                            <p className={`font-bold text-3xl ${isSend ? 'text-red-500' : 'text-emerald-500'}`}>
                                {isSend ? '-' : '+'} KES {transaction.amount.toLocaleString()}
                            </p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{new Date(transaction.timestamp).toLocaleString()}</p>
                        </div>
                    </div>
                </div>

                {/* Risk Analysis */}
                <div className={`p-4 rounded-lg ${riskBg}`}>
                    <h3 className="font-bold flex items-center gap-2 mb-2">
                        <RiskIcon className={`w-5 h-5 ${riskColor}`} />
                        Risk Analysis
                    </h3>
                    <div className={`flex justify-between items-center p-3 bg-white/50 dark:bg-black/20 rounded-md`}>
                        <p className={`font-bold text-lg ${riskColor}`}>{riskText}</p>
                        <p className="font-mono text-xl">{riskScore}<span className="text-xs">/100</span></p>
                    </div>
                    {relatedAlert && (
                         <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 italic">
                            <strong>Alert:</strong> {relatedAlert.description}
                         </p>
                    )}
                </div>

                {/* Detailed Info */}
                <div className="p-4 bg-slate-200 dark:bg-slate-800 rounded-lg divide-y divide-slate-300 dark:divide-slate-700">
                    <DetailRow label="Type" value={<span className="capitalize">{transaction.type}</span>} />
                    <DetailRow label={isSend ? "Recipient" : "Agent"} value={transaction.recipient} />
                    {transaction.note && <DetailRow label="Note" value={transaction.note} />}
                    <DetailRow label="Verification" value={<span className="capitalize">{transaction.verificationMethod}</span>} />
                    <DetailRow label="Transaction ID" value={transaction.id} isMono />
                </div>
            </div>
        </div>
    );
};

export default TransactionDetailsPage;