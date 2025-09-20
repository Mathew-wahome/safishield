import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import { SafiShieldLogo, WarningIcon, InfoIcon } from '../icons/Icons';

type AuthView = 'signIn' | 'signUp' | 'forgotPassword';

const AuthPage: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [jobTitle, setJobTitle] = useState('');
    const [view, setView] = useState<AuthView>('signIn');
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    useEffect(() => {
        const prefilledName = sessionStorage.getItem('analyst_name');
        const prefilledPhone = sessionStorage.getItem('analyst_phone');

        if (prefilledName) {
            setFullName(prefilledName);
            sessionStorage.removeItem('analyst_name');
        }
        if (prefilledPhone) {
            setPhone(prefilledPhone);
            sessionStorage.removeItem('analyst_phone');
        }
    }, []);

    const handleAuth = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            if (view === 'signIn') {
                // Fix: Update Supabase v1 `signIn` to v2 `signInWithPassword`.
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
            } else if (view === 'signUp') {
                // Fix: Update Supabase v1 `signUp` to v2 syntax, using a single object argument.
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: fullName,
                            phone: phone,
                            job_title: jobTitle,
                        }
                    }
                });

                if (error) throw error;
                
                // If signUp is successful, Supabase returns a user but no session if email confirmation is required.
                if (data.user && !data.session) {
                     setMessage("Sign up successful! Please check your email to confirm your account before logging in.");
                }
                // NOTE: If email confirmation is disabled, a session is returned and the onAuthStateChange 
                // listener in App.tsx will handle automatic login.

            } else if (view === 'forgotPassword') {
                // Fix: Update Supabase v1 `api.resetPasswordForEmail` to v2 `resetPasswordForEmail`.
                const { error } = await supabase.auth.resetPasswordForEmail(email, {
                    redirectTo: window.location.origin,
                });
                if (error) throw error;
                setMessage('Check your email for the password reset link!');
            }
        } catch (error: any) {
            setError(error.error_description || error.message);
        } finally {
            setLoading(false);
        }
    };

    const getTitle = () => {
        switch(view) {
            case 'signIn': return 'Welcome Back, Analyst';
            case 'signUp': return 'Create Analyst Account';
            case 'forgotPassword': return 'Reset Your Password';
        }
    }

    const bgStyle = {
        backgroundImage: "radial-gradient(ellipse at bottom, #0f172a 0%, #1e293b 100%)",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
    };
    
    const inputClasses = "block w-full px-4 py-3 text-slate-50 placeholder-slate-400 bg-slate-800/50 border border-slate-600 rounded-lg shadow-sm appearance-none focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent sm:text-sm";


    return (
        <div className="min-h-screen flex items-center justify-center p-4 antialiased" style={bgStyle}>
            <div className="w-full max-w-md p-8 space-y-6 bg-slate-900/50 backdrop-blur-sm rounded-2xl shadow-2xl border border-slate-100/20">
                <div className="flex flex-col items-center">
                    <SafiShieldLogo className="h-12 w-12 text-slate-100" />
                    <h1 className="mt-4 text-3xl font-bold font-heading text-slate-50">SafiShield</h1>
                    <p className="text-slate-300">{getTitle()}</p>
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

                <form className="mt-8 space-y-6" onSubmit={handleAuth}>
                    <div className="space-y-4">
                        {view === 'signUp' && (
                            <>
                                <div>
                                    <label htmlFor="full-name" className="block text-sm font-medium text-slate-300 mb-1">
                                        Full Name
                                    </label>
                                    <input
                                        id="full-name" name="full-name" type="text" autoComplete="name" required
                                        className={inputClasses}
                                        placeholder="e.g., Jane Doe"
                                        value={fullName} onChange={(e) => setFullName(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="job-title" className="block text-sm font-medium text-slate-300 mb-1">
                                        Job Title
                                    </label>
                                    <input
                                        id="job-title" name="job-title" type="text" autoComplete="organization-title" required
                                        className={inputClasses}
                                        placeholder="e.g., Senior Fraud Analyst"
                                        value={jobTitle} onChange={(e) => setJobTitle(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="phone" className="block text-sm font-medium text-slate-300 mb-1">
                                        Phone Number
                                    </label>
                                    <input
                                        id="phone" name="phone" type="tel" autoComplete="tel" required
                                        className={inputClasses}
                                        placeholder="e.g., +254712345678"
                                        value={phone} onChange={(e) => setPhone(e.target.value)}
                                    />
                                </div>
                            </>
                        )}
                        <div>
                            <label htmlFor="email-address" className="block text-sm font-medium text-slate-300 mb-1">
                                Email address
                            </label>
                            <input
                                id="email-address" name="email" type="email" autoComplete="email" required
                                className={inputClasses}
                                placeholder="analyst@example.com"
                                value={email} onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        {view !== 'forgotPassword' && (
                            <div>
                                <label htmlFor="password"className="block text-sm font-medium text-slate-300 mb-1">
                                    Password
                                </label>
                                <input
                                    id="password" name="password" type="password" autoComplete="current-password" required
                                    className={inputClasses}
                                    placeholder="••••••••"
                                    value={password} onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        )}
                    </div>

                    {view === 'signIn' && (
                        <div className="text-sm text-right">
                           <button type="button" onClick={() => setView('forgotPassword')} className="font-medium text-sky-400 hover:text-sky-300">
                                Forgot your password?
                            </button>
                        </div>
                    )}

                    <div>
                        <button type="submit" disabled={loading}
                            className="w-full flex justify-center px-4 py-3 text-sm font-medium text-white border border-transparent rounded-lg group bg-sky-500 hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-60 transition-all duration-300"
                        >
                            {loading ? 'Processing...' : 
                                view === 'signIn' ? 'Sign In' :
                                view === 'signUp' ? 'Sign Up' : 'Send Reset Link'}
                        </button>
                    </div>
                </form>

                <div className="text-sm text-center">
                    <button onClick={() => {
                        setView(view === 'signIn' ? 'signUp' : 'signIn');
                        setError(null);
                        setMessage(null);
                    }} className="font-medium text-sky-400 hover:text-sky-300">
                        {view === 'forgotPassword' ? "Back to Sign In" :
                         view === 'signIn' ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;