import React, { useState } from 'react';
import { MOCK_AGENT_CLUSTERS } from '../../constants';
import AgentClusterCard from '../AgentMonitor/AgentClusterCard';
import QRScannerModal from '../AgentMonitor/QRScannerModal';
import { QRIcon } from '../icons/Icons';

const AgentMonitor: React.FC = () => {
    const sortedClusters = [...MOCK_AGENT_CLUSTERS].sort((a, b) => b.risk_score - a.risk_score);
    const [isScannerOpen, setIsScannerOpen] = useState(false);
    const [scannedAgentId, setScannedAgentId] = useState<string | null>(null);
    const [scanMessage, setScanMessage] = useState<string | null>(null);

    const handleScanSuccess = (agentId: string) => {
        setIsScannerOpen(false);
        setScannedAgentId(agentId);
        setScanMessage(`Successfully scanned and highlighted Agent: ${agentId}`);
        // Clear the message after a few seconds
        setTimeout(() => setScanMessage(null), 5000);
    };

    const handleScannerClose = () => {
        setIsScannerOpen(false);
    };

    const clearHighlight = () => {
        setScannedAgentId(null);
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap justify-between items-center gap-4">
                <div>
                    <h2 className="text-xl font-bold font-heading text-slate-50">Agent Clusters Overview</h2>
                    <p className="text-slate-300">Agents are grouped by behavioral similarity. High-risk clusters may indicate coordinated fraudulent activity.</p>
                </div>
                <button
                    onClick={() => setIsScannerOpen(true)}
                    className="flex items-center gap-2 py-2 px-4 bg-sky-500 text-white rounded-lg font-bold hover:bg-sky-600 transition-colors text-sm"
                >
                    <QRIcon className="w-5 h-5" />
                    Scan Agent QR
                </button>
            </div>

            {scanMessage && (
                 <div className="p-3 text-sm text-emerald-800 bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-300 rounded-lg flex justify-between items-center">
                    <p>{scanMessage}</p>
                    <button onClick={clearHighlight} className="font-bold underline">Clear</button>
                </div>
            )}
            
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {sortedClusters.map(cluster => (
                    <AgentClusterCard 
                        key={cluster.cluster_id} 
                        cluster={cluster} 
                        highlightAgentId={scannedAgentId} 
                    />
                ))}
            </div>

            {isScannerOpen && (
                <QRScannerModal 
                    onScanSuccess={handleScanSuccess} 
                    onClose={handleScannerClose}
                />
            )}
        </div>
    );
};

export default AgentMonitor;