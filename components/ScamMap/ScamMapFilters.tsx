import React from 'react';
import { SearchIcon, CalendarIcon } from '../icons/Icons';

interface ScamMapFiltersProps {
    filterType: string;
    onFilterTypeChange: (type: string) => void;
    filterStartDate: string;
    onFilterStartDateChange: (date: string) => void;
    filterEndDate: string;
    onFilterEndDateChange: (date: string) => void;
    searchQuery: string;
    onSearchQueryChange: (query: string) => void;
    onReset: () => void;
}

const inputStyles = "block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm";

const ScamMapFilters: React.FC<ScamMapFiltersProps> = ({
    filterType, onFilterTypeChange, filterStartDate, onFilterStartDateChange, filterEndDate, onFilterEndDateChange, searchQuery, onSearchQueryChange, onReset
}) => {
    return (
        <div className="p-4 bg-slate-100 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                {/* Keyword Search */}
                <div className="lg:col-span-2">
                    <label htmlFor="search-query" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Search by Region/Keyword</label>
                    <div className="relative">
                        <input
                            type="text"
                            id="search-query"
                            placeholder="e.g., Nairobi, M-Pesa..."
                            value={searchQuery}
                            onChange={(e) => onSearchQueryChange(e.target.value)}
                            className={`${inputStyles} pl-10`}
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <SearchIcon className="h-5 w-5 text-slate-400" />
                        </div>
                    </div>
                </div>

                {/* Type Filter */}
                <div>
                    <label htmlFor="type-filter" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Scam Type</label>
                    <select
                        id="type-filter"
                        value={filterType}
                        onChange={(e) => onFilterTypeChange(e.target.value)}
                        className={inputStyles}
                    >
                        <option value="all">All Types</option>
                        <option value="loan">Loan Scam</option>
                        <option value="offer">Fake Offer/Prize</option>
                        <option value="impersonation">Impersonation</option>
                    </select>
                </div>

                {/* Date Filters */}
                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label htmlFor="start-date" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Start Date</label>
                        <div className="relative">
                            <input
                                type="date"
                                id="start-date"
                                value={filterStartDate}
                                onChange={(e) => onFilterStartDateChange(e.target.value)}
                                className={`${inputStyles} pr-8`}
                            />
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                <CalendarIcon className="h-5 w-5 text-slate-400" />
                            </div>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="end-date" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">End Date</label>
                        <div className="relative">
                            <input
                                type="date"
                                id="end-date"
                                value={filterEndDate}
                                onChange={(e) => onFilterEndDateChange(e.target.value)}
                                className={`${inputStyles} pr-8`}
                            />
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                <CalendarIcon className="h-5 w-5 text-slate-400" />
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Reset Button */}
                <div>
                    <button
                        onClick={onReset}
                        className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-slate-700 dark:text-slate-200 bg-slate-200 dark:bg-slate-600 hover:bg-slate-300/90 dark:hover:bg-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400 dark:focus:ring-offset-slate-800 transition-colors"
                    >
                        Reset
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ScamMapFilters;