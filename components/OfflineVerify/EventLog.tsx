import React from 'react';
import { SecurityEvent } from '../../types';
import { CheckCircleIcon, WarningIcon, InfoIcon } from '../icons/Icons';

interface EventLogProps {
    events: SecurityEvent[];
}

const EventLog: React.FC<EventLogProps> = ({ events }) => {

    const getEventStyles = (type: SecurityEvent['type']) => {
        switch(type) {
            case 'EnrollmentSuccess':
            case 'VerificationSuccess':
            case 'VoiceEnrollmentSuccess':
            case 'VoiceVerificationSuccess':
            case 'OtpSuccess':
                return { icon: <CheckCircleIcon className="w-5 h-5 text-emerald-400"/>, textColor: 'text-emerald-300' };
            case 'VerificationFailure':
            case 'VoiceVerificationFailure':
            case 'OtpFailure':
                return { icon: <WarningIcon className="w-5 h-5 text-red-400"/>, textColor: 'text-red-300' };
            case 'AnomalyDetected':
            case 'OtpInitiated':
                return { icon: <InfoIcon className="w-5 h-5 text-amber-400"/>, textColor: 'text-amber-300' };
            default:
                return { icon: <InfoIcon className="w-5 h-5 text-slate-400"/>, textColor: 'text-slate-300' };
        }
    };

    return (
        <div className="bg-slate-900/30 backdrop-blur-lg border border-slate-100/20 rounded-xl shadow-2xl p-6 h-full min-h-[50vh]">
            <h3 className="text-xl font-bold font-heading text-slate-50 mb-4">Security Event Log</h3>
            <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                {events.length === 0 ? (
                    <div className="text-center py-10 text-slate-400">
                        <p>No security events recorded yet.</p>
                    </div>
                ) : (
                    events.map(event => {
                        const { icon, textColor } = getEventStyles(event.type);
                        return (
                            <div key={event.id} className="flex items-start gap-3">
                                <div className="mt-1">{icon}</div>
                                <div>
                                    <p className={`font-semibold ${textColor}`}>{event.type.replace(/([A-Z])/g, ' $1').trim()}</p>
                                    <p className="text-sm text-slate-300">{event.description}</p>
                                    <p className="text-xs text-slate-500">{event.timestamp.toLocaleTimeString()}</p>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    );
};

export default EventLog;