import React, { useState, useMemo } from 'react';
import { MOCK_ALERTS } from '../../constants';
import { useMockStream } from '../../hooks/useMockStream';
import { Alert, AlertLevel, Page } from '../../types';
import AlertCard from '../Dashboard/AlertCard';
import AlertDetailDrawer from '../Dashboard/AlertDetailDrawer';
import KPI from '../Dashboard/KPI';
import RiskGauge from '../Dashboard/RiskGauge';
import AlertFilters from '../Dashboard/AlertFilters';
import { FilePlusIcon, UsersIcon, BookmarkIcon } from '../icons/Icons';
import ComingSoonModal from '../Dashboard/ComingSoonModal';

const QuickActionButton: React.FC<{
    icon: React.FC<React.SVGProps<SVGSVGElement>>;
    title: string;
    description: string;
    onClick?: () => void;
}> = ({ icon: Icon, title, description, onClick }) => (
    <button onClick={onClick} className="flex items-center p-3 space-x-3 text-left transition-colors bg-slate-800/40 hover:bg-slate-700/60 rounded-lg w-full">
        <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-slate-700 rounded-lg">
            <Icon className="w-6 h-6 text-sky-300" />
        </div>
        <div>
            <p className="font-semibold text-slate-100">{title}</p>
            <p className="text-xs text-slate-400">{description}</p>
        </div>
    </button>
);


const Dashboard: React.FC<{ 
    userName?: string; 
    jobTitle?: string;
    setCurrentPage: (page: Page) => void;
    onCreateReport: () => void;
}> = ({ userName, jobTitle, setCurrentPage, onCreateReport }) => {
    const alerts = useMockStream(MOCK_ALERTS, true);
    const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
    const [showComingSoon, setShowComingSoon] = useState(false);

    // State for filters
    const [filterKeyword, setFilterKeyword] = useState('');
    const [filterLevel, setFilterLevel] = useState('All');
    const [filterAmountMin, setFilterAmountMin] = useState('');
    const [filterAmountMax, setFilterAmountMax] = useState('');

    const filteredAlerts = useMemo(() => {
        return alerts.filter(alert => {
            if (filterLevel !== 'All' && alert.level !== filterLevel) {
                return false;
            }

            const min = parseFloat(filterAmountMin);
            const max = parseFloat(filterAmountMax);
            if (!isNaN(min) && alert.amount < min) {
                return false;
            }
            if (!isNaN(max) && alert.amount > max) {
                return false;
            }

            if (filterKeyword.trim() !== '') {
                const lowerKeyword = filterKeyword.toLowerCase();
                const searchCorpus = [
                    alert.id,
                    alert.from,
                    alert.to,
                    alert.agentId,
                    ...alert.reasons
                ].join(' ').toLowerCase();

                if (!searchCorpus.includes(lowerKeyword)) {
                    return false;
                }
            }

            return true;
        });
    }, [alerts, filterKeyword, filterLevel, filterAmountMin, filterAmountMax]);

    const handleResetFilters = () => {
        setFilterKeyword('');
        setFilterLevel('All');
        setFilterAmountMin('');
        setFilterAmountMax('');
    };

    const highAlerts = alerts.filter(a => a.level === 'High' || a.level === 'Critical').length;
    const totalVolume = alerts.reduce((sum, a) => sum + a.amount, 0);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold font-heading text-slate-50">
                    {userName ? `Welcome back, ${userName.split(' ')[0]}!` : 'Dashboard'}
                </h1>
                <p className="text-slate-300">Here's your real-time fraud overview for today.</p>
            </div>

            {/* My Workspace Section */}
            <div className="bg-slate-900/30 backdrop-blur-lg border border-slate-100/20 rounded-xl shadow-2xl p-6">
                <h2 className="text-xl font-bold font-heading text-sky-300 mb-1">My Workspace</h2>
                <p className="text-sm text-slate-300 mb-4">Your personalized overview and quick actions as a {jobTitle || 'Fraud Analyst'}.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="md:col-span-1 lg:col-span-2 space-y-3">
                         <QuickActionButton icon={FilePlusIcon} title="Create New Report" description="Log a manual incident." onClick={onCreateReport} />
                         <QuickActionButton icon={UsersIcon} title="Review Clusters" description="Check high-risk agent groups." onClick={() => setCurrentPage(Page.AgentMonitor)} />
                         <QuickActionButton icon={BookmarkIcon} title="Saved Cases" description="Access your pending investigations." onClick={() => setShowComingSoon(true)} />
                    </div>
                    <div className="md:col-span-1 lg:col-span-2 bg-slate-800/40 p-4 rounded-lg flex flex-col justify-center text-center">
                        <p className="text-sm text-slate-400">Activity Summary (Today)</p>
                        <p className="text-4xl font-bold text-slate-50 mt-2">12</p>
                        <p className="text-slate-300">Alerts Reviewed</p>
                        <p className="text-xs text-emerald-400 mt-1">+5 from yesterday</p>
                    </div>
                </div>
            </div>


            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPI title="Live Alerts" value={alerts.length.toString()} trend={highAlerts} trendLabel="High/Critical" />
                <KPI title="Total Flagged Volume (KES)" value={`~${Math.round(totalVolume / 1000)}k`} trend={totalVolume > 500000 ? 1 : 0} trendLabel="Above Avg" />
                <RiskGauge score={0.65} />
                <KPI title="Models Active" value="2" trend={0} trendLabel="Rule-based, Isolation Forest" />
            </div>

            <div className="bg-slate-900/30 backdrop-blur-lg border border-slate-100/20 rounded-xl shadow-2xl">
                <div className="p-4 border-b border-slate-100/10">
                    <h2 className="text-xl font-bold font-heading text-sky-300">Real-time Fraud Alerts</h2>
                     <AlertFilters
                        keyword={filterKeyword}
                        onKeywordChange={setFilterKeyword}
                        level={filterLevel}
                        onLevelChange={setFilterLevel}
                        amountMin={filterAmountMin}
                        onAmountMinChange={setFilterAmountMin}
                        amountMax={filterAmountMax}
                        onAmountMaxChange={setFilterAmountMax}
                        onReset={handleResetFilters}
                    />
                </div>
                <div className="p-4 space-y-2 max-h-[40vh] overflow-y-auto">
                    {filteredAlerts.length > 0 ? (
                        filteredAlerts.map(alert => (
                            <AlertCard key={alert.id} alert={alert} onSelect={() => setSelectedAlert(alert)} />
                        ))
                    ) : (
                        <div className="text-center py-8 text-slate-400">
                            <p>No alerts match your current filters.</p>
                        </div>
                    )}
                </div>
            </div>

            <AlertDetailDrawer alert={selectedAlert} onClose={() => setSelectedAlert(null)} />
            {showComingSoon && <ComingSoonModal onClose={() => setShowComingSoon(false)} />}
        </div>
    );
};

export default Dashboard;