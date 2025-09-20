import React from 'react';
import { useUser } from '../hooks/useUser';
import { DashboardIcon, SendIcon, SecureTransactionIcon, FaceIcon } from '../../icons/Icons';
import { UserPage } from '../../../types';


interface BottomNavProps {
    currentPage: UserPage;
    setCurrentPage: (page: UserPage) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ currentPage, setCurrentPage }) => {
    const { t } = useUser();

    const navItems = [
        { page: 'dashboard', label: t('nav_home'), icon: DashboardIcon },
        { page: 'send', label: t('nav_send'), icon: SendIcon },
        { page: 'history', label: t('nav_history'), icon: SecureTransactionIcon },
        { page: 'biometrics', label: t('nav_biometrics'), icon: FaceIcon },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 shadow-t-lg z-40">
            <div className="max-w-md mx-auto h-full flex justify-around items-center">
                {navItems.map(item => (
                    <button
                        key={item.page}
                        onClick={() => setCurrentPage(item.page as UserPage)}
                        className={`flex flex-col items-center justify-center w-full h-full transition-colors duration-200 ${
                            currentPage === item.page
                                ? 'text-sky-500 dark:text-sky-400'
                                : 'text-slate-500 dark:text-slate-400 hover:text-sky-500 dark:hover:text-sky-400'
                        }`}
                    >
                        <item.icon className="w-6 h-6 mb-1" />
                        <span className="text-xs font-medium">{item.label}</span>
                    </button>
                ))}
            </div>
        </nav>
    );
};

export default BottomNav;