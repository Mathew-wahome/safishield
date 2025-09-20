import React, { useState } from 'react';
import { useUser } from '../hooks/useUser';
// Fix: Import UserPage from the correct source file.
import type { UserPage } from '../../../types';
import PageHeader from '../components/PageHeader';
import { KeyIcon, CloseIcon } from '../../icons/Icons';

const ChangePinModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { profile, updateProfile, showToast, t } = useUser();
    const [oldPin, setOldPin] = useState('');
    const [newPin, setNewPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (oldPin !== profile?.pin) {
            setError('Old PIN is incorrect.');
            return;
        }
        if (newPin.length < 6) {
            setError('New PIN must be 6 digits.');
            return;
        }
        if (newPin !== confirmPin) {
            setError('New PINs do not match.');
            return;
        }
        updateProfile({ pin: newPin });
        showToast('PIN changed successfully!', 'success');
        onClose();
    };
    
    const inputClasses = "mt-1 block w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md shadow-sm text-white placeholder-slate-400 focus:outline-none focus:ring-sky-500";


    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" aria-modal="true">
            <div className="bg-slate-800 rounded-xl shadow-2xl border border-slate-700 p-6 w-full max-w-sm text-left relative">
                 <button onClick={onClose} className="absolute top-2 right-2 p-1 rounded-full hover:bg-slate-700">
                    <CloseIcon className="w-5 h-5 text-slate-400"/>
                </button>
                <h3 className="text-xl font-bold text-slate-50 mb-4">{t('settings_change_pin')}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="password" value={oldPin} onChange={e => setOldPin(e.target.value)} placeholder="Old PIN" maxLength={6} required className={inputClasses} />
                    <input type="password" value={newPin} onChange={e => setNewPin(e.target.value)} placeholder="New PIN" maxLength={6} required className={inputClasses} />
                    <input type="password" value={confirmPin} onChange={e => setConfirmPin(e.target.value)} placeholder="Confirm New PIN" maxLength={6} required className={inputClasses} />
                    {error && <p className="text-sm text-red-400">{error}</p>}
                    <button type="submit" className="w-full py-2.5 bg-sky-500 text-white rounded-lg font-bold hover:bg-sky-600 transition-colors">
                        {t('submit')}
                    </button>
                </form>
            </div>
        </div>
    );
};


interface SettingsPageProps {
    setCurrentPage: (page: UserPage) => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ setCurrentPage }) => {
    const { settings, updateSettings, deleteUserData, t } = useUser();
    const [isPinModalOpen, setIsPinModalOpen] = useState(false);

    const handleSettingChange = (key: keyof typeof settings, value: any) => {
        updateSettings({ [key]: value });
    };

    const handleDelete = () => {
        if (window.confirm(t('settings_delete_data_confirm'))) {
            deleteUserData();
        }
    };

    const selectClasses = "mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm";
    const buttonClasses = "w-full py-3 text-left px-4 bg-slate-200 dark:bg-slate-800 rounded-lg font-medium";

    return (
        <>
            {isPinModalOpen && <ChangePinModal onClose={() => setIsPinModalOpen(false)} />}
            <div>
                <PageHeader title={t('settings_title')} onBack={() => setCurrentPage('dashboard')} />
                <div className="space-y-6">
                    <div>
                        <h3 className="text-lg font-bold mb-2">General</h3>
                        <div className="space-y-4">
                            {/* Language */}
                            <div>
                                <label htmlFor="language" className="block font-medium">{t('settings_language')}</label>
                                <select id="language" value={settings.language} onChange={e => handleSettingChange('language', e.target.value)} className={selectClasses}>
                                    <option value="en">English</option>
                                    <option value="sw">Kiswahili</option>
                                    <option value="fr">Français</option>
                                </select>
                            </div>
                            
                            {/* Theme */}
                            <div>
                                <label htmlFor="theme" className="block font-medium">{t('settings_theme')}</label>
                                <select id="theme" value={settings.theme} onChange={e => handleSettingChange('theme', e.target.value)} className={selectClasses}>
                                    <option value="system">{t('settings_theme_system')}</option>
                                    <option value="light">{t('settings_theme_light')}</option>
                                    <option value="dark">{t('settings_theme_dark')}</option>
                                    <option value="high-contrast">{t('settings_theme_high_contrast')}</option>
                                </select>
                            </div>

                            {/* Accessibility */}
                            <div className="flex items-center justify-between p-3 bg-slate-200 dark:bg-slate-800 rounded-lg">
                                <label htmlFor="largeFont" className="font-medium">{t('settings_large_font')}</label>
                                <input type="checkbox" id="largeFont" checked={settings.largeFont} onChange={e => handleSettingChange('largeFont', e.target.checked)} className="h-6 w-6 rounded" />
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-bold mb-2">Security & Privacy</h3>
                        <div className="space-y-4">
                             {/* Biometrics Consent */}
                            <div className="flex items-center justify-between p-3 bg-slate-200 dark:bg-slate-800 rounded-lg">
                                <label htmlFor="biometricsConsent" className="font-medium">{t('settings_biometrics_consent')}</label>
                                <input type="checkbox" id="biometricsConsent" checked={!!settings.biometricsConsent} onChange={e => handleSettingChange('biometricsConsent', e.target.checked)} className="h-6 w-6 rounded" />
                            </div>
                             {/* Manage Biometrics */}
                             <button onClick={() => setCurrentPage('biometrics')} className={buttonClasses}>{t('settings_manage_biometrics')}</button>
                             {/* Change PIN */}
                             <button onClick={() => setIsPinModalOpen(true)} className={buttonClasses}>{t('settings_change_pin')}</button>
                              {/* Liveness Strictness */}
                            <div>
                                <label htmlFor="liveness" className="block font-medium">Liveness Strictness</label>
                                <select id="liveness" value={settings.livenessStrictness} onChange={e => handleSettingChange('livenessStrictness', e.target.value)} className={selectClasses}>
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                </select>
                            </div>
                            {/* Delete Data */}
                            <button onClick={handleDelete} className="w-full py-3 bg-red-600 text-white rounded-lg font-bold">
                                {t('settings_delete_data')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default SettingsPage;