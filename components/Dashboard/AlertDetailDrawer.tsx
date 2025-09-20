import React from 'react';
import { Alert } from '../../types';
import { CloseIcon, InfoIcon } from '../icons/Icons';

interface AlertDetailDrawerProps {
    alert: Alert | null;
    onClose: () => void;
}

const AlertDetailDrawer: React.FC<AlertDetailDrawerProps> = ({ alert, onClose }) => {
    if (!alert) return null;

    return (
        <div
            className={`fixed inset-0 bg-slate-900/50 transition-opacity duration-300 z-40 ${alert ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            onClick={onClose}
        >
            <div
                className={`fixed top-0 right-0 h-full w-full max-w-lg bg-white dark:bg-slate-800 shadow-2xl transform transition-transform duration-300 z-50 ${alert ? 'translate-x-0' : 'translate-x-full'}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                    <h2 className="text-2xl font-bold font-heading text-slate-800 dark:text-slate-100">Alert Details</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
                        <CloseIcon className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                    </button>
                </div>

                <div className="p-6 space-y-6 overflow-y-auto h-[calc(100vh-150px)]">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                       <div><strong className="block text-slate-500 dark:text-slate-400">Transaction ID</strong> <span className="font-mono text-slate-700 dark:text-slate-200">{alert.id}</span></div>
                       <div><strong className="block text-slate-500 dark:text-slate-400">Timestamp</strong> <span className="text-slate-700 dark:text-slate-200">{alert.timestamp.toLocaleString()}</span></div>
                       <div><strong className="block text-slate-500 dark:text-slate-400">From</strong> <span className="font-mono text-slate-700 dark:text-slate-200">{alert.from}</span></div>
                       <div><strong className="block text-slate-500 dark:text-slate-400">To</strong> <span className="font-mono text-slate-700 dark:text-slate-200">{alert.to}</span></div>
                       <div><strong className="block text-slate-500 dark:text-slate-400">Agent ID</strong> <span className="font-mono text-slate-700 dark:text-slate-200">{alert.agentId}</span></div>
                       <div><strong className="block text-slate-500 dark:text-slate-400">Amount (KES)</strong> <span className="font-bold text-lg text-slate-800 dark:text-slate-100">{alert.amount.toLocaleString()}</span></div>
                    </div>
                    
                    <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg border border-slate-200 dark:border-slate-600">
                         <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-2">Risk Factors ({alert.level})</h3>
                         <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                             {alert.reasons.map((reason, i) => (
                                 <li key={i} className="flex items-start gap-2">
                                     <InfoIcon className="w-4 h-4 mt-0.5 text-amber-500 flex-shrink-0" />
                                     <span>{reason}</span>
                                 </li>
                             ))}
                         </ul>
                         <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 text-right">Detected by <span className="font-mono">{alert.model}</span> model.</p>
                    </div>

                    <div>
                        <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-2">Location</h3>
                        {/* Placeholder for map */}
                        <div className="h-48 bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                           <p className="text-slate-500 dark:text-slate-400">Map View Placeholder</p>
                        </div>
                    </div>
                </div>

                <div className="absolute bottom-0 left-0 w-full p-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-t border-slate-200 dark:border-slate-700 flex gap-4">
                     <button className="flex-1 py-3 px-4 bg-slate-700 text-white rounded-lg font-bold hover:bg-slate-600 transition-colors">Approve</button>
                     <button className="flex-1 py-3 px-4 bg-amber-500 text-white rounded-lg font-bold hover:opacity-90 transition-opacity">Escalate</button>
                     <button className="flex-1 py-3 px-4 bg-red-500 text-white rounded-lg font-bold hover:bg-red-600 transition-colors">Block</button>
                </div>
            </div>
        </div>
    );
};

export default AlertDetailDrawer;
