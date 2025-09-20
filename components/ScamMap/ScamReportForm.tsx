import React, { useState } from 'react';

interface ScamReportFormProps {
    onSubmit: (data: {
        reporter_masked: string;
        suspected_phone_masked: string;
        message: string;
        label: 'loan' | 'offer' | 'impersonation';
        lat: number;
        lon: number;
    }) => void;
}

const ScamReportForm: React.FC<ScamReportFormProps> = ({ onSubmit }) => {
    const [formData, setFormData] = useState({
        suspected_phone_masked: '',
        message: '',
        label: 'loan' as 'loan' | 'offer' | 'impersonation',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Generate random location for demo purposes
        const lat = -1.28 + (Math.random() - 0.5) * 0.1;
        const lon = 36.81 + (Math.random() - 0.5) * 0.1;
        
        onSubmit({
            ...formData,
            reporter_masked: `2547${Math.floor(10000000 + Math.random() * 90000000)}`, // mock reporter
            lat,
            lon,
        });
    };
    
    const inputClasses = "mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm";

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="suspected_phone_masked" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Suspected Number</label>
                <input
                    type="text"
                    name="suspected_phone_masked"
                    id="suspected_phone_masked"
                    value={formData.suspected_phone_masked}
                    onChange={handleChange}
                    placeholder="e.g., 254712345678"
                    required
                    className={inputClasses}
                />
            </div>
             <div>
                <label htmlFor="label" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Scam Type</label>
                <select
                    name="label"
                    id="label"
                    value={formData.label}
                    onChange={handleChange}
                    required
                    className={inputClasses}
                >
                    <option value="loan">Loan Scam</option>
                    <option value="offer">Fake Offer/Prize</option>
                    <option value="impersonation">Impersonation</option>
                </select>
            </div>
            <div>
                <label htmlFor="message" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Message Content</label>
                <textarea
                    name="message"
                    id="message"
                    rows={4}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Copy the suspicious message here..."
                    required
                    className={inputClasses}
                />
            </div>
            <button type="submit" className="w-full py-2 px-4 bg-slate-800 hover:bg-slate-700 dark:bg-sky-600 dark:hover:bg-sky-700 text-white rounded-lg font-bold transition-colors">
                Submit Report
            </button>
        </form>
    );
};

export default ScamReportForm;
