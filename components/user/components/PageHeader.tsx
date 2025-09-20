import React from 'react';
// Fix: Import UserPage from the correct source file.
import type { UserPage } from '../../../types';

interface PageHeaderProps {
    title: string;
    onBack: () => void;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, onBack }) => {
    return (
        <header className="relative flex items-center justify-center mb-4 h-12">
            <button onClick={onBack} className="absolute left-0 p-2 text-slate-500 dark:text-slate-400 hover:text-sky-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
            </button>
            <h1 className="text-xl font-bold">{title}</h1>
        </header>
    );
};

export default PageHeader;