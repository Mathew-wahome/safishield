import React, { useState, useEffect } from 'react';
import { UserContextProvider } from './context/UserContext';
import { useUser } from './hooks/useUser';
import type { UserPage } from '../../types';

import UserLoginPage from './UserLoginPage';
import UserDashboardPage from './pages/UserDashboardPage';
import SendMoneyPage from './pages/SendMoneyPage';
import WithdrawPage from './pages/WithdrawPage';
import HistoryPage from './pages/HistoryPage';
import BiometricsPage from './pages/BiometricsPage';
import SettingsPage from './pages/SettingsPage';
import ReportScamPage from './pages/ReportScamPage';
import TransactionDetailsPage from './pages/TransactionDetailsPage';

import BottomNav from './components/BottomNav';
import SimulatorPanel from './components/SimulatorPanel';
import Toast from './components/Toast';

const PageContent: React.FC<{
    currentPage: UserPage,
    setCurrentPage: (page: UserPage) => void,
    onSelectTransaction: (txId: string) => void,
    selectedTxId: string | null,
}> = ({ currentPage, setCurrentPage, onSelectTransaction, selectedTxId }) => {
    switch (currentPage) {
        case 'dashboard':
            return <UserDashboardPage setCurrentPage={setCurrentPage} />;
        case 'send':
            return <SendMoneyPage setCurrentPage={setCurrentPage} />;
        case 'withdraw':
            return <WithdrawPage setCurrentPage={setCurrentPage} />;
        case 'history':
            return <HistoryPage setCurrentPage={setCurrentPage} onSelectTransaction={onSelectTransaction} />;
        case 'biometrics':
            return <BiometricsPage setCurrentPage={setCurrentPage} />;
        case 'settings':
            return <SettingsPage setCurrentPage={setCurrentPage} />;
        case 'report-scam':
            return <ReportScamPage setCurrentPage={setCurrentPage} />;
        case 'transaction-details':
            return <TransactionDetailsPage transactionId={selectedTxId!} setCurrentPage={setCurrentPage} />;
        default:
            return <UserDashboardPage setCurrentPage={setCurrentPage} />;
    }
};

const AuthenticatedApp: React.FC = () => {
    const { settings, applyTheme, isInitialized, toast } = useUser();
    const [currentPage, setCurrentPage] = useState<UserPage>('biometrics');
    const [selectedTxId, setSelectedTxId] = useState<string | null>(null);

    useEffect(() => {
        if (isInitialized) {
            applyTheme();
        }
    }, [settings.theme, settings.largeFont, isInitialized, applyTheme]);

    const handleSelectTransaction = (txId: string) => {
        setSelectedTxId(txId);
        setCurrentPage('transaction-details');
    };

    if (!isInitialized) {
        return <div className="h-screen bg-slate-100 dark:bg-slate-900 flex items-center justify-center"><p>Initializing...</p></div>;
    }

    const themeClasses = settings.theme === 'high-contrast' ? 'theme-high-contrast' : '';
    const fontClasses = settings.largeFont ? 'text-lg' : '';

    return (
        <div className={`font-sans antialiased ${themeClasses} ${fontClasses}`}>
            <div className="relative min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 flex flex-col">
                <main className="flex-1 pb-20 p-4 max-w-md mx-auto w-full">
                    <PageContent
                        currentPage={currentPage}
                        setCurrentPage={setCurrentPage}
                        onSelectTransaction={handleSelectTransaction}
                        selectedTxId={selectedTxId}
                    />
                </main>
                <BottomNav currentPage={currentPage} setCurrentPage={setCurrentPage} />
                <SimulatorPanel />
                {toast && <Toast message={toast.message} type={toast.type} />}
            </div>
        </div>
    );
};

const UserApp: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
    return (
        <UserContextProvider onLogout={onLogout}>
            <UserAppContent />
        </UserContextProvider>
    );
};

const UserAppContent: React.FC = () => {
    const { isAuthenticated } = useUser();

    if (!isAuthenticated) {
        return <UserLoginPage />;
    }

    return <AuthenticatedApp />;
}

export default UserApp;