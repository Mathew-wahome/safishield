import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import * as localData from '../services/userLocalData';
import { useTranslation } from '../hooks/useTranslation';
import type { Language } from '../services/localization';
import { UserProfile, UserSettings, UserTransaction, SecurityAlert, BiometricData } from '../../../types';

type ToastMessage = { message: string, type: 'success' | 'error' | 'info' };

interface IUserContext {
    isAuthenticated: boolean;
    isInitialized: boolean;
    profile: UserProfile | null;
    settings: UserSettings;
    transactions: UserTransaction[];
    alerts: SecurityAlert[];
    biometrics: BiometricData | null;
    toast: ToastMessage | null;
    login: (pin: string) => Promise<boolean>;
    logout: () => void;
    updateProfile: (updates: Partial<UserProfile>) => void;
    updateSettings: (updates: Partial<UserSettings>) => void;
    updateBalance: (newBalance: number) => void;
    addTransaction: (tx: UserTransaction) => void;
    addAlert: (alert: Omit<SecurityAlert, 'id' | 'timestamp'>) => void;
    saveBiometrics: (data: BiometricData) => void;
    deleteUserData: () => void;
    showToast: (message: string, type: 'success' | 'error' | 'info') => void;
    applyTheme: () => void;
    t: (key: string) => string;
    setLanguage: (lang: Language) => void;
}

export const UserContext = createContext<IUserContext | undefined>(undefined);

interface UserContextProviderProps {
    children: ReactNode;
    onLogout: () => void;
}

export const UserContextProvider: React.FC<UserContextProviderProps> = ({ children, onLogout }) => {
    const [isInitialized, setIsInitialized] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [settings, setSettings] = useState<UserSettings>(localData.getSettings());
    const [transactions, setTransactions] = useState<UserTransaction[]>([]);
    const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
    const [biometrics, setBiometrics] = useState<BiometricData | null>(null);
    const [toast, setToast] = useState<ToastMessage | null>(null);
    
    const { t, setLanguage, currentLanguage } = useTranslation(settings.language);

    const loadData = useCallback(() => {
        localData.initializeData();
        setProfile(localData.getProfile());
        const loadedSettings = localData.getSettings();
        setSettings(loadedSettings);
        if (currentLanguage !== loadedSettings.language) {
            setLanguage(loadedSettings.language);
        }
        setTransactions(localData.getTransactions());
        setAlerts(localData.getAlerts());
        setBiometrics(localData.getBiometrics());
        setIsAuthenticated(localData.isUserLoggedIn());
        setIsInitialized(true);
    }, [currentLanguage, setLanguage]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const showToast = useCallback((message: string, type: 'success' | 'error' | 'info') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    }, []);

    const login = useCallback(async (pin: string): Promise<boolean> => {
        const success = localData.login(pin);
        if (success) {
            setIsAuthenticated(true);
            loadData();
        }
        return success;
    }, [loadData]);

    const logout = useCallback(() => {
        localData.logout();
        setIsAuthenticated(false);
        onLogout();
    }, [onLogout]);
    
    const updateProfileState = useCallback((updates: Partial<UserProfile>) => {
        const newProfile = localData.updateProfile(updates);
        setProfile(newProfile);
    }, []);

    const updateBalanceState = useCallback((newBalance: number) => {
        const newProfile = localData.updateBalance(newBalance);
        setProfile(newProfile);
    }, []);
    
    const updateSettingsState = useCallback((updates: Partial<UserSettings>) => {
        const newSettings = localData.updateSettings(updates);
        setSettings(newSettings);
        if (updates.language) {
            setLanguage(updates.language);
        }
    }, [setLanguage]);

    const addTransactionState = useCallback((tx: UserTransaction) => {
        const newTransactions = localData.addTransaction(tx);
        setTransactions(newTransactions);
    }, []);

    const addAlertState = useCallback((alert: Omit<SecurityAlert, 'id' | 'timestamp'>) => {
        const newAlerts = localData.addAlert(alert);
        setAlerts(newAlerts);
    }, []);

    const saveBiometricsState = useCallback((data: BiometricData) => {
        const newBiometrics = localData.saveBiometrics(data);
        setBiometrics(newBiometrics);
    }, []);

    const deleteUserDataState = useCallback(() => {
        localData.deleteUserData();
        showToast("All data deleted.", 'info');
        logout();
    }, [logout, showToast]);

    const applyTheme = useCallback(() => {
        if (typeof window === 'undefined') return;
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark', 'theme-high-contrast');
        
        const apply = (theme: string) => {
            if (theme === 'dark') {
                root.classList.add('dark');
            } else if(theme === 'high-contrast') {
                root.classList.add('theme-high-contrast');
            } else {
                root.classList.add('light');
            }
        };

        if (settings.theme === 'system') {
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            apply(systemTheme);
        } else {
            apply(settings.theme);
        }
    }, [settings.theme]);

    useEffect(() => {
        if (isInitialized) {
            applyTheme();
        }
    }, [settings.theme, isInitialized, applyTheme]);

    const value: IUserContext = {
        isAuthenticated,
        isInitialized,
        profile,
        settings,
        transactions,
        alerts,
        biometrics,
        toast,
        login,
        logout,
        updateProfile: updateProfileState,
        updateSettings: updateSettingsState,
        updateBalance: updateBalanceState,
        addTransaction: addTransactionState,
        addAlert: addAlertState,
        saveBiometrics: saveBiometricsState,
        deleteUserData: deleteUserDataState,
        showToast,
        applyTheme,
        t,
        setLanguage,
    };

    return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
