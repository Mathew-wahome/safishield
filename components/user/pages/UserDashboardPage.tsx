import React from 'react';
import { useUser } from '../hooks/useUser';
import { SettingsPageIcon, SendIcon, FaceIcon, SecureTransactionIcon, WarningIcon, CheckCircleIcon, WithdrawIcon, ReportScamIcon } from '../../icons/Icons';
// Fix: Import UserPage from the correct source file.
import type { UserPage } from '../../../types';

interface UserDashboardPageProps {
    setCurrentPage: (page: UserPage) => void;
}

const BalanceCard: React.FC = () => {
    const { profile, t } = useUser();
    return (
        <div className="p-6 rounded-2xl bg-gradient-to-br from-sky-500 to-sky-700 text-white shadow-lg">
            <p className="text-sm opacity-80">{t('dashboard_balance')}</p>
            <p className="text-4xl font-bold mt-1">KES {profile?.balance.toLocaleString()}</p>
        </div>
    );
};

const QuickAction: React.FC<{ label: string; icon: React.FC<any>; onClick: () => void; }> = ({ label, icon: Icon, onClick }) => (
    <button onClick={onClick} className="flex flex-col items-center justify-center text-center p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
        <div className="w-14 h-14 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center mb-2">
            <Icon className="w-7 h-7 text-slate-700 dark:text-slate-200" />
        </div>
        <span className="text-xs font-semibold">{label}</span>
    </button>
);

const SecurityStatus: React.FC = () => {
    const { alerts, t } = useUser();
    const highRiskAlerts = alerts.filter(a => a.riskScore >= 85).length;
    const mediumRiskAlerts = alerts.filter(a => a.riskScore >= 50 && a.riskScore < 85).length;

    let status: 'secure' | 'warning' | 'risk' = 'secure';
    let Icon = CheckCircleIcon;
    let colorClass = 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30';
    let label = t('dashboard_status_secure');

    if (highRiskAlerts > 0) {
        status = 'risk';
        Icon = WarningIcon;
        colorClass = 'bg-red-500/10 text-red-300 border-red-500/30';
        label = t('dashboard_status_risk');
    } else if (mediumRiskAlerts > 0) {
        status = 'warning';
        Icon = WarningIcon;
        colorClass = 'bg-amber-500/10 text-amber-300 border-amber-500/30';
        label = t('dashboard_status_warning');
    }

    return (
        <div>
            <h2 className="text-lg font-bold mb-2">{t('dashboard_security_status')}</h2>
            <div className={`p-4 rounded-lg border flex items-center gap-3 ${colorClass}`}>
                <Icon className="w-6 h-6 flex-shrink-0" />
                <div className="flex-1">
                    <p className="font-bold">{label}</p>
                    <p className="text-xs opacity-80">
                        {status === 'secure' ? 'No high-risk activity detected.' : `${highRiskAlerts + mediumRiskAlerts} recent alerts.`}
                    </p>
                </div>
            </div>
        </div>
    );
};


const UserDashboardPage: React.FC<UserDashboardPageProps> = ({ setCurrentPage }) => {
    const { profile, t, logout } = useUser();

    const quickActions = [
        { label: t('action_send'), icon: SendIcon, page: 'send' as UserPage },
        { label: t('action_withdraw'), icon: WithdrawIcon, page: 'withdraw' as UserPage },
        { label: t('action_history'), icon: SecureTransactionIcon, page: 'history' as UserPage },
        { label: t('action_biometrics'), icon: FaceIcon, page: 'biometrics' as UserPage },
        { label: t('action_report_scam'), icon: ReportScamIcon, page: 'report-scam' as UserPage },
        { label: t('action_settings'), icon: SettingsPageIcon, page: 'settings' as UserPage },
    ];
    
    return (
        <div className="space-y-6">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">{t('dashboard_greeting')}, {profile?.firstName}!</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Have a secure day.</p>
                </div>
                <button onClick={logout} className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400">Logout</button>
            </header>
            
            <BalanceCard />

            <div className="grid grid-cols-3 gap-2">
                {quickActions.map(action => (
                    <QuickAction
                        key={action.page}
                        label={action.label}
                        icon={action.icon}
                        onClick={() => setCurrentPage(action.page)}
                    />
                ))}
            </div>

            <SecurityStatus />
        </div>
    );
};

export default UserDashboardPage;