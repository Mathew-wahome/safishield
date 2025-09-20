import React, { useState, useEffect } from 'react';
import { Page } from '../types';
import { DashboardIcon, AgentIcon, MapIcon, ChatIcon, SafiShieldLogo, SignOutIcon, SunIcon, MoonIcon } from './icons/Icons';

interface SidebarProps {
    currentPage: Page;
    setCurrentPage: (page: Page) => void;
    userName?: string;
    userEmail?: string;
    jobTitle?: string;
    onSignOut: () => void;
}

const NAV_ITEMS = [
    { name: Page.Dashboard, icon: DashboardIcon },
    { name: Page.AgentMonitor, icon: AgentIcon },
    { name: 'Scam Map', icon: MapIcon }, // Adjusted to match Page enum better in spirit
    { name: Page.Education, icon: ChatIcon },
];

const Sidebar: React.FC<SidebarProps> = ({ currentPage, setCurrentPage, userName, userEmail, jobTitle, onSignOut }) => {
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        const isDark = document.documentElement.classList.contains('dark');
        setIsDarkMode(isDark);
    }, []);

    const toggleDarkMode = () => {
        if (isDarkMode) {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        } else {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        }
        setIsDarkMode(!isDarkMode);
    };

    const getInitials = (name?: string) => {
        if (!name) {
            return userEmail?.charAt(0).toUpperCase() || '?';
        }
        const names = name.trim().split(' ');
        if (names.length > 1 && names[names.length - 1]) {
            return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    return (
        <nav className="w-20 md:w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col">
            <div className="flex items-center justify-center md:justify-start p-4 h-20 border-b border-slate-200 dark:border-slate-700">
                <SafiShieldLogo className="h-10 w-10 text-slate-800 dark:text-slate-200" />
                <span className="hidden md:block ml-3 text-2xl font-heading font-bold text-slate-800 dark:text-slate-200">SafiShield</span>
            </div>
            <ul className="flex-1 py-4">
                {NAV_ITEMS.map(({ name, icon: Icon }) => (
                    <li key={name} className="px-4">
                        <button
                            onClick={() => setCurrentPage(name as Page)}
                            className={`flex items-center w-full h-12 my-1 px-4 rounded-lg transition-colors duration-200 ${
                                currentPage === name
                                    ? 'bg-sky-100/50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-300 font-bold'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                            }`}
                        >
                            <Icon className="h-6 w-6" />
                            <span className="hidden md:block ml-4">{name}</span>
                        </button>
                    </li>
                ))}
            </ul>

            <div className="p-4 border-t border-slate-200 dark:border-slate-700 space-y-4">
                 {/* Theme Toggle */}
                 <div>
                    <button
                        onClick={toggleDarkMode}
                        title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                        className="w-full flex items-center justify-center md:justify-start p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        aria-live="polite"
                    >
                        {isDarkMode ? <SunIcon className="w-6 h-6" /> : <MoonIcon className="w-6 h-6" />}
                        <span className="hidden md:block ml-4 text-sm font-medium">
                            {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                        </span>
                    </button>
                </div>

                {/* User Profile */}
                <div className="flex items-center">
                     <div className="w-10 h-10 rounded-full bg-sky-100 dark:bg-sky-900/50 flex items-center justify-center text-sky-600 dark:text-sky-300 font-bold">
                        {getInitials(userName)}
                    </div>
                    <div className="hidden md:block ml-3 flex-1 overflow-hidden">
                        <p className="font-semibold text-sm truncate text-slate-700 dark:text-slate-200">{userName || userEmail}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{jobTitle || 'Fraud Analyst'}</p>
                    </div>
                     <button onClick={onSignOut} title="Sign Out" className="hidden md:block ml-2 p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700">
                        <SignOutIcon className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Sidebar;