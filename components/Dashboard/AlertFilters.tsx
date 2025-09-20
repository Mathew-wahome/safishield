import React from 'react';
import { AlertLevel } from '../../types';
import { SearchIcon } from '../icons/Icons';

interface AlertFiltersProps {
    keyword: string;
    onKeywordChange: (keyword: string) => void;
    level: string; // 'All' or AlertLevel
    onLevelChange: (level: string) => void;
    amountMin: string;
    onAmountMinChange: (min: string) => void;
    amountMax: string;
    onAmountMaxChange: (max: string) => void;
    onReset: () => void;
}

const inputStyles = "block w-full px-3 py-2 bg-slate-800/50 border border-slate-600 rounded-md shadow-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm";

const AlertFilters: React.FC<AlertFiltersProps> = ({
    keyword, onKeywordChange, level, onLevelChange, amountMin, onAmountMinChange, amountMax, onAmountMaxChange, onReset
}) => {
    return (
        <div className="p-4 bg-slate-800/20 rounded-lg border border-slate-100/10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                {/* Keyword Search */}
                <div className="lg:col-span-2">
                    <label htmlFor="keyword-search" className="block text-xs font-medium text-slate-300 mb-1">Keyword Search</label>
                    <div className="relative">
                        <input
                            type="text"
                            id="keyword-search"
                            placeholder="Search ID, reason, agent..."
                            value={keyword}
                            onChange={(e) => onKeywordChange(e.target.value)}
                            className={`${inputStyles} pl-10`}
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <SearchIcon className="h-5 w-5 text-slate-400" />
                        </div>
                    </div>
                </div>

                {/* Level Filter */}
                <div>
                    <label htmlFor="level-filter" className="block text-xs font-medium text-slate-300 mb-1">Level</label>
                    <select
                        id="level-filter"
                        value={level}
                        onChange={(e) => onLevelChange(e.target.value)}
                        className={inputStyles}
                    >
                        <option value="All">All</option>
                        {/* FIX: Add explicit string type to resolve potential type inference issues with Object.values on an enum. */}
                        {Object.values(AlertLevel).map((levelValue: string) => (
                            <option key={levelValue} value={levelValue}>{levelValue}</option>
                        ))}
                    </select>
                </div>

                {/* Amount Filter */}
                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label htmlFor="amount-min" className="block text-xs font-medium text-slate-300 mb-1">Min Amount</label>
                        <input
                            type="number"
                            id="amount-min"
                            placeholder="0"
                            value={amountMin}
                            onChange={(e) => onAmountMinChange(e.target.value)}
                             className={inputStyles}
                        />
                    </div>
                    <div>
                        <label htmlFor="amount-max" className="block text-xs font-medium text-slate-300 mb-1">Max Amount</label>
                        <input
                            type="number"
                            id="amount-max"
                            placeholder="Any"
                            value={amountMax}
                            onChange={(e) => onAmountMaxChange(e.target.value)}
                             className={inputStyles}
                        />
                    </div>
                </div>
                
                {/* Reset Button */}
                <div>
                    <button
                        onClick={onReset}
                        className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-slate-800 bg-slate-200 hover:bg-slate-300/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-300 transition-colors"
                    >
                        Reset
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AlertFilters;