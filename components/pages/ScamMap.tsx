import React, { useState, useMemo, useEffect } from 'react';
import { MOCK_SCAM_REPORTS } from '../../constants';
import { ScamReport } from '../../types';
import ScamReportForm from '../ScamMap/ScamReportForm';
import ScamMapFilters from '../ScamMap/ScamMapFilters';

interface ScamMapProps {
    startNewReport: boolean;
    onNewReportFlowComplete: () => void;
}

const ScamMap: React.FC<ScamMapProps> = ({ startNewReport, onNewReportFlowComplete }) => {
    const [reports, setReports] = useState<ScamReport[]>(MOCK_SCAM_REPORTS);
    const [showForm, setShowForm] = useState(false);

    // State for filters
    const [filterType, setFilterType] = useState('all');
    const [filterStartDate, setFilterStartDate] = useState('');
    const [filterEndDate, setFilterEndDate] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (startNewReport) {
            setShowForm(true);
        }
    }, [startNewReport]);

    const filteredReports = useMemo(() => {
        return reports.filter(report => {
            // Filter by type
            if (filterType !== 'all' && report.label !== filterType) {
                return false;
            }

            // Filter by date range
            const reportDate = new Date(report.timestamp);
            if (filterStartDate) {
                const startDate = new Date(filterStartDate);
                startDate.setHours(0, 0, 0, 0); // Start of the day in local timezone
                if (reportDate < startDate) {
                    return false;
                }
            }
            if (filterEndDate) {
                const endDate = new Date(filterEndDate);
                endDate.setHours(23, 59, 59, 999); // End of the day in local timezone
                if (reportDate > endDate) {
                    return false;
                }
            }

            // Filter by search query (local search in message)
            if (searchQuery.trim() !== '') {
                const lowerQuery = searchQuery.toLowerCase();
                if (!report.message.toLowerCase().includes(lowerQuery)) {
                    return false;
                }
            }
            
            return true;
        }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }, [reports, filterType, filterStartDate, filterEndDate, searchQuery]);

    const addReport = (report: Omit<ScamReport, 'report_id' | 'timestamp'>) => {
        const newReport: ScamReport = {
            ...report,
            report_id: `rep_${Date.now()}`,
            timestamp: new Date().toISOString(),
        };
        setReports(prev => [newReport, ...prev]);
        setShowForm(false);
        onNewReportFlowComplete();
    };
    
    const handleResetFilters = () => {
        setFilterType('all');
        setFilterStartDate('');
        setFilterEndDate('');
        setSearchQuery('');
    };
    
    const handleToggleForm = () => {
        if (showForm) {
            onNewReportFlowComplete();
        }
        setShowForm(!showForm);
    };

    // Normalize coordinates for a 100x100 grid
    const normalizeCoords = (lat: number, lon: number) => {
        const minLat = -5, maxLat = 5;
        const minLon = 34, maxLon = 42;
        const y = 100 - ((lat - minLat) / (maxLat - minLat) * 100);
        const x = ((lon - minLon) / (maxLon - minLon) * 100);
        return { x, y };
    };

    const mapBgStyle = {
        backgroundImage: 
            `linear-gradient(rgba(15, 23, 42, 0.8), rgba(15, 23, 42, 0.8)),
            linear-gradient(90deg, rgba(51, 65, 85, 0.3) 1px, transparent 1px),
            linear-gradient(rgba(51, 65, 85, 0.3) 1px, transparent 1px)`,
        backgroundSize: 'cover, 20px 20px, 20px 20px',
        backgroundPosition: 'center',
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
            <div className="lg:col-span-2 flex flex-col gap-4">
                 <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                     <h2 className="text-xl font-bold font-heading text-slate-800 dark:text-slate-100 mb-4 flex-shrink-0">Investigate Scam Reports</h2>
                     <ScamMapFilters 
                        filterType={filterType}
                        onFilterTypeChange={setFilterType}
                        filterStartDate={filterStartDate}
                        onFilterStartDateChange={setFilterStartDate}
                        filterEndDate={filterEndDate}
                        onFilterEndDateChange={setFilterEndDate}
                        searchQuery={searchQuery}
                        onSearchQueryChange={setSearchQuery}
                        onReset={handleResetFilters}
                     />
                </div>
                <div className="flex-1 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 min-h-[50vh] lg:min-h-0 flex flex-col">
                    <div className="relative w-full h-full rounded-lg overflow-hidden bg-slate-700" style={mapBgStyle}>
                        <p className="absolute top-2 left-2 text-xs text-white bg-black/30 p-2 rounded-md">Scam Report Heatmap</p>
                        {filteredReports.map(report => {
                             const { x, y } = normalizeCoords(report.lat, report.lon);
                             const color = report.label === 'loan' ? 'bg-red-500' : report.label === 'offer' ? 'bg-amber-500' : 'bg-sky-500';
                             return (
                                <div 
                                    key={report.report_id}
                                    className={`absolute w-3 h-3 rounded-full ${color} opacity-80 transform -translate-x-1/2 -translate-y-1/2 border-2 border-white/50 animate-pulse`}
                                    style={{ top: `${y}%`, left: `${x}%`, animationDelay: `${Math.random() * 1}s` }}
                                    title={`${report.label}: ${report.message}`}
                                />
                             );
                        })}
                        {filteredReports.length === 0 && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <p className="text-slate-300 bg-slate-900/50 p-4 rounded-lg">No reports match your filters.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold font-heading text-slate-800 dark:text-slate-100">Recent Reports</h2>
                    <button onClick={handleToggleForm} className="py-2 px-4 bg-sky-500 text-white rounded-lg font-bold hover:bg-sky-600 transition-opacity text-sm">
                        {showForm ? 'Cancel' : 'New Report'}
                    </button>
                </div>
                {showForm ? (
                    <ScamReportForm onSubmit={addReport} />
                ) : (
                    <div className="flex-1 flex flex-col">
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                            Displaying <span className="font-bold text-slate-800 dark:text-slate-100">{filteredReports.length}</span> matching reports.
                        </p>
                        <ul className="space-y-2 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                          {filteredReports.map(r => (
                            <li key={r.report_id} className="text-xs p-2 bg-slate-100 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 rounded-md">
                               <strong className="capitalize">{r.label} scam</strong> reported via <span className="font-mono">{r.reporter_masked}</span>
                               <p className="truncate italic text-slate-500 dark:text-slate-400">"{r.message}"</p>
                            </li>
                          ))}
                          {filteredReports.length === 0 && (
                             <li className="text-xs p-2 text-center text-slate-500 h-full flex items-center justify-center">No reports to display.</li>
                          )}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ScamMap;