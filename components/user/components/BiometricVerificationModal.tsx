import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useUser } from '../hooks/useUser';
import * as faceApi from '../../OfflineVerify/FaceApi';
import { getVoiceFeatures, compareVoiceFeatures } from '../../OfflineVerify/VoiceApi';
import AudioWaveform from './AudioWaveform';
import { FaceIcon, MicIcon, WarningIcon, CheckCircleIcon, CloseIcon } from '../../icons/Icons';

declare const faceapi: any;

interface BiometricVerificationModalProps {
    method: 'face' | 'voice';
    onSuccess: () => void;
    onFailure: (reason: string) => void;
    onClose: () => void;
}

type VerificationStatus = 'idle' | 'pending' | 'success' | 'failed';

const BiometricVerificationModal: React.FC<BiometricVerificationModalProps> = ({ method, onSuccess, onFailure, onClose }) => {
    const { biometrics, settings } = useUser();
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [status, setStatus] = useState<VerificationStatus>('pending');
    const [message, setMessage] = useState('Initializing...');
    const [stream, setStream] = useState<MediaStream | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const animationFrameRef = useRef<number | null>(null);

    const faceThresholds = {
        low: 0.5,
        medium: 0.45,
        high: 0.4,
    };
    const faceVerificationThreshold = faceThresholds[settings.livenessStrictness];

    const stopAudioMonitoring = useCallback(() => {
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            audioContextRef.current.close().catch(e => console.warn("Error closing AudioContext:", e));
            audioContextRef.current = null;
        }
    }, []);

    const finalize = useCallback((isSuccess: boolean, msg: string, reason?: string) => {
        setStatus(isSuccess ? 'success' : 'failed');
        setMessage(msg);
        stopAudioMonitoring();
        setTimeout(() => {
            if (isSuccess) onSuccess();
            else onFailure(reason || msg);
        }, 1500);
    }, [onSuccess, onFailure, stopAudioMonitoring]);

    useEffect(() => {
        let isMounted = true;
        const startMedia = async () => {
            try {
                const constraints = method === 'face' ? { video: { facingMode: 'user' } } : { audio: true };
                const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
                if (isMounted) {
                    setStream(mediaStream);
                    if (method === 'face' && videoRef.current) {
                        videoRef.current.srcObject = mediaStream;
                    }
                } else {
                    mediaStream.getTracks().forEach(track => track.stop());
                }
            } catch (err) {
                 if(isMounted) finalize(false, `${method === 'face' ? 'Camera' : 'Mic'} access denied.`);
            }
        };
        startMedia();
        return () => {
            isMounted = false;
            stream?.getTracks().forEach(track => track.stop());
            stopAudioMonitoring();
        }
    }, [method, finalize, stream, stopAudioMonitoring]);
    
    useEffect(() => {
        if (!stream || status !== 'pending') return;
        
        let verificationInterval: number;
        let timeout: number;
        let isFinalized = false;

        const onPlay = () => {
             if (canvasRef.current && videoRef.current) {
                const displaySize = { width: videoRef.current.clientWidth, height: videoRef.current.clientHeight };
                faceapi.matchDimensions(canvasRef.current, displaySize);
            }
        };

        if (method === 'face' && videoRef.current && canvasRef.current && biometrics?.face) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            const enrolledDescriptor = new Float32Array(Object.values(biometrics.face.descriptor));
            
            video.addEventListener('play', onPlay);
            if (video.readyState >= 3) onPlay();
            
            const runDetection = async () => {
                if(isFinalized || !videoRef.current || !canvasRef.current) return;

                const detection = await faceApi.getFullFaceDetection(video);
                const ctx = canvasRef.current.getContext('2d');
                if(!ctx) return;
                
                ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

                if (detection) {
                    const { score, box } = detection.detection;
                    const MIN_CONFIDENCE = 0.8;
                    const MIN_BOX_SIZE_RATIO = 0.25;
                    const MAX_BOX_SIZE_RATIO = 0.6;
                    const CENTER_TOLERANCE = 0.2;
                    const boxWidthRatio = box.width / canvas.width;
                    const boxCenterX = box.x + box.width / 2;
                    const canvasCenterX = canvas.width / 2;
                    const centerOffset = Math.abs(boxCenterX - canvasCenterX) / canvas.width;
                    let boxColor = '#F59E0B'; // Amber

                    if (score < MIN_CONFIDENCE) {
                        setMessage("Poor lighting detected.");
                        boxColor = '#EF4444'; // Red
                    } else if (boxWidthRatio < MIN_BOX_SIZE_RATIO) {
                        setMessage("Move slightly closer.");
                    } else if (boxWidthRatio > MAX_BOX_SIZE_RATIO) {
                        setMessage("Move slightly further away.");
                    } else if (centerOffset > CENTER_TOLERANCE) {
                        setMessage("Please center your face.");
                    } else {
                        boxColor = '#10B981'; // Green
                        const distance = faceApi.compareDescriptors(enrolledDescriptor, detection.descriptor);
                        const isMatch = distance < faceVerificationThreshold;

                        if (isMatch) {
                            isFinalized = true;
                            finalize(true, 'Face verified successfully.');
                        } else {
                            setMessage('Hold still...');
                        }
                    }

                    const resizedDetection = faceapi.resizeResults(detection, { width: canvasRef.current.width, height: canvasRef.current.height });
                    const { box: resizedBox } = resizedDetection.detection;
                    const mirroredX = canvasRef.current.width - (resizedBox.x + resizedBox.width);
                    ctx.strokeStyle = boxColor;
                    ctx.lineWidth = 4;
                    ctx.strokeRect(mirroredX, resizedBox.y, resizedBox.width, resizedBox.height);
                } else {
                    setMessage('No face detected.');
                }
            };

            setMessage('Position your face in the camera.');
            verificationInterval = window.setInterval(runDetection, 300);
            timeout = window.setTimeout(() => {
                if(!isFinalized) finalize(false, 'Verification timed out.', 'Timeout');
            }, 8000);
        } else if (method === 'voice' && biometrics?.voice) {
             const startAudioMonitoring = () => {
                const audioContext = new AudioContext();
                const analyser = audioContext.createAnalyser();
                const source = audioContext.createMediaStreamSource(stream);
                analyser.fftSize = 256;
                source.connect(analyser);
                audioContextRef.current = audioContext;
                const dataArray = new Uint8Array(analyser.frequencyBinCount);

                const monitor = () => {
                    animationFrameRef.current = requestAnimationFrame(monitor);
                    analyser.getByteTimeDomainData(dataArray);
                    const avg = dataArray.reduce((acc, val) => acc + Math.abs(val - 128), 0) / dataArray.length;
                    if (avg < 1.5) setMessage("Speak a bit louder.");
                    else setMessage("Sound level is good.");
                };
                monitor();
             };

             const runVoiceVerification = async () => {
                setMessage('Say "My voice is my password"');
                startAudioMonitoring();
                const currentFeatures = await getVoiceFeatures(stream, 3);
                if(isFinalized) return;
                if (currentFeatures) {
                    const distance = compareVoiceFeatures(biometrics.voice!.descriptor, currentFeatures);
                    if (distance < 0.2) {
                        finalize(true, 'Voice verified successfully.');
                    } else {
                        finalize(false, 'Voice did not match.', 'Mismatch');
                    }
                } else {
                     finalize(false, 'Could not hear speech.', 'NoSpeechDetected');
                }
            };
            runVoiceVerification();
        } else {
             finalize(false, 'Biometric data not found.', 'NoTemplate');
        }

        return () => {
            isFinalized = true;
            clearInterval(verificationInterval);
            clearTimeout(timeout);
            stopAudioMonitoring();
            if (method === 'face' && videoRef.current) videoRef.current.removeEventListener('play', onPlay);
        }
    }, [stream, method, biometrics, finalize, status, faceVerificationThreshold, stopAudioMonitoring]);

    const statusIcon = {
        pending: null,
        success: <CheckCircleIcon className="w-24 h-24 text-emerald-400" />,
        failed: <WarningIcon className="w-24 h-24 text-red-400" />,
        idle: null,
    };
    
    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" aria-modal="true">
            <div className="bg-slate-800 rounded-xl shadow-2xl border border-slate-700 p-6 w-full max-w-sm text-center relative">
                <button onClick={onClose} className="absolute top-2 right-2 p-1 rounded-full hover:bg-slate-700">
                    <CloseIcon className="w-5 h-5 text-slate-400"/>
                </button>
                <h3 className="text-xl font-bold text-slate-50 mb-2">Biometric Verification</h3>
                <div className="relative w-full aspect-square bg-slate-700 rounded-lg overflow-hidden flex items-center justify-center my-4">
                    {method === 'face' ? (
                        <>
                            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
                            <canvas ref={canvasRef} className="absolute inset-0" />
                        </>
                    ) : (
                         status === 'pending' && <AudioWaveform stream={stream} />
                    )}
                    {status !== 'pending' && (
                        <div className="absolute inset-0 bg-slate-800/70 flex items-center justify-center">
                            {statusIcon[status]}
                        </div>
                    )}
                </div>
                <p className="text-slate-300 h-10 flex items-center justify-center">{message}</p>
            </div>
        </div>
    );
};

export default BiometricVerificationModal;