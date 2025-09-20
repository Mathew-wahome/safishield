import { UserProfile, UserSettings, Agent } from '../../types';

export const SEED_USER_PROFILE: UserProfile = {
    firstName: 'Juma',
    phone: '+254712345678',
    pin: '123456', // In a real app, this MUST be hashed.
    balance: 150230.75,
    lastSimIccid: '892540212345678901f', // Standard format for a SIM serial
    avgTxnAmount: 3500,
    avgTxnHour: 14, // 2 PM
};

export const SEED_USER_SETTINGS: UserSettings = {
    language: 'en',
    theme: 'system',
    largeFont: false,
    livenessStrictness: 'medium',
    biometricsConsent: undefined, // undefined means user has not been prompted yet
};

export const SEED_AGENTS: Agent[] = [
    { agent_id: 'AGT001', name_masked: 'Safaricom Shop', city: 'Nairobi', disputes: 1, lat: 0, lon: 0, avg_volume: 0 },
    { agent_id: 'AGT002', name_masked: 'QuickMart Agent', city: 'Nairobi', disputes: 0, lat: 0, lon: 0, avg_volume: 0 },
    { agent_id: 'AGT003', name_masked: 'Naivas Till', city: 'Mombasa', disputes: 3, lat: 0, lon: 0, avg_volume: 0 },
    { agent_id: 'AGT004', name_masked: 'Co-op Bank Agent', city: 'Kisumu', disputes: 0, lat: 0, lon: 0, avg_volume: 0 },
    { agent_id: 'AGT005', name_masked: 'Kibanda M-Pesa', city: 'Nairobi', disputes: 15, lat: 0, lon: 0, avg_volume: 0 }, // High risk
];

export const ANOMALY_THRESHOLDS = {
    biometric_required: 50,
    block: 85,
};

export const RISK_SCORES = {
    HIGH_AMOUNT: 35,
    TIME_OF_DAY: 20,
    SIM_CHANGE: 80,
    HIGH_VELOCITY: 40,
    FLAGGED_AGENT: 30,
};