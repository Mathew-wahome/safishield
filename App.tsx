import React, { useState, useEffect, useCallback } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './services/supabaseClient';
import { Page } from './types';

import Sidebar from './components/Sidebar';
import Dashboard from './components/pages/Dashboard';
import AgentMonitor from './components/pages/AgentMonitor';
import ScamMap from './components/pages/ScamMap';
import EducationChatbot from './components/pages/EducationChatbot';
import AuthPage from './components/pages/AuthPage';
import ResetPasswordPage from './components/pages/ResetPasswordPage';
import LandingPage from './components/LandingPage';
import UserApp from './components/user/UserApp';

const getPageBackgroundStyle = (page: Page): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        transition: 'background-image 0.5s ease-in-out',
    };

    switch (page) {
        case Page.Dashboard:
            return { ...baseStyle, backgroundImage: "radial-gradient(circle at top left, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.95)), linear-gradient(160deg, #0284c7 0%, #334155 100%)" };
        case Page.AgentMonitor:
            return { ...baseStyle, backgroundImage: "radial-gradient(circle at top, rgba(15, 23, 42, 0.9), rgba(30, 41, 59, 0.98)), linear-gradient(120deg, #1e3a8a 0%, #1e293b 100%)" };
        case Page.Education:
             return { ...baseStyle, backgroundImage: "radial-gradient(circle at top right, rgba(51, 65, 85, 0.9), rgba(15, 23, 42, 0.95)), linear-gradient(200deg, #0d9488 0%, #1e293b 100%)" };
        default:
            return { ...baseStyle, background: "#0f172a" };
    }
};

// The original Analyst application logic is now encapsulated here
const AnalystApp: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [currentPage, setCurrentPage] = useState<Page>(Page.Dashboard);
    const [isResettingPassword, setIsResettingPassword] = useState(false);
    const [startNewReportFlow, setStartNewReportFlow] = useState(false);

    useEffect(() => {
        if (window.location.hash.includes('type=recovery')) {
            setIsResettingPassword(true);
        }

        const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            if (_event === 'PASSWORD_RECOVERY') {
                setIsResettingPassword(true);
            } else if (_event !== 'USER_UPDATED') {
                setIsResettingPassword(false);
            }
        });
        
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
        });

        return () => authListener.subscription?.unsubscribe();
    }, []);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        onLogout();
    };

    const handleCreateReport = () => {
        setStartNewReportFlow(true);
        setCurrentPage(Page.ScamMap);
    };

    const userName = session?.user?.user_metadata?.full_name;
    const userEmail = session?.user?.email;
    const jobTitle = session?.user?.user_metadata?.job_title;

    const renderPage = () => {
        switch (currentPage) {
            case Page.Dashboard:
                return <Dashboard 
                            userName={userName} 
                            jobTitle={jobTitle} 
                            setCurrentPage={setCurrentPage}
                            onCreateReport={handleCreateReport} 
                        />;
            case Page.AgentMonitor:
                return <AgentMonitor />;
            case Page.ScamMap:
                return <ScamMap 
                            startNewReport={startNewReportFlow}
                            onNewReportFlowComplete={() => setStartNewReportFlow(false)}
                        />;
            case Page.Education:
                return <EducationChatbot />;
            default:
                return <Dashboard 
                            userName={userName} 
                            jobTitle={jobTitle} 
                            setCurrentPage={setCurrentPage}
                            onCreateReport={handleCreateReport}
                        />;
        }
    };

    if (isResettingPassword) {
        return <ResetPasswordPage onResetComplete={() => setIsResettingPassword(false)} />;
    }

    if (!session) {
        return <AuthPage />;
    }

    return (
        <div className="flex h-screen bg-slate-50 dark:bg-slate-900 font-sans text-slate-700 dark:text-slate-300">
            <Sidebar 
                currentPage={currentPage} 
                setCurrentPage={setCurrentPage} 
                userName={userName}
                userEmail={userEmail}
                jobTitle={jobTitle}
                onSignOut={handleSignOut} 
            />
            <main 
                className="flex-1 p-8 overflow-y-auto"
                style={getPageBackgroundStyle(currentPage)}
            >
                {renderPage()}
            </main>
        </div>
    );
};


const App: React.FC = () => {
    const [appMode, setAppMode] = useState<'analyst' | 'user' | null>(() => {
        // Persist role selection to provide a smoother return experience
        return sessionStorage.getItem('appMode') as 'analyst' | 'user' | null;
    });

    const handleSelectRole = useCallback((role: 'analyst' | 'user') => {
        sessionStorage.setItem('appMode', role);
        setAppMode(role);
    }, []);
    
    const handleLogout = useCallback(() => {
        sessionStorage.removeItem('appMode');
        setAppMode(null);
    }, []);

    if (appMode === 'user') {
        return <UserApp onLogout={handleLogout} />;
    }

    if (appMode === 'analyst') {
        return <AnalystApp onLogout={handleLogout} />;
    }
    
    return <LandingPage onSelectRole={handleSelectRole} />;
};

export default App;