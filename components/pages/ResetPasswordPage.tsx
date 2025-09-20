import React, { useState } from 'react';
import { supabase } from '../../services/supabaseClient';
import { SafiShieldLogo, InfoIcon, WarningIcon } from '../icons/Icons';

interface ResetPasswordPageProps {
    onResetComplete: () => void;
}

const ResetPasswordPage: React.FC<ResetPasswordPageProps> = ({ onResetComplete }) => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    const handlePasswordReset = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            // Fix: Update Supabase v1 `update` to v2 `updateUser` for changing user properties.
            const { error } = await supabase.auth.updateUser({ password });
            if (error) throw error;
            setMessage("Your password has been reset successfully! Redirecting to sign in...");
            setTimeout(() => {
                window.location.hash = '';
                onResetComplete();
                supabase.auth.signOut();
            }, 3000);
        } catch (error: any) {
            setError(error.error_description || error.message);
        } finally {
            setLoading(false);
        }
    };

    const bgStyle = {
        backgroundImage: "radial-gradient(ellipse at bottom, #0f172a 0%, #1e293b 100%)",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 antialiased" style={bgStyle}>
            <div className="w-full max-w-md p-8 space-y-6 bg-slate-900/50 backdrop-blur-sm rounded-2xl shadow-2xl border border-slate-100/20">
                <div className="flex flex-col items-center">
                    <SafiShieldLogo className="h-12 w-12 text-slate-100" />
                    <h1 className="mt-4 text-3xl font-bold font-heading text-slate-50">Reset Your Password</h1>
                    <p className="text-slate-300">Enter a new, secure password for your account.</p>
                </div>

                {error && (
                    <div className="flex items-start p-4 space-x-3 text-sm text-red-300 bg-red-500/20 rounded-lg border border-red-500/30">
                        <WarningIcon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                        <p>{error}</p>
                    </div>
                )}
                {message && (
                     <div className="flex items-start p-4 space-x-3 text-sm text-emerald-300 bg-emerald-500/20 rounded-lg border border-emerald-500/30">
                        <InfoIcon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                        <p>{message}</p>
                    </div>
                )}


                <form className="mt-8 space-y-6" onSubmit={handlePasswordReset}>
                     <div className="space-y-4">
                        <div>
                            <label htmlFor="password"className="block text-sm font-medium text-slate-300 mb-1">
                                New Password
                            </label>
                            <input
                                id="password" name="password" type="password" required
                                className="block w-full px-4 py-3 text-slate-50 placeholder-slate-400 bg-slate-800/50 border border-slate-600 rounded-lg shadow-sm appearance-none focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent sm:text-sm"
                                placeholder="••••••••"
                                value={password} onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <div>
                             <label htmlFor="confirm-password"className="block text-sm font-medium text-slate-300 mb-1">
                                Confirm New Password
                            </label>
                            <input
                                id="confirm-password" name="confirm-password" type="password" required
                                className="block w-full px-4 py-3 text-slate-50 placeholder-slate-400 bg-slate-800/50 border border-slate-600 rounded-lg shadow-sm appearance-none focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent sm:text-sm"
                                placeholder="••••••••"
                                value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading || !!message}
                            className="w-full flex justify-center px-4 py-3 text-sm font-medium text-white border border-transparent rounded-lg group bg-sky-500 hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-60 transition-all duration-300"
                        >
                            {loading ? 'Resetting...' : 'Set New Password'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ResetPasswordPage;
