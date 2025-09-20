import React from 'react';

interface KPIProps {
    title: string;
    value: string;
    trend?: number;
    trendLabel?: string;
}

const KPI: React.FC<KPIProps> = ({ title, value, trend, trendLabel }) => {
    return (
        <div className="bg-slate-900/30 backdrop-blur-lg p-4 rounded-xl shadow-lg border border-slate-100/20">
            <p className="text-sm text-slate-300">{title}</p>
            <p className="text-3xl font-bold font-heading text-slate-50">{value}</p>
            {trend !== undefined && trendLabel && (
                <p className={`text-xs mt-1 ${trend > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                    <span className="font-semibold">{trend}</span> {trendLabel}
                </p>
            )}
        </div>
    );
};

export default KPI;