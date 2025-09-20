import React, { useState } from 'react';
import { useUser } from '../hooks/useUser';
// Fix: Import UserPage from the correct source file.
import type { UserPage } from '../../../types';
import PageHeader from '../components/PageHeader';

interface ReportScamPageProps {
    setCurrentPage: (page: UserPage) => void;
}

const ReportScamPage: React.FC<ReportScamPageProps> = ({ setCurrentPage }) => {
    const { t, showToast } = useUser();
    const [phone, setPhone] = useState('');
    const [message, setMessage] = useState('');
    const [type, setType] = useState('phishing');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, this would be sent to a server. Here we just log it.
        console.log("SCAM REPORTED:", { phone, message, type });
        showToast(t('report_scam_success'), 'success');
        setCurrentPage('dashboard');
    };
    
    const inputClasses = "mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm";

    return (
        <div>
            <PageHeader title={t('report_scam_title')} onBack={() => setCurrentPage('dashboard')} />
            <form onSubmit={handleSubmit} className="space-y-4">
                 <div>
                    <label htmlFor="phone" className="block text-sm font-medium">{t('report_scam_phone')}</label>
                    <input
                        type="tel"
                        id="phone"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        required
                        className={inputClasses}
                    />
                </div>
                 <div>
                    <label htmlFor="type" className="block text-sm font-medium">{t('report_scam_type')}</label>
                    <select
                        id="type"
                        value={type}
                        onChange={e => setType(e.target.value)}
                        className={inputClasses}
                    >
                        <option value="phishing">{t('report_scam_type_phishing')}</option>
                        <option value="loan">{t('report_scam_type_loan')}</option>
                        <option value="prize">{t('report_scam_type_prize')}</option>
                    </select>
                </div>
                 <div>
                    <label htmlFor="message" className="block text-sm font-medium">{t('report_scam_message')}</label>
                    <textarea
                        id="message"
                        rows={5}
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                        required
                        className={inputClasses}
                    />
                </div>
                <button type="submit" className="w-full py-3 bg-sky-500 text-white rounded-lg font-bold">
                    {t('report_scam_submit')}
                </button>
            </form>
        </div>
    );
};

export default ReportScamPage;