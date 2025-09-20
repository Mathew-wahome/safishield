import React, { useRef, useEffect, useState, useCallback } from 'react';
import { getFullFaceDetection, getFaceDescriptor } from './FaceApi';
import { FaceIcon, WarningIcon, CheckCircleIcon } from '../icons/Icons';

declare const faceapi: any;

interface EnrollmentViewProps {
    onEnroll: (descriptor: Float32Array) => void;
    onBack: () => void;
}

type FeedbackState = {
    message: string;
    type: 'info' | 'error' | 'success' | 'warning';
    boxColor: string;
};

const EnrollmentView: React.FC<EnrollmentViewProps> = ({ onEnroll, onBack }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const detectionInterval = useRef<number | null>(null);
    const [isCapturing, setIsCapturing] = useState(false);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [feedback, setFeedback] = useState<FeedbackState>({
        message: 'Initializing camera...',
        type: 'info',
        boxColor: '#64748B', // slate-500
    });
    const [isFaceReady, setIsFaceReady] = useState(false);

    const stopAllStreams = useCallback(() => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        if (detectionInterval.current) {
            clearInterval(detectionInterval.current);
            detectionInterval.current = null;
        }
    }, [stream]);

    useEffect(() => {
        const startCamera = async () => {
            try {
                if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                    const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
                    setStream(mediaStream);
                    if (videoRef.current) {
                        videoRef.current.srcObject = mediaStream;
                    }
                } else {
                    setFeedback({ message: "Camera not supported on this device.", type: 'error', boxColor: '#EF4444' });
                }
            } catch (err) {
                setFeedback({ message: "Camera permission denied. Please enable camera access in your browser settings.", type: 'error', boxColor: '#EF4444' });
                console.error(err);
            }
        };
        startCamera();

        return () => {
            stopAllStreams();
        };
    }, [stopAllStreams]);

    const runDetection = useCallback(async () => {
        if (!videoRef.current || !canvasRef.current || isCapturing) return;
        const video = videoRef.current;
        const canvas = canvasRef.current;
        
        const detection = await getFullFaceDetection(video);
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

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

            let newFeedback: FeedbackState;

            if (score < MIN_CONFIDENCE) {
                newFeedback = { message: "Poor quality. Check lighting.", type: 'warning', boxColor: '#EF4444' }; // red-500
                setIsFaceReady(false);
            } else if (boxWidthRatio < MIN_BOX_SIZE_RATIO) {
                newFeedback = { message: "Move slightly closer.", type: 'info', boxColor: '#F59E0B' }; // amber-500
                setIsFaceReady(false);
            } else if (boxWidthRatio > MAX_BOX_SIZE_RATIO) {
                newFeedback = { message: "Move slightly further away.", type: 'info', boxColor: '#F59E0B' }; // amber-500
                setIsFaceReady(false);
            } else if (centerOffset > CENTER_TOLERANCE) {
                newFeedback = { message: "Please center your face.", type: 'info', boxColor: '#F59E0B' }; // amber-500
                setIsFaceReady(false);
            } else {
                newFeedback = { message: "Good! Hold still.", type: 'success', boxColor: '#10B981' }; // emerald-500
                setIsFaceReady(true);
            }
            
            setFeedback(newFeedback);

            const resizedDetection = faceapi.resizeResults(detection, { width: canvas.width, height: canvas.height });
            const { box: resizedBox } = resizedDetection.detection;
            const mirroredX = canvas.width - (resizedBox.x + resizedBox.width);
            
            ctx.strokeStyle = newFeedback.boxColor;
            ctx.lineWidth = 4;
            ctx.strokeRect(mirroredX, resizedBox.y, resizedBox.width, resizedBox.height);

        } else {
            setFeedback({ message: 'No face detected. Please position your face in the frame.', type: 'info', boxColor: '#64748B' });
            setIsFaceReady(false);
        }
    }, [isCapturing]);

    useEffect(() => {
        const onPlay = () => {
            if (videoRef.current && canvasRef.current) {
                const displaySize = { width: videoRef.current.clientWidth, height: videoRef.current.clientHeight };
                faceapi.matchDimensions(canvasRef.current, displaySize);
                
                if (detectionInterval.current) clearInterval(detectionInterval.current);
                detectionInterval.current = window.setInterval(runDetection, 500);
            }
        };

        const video = videoRef.current;
        if (video && stream) {
            video.addEventListener('play', onPlay);
        }
        return () => {
            if (video) video.removeEventListener('play', onPlay);
            if (detectionInterval.current) clearInterval(detectionInterval.current);
        };
    }, [stream, runDetection]);

    const handleEnroll = async () => {
        if (!videoRef.current || !isFaceReady) return;
        
        setIsCapturing(true);
        setFeedback({ message: 'Capturing...', type: 'info', boxColor: '#0EA5E9' });
        if (detectionInterval.current) clearInterval(detectionInterval.current);

        try {
            const descriptor = await getFaceDescriptor(videoRef.current);
            if (descriptor) {
                stopAllStreams();
                onEnroll(descriptor);
            } else {
                setFeedback({ message: "Capture failed. Please try again.", type: 'error', boxColor: '#EF4444' });
                 if (!detectionInterval.current) {
                    detectionInterval.current = window.setInterval(runDetection, 500);
                }
            }
        } catch (err) {
            setFeedback({ message: "An error occurred during enrollment.", type: 'error', boxColor: '#EF4444' });
            console.error(err);
            if (!detectionInterval.current) {
                detectionInterval.current = window.setInterval(runDetection, 500);
            }
        } finally {
            setIsCapturing(false);
        }
    };

    const feedbackColors = {
        info: 'text-slate-300 bg-slate-800/40',
        error: 'text-red-300 bg-red-500/20',
        success: 'text-emerald-300 bg-emerald-500/10',
        warning: 'text-amber-300 bg-amber-500/20',
    };

    return (
        <div className="bg-slate-900/30 backdrop-blur-lg border border-slate-100/20 rounded-xl shadow-2xl p-6 text-center">
            <div className="relative text-center mb-2">
                <button onClick={onBack} className="absolute left-0 top-1 text-sm text-slate-300 hover:text-sky-300 transition-colors">&larr; Back</button>
                <h2 className="text-2xl font-bold font-heading text-slate-50">Secure Enrollment</h2>
            </div>
            <p className="text-slate-300 mb-4">Position your face inside the frame to register. This data stays on your device.</p>
            
            <div className="relative w-full max-w-sm mx-auto aspect-square bg-slate-800 rounded-lg overflow-hidden border-2 border-slate-600">
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
                <canvas ref={canvasRef} className="absolute inset-0" />
            </div>

            <div className={`mt-4 p-3 text-sm rounded-lg flex items-center justify-center gap-2 transition-colors ${feedbackColors[feedback.type]}`}>
                {feedback.type === 'error' && <WarningIcon className="w-5 h-5 flex-shrink-0" />}
                {feedback.type === 'success' && <CheckCircleIcon className="w-5 h-5 flex-shrink-0" />}
                {feedback.type === 'warning' && <WarningIcon className="w-5 h-5 flex-shrink-0" />}
                <span>{feedback.message}</span>
            </div>

            <button
                onClick={handleEnroll}
                disabled={isCapturing || !stream || !isFaceReady}
                className="mt-6 w-full flex items-center justify-center gap-3 py-3 px-6 bg-sky-500 text-white rounded-lg font-bold hover:bg-sky-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isCapturing ? (
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                ) : (
                    <FaceIcon className="w-6 h-6" />
                )}
                <span>{isCapturing ? 'Capturing...' : 'Enroll My Face'}</span>
            </button>
        </div>
    );
};

export default EnrollmentView;
