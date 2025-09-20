import React, { useState, useRef, useEffect } from 'react';
import { SecurityEvent } from '../../types';
import { getFullFaceDetection, compareDescriptors } from './FaceApi';
import { getVoiceFeatures, compareVoiceFeatures } from './VoiceApi';
import { InfoIcon, WarningIcon, CheckCircleIcon, SignOutIcon, MicIcon, CloseIcon, KeyIcon } from '../icons/Icons';

declare const faceapi: any;

interface VerificationViewProps {
    method: 'face' | 'voice';
    enrolledDescriptor?: Float32Array;
    enrolledFeatures?: number[];
    addLogEntry: (event: Omit<SecurityEvent, 'id' | 'timestamp'>) => void;
    onReset: () => void;
}

type VerificationStatus = 'idle' | 'pending' | 'success' | 'failed';
const VOICE_VERIFICATION_THRESHOLD = 0.2; // Lower is a stricter match for voice
const ANOMALY_THRESHOLD = 50000; // Transactions over this amount require verification
const MOCK_OTP = '123456';
const LOCAL_STORAGE_KEY_FACE_THRESHOLD = 'safi_face_threshold';
const DEFAULT_FACE_THRESHOLD = 0.45;

const VerificationView: React.FC<VerificationViewProps> = ({ method, enrolledDescriptor, enrolledFeatures, addLogEntry, onReset }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const verificationIntervalRef = useRef<number | null>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    
    const [recipient, setRecipient] = useState('254712345678');
    const [amount, setAmount] = useState('65000');
    const [recipientError, setRecipientError] = useState<string | null>(null);
    const [amountError, setAmountError] = useState<string | null>(null);

    const [isVerifying, setIsVerifying] = useState(false);
    const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>('idle');
    const [verificationMessage, setVerificationMessage] = useState('');
    const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    
    const [faceThreshold, setFaceThreshold] = useState<number>(() => {
        if (typeof window !== 'undefined') {
            const savedThreshold = localStorage.getItem(LOCAL_STORAGE_KEY_FACE_THRESHOLD);
            return savedThreshold ? parseFloat(savedThreshold) : DEFAULT_FACE_THRESHOLD;
        }
        return DEFAULT_FACE_THRESHOLD;
    });

    const [otpState, setOtpState] = useState<{
        active: boolean;
        otp: string;
        status: 'pending' | 'success' | 'failed' | 'idle';
        message: string;
    }>({ active: false, otp: '', status: 'idle', message: '' });

    const handleThresholdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newThreshold = parseFloat(e.target.value);
        setFaceThreshold(newThreshold);
        localStorage.setItem(LOCAL_STORAGE_KEY_FACE_THRESHOLD, newThreshold.toString());
    };

    const showFeedback = (message: string, type: 'success' | 'error') => {
        setFeedback({ message, type });
        setTimeout(() => {
            setFeedback(null);
        }, 3000);
    };

    // Start/Stop media stream when verification begins/ends
    useEffect(() => {
        if (!isVerifying) {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
                setStream(null);
            }
            return;
        }

        const startMedia = async () => {
            try {
                const constraints = method === 'face' ? { video: { facingMode: 'user' } } : { audio: true };
                const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
                setStream(mediaStream);
                if (method === 'face' && videoRef.current) {
                    videoRef.current.srcObject = mediaStream;
                }
            } catch (err) {
                setVerificationStatus('failed');
                setVerificationMessage(`${method === 'face' ? 'Camera' : 'Microphone'} access denied.`);
            }
        };
        startMedia();
        
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        }
    }, [isVerifying, method]);
    
    // Main verification logic loop
    useEffect(() => {
        if (!stream) return;

        let isFinalized = false;
        let verificationTimeout: number;
        
        const finalizeVerification = (status: 'success' | 'failed', message: string, logDetails: Omit<SecurityEvent, 'id' | 'timestamp'>) => {
            isFinalized = true;
            if (verificationIntervalRef.current) clearInterval(verificationIntervalRef.current);
            clearTimeout(verificationTimeout);

            setVerificationStatus(status);
            setVerificationMessage(message);
            addLogEntry(logDetails);

            setTimeout(() => {
                setIsVerifying(false);
                const canvas = canvasRef.current;
                if(canvas) {
                    const ctx = canvas.getContext('2d');
                    ctx?.clearRect(0, 0, canvas.width, canvas.height);
                }
                showFeedback(
                    status === 'success' ? 'Transaction Successful!' : 'Transaction Blocked.',
                    status === 'success' ? 'success' : 'error'
                );
            }, 3000);
        };

        const onPlay = () => {
             if (canvasRef.current && videoRef.current && videoRef.current.videoWidth > 0) {
                const displaySize = { width: videoRef.current.clientWidth, height: videoRef.current.clientHeight };
                faceapi.matchDimensions(canvasRef.current, displaySize);
            }
        };

        if (method === 'face' && videoRef.current && enrolledDescriptor) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            
            video.addEventListener('play', onPlay);
            if (video.readyState >= 3) onPlay();

            const runDetection = async () => {
                if (isFinalized || !videoRef.current) return;
                
                const detection = await getFullFaceDetection(video);
                
                if (detection && canvas) {
                    const distance = compareDescriptors(enrolledDescriptor, detection.descriptor);
                    const resizedDetection = faceapi.resizeResults(detection, { width: canvas.width, height: canvas.height });

                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                        const { box } = resizedDetection.detection;
                        const isMatch = distance < faceThreshold;
                        const boxColor = isMatch ? '#10B981' : '#F59E0B';
                        ctx.strokeStyle = boxColor;
                        ctx.lineWidth = 4;

                        // Flip the x-coordinate for the mirrored video feed
                        const mirroredX = canvas.width - (box.x + box.width);
                        ctx.strokeRect(mirroredX, box.y, box.width, box.height);

                        const confidencePercent = Math.max(0, Math.min(100, (1 - (distance / (faceThreshold * 1.5))) * 100)).toFixed(0);
                        const text = isMatch ? `Match: ${confidencePercent}%` : `Scanning... ${confidencePercent}%`;
                        ctx.fillStyle = boxColor;
                        ctx.font = 'bold 18px Inter, sans-serif';
                        ctx.fillText(text, mirroredX, box.y > 20 ? box.y - 10 : box.y + box.height + 20);
                    }
                    
                    if (distance < faceThreshold) {
                        finalizeVerification('success', `Face verification successful!`, {
                            type: 'VerificationSuccess',
                            description: `Transaction of KES ${amount} to ${recipient} approved.`,
                            details: { amount: Number(amount), recipient, matchConfidence: distance }
                        });
                    }
                } else if(canvas) {
                    const ctx = canvas.getContext('2d');
                    ctx?.clearRect(0, 0, canvas.width, canvas.height);
                }
            };

            setVerificationStatus('pending');
            setVerificationMessage('Detecting face...');
            verificationIntervalRef.current = window.setInterval(runDetection, 300);
            
            verificationTimeout = window.setTimeout(() => {
                if (!isFinalized) {
                    finalizeVerification('failed', `Verification timed out. Could not find a match.`, {
                        type: 'VerificationFailure',
                        description: 'Verification timed out.',
                        details: { amount: Number(amount), recipient }
                    });
                }
            }, 8000);

        } else if (method === 'voice' && enrolledFeatures) {
            
            const runVoiceVerification = async () => {
                setVerificationStatus('pending');
                setVerificationMessage('Say "My voice is my password" now...');
                
                const currentFeatures = await getVoiceFeatures(stream, 3);
                
                if (isFinalized) return;

                if (currentFeatures) {
                    const distance = compareVoiceFeatures(enrolledFeatures, currentFeatures);
                    const isMatch = distance < VOICE_VERIFICATION_THRESHOLD;
                    if (isMatch) {
                        finalizeVerification('success', 'Voice verification successful!', {
                            type: 'VoiceVerificationSuccess',
                            description: `Transaction of KES ${amount} to ${recipient} approved.`,
                            details: { amount: Number(amount), recipient, matchConfidence: distance }
                        });
                    } else {
                        finalizeVerification('failed', `Match score is below the required threshold.`, {
                            type: 'VoiceVerificationFailure',
                            description: 'Voice mismatch detected.',
                            details: { amount: Number(amount), recipient, matchConfidence: distance }
                        });
                    }
                } else {
                     finalizeVerification('failed', `Could not hear speech. Please try again.`, {
                        type: 'VoiceVerificationFailure',
                        description: 'No speech detected during verification.',
                        details: { amount: Number(amount), recipient }
                    });
                }
            };
            runVoiceVerification();
        }

        return () => {
            isFinalized = true;
            if (verificationIntervalRef.current) clearInterval(verificationIntervalRef.current);
            clearTimeout(verificationTimeout);
            if (method === 'face' && videoRef.current) {
                videoRef.current.removeEventListener('play', onPlay);
            }
        };
    }, [stream, method, enrolledDescriptor, enrolledFeatures, addLogEntry, amount, recipient, faceThreshold]);

    const validateTransactionDetails = () => {
        setRecipientError(null);
        setAmountError(null);
        let isValid = true;
        if (!recipient.trim()) {
            setRecipientError('Recipient phone number is required.');
            isValid = false;
        }
        const numAmount = Number(amount);
        if (!amount || isNaN(numAmount) || numAmount <= 0) {
            setAmountError('Please enter a valid, positive amount.');
            isValid = false;
        }
        if (!isValid) {
            setTimeout(() => {
                setRecipientError(null);
                setAmountError(null);
            }, 2500);
        }
        return isValid;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateTransactionDetails()) {
            return;
        }

        const numAmount = Number(amount);

        if (numAmount > ANOMALY_THRESHOLD) {
            addLogEntry({ type: 'AnomalyDetected', description: `High-value transaction initiated. Requiring ${method} verification.`, details: { amount: numAmount, recipient, reason: `Amount > ${ANOMALY_THRESHOLD}` }});
            setIsVerifying(true);
        } else {
            addLogEntry({ type: 'VerificationSuccess', description: `Low-value transaction of KES ${numAmount} auto-approved.`, details: { amount: numAmount, recipient, reason: 'Low-value transaction' }});
            showFeedback('Transaction Successful!', 'success');
        }
    }
    
    const handleInitiateOtp = () => {
        if (!validateTransactionDetails()) {
            return;
        }
        addLogEntry({
            type: 'OtpInitiated',
            description: `OTP link sent for transaction of KES ${amount} to ${recipient}.`,
            details: { amount: Number(amount), recipient, method: 'OTP' }
        });
        setOtpState({
            active: true,
            otp: '',
            status: 'pending',
            message: 'Awaiting OTP from user...'
        });
    };

    const handleOtpSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const isSuccess = otpState.otp === MOCK_OTP;

        if (isSuccess) {
            setOtpState(prev => ({ ...prev, status: 'success', message: 'OTP Verified! Transaction Approved.' }));
            addLogEntry({
                type: 'OtpSuccess',
                description: `Transaction approved via OTP verification.`,
                details: { amount: Number(amount), recipient, method: 'OTP' }
            });
        } else {
            setOtpState(prev => ({ ...prev, status: 'failed', message: 'Incorrect OTP. Transaction Blocked.' }));
            const logDescription = 'Transaction blocked due to incorrect OTP. Flagged for possible phishing or brute force attempt.';
            const logDetails: SecurityEvent['details'] = { amount: Number(amount), recipient, method: 'OTP' };
            addLogEntry({
                type: 'OtpFailure',
                description: logDescription,
                details: logDetails
            });
            console.warn(`SECURITY ALERT: ${logDescription}`, logDetails);
        }
        
        setTimeout(() => {
            setOtpState({ active: false, otp: '', status: 'idle', message: '' });
            showFeedback(
                isSuccess ? 'Transaction Successful!' : 'Transaction Blocked.',
                isSuccess ? 'success' : 'error'
            );
        }, 3000);
    };

    const handleCloseOtp = () => {
        setOtpState({ active: false, otp: '', status: 'idle', message: '' });
    };


    const baseInputClasses = "block w-full px-3 py-2 bg-slate-800/50 border border-slate-600 rounded-md shadow-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-sky-500 sm:text-sm transition-colors duration-200";

    const VerificationModal = () => {
        const getStatusProps = () => {
            switch (verificationStatus) {
                case 'success':
                    return {
                        Icon: CheckCircleIcon,
                        colorClasses: 'text-emerald-300 border-emerald-500',
                        title: 'Transaction Approved',
                    };
                case 'failed':
                    return {
                        Icon: WarningIcon,
                        colorClasses: 'text-red-300 border-red-500',
                        title: 'Fraud Alert! Transaction Blocked',
                    };
                case 'pending':
                default:
                    return {
                        Icon: null,
                        colorClasses: 'text-sky-300 border-sky-500',
                        title: 'Biometric Verification...',
                    };
            }
        };
    
        const { Icon, colorClasses, title } = getStatusProps();
        const textColorClass = colorClasses.split(' ')[0];
    
        return (
            <div className="bg-slate-900/30 backdrop-blur-lg border border-slate-100/20 rounded-xl shadow-2xl p-6 text-center">
                <h2 className={`text-2xl font-bold font-heading mb-4 ${textColorClass}`}>
                    {title}
                </h2>
                <div className={`relative w-full max-w-sm mx-auto aspect-square bg-slate-800 rounded-lg overflow-hidden border-2 ${colorClasses} flex items-center justify-center`}>
                    {method === 'face' ? (
                        <>
                            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
                            <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" />
                            {Icon && (verificationStatus === 'success' || verificationStatus === 'failed') && (
                                 <div className="absolute inset-0 bg-slate-900/70 flex items-center justify-center backdrop-blur-sm">
                                    <Icon className={`w-32 h-32 ${textColorClass}`} />
                                 </div>
                            )}
                        </>
                    ): (
                        <div className="flex flex-col items-center justify-center gap-4 p-4">
                            {verificationStatus === 'pending' ? (
                                <MicIcon className="w-24 h-24 text-sky-300 animate-pulse" />
                            ) : (
                                Icon && <Icon className={`w-32 h-32 ${textColorClass}`} />
                            )}
                        </div>
                    )}
                </div>
                <div className="mt-4 text-lg h-16 flex flex-col items-center justify-center">
                    <p className={`mt-1 text-base ${verificationStatus !== 'pending' ? textColorClass : 'text-slate-300'}`}>{verificationMessage}</p>
                </div>
            </div>
        );
    };

    const OtpModal = () => {
        const isFinished = otpState.status === 'success' || otpState.status === 'failed';

        return (
            <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" aria-modal="true">
                <div className="bg-slate-800 rounded-xl shadow-2xl border border-slate-700 p-6 w-full max-w-sm text-center relative">
                    <button onClick={handleCloseOtp} className="absolute top-2 right-2 p-1 rounded-full hover:bg-slate-700">
                        <CloseIcon className="w-5 h-5 text-slate-400"/>
                    </button>
                    <KeyIcon className="w-12 h-12 mx-auto text-sky-400 mb-3" />
                    <h3 className="text-xl font-bold text-slate-50">OTP Verification</h3>
                    
                    {isFinished ? (
                         <div className="mt-4">
                            <div className={`p-4 rounded-lg ${otpState.status === 'success' ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                                {otpState.status === 'success' ? 
                                    <CheckCircleIcon className="w-12 h-12 text-emerald-400 mx-auto" /> : 
                                    <WarningIcon className="w-12 h-12 text-red-400 mx-auto" />}
                                <p className={`mt-2 font-semibold ${otpState.status === 'success' ? 'text-emerald-300' : 'text-red-300'}`}>
                                    {otpState.message}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <>
                        <p className="text-slate-400 text-sm mt-1">A secure link with an OTP has been sent. Enter the 6-digit code below.</p>
                        <form onSubmit={handleOtpSubmit} className="mt-4 space-y-4">
                            <input
                                type="text"
                                value={otpState.otp}
                                onChange={e => setOtpState(prev => ({...prev, otp: e.target.value.replace(/\D/g, '')}))}
                                placeholder="------"
                                maxLength={6}
                                required
                                className="w-48 mx-auto block text-center px-3 py-2 bg-slate-700 border border-slate-600 rounded-md shadow-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-sky-500 focus:border-sky-500 text-2xl font-mono tracking-[0.5em]"
                            />
                            <button type="submit" className="w-full py-2 px-4 bg-sky-500 text-white rounded-lg font-bold hover:bg-sky-600 transition-colors">
                                Verify OTP
                            </button>
                        </form>
                        </>
                    )}
                </div>
            </div>
        );
    };

    if (isVerifying) {
        return <VerificationModal />;
    }
    
    return (
        <>
        {otpState.active && <OtpModal />}
        <div className="bg-slate-900/30 backdrop-blur-lg border border-slate-100/20 rounded-xl shadow-2xl p-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold font-heading text-slate-50 flex items-center gap-2">
                    <CheckCircleIcon className="w-8 h-8 text-emerald-400" /> {method === 'face' ? 'Face' : 'Voice'} Biometric Enrolled
                </h2>
                <button onClick={onReset} className="text-xs flex items-center gap-1 text-slate-400 hover:text-red-400 transition-colors">
                    <SignOutIcon className="w-4 h-4" /> Reset Enrollment
                </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="recipient" className="block text-sm font-medium text-slate-300 mb-1">Recipient Phone</label>
                    <input 
                        type="text" 
                        id="recipient" 
                        value={recipient} 
                        onChange={e => setRecipient(e.target.value)} 
                        required 
                        className={`${baseInputClasses} ${recipientError ? 'border-red-500 ring-1 ring-red-500/50' : 'focus:border-sky-500'}`}
                        aria-invalid={!!recipientError}
                        aria-describedby="recipient-error"
                    />
                    {recipientError && <p id="recipient-error" className="text-xs text-red-400 mt-1">{recipientError}</p>}
                </div>
                 <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-slate-300 mb-1">Amount (KES)</label>
                    <input 
                        type="number" 
                        id="amount" 
                        value={amount} 
                        onChange={e => setAmount(e.target.value)} 
                        required 
                        className={`${baseInputClasses} ${amountError ? 'border-red-500 ring-1 ring-red-500/50' : 'focus:border-sky-500'}`}
                        aria-invalid={!!amountError}
                        aria-describedby="amount-error"
                    />
                    {amountError && <p id="amount-error" className="text-xs text-red-400 mt-1">{amountError}</p>}
                </div>

                {method === 'face' && (
                    <div>
                        <label htmlFor="threshold" className="block text-sm font-medium text-slate-300 mb-1">
                            Face Verification Sensitivity (Current: {faceThreshold.toFixed(2)})
                        </label>
                        <div className="flex items-center gap-3">
                            <span className="text-xs text-slate-400">Strict</span>
                            <input
                                type="range"
                                id="threshold"
                                min="0.3"
                                max="0.6"
                                step="0.01"
                                value={faceThreshold}
                                onChange={handleThresholdChange}
                                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                            />
                            <span className="text-xs text-slate-400">Lenient</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">Lower value is a stricter match. Adjust if you have trouble verifying.</p>
                    </div>
                )}

                <div className="pt-2">
                    <button type="submit" className="w-full py-3 px-4 bg-emerald-500 text-white rounded-lg font-bold hover:bg-emerald-600 transition-colors">Send Money Securely</button>
                </div>
            </form>

            <div className="mt-6 pt-4 border-t border-slate-700/50 text-center">
                 <h4 className="font-semibold text-slate-100 flex items-center justify-center gap-2 mb-2"><InfoIcon className="w-5 h-5"/> Can't use biometrics?</h4>
                 <button onClick={handleInitiateOtp} className="text-sm font-medium text-sky-400 hover:text-sky-300 transition-colors hover:underline">
                    Send OTP Link as Fallback
                 </button>
            </div>
        </div>

        {feedback && (
            <div 
                className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 py-3 px-6 rounded-full text-white font-semibold shadow-lg backdrop-blur-sm ${feedback.type === 'success' ? 'bg-emerald-500/90 border-emerald-300' : 'bg-red-500/90 border-red-300'} border`}
            >
                {feedback.type === 'success' ? <CheckCircleIcon className="w-6 h-6" /> : <WarningIcon className="w-6 h-6" />}
                <span>{feedback.message}</span>
            </div>
        )}
        </>
    );
};

export default VerificationView;