import React, { useState } from 'react';
import { useUser } from './hooks/useUser';
import { SEED_USER_PROFILE } from './constants';
import { SafiShieldLogo, InfoIcon, KeyIcon } from '../icons/Icons';

const OnboardingModal: React.FC<{ onConsent: (consented: boolean) => void }> = ({ onConsent }) => {
    const { t } = useUser();
    return (
        <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-20 p-4">
            <div className="w-full max-w-md p-6 bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 text-center">
                <InfoIcon className="w-12 h-12 text-sky-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold font-heading text-slate-50">{t('onboarding_title')}</h2>
                <p className="mt-2 text-slate-300">{t('onboarding_consent_text')}</p>
                <div className="mt-6 flex flex-col sm:flex-row gap-4">
                    <button onClick={() => onConsent(true)} className="flex-1 py-3 px-4 bg-sky-500 text-white rounded-lg font-bold hover:bg-sky-600 transition-colors">
                        {t('onboarding_accept')}
                    </button>
                    <button onClick={() => onConsent(false)} className="flex-1 py-3 px-4 bg-slate-600 text-white rounded-lg font-bold hover:bg-slate-500 transition-colors">
                        {t('onboarding_decline')}
                    </button>
                </div>
            </div>
        </div>
    );
};


const UserLoginPage: React.FC = () => {
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login, settings, updateSettings, t } = useUser();
    
    // Check if it's the very first run to show the onboarding modal
    const [needsOnboarding, setNeedsOnboarding] = useState(settings.biometricsConsent === undefined);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        const success = await login(pin);
        if (!success) {
            setError(t('login_incorrect_pin'));
            setPin('');
        }
        setIsLoading(false);
    };

    const handlePinChange = (value: string) => {
        // Allow only numbers and limit to 6 digits
        const numericValue = value.replace(/\D/g, '');
        if (numericValue.length <= 6) {
            setPin(numericValue);
        }
    };

    const handleConsent = (consented: boolean) => {
        updateSettings({ biometricsConsent: consented });
        setNeedsOnboarding(false);
    }
    
    const bgStyle = {
        backgroundImage: "radial-gradient(ellipse at bottom, #0f172a 0%, #1e293b 100%)",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 antialiased text-white" style={bgStyle}>
            {needsOnboarding && <OnboardingModal onConsent={handleConsent} />}
            <div className="w-full max-w-sm p-8 space-y-6 bg-slate-900/50 backdrop-blur-sm rounded-2xl shadow-2xl border border-slate-100/20">
                <div className="flex flex-col items-center">
                    <SafiShieldLogo className="h-12 w-12 text-slate-100" />
                    <h1 className="mt-4 text-3xl font-bold font-heading text-slate-50">{t('login_title')}</h1>
                    <p className="text-slate-300">{t('login_subtitle')}</p>
                </div>
                
                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label htmlFor="phone" className="sr-only">{t('login_phone_placeholder')}</label>
                        <input
                            id="phone"
                            type="tel"
                            readOnly
                            value={SEED_USER_PROFILE.phone}
                            className="block w-full px-4 py-3 text-slate-300 bg-slate-800/50 border border-slate-600 rounded-lg text-center"
                        />
                    </div>
                    <div>
                        <label htmlFor="pin" className="sr-only">{t('login_pin_placeholder')}</label>
                         <div className="flex items-center justify-center">
                            <KeyIcon className="w-6 h-6 text-slate-400 mr-4" />
                            <input
                                id="pin"
                                type="password"
                                value={pin}
                                onChange={(e) => handlePinChange(e.target.value)}
                                placeholder="● ● ● ● ● ●"
                                maxLength={6}
                                required
                                autoFocus
                                className="w-full tracking-[1.5em] text-center text-2xl font-mono block px-4 py-3 text-slate-50 placeholder-slate-500 bg-slate-800/50 border border-slate-600 rounded-lg shadow-sm appearance-none focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {error && <p className="text-center text-red-400 text-sm">{error}</p>}

                    <button
                        type="submit"
                        disabled={isLoading || pin.length < 6}
                        className="w-full flex justify-center px-4 py-3 text-sm font-medium text-white border border-transparent rounded-lg group bg-sky-500 hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-60 transition-all duration-300"
                    >
                        {isLoading ? 'Verifying...' : t('login_button')}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default UserLoginPage;