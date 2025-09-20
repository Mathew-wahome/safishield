import { UserProfile, UserSettings, UserTransaction, BiometricData, SecurityAlert } from '../../../types';
import { SEED_USER_PROFILE, SEED_USER_SETTINGS, SEED_AGENTS } from '../constants';

const KEYS = {
    PROFILE: 'safi_user_profile',
    SETTINGS: 'safi_user_settings',
    TRANSACTIONS: 'safi_user_transactions',
    ALERTS: 'safi_user_alerts',
    BIOMETRICS: 'safi_user_biometrics',
    IS_LOGGED_IN: 'safi_user_is_logged_in',
    SCAM_REPORTS: 'safi_user_scam_reports',
};

// --- Initialization ---
export const initializeData = (): void => {
    if (!localStorage.getItem(KEYS.PROFILE)) {
        localStorage.setItem(KEYS.PROFILE, JSON.stringify(SEED_USER_PROFILE));
    }
    if (!localStorage.getItem(KEYS.SETTINGS)) {
        localStorage.setItem(KEYS.SETTINGS, JSON.stringify(SEED_USER_SETTINGS));
    }
    if (!localStorage.getItem(KEYS.TRANSACTIONS)) {
        localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify([]));
    }
    if (!localStorage.getItem(KEYS.ALERTS)) {
        localStorage.setItem(KEYS.ALERTS, JSON.stringify([]));
    }
    if (!localStorage.getItem(KEYS.BIOMETRICS)) {
        localStorage.setItem(KEYS.BIOMETRICS, JSON.stringify({}));
    }
    if (!localStorage.getItem(KEYS.SCAM_REPORTS)) {
        localStorage.setItem(KEYS.SCAM_REPORTS, JSON.stringify([]));
    }
};

// --- Auth ---
export const login = (pin: string): boolean => {
    const profile = getProfile();
    if (profile && profile.pin === pin) {
        localStorage.setItem(KEYS.IS_LOGGED_IN, 'true');
        return true;
    }
    return false;
};

export const logout = (): void => {
    localStorage.removeItem(KEYS.IS_LOGGED_IN);
};

export const isUserLoggedIn = (): boolean => {
    return localStorage.getItem(KEYS.IS_LOGGED_IN) === 'true';
};

// --- Getters ---
export const getProfile = (): UserProfile | null => JSON.parse(localStorage.getItem(KEYS.PROFILE) || 'null');
export const getSettings = (): UserSettings => {
    const storedSettings = JSON.parse(localStorage.getItem(KEYS.SETTINGS) || JSON.stringify(SEED_USER_SETTINGS));
    const sessionLanguage = sessionStorage.getItem('user_language') as UserSettings['language'] | null;

    if (sessionLanguage && ['en', 'sw', 'fr'].includes(sessionLanguage)) {
        storedSettings.language = sessionLanguage;
    }

    return storedSettings;
};
export const getTransactions = (): UserTransaction[] => JSON.parse(localStorage.getItem(KEYS.TRANSACTIONS) || '[]');
export const getAlerts = (): SecurityAlert[] => JSON.parse(localStorage.getItem(KEYS.ALERTS) || '[]');
export const getBiometrics = (): BiometricData | null => JSON.parse(localStorage.getItem(KEYS.BIOMETRICS) || 'null');
export const getAgents = () => SEED_AGENTS;
export const getScamReports = (): any[] => JSON.parse(localStorage.getItem(KEYS.SCAM_REPORTS) || '[]');


// --- Setters / Updaters ---
export const updateBalance = (newBalance: number): UserProfile => {
    const profile = getProfile();
    if (profile) {
        profile.balance = newBalance;
        localStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
        return profile;
    }
    throw new Error('Profile not found for updating balance');
};

export const updateProfile = (updates: Partial<UserProfile>): UserProfile => {
    const profile = getProfile();
     if (profile) {
        const newProfile = { ...profile, ...updates };
        localStorage.setItem(KEYS.PROFILE, JSON.stringify(newProfile));
        return newProfile;
    }
    throw new Error('Profile not found for updating');
};

export const addTransaction = (tx: UserTransaction): UserTransaction[] => {
    const transactions = getTransactions();
    const newTransactions = [tx, ...transactions].slice(0, 100); // Keep last 100
    localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(newTransactions));
    return newTransactions;
};

export const addAlert = (alert: Omit<SecurityAlert, 'id'|'timestamp'>): SecurityAlert[] => {
    const alerts = getAlerts();
    const newAlert: SecurityAlert = {
        ...alert,
        id: `alert_${Date.now()}`,
        timestamp: new Date().toISOString(),
    }
    const newAlerts = [newAlert, ...alerts].slice(0, 50);
    localStorage.setItem(KEYS.ALERTS, JSON.stringify(newAlerts));
    return newAlerts;
};

export const addScamReport = (report: any): any[] => {
    const reports = getScamReports();
    const newReports = [report, ...reports];
    localStorage.setItem(KEYS.SCAM_REPORTS, JSON.stringify(newReports));
    return newReports;
};

export const updateSettings = (updates: Partial<UserSettings>): UserSettings => {
    const settings = getSettings();
    const newSettings = { ...settings, ...updates };
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(newSettings));
    return newSettings;
};

export const saveBiometrics = (data: BiometricData): BiometricData => {
    localStorage.setItem(KEYS.BIOMETRICS, JSON.stringify(data));
    return data;
};

// --- Deletion ---
export const deleteUserData = (): void => {
    Object.values(KEYS).forEach(key => localStorage.removeItem(key));
};