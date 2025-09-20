import React from 'react';
import { AgentCluster } from '../../types';

interface AgentClusterCardProps {
    cluster: AgentCluster;
    highlightAgentId?: string | null;
}

const AgentClusterCard: React.FC<AgentClusterCardProps> = ({ cluster, highlightAgentId }) => {
    const riskColor = cluster.risk_score > 0.7 ? 'text-red-500 dark:text-red-400' : cluster.risk_score > 0.4 ? 'text-amber-500 dark:text-amber-400' : 'text-emerald-500 dark:text-emerald-400';

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 flex flex-col">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-lg font-bold font-heading text-slate-800 dark:text-slate-100">Cluster {cluster.cluster_id}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{cluster.agents.length} Agents</p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-slate-500 dark:text-slate-400">Risk Score</p>
                    <p className={`text-3xl font-bold ${riskColor}`}>{cluster.risk_score.toFixed(2)}</p>
                </div>
            </div>
            <div className="space-y-2 flex-1">
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">High-Dispute Agents in Cluster:</h4>
                <ul className="space-y-1">
                    {cluster.agents.sort((a,b) => b.disputes - a.disputes).slice(0, 3).map(agent => {
                        const isHighlighted = highlightAgentId === agent.agent_id;
                        const isInactive = agent.avg_volume < 10000;

                        return (
                            <li 
                                key={agent.agent_id} 
                                className={`flex justify-between items-center text-sm p-2 rounded-md transition-all duration-300 ${isHighlighted ? 'ring-2 ring-sky-400 bg-sky-100 dark:bg-sky-500/20' : 'bg-slate-100 dark:bg-slate-700/50'}`}
                            >
                                <div className="flex-1 overflow-hidden">
                                    <span className="font-semibold text-slate-700 dark:text-slate-200">{agent.name_masked}</span>
                                    <span className="text-slate-500 dark:text-slate-400 ml-2">({agent.agent_id})</span>
                                    <div className="flex items-center gap-1.5 text-xs mt-0.5">
                                        {isInactive ? (
                                            <>
                                                <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                                                <span className="text-slate-500 dark:text-slate-400">Inactive</span>
                                            </>
                                        ) : (
                                            <>
                                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                                <span className="text-emerald-600 dark:text-emerald-400">Active</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <span className="font-mono text-xs bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-400 px-2 py-0.5 rounded-full">{agent.disputes} disputes</span>
                            </li>
                        );
                    })}
                </ul>
            </div>
             <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                <p className="text-xs text-slate-500 dark:text-slate-400">Sample associated TXNs:</p>
                <div className="flex gap-2 mt-1">
                    {cluster.sample_txns.map(txn => (
                        <span key={txn} className="text-xs font-mono bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-md">{txn}</span>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AgentClusterCard;