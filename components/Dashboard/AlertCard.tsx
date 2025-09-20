import React from 'react';
import { Alert, AlertLevel } from '../../types';
import { MOCK_AGENTS } from '../../constants';
import { PhoneIcon } from '../icons/Icons';

interface AlertCardProps {
    alert: Alert;
    onSelect: () => void;
}

const getLevelStyles = (level: AlertLevel): { bg: string; text: string; border: string } => {
    switch (level) {
        case AlertLevel.Critical:
            return { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500' };
        case AlertLevel.High:
            return { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500' };
        case AlertLevel.Medium:
            return { bg: 'bg-sky-500/10', text: 'text-sky-400', border: 'border-sky-500' };
        default:
            return { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500' };
    }
};

const AlertCard: React.FC<AlertCardProps> = ({ alert, onSelect }) => {
    const styles = getLevelStyles(alert.level);
    const time = alert.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Find the agent to determine risk
    const agent = MOCK_AGENTS.find(a => a.agent_id === alert.agentId);
    const agentDisputes = agent?.disputes ?? 0;

    const getAgentRiskColor = () => {
        if (agentDisputes >= 15) return 'bg-red-500'; // High risk
        if (agentDisputes >= 5) return 'bg-amber-500'; // Medium risk
        return 'bg-emerald-500'; // Low risk
    };
    
    const agentRiskColorClass = getAgentRiskColor();

    return (
        <button
            onClick={onSelect}
            className={`w-full text-left p-3 rounded-lg flex items-center gap-4 border-l-4 transition-all duration-200 hover:shadow-md hover:bg-slate-500/20 ${styles.bg} ${styles.border}`}
        >
            <div className={`px-3 py-1 rounded-md text-sm font-bold ${styles.text}`}>
                {alert.level}
            </div>
            <div className="flex-1 grid grid-cols-2 md:grid-cols-5 gap-x-4 gap-y-2 items-center">
                {/* From */}
                <div className="font-mono text-sm text-slate-100 flex items-center gap-2 col-span-1">
                    <PhoneIcon className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <div>
                        <p className="text-slate-400 text-xs">From</p>
                        {alert.from}
                    </div>
                </div>
                {/* To */}
                <div className="font-mono text-sm text-slate-100 flex items-center gap-2 col-span-1">
                    <PhoneIcon className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <div>
                        <p className="text-slate-400 text-xs">To</p>
                        {alert.to}
                    </div>
                </div>
                {/* Agent ID */}
                <div className="font-mono text-sm text-slate-100 col-span-1">
                    <p className="text-slate-400 text-xs">Agent</p>
                    <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${agentRiskColorClass}`} title={`Risk based on ${agentDisputes} disputes`}></span>
                        <span>{alert.agentId}</span>
                    </div>
                </div>
                {/* Amount */}
                <div className="font-semibold text-lg text-slate-50 md:text-xl col-span-1 text-right md:text-left">
                    <p className="text-slate-400 text-xs md:hidden">Amount</p>
                    KES {alert.amount.toLocaleString()}
                </div>
                {/* Reason/Time */}
                <div className="text-left md:text-right col-span-2 md:col-span-1">
                    <p className="text-xs text-slate-200 truncate">{alert.reasons[0]}</p>
                    <p className="text-xs text-slate-400">{time}</p>
                </div>
            </div>
        </button>
    );
};

export default AlertCard;