import React, { useState } from 'react';
import { useUser } from '../hooks/useUser';
import { UserPage } from '../../../types';
import PageHeader from '../components/PageHeader';
import { FaceIcon, MicIcon, CheckCircleIcon, WarningIcon } from '../../icons/Icons';
import EnrollmentView from '../../OfflineVerify/EnrollmentView';
import VoiceEnrollmentView from '../../OfflineVerify/VoiceEnrollmentView';
import BiometricVerificationModal from '../components/BiometricVerificationModal';

interface BiometricsPageProps {
    setCurrentPage: (page: UserPage) => void;
}

const BiometricsPage: React.FC<BiometricsPageProps> = ({ setCurrentPage }) => {
    const { settings, biometrics, saveBiometrics, showToast, t, updateSettings } = useUser();
    const [view, setView] = useState<'main' | 'enroll_face' | 'enroll_voice'>('main');
    const [isDeleting, setIsDeleting] = useState<'face' | 'voice' | null>(null);
    const [verificationMethod, setVerificationMethod] = useState<'face' | 'voice' | null>(null);


    const handleFaceEnroll = (descriptor: Float32Array) => {
        saveBiometrics({ ...biometrics, face: { descriptor, enrolledOn: new Date().toISOString() } });
        showToast('Face enrolled successfully!', 'success');
        setView('main');
    };

    const handleVoiceEnroll = (features: number[]) => {
        saveBiometrics({ ...biometrics, voice: { descriptor: features, enrolledOn: new Date().toISOString() } });
        showToast('Voice enrolled successfully!', 'success');
        setView('main');
    };
    
    const handleDelete = (method: 'face' | 'voice') => {
        const newBiometrics = { ...biometrics };
        if (method === 'face') delete newBiometrics.face;
        if (method === 'voice') delete newBiometrics.voice;
        saveBiometrics(newBiometrics);
        showToast(`${method.charAt(0).toUpperCase() + method.slice(1)} biometric deleted.`, 'info');
        setIsDeleting(null);
    };

    const handleVerificationSuccess = () => {
        showToast('Verification Successful!', 'success');
        setVerificationMethod(null);
    };

    const handleVerificationFailure = (reason: string) => {
        showToast(`Verification Failed: ${reason}`, 'error');
        setVerificationMethod(null);
    };

    // Helper functions for liveness strictness slider
    const livenessToValue = (liveness: 'low' | 'medium' | 'high'): string => {
        if (liveness === 'medium') return '1';
        if (liveness === 'high') return '2';
        return '0'; // low
    };

    const handleLivenessChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        let strictness: 'low' | 'medium' | 'high' = 'low';
        if (value === '1') strictness = 'medium';
        if (value === '2') strictness = 'high';
        updateSettings({ livenessStrictness: strictness });
    };


    const DeleteConfirmation: React.FC<{ method: 'face' | 'voice', onCancel: () => void, onConfirm: () => void }> = ({ method, onCancel, onConfirm }) => (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-xl shadow-2xl border border-slate-700 p-6 w-full max-w-sm text-center relative">
                <WarningIcon className="w-12 h-12 mx-auto text-red-400 mb-3" />
                <h3 className="text-xl font-bold text-slate-50">Confirm Deletion</h3>
                <p className="text-slate-300 mt-2">Are you sure you want to delete your {method} biometric data?</p>
                <div className="mt-6 flex justify-center gap-4">
                    <button onClick={onCancel} className="py-2 px-6 bg-slate-600 text-white rounded-lg font-bold">Cancel</button>
                    <button onClick={onConfirm} className="py-2 px-6 bg-red-600 text-white rounded-lg font-bold">Delete</button>
                </div>
            </div>
        </div>
    );
    
    // FIX: Added required `onBack` prop to navigate back to the main view.
    if (view === 'enroll_face') return <EnrollmentView onEnroll={handleFaceEnroll} onBack={() => setView('main')} />;
    // FIX: Added required `onBack` prop to navigate back to the main view.
    if (view === 'enroll_voice') return <VoiceEnrollmentView onEnroll={handleVoiceEnroll} onBack={() => setView('main')} />;

    return (
        <>
        {isDeleting && <DeleteConfirmation method={isDeleting} onCancel={() => setIsDeleting(null)} onConfirm={() => handleDelete(isDeleting)} />}
        {verificationMethod && (
            <BiometricVerificationModal
                method={verificationMethod}
                onSuccess={handleVerificationSuccess}
                onFailure={handleVerificationFailure}
                onClose={() => setVerificationMethod(null)}
            />
        )}
        <div>
            <PageHeader title={t('biometrics_title')} onBack={() => setCurrentPage('dashboard')} />
            {!settings.biometricsConsent ? (
                 <div className="p-4 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/30 text-center">
                    <p>{t('biometrics_consent_needed')}</p>
                    <button onClick={() => setCurrentPage('settings')} className="font-bold underline mt-2">Go to Settings</button>
                </div>
            ) : (
            <div className="space-y-6">
                {/* Face Biometric */}
                <div className="p-4 bg-slate-200 dark:bg-slate-800 rounded-lg">
                    <div className="flex items-center gap-4">
                        <FaceIcon className={`w-8 h-8 ${biometrics?.face ? 'text-sky-400' : 'text-slate-500'}`} />
                        <h3 className="flex-1 text-lg font-bold">{t('biometrics_enroll_face')}</h3>
                        {biometrics?.face && <CheckCircleIcon className="w-6 h-6 text-emerald-500" />}
                    </div>
                    {biometrics?.face ? (
                        <div className="mt-2 text-sm">
                            <p className="text-slate-500 dark:text-slate-400">{t('biometrics_enrolled_on')} {new Date(biometrics.face.enrolledOn).toLocaleDateString()}</p>
                             <div className="flex items-center gap-4 mt-2">
                                <button onClick={() => setVerificationMethod('face')} className="py-1 px-3 bg-sky-500/20 text-sky-400 text-xs font-bold rounded-md hover:bg-sky-500/30">Verify Face</button>
                                <button onClick={() => setIsDeleting('face')} className="py-1 px-3 bg-red-500/10 text-red-400 text-xs font-bold rounded-md hover:bg-red-500/20">{t('biometrics_delete')}</button>
                            </div>
                            <div className="mt-4 pt-4 border-t border-slate-300 dark:border-slate-700">
                                <label htmlFor="liveness" className="block font-medium text-slate-700 dark:text-slate-200">
                                    Verification Strictness
                                </label>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                                    Higher strictness is more secure but may fail in poor lighting.
                                </p>
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-semibold">Low</span>
                                    <input
                                        type="range"
                                        id="liveness"
                                        min="0"
                                        max="2"
                                        step="1"
                                        value={livenessToValue(settings.livenessStrictness)}
                                        onChange={handleLivenessChange}
                                        className="w-full h-2 bg-slate-300 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-500"
                                    />
                                    <span className="text-xs font-semibold">High</span>
                                </div>
                                <p className="text-center text-sm font-medium mt-1 capitalize">{settings.livenessStrictness}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="mt-2 text-sm">
                            <p className="text-slate-500 dark:text-slate-400">{t('biometrics_not_enrolled')}</p>
                            <button onClick={() => setView('enroll_face')} className="mt-2 py-2 px-4 bg-sky-500 text-white font-bold rounded-lg">{t('biometrics_enroll_face')}</button>
                        </div>
                    )}
                </div>
                {/* Voice Biometric */}
                 <div className="p-4 bg-slate-200 dark:bg-slate-800 rounded-lg">
                    <div className="flex items-center gap-4">
                        <MicIcon className={`w-8 h-8 ${biometrics?.voice ? 'text-emerald-400' : 'text-slate-500'}`} />
                        <h3 className="flex-1 text-lg font-bold">{t('biometrics_enroll_voice')}</h3>
                        {biometrics?.voice && <CheckCircleIcon className="w-6 h-6 text-emerald-500" />}
                    </div>
                    {biometrics?.voice ? (
                        <div className="mt-2 text-sm">
                            <p className="text-slate-500 dark:text-slate-400">{t('biometrics_enrolled_on')} {new Date(biometrics.voice.enrolledOn).toLocaleDateString()}</p>
                             <div className="flex items-center gap-4 mt-2">
                                <button onClick={() => setVerificationMethod('voice')} className="py-1 px-3 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-md hover:bg-emerald-500/30">Verify Voice</button>
                                <button onClick={() => setIsDeleting('voice')} className="py-1 px-3 bg-red-500/10 text-red-400 text-xs font-bold rounded-md hover:bg-red-500/20">{t('biometrics_delete')}</button>
                            </div>
                        </div>
                    ) : (
                        <div className="mt-2 text-sm">
                            <p className="text-slate-500 dark:text-slate-400">{t('biometrics_not_enrolled')}</p>
                            <button onClick={() => setView('enroll_voice')} className="mt-2 py-2 px-4 bg-emerald-500 text-white font-bold rounded-lg">{t('biometrics_enroll_voice')}</button>
                        </div>
                    )}
                </div>
            </div>
            )}
        </div>
        </>
    );
};

export default BiometricsPage;
