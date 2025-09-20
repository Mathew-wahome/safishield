import { UserTransaction, UserProfile } from '../../../types';
import * as localData from './userLocalData';
import { RISK_SCORES, SEED_USER_PROFILE } from '../constants';

interface RiskAnalysis {
    riskScore: number;
    reasons: string[];
}

/**
 * Analyzes a transaction against user profile and history to determine a risk score.
 */
export const analyzeTransactionRisk = (
    transaction: Omit<UserTransaction, 'id' | 'timestamp' | 'riskScore' | 'flagged' | 'verificationMethod'>,
    profile: UserProfile,
    allTransactions: UserTransaction[]
): RiskAnalysis => {
    let riskScore = 0;
    const reasons: string[] = [];

    // Rule 1: High Amount Multiplier
    const highAmountThreshold = profile.avgTxnAmount * 4;
    if (transaction.amount > highAmountThreshold) {
        riskScore += RISK_SCORES.HIGH_AMOUNT;
        reasons.push(`Amount (KES ${transaction.amount}) is >4x user average (KES ${profile.avgTxnAmount}).`);
    }
    
    // Rule 2: Time-of-Day Anomaly
    const currentHour = new Date().getHours();
    const hourDifference = Math.abs(currentHour - profile.avgTxnHour);
    if (hourDifference > 6 && hourDifference < 18) { // Check if it's more than 6 hours away on a 24h cycle
         riskScore += RISK_SCORES.TIME_OF_DAY;
        reasons.push(`Transaction at ${currentHour}:00 is unusual for user (average hour: ${profile.avgTxnHour}:00).`);
    }
    
    // Rule 3: High Velocity (Rapid Transfers)
    const tenMinutesAgo = Date.now() - 10 * 60 * 1000;
    const recentTxns = allTransactions.filter(tx => new Date(tx.timestamp).getTime() > tenMinutesAgo);
    if (recentTxns.length >= 4) { // 5th transaction in 10 mins is flagged
        riskScore += RISK_SCORES.HIGH_VELOCITY;
        reasons.push(`${recentTxns.length + 1} transactions in the last 10 minutes.`);
    }

    // Rule 4: Flagged Agent
    if (transaction.type === 'withdraw' || transaction.type === 'send') {
        const agents = localData.getAgents();
        const recipientAgent = agents.find(a => a.agent_id === transaction.recipient);
        if (recipientAgent && recipientAgent.disputes > 10) {
             riskScore += RISK_SCORES.FLAGGED_AGENT;
            reasons.push(`Recipient agent (${recipientAgent.agent_id}) has a high dispute rate (${recipientAgent.disputes}).`);
        }
    }

    // Rule 5: SIM Change Detection
    if (profile.lastSimIccid !== SEED_USER_PROFILE.lastSimIccid) {
        riskScore += RISK_SCORES.SIM_CHANGE;
        reasons.push('CRITICAL: SIM card change detected. High risk of SIM-swap fraud.');
    }


    if (reasons.length === 0) {
        reasons.push('Transaction appears normal.');
    }

    return {
        riskScore: Math.min(100, riskScore), // Cap score at 100
        reasons,
    };
};