import React, { useState, useMemo } from 'react';
import { useUser } from '../hooks/useUser';
// Fix: Import UserPage from the correct source file.
import type { UserPage } from '../../../types';
import PageHeader from '../components/PageHeader';
import { SendIcon, WithdrawIcon } from '../../icons/Icons';
import { UserTransaction } from '../../../types';

interface HistoryPageProps {
    setCurrentPage: (page: UserPage) => void;
    onSelectTransaction: (txId: string) => void;
}

const TransactionItem: React.FC<{ tx: UserTransaction, onClick: () => void }> = ({ tx, onClick }) => {
    const isSend = tx.type === 'send';
    return (
        <button onClick={onClick} className={`w-full flex items-center gap-4 p-3 rounded-lg text-left transition-colors ${tx.flagged ? 'bg-amber-500/10 hover:bg-amber-500/20' : 'bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isSend ? 'bg-sky-500/20' : 'bg-emerald-500/20'}`}>
                {isSend ? <SendIcon className="w-5 h-5 text-sky-500" /> : <WithdrawIcon className="w-5 h-5 text-emerald-500" />}
            </div>
            <div className="flex-1">
                <p className="font-bold capitalize">{isSend ? 'Sent to' : 'Withdrew at'} {tx.recipient}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{new Date(tx.timestamp).toLocaleString()}</p>
            </div>
            <p className={`font-bold text-lg ${isSend ? 'text-red-500' : 'text-emerald-500'}`}>
                {isSend ? '-' : '+'} KES {tx.amount.toLocaleString()}
            </p>
        </button>
    );
}

const HistoryPage: React.FC<HistoryPageProps> = ({ setCurrentPage, onSelectTransaction }) => {
    const { transactions, t } = useUser();
    const [filter, setFilter] = useState<'all' | 'flagged'>('all');

    const filteredTransactions = useMemo(() => {
        if (filter === 'flagged') {
            return transactions.filter(tx => tx.flagged);
        }
        return transactions;
    }, [transactions, filter]);

    return (
        <div>
            <PageHeader title={t('history_title')} onBack={() => setCurrentPage('dashboard')} />

            <div className="flex justify-center mb-4 bg-slate-200 dark:bg-slate-800 p-1 rounded-lg">
                <button
                    onClick={() => setFilter('all')}
                    className={`flex-1 py-2 text-sm font-semibold rounded-md ${filter === 'all' ? 'bg-white dark:bg-slate-600 shadow' : 'text-slate-600 dark:text-slate-300'}`}
                >
                    All
                </button>
                <button
                    onClick={() => setFilter('flagged')}
                    className={`flex-1 py-2 text-sm font-semibold rounded-md ${filter === 'flagged' ? 'bg-white dark:bg-slate-600 shadow' : 'text-slate-600 dark:text-slate-300'}`}
                >
                    Flagged
                </button>
            </div>

            {filteredTransactions.length > 0 ? (
                <div className="space-y-3">
                    {filteredTransactions.map(tx => <TransactionItem key={tx.id} tx={tx} onClick={() => onSelectTransaction(tx.id)} />)}
                </div>
            ) : (
                <div className="text-center py-16">
                    <p className="text-slate-500 dark:text-slate-400">{t('history_no_transactions')}</p>
                </div>
            )}
        </div>
    );
};

export default HistoryPage;