import React, { useState, useEffect, useCallback } from 'react';
import { SecurityEvent } from '../../types';
import { loadModels } from '../OfflineVerify/FaceApi';
import BiometricSelector from '../OfflineVerify/BiometricSelector';
import EnrollmentView from '../OfflineVerify/EnrollmentView';
import VoiceEnrollmentView from '../OfflineVerify/VoiceEnrollmentView';
import VerificationView from '../OfflineVerify/VerificationView';
import EventLog from '../OfflineVerify/EventLog';
import ResetConfirmationModal from '../OfflineVerify/ResetConfirmationModal';
import { InfoIcon } from '../icons/Icons';
import ActionSelector from '../OfflineVerify/ActionSelector';

type View = 'select_method' | 'select_action' | 'enrolling_face' | 'enrolling_voice' | 'verifying';

const OfflineVerify: React.FC = () => {
    const [modelsLoaded, setModelsLoaded] = useState(false);
    const [modelsError, setModelsError] = useState<string | null>(null);
    const [enrolledFace, setEnrolledFace] = useState<Float32Array | null>(null);
    const [enrolledVoice, setEnrolledVoice] = useState<number[] | null>(null);
    const [securityLog, setSecurityLog] = useState<SecurityEvent[]>([]);
    const [resetConfirmation, setResetConfirmation] = useState<'face' | 'voice' | null>(null);

    // New state management for UI flow
    const [view, setView] = useState<View>('select_method');
    const [selectedMethod, setSelectedMethod] = useState<'face' | 'voice' | null>(null);

    useEffect(() => {
        const initialize = async () => {
            try {
                // Preload data from localStorage immediately for a faster UI response
                const savedFaceJson = localStorage.getItem('safi_face_descriptor');
                if (savedFaceJson) {
                    setEnrolledFace(new Float32Array(Object.values(JSON.parse(savedFaceJson))));
                }
                const savedVoiceJson = localStorage.getItem('safi_voice_features');
                if (savedVoiceJson) {
                    setEnrolledVoice(JSON.parse(savedVoiceJson));
                }
                const savedLogJson = localStorage.getItem('safi_security_log');
                if (savedLogJson) {
                    const parsedLog = JSON.parse(savedLogJson).map((event: any) => ({...event, timestamp: new Date(event.timestamp)}));
                    setSecurityLog(parsedLog);
                }

                // Then, load the models
                await loadModels();
                setModelsLoaded(true);
            } catch (error: any) {
                setModelsError(error.message || "Failed to load biometric models.");
            }
        };
        initialize();
    }, []);

    const addLogEntry = useCallback((event: Omit<SecurityEvent, 'id' | 'timestamp'>) => {
        setSecurityLog(prevLog => {
            const newLog = [{ ...event, id: `evt_${Date.now()}`, timestamp: new Date() }, ...prevLog].slice(0, 100);
            localStorage.setItem('safi_security_log', JSON.stringify(newLog));
            return newLog;
        });
    }, []);

    const handleFaceEnroll = (descriptor: Float32Array) => {
        setEnrolledFace(descriptor);
        localStorage.setItem('safi_face_descriptor', JSON.stringify(Array.from(descriptor)));
        addLogEntry({ type: 'EnrollmentSuccess', description: 'User successfully enrolled their face biometric.', details: {} });
        setView('select_action');
    };

    const handleVoiceEnroll = (features: number[]) => {
        setEnrolledVoice(features);
        localStorage.setItem('safi_voice_features', JSON.stringify(features));
        addLogEntry({ type: 'VoiceEnrollmentSuccess', description: 'User successfully enrolled their voice biometric.', details: {} });
        setView('select_action');
    };

    const handleRequestReset = (method: 'face' | 'voice') => {
        setResetConfirmation(method);
    };

    const performReset = (method: 'face' | 'voice') => {
        if (method === 'face') {
            setEnrolledFace(null);
            localStorage.removeItem('safi_face_descriptor');
        } else {
            setEnrolledVoice(null);
            localStorage.removeItem('safi_voice_features');
        }
        setSecurityLog([]); // Optionally clear logs on reset
        localStorage.removeItem('safi_security_log');
        setResetConfirmation(null); // Close modal
        setView('select_action'); // Go back to action selection
    };
    
    const handleMethodSelect = (method: 'face' | 'voice') => {
        setSelectedMethod(method);
        setView('select_action');
    };

    const renderMainContent = () => {
        switch (view) {
            case 'select_method': 
                return <BiometricSelector onSelect={handleMethodSelect} modelsLoaded={modelsLoaded} modelsError={modelsError} />;
            case 'select_action':
                if (!selectedMethod) {
                    setView('select_method');
                    return null;
                }
                return <ActionSelector
                    method={selectedMethod}
                    isEnrolled={selectedMethod === 'face' ? !!enrolledFace : !!enrolledVoice}
                    onEnrollClick={() => setView(selectedMethod === 'face' ? 'enrolling_face' : 'enrolling_voice')}
                    onVerifyClick={() => setView('verifying')}
                    onBackClick={() => { setSelectedMethod(null); setView('select_method'); }}
                />;
            case 'enrolling_face': 
                return <EnrollmentView onEnroll={handleFaceEnroll} onBack={() => setView('select_action')} />;
            case 'enrolling_voice': 
                return <VoiceEnrollmentView onEnroll={handleVoiceEnroll} onBack={() => setView('select_action')} />;
            case 'verifying':
                if (!selectedMethod) {
                    setView('select_method');
                    return null;
                }
                return <VerificationView 
                    method={selectedMethod} 
                    enrolledDescriptor={selectedMethod === 'face' ? enrolledFace! : undefined}
                    enrolledFeatures={selectedMethod === 'voice' ? enrolledVoice! : undefined}
                    addLogEntry={addLogEntry} 
                    onReset={() => handleRequestReset(selectedMethod)} 
                />;
            default: return null;
        }
    };

    return (
        <div className="space-y-6">
             <div>
                <h1 className="text-3xl font-bold font-heading text-slate-50">Offline Face-to-Phone Verification</h1>
                <p className="text-slate-300 flex items-center gap-2"><InfoIcon className="w-5 h-5"/> All biometric processing and logging happens entirely on your device.</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">{renderMainContent()}</div>
                <div className="lg:col-span-1"><EventLog events={securityLog} /></div>
            </div>

            {resetConfirmation && (
                <ResetConfirmationModal
                    method={resetConfirmation}
                    onConfirm={() => performReset(resetConfirmation)}
                    onCancel={() => setResetConfirmation(null)}
                />
            )}
        </div>
    );
};

export default OfflineVerify;
