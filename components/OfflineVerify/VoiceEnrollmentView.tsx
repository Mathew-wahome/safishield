import React, { useState, useEffect, useRef } from 'react';
import { getVoiceFeatures } from './VoiceApi';
import { MicIcon, WarningIcon, CheckCircleIcon } from '../icons/Icons';
import AudioWaveform from '../../components/user/components/AudioWaveform';

interface VoiceEnrollmentViewProps {
    onEnroll: (features: number[]) => void;
    onBack: () => void;
}

const PASSPHRASE = "My voice is my password";

const VoiceEnrollmentView: React.FC<VoiceEnrollmentViewProps> = ({ onEnroll, onBack }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [feedback, setFeedback] = useState<string>('Read the phrase when you are ready.');
    
    const audioContextRef = useRef<AudioContext | null>(null);
    const animationFrameRef = useRef<number | null>(null);

    const stopMonitoring = () => {
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            audioContextRef.current.close().catch(e => console.warn("Error closing AudioContext:", e));
            audioContextRef.current = null;
        }
    };

    const startMonitoring = (mediaStream: MediaStream) => {
        stopMonitoring(); // Ensure any previous instances are stopped
        const audioContext = new AudioContext();
        const analyser = audioContext.createAnalyser();
        const source = audioContext.createMediaStreamSource(mediaStream);
        
        analyser.fftSize = 256;
        source.connect(analyser);
        audioContextRef.current = audioContext;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const monitor = () => {
            animationFrameRef.current = requestAnimationFrame(monitor);
            analyser.getByteTimeDomainData(dataArray);
            const sum = dataArray.reduce((acc, val) => acc + Math.abs(val - 128), 0);
            const avg = sum / dataArray.length;

            if (avg < 1.5) {
                setFeedback("Speak a bit louder.");
            } else if (avg > 25) {
                setFeedback("A bit too loud, move back slightly.");
            } else {
                setFeedback("Sound level is good, keep going.");
            }
        };
        monitor();
    };

    useEffect(() => {
        return () => {
            // Cleanup: stop media stream and monitoring when component unmounts
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
            stopMonitoring();
        };
    }, [stream]);

    const handleEnroll = async () => {
        setIsRecording(true);
        setError(null);

        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            setStream(mediaStream);
            startMonitoring(mediaStream);

            // Record for 3 seconds and get features
            const features = await getVoiceFeatures(mediaStream, 3);
            
            stopMonitoring();
            mediaStream.getTracks().forEach(track => track.stop());
            setStream(null);

            if (features) {
                onEnroll(features);
            } else {
                setError("Could not detect speech. Please ensure you are in a quiet place and speak clearly.");
                setFeedback('Enrollment failed. Please try again.');
            }
        } catch (err) {
            setError("Microphone permission denied. Please enable microphone access in your browser settings.");
            console.error(err);
             setFeedback('Microphone access is required.');
        } finally {
            setIsRecording(false);
        }
    };

    return (
        <div className="bg-slate-900/30 backdrop-blur-lg border border-slate-100/20 rounded-xl shadow-2xl p-6 text-center">
            <div className="relative text-center mb-2">
                <button onClick={onBack} className="absolute left-0 top-1 text-sm text-slate-300 hover:text-sky-300 transition-colors">&larr; Back</button>
                <h2 className="text-2xl font-bold font-heading text-slate-50">Secure Voice Enrollment</h2>
            </div>
            <p className="text-slate-300 mb-4">Read the following phrase aloud to register your voiceprint. This data stays on your device.</p>
            
             <div className="my-6 p-4 bg-slate-800/50 border border-slate-600 rounded-lg">
                <p className="text-slate-300 text-sm">Please read this phrase:</p>
                <p className="text-2xl font-bold text-sky-300 font-mono tracking-widest mt-1">"{PASSPHRASE}"</p>
            </div>
            
            <div className="flex justify-center items-center h-24 my-2">
               {isRecording ? (
                   <div className="w-full">
                        <AudioWaveform stream={stream} />
                        <p className="text-sm text-sky-300 mt-2 animate-pulse">{feedback}</p>
                   </div>
               ) : (
                   <div className="text-slate-400">{feedback}</div>
               )}
            </div>
            
            {error && (
                <div className="mt-4 p-3 text-sm text-red-300 bg-red-500/20 rounded-lg flex items-center gap-2">
                    <WarningIcon className="w-5 h-5 flex-shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            <button
                onClick={handleEnroll}
                disabled={isRecording}
                className="mt-6 w-full flex items-center justify-center gap-3 py-3 px-6 bg-emerald-500 text-white rounded-lg font-bold hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <MicIcon className="w-6 h-6" />
                <span>{isRecording ? 'Listening...' : 'Record My Voice'}</span>
            </button>
        </div>
    );
};

export default VoiceEnrollmentView;