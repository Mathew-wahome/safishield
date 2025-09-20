import React, { useRef, useEffect } from 'react';

interface AudioWaveformProps {
    stream: MediaStream | null;
}

const AudioWaveform: React.FC<AudioWaveformProps> = ({ stream }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    // Fix: Initialize useRef with null when providing a generic type that is not initially set.
    const animationFrameId = useRef<number | null>(null);

    useEffect(() => {
        if (!stream || !canvasRef.current) {
            return;
        }

        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        source.connect(analyser);

        const canvas = canvasRef.current;
        const canvasCtx = canvas.getContext('2d');

        const draw = () => {
            if (!canvasCtx) return;
            animationFrameId.current = requestAnimationFrame(draw);

            analyser.getByteTimeDomainData(dataArray);

            canvasCtx.fillStyle = 'rgb(30, 41, 59)'; // bg-slate-800
            canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
            canvasCtx.lineWidth = 2;
            canvasCtx.strokeStyle = 'rgb(14, 165, 233)'; // text-sky-500

            canvasCtx.beginPath();
            const sliceWidth = canvas.width * 1.0 / bufferLength;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                const v = dataArray[i] / 128.0;
                const y = v * canvas.height / 2;

                if (i === 0) {
                    canvasCtx.moveTo(x, y);
                } else {
                    canvasCtx.lineTo(x, y);
                }
                x += sliceWidth;
            }

            canvasCtx.lineTo(canvas.width, canvas.height / 2);
            canvasCtx.stroke();
        };

        draw();

        return () => {
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
            audioContext.close();
        };

    }, [stream]);

    return <canvas ref={canvasRef} width="300" height="100" className="w-full h-24 rounded-lg" />;
};

export default AudioWaveform;