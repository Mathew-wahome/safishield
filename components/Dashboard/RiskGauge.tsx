import React from 'react';

interface RiskGaugeProps {
    score: number; // 0 to 1
}

const RiskGauge: React.FC<RiskGaugeProps> = ({ score }) => {
    const getRiskColor = (type: 'text' | 'border') => {
        const colors = {
            high: { text: 'text-red-400', border: 'border-red-400' },
            elevated: { text: 'text-amber-400', border: 'border-amber-400' },
            normal: { text: 'text-sky-400', border: 'border-sky-400' }
        };
        if (score > 0.75) return colors.high[type];
        if (score > 0.5) return colors.elevated[type];
        return colors.normal[type];
    };

    const getRiskLabel = () => {
        if (score > 0.75) return 'High Risk';
        if (score > 0.5) return 'Elevated';
        return 'Normal';
    };

    const rotation = score * 180 - 90;

    return (
        <div className="bg-slate-900/30 backdrop-blur-lg p-4 rounded-xl shadow-lg border border-slate-100/20 flex flex-col items-center justify-center">
            <div className="relative w-32 h-16 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full border-t-8 border-l-8 border-r-8 border-slate-500/30 rounded-t-full"></div>
                <div
                    className={`absolute top-0 left-0 w-full h-full border-t-8 border-l-8 border-r-8 rounded-t-full ${getRiskColor('border')} transition-transform duration-500`}
                    style={{
                        clipPath: 'polygon(0% 0%, 100% 0%, 50% 100%)',
                        transform: `rotate(${score * 180}deg)`,
                        transformOrigin: 'bottom center'
                    }}
                ></div>
                 <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-slate-100"></div>
                 <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-16 bg-slate-100 origin-bottom transition-transform duration-500" style={{ transform: `rotate(${rotation}deg)` }}></div>
            </div>
            <p className={`text-lg font-bold font-heading ${getRiskColor('text')}`}>{getRiskLabel()}</p>
            <p className="text-xs text-slate-400">Platform-wide Risk</p>
        </div>
    );
};

export default RiskGauge;