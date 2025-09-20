import React from 'react';
import { CheckCircleIcon, WarningIcon, InfoIcon } from '../../icons/Icons';

interface ToastProps {
    message: string;
    type: 'success' | 'error' | 'info';
}

const Toast: React.FC<ToastProps> = ({ message, type }) => {
    const styles = {
        success: {
            bg: 'bg-emerald-500/90 border-emerald-300',
            Icon: CheckCircleIcon,
        },
        error: {
            bg: 'bg-red-500/90 border-red-300',
            Icon: WarningIcon,
        },
        info: {
            bg: 'bg-sky-500/90 border-sky-300',
            Icon: InfoIcon,
        },
    };

    const { bg, Icon } = styles[type];

    return (
        <div 
            className={`fixed bottom-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 py-3 px-6 rounded-full text-white font-semibold shadow-lg backdrop-blur-sm border ${bg}`}
            role="alert"
        >
            <Icon className="w-6 h-6" />
            <span>{message}</span>
        </div>
    );
};

export default Toast;