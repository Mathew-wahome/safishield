// --- Analyst App Types ---

export enum Page {
    Dashboard = 'Dashboard',
    AgentMonitor = 'Agent Monitor',
    ScamMap = 'Scam Map',
    Education = 'Education'
}

export enum AlertLevel {
    Low = 'Low',
    Medium = 'Medium',
    High = 'High',
    Critical = 'Critical'
}

export interface Alert {
    id: string;
    timestamp: Date;
    amount: number;
    agentId: string;
    from: string;
    to: string;
    level: AlertLevel;
    reasons: string[];
    location: { lat: number; lon: number };
    model: string;
}

export interface Agent {
    agent_id: string;
    name_masked: string;
    city: string;
    lat: number;
    lon: number;
    avg_volume: number;
    disputes: number;
}

export interface AgentCluster {
    cluster_id: number;
    risk_score: number;
    agents: Agent[];
    sample_txns: string[];
}

export interface ScamReport {
    report_id: string;
    reporter_masked: string;
    suspected_phone_masked: string;
    message: string;
    label: 'loan' | 'offer' | 'impersonation';
    lat: number;
    lon: number;
    timestamp: string;
}

export interface ChatMessage {
    id: string;
    sender: 'user' | 'bot' | 'system';
    text: string;
    type?: 'education' | 'quiz' | 'warning';
    quizOptions?: string[];
    correctAnswer?: string;
}

// --- Offline Verification Types ---

export interface SecurityEvent {
    id: string;
    timestamp: Date;
    type: 'EnrollmentSuccess' | 'VoiceEnrollmentSuccess' | 'AnomalyDetected' | 'VerificationSuccess' | 'VoiceVerificationSuccess' | 'VerificationFailure' | 'VoiceVerificationFailure' | 'OtpInitiated' | 'OtpSuccess' | 'OtpFailure';
    description: string;
    details: Record<string, any>;
}

// --- User App Types ---
export type UserPage = 'dashboard' | 'send' | 'withdraw' | 'history' | 'biometrics' | 'report-scam' | 'settings' | 'transaction-details';


export interface UserProfile {
    firstName: string;
    phone: string;
    pin: string;
    balance: number;
    lastSimIccid: string;
    avgTxnAmount: number;
    avgTxnHour: number;
}

export interface UserSettings {
    language: 'en' | 'sw' | 'fr';
    theme: 'system' | 'light' | 'dark' | 'high-contrast';
    largeFont: boolean;
    livenessStrictness: 'low' | 'medium' | 'high';
    biometricsConsent?: boolean;
}

export interface UserTransaction {
    id: string;
    timestamp: string;
    type: 'send' | 'withdraw';
    recipient: string;
    amount: number;
    note?: string;
    riskScore: number;
    flagged: boolean;
    verificationMethod: 'none' | 'biometric' | 'pin';
}

export interface BiometricTemplate {
    descriptor: any; // Float32Array for face, number[] for voice
    enrolledOn: string;
}

export interface BiometricData {
    face?: BiometricTemplate;
    voice?: BiometricTemplate;
}

export interface SecurityAlert {
    id: string;
    timestamp: string;
    description: string;
    riskScore: number;
    relatedTxId: string;
}
