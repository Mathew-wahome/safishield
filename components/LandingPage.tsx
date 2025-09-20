import React, { useState } from 'react';
import { SafiShieldLogo, AgentIcon, FaceIcon, CloseIcon } from './icons/Icons';
import { useTranslation } from './user/hooks/useTranslation';
import type { Language } from './user/services/localization';


interface LandingPageProps {
    onSelectRole: (role: 'analyst' | 'user') => void;
}

const RoleDetailsModal: React.FC<{
    onClose: () => void;
    onSubmit: (name: string, phone: string) => void;
}> = ({ onClose, onSubmit }) => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(name, phone);
    };

    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" aria-modal="true">
            <div className="bg-slate-800 rounded-xl shadow-2xl border border-slate-700 p-6 w-full max-w-sm text-left relative">
                <button onClick={onClose} className="absolute top-2 right-2 p-1 rounded-full hover:bg-slate-700">
                    <CloseIcon className="w-5 h-5 text-slate-400"/>
                </button>
                <h3 className="text-xl font-bold text-slate-50 mb-1">Analyst Details</h3>
                <p className="text-slate-400 text-sm mb-4">Let's personalize your workspace.</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="analyst-name" className="block text-sm font-medium text-slate-300">Full Name</label>
                        <input
                            id="analyst-name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            placeholder="e.g., Jane Doe"
                            className="mt-1 block w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-sky-500"
                        />
                    </div>
                     <div>
                        <label htmlFor="analyst-phone" className="block text-sm font-medium text-slate-300">Phone Number</label>
                        <input
                            id="analyst-phone"
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required
                            placeholder="+254 712 345 678"
                            className="mt-1 block w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-sky-500"
                        />
                    </div>
                    <button type="submit" className="w-full py-2.5 bg-sky-500 text-white rounded-lg font-bold hover:bg-sky-600 transition-colors">
                        Continue to Login
                    </button>
                </form>
            </div>
        </div>
    );
};


const LandingPage: React.FC<LandingPageProps> = ({ onSelectRole }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [step, setStep] = useState<'language' | 'role'>('language');
    const { t, setLanguage } = useTranslation();

    const handleAnalystSelect = () => {
        setIsModalOpen(true);
    };

    const handleModalSubmit = (name: string, phone: string) => {
        sessionStorage.setItem('analyst_name', name);
        sessionStorage.setItem('analyst_phone', phone);
        setIsModalOpen(false);
        onSelectRole('analyst');
    };

    const handleLanguageSelect = (lang: Language) => {
        setLanguage(lang);
        sessionStorage.setItem('user_language', lang);
        setStep('role');
    };

    const bgStyle = {
        backgroundImage: "radial-gradient(ellipse at bottom, #0f172a 0%, #1e293b 100%)",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
    };
    
    const LanguageSelector = () => (
        <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-slate-100">Select Your Language</h2>
             <div className="grid grid-cols-1 gap-4">
                 <button
                    onClick={() => handleLanguageSelect('en')}
                    className="p-4 flex items-center justify-center bg-slate-800/50 border-2 border-slate-600 rounded-lg transition-all duration-300 hover:bg-sky-500/20 hover:border-sky-400"
                >
                    <span className="text-xl font-bold">🇬🇧 English</span>
                </button>
                 <button
                    onClick={() => handleLanguageSelect('sw')}
                    className="p-4 flex items-center justify-center bg-slate-800/50 border-2 border-slate-600 rounded-lg transition-all duration-300 hover:bg-emerald-500/20 hover:border-emerald-400"
                >
                    <span className="text-xl font-bold">🇰🇪 Kiswahili</span>
                </button>
                 <button
                    onClick={() => handleLanguageSelect('fr')}
                    className="p-4 flex items-center justify-center bg-slate-800/50 border-2 border-slate-600 rounded-lg transition-all duration-300 hover:bg-red-500/20 hover:border-red-400"
                >
                    <span className="text-xl font-bold">🇫🇷 Français</span>
                </button>
            </div>
        </div>
    );

    const RoleSelector = () => (
         <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-slate-100">{t('landing_choose_role')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <button
                    onClick={() => onSelectRole('user')}
                    className="p-8 flex flex-col items-center justify-center bg-slate-800/50 border-2 border-slate-600 rounded-lg transition-all duration-300 hover:bg-sky-500/20 hover:border-sky-400"
                >
                    <FaceIcon className="w-12 h-12 mb-4 text-sky-300" />
                    <h3 className="text-xl font-bold">{t('landing_user_title')}</h3>
                    <p className="text-sm text-slate-400 mt-1">{t('landing_user_desc')}</p>
                </button>
                <button
                    onClick={handleAnalystSelect}
                    className="p-8 flex flex-col items-center justify-center bg-slate-800/50 border-2 border-slate-600 rounded-lg transition-all duration-300 hover:bg-emerald-500/20 hover:border-emerald-400"
                >
                    <AgentIcon className="w-12 h-12 mb-4 text-emerald-300" />
                    <h3 className="text-xl font-bold">{t('landing_analyst_title')}</h3>
                    <p className="text-sm text-slate-400 mt-1">{t('landing_analyst_desc')}</p>
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen flex items-center justify-center p-4 antialiased text-white" style={bgStyle}>
             {isModalOpen && <RoleDetailsModal onClose={() => setIsModalOpen(false)} onSubmit={handleModalSubmit} />}
            <div className="w-full max-w-lg p-8 space-y-8 bg-slate-900/50 backdrop-blur-sm rounded-2xl shadow-2xl border border-slate-100/20 text-center">
                <div className="flex flex-col items-center">
                    <SafiShieldLogo className="h-16 w-16 text-slate-100" />
                    <h1 className="mt-4 text-4xl font-bold font-heading text-slate-50">SafiShield</h1>
                    <p className="text-slate-300 text-lg">Pan-African AI Fraud Prevention</p>
                </div>

                {step === 'language' ? <LanguageSelector /> : <RoleSelector />}
            </div>
        </div>
    );
};

export default LandingPage;